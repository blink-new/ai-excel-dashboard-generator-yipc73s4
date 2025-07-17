import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import { Progress } from './ui/progress'
import { 
  TrendingUp, TrendingDown, AlertTriangle, Info, CheckCircle, 
  XCircle, Activity, BarChart3, PieChart, Target, Lightbulb,
  Database, Shield, Zap, Users, DollarSign
} from 'lucide-react'
import { AIInsight, DataProfile } from '../lib/dataAnalysis'

interface InsightsPanelProps {
  insights: AIInsight[]
  dataProfile: DataProfile
  onInsightClick?: (insight: AIInsight) => void
}

export function InsightsPanel({ insights, dataProfile, onInsightClick }: InsightsPanelProps) {
  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'trend':
        return <TrendingUp className="h-4 w-4" />
      case 'anomaly':
        return <AlertTriangle className="h-4 w-4" />
      case 'correlation':
        return <BarChart3 className="h-4 w-4" />
      case 'distribution':
        return <PieChart className="h-4 w-4" />
      case 'quality':
        return <Shield className="h-4 w-4" />
      case 'business':
        return <Lightbulb className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: AIInsight['severity']) => {
    switch (severity) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'default'
      case 'low':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const getSeverityIcon = (severity: AIInsight['severity']) => {
    switch (severity) {
      case 'high':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const businessInsights = insights.filter(i => i.type === 'business')
  const technicalInsights = insights.filter(i => i.type !== 'business')
  const actionableInsights = insights.filter(i => i.actionable)

  return (
    <div className="space-y-6">
      {/* Data Quality Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center space-x-2">
            <Database className="h-5 w-5 text-blue-500" />
            <span>Data Quality Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completeness</span>
                <span className="text-sm text-muted-foreground">
                  {(dataProfile.dataQuality.completeness * 100).toFixed(1)}%
                </span>
              </div>
              <Progress value={dataProfile.dataQuality.completeness * 100} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Duplicates</span>
                <Badge variant={dataProfile.dataQuality.duplicateRows > 0 ? "destructive" : "secondary"}>
                  {dataProfile.dataQuality.duplicateRows}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {((dataProfile.dataQuality.duplicateRows / dataProfile.totalRows) * 100).toFixed(1)}% of data
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Outliers</span>
                <Badge variant={dataProfile.dataQuality.outliers > 0 ? "default" : "secondary"}>
                  {dataProfile.dataQuality.outliers}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Potential anomalies detected
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{dataProfile.totalRows.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Total Rows</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{dataProfile.totalColumns}</div>
              <div className="text-xs text-muted-foreground">Columns</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {dataProfile.columns.filter(c => c.type === 'numeric').length}
              </div>
              <div className="text-xs text-muted-foreground">Numeric</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {dataProfile.correlations.filter(c => c.strength === 'strong').length}
              </div>
              <div className="text-xs text-muted-foreground">Strong Correlations</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Intelligence */}
      {businessInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <span>Business Intelligence</span>
              <Badge variant="secondary" className="ml-auto">
                {businessInsights.length} insights
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {businessInsights.map((insight, index) => (
              <div 
                key={index} 
                className="p-4 rounded-lg border bg-gradient-to-r from-green-50 to-blue-50 hover:from-green-100 hover:to-blue-100 transition-colors cursor-pointer"
                onClick={() => onInsightClick?.(insight)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold text-sm">{insight.title}</h4>
                      <div className="flex items-center space-x-2">
                        {getSeverityIcon(insight.severity)}
                        {insight.actionable && (
                          <Badge variant="outline" className="text-xs">
                            Actionable
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                    {insight.recommendation && (
                      <div className="p-2 bg-white/50 rounded border-l-2 border-blue-500">
                        <p className="text-xs text-blue-700 font-medium">
                          💡 {insight.recommendation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Technical Insights */}
      {technicalInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <span>Technical Analysis</span>
              <Badge variant="secondary" className="ml-auto">
                {technicalInsights.length} insights
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {technicalInsights.map((insight, index) => (
              <div 
                key={index} 
                className="p-3 rounded-lg border hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => onInsightClick?.(insight)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      <Badge variant={getSeverityColor(insight.severity)} className="text-xs">
                        {insight.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                    {insight.recommendation && (
                      <p className="text-xs text-blue-600 mt-1">
                        💡 {insight.recommendation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Action Items */}
      {actionableInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center space-x-2">
              <Target className="h-5 w-5 text-orange-500" />
              <span>Recommended Actions</span>
              <Badge variant="default" className="ml-auto">
                {actionableInsights.length} actions
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {actionableInsights.slice(0, 5).map((insight, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-orange-50 border border-orange-200">
                <div className="flex-shrink-0 mt-0.5">
                  <Zap className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-medium text-sm text-orange-900">{insight.title}</h4>
                  {insight.recommendation && (
                    <p className="text-sm text-orange-700">{insight.recommendation}</p>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 text-xs h-7"
                    onClick={() => onInsightClick?.(insight)}
                  >
                    Learn More
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Column Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-purple-500" />
            <span>Column Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dataProfile.columns.slice(0, 8).map((column, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded border">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="text-xs">
                    {column.type}
                  </Badge>
                  <span className="font-medium text-sm">{column.name}</span>
                </div>
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <span>{column.uniqueValues} unique</span>
                  {column.nullCount > 0 && (
                    <span className="text-orange-600">{column.nullCount} missing</span>
                  )}
                  <span>{((column.uniqueValues / dataProfile.totalRows) * 100).toFixed(1)}% diversity</span>
                </div>
              </div>
            ))}
            
            {dataProfile.columns.length > 8 && (
              <div className="text-center pt-2">
                <Button variant="ghost" size="sm" className="text-xs">
                  Show {dataProfile.columns.length - 8} more columns
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Strong Correlations */}
      {dataProfile.correlations.filter(c => c.strength === 'strong').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center space-x-2">
              <Users className="h-5 w-5 text-indigo-500" />
              <span>Strong Relationships</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dataProfile.correlations
              .filter(c => c.strength === 'strong')
              .slice(0, 5)
              .map((corr, index) => (
                <div key={index} className="p-3 rounded-lg border bg-indigo-50">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="font-medium text-sm">
                        {corr.col1} ↔ {corr.col2}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {corr.correlation > 0 ? 'Positive' : 'Negative'} correlation
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-indigo-600">
                        {Math.abs(corr.correlation).toFixed(3)}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {corr.strength}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}