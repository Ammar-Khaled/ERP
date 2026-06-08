import { useState } from "react";
import axios from "axios";
import { showToast } from "@/utils/ToastNotifications";

interface OCRResult {
  success: boolean;
  text?: string;
  confidence?: number;
  message?: string;
}

interface UseOCRHook {
  isLoading: boolean;
  result: OCRResult | null;
  uploadImage: (file: File) => Promise<OCRResult | null>;
  clearResult: () => void;
}

export const useOCR = (): UseOCRHook => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<OCRResult | null>(null);

  const uploadImage = async (file: File): Promise<OCRResult | null> => {
    // Validate file type
    if (!file.type.match(/^image\/(png|jpe?g)$/i)) {
      const error = "Please select a valid PNG or JPG image file";
      showToast({ type: false, message: error });
      return null;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      const error = "File size must be less than 10MB";
      showToast({ type: false, message: error });
      return null;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        "http://localhost:4000/ocr",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000, // 30 second timeout
        }
      );

      const ocrResult: OCRResult = response.data;
      setResult(ocrResult);

      if (ocrResult.success) {
        showToast({
          type: true,
          message: "OCR processing completed successfully!",
        });
      } else {
        showToast({
          type: false,
          message: ocrResult.message || "OCR processing failed",
        });
      }

      return ocrResult;
    } catch (error: any) {
      console.error("OCR Upload Error:", error);
      
      let errorMessage = "Failed to process image";
      if (error.code === "ECONNREFUSED") {
        errorMessage = "Cannot connect to OCR service. Please ensure the Flask app is running on localhost:4000";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      showToast({
        type: false,
        message: errorMessage,
      });

      const errorResult: OCRResult = {
        success: false,
        message: errorMessage,
      };
      
      setResult(errorResult);
      return errorResult;
    } finally {
      setIsLoading(false);
    }
  };

  const clearResult = () => {
    setResult(null);
  };

  return {
    isLoading,
    result,
    uploadImage,
    clearResult,
  };
};

export default useOCR;
