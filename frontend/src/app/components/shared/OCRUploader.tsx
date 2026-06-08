"use client";

import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Paper,
  IconButton,
  Alert,
  Chip,
} from "@mui/material";
import {
  CloudUpload,
  Image as ImageIcon,
  Close,
  Visibility,
  TextSnippet,
} from "@mui/icons-material";
import axios from "axios";
import { showToast } from "@/utils/ToastNotifications";

interface OCRResult {
  success: boolean;
  text?: string;
  confidence?: number;
  message?: string;
}

const OCRUploader: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.match(/^image\/(png|jpe?g)$/i)) {
        showToast({
          type: false,
          message: "Please select a valid PNG or JPG image file",
        });
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        showToast({
          type: false,
          message: "File size must be less than 10MB",
        });
        return;
      }

      setSelectedFile(file);
      setOcrResult(null);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showToast({
        type: false,
        message: "Please select an image file first",
      });
      return;
    }

    setIsLoading(true);
    setOcrResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

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

      const result: OCRResult = response.data;
      setOcrResult(result);

      if (result.success) {
        showToast({
          type: true,
          message: "OCR processing completed successfully!",
        });
      } else {
        showToast({
          type: false,
          message: result.message || "OCR processing failed",
        });
      }
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

      setOcrResult({
        success: false,
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreview("");
    setOcrResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.match(/^image\/(png|jpe?g)$/i)) {
        setSelectedFile(file);
        setOcrResult(null);
        
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        showToast({
          type: false,
          message: "Please drop a valid PNG or JPG image file",
        });
      }
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TextSnippet color="primary" />
            OCR Image Text Extractor
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Upload a PNG or JPG image to extract text using OCR technology
          </Typography>

          {/* File Upload Area */}
          <Paper
            variant="outlined"
            sx={{
              p: 4,
              mb: 3,
              textAlign: "center",
              borderStyle: "dashed",
              borderWidth: 2,
              borderColor: selectedFile ? "primary.main" : "grey.300",
              bgcolor: selectedFile ? "primary.50" : "grey.50",
              cursor: "pointer",
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "primary.50",
              },
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/png,image/jpeg,image/jpg"
              style={{ display: "none" }}
            />
            
            {selectedFile ? (
              <Box>
                <ImageIcon sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
                <Typography variant="h6" color="primary.main">
                  {selectedFile.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
                <Chip 
                  label={selectedFile.type} 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                  sx={{ mt: 1 }}
                />
              </Box>
            ) : (
              <Box>
                <CloudUpload sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
                <Typography variant="h6" color="primary.main">
                  Click to upload or drag & drop
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  PNG or JPG images only (max 10MB)
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Image Preview */}
          {preview && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Visibility />
                  Preview
                </Typography>
                <IconButton onClick={handleClear} color="error" size="small">
                  <Close />
                </IconButton>
              </Box>
              <Paper elevation={2} sx={{ p: 2, maxHeight: 400, overflow: "auto" }}>
                <img
                  src={preview}
                  alt="Preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "350px",
                    objectFit: "contain",
                    display: "block",
                    margin: "0 auto",
                  }}
                />
              </Paper>
            </Box>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mb: 3 }}>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={!selectedFile || isLoading}
              startIcon={<TextSnippet />}
              size="large"
            >
              {isLoading ? "Processing..." : "Extract Text"}
            </Button>
            
            {selectedFile && (
              <Button
                variant="outlined"
                onClick={handleClear}
                disabled={isLoading}
                startIcon={<Close />}
                size="large"
              >
                Clear
              </Button>
            )}
          </Box>

          {/* Loading Progress */}
          {isLoading && (
            <Box sx={{ mb: 3 }}>
              <LinearProgress sx={{ mb: 1 }} />
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Processing image with OCR... This may take a few moments.
              </Typography>
            </Box>
          )}

          {/* Results Display */}
          {ocrResult && (
            <Box>
              <Typography variant="h6" gutterBottom>
                OCR Results
              </Typography>
              
              {ocrResult.success ? (
                <Paper elevation={1} sx={{ p: 3, bgcolor: "success.50", border: "1px solid", borderColor: "success.200" }}>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    Text extraction completed successfully!
                    {ocrResult.confidence && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Confidence: {(ocrResult.confidence * 100).toFixed(1)}%
                      </Typography>
                    )}
                  </Alert>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Extracted Text:
                  </Typography>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      bgcolor: "background.paper", 
                      maxHeight: 300, 
                      overflow: "auto",
                      whiteSpace: "pre-wrap",
                      fontFamily: "monospace",
                    }}
                  >
                    {ocrResult.text || "No text found in the image"}
                  </Paper>
                </Paper>
              ) : (
                <Alert severity="error">
                  <Typography variant="subtitle2">OCR Processing Failed</Typography>
                  <Typography variant="body2">
                    {ocrResult.message || "An error occurred during processing"}
                  </Typography>
                </Alert>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default OCRUploader;
