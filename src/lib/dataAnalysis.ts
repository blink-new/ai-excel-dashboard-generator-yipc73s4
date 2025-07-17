import { blink } from '../blink/client'

export interface DataColumn {
  name: string
  type: 'numeric' | 'categorical' | 'datetime' | 'boolean' | 'text'
  uniqueValues: number
  nullCount: number
  sampleValues: any[]
  stats?: {
    min?: number
    max?: number
    mean?: number
    median?: number
    std?: number
    q1?: number
    q3?: number
  }
  distribution?: { [key: string]: number }
}

export interface DataProfile {
  totalRows: number
  totalColumns: number
  columns: DataColumn[]
  dataQuality: {
    completeness: number
    duplicateRows: number
    outliers: number
  }
  correlations: Array<{
    col1: string
    col2: string
    correlation: number
    strength: 'weak' | 'moderate' | 'strong'
  }>
}

export interface ChartRecommendation {
  id: string
  title: string
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'heatmap' | 'histogram' | 'box' | 'area' | 'treemap'
  data: any[]
  insights: string[]
  priority: number
  columns: string[]
  description: string
}

export interface AIInsight {
  type: 'trend' | 'anomaly' | 'correlation' | 'distribution' | 'quality' | 'business'
  title: string
  description: string
  severity: 'low' | 'medium' | 'high'
  actionable: boolean
  recommendation?: string
  data?: any
}

export class DataAnalysisEngine {
  private data: any[]
  private profile: DataProfile | null = null

  constructor(data: any[]) {
    this.data = data
  }

  // Profile the dataset
  async profileData(): Promise<DataProfile> {
    if (this.data.length === 0) {
      throw new Error('No data to analyze')
    }

    const columns = Object.keys(this.data[0])
    const profiledColumns: DataColumn[] = []

    // Analyze each column
    for (const colName of columns) {
      const values = this.data.map(row => row[colName]).filter(v => v !== null && v !== undefined && v !== '')
      const nullCount = this.data.length - values.length
      const uniqueValues = new Set(values).size
      
      // Determine column type
      const type = this.detectColumnType(values)
      
      const column: DataColumn = {
        name: colName,
        type,
        uniqueValues,
        nullCount,
        sampleValues: values.slice(0, 10)
      }

      // Add statistics for numeric columns
      if (type === 'numeric') {
        const numericValues = values.map(v => Number(v)).filter(v => !isNaN(v))
        if (numericValues.length > 0) {
          column.stats = this.calculateStatistics(numericValues)
        }
      }

      // Add distribution for categorical columns
      if (type === 'categorical' && uniqueValues <= 20) {
        column.distribution = this.calculateDistribution(values)
      }

      profiledColumns.push(column)
    }

    // Calculate correlations for numeric columns
    const numericColumns = profiledColumns.filter(col => col.type === 'numeric')
    const correlations = this.calculateCorrelations(numericColumns)

    // Calculate data quality metrics
    const duplicateRows = this.findDuplicateRows()
    const outliers = this.detectOutliers(numericColumns)
    const completeness = this.calculateCompleteness(profiledColumns)

    this.profile = {
      totalRows: this.data.length,
      totalColumns: columns.length,
      columns: profiledColumns,
      dataQuality: {
        completeness,
        duplicateRows,
        outliers
      },
      correlations
    }

    return this.profile
  }

