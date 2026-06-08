// OCR Components
export { default as OCRUploader } from '../OCRUploader';
export { default as SimpleOCRUploader } from '../SimpleOCRUploader';

// OCR Hook
export { default as useOCR } from '../hooks/useOCR';

// Types
export interface OCRResult {
  success: boolean;
  text?: string;
  confidence?: number;
  message?: string;
}
