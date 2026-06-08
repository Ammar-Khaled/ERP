"use client";

import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  Paper,
} from "@mui/material";
import PageContainer from "@/app/components/container/PageContainer";
import OCRUploader from "@/app/components/shared/OCRUploader";
import SimpleOCRUploader from "@/app/components/shared/SimpleOCRUploader";
import { TextSnippet, Code, PhotoCamera } from "@mui/icons-material";

const OCRDemoPage: React.FC = () => {
  const [extractedText, setExtractedText] = useState<string>("");

  const handleTextExtracted = (text: string) => {
    setExtractedText(text);
  };

  const handleOCRResult = (result: { success: boolean; text?: string; message?: string }) => {
    console.log("OCR Result:", result);
    // You can handle the result here
  };

  return (
    <PageContainer title="OCR Text Extractor Demo" description="Extract text from images using OCR technology">
      <Container maxWidth="xl">
        <Box sx={{ py: 3 }}>
          {/* Header */}
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
              <TextSnippet color="primary" />
              OCR Text Extractor
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: "auto" }}>
              Upload PNG or JPG images to extract text using OCR (Optical Character Recognition) technology.
              Connect to your Flask OCR service running on localhost:4000.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {/* Full Featured Component */}
            <Grid item xs={12} lg={8}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PhotoCamera color="primary" />
                    Full Featured OCR Component
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Complete OCR component with drag & drop, image preview, progress tracking, and detailed results.
                  </Typography>
                  <OCRUploader />
                </CardContent>
              </Card>
            </Grid>

            {/* Simple Component & Usage Examples */}
            <Grid item xs={12} lg={4}>
              <Grid container spacing={3}>
                {/* Simple Component */}
                <Grid item xs={12}>
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <TextSnippet color="secondary" />
                        Simple OCR Component
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Compact version for forms and dialogs.
                      </Typography>
                      <SimpleOCRUploader 
                        onTextExtracted={handleTextExtracted}
                        onResult={handleOCRResult}
                      />
                    </CardContent>
                  </Card>
                </Grid>

                {/* Extracted Text Display */}
                {extractedText && (
                  <Grid item xs={12}>
                    <Card elevation={2}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Extracted Text Output
                        </Typography>
                        <Paper 
                          variant="outlined" 
                          sx={{ 
                            p: 2, 
                            maxHeight: 200, 
                            overflow: "auto",
                            whiteSpace: "pre-wrap",
                            fontFamily: "monospace",
                            fontSize: "0.875rem",
                          }}
                        >
                          {extractedText}
                        </Paper>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {/* Usage Instructions */}
                <Grid item xs={12}>
                  <Card elevation={1}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Code color="info" />
                        Usage Instructions
                      </Typography>
                      
                      <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="subtitle2">Flask OCR Service Required</Typography>
                        <Typography variant="body2">
                          Ensure your Flask app is running on localhost:4000 with an /ocr endpoint.
                        </Typography>
                      </Alert>

                      <Divider sx={{ my: 2 }} />

                      <Typography variant="subtitle2" gutterBottom>
                        Import Components:
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 1, mb: 2, fontSize: "0.75rem", fontFamily: "monospace" }}>
                        {`import OCRUploader from '@/app/components/shared/OCRUploader';
import SimpleOCRUploader from '@/app/components/shared/SimpleOCRUploader';
import { useOCR } from '@/app/components/shared/hooks/useOCR';`}
                      </Paper>

                      <Typography variant="subtitle2" gutterBottom>
                        Simple Usage:
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 1, mb: 2, fontSize: "0.75rem", fontFamily: "monospace" }}>
                        {`<SimpleOCRUploader 
  onTextExtracted={(text) => console.log(text)}
  onResult={(result) => console.log(result)}
/>`}
                      </Paper>

                      <Typography variant="subtitle2" gutterBottom>
                        With Hook:
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 1, fontSize: "0.75rem", fontFamily: "monospace" }}>
                        {`const { isLoading, result, uploadImage } = useOCR();
// Use uploadImage(file) to process`}
                      </Paper>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default OCRDemoPage;
