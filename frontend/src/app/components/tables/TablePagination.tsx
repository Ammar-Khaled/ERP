/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect } from "react";
// import { FormControl, Grid, MenuItem, Pagination, Select, SelectChangeEvent, Stack, TextField, Typography } from '@mui/material';
import { Grid, Pagination } from "@mui/material";
import { TableState } from "@tanstack/react-table";

interface TablePaginationProps {
  setPageSize: (size: number) => void;
  setPageIndex: (index: number) => void;
  getState: () => TableState;
  getPageCount: () => number;
  onPaginationChange?: (pageIndex: number, pageSize: number) => void;
  initialPageSize?: number;
  pageIndex?: number;
  pageSize?: number;
}

export default function TablePagination({
  getPageCount,
  setPageIndex,
  setPageSize,
  getState,
  onPaginationChange,
  initialPageSize = 10,
  pageIndex,
  pageSize,
}: TablePaginationProps) {
  // const options = [10, 25, 50, 100];

  useEffect(() => {
    setPageSize(initialPageSize);
  }, []);

  const handleChangePagination = (
    _: React.ChangeEvent<unknown>,
    value: number
  ) => {
    const newIndex = value - 1;
    setPageIndex(newIndex);
    onPaginationChange?.(newIndex, pageSize ?? initialPageSize);
  };

  // const handleChange = (event: SelectChangeEvent<number>) => {
  //   const newSize = Number(event.target.value);
  //   setPageSize(newSize);
  //   onPaginationChange(0, newSize);
  // };

  // const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const page = e.target.value ? Number(e.target.value) - 1 : 0;
  //   if (page >= 0 && page < getPageCount()) {
  //     setPageIndex(page);
  //     onPaginationChange(page, pageSize);
  //   }
  // };

  return (
    <Grid
      container
      spacing={1}
      alignItems="center"
      justifyContent="end"
      sx={{ width: "auto" }}
    >
      {/* <Grid item>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="caption" color="secondary">
            Rows per page
          </Typography>
          <FormControl sx={{ m: 1 }}>
            <Select value={pageSize} onChange={handleChange} size="small" sx={{ '& .MuiSelect-select': { py: 0.75, px: 1.25 } }}>
              {options.map((option: number) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="caption" color="secondary">
            Go to
          </Typography>
          <TextField
            size="small"
            type="number"
            value={pageIndex + 1}
            onChange={handlePageInput}
            sx={{ '& .MuiOutlinedInput-input': { py: 0.75, px: 1.25, width: 36 } }}
            inputProps={{
              min: 1,
              max: getPageCount()
            }}
          />
        </Stack>
      </Grid> */}
      <Grid item sx={{ mt: { xs: 2, sm: 0 } }}>
        <Pagination
          count={getPageCount()}
          page={(pageIndex ?? 0) + 1}
          onChange={handleChangePagination}
          color="primary"
          variant="outlined"
          showFirstButton
          showLastButton
          sx={{ "& .MuiPaginationItem-root": { my: 0.5 } }}
        />
      </Grid>
    </Grid>
  );
}
