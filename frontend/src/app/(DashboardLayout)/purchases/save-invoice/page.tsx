"use client";
import { useState } from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
  AppBar,
  Toolbar,
  Container,
  CircularProgress,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SaveIcon from "@mui/icons-material/Save";
import CodeIcon from "@mui/icons-material/Code";

interface InvoiceItem {
  amount: string;
  name: string;
  quantity: string;
  rate: string;
}

interface InvoiceData {
  amount_paid: string;
  balance_due: string;
  date: string;
  discount: string | null;
  due_date: string | null;
  invoice_number: string;
  items: InvoiceItem[];
  notes: string;
  subtotal: string;
  tax: string | null;
  total: string;
}

export default function Invoice() {
  const [file, setFile] = useState<File | null>(null);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [jsonDialogOpen, setJsonDialogOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [dbName, setDbName] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:5000/ocr", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setInvoiceData(data.data);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToDB = async () => {
    if (!invoiceData) return;

    alert("Done");
    // try {
    //   const response = await fetch("http://127.0.0.1:5000/save-to-db", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       dbName,
    //       invoiceData,
    //     }),
    //   });

    //   const result = await response.json();
    //   alert(result.message); // Show success message
    // } catch (error) {
    //   console.error("Error saving to DB:", error);
    //   alert("Failed to save data to DB.");
    // } finally {
    //   setSaveDialogOpen(false);
    // }
  };

  return (
    <>
      {/* Main Content */}
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Upload Invoice Image
            </Typography>
            <Typography variant="body1" color="textSecondary" gutterBottom>
              Please upload an image of your invoice (PNG, JPG, JPEG).
            </Typography>

            {/* File Upload Section */}
            <Box sx={{ mt: 2, mb: 4 }}>
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="upload-button"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="upload-button">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                >
                  Choose File
                </Button>
              </label>
              {file && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected file: {file.name}
                </Typography>
              )}
            </Box>

            {/* Analyze Button */}
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={!file || loading}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : "Upload and Analyze"}
            </Button>
          </CardContent>
        </Card>

        {/* Invoice Details */}
        {invoiceData && (
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Invoice Details
              </Typography>

              {/* Invoice Summary */}
              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6}>
                  <Typography>
                    <strong>Invoice Number:</strong>{" "}
                    {invoiceData.invoice_number}
                  </Typography>
                  <Typography>
                    <strong>Date:</strong> {invoiceData.date}
                  </Typography>
                  <Typography>
                    <strong>Amount Paid:</strong> {invoiceData.amount_paid}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography>
                    <strong>Balance Due:</strong> {invoiceData.balance_due}
                  </Typography>
                  <Typography>
                    <strong>Subtotal:</strong> {invoiceData.subtotal}
                  </Typography>
                  <Typography>
                    <strong>Total:</strong> {invoiceData.total}
                  </Typography>
                </Grid>
              </Grid>

              {/* Items Table */}
              <Typography variant="h6" gutterBottom>
                Items
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <strong>Name</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Quantity</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Rate</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Amount</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoiceData.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.rate}</TableCell>
                        <TableCell>{item.amount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Additional Buttons */}
              <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<CodeIcon />}
                  onClick={() => setJsonDialogOpen(true)}
                >
                  View as JSON
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveToDB}
                >
                  Save to DB
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Container>

      {/* JSON Dialog */}
      <Dialog
        open={jsonDialogOpen}
        onClose={() => setJsonDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Invoice Data (JSON)</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={10}
            value={JSON.stringify(invoiceData, null, 2)}
            variant="outlined"
            InputProps={{
              readOnly: true,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJsonDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
