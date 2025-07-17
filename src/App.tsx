import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import { Button } from './components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { FileUpload } from './components/FileUpload'
import { AnalysisProgress } from './components/AnalysisProgress'
import { InsightsPanel } from './components/InsightsPanel'
import { 
  AdvancedBarChart, AdvancedLineChart, AdvancedPieChart, ScatterPlotChart,
  HistogramChart, HeatmapChart, BoxPlotChart
} from './components/charts/AdvancedCharts'
import { DataAnalysisEngine, ChartRecommendation, AIInsight, DataProfile } from './lib/dataAnalysis'
import { blink } from './blink/client'
import { Sparkles, Download, Share2, BarChart3, Brain, Database, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisEngine, setAnalysisEngine] = useState<DataAnalysisEngine | null>(null)
  const [chartRecommendations, setChartRecommendations] = useState<ChartRecommendation[]>([])
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([])
  const [dataProfile, setDataProfile] = useState<DataProfile | null>(null)
  const [excelData, setExcelData] = useState<any[]>([])

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const processExcelFile = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet)
          resolve(jsonData)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsArrayBuffer(file)
    })
  }

  const generateAdvancedDashboard = async () => {
    if (!selectedFile) return

    setIsAnalyzing(true)
    
    try {
      // Step 1: Process Excel file
      const data = await processExcelFile(selectedFile)
      setExcelData(data)
      
      if (data.length === 0) {
        throw new Error('No data found in the Excel file')
      }

      // Step 2: Initialize analysis engine
      const engine = new DataAnalysisEngine(data)
      setAnalysisEngine(engine)
      
      // Step 3: Profile the data
      const profile = await engine.profileData()
      setDataProfile(profile)
      
      // Step 4: Generate intelligent chart recommendations
      const charts = await engine.generateChartRecommendations()
      setChartRecommendations(charts)
      
      // Step 5: Generate comprehensive AI insights
      const insights = await engine.generateAIInsights()
      setAiInsights(insights)
      
      toast.success(`Advanced dashboard generated! Found ${charts.length} visualizations and ${insights.length} insights.`)
      
    } catch (error) {
      console.error('Advanced dashboard generation failed:', error)
      toast.error(`Failed to generate dashboard: ${error.message}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const regenerateAnalysis = async () => {
    if (!analysisEngine) return
    
    setIsAnalyzing(true)
    try {
      // Regenerate insights and charts
      const [charts, insights] = await Promise.all([
        analysisEngine.generateChartRecommendations(),
        analysisEngine.generateAIInsights()
      ])
      
      setChartRecommendations(charts)
      setAiInsights(insights)
      
      toast.success('Analysis refreshed successfully!')
    } catch (error) {
      console.error('Failed to regenerate analysis:', error)
      toast.error('Failed to refresh analysis')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const renderChart = (chart: ChartRecommendation) => {
    const commonProps = {
      data: chart.data,
      title: chart.title,
      insights: chart.insights,
      description: chart.description,
      height: 350
    }

    switch (chart.type) {
      case 'bar':
        return <AdvancedBarChart key={chart.id} {...commonProps} />
      case 'line':
        return <AdvancedLineChart key={chart.id} {...commonProps} />
      case 'pie':
        return <AdvancedPieChart key={chart.id} {...commonProps} />
      case 'scatter':
        return <ScatterPlotChart key={chart.id} {...commonProps} />
      case 'histogram':
        return <HistogramChart key={chart.id} {...commonProps} />
      case 'heatmap':
        return <HeatmapChart key={chart.id} {...commonProps} />
      case 'box':
        return <BoxPlotChart key={chart.id} {...commonProps} />
      default:
        return <AdvancedBarChart key={chart.id} {...commonProps} />
    }
  }

  const handleInsightClick = (insight: AIInsight) => {
    // Handle insight interaction - could open modal, navigate, etc.
    console.log('Insight clicked:', insight)
    toast.info(`Insight: ${insight.title}`)
  }

  const handleAnalysisComplete = () => {
    // Analysis animation completed
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Please sign in</h1>
          <p className="text-muted-foreground">You need to be signed in to use this app</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <div className="flex items-center justify-center space-x-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              AI Excel Dashboard Generator
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Upload your Excel file and experience next-generation AI analysis. Get intelligent visualizations, 
            statistical insights, and actionable business intelligence automatically.
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {!dataProfile ? (
            <>
              {/* File Upload */}
              <div className="max-w-2xl mx-auto">
                <FileUpload 
                  onFileSelect={setSelectedFile} 
                  isLoading={isAnalyzing}
                />
              </div>

              {/* Generate Button */}
              {selectedFile && !isAnalyzing && (
                <div className="text-center">
                  <Button 
                    onClick={generateAdvancedDashboard}
                    size="lg"
                    className="px-8"
                  >
                    <Brain className="h-5 w-5 mr-2" />
                    Generate Advanced Dashboard
                  </Button>
                </div>
              )}

              {/* Analysis Progress */}
              {isAnalyzing && (
                <div className="max-w-2xl mx-auto">
                  <AnalysisProgress 
                    isAnalyzing={isAnalyzing}
                    onComplete={handleAnalysisComplete}
                  />
                </div>
              )}
            </>
          ) : (
            <>
              {/* Dashboard Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Advanced Analytics: {selectedFile?.name}
                  </h2>
                  <p className="text-muted-foreground">
                    {dataProfile.totalRows.toLocaleString()} rows • {dataProfile.totalColumns} columns • 
                    {chartRecommendations.length} visualizations • {aiInsights.length} insights
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={regenerateAnalysis}
                    disabled={isAnalyzing}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
                    Refresh Analysis
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Dashboard
                  </Button>
                  <Button 
                    onClick={() => {
                      setDataProfile(null)
                      setSelectedFile(null)
                      setChartRecommendations([])
                      setAiInsights([])
                      setAnalysisEngine(null)
                    }}
                    variant="outline"
                    size="sm"
                  >
                    New Analysis
                  </Button>
                </div>
              </div>

              {/* Dashboard Tabs */}
              <Tabs defaultValue="visualizations" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="visualizations" className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Visualizations</span>
                  </TabsTrigger>
                  <TabsTrigger value="insights" className="flex items-center space-x-2">
                    <Brain className="h-4 w-4" />
                    <span>AI Insights</span>
                  </TabsTrigger>
                  <TabsTrigger value="data" className="flex items-center space-x-2">
                    <Database className="h-4 w-4" />
                    <span>Data Profile</span>
                  </TabsTrigger>
                </TabsList>

                {/* Visualizations Tab */}
                <TabsContent value="visualizations" className="space-y-6">
                  {chartRecommendations.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {chartRecommendations.map(renderChart)}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-muted-foreground">
                        No visualizations available
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        The data structure doesn't support automatic chart generation.
                      </p>
                    </div>
                  )}
                </TabsContent>

                {/* AI Insights Tab */}
                <TabsContent value="insights" className="space-y-6">
                  {aiInsights.length > 0 && dataProfile ? (
                    <InsightsPanel 
                      insights={aiInsights}
                      dataProfile={dataProfile}
                      onInsightClick={handleInsightClick}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-muted-foreground">
                        No insights available
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        AI analysis couldn't generate meaningful insights from this data.
                      </p>
                    </div>
                  )}
                </TabsContent>

                {/* Data Profile Tab */}
                <TabsContent value="data" className="space-y-6">
                  {dataProfile && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Data Overview */}
                      <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {dataProfile.columns.map((column, index) => (
                            <div key={index} className="p-4 rounded-lg border bg-card">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-sm">{column.name}</h4>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  column.type === 'numeric' ? 'bg-blue-100 text-blue-800' :
                                  column.type === 'categorical' ? 'bg-green-100 text-green-800' :
                                  column.type === 'datetime' ? 'bg-purple-100 text-purple-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {column.type}
                                </span>
                              </div>
                              <div className="space-y-1 text-xs text-muted-foreground">
                                <div>Unique values: {column.uniqueValues.toLocaleString()}</div>
                                <div>Missing: {column.nullCount.toLocaleString()}</div>
                                {column.stats && (
                                  <div>Range: {column.stats.min?.toFixed(2)} - {column.stats.max?.toFixed(2)}</div>
                                )}
                                <div className="mt-2">
                                  <div className="text-xs font-medium mb-1">Sample values:</div>
                                  <div className="flex flex-wrap gap-1">
                                    {column.sampleValues.slice(0, 3).map((value, i) => (
                                      <span key={i} className="px-1 py-0.5 bg-muted rounded text-xs">
                                        {String(value).length > 15 ? String(value).substring(0, 15) + '...' : String(value)}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Summary Stats */}
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg border bg-card">
                          <h4 className="font-semibold mb-3">Dataset Summary</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Total Rows:</span>
                              <span className="font-medium">{dataProfile.totalRows.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total Columns:</span>
                              <span className="font-medium">{dataProfile.totalColumns}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Completeness:</span>
                              <span className="font-medium">
                                {(dataProfile.dataQuality.completeness * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Duplicates:</span>
                              <span className="font-medium">{dataProfile.dataQuality.duplicateRows}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Outliers:</span>
                              <span className="font-medium">{dataProfile.dataQuality.outliers}</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-lg border bg-card">
                          <h4 className="font-semibold mb-3">Column Types</h4>
                          <div className="space-y-2 text-sm">
                            {['numeric', 'categorical', 'datetime', 'text', 'boolean'].map(type => {
                              const count = dataProfile.columns.filter(col => col.type === type).length
                              if (count === 0) return null
                              return (
                                <div key={type} className="flex justify-between">
                                  <span className="capitalize">{type}:</span>
                                  <span className="font-medium">{count}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {dataProfile.correlations.length > 0 && (
                          <div className="p-4 rounded-lg border bg-card">
                            <h4 className="font-semibold mb-3">Top Correlations</h4>
                            <div className="space-y-2 text-xs">
                              {dataProfile.correlations
                                .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
                                .slice(0, 5)
                                .map((corr, index) => (
                                  <div key={index} className="space-y-1">
                                    <div className="font-medium">
                                      {corr.col1} ↔ {corr.col2}
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                      <span>{corr.correlation.toFixed(3)}</span>
                                      <span>{corr.strength}</span>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default App