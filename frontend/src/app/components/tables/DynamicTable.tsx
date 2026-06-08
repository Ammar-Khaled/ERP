"use client";

import { Fragment, useState } from "react";

// material-ui
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";

// third-party
import {
  flexRender,
  useReactTable,
  ColumnDef,
  HeaderGroup,
  getExpandedRowModel,
  getCoreRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import TablePagination from "./TablePagination";

import { styled } from "@mui/material/styles";

import Image from "next/image";
import { CircularProgress } from "@mui/material";

const error404 = "/images/detective_3833171.png";

const ScrollX = styled("div")({
  width: "100%",
  overflowX: "auto",
  display: "block",
});

interface ReactTableProps {
  columns: ColumnDef<any>[];
  data: any[];
  top?: boolean;
  onPaginationChange?: (pageIndex: number, pageSize: number) => void;
  pageIndex?: number;
  pageSize?: number;
  totalCount?: number;
  LoadingData?: boolean;
  onRowSelectionChange?: (selectedRowIds: string[]) => void;
}

function ReactTable({
  onRowSelectionChange,
  columns,
  data,
  top,
  onPaginationChange,
  pageIndex,
  pageSize,
  totalCount,
  LoadingData,
}: ReactTableProps) {
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    enableRowSelection: true,
    pageCount: Math.ceil((totalCount || 1) / (pageSize || 1)),
    state: {
      pagination: {
        pageIndex: pageIndex ?? 0,
        pageSize: pageSize ?? 10,
      },
      rowSelection,
    },
    onRowSelectionChange: (updater) => {
      setRowSelection((prev) => {
        const newRowSelection =
          typeof updater === "function" ? updater(prev) : updater;
        const selectedIds = Object.keys(newRowSelection).map(
          (index) => data[parseInt(index)]?.id
        );
        onRowSelectionChange?.(selectedIds.filter(Boolean));
        return newRowSelection;
      });
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({
          pageIndex: pageIndex || 0,
          pageSize: pageSize || 10,
        });
        onPaginationChange?.(newState.pageIndex, newState.pageSize);
      } else {
        onPaginationChange?.(updater.pageIndex, updater.pageSize);
      }
    },
  });

  let headers: any[] = [];
  table.getAllColumns().map(
    (columns) =>
      // @ts-ignore
      columns.columnDef.accessorKey &&
      headers.push({
        label:
          typeof columns.columnDef.header === "string"
            ? columns.columnDef.header
            : "#",
        // @ts-ignore
        key: columns.columnDef.accessorKey,
      })
  );

  return (
    <Box
      sx={{
        border: "1px solid #e0e0e0",
        borderRadius: "12px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      }}
    >
      <ScrollX>
        <Stack>
          {!top && (
            <>
              <Box sx={{ p: 2 }}>
                <TablePagination
                  {...{
                    setPageSize: (size) => table.setPageSize(size),
                    setPageIndex: (index) => table.setPageIndex(index),
                    getState: table.getState,
                    getPageCount: table.getPageCount,
                    onPaginationChange,
                    pageIndex,
                    pageSize,
                  }}
                />
              </Box>
              <Divider />
            </>
          )}

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                {table
                  ?.getHeaderGroups()
                  .map((headerGroup: HeaderGroup<any>) => (
                    <TableRow
                      key={headerGroup.id}
                      sx={{ "& > th:first-of-type": { width: 58 } }}
                    >
                      {headerGroup.headers.map((header) => (
                        <TableCell
                          key={header.id}
                          {...header.column.columnDef.meta}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
              </TableHead>
              <TableBody style={{ position: "relative" }}>
                {LoadingData && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      // backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      zIndex: 10,
                    }}
                  >
                    {/* <div className="loader"></div> */}
                    <CircularProgress
                      size={50}
                      sx={{
                        color: "#1976d2",
                      }}
                    />
                  </Box>
                )}

                {table?.getRowModel()?.rows?.length > 0 ? (
                  table?.getRowModel().rows.map((row) => (
                    <Fragment key={row.id}>
                      <TableRow>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            {...cell.column.columnDef.meta}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    </Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns?.length} align="center">
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          height: "70vh",
                          gap: "1rem",
                        }}
                      >
                        {!LoadingData && (
                          <>
                            <Box sx={{ width: 300 }}>
                              <Image
                                src={error404}
                                alt="error404"
                                width={250}
                                height={225}
                                style={{
                                  maxWidth: "100%",
                                  height: "auto",
                                }}
                              />
                            </Box>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </ScrollX>
    </Box>
  );
}

// ==============================|| REACT TABLE - EXPANDING SUB TABLE ||============================== //

export default function SharedTable({
  columns,
  data,
  pageIndex,
  pageSize,
  totalCount,
  onPaginationChange,
  LoadingData,
  onRowSelectionChange,
}: ReactTableProps) {
  return (
    <ReactTable
      columns={columns}
      data={data}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalCount={totalCount}
      onPaginationChange={onPaginationChange}
      LoadingData={LoadingData}
      onRowSelectionChange={onRowSelectionChange}
    />
  );
}