  // Generate intelligent chart recommendations
  async generateChartRecommendations(): Promise<ChartRecommendation[]> {
    if (!this.profile) {
      await this.profileData()
    }

    const recommendations: ChartRecommendation[] = []
    const { columns } = this.profile!

    const numericCols = columns.filter(col => col.type === 'numeric')
    const categoricalCols = columns.filter(col => col.type === 'categorical' && col.uniqueValues <= 20)
    const datetimeCols = columns.filter(col => col.type === 'datetime')

    // 1. Distribution Analysis (Histograms for numeric columns)
    for (const col of numericCols) {
      if (col.stats) {
        const histogramData = this.createHistogram(col.name)
        recommendations.push({
          id: `histogram-${col.name}`,
          title: `Distribution of ${col.name}`,
          type: 'histogram',
          data: histogramData,
          insights: [
            `Mean: ${col.stats.mean?.toFixed(2)}`,
            `Standard Deviation: ${col.stats.std?.toFixed(2)}`,
            `Range: ${col.stats.min} - ${col.stats.max}`,
            this.analyzeDistribution(col)
          ],
          priority: 7,
          columns: [col.name],
          description: `Shows the frequency distribution of ${col.name} values`
        })
      }
    }

    // 2. Categorical Analysis (Bar charts and Pie charts)
    for (const col of categoricalCols) {
      if (col.distribution) {
        const barData = Object.entries(col.distribution)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 15)
          .map(([name, value]) => ({ name, value, percentage: (value / this.data.length * 100).toFixed(1) }))

        recommendations.push({
          id: `bar-${col.name}`,
          title: `${col.name} Distribution`,
          type: 'bar',
          data: barData,
          insights: [
            `${col.uniqueValues} unique categories`,
            `Top category: ${barData[0]?.name} (${barData[0]?.percentage}%)`,
            `Data coverage: ${((this.data.length - col.nullCount) / this.data.length * 100).toFixed(1)}%`,
            this.analyzeCategoricalDistribution(col)
          ],
          priority: 8,
          columns: [col.name],
          description: `Distribution of categories in ${col.name}`
        })

        // Pie chart for categories with reasonable number of values
        if (col.uniqueValues <= 8) {
          recommendations.push({
            id: `pie-${col.name}`,
            title: `${col.name} Composition`,
            type: 'pie',
            data: barData.slice(0, 6),
            insights: [
              `${col.uniqueValues} categories shown`,
              `Largest segment: ${barData[0]?.percentage}%`,
              this.analyzePieDistribution(barData)
            ],
            priority: 6,
            columns: [col.name],
            description: `Proportional breakdown of ${col.name}`
          })
        }
      }
    }

    // 3. Time Series Analysis
    for (const dateCol of datetimeCols) {
      for (const numCol of numericCols) {
        const timeSeriesData = this.createTimeSeries(dateCol.name, numCol.name)
        if (timeSeriesData.length > 1) {
          recommendations.push({
            id: `line-${dateCol.name}-${numCol.name}`,
            title: `${numCol.name} Over Time`,
            type: 'line',
            data: timeSeriesData,
            insights: [
              `${timeSeriesData.length} data points`,
              this.analyzeTrend(timeSeriesData),
              this.detectSeasonality(timeSeriesData),
              this.identifyAnomalies(timeSeriesData)
            ].filter(Boolean),
            priority: 9,
            columns: [dateCol.name, numCol.name],
            description: `Trend analysis of ${numCol.name} over ${dateCol.name}`
          })
        }
      }
    }

    // 4. Correlation Analysis (Scatter plots)
    for (let i = 0; i < numericCols.length; i++) {
      for (let j = i + 1; j < numericCols.length; j++) {
        const col1 = numericCols[i]
        const col2 = numericCols[j]
        const correlation = this.profile!.correlations.find(
          corr => (corr.col1 === col1.name && corr.col2 === col2.name) ||
                  (corr.col1 === col2.name && corr.col2 === col1.name)
        )

        if (correlation && Math.abs(correlation.correlation) > 0.3) {
          const scatterData = this.createScatterPlot(col1.name, col2.name)
          recommendations.push({
            id: `scatter-${col1.name}-${col2.name}`,
            title: `${col1.name} vs ${col2.name}`,
            type: 'scatter',
            data: scatterData,
            insights: [
              `Correlation: ${correlation.correlation.toFixed(3)} (${correlation.strength})`,
              this.interpretCorrelation(correlation),
              `${scatterData.length} data points plotted`,
              this.analyzeScatterPattern(scatterData)
            ],
            priority: correlation.strength === 'strong' ? 8 : 6,
            columns: [col1.name, col2.name],
            description: `Relationship between ${col1.name} and ${col2.name}`
          })
        }
      }
    }

