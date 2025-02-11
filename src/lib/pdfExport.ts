import { jsPDF } from 'jspdf'

export function exportToPDF(text: string, filename: string) {
  const doc = new jsPDF()
  
  // Add title
  doc.setFontSize(16)
  doc.text(filename, 20, 20)
  
  // Add content with word wrap
  doc.setFontSize(12)
  const splitText = doc.splitTextToSize(text, 170)
  doc.text(splitText, 20, 30)
  
  // Save the PDF
  doc.save(`${filename}.pdf`)
} 