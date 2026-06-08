"use client";

import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Paper,
  IconButton,
  Alert,
} from "@mui/material";
import {
  CloudUpload,
  Close,
  TextSnippet,
} from "@mui/icons-material";
import { useOCR } from "./hooks/useOCR";

interface SimpleOCRUploaderProps {
  onResult?: (result: { success: boolean; text?: string; message?: string }) => void;
  onTextExtracted?: (text: string) => void;
  disabled?: boolean;
  maxWidth?: number | string;
}

const SimpleOCRUploader: React.FC<SimpleOCRUploaderProps> = ({
  onResult,
  onTextExtracted,
  disabled = false,
  maxWidth = 400,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { isLoading, result, uploadImage, clearResult } = useOCR();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && !disabled) {
      setSelectedFile(file);
      clearResult();

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || disabled) return;

    const ocrResult = await uploadImage(selectedFile);
    
    if (ocrResult) {
      // Call callbacks if provided
      onResult?.(ocrResult);
      if (ocrResult.success && ocrResult.text) {
        onTextExtracted?.(ocrResult.text);
      }
    }
  };

  const handleClear = () => {
    if (disabled) return;
    
    setSelectedFile(null);
    setPreview("");
    clearResult();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Box sx={{ maxWidth, width: "100%" }}>
      {/* File Upload Button */}
      <Box sx={{ mb: 2 }}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/png,image/jpeg,image/jpg"
          style={{ display: "none" }}
        />
        
        <Button
          variant="outlined"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isLoading}
          startIcon={<CloudUpload />}
          fullWidth
          sx={{ mb: 1 }}
        >
          {selectedFile ? "Change Image" : "Select Image"}
        </Button>
        
        <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
          PNG or JPG files only (max 10MB)
        </Typography>
      </Box>

      {/* Selected File Info */}
      {selectedFile && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2, position: "relative" }}>
          <IconButton
            onClick={handleClear}
            disabled={disabled || isLoading}
            size="small"
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <Close fontSize="small" />
          </IconButton>
          
          <Typography variant="subtitle2" noWrap>
            {selectedFile.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </Typography>
          
          {preview && (
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <img
                src={preview}
                alt="Preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "150px",
                  objectFit: "contain",
                  borderRadius: "4px",
                }}
              />
            </Box>
          )}
        </Paper>
      )}

      {/* Process Button */}
      {selectedFile && (
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={disabled || isLoading}
          startIcon={<TextSnippet />}
          fullWidth
          sx={{ mb: 2 }}
        >
          {isLoading ? "Processing..." : "Extract Text"}
        </Button>
      )}

      {/* Loading Progress */}
      {isLoading && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress />
          <Typography variant="caption" color="text.secondary" textAlign="center" display="block" sx={{ mt: 1 }}>
            Processing image...
          </Typography>
        </Box>
      )}

      {/* Results */}
      {result && (
        <Box>
          {result.success ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Text extracted successfully!
              </Typography>
              {result.text && (
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 1, 
                    mt: 1, 
                    maxHeight: 150, 
                    overflow: "auto",
                    fontSize: "0.875rem",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {result.text}
                </Paper>
              )}
            </Alert>
          ) : (
            <Alert severity="error">
              <Typography variant="body2">
                {result.message || "Failed to extract text"}
              </Typography>
            </Alert>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SimpleOCRUploader;