    // 5. Cross-tabulation (Heatmaps for categorical vs numeric)
    for (const catCol of categoricalCols.slice(0, 2)) {
      for (const numCol of numericCols.slice(0, 2)) {
        const heatmapData = this.createHeatmap(catCol.name, numCol.name)
        if (heatmapData.length > 0) {
          recommendations.push({
            id: `heatmap-${catCol.name}-${numCol.name}`,
            title: `${numCol.name} by ${catCol.name}`,
            type: 'heatmap',
            data: heatmapData,
            insights: [
              `Analysis across ${catCol.uniqueValues} categories`,
              this.analyzeHeatmapPattern(heatmapData, catCol.name, numCol.name),
              this.identifyHeatmapOutliers(heatmapData)
            ].filter(Boolean),
            priority: 5,
            columns: [catCol.name, numCol.name],
            description: `${numCol.name} values segmented by ${catCol.name}`
          })
        }
      }
    }

    // 6. Box plots for numeric distributions by category
    for (const catCol of categoricalCols.slice(0, 2)) {
      for (const numCol of numericCols.slice(0, 2)) {
        if (catCol.uniqueValues <= 10) {
          const boxData = this.createBoxPlot(catCol.name, numCol.name)
          recommendations.push({
            id: `box-${catCol.name}-${numCol.name}`,
            title: `${numCol.name} Distribution by ${catCol.name}`,
            type: 'box',
            data: boxData,
            insights: [
              `Comparing ${catCol.uniqueValues} categories`,
              this.analyzeBoxPlotVariation(boxData),
              this.identifyBoxPlotOutliers(boxData)
            ].filter(Boolean),
            priority: 6,
            columns: [catCol.name, numCol.name],
            description: `Statistical distribution of ${numCol.name} across ${catCol.name} categories`
          })
        }
      }
    }

