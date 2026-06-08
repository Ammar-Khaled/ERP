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
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import CustomCheckbox from "@/app/components/forms/theme-elements/CustomCheckbox";
import SharedTable from "@/app/components/tables/DynamicTable";
import TableSkeleton from "@/app/components/TableSkeleton";
import { CustomPopup } from "@/utils/CustomPopup";
import { showToast } from "@/utils/ToastNotifications";
import {
  useGetAllpurchaseQuery,
  useCreatePurchaseMutation,
  useCancelPurchaseMutation,
  useApprovePurchaseMutation,
  useDeletePurchaseMutation,
  usePrintPurchasePDFQuery,
} from "@/store/slice/purchaseRequest";
import { useSession } from "next-auth/react";

// Types
interface PurchaseItem {
  purchaseEntityName: string;
  numberOfItems: number;
  discount: number;
}

interface Purchase {
  id: number;
  date: any; // Adjust based on actual date format
  totalPrice: string;
  userId: number;
  branchId: number;
  supplierId: number;
  statusId: number;
  currencyId: number;
  deletedAt: string | null;
  reviewerId: number | null;
  reviewNotes: string | null;
  inventoryId: number;
  invoiceNo: string | null;
}

interface PurchaseFormData {
  date: string;
  supplierId: number;
  currencyId: number;
  inventoryId: number;
  purchaseItemsDtos: PurchaseItem[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface PurchaseListResponse {
  data: Purchase[];
  pagination: Pagination;
}

interface ApiResponse<T> {
  statusCode: number;
  isSuccess: boolean;
  data: T;
  message: string;
}

const columnHelper = createColumnHelper<Purchase>();

const ViewPurchases = () => {
  // State
  const [page] = useState(1);
  const limit = 10;
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [isOpenView, setIsOpenView] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [isOpenCancel, setIsOpenCancel] = useState(false);
  const [isOpenApprove, setIsOpenApprove] = useState(false);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(
    null
  );
  const [viewPurchase, setViewPurchase] = useState<Purchase | null>(null);
  const [formData, setFormData] = useState<PurchaseFormData>({
    date: "",
    supplierId: 0,
    currencyId: 0,
    inventoryId: 0,
    purchaseItemsDtos: [
      { purchaseEntityName: "", numberOfItems: 0, discount: 0 },
    ],
  });

  // API hooks
  const {
    data: purchasesData,
    isLoading: isPurchasesLoading,
    isError: isPurchasesError,
  } = useGetAllpurchaseQuery({ page, limit });
  const [createPurchase, { isLoading: isCreating }] =
    useCreatePurchaseMutation();
  const [cancelPurchase, { isLoading: isCanceling }] =
    useCancelPurchaseMutation();
  const [approvePurchase, { isLoading: isApproving }] =
    useApprovePurchaseMutation();
  const [deletePurchase, { isLoading: isDeleting }] =
    useDeletePurchaseMutation();

  // Table data
  const tableData = useMemo(() => {
    if (purchasesData?.isSuccess && purchasesData?.data?.data) {
      return purchasesData.data.data;
    }
    return [];
  }, [purchasesData]);

  // Handle Create popup
  const handleOpenCreate = () => {
    setFormData({
      date: "",
      supplierId: 0,
      currencyId: 0,
      inventoryId: 0,
      purchaseItemsDtos: [
        { purchaseEntityName: "", numberOfItems: 0, discount: 0 },
      ],
    });
    setIsOpenCreate(true);
  };

  const handleCloseCreate = () => setIsOpenCreate(false);

  // Handle View popup
  const handleOpenView = (purchase: Purchase) => {
    setViewPurchase(purchase);
    setIsOpenView(true);
  };

  const handleCloseView = () => {
    setIsOpenView(false);
    setViewPurchase(null);
  };

  // Handle Delete popup
  const handleOpenDelete = (purchaseId: string) => {
    setSelectedPurchaseId(purchaseId);
    setIsOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setIsOpenDelete(false);
    setSelectedPurchaseId(null);
  };

  // Handle Cancel popup
  const handleOpenCancel = (purchaseId: string) => {
    setSelectedPurchaseId(purchaseId);
    setIsOpenCancel(true);
  };

  const handleCloseCancel = () => {
    setIsOpenCancel(false);
    setSelectedPurchaseId(null);
  };

  // Handle Approve popup
  const handleOpenApprove = (purchaseId: string) => {
    setSelectedPurchaseId(purchaseId);
    setIsOpenApprove(true);
  };

  const handleCloseApprove = () => {
    setIsOpenApprove(false);
    setSelectedPurchaseId(null);
  };

  // Handle Create submission
  const handleCreateSubmit = async () => {
    if (
      !formData.date ||
      formData.supplierId <= 0 ||
      formData.currencyId <= 0 ||
      formData.inventoryId <= 0 ||
      formData.purchaseItemsDtos.length === 0 ||
      formData.purchaseItemsDtos.some(
        (item) => !item.purchaseEntityName || item.numberOfItems <= 0
      )
    ) {
      showToast({
        type: false,
        message: "Please fill all required fields with valid values",
      });
      return;
    }

    try {
      const response = await createPurchase({
        date: formData.date,
        supplierId: formData.supplierId,
        currencyId: formData.currencyId,
        inventoryId: formData.inventoryId,
        purchaseItemsDtos: formData.purchaseItemsDtos,
      }).unwrap();
      showToast({
        type: true,
        message: response.message || "Purchase request created successfully",
      });
      handleCloseCreate();
    } catch (error: any) {
      showToast({
        type: false,
        message: error?.data?.message || "Failed to create purchase request",
      });
    }
  };

  const session = useSession();

  // Handle Cancel submission
  const handleCancelSubmit = async () => {
    if (!selectedPurchaseId) {
      showToast({ type: false, message: "No purchase request selected" });
      return;
    }

    try {
      const response = await cancelPurchase({
        id: selectedPurchaseId,
      }).unwrap();
      showToast({
        type: true,
        message: response.message || "Purchase request canceled successfully",
      });
      handleCloseCancel();
    } catch (error: any) {
      showToast({
        type: false,
        message: error?.data?.message || "Failed to cancel purchase request",
      });
    }
  };

  // Handle Approve submission
  const handleApproveSubmit = async () => {
    if (!selectedPurchaseId) {
      showToast({ type: false, message: "No purchase request selected" });
      return;
    }

    try {
      const response = await approvePurchase({
        id: selectedPurchaseId,
        userId: session.data?.user?.userId || 0, // Assuming user ID is available in session
      }).unwrap();
      showToast({
        type: true,
        message: response.message || "Purchase request approved successfully",
      });
      handleCloseApprove();
    } catch (error: any) {
      showToast({
        type: false,
        message: error?.data?.message || "Failed to approve purchase request",
      });
    }
  };

  // Handle Delete submission
  const handleDeleteSubmit = async () => {
    if (!selectedPurchaseId) {
      showToast({ type: false, message: "No purchase request selected" });
      return;
    }

    try {
      const response = await deletePurchase({
        id: selectedPurchaseId,
      }).unwrap();
      showToast({
        type: true,
        message: response.message || "Purchase request deleted successfully",
      });
      handleCloseDelete();
    } catch (error: any) {
      showToast({
        type: false,
        message: error?.data?.message || "Failed to delete purchase request",
      });
    }
  };

  // Handle PDF download
  const handlePrintPDF = (purchaseId: string) => {
    const { data, isLoading, isError } = usePrintPurchasePDFQuery({
      id: purchaseId,
    });
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
    link.download = `purchase_${purchaseId}.pdf`;
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
  const columns = useMemo<ColumnDef<Purchase>[]>(
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
        header: "User ID",
        accessorKey: "userId",
      },
      {
        header: "Branch ID",
        accessorKey: "branchId",
      },
      {
        header: "Supplier ID",
        accessorKey: "supplierId",
      },
      {
        header: "Status ID",
        accessorKey: "statusId",
      },
      {
        header: "Currency ID",
        accessorKey: "currencyId",
      },
      {
        header: "Inventory ID",
        accessorKey: "inventoryId",
      },
      {
        header: "Invoice No",
        accessorKey: "invoiceNo",
        cell: ({ row }) => (
          <Typography>{row.original.invoiceNo || "N/A"}</Typography>
        ),
      },
      {
        header: "Reviewer ID",
        accessorKey: "reviewerId",
        cell: ({ row }) => (
          <Typography>{row.original.reviewerId || "N/A"}</Typography>
        ),
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
                : row.original.reviewerId
                ? "Reviewed"
                : "Active"
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
                <MenuItem
                  onClick={() => {
                    handlePrintPDF(row.original.id.toString());
                    handleMenuClose();
                  }}
                >
                  <PictureAsPdfIcon sx={{ mr: 1 }} /> Print PDF
                </MenuItem>
                {row.original.statusId === 1 && !row.original.deletedAt && (
                  <>
                    <MenuItem
                      onClick={() => {
                        handleOpenApprove(row.original.id.toString());
                        handleMenuClose();
                      }}
                    >
                      <CheckCircleIcon sx={{ mr: 1 }} /> Approve
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleOpenCancel(row.original.id.toString());
                        handleMenuClose();
                      }}
                    >
                      <CancelIcon sx={{ mr: 1 }} /> Cancel
                    </MenuItem>
                  </>
                )}
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

  if (isPurchasesLoading) return <TableSkeleton rows={10} columns={12} />;
  if (isPurchasesError) return <Typography>Error loading purchases</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5"></Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
        >
          Add Purchase Request
        </Button>
      </Box>
      <SharedTable
        columns={columns}
        data={tableData}
        LoadingData={isPurchasesLoading}
      />

      {/* Create Purchase Popup */}
      <CustomPopup
        handleClose={handleCloseCreate}
        isOpen={isOpenCreate}
        content={
          <Box sx={{ p: 3, maxHeight: "90vh", overflowY: "auto" }}>
            <Typography variant="h6" mb={2}>
              Create Purchase Request
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
              label="Supplier ID"
              fullWidth
              type="number"
              value={formData.supplierId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  supplierId: parseInt(e.target.value),
                })
              }
              margin="normal"
              required
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
            {formData.purchaseItemsDtos.map((item, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="subtitle1">Item {index + 1}</Typography>
                <TextField
                  label="Purchase Entity Name"
                  fullWidth
                  value={item.purchaseEntityName}
                  onChange={(e) => {
                    const newItems = [...formData.purchaseItemsDtos];
                    newItems[index].purchaseEntityName = e.target.value;
                    setFormData({ ...formData, purchaseItemsDtos: newItems });
                  }}
                  margin="normal"
                  required
                />
                <TextField
                  label="Number of Items"
                  fullWidth
                  type="number"
                  value={item.numberOfItems}
                  onChange={(e) => {
                    const newItems = [...formData.purchaseItemsDtos];
                    newItems[index].numberOfItems = parseInt(e.target.value);
                    setFormData({ ...formData, purchaseItemsDtos: newItems });
                  }}
                  margin="normal"
                  required
                  inputProps={{ min: 0 }}
                />
                <TextField
                  label="Discount"
                  fullWidth
                  type="number"
                  value={item.discount}
                  onChange={(e) => {
                    const newItems = [...formData.purchaseItemsDtos];
                    newItems[index].discount = parseFloat(e.target.value);
                    setFormData({ ...formData, purchaseItemsDtos: newItems });
                  }}
                  margin="normal"
                  required
                  inputProps={{ min: 0, step: 0.1 }}
                />
                <Button
                  onClick={() => {
                    const newItems = formData.purchaseItemsDtos.filter(
                      (_, i) => i !== index
                    );
                    setFormData({ ...formData, purchaseItemsDtos: newItems });
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
                  purchaseItemsDtos: [
                    ...formData.purchaseItemsDtos,
                    { purchaseEntityName: "", numberOfItems: 0, discount: 0 },
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
                {isCreating ? "Creating..." : "Create Purchase Request"}
              </Button>
            </Box>
          </Box>
        }
      />

      {/* View Purchase Popup */}
      <CustomPopup
        handleClose={handleCloseView}
        isOpen={isOpenView}
        content={
          <Box sx={{ p: 3, maxHeight: "90vh", overflowY: "auto" }}>
            <Typography variant="h6" mb={2}>
              Purchase Request Details
            </Typography>
            {viewPurchase && (
              <>
                <TextField
                  label="ID"
                  fullWidth
                  value={viewPurchase.id}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Total Price"
                  fullWidth
                  value={viewPurchase.totalPrice}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="User ID"
                  fullWidth
                  value={viewPurchase.userId}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Branch ID"
                  fullWidth
                  value={viewPurchase.branchId}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Supplier ID"
                  fullWidth
                  value={viewPurchase.supplierId}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Status ID"
                  fullWidth
                  value={viewPurchase.statusId}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Currency ID"
                  fullWidth
                  value={viewPurchase.currencyId}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Inventory ID"
                  fullWidth
                  value={viewPurchase.inventoryId}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Invoice No"
                  fullWidth
                  value={viewPurchase.invoiceNo || "N/A"}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Reviewer ID"
                  fullWidth
                  value={viewPurchase.reviewerId || "N/A"}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Review Notes"
                  fullWidth
                  value={viewPurchase.reviewNotes || "N/A"}
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Status"
                  fullWidth
                  value={
                    viewPurchase.deletedAt
                      ? "Deleted"
                      : viewPurchase.statusId === 1
                      ? "Pending"
                      : viewPurchase.reviewerId
                      ? "Reviewed"
                      : "Active"
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

      {/* Delete Purchase Popup */}
      <CustomPopup
        handleClose={handleCloseDelete}
        isOpen={isOpenDelete}
        content={
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
              Are you sure you want to delete this purchase request?
            </Typography>
            <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
              <Button onClick={handleCloseDelete}>Cancel</Button>
              <Button
                onClick={handleDeleteSubmit}
                variant="contained"
                color="error"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Purchase Request"}
              </Button>
            </Box>
          </Box>
        }
      />

      {/* Cancel Purchase Popup */}
      <CustomPopup
        handleClose={handleCloseCancel}
        isOpen={isOpenCancel}
        content={
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
              Are you sure you want to cancel this purchase request?
            </Typography>
            <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
              <Button onClick={handleCloseCancel}>Cancel</Button>
              <Button
                onClick={handleCancelSubmit}
                variant="contained"
                color="error"
                disabled={isCanceling}
              >
                {isCanceling ? "Canceling..." : "Cancel Purchase Request"}
              </Button>
            </Box>
          </Box>
        }
      />

      {/* Approve Purchase Popup */}
      <CustomPopup
        handleClose={handleCloseApprove}
        isOpen={isOpenApprove}
        content={
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
              Are you sure you want to approve this purchase request?
            </Typography>
            <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
              <Button onClick={handleCloseApprove}>Cancel</Button>
              <Button
                onClick={handleApproveSubmit}
                variant="contained"
                color="success"
                disabled={isApproving}
              >
                {isApproving ? "Approving..." : "Approve Purchase Request"}
              </Button>
            </Box>
          </Box>
        }
      />
    </Box>
  );
};

export default ViewPurchases;
