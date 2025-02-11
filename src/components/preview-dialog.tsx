import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface PreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  text: string
  filename: string
}

export function PreviewDialog({ open, onOpenChange, text, filename }: PreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>{filename}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto">
          <pre className="whitespace-pre-wrap font-mono text-sm p-4">
            {text}
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  )
} 