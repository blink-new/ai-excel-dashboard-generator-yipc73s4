import { useState, useCallback } from 'react'
import { Upload, FileSpreadsheet, X } from 'lucide-react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { cn } from '../lib/utils'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  isLoading?: boolean
}

export function FileUpload({ onFileSelect, isLoading }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    const excelFile = files.find(file => 
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel' ||
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls')
    )
    
    if (excelFile) {
      setSelectedFile(excelFile)
      onFileSelect(excelFile)
    }
  }, [onFileSelect])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      onFileSelect(file)
    }
  }, [onFileSelect])

  const clearFile = useCallback(() => {
    setSelectedFile(null)
  }, [])

  return (
    <Card className={cn(
      "border-2 border-dashed transition-all duration-200 p-8",
      isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25",
      isLoading && "opacity-50 pointer-events-none"
    )}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="text-center space-y-4"
      >
        {selectedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <FileSpreadsheet className="h-8 w-8 text-accent" />
              <div className="text-left">
                <p className="font-medium text-foreground">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFile}
                className="ml-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {!isLoading && (
              <p className="text-sm text-muted-foreground">
                File ready for analysis. Click "Generate Dashboard" to continue.
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="flex justify-center">
              <Upload className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                Upload Excel File
              </h3>
              <p className="text-muted-foreground">
                Drag and drop your Excel file here, or click to browse
              </p>
              <p className="text-sm text-muted-foreground">
                Supports .xlsx and .xls files
              </p>
            </div>
            <div>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button asChild className="cursor-pointer">
                  <span>Choose File</span>
                </Button>
              </label>
            </div>
          </>
        )}
      </div>
    </Card>
  )
}