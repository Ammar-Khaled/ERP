"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Box,
  Button,
  CheckboxProps,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import CustomCheckbox from "@/app/components/forms/theme-elements/CustomCheckbox";
import SharedTable from "@/app/components/tables/DynamicTable";
import TableSkeleton from "@/app/components/TableSkeleton";
import { CustomPopup } from "@/utils/CustomPopup";
import { showToast } from "@/utils/ToastNotifications";
import {
  useGetAllreturnsOrderQuery,
  useCreateReturnOrderMutation,
  useDeleteReturnOrderMutation,
} from "@/store/slice/returnOrderApiSlice";

// Types
interface ReturnItem {
  numberOfItems: number;
  orderItemId: number;
}

interface ReturnOrder {
  id: number;
  date: string; // Adjust based on actual date format
  reason: string;
  reasonAr: string;
  orderId: number;
  statusId: number;
  deletedAt: string | null;
}

interface ReturnOrderFormData {
  date: string;
  reason: string;
  reasonAr: string;
  orderId: number;
  statusId: number;
  returnItemDtos: ReturnItem[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ReturnOrderListResponse {
  data: ReturnOrder[];
  pagination: Pagination;
}

interface ApiResponse<T> {
  statusCode: number;
  isSuccess: boolean;
  data: T;
  message: string;
}

const columnHelper = createColumnHelper<ReturnOrder>();

const ReturnsOrders = () => {
  // State
  const [page] = useState(1);
  const limit = 10;
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [isOpenView, setIsOpenView] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [selectedReturnOrderId, setSelectedReturnOrderId] = useState<
    string | null
  >(null);
  const [viewReturnOrder, setViewReturnOrder] = useState<ReturnOrder | null>(
    null
  );
  const [formData, setFormData] = useState<ReturnOrderFormData>({
    date: "",
    reason: "",
    reasonAr: "",
    orderId: 0,
    statusId: 0,
    returnItemDtos: [{ numberOfItems: 0, orderItemId: 0 }],
  });

  // API hooks
  const {
    data: returnOrdersData,
    isLoading: isReturnOrdersLoading,
    isError: isReturnOrdersError,
  } = useGetAllreturnsOrderQuery({ page, limit });
  const [createReturnOrder, { isLoading: isCreating }] =
    useCreateReturnOrderMutation();
  const [deleteReturnOrder, { isLoading: isDeleting }] =
    useDeleteReturnOrderMutation();

  // Table data
  const tableData = useMemo(() => {
    if (returnOrdersData?.isSuccess && Array.isArray(returnOrdersData?.data)) {
      return returnOrdersData.data;
    }
    return [];
  }, [returnOrdersData]);

  // Handle Create popup
  const handleOpenCreate = () => {
    setFormData({
      date: "",
      reason: "",
      reasonAr: "",
      orderId: 0,
      statusId: 0,
      returnItemDtos: [{ numberOfItems: 0, orderItemId: 0 }],
    });
    setIsOpenCreate(true);
  };

  const handleCloseCreate = () => setIsOpenCreate(false);

  // Handle View popup
  const handleOpenView = (returnOrder: ReturnOrder) => {
    setViewReturnOrder(returnOrder);
    setIsOpenView(true);
  };

  const handleCloseView = () => {
    setIsOpenView(false);
    setViewReturnOrder(null);
  };

  // Handle Delete popup
  const handleOpenDelete = (returnOrderId: string) => {
    setSelectedReturnOrderId(returnOrderId);
    setIsOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setIsOpenDelete(false);
    setSelectedReturnOrderId(null);
  };

  // Handle Create submission
  const handleCreateSubmit = async () => {
    if (
      !formData.date ||
      !formData.reason ||
      !formData.reasonAr ||
      formData.orderId <= 0 ||
      formData.statusId <= 0 ||
      formData.returnItemDtos.length === 0 ||
      formData.returnItemDtos.some(
        (item) => item.numberOfItems <= 0 || item.orderItemId <= 0
      )
    ) {
      showToast({
        type: false,
        message: "Please fill all required fields with valid values",
      });
      return;
    }

    try {
      const response = await createReturnOrder({
        date: formData.date,
        reason: formData.reason,
        reasonAr: formData.reasonAr,
        orderId: formData.orderId,
        statusId: formData.statusId,
        returnItemDtos: formData.returnItemDtos,
      }).unwrap();
      showToast({
        type: true,
        message: response.message || "Return order created successfully",
      });
      handleCloseCreate();
    } catch (error: any) {
      showToast({
        type: false,
        message: error?.data?.message || "Failed to create return order",
      });
    }
  };

  // Handle Delete submission
  const handleDeleteSubmit = async () => {
    if (!selectedReturnOrderId) {
      showToast({ type: false, message: "No return order selected" });
      return;
    }

    try {
      const response = await deleteReturnOrder({
        id: selectedReturnOrderId,
      }).unwrap();
      showToast({
        type: true,
        message: response.message || "Return order deleted successfully",
      });
      handleCloseDelete();
    } catch (error: any) {
      showToast({
        type: false,
        message: error?.data?.message || "Failed to delete return order",
      });
    }
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
  const columns = useMemo<ColumnDef<ReturnOrder>[]>(
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
        header: "Date",
        accessorKey: "date",
      },
      {
        header: "Reason (EN)",
        accessorKey: "reason",
      },
      {
        header: "Reason (AR)",
        accessorKey: "reasonAr",
      },
      {
        header: "Order ID",
        accessorKey: "orderId",
      },
      {
        header: "Status ID",
        accessorKey: "statusId",
      },
      {
        header: "Status",
        accessorKey: "deletedAt",
        cell: ({ row }) => (
          <Chip
            label={
              row.original.deletedAt
                ? "Deleted"
                : row.original.statusId === 1
                ? "Pending"
                : "Processed"
            }
            color={
              row.original.deletedAt
                ? "error"
                : row.original.statusId === 1
                ? "warning"
                : "success"
            }
            size="small"
          />
        ),
      },
      {
        header: "Action",
        accessorKey: "action",
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
                  <VisibilityIcon sx={{ mr: 1 }} /> View
                </MenuItem>
                {!row.original.deletedAt && (
                  <MenuItem
                    onClick={() => {
                      handleOpenDelete(row.original.id.toString());
                      handleMenuClose();
                    }}
                  >
                    <DeleteIcon sx={{ mr: 1 }} /> Delete
                  </MenuItem>
                )}
              </Menu>
            </>
          );
        },
      },
    ],
    []
  );

  if (isReturnOrdersLoading) return <TableSkeleton rows={10} columns={8} />;
  if (isReturnOrdersError)
    return <Typography>Error loading return orders</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5"></Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
        >
          Add Return Order
        </Button>
      </Box>
      <SharedTable
        columns={columns}
        data={tableData}
        LoadingData={isReturnOrdersLoading}
      />

      {/* Create Return Order Popup */}
      <CustomPopup
        handleClose={handleCloseCreate}
        isOpen={isOpenCreate}
        content={
          <Box sx={{ p: 3, maxHeight: "90vh", overflowY: "auto" }}>
            <Typography variant="h6" mb={2}>
              Create Return Order
            </Typography>
            <TextField
              label="Date"
              fullWidth
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="Reason (EN)"
              fullWidth
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              label="Reason (AR)"
              fullWidth
              value={formData.reasonAr}
              onChange={(e) =>
                setFormData({ ...formData, reasonAr: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              label="Order ID"
              fullWidth
              type="number"
              value={formData.orderId}
              onChange={(e) =>
                setFormData({ ...formData, orderId: parseInt(e.target.value) })
              }
              margin="normal"
              required
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Status ID"
              fullWidth
              type="number"
              value={formData.statusId}
              onChange={(e) =>
                setFormData({ ...formData, statusId: parseInt(e.target.value) })
              }
              margin="normal"
              required
              inputProps={{ min: 0 }}
            />
            {formData.returnItemDtos.map((item, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="subtitle1">Item {index + 1}</Typography>
                <TextField
                  label="Order Item ID"
                  fullWidth
                  type="number"
                  value={item.orderItemId}
                  onChange={(e) => {
                    const newItems = [...formData.returnItemDtos];
                    newItems[index].orderItemId = parseInt(e.target.value);
                    setFormData({ ...formData, returnItemDtos: newItems });
                  }}
                  margin="normal"
                  required
                  inputProps={{ min: 0 }}
                />
                <TextField
                  label="Number of Items"
                  fullWidth
                  type="number"
                  value={item.numberOfItems}
                  onChange={(e) => {
                    const newItems = [...formData.returnItemDtos];
                    newItems[index].numberOfItems = parseInt(e.target.value);
                    setFormData({ ...formData, returnItemDtos: newItems });
                  }}
                  margin="normal"
                  required
                  inputProps={{ min: 0 }}
                />
                <Button
                  onClick={() => {
                    const newItems = formData.returnItemDtos.filter(
                      (_, i) => i !== index
                    );
                    setFormData({ ...formData, returnItemDtos: newItems });
                  }}
                  color="error"
                >
                  Remove Item
                </Button>
              </Box>
            ))}
            <Button
              onClick={() =>
                setFormData({
                  ...formData,
                  returnItemDtos: [
                    ...formData.returnItemDtos,
                    { numberOfItems: 0, orderItemId: 0 },
                  ],
                })
              }
              variant="outlined"
              sx={{ mb: 2 }}
            >
              Add Item
            </Button>
            <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
              <Button onClick={handleCloseCreate}>Cancel</Button>
              <Button
                onClick={handleCreateSubmit}
                variant="contained"
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : "Create Return Order"}
              </Button>
            </Box>
          </Box>
        }
      />

      {/* View Return Order Popup */}
      <CustomPopup
        handleClose={handleCloseView}
        isOpen={isOpenView}
        content={
          <Box sx={{ p: 3, maxHeight: "90vh", overflowY: "auto" }}>
            <Typography variant="h6" mb={2}>
              Return Order Details
            </Typography>
            {viewReturnOrder && (
              <>
                <TextField
                  label="ID"
                  fullWidth
                  value={viewReturnOrder.id}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Date"
                  fullWidth
                  value={viewReturnOrder.date}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Reason (EN)"
                  fullWidth
                  value={viewReturnOrder.reason}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Reason (AR)"
                  fullWidth
                  value={viewReturnOrder.reasonAr}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Order ID"
                  fullWidth
                  value={viewReturnOrder.orderId}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Status ID"
                  fullWidth
                  value={viewReturnOrder.statusId}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Status"
                  fullWidth
                  value={
                    viewReturnOrder.deletedAt
                      ? "Deleted"
                      : viewReturnOrder.statusId === 1
                      ? "Pending"
                      : "Processed"
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

      {/* Delete Return Order Popup */}
      <CustomPopup
        handleClose={handleCloseDelete}
        isOpen={isOpenDelete}
        content={
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
              Are you sure you want to delete this return order?
            </Typography>
            <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
              <Button onClick={handleCloseDelete}>Cancel</Button>
              <Button
                onClick={handleDeleteSubmit}
                variant="contained"
                color="error"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Return Order"}
              </Button>
            </Box>
          </Box>
        }
      />
    </Box>
  );
};

export default ReturnsOrders;
