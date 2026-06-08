import Language from "@/app/(DashboardLayout)/layout/vertical/header/Language";
import { AppState } from "@/store/store";
import { Calculate } from "@mui/icons-material";
import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Grid,
  Paper,
  Stack,
  Container,
} from "@mui/material";
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Profile from "@/app/(DashboardLayout)/layout/vertical/header/Profile";
import Notifications from "@/app/(DashboardLayout)/layout/vertical/header/Notification";

const HeaderPOS = () => {
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();

  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [calcInput, setCalcInput] = useState("");

  const handleCalculatorOpen = () => {
    setCalculatorOpen(true);
  };

  const handleCalculatorClose = () => {
    setCalculatorOpen(false);
    setCalcInput("");
  };

  const handleButtonClick = (value: string) => {
    setCalcInput((prev) => prev + value);
  };

  const handleClear = () => {
    setCalcInput("");
  };

  const handleCalculate = () => {
    try {
      // Evaluate the calculation input
      const result = eval(calcInput);
      setCalcInput(result.toString());
    } catch (error) {
      setCalcInput("Error");
    }
  };

  return (
    <AppBar
      position="static"
      color="default"
      elevation={1}
      sx={{
        marginBottom: 2,
        width: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          width: "90%",
          margin: "0 auto",
          justifyContent: "end",
          alignItems: "center",
        }}
      >
        <Toolbar>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton aria-label="Calculator" onClick={handleCalculatorOpen}>
            <Calculate />
          </IconButton>
          <Stack spacing={1} direction="row" alignItems="center">
            <Language />

            <Notifications />

            <Profile />
          </Stack>
        </Toolbar>

        {/* Calculator Dialog */}
        <Dialog
          open={calculatorOpen}
          onClose={handleCalculatorClose}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Calculator</DialogTitle>
          <DialogContent>
            <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
              <Typography variant="h5" align="right" gutterBottom>
                {calcInput || "0"}
              </Typography>
            </Paper>
            <Grid container spacing={1}>
              {["7", "8", "9", "/"].map((item) => (
                <Grid item xs={3} key={item}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={() => handleButtonClick(item)}
                  >
                    {item}
                  </Button>
                </Grid>
              ))}
              {["4", "5", "6", "*"].map((item) => (
                <Grid item xs={3} key={item}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={() => handleButtonClick(item)}
                  >
                    {item}
                  </Button>
                </Grid>
              ))}
              {["1", "2", "3", "-"].map((item) => (
                <Grid item xs={3} key={item}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={() => handleButtonClick(item)}
                  >
                    {item}
                  </Button>
                </Grid>
              ))}
              {["0", ".", "=", "+"].map((item) => (
                <Grid item xs={3} key={item}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={() =>
                      item === "=" ? handleCalculate() : handleButtonClick(item)
                    }
                  >
                    {item}
                  </Button>
                </Grid>
              ))}
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  onClick={handleClear}
                >
                  Clear
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
        </Dialog>
      </Box>
    </AppBar>
  );
};

export default HeaderPOS;
