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
  useGetAllreturnsPurchasesQuery,
  useCreateReturnPurchasesMutation,
  useDeleteReturnPurchasesMutation,
} from "@/store/slice/returnPurchesApiSlice";

// Types
interface ReturnPurchaseItem {
  purchaseItemId: number;
  numberOfReturned: number;
}

interface ReturnPurchase {
  id: number;
  date: string;
  reason: string;
  reasonAr: string;
  purchaseRequestId: number;
  statusId: number;
  deletedAt: string | null;
}

interface ReturnPurchaseFormData {
  date: string;
  reason: string;
  reasonAr: string;
  purchaseRequestId: number;
  statusId: number;
  returnPurchaseItemDtos: ReturnPurchaseItem[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ReturnPurchaseListResponse {
  data: ReturnPurchase[];
  pagination: Pagination;
}

interface ApiResponse<T> {
  statusCode: number;
  isSuccess: boolean;
  data: T;
  message: string;
}

const columnHelper = createColumnHelper<ReturnPurchase>();

const ReturnsPurchases = () => {
  // State
  const [page] = useState(1);
  const limit = 10;
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [isOpenView, setIsOpenView] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [selectedReturnPurchaseId, setSelectedReturnPurchaseId] = useState<
    string | null
  >(null);
  const [viewReturnPurchase, setViewReturnPurchase] =
    useState<ReturnPurchase | null>(null);
  const [formData, setFormData] = useState<ReturnPurchaseFormData>({
    date: "",
    reason: "",
    reasonAr: "",
    purchaseRequestId: 0,
    statusId: 0,
    returnPurchaseItemDtos: [{ purchaseItemId: 0, numberOfReturned: 0 }],
  });

  // API hooks
  const {
    data: returnPurchasesData,
    isLoading: isReturnPurchasesLoading,
    isError: isReturnPurchasesError,
  } = useGetAllreturnsPurchasesQuery({ page, limit });
  const [createReturnPurchases, { isLoading: isCreating }] =
    useCreateReturnPurchasesMutation();
  const [deleteReturnPurchases, { isLoading: isDeleting }] =
    useDeleteReturnPurchasesMutation();

  // Table data
  const tableData = useMemo(() => {
    if (
      returnPurchasesData?.isSuccess &&
      Array.isArray(returnPurchasesData?.data)
    ) {
      return returnPurchasesData.data;
    }
    return [];
  }, [returnPurchasesData]);

  // Handle Create popup
  const handleOpenCreate = () => {
    setFormData({
      date: "",
      reason: "",
      reasonAr: "",
      purchaseRequestId: 0,
      statusId: 0,
      returnPurchaseItemDtos: [{ purchaseItemId: 0, numberOfReturned: 0 }],
    });
    setIsOpenCreate(true);
  };

  const handleCloseCreate = () => setIsOpenCreate(false);

  // Handle View popup
  const handleOpenView = (returnPurchase: ReturnPurchase) => {
    setViewReturnPurchase(returnPurchase);
    setIsOpenView(true);
  };

  const handleCloseView = () => {
    setIsOpenView(false);
    setViewReturnPurchase(null);
  };

  // Handle Delete popup
  const handleOpenDelete = (returnPurchaseId: string) => {
    setSelectedReturnPurchaseId(returnPurchaseId);
    setIsOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setIsOpenDelete(false);
    setSelectedReturnPurchaseId(null);
  };

  // Handle Create submission
  const handleCreateSubmit = async () => {
    if (
      !formData.date ||
      !formData.reason ||
      !formData.reasonAr ||
      formData.purchaseRequestId <= 0 ||
      formData.statusId <= 0 ||
      formData.returnPurchaseItemDtos.length === 0 ||
      formData.returnPurchaseItemDtos.some(
        (item) => item.purchaseItemId <= 0 || item.numberOfReturned <= 0
      )
    ) {
      showToast({
        type: false,
        message: "Please fill all required fields with valid values",
      });
      return;
    }

    try {
      const response = await createReturnPurchases({
        date: formData.date,
        reason: formData.reason,
        reasonAr: formData.reasonAr,
        purchaseRequestId: formData.purchaseRequestId,
        statusId: formData.statusId,
        returnPurchaseItemDtos: formData.returnPurchaseItemDtos,
      }).unwrap();
      showToast({
        type: true,
        message: response.message || "Return purchase created successfully",
      });
      handleCloseCreate();
    } catch (error: any) {
      showToast({
        type: false,
        message: error?.data?.message || "Failed to create return purchase",
      });
    }
  };

  // Handle Delete submission
  const handleDeleteSubmit = async () => {
    if (!selectedReturnPurchaseId) {
      showToast({ type: false, message: "No return purchase selected" });
      return;
    }

    try {
      const response = await deleteReturnPurchases({
        id: selectedReturnPurchaseId,
      }).unwrap();
      showToast({
        type: true,
        message: response.message || "Return purchase deleted successfully",
      });
      handleCloseDelete();
    } catch (error: any) {
      showToast({
        type: false,
        message: error?.data?.message || "Failed to delete return purchase",
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
  const columns = useMemo<ColumnDef<ReturnPurchase>[]>(
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
        header: "Purchase Request ID",
        accessorKey: "purchaseRequestId",
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

  if (isReturnPurchasesLoading) return <TableSkeleton rows={10} columns={8} />;
  if (isReturnPurchasesError)
    return <Typography>Error loading return purchases</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5"></Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
        >
          Add Return Purchase
        </Button>
      </Box>
      <SharedTable
        columns={columns}
        data={tableData}
        LoadingData={isReturnPurchasesLoading}
      />

      {/* Create Return Purchase Popup */}
      <CustomPopup
        handleClose={handleCloseCreate}
        isOpen={isOpenCreate}
        content={
          <Box sx={{ p: 3, maxHeight: "90vh", overflowY: "auto" }}>
            <Typography variant="h6" mb={2}>
              Create Return Purchase
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
              label="Purchase Request ID"
              fullWidth
              type="number"
              value={formData.purchaseRequestId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  purchaseRequestId: parseInt(e.target.value),
                })
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
            {formData.returnPurchaseItemDtos.map((item, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="subtitle1">Item {index + 1}</Typography>
                <TextField
                  label="Purchase Item ID"
                  fullWidth
                  type="number"
                  value={item.purchaseItemId}
                  onChange={(e) => {
                    const newItems = [...formData.returnPurchaseItemDtos];
                    newItems[index].purchaseItemId = parseInt(e.target.value);
                    setFormData({
                      ...formData,
                      returnPurchaseItemDtos: newItems,
                    });
                  }}
                  margin="normal"
                  required
                  inputProps={{ min: 0 }}
                />
                <TextField
                  label="Number of Returned Items"
                  fullWidth
                  type="number"
                  value={item.numberOfReturned}
                  onChange={(e) => {
                    const newItems = [...formData.returnPurchaseItemDtos];
                    newItems[index].numberOfReturned = parseInt(e.target.value);
                    setFormData({
                      ...formData,
                      returnPurchaseItemDtos: newItems,
                    });
                  }}
                  margin="normal"
                  required
                  inputProps={{ min: 0 }}
                />
                <Button
                  onClick={() => {
                    const newItems = formData.returnPurchaseItemDtos.filter(
                      (_, i) => i !== index
                    );
                    setFormData({
                      ...formData,
                      returnPurchaseItemDtos: newItems,
                    });
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
                  returnPurchaseItemDtos: [
                    ...formData.returnPurchaseItemDtos,
                    { purchaseItemId: 0, numberOfReturned: 0 },
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
                {isCreating ? "Creating..." : "Create Return Purchase"}
              </Button>
            </Box>
          </Box>
        }
      />

      {/* View Return Purchase Popup */}
      <CustomPopup
        handleClose={handleCloseView}
        isOpen={isOpenView}
        content={
          <Box sx={{ p: 3, maxHeight: "90vh", overflowY: "auto" }}>
            <Typography variant="h6" mb={2}>
              Return Purchase Details
            </Typography>
            {viewReturnPurchase && (
              <>
                <TextField
                  label="ID"
                  fullWidth
                  value={viewReturnPurchase.id}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Date"
                  fullWidth
                  value={viewReturnPurchase.date}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Reason (EN)"
                  fullWidth
                  value={viewReturnPurchase.reason}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Reason (AR)"
                  fullWidth
                  value={viewReturnPurchase.reasonAr}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Purchase Request ID"
                  fullWidth
                  value={viewReturnPurchase.purchaseRequestId}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Status ID"
                  fullWidth
                  value={viewReturnPurchase.statusId}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Status"
                  fullWidth
                  value={
                    viewReturnPurchase.deletedAt
                      ? "Deleted"
                      : viewReturnPurchase.statusId === 1
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

      {/* Delete Return Purchase Popup */}
      <CustomPopup
        handleClose={handleCloseDelete}
        isOpen={isOpenDelete}
        content={
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
              Are you sure you want to delete this return purchase?
            </Typography>
            <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
              <Button onClick={handleCloseDelete}>Cancel</Button>
              <Button
                onClick={handleDeleteSubmit}
                variant="contained"
                color="error"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Return Purchase"}
              </Button>
            </Box>
          </Box>
        }
      />
    </Box>
  );
};

export default ReturnsPurchases;
