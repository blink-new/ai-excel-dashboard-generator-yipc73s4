import { useState, useEffect } from 'react'
import { Card } from './ui/card'
import { Progress } from './ui/progress'
import { CheckCircle, Loader2 } from 'lucide-react'

interface AnalysisStep {
  id: string
  label: string
  completed: boolean
}

interface AnalysisProgressProps {
  isAnalyzing: boolean
  onComplete?: () => void
}

export function AnalysisProgress({ isAnalyzing, onComplete }: AnalysisProgressProps) {
  const [steps, setSteps] = useState<AnalysisStep[]>([
    { id: 'reading', label: 'Processing Excel file...', completed: false },
    { id: 'profiling', label: 'Profiling data structure & quality...', completed: false },
    { id: 'statistical', label: 'Running statistical analysis...', completed: false },
    { id: 'correlations', label: 'Detecting patterns & correlations...', completed: false },
    { id: 'charts', label: 'Generating intelligent visualizations...', completed: false },
    { id: 'insights', label: 'Creating AI-powered insights...', completed: false },
    { id: 'dashboard', label: 'Building advanced dashboard...', completed: false }
  ])
  
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isAnalyzing) {
      setCurrentStep(0)
      setProgress(0)
      setSteps(prev => prev.map(step => ({ ...step, completed: false })))
      return
    }

    const interval = setInterval(() => {
      setSteps(prev => {
        const newSteps = [...prev]
        if (currentStep < newSteps.length) {
          newSteps[currentStep].completed = true
        }
        return newSteps
      })

      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1)
        setProgress(prev => Math.min(prev + (100 / steps.length), 100))
      } else {
        setProgress(100)
        setTimeout(() => {
          onComplete?.()
        }, 500)
        clearInterval(interval)
      }
    }, 1200)

    return () => clearInterval(interval)
  }, [isAnalyzing, currentStep, steps.length, onComplete])

  if (!isAnalyzing) return null

  return (
    <Card className="p-6 space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">
          Analyzing Your Data
        </h3>
        <Progress value={progress} className="w-full" />
        <p className="text-sm text-muted-foreground">
          {progress}% complete
        </p>
      </div>
      
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center space-x-3">
            {step.completed ? (
              <CheckCircle className="h-5 w-5 text-accent" />
            ) : index === currentStep ? (
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
            ) : (
              <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
            )}
            <span className={`text-sm ${
              step.completed 
                ? 'text-foreground font-medium' 
                : index === currentStep 
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground'
            }`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}