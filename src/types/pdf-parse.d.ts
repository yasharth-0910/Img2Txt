declare module 'pdf-parse' {
  interface PDFData {
    numpages: number
    numrender: number
    info: Record<string, unknown>
    metadata: Record<string, unknown>
    text: string
    version: string
  }

  function PDFParse(dataBuffer: Buffer): Promise<PDFData>
  export = PDFParse
} 