    // Sort by priority and return top recommendations
    return recommendations
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 8)
  }

  // Generate comprehensive AI insights
  async generateAIInsights(): Promise<AIInsight[]> {
    if (!this.profile) {
      await this.profileData()
    }

    const insights: AIInsight[] = []
    const { columns, dataQuality, correlations } = this.profile!

    // Data Quality Insights
    if (dataQuality.completeness < 0.9) {
      insights.push({
        type: 'quality',
        title: 'Data Completeness Issue',
        description: `Dataset is ${(dataQuality.completeness * 100).toFixed(1)}% complete. ${this.data.length - Math.floor(this.data.length * dataQuality.completeness)} rows have missing values.`,
        severity: dataQuality.completeness < 0.7 ? 'high' : 'medium',
        actionable: true,
        recommendation: 'Consider data cleaning or imputation strategies for missing values.'
      })
    }

    if (dataQuality.duplicateRows > 0) {
      insights.push({
        type: 'quality',
        title: 'Duplicate Records Found',
        description: `Found ${dataQuality.duplicateRows} duplicate rows (${(dataQuality.duplicateRows / this.data.length * 100).toFixed(1)}% of data).`,
        severity: dataQuality.duplicateRows > this.data.length * 0.05 ? 'high' : 'medium',
        actionable: true,
        recommendation: 'Review and remove duplicate records to improve data quality.'
      })
    }

    // Statistical Insights
    const numericColumns = columns.filter(col => col.type === 'numeric' && col.stats)
    for (const col of numericColumns) {
      if (col.stats) {
        // Outlier detection
        const outlierThreshold = col.stats.q3! + 1.5 * (col.stats.q3! - col.stats.q1!)
        const outlierCount = this.data.filter(row => Number(row[col.name]) > outlierThreshold).length
        
        if (outlierCount > 0) {
          insights.push({
            type: 'anomaly',
            title: `Outliers in ${col.name}`,
            description: `${outlierCount} values exceed the normal range (>${outlierThreshold.toFixed(2)}).`,
            severity: outlierCount > this.data.length * 0.05 ? 'medium' : 'low',
            actionable: true,
            recommendation: 'Investigate outliers - they may represent errors or important edge cases.',
            data: { column: col.name, threshold: outlierThreshold, count: outlierCount }
          })
        }

        // Distribution analysis
        const skewness = this.calculateSkewness(col.name)
        if (Math.abs(skewness) > 1) {
          insights.push({
            type: 'distribution',
            title: `${col.name} Distribution Skewed`,
            description: `${col.name} shows ${skewness > 0 ? 'right' : 'left'} skewness (${skewness.toFixed(2)}). Most values are concentrated ${skewness > 0 ? 'below' : 'above'} the mean.`,
            severity: 'low',
            actionable: true,
            recommendation: skewness > 0 ? 'Consider log transformation for right-skewed data.' : 'Consider square transformation for left-skewed data.'
          })
        }
      }
    }

    // Correlation Insights
    const strongCorrelations = correlations.filter(corr => corr.strength === 'strong')
    for (const corr of strongCorrelations) {
      insights.push({
        type: 'correlation',
        title: `Strong Relationship: ${corr.col1} & ${corr.col2}`,
        description: `${corr.col1} and ${corr.col2} show a ${corr.correlation > 0 ? 'positive' : 'negative'} correlation of ${Math.abs(corr.correlation).toFixed(3)}.`,
        severity: 'medium',
        actionable: true,
        recommendation: corr.correlation > 0 
          ? `As ${corr.col1} increases, ${corr.col2} tends to increase. Consider this relationship in your analysis.`
          : `As ${corr.col1} increases, ${corr.col2} tends to decrease. This inverse relationship may be significant.`,
        data: corr
      })
    }

    // Business Intelligence using AI
    const businessInsights = await this.generateBusinessInsights()
    insights.push(...businessInsights)

    return insights.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 }
      return severityOrder[b.severity] - severityOrder[a.severity]
    })
  }

  // Helper methods for data analysis
  private detectColumnType(values: any[]): DataColumn['type'] {
    if (values.length === 0) return 'text'

    // Check for boolean
    const booleanValues = values.filter(v => typeof v === 'boolean' || v === 'true' || v === 'false' || v === 0 || v === 1)
    if (booleanValues.length > values.length * 0.8) return 'boolean'

    // Check for numeric
    const numericValues = values.filter(v => !isNaN(Number(v)) && v !== '' && v !== null)
    if (numericValues.length > values.length * 0.8) return 'numeric'

    // Check for datetime
    const dateValues = values.filter(v => !isNaN(Date.parse(String(v))))
    if (dateValues.length > values.length * 0.8) return 'datetime'

    // Check for categorical (limited unique values)
    const uniqueValues = new Set(values).size
    if (uniqueValues <= Math.min(50, values.length * 0.5)) return 'categorical'

    return 'text'
  }

  private calculateStatistics(values: number[]) {
    const sorted = [...values].sort((a, b) => a - b)
    const n = sorted.length
    const mean = values.reduce((a, b) => a + b, 0) / n
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n
    
    return {
      min: sorted[0],
      max: sorted[n - 1],
      mean,
      median: n % 2 === 0 ? (sorted[n/2 - 1] + sorted[n/2]) / 2 : sorted[Math.floor(n/2)],
      std: Math.sqrt(variance),
      q1: sorted[Math.floor(n * 0.25)],
      q3: sorted[Math.floor(n * 0.75)]
    }
  }

  private calculateDistribution(values: any[]) {
    const distribution: { [key: string]: number } = {}
    values.forEach(value => {
      const key = String(value)
      distribution[key] = (distribution[key] || 0) + 1
    })
    return distribution
  }

  private calculateCorrelations(numericColumns: DataColumn[]) {
    const correlations: DataProfile['correlations'] = []
    
    for (let i = 0; i < numericColumns.length; i++) {
      for (let j = i + 1; j < numericColumns.length; j++) {
        const col1 = numericColumns[i]
        const col2 = numericColumns[j]
        
        const values1 = this.data.map(row => Number(row[col1.name])).filter(v => !isNaN(v))
        const values2 = this.data.map(row => Number(row[col2.name])).filter(v => !isNaN(v))
        
        if (values1.length > 1 && values2.length > 1) {
          const correlation = this.pearsonCorrelation(values1, values2)
          const absCorr = Math.abs(correlation)
          
          correlations.push({
            col1: col1.name,
            col2: col2.name,
            correlation,
            strength: absCorr > 0.7 ? 'strong' : absCorr > 0.3 ? 'moderate' : 'weak'
          })
        }
      }
    }
    
    return correlations
  }

  private pearsonCorrelation(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length)
    if (n === 0) return 0
    
    const sumX = x.slice(0, n).reduce((a, b) => a + b, 0)
    const sumY = y.slice(0, n).reduce((a, b) => a + b, 0)
    const sumXY = x.slice(0, n).reduce((acc, xi, i) => acc + xi * y[i], 0)
    const sumX2 = x.slice(0, n).reduce((acc, xi) => acc + xi * xi, 0)
    const sumY2 = y.slice(0, n).reduce((acc, yi) => acc + yi * yi, 0)
    
    const numerator = n * sumXY - sumX * sumY
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))
    
    return denominator === 0 ? 0 : numerator / denominator
  }

  private findDuplicateRows(): number {
    const seen = new Set()
    let duplicates = 0
    
    for (const row of this.data) {
      const key = JSON.stringify(row)
      if (seen.has(key)) {
        duplicates++
      } else {
        seen.add(key)
      }
    }
    
    return duplicates
  }

  private detectOutliers(numericColumns: DataColumn[]): number {
    let totalOutliers = 0
    
    for (const col of numericColumns) {
      if (col.stats) {
        const { q1, q3 } = col.stats
        const iqr = q3! - q1!
        const lowerBound = q1! - 1.5 * iqr
        const upperBound = q3! + 1.5 * iqr
        
        const outliers = this.data.filter(row => {
          const value = Number(row[col.name])
          return !isNaN(value) && (value < lowerBound || value > upperBound)
        }).length
        
        totalOutliers += outliers
      }
    }
    
    return totalOutliers
  }

  private calculateCompleteness(columns: DataColumn[]): number {
    const totalCells = this.data.length * columns.length
    const nullCells = columns.reduce((sum, col) => sum + col.nullCount, 0)
    return (totalCells - nullCells) / totalCells
  }

  // Chart data creation methods
  private createHistogram(columnName: string) {
    const values = this.data.map(row => Number(row[columnName])).filter(v => !isNaN(v))
    const min = Math.min(...values)
    const max = Math.max(...values)
    const binCount = Math.min(20, Math.ceil(Math.sqrt(values.length)))
    const binWidth = (max - min) / binCount
    
    const bins = Array(binCount).fill(0).map((_, i) => ({
      range: `${(min + i * binWidth).toFixed(1)}-${(min + (i + 1) * binWidth).toFixed(1)}`,
      count: 0,
      min: min + i * binWidth,
      max: min + (i + 1) * binWidth
    }))
    
    values.forEach(value => {
      const binIndex = Math.min(Math.floor((value - min) / binWidth), binCount - 1)
      bins[binIndex].count++
    })
    
    return bins.map(bin => ({ name: bin.range, value: bin.count }))
  }

  private createTimeSeries(dateColumn: string, valueColumn: string) {
    return this.data
      .filter(row => row[dateColumn] && row[valueColumn])
      .map(row => ({
        name: new Date(row[dateColumn]).toLocaleDateString(),
        value: Number(row[valueColumn]) || 0,
        date: new Date(row[dateColumn])
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 100) // Limit for performance
  }

  private createScatterPlot(col1: string, col2: string) {
    return this.data
      .filter(row => row[col1] && row[col2])
      .map(row => ({
        x: Number(row[col1]) || 0,
        y: Number(row[col2]) || 0,
        name: `${row[col1]}, ${row[col2]}`
      }))
      .slice(0, 500) // Limit for performance
  }

  private createHeatmap(categoryColumn: string, valueColumn: string) {
    const grouped = this.data.reduce((acc, row) => {
      const category = String(row[categoryColumn] || 'Unknown')
      const value = Number(row[valueColumn]) || 0
      
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(value)
      return acc
    }, {} as Record<string, number[]>)
    
    return Object.entries(grouped).map(([category, values]) => ({
      category,
      average: values.reduce((a, b) => a + b, 0) / values.length,
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values)
    }))
  }

  private createBoxPlot(categoryColumn: string, valueColumn: string) {
    const grouped = this.data.reduce((acc, row) => {
      const category = String(row[categoryColumn] || 'Unknown')
      const value = Number(row[valueColumn])
      
      if (!isNaN(value)) {
        if (!acc[category]) {
          acc[category] = []
        }
        acc[category].push(value)
      }
      return acc
    }, {} as Record<string, number[]>)
    
    return Object.entries(grouped).map(([category, values]) => {
      const sorted = values.sort((a, b) => a - b)
      const n = sorted.length
      
      return {
        category,
        min: sorted[0],
        q1: sorted[Math.floor(n * 0.25)],
        median: n % 2 === 0 ? (sorted[n/2 - 1] + sorted[n/2]) / 2 : sorted[Math.floor(n/2)],
        q3: sorted[Math.floor(n * 0.75)],
        max: sorted[n - 1],
        outliers: values.filter(v => {
          const q1 = sorted[Math.floor(n * 0.25)]
          const q3 = sorted[Math.floor(n * 0.75)]
          const iqr = q3 - q1
          return v < q1 - 1.5 * iqr || v > q3 + 1.5 * iqr
        })
      }
    })
  }

  // Analysis helper methods
  private analyzeDistribution(col: DataColumn): string {
    if (!col.stats) return ''
    
    const { mean, median, std } = col.stats
    const skewness = (mean - median) / std
    
    if (Math.abs(skewness) < 0.5) {
      return 'Distribution appears roughly normal'
    } else if (skewness > 0.5) {
      return 'Right-skewed distribution (tail extends right)'
    } else {
      return 'Left-skewed distribution (tail extends left)'
    }
  }

  private analyzeCategoricalDistribution(col: DataColumn): string {
    if (!col.distribution) return ''
    
    const values = Object.values(col.distribution)
    const max = Math.max(...values)
    const min = Math.min(...values)
    const ratio = max / min
    
    if (ratio > 10) {
      return 'Highly imbalanced distribution'
    } else if (ratio > 3) {
      return 'Moderately imbalanced distribution'
    } else {
      return 'Relatively balanced distribution'
    }
  }

  private analyzePieDistribution(data: any[]): string {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    const largest = data[0]?.value || 0
    const percentage = (largest / total) * 100
    
    if (percentage > 50) {
      return 'One category dominates the distribution'
    } else if (percentage > 30) {
      return 'Distribution has a clear majority category'
    } else {
      return 'Distribution is relatively even across categories'
    }
  }

  private analyzeTrend(data: any[]): string {
    if (data.length < 3) return 'Insufficient data for trend analysis'
    
    const values = data.map(d => d.value)
    const firstHalf = values.slice(0, Math.floor(values.length / 2))
    const secondHalf = values.slice(Math.floor(values.length / 2))
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
    
    const change = ((secondAvg - firstAvg) / firstAvg) * 100
    
    if (Math.abs(change) < 5) {
      return 'Stable trend with minimal change'
    } else if (change > 0) {
      return `Upward trend (+${change.toFixed(1)}%)`
    } else {
      return `Downward trend (${change.toFixed(1)}%)`
    }
  }

  private detectSeasonality(data: any[]): string {
    // Simple seasonality detection - would need more sophisticated analysis for real seasonality
    if (data.length < 12) return ''
    
    const values = data.map(d => d.value)
    const peaks = values.filter((val, i) => 
      i > 0 && i < values.length - 1 && 
      val > values[i - 1] && val > values[i + 1]
    ).length
    
    if (peaks > values.length * 0.1) {
      return 'Potential cyclical pattern detected'
    }
    return ''
  }

  private identifyAnomalies(data: any[]): string {
    const values = data.map(d => d.value)
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const std = Math.sqrt(values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length)
    
    const anomalies = values.filter(val => Math.abs(val - mean) > 2 * std).length
    
    if (anomalies > 0) {
      return `${anomalies} potential anomalies detected`
    }
    return ''
  }

  private interpretCorrelation(corr: DataProfile['correlations'][0]): string {
    const { correlation, strength } = corr
    
    if (strength === 'strong') {
      return correlation > 0 
        ? 'Strong positive relationship - variables move together'
        : 'Strong negative relationship - variables move in opposite directions'
    } else if (strength === 'moderate') {
      return correlation > 0
        ? 'Moderate positive relationship'
        : 'Moderate negative relationship'
    } else {
      return 'Weak relationship between variables'
    }
  }

  private analyzeScatterPattern(data: any[]): string {
    if (data.length < 10) return 'Limited data points for pattern analysis'
    
    // Simple pattern detection
    const xValues = data.map(d => d.x)
    const yValues = data.map(d => d.y)
    
    const xRange = Math.max(...xValues) - Math.min(...xValues)
    const yRange = Math.max(...yValues) - Math.min(...yValues)
    
    if (xRange === 0 || yRange === 0) {
      return 'Data shows constant values in one dimension'
    }
    
    return 'Scatter pattern suggests potential relationship'
  }

  private analyzeHeatmapPattern(data: any[], catCol: string, numCol: string): string {
    const values = data.map(d => d.average)
    const max = Math.max(...values)
    const min = Math.min(...values)
    const range = max - min
    
    if (range === 0) {
      return `${numCol} values are consistent across all ${catCol} categories`
    }
    
    const maxCategory = data.find(d => d.average === max)?.category
    const minCategory = data.find(d => d.average === min)?.category
    
    return `Highest ${numCol}: ${maxCategory} (${max.toFixed(2)}), Lowest: ${minCategory} (${min.toFixed(2)})`
  }

  private identifyHeatmapOutliers(data: any[]): string {
    const values = data.map(d => d.average)
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const std = Math.sqrt(values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length)
    
    const outliers = data.filter(d => Math.abs(d.average - mean) > 1.5 * std)
    
    if (outliers.length > 0) {
      return `${outliers.length} categories show unusual values`
    }
    return ''
  }

  private analyzeBoxPlotVariation(data: any[]): string {
    const medians = data.map(d => d.median)
    const ranges = data.map(d => d.max - d.min)
    
    const medianRange = Math.max(...medians) - Math.min(...medians)
    const avgRange = ranges.reduce((a, b) => a + b, 0) / ranges.length
    
    if (medianRange > avgRange) {
      return 'Significant variation in central values across categories'
    } else {
      return 'Similar central tendencies with varying spreads'
    }
  }

  private identifyBoxPlotOutliers(data: any[]): string {
    const totalOutliers = data.reduce((sum, d) => sum + d.outliers.length, 0)
    
    if (totalOutliers > 0) {
      return `${totalOutliers} outliers detected across categories`
    }
    return ''
  }

  private calculateSkewness(columnName: string): number {
    const values = this.data.map(row => Number(row[columnName])).filter(v => !isNaN(v))
    const n = values.length
    const mean = values.reduce((a, b) => a + b, 0) / n
    const std = Math.sqrt(values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n)
    
    const skewness = values.reduce((acc, val) => acc + Math.pow((val - mean) / std, 3), 0) / n
    return skewness
  }

  private async generateBusinessInsights(): Promise<AIInsight[]> {
    const insights: AIInsight[] = []
    
    try {
      // Create a comprehensive data summary for AI analysis
      const dataSummary = {
        totalRows: this.data.length,
        columns: this.profile!.columns.map(col => ({
          name: col.name,
          type: col.type,
          uniqueValues: col.uniqueValues,
          nullCount: col.nullCount,
          sampleValues: col.sampleValues.slice(0, 3)
        })),
        correlations: this.profile!.correlations.filter(corr => corr.strength !== 'weak'),
        dataQuality: this.profile!.dataQuality
      }
      
      const prompt = `As a business intelligence expert, analyze this dataset and provide 3-5 actionable business insights:

Dataset Summary:
${JSON.stringify(dataSummary, null, 2)}

Sample Data (first 3 rows):
${JSON.stringify(this.data.slice(0, 3), null, 2)}

Please provide insights in this format:
1. [INSIGHT_TYPE] Title: Description with specific numbers and actionable recommendations.

Focus on:
- Business opportunities and risks
- Performance patterns and trends  
- Operational efficiency insights
- Customer/market behavior (if applicable)
- Revenue/cost optimization opportunities

Be specific, quantitative, and actionable.`

      const { text } = await blink.ai.generateText({
        prompt,
        model: 'gpt-4o-mini',
        maxTokens: 500
      })

      // Parse AI response into structured insights
      const lines = text.split('\n').filter(line => line.trim().length > 0)
      
      for (const line of lines) {
        if (line.match(/^\d+\./)) {
          const match = line.match(/\[(\w+)\]\s*([^:]+):\s*(.+)/)
          if (match) {
            const [, type, title, description] = match
            
            insights.push({
              type: 'business',
              title: title.trim(),
              description: description.trim(),
              severity: 'medium',
              actionable: true,
              recommendation: description.trim()
            })
          } else {
            // Fallback parsing
            const colonIndex = line.indexOf(':')
            if (colonIndex > 0) {
              const title = line.substring(line.indexOf(' ') + 1, colonIndex).trim()
              const description = line.substring(colonIndex + 1).trim()
              
              insights.push({
                type: 'business',
                title,
                description,
                severity: 'medium',
                actionable: true
              })
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to generate business insights:', error)
      
      // Fallback insights based on data structure
      const numericCols = this.profile!.columns.filter(col => col.type === 'numeric')
      const categoricalCols = this.profile!.columns.filter(col => col.type === 'categorical')
      
      if (numericCols.length > 0) {
        insights.push({
          type: 'business',
          title: 'Performance Metrics Available',
          description: `Dataset contains ${numericCols.length} quantitative metrics that can be used for performance tracking and KPI analysis.`,
          severity: 'low',
          actionable: true,
          recommendation: 'Set up regular monitoring and alerting for key performance indicators.'
        })
      }
      
      if (categoricalCols.length > 0) {
        insights.push({
          type: 'business',
          title: 'Segmentation Opportunities',
          description: `${categoricalCols.length} categorical dimensions available for customer/product segmentation analysis.`,
          severity: 'low',
          actionable: true,
          recommendation: 'Develop targeted strategies for different segments identified in the data.'
        })
      }
    }
    
    return insights.slice(0, 5) // Limit to top 5 business insights
  }
}