import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter,
  AreaChart, Area, ComposedChart, Treemap, RadialBarChart, RadialBar
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { TrendingUp, TrendingDown, AlertTriangle, Info } from 'lucide-react'

const COLORS = [
  '#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4',
  '#84CC16', '#F97316', '#EC4899', '#6366F1', '#14B8A6', '#F43F5E'
]

interface ChartProps {
  data: any[]
  title: string
  insights: string[]
  description?: string
  height?: number
}

export function AdvancedBarChart({ data, title, insights, description, height = 300 }: ChartProps) {
  const maxValue = Math.max(...data.map(d => d.value))
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <Badge variant="secondary" className="text-xs">
            {data.length} items
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              angle={data.length > 8 ? -45 : 0}
              textAnchor={data.length > 8 ? 'end' : 'middle'}
              height={data.length > 8 ? 80 : 60}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: any, name: string) => [
                typeof value === 'number' ? value.toLocaleString() : value,
                'Value'
              ]}
            />
            <Bar 
              dataKey="value" 
              fill="#2563EB"
              radius={[4, 4, 0, 0]}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.value === maxValue ? '#10B981' : '#2563EB'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        <div className="space-y-2">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-start space-x-2 text-sm">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">{insight}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function AdvancedLineChart({ data, title, insights, description, height = 300 }: ChartProps) {
  const values = data.map(d => d.value)
  const trend = values.length > 1 ? (values[values.length - 1] - values[0]) / values[0] * 100 : 0
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center space-x-2">
              <span>{title}</span>
              {trend > 5 && <TrendingUp className="h-4 w-4 text-green-500" />}
              {trend < -5 && <TrendingDown className="h-4 w-4 text-red-500" />}
            </CardTitle>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="text-right">
            <Badge variant={trend > 0 ? "default" : "destructive"} className="text-xs">
              {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              angle={data.length > 10 ? -45 : 0}
              textAnchor={data.length > 10 ? 'end' : 'middle'}
              height={data.length > 10 ? 80 : 60}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: any) => [value.toLocaleString(), 'Value']}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#2563EB"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
        
        <div className="space-y-2">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-start space-x-2 text-sm">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">{insight}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function AdvancedPieChart({ data, title, insights, description, height = 300 }: ChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const dataWithPercentage = data.map(item => ({
    ...item,
    percentage: ((item.value / total) * 100).toFixed(1)
  }))
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <Badge variant="secondary" className="text-xs">
            Total: {total.toLocaleString()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-6">
          <div className="flex-shrink-0">
            <ResponsiveContainer width={height} height={height}>
              <PieChart>
                <Pie
                  data={dataWithPercentage}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percentage }) => `${percentage}%`}
                  outerRadius={height * 0.35}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {dataWithPercentage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: any, name: string, props: any) => [
                    `${value.toLocaleString()} (${props.payload.percentage}%)`,
                    'Value'
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex-1 space-y-2">
            {dataWithPercentage.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{item.value.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{item.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-start space-x-2 text-sm">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">{insight}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function ScatterPlotChart({ data, title, insights, description, height = 300 }: ChartProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <Badge variant="secondary" className="text-xs">
            {data.length} points
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ResponsiveContainer width="100%" height={height}>
          <ScatterChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              type="number" 
              dataKey="x" 
              tick={{ fontSize: 12 }}
              name="X"
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              tick={{ fontSize: 12 }}
              name="Y"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: any, name: string) => [value.toLocaleString(), name]}
            />
            <Scatter 
              dataKey="y" 
              fill="#2563EB"
              fillOpacity={0.7}
              stroke="#2563EB"
              strokeWidth={1}
            />
          </ScatterChart>
        </ResponsiveContainer>
        
        <div className="space-y-2">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-start space-x-2 text-sm">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">{insight}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function HistogramChart({ data, title, insights, description, height = 300 }: ChartProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <Badge variant="secondary" className="text-xs">
            Distribution
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: any) => [value, 'Frequency']}
            />
            <Bar 
              dataKey="value" 
              fill="#10B981"
              radius={[2, 2, 0, 0]}
              stroke="#059669"
              strokeWidth={1}
            />
          </BarChart>
        </ResponsiveContainer>
        
        <div className="space-y-2">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-start space-x-2 text-sm">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">{insight}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function HeatmapChart({ data, title, insights, description, height = 300 }: ChartProps) {
  const maxValue = Math.max(...data.map(d => d.average))
  const minValue = Math.min(...data.map(d => d.average))
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <Badge variant="secondary" className="text-xs">
            Heatmap
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {data.map((item, index) => {
            const intensity = (item.average - minValue) / (maxValue - minValue)
            const color = `hsl(${220 - intensity * 60}, 70%, ${85 - intensity * 30}%)`
            
            return (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 rounded-lg border"
                style={{ backgroundColor: color }}
              >
                <div className="font-medium">{item.category}</div>
                <div className="text-right">
                  <div className="font-semibold">{item.average.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.count} items • Range: {item.min.toFixed(1)}-{item.max.toFixed(1)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Min: {minValue.toFixed(2)}</span>
          <span>Max: {maxValue.toFixed(2)}</span>
        </div>
        
        <div className="space-y-2">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-start space-x-2 text-sm">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">{insight}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function BoxPlotChart({ data, title, insights, description, height = 300 }: ChartProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <Badge variant="secondary" className="text-xs">
            Box Plot
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{item.category}</span>
                <span className="text-sm text-muted-foreground">
                  Median: {item.median.toFixed(2)}
                </span>
              </div>
              
              <div className="relative h-8 bg-muted rounded">
                {/* Box plot visualization */}
                <div className="absolute inset-y-0 flex items-center w-full px-2">
                  <div className="relative w-full h-4 bg-blue-100 rounded">
                    {/* Whiskers */}
                    <div 
                      className="absolute top-0 bottom-0 w-0.5 bg-blue-600"
                      style={{ left: '5%' }}
                    />
                    <div 
                      className="absolute top-0 bottom-0 w-0.5 bg-blue-600"
                      style={{ right: '5%' }}
                    />
                    
                    {/* Box (Q1 to Q3) */}
                    <div 
                      className="absolute top-0 bottom-0 bg-blue-300 border-2 border-blue-600 rounded"
                      style={{ 
                        left: '25%', 
                        width: '50%'
                      }}
                    />
                    
                    {/* Median line */}
                    <div 
                      className="absolute top-0 bottom-0 w-0.5 bg-blue-800"
                      style={{ left: '50%' }}
                    />
                    
                    {/* Outliers */}
                    {item.outliers.slice(0, 5).map((outlier, oIndex) => (
                      <div
                        key={oIndex}
                        className="absolute w-1 h-1 bg-red-500 rounded-full"
                        style={{ 
                          left: `${Math.random() * 80 + 10}%`,
                          top: '50%',
                          transform: 'translateY(-50%)'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Min: {item.min.toFixed(1)}</span>
                <span>Q1: {item.q1.toFixed(1)}</span>
                <span>Q3: {item.q3.toFixed(1)}</span>
                <span>Max: {item.max.toFixed(1)}</span>
                {item.outliers.length > 0 && (
                  <span className="text-red-500">{item.outliers.length} outliers</span>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="space-y-2">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-start space-x-2 text-sm">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">{insight}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}