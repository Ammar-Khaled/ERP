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
  CircularProgress,
} from "@mui/material";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import AddIcon from "@mui/icons-material/Add";
import CustomCheckbox from "@/app/components/forms/theme-elements/CustomCheckbox";
import SharedTable from "@/app/components/tables/DynamicTable";
import TableSkeleton from "@/app/components/TableSkeleton";
import { CustomPopup } from "@/utils/CustomPopup";
import { showToast } from "@/utils/ToastNotifications";
import {
  useGetAllOrderQuery,
  useCreateOrderMutation,
  useDeleteOrderMutation,
  usePrintOrderPDFQuery,
} from "@/store/slice/ordersApiSlice";

// Types
interface OrderItem {
  numberOfItems: number;
  productItemId: number;
}

interface Order {
  id: number;
  totalPrice: number;
  date: any; // Adjust based on actual date format
  deletedAt: string | null;
  branchId: number;
  inventoryId: number;
  userId: number;
  clientId: number;
  statusId: number;
  couponId: number | null;
  currencyId: number;
}

interface OrderFormData {
  date: string;
  inventoryId: number;
  clientId: number;
  couponId: number | null;
  currencyId: number;
  items: OrderItem[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface OrderListResponse {
  data: Order[];
  pagination: Pagination;
}

interface ApiResponse<T> {
  statusCode: number;
  isSuccess: boolean;
  data: T;
  message: string;
}

const columnHelper = createColumnHelper<Order>();

const ViewOrders = () => {
  // State
  const [page] = useState(1);
  const limit = 10;
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [isOpenView, setIsOpenView] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState<OrderFormData>({
    date: "",
    inventoryId: 0,
    clientId: 0,
    couponId: null,
    currencyId: 0,
    items: [{ numberOfItems: 0, productItemId: 0 }],
  });

  // API hooks
  const {
    data: ordersData,
    isLoading: isOrdersLoading,
    isError: isOrdersError,
  } = useGetAllOrderQuery({ page, limit });
  const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation();
  const [deleteOrder, { isLoading: isDeleting }] = useDeleteOrderMutation();

  // Table data
  const tableData = useMemo(() => {
    if (ordersData?.isSuccess && ordersData?.data?.data) {
      return ordersData.data.data;
    }
    return [];
  }, [ordersData]);

  // Handle Create popup
  const handleOpenCreate = () => {
    setFormData({
      date: "",
      inventoryId: 0,
      clientId: 0,
      couponId: null,
      currencyId: 0,
      items: [{ numberOfItems: 0, productItemId: 0 }],
    });
    setIsOpenCreate(true);
  };

  const handleCloseCreate = () => setIsOpenCreate(false);

  // Handle View popup
  const handleOpenView = (order: Order) => {
    setViewOrder(order);
    setIsOpenView(true);
  };

  const handleCloseView = () => {
    setIsOpenView(false);
    setViewOrder(null);
  };

  // Handle Delete popup
  const handleOpenDelete = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setIsOpenDelete(false);
    setSelectedOrderId(null);
  };

  // Handle Create submission
  const handleCreateSubmit = async () => {
    if (
      !formData.date ||
      formData.inventoryId <= 0 ||
      formData.clientId <= 0 ||
      formData.currencyId <= 0 ||
      formData.items.length === 0 ||
      formData.items.some(
        (item) => item.numberOfItems <= 0 || item.productItemId <= 0
      )
    ) {
      showToast({
        type: false,
        message: "Please fill all required fields with valid values",
      });
      return;
    }

    try {
      const response = await createOrder({
        date: formData.date,
        inventoryId: formData.inventoryId,
        clientId: formData.clientId,
        couponId: formData.couponId,
        currencyId: formData.currencyId,
        items: formData.items,
      }).unwrap();
      showToast({
        type: true,
        message: response.message || "Order created successfully",
      });
      handleCloseCreate();
    } catch (error: any) {
      showToast({
        type: false,
        message: error?.data?.message || "Failed to create order",
      });
    }
  };

  // Handle Delete submission
  const handleDeleteSubmit = async () => {
    if (!selectedOrderId) {
      showToast({ type: false, message: "No order selected" });
      return;
    }

    try {
      const response = await deleteOrder({ id: selectedOrderId }).unwrap();
      showToast({
        type: true,
        message: response.message || "Order deleted successfully",
      });
      handleCloseDelete();
    } catch (error: any) {
      showToast({
        type: false,
        message: error?.data?.message || "Failed to delete order",
      });
    }
  };

  // Handle PDF download
  const handlePrintPDF = (orderId: string) => {
    const { data, isLoading, isError } = usePrintOrderPDFQuery({ id: orderId });
    if (isLoading) {
      showToast({ type: false, message: "Generating PDF..." });
      return;
    }
    if (isError || !data?.isSuccess) {
      showToast({ type: false, message: "Failed to generate PDF" });
      return;
    }
    // Assuming the API returns a URL or base64 string for the PDF
    const pdfUrl =
      data?.data?.url || `data:application/pdf;base64,${data?.data}`;
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `order_${orderId}.pdf`;
    link.click();
    showToast({ type: true, message: "PDF downloaded successfully" });
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
  const columns = useMemo<ColumnDef<Order>[]>(
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
        header: "Total Price",
        accessorKey: "totalPrice",
      },
      {
        header: "Branch ID",
        accessorKey: "branchId",
      },
      {
        header: "Inventory ID",
        accessorKey: "inventoryId",
      },
      {
        header: "User ID",
        accessorKey: "userId",
      },
      {
        header: "Client ID",
        accessorKey: "clientId",
      },
      {
        header: "Status ID",
        accessorKey: "statusId",
      },
      {
        header: "Coupon ID",
        accessorKey: "couponId",
        cell: ({ row }) => (
          <Typography>{row.original.couponId || "N/A"}</Typography>
        ),
      },
      {
        header: "Currency ID",
        accessorKey: "currencyId",
      },
      {
        header: "Status",
        accessorKey: "deletedAt",
        cell: ({ row }) => (
          <Chip
            label={row.original.deletedAt ? "Deleted" : "Active"}
            color={row.original.deletedAt ? "error" : "success"}
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
                {/* <MenuItem
                  onClick={() => {
                    handleOpenView(row.original);
                    handleMenuClose();
                  }}
                >
                  <VisibilityIcon sx={{ mr: 1 }} /> View
                </MenuItem> */}
                <MenuItem
                  onClick={() => {
                    handlePrintPDF(row.original.id.toString());
                    handleMenuClose();
                  }}
                >
                  <PictureAsPdfIcon sx={{ mr: 1 }} /> Print PDF
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleOpenDelete(row.original.id.toString());
                    handleMenuClose();
                  }}
                >
                  <DeleteIcon sx={{ mr: 1 }} /> Delete
                </MenuItem>
              </Menu>
            </>
          );
        },
      },
    ],
    []
  );

  if (isOrdersLoading) return <TableSkeleton rows={10} columns={11} />;
  if (isOrdersError) return <Typography>Error loading orders</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      {/* <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">Orders</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
        >
          Add Order
        </Button>
      </Box> */}
      <SharedTable
        columns={columns}
        data={tableData}
        LoadingData={isOrdersLoading}
      />

      {/* Create Order Popup */}
      <CustomPopup
        handleClose={handleCloseCreate}
        isOpen={isOpenCreate}
        content={
          <Box sx={{ p: 3, maxHeight: "90vh", overflowY: "auto" }}>
            <Typography variant="h6" mb={2}>
              Create Order
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
              label="Inventory ID"
              fullWidth
              type="number"
              value={formData.inventoryId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  inventoryId: parseInt(e.target.value),
                })
              }
              margin="normal"
              required
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Client ID"
              fullWidth
              type="number"
              value={formData.clientId}
              onChange={(e) =>
                setFormData({ ...formData, clientId: parseInt(e.target.value) })
              }
              margin="normal"
              required
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Coupon ID (Optional)"
              fullWidth
              type="number"
              value={formData.couponId || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  couponId: e.target.value ? parseInt(e.target.value) : null,
                })
              }
              margin="normal"
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Currency ID"
              fullWidth
              type="number"
              value={formData.currencyId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  currencyId: parseInt(e.target.value),
                })
              }
              margin="normal"
              required
              inputProps={{ min: 0 }}
            />
            {formData.items.map((item, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="subtitle1">Item {index + 1}</Typography>
                <TextField
                  label="Product Item ID"
                  fullWidth
                  type="number"
                  value={item.productItemId}
                  onChange={(e) => {
                    const newItems = [...formData.items];
                    newItems[index].productItemId = parseInt(e.target.value);
                    setFormData({ ...formData, items: newItems });
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
                    const newItems = [...formData.items];
                    newItems[index].numberOfItems = parseInt(e.target.value);
                    setFormData({ ...formData, items: newItems });
                  }}
                  margin="normal"
                  required
                  inputProps={{ min: 0 }}
                />
                <Button
                  onClick={() => {
                    const newItems = formData.items.filter(
                      (_, i) => i !== index
                    );
                    setFormData({ ...formData, items: newItems });
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
                  items: [
                    ...formData.items,
                    { numberOfItems: 0, productItemId: 0 },
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
                {isCreating ? "Creating..." : "Create Order"}
              </Button>
            </Box>
          </Box>
        }
      />

      {/* View Order Popup */}
      <CustomPopup
        handleClose={handleCloseView}
        isOpen={isOpenView}
        content={
          <Box sx={{ p: 3, maxHeight: "90vh", overflowY: "auto" }}>
            <Typography variant="h6" mb={2}>
              Order Details
            </Typography>
            {viewOrder && (
              <>
                <TextField
                  label="ID"
                  fullWidth
                  value={viewOrder.id}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Total Price"
                  fullWidth
                  value={viewOrder.totalPrice}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Branch ID"
                  fullWidth
                  value={viewOrder.branchId}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Inventory ID"
                  fullWidth
                  value={viewOrder.inventoryId}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="User ID"
                  fullWidth
                  value={viewOrder.userId}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Client ID"
                  fullWidth
                  value={viewOrder.clientId}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Status ID"
                  fullWidth
                  value={viewOrder.statusId}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Coupon ID"
                  fullWidth
                  value={viewOrder.couponId || "N/A"}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Currency ID"
                  fullWidth
                  value={viewOrder.currencyId}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Status"
                  fullWidth
                  value={viewOrder.deletedAt ? "Deleted" : "Active"}
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

      {/* Delete Order Popup */}
      <CustomPopup
        handleClose={handleCloseDelete}
        isOpen={isOpenDelete}
        content={
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
              Are you sure you want to delete this order?
            </Typography>
            <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
              <Button onClick={handleCloseDelete}>Cancel</Button>
              <Button
                onClick={handleDeleteSubmit}
                variant="contained"
                color="error"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Order"}
              </Button>
            </Box>
          </Box>
        }
      />
    </Box>
  );
};

export default ViewOrders;
