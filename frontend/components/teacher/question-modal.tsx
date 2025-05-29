"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, X, Save, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"

export interface Question {
  id: string
  text: string
  correctAnswer: string
  difficulty: "Easy" | "Medium" | "Hard"
  pointValue: number
  hasReference: boolean
  referenceFile?: File | null
  submissionCount: number
  isActive: boolean
  tags: string[]
  timeLimit?: number
  allowFileUpload: boolean
  allowTextAnswer: boolean
}

interface QuestionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (question: Omit<Question, "id" | "submissionCount">) => void
  question?: Question | null
  mode: "create" | "edit"
}

export function QuestionModal({ isOpen, onClose, onSave, question, mode }: QuestionModalProps) {
  const [formData, setFormData] = useState<Omit<Question, "id" | "submissionCount">>({
    text: "",
    correctAnswer: "",
    difficulty: "Medium",
    pointValue: 10,
    hasReference: false,
    referenceFile: null,
    isActive: true,
    tags: [],
    timeLimit: undefined,
    allowFileUpload: true,
    allowTextAnswer: true,
  })
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [newTag, setNewTag] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Reset form when modal opens/closes or question changes
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && question) {
        setFormData({
          text: question.text,
          correctAnswer: question.correctAnswer,
          difficulty: question.difficulty,
          pointValue: question.pointValue,
          hasReference: question.hasReference,
          referenceFile: question.referenceFile || null,
          isActive: question.isActive,
          tags: question.tags,
          timeLimit: question.timeLimit,
          allowFileUpload: question.allowFileUpload,
          allowTextAnswer: question.allowTextAnswer,
        })
        setUploadedFile(question.referenceFile || null)
      } else {
        // Reset for create mode
        setFormData({
          text: "",
          correctAnswer: "",
          difficulty: "Medium",
          pointValue: 10,
          hasReference: false,
          referenceFile: null,
          isActive: true,
          tags: [],
          timeLimit: undefined,
          allowFileUpload: true,
          allowTextAnswer: true,
        })
        setUploadedFile(null)
      }
      setNewTag("")
    }
  }, [isOpen, mode, question])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setUploadedFile(file)
      setFormData((prev) => ({
        ...prev,
        referenceFile: file,
        hasReference: true,
      }))
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file only.",
        variant: "destructive",
      })
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    setFormData((prev) => ({
      ...prev,
      referenceFile: null,
      hasReference: false,
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.text.trim()) {
      toast({
        title: "Validation Error",
        description: "Question text is required.",
        variant: "destructive",
      })
      return
    }

    if (!formData.correctAnswer.trim()) {
      toast({
        title: "Validation Error",
        description: "Correct answer is required.",
        variant: "destructive",
      })
      return
    }

    if (!formData.allowFileUpload && !formData.allowTextAnswer) {
      toast({
        title: "Validation Error",
        description: "At least one answer format must be allowed.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      onSave(formData)

      toast({
        title: mode === "create" ? "Question Created" : "Question Updated",
        description: `The question has been successfully ${mode === "create" ? "created" : "updated"}.`,
      })

      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while saving the question.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "Hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "create" ? <Plus className="h-5 w-5" /> : <Save className="h-5 w-5" />}
            {mode === "create" ? "Create New Question" : "Edit Question"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Fill in the details to create a new assignment question."
              : "Modify the question details as needed."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question Text */}
          <div className="space-y-2">
            <Label htmlFor="question-text">
              Question Text <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="question-text"
              placeholder="Enter your question here..."
              value={formData.text}
              onChange={(e) => setFormData((prev) => ({ ...prev, text: e.target.value }))}
              className="min-h-[100px]"
              required
            />
            <p className="text-xs text-muted-foreground">{formData.text.length} characters</p>
          </div>

          {/* Correct Answer */}
          <div className="space-y-2">
            <Label htmlFor="correct-answer">
              Correct Answer / Reference Answer <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="correct-answer"
              placeholder="Enter the correct answer or key points..."
              value={formData.correctAnswer}
              onChange={(e) => setFormData((prev) => ({ ...prev, correctAnswer: e.target.value }))}
              className="min-h-[120px]"
              required
            />
            <p className="text-xs text-muted-foreground">
              This will be used for similarity comparison and grading reference.
            </p>
          </div>

          {/* Question Settings Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value: "Easy" | "Medium" | "Hard") =>
                  setFormData((prev) => ({ ...prev, difficulty: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">
                    <div className="flex items-center gap-2">
                      <Badge className={getDifficultyColor("Easy")}>Easy</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="Medium">
                    <div className="flex items-center gap-2">
                      <Badge className={getDifficultyColor("Medium")}>Medium</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="Hard">
                    <div className="flex items-center gap-2">
                      <Badge className={getDifficultyColor("Hard")}>Hard</Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="point-value">Point Value</Label>
              <Input
                id="point-value"
                type="number"
                min="1"
                max="100"
                value={formData.pointValue}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, pointValue: Number.parseInt(e.target.value) || 10 }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time-limit">Time Limit (minutes)</Label>
              <Input
                id="time-limit"
                type="number"
                min="1"
                placeholder="Optional"
                value={formData.timeLimit || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    timeLimit: e.target.value ? Number.parseInt(e.target.value) : undefined,
                  }))
                }
              />
            </div>
          </div>

          {/* Answer Format Settings */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Answer Format Settings</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allow-text">Allow Text Answers</Label>
                  <p className="text-xs text-muted-foreground">Students can submit written answers</p>
                </div>
                <Switch
                  id="allow-text"
                  checked={formData.allowTextAnswer}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, allowTextAnswer: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allow-file">Allow File Upload</Label>
                  <p className="text-xs text-muted-foreground">Students can upload PDF files</p>
                </div>
                <Switch
                  id="allow-file"
                  checked={formData.allowFileUpload}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, allowFileUpload: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is-active">Active Question</Label>
                  <p className="text-xs text-muted-foreground">Students can see and answer this question</p>
                </div>
                <Switch
                  id="is-active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline" size="sm">
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Reference Document Upload */}
          <div className="space-y-2">
            <Label>Reference Document (Optional)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              {uploadedFile ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-red-500" />
                    <span className="text-sm font-medium">{uploadedFile.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={removeFile}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">Upload a reference document</span>
                      <span className="mt-1 block text-xs text-gray-500">PDF up to 10MB</span>
                    </Label>
                    <Input id="file-upload" type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Upload additional materials or reference documents for this question.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {mode === "create" ? "Creating..." : "Updating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {mode === "create" ? "Create Question" : "Update Question"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
