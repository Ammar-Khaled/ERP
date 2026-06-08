"use client";

import React from "react";
import { Box, Container } from "@mui/material";
import PageContainer from "@/app/components/container/PageContainer";
import OCRUploader from "@/app/components/shared/OCRUploader";

const OCRPage: React.FC = () => {
  return (
    <PageContainer title="OCR Text Extractor" description="Extract text from images using OCR">
      <Container maxWidth="lg">
        <Box sx={{ py: 3 }}>
          <OCRUploader />
        </Box>
      </Container>
    </PageContainer>
  );
};

export default OCRPage;
