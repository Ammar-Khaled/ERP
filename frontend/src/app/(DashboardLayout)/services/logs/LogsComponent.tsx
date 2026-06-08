"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Box,
  Button,
  CheckboxProps,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  TextField,
} from "@mui/material";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CustomCheckbox from "@/app/components/forms/theme-elements/CustomCheckbox";
import SharedTable from "@/app/components/tables/DynamicTable";
import TableSkeleton from "@/app/components/TableSkeleton";
import { CustomPopup } from "@/utils/CustomPopup";
import { useGetAlllogsQuery } from "@/store/slice/logsApiSlice";

// Types
interface Log {
  id: number;
  timestamp: any; // Adjust based on actual timestamp format
  level: string;
  packetType: string;
  userId: number;
  ipAddress: string;
  userAgent: string;
  action: string;
  endpoint: string;
  method: string;
  responseTime: number;
  errorMessage: string | null;
  trace: string | null;
  metadata: any | null;
}

interface ApiResponse<T> {
  statusCode: number;
  isSuccess: boolean;
  data: T;
  message: string;
}

const columnHelper = createColumnHelper<Log>();

const LogsComponent = () => {
  // State
  const [page] = useState(1);
  const limit = 10;
  const [isOpenView, setIsOpenView] = useState(false);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);

  // API hooks
  const {
    data: logsData,
    isLoading: isLogsLoading,
    isError: isLogsError,
  } = useGetAlllogsQuery({ page, limit });

  // Table data
  const tableData = useMemo(() => {
    if (logsData?.isSuccess && logsData?.data) {
      return logsData.data;
    }
    return [];
  }, [logsData]);

  // Handle View popup
  const handleOpenView = (log: Log) => {
    setSelectedLog(log);
    setIsOpenView(true);
  };

  const handleCloseView = () => {
    setIsOpenView(false);
    setSelectedLog(null);
  };

  // Indeterminate checkbox
  interface IndeterminateCheckboxProps extends Omit<CheckboxProps, "ref"> {
    indeterminate?: boolean;
  }

  const IndeterminateCheckbox: React.FC<IndeterminateCheckboxProps> = ({
    indeterminate,
    className = "",
    ...rest
  }) => {
    const ref = useRef<HTMLButtonElement>(null);

    useEffect(() => {
      if (ref.current && typeof indeterminate === "boolean") {
        (ref.current as any).indeterminate = !rest.checked && indeterminate;
      }
    }, [indeterminate, rest.checked]);

    return (
      <CustomCheckbox
        ref={ref}
        className={className + " cursor-pointer"}
        {...rest}
      />
    );
  };

  // Table columns
  const columns = useMemo<ColumnDef<Log>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <IndeterminateCheckbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler(),
            }}
          />
        ),
        cell: ({ row }) => (
          <IndeterminateCheckbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler(),
            }}
          />
        ),
      },
      {
        header: "ID",
        accessorKey: "id",
      },
      {
        header: "Level",
        accessorKey: "level",
        cell: ({ row }) => (
          <Chip
            label={row.original.level}
            color={row.original.level === "error" ? "error" : "info"}
            size="small"
          />
        ),
      },
      {
        header: "Action",
        accessorKey: "action",
      },
      // {
      //   header: "Endpoint",
      //   accessorKey: "endpoint",
      // },
      // {
      //   header: "Method",
      //   accessorKey: "method",
      // },
      // {
      //   header: "User ID",
      //   accessorKey: "userId",
      // },
      // {
      //   header: "IP Address",
      //   accessorKey: "ipAddress",
      // },
      // {
      //   header: "Response Time (ms)",
      //   accessorKey: "responseTime",
      // },
      {
        header: "Action",
        accessorKey: "action_menu",
        cell: ({ row }) => {
          const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

          const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
            setAnchorEl(event.currentTarget);
          };

          const handleMenuClose = () => {
            setAnchorEl(null);
          };

          return (
            <>
              <IconButton onClick={handleMenuOpen}>
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <MenuItem
                  onClick={() => {
                    handleOpenView(row.original);
                    handleMenuClose();
                  }}
                >
                  <VisibilityIcon sx={{ mr: 1 }} /> View Details
                </MenuItem>
              </Menu>
            </>
          );
        },
      },
    ],
    []
  );

  if (isLogsLoading) return <TableSkeleton rows={10} columns={9} />;
  if (isLogsError) return <Typography>Error loading logs</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" mb={2}>
        Logs
      </Typography>
      <SharedTable
        columns={columns}
        data={tableData}
        LoadingData={isLogsLoading}
      />

      {/* View Log Details Popup */}
      <CustomPopup
        handleClose={handleCloseView}
        isOpen={isOpenView}
        content={
          <Box sx={{ p: 3, maxHeight: "90vh", overflowY: "auto" }}>
            <Typography variant="h6" mb={2}>
              Log Details
            </Typography>
            {selectedLog && (
              <>
                <TextField
                  label="ID"
                  fullWidth
                  value={selectedLog.id}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Level"
                  fullWidth
                  value={selectedLog.level}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Action"
                  fullWidth
                  value={selectedLog.action}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Endpoint"
                  fullWidth
                  value={selectedLog.endpoint}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Method"
                  fullWidth
                  value={selectedLog.method}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="User ID"
                  fullWidth
                  value={selectedLog.userId}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="IP Address"
                  fullWidth
                  value={selectedLog.ipAddress}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="User Agent"
                  fullWidth
                  value={selectedLog.userAgent}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Response Time (ms)"
                  fullWidth
                  value={selectedLog.responseTime}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Error Message"
                  fullWidth
                  value={selectedLog.errorMessage || "N/A"}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Trace"
                  fullWidth
                  multiline
                  rows={4}
                  value={selectedLog.trace || "N/A"}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Metadata"
                  fullWidth
                  multiline
                  rows={4}
                  value={
                    selectedLog.metadata
                      ? JSON.stringify(selectedLog.metadata, null, 2)
                      : "N/A"
                  }
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
              </>
            )}
            <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
              <Button onClick={handleCloseView}>Close</Button>
            </Box>
          </Box>
        }
      />
    </Box>
  );
};

export default LogsComponent;
