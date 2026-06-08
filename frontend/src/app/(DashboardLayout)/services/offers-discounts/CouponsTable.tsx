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
  Switch,
} from "@mui/material";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CustomCheckbox from "@/app/components/forms/theme-elements/CustomCheckbox";
import SharedTable from "@/app/components/tables/DynamicTable";
import TableSkeleton from "@/app/components/TableSkeleton";
import { CustomPopup } from "@/utils/CustomPopup";
import { showToast } from "@/utils/ToastNotifications";
import {
  useGetAllcouponQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} from "@/store/slice/coponsApiSlice";

// Types
interface Coupon {
  id: number;
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  discountPercentage: number;
  maxAllowed: number;
  currentUsage: number;
  numberOfUsageTimePerUser: number;
  minInvoiceTotal: number;
  isActive: boolean;
  deletedAt: string | null;
}

interface CouponFormData {
  id?: string;
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  discountPercentage: number;
  maxAllowed: number;
  numberOfUsageTimePerUser: number;
  minInvoiceTotal: number;
  isActive: boolean;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface CouponListResponse {
  data: Coupon[];
  pagination: Pagination;
}

interface ApiResponse<T> {
  statusCode: number;
  isSuccess: boolean;
  data: T;
  message: string;
}

const columnHelper = createColumnHelper<Coupon>();

const CouponsTable = () => {
  // State
  const [page] = useState(1);
  const limit = 10;
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [selectedCouponId, setSelectedCouponId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CouponFormData>({
    name: "",
    code: "",
    startDate: "",
    endDate: "",
    discountPercentage: 0,
    maxAllowed: 0,
    numberOfUsageTimePerUser: 0,
    minInvoiceTotal: 0,
    isActive: true,
  });

  // API hooks
  const {
    data: couponsData,
    isLoading: isCouponsLoading,
    isError: isCouponsError,
  } = useGetAllcouponQuery({ page, limit });
  const [createCoupon, { isLoading: isCreating }] = useCreateCouponMutation();
  const [updateCoupon, { isLoading: isUpdating }] = useUpdateCouponMutation();
  const [deleteCoupon, { isLoading: isDeleting }] = useDeleteCouponMutation();

  // Table data
  const tableData = useMemo(() => {
    if (couponsData?.isSuccess && couponsData?.data?.data) {
      return couponsData.data.data;
    }
    return [];
  }, [couponsData]);

  // Handle Create popup
  const handleOpenCreate = () => {
    setFormData({
      name: "",
      code: "",
      startDate: "",
      endDate: "",
      discountPercentage: 0,
      maxAllowed: 0,
      numberOfUsageTimePerUser: 0,
      minInvoiceTotal: 0,
      isActive: true,
    });
    setIsOpenCreate(true);
  };

  const handleCloseCreate = () => setIsOpenCreate(false);

  // Handle Edit popup
  const handleOpenEdit = (coupon: Coupon) => {
    setSelectedCouponId(coupon.id.toString());
    setFormData({
      id: coupon.id.toString(),
      name: coupon.name,
      code: coupon.code,
      startDate: coupon.startDate,
      endDate: coupon.endDate,
      discountPercentage: coupon.discountPercentage,
      maxAllowed: coupon.maxAllowed,
      numberOfUsageTimePerUser: coupon.numberOfUsageTimePerUser,
      minInvoiceTotal: coupon.minInvoiceTotal,
      isActive: coupon.isActive,
    });
    setIsOpenEdit(true);
  };

  const handleCloseEdit = () => {
    setIsOpenEdit(false);
    setSelectedCouponId(null);
  };

  // Handle Delete popup
  const handleOpenDelete = (couponId: string) => {
    setSelectedCouponId(couponId);
    setIsOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setIsOpenDelete(false);
    setSelectedCouponId(null);
  };

  // Handle Create submission
  const handleCreateSubmit = async () => {
    if (
      !formData.name ||
      !formData.code ||
      !formData.startDate ||
      !formData.endDate ||
      formData.discountPercentage <= 0 ||
      formData.maxAllowed <= 0 ||
      formData.numberOfUsageTimePerUser <= 0 ||
      formData.minInvoiceTotal <= 0
    ) {
      showToast({
        type: false,
        message: "Please fill all required fields with valid values",
      });
      return;
    }

    try {
      const response = await createCoupon({
        name: formData.name,
        code: formData.code,
        startDate: formData.startDate,
        endDate: formData.endDate,
        discountPercentage: formData.discountPercentage,
        maxAllowed: formData.maxAllowed,
        numberOfUsageTimePerUser: formData.numberOfUsageTimePerUser,
        minInvoiceTotal: formData.minInvoiceTotal,
        isActive: formData.isActive,
      }).unwrap();
      showToast({
        type: true,
        message: response.message || "Coupon created successfully",
      });
      handleCloseCreate();
    } catch (error: any) {
      showToast({
        type: false,
        message: error?.data?.message || "Failed to create coupon",
      });
    }
  };

  // Handle Update submission
  const handleUpdateSubmit = async () => {
    if (
      !formData.id ||
      !formData.name ||
      !formData.code ||
      !formData.startDate ||
      !formData.endDate ||
      formData.discountPercentage <= 0 ||
      formData.maxAllowed <= 0 ||
      formData.numberOfUsageTimePerUser <= 0 ||
      formData.minInvoiceTotal <= 0
    ) {
      showToast({
        type: false,
        message: "Please fill all required fields with valid values",
      });
      return;
    }

    try {
      const response = await updateCoupon({
        id: formData.id,
        name: formData.name,
        code: formData.code,
        startDate: formData.startDate,
        endDate: formData.endDate,
        discountPercentage: formData.discountPercentage,
        maxAllowed: formData.maxAllowed,
        numberOfUsageTimePerUser: formData.numberOfUsageTimePerUser,
        minInvoiceTotal: formData.minInvoiceTotal,
        isActive: formData.isActive,
      }).unwrap();
      showToast({
        type: true,
        message: response.message || "Coupon updated successfully",
      });
      handleCloseEdit();
    } catch (error: any) {
      showToast({
        type: false,
        message: error?.data?.message || "Failed to update coupon",
      });
    }
  };

  // Handle Delete submission
  const handleDeleteSubmit = async () => {
    if (!selectedCouponId) {
      showToast({ type: false, message: "No coupon selected" });
      return;
    }

    try {
      const response = await deleteCoupon({ id: selectedCouponId }).unwrap();
      showToast({
        type: true,
        message: response.message || "Coupon deleted successfully",
      });
      handleCloseDelete();
    } catch (error: any) {
      showToast({
        type: false,
        message: error?.data?.message || "Failed to delete coupon",
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
  const columns = useMemo<ColumnDef<Coupon>[]>(
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
        header: "Name",
        accessorKey: "name",
      },
      {
        header: "Code",
        accessorKey: "code",
      },
      {
        header: "Start Date",
        accessorKey: "startDate",
      },
      {
        header: "End Date",
        accessorKey: "endDate",
      },
      {
        header: "Discount (%)",
        accessorKey: "discountPercentage",
      },
      {
        header: "Max Allowed",
        accessorKey: "maxAllowed",
      },
      {
        header: "Current Usage",
        accessorKey: "currentUsage",
      },
      {
        header: "Usage Per User",
        accessorKey: "numberOfUsageTimePerUser",
      },
      {
        header: "Min Invoice Total",
        accessorKey: "minInvoiceTotal",
      },
      {
        header: "Status",
        accessorKey: "isActive",
        cell: ({ row }) => (
          <Chip
            label={row.original.isActive ? "Active" : "Inactive"}
            color={row.original.isActive ? "success" : "error"}
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
                    handleOpenEdit(row.original);
                    handleMenuClose();
                  }}
                >
                  <EditIcon sx={{ mr: 1 }} /> Edit
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

  if (isCouponsLoading) return <TableSkeleton rows={10} columns={12} />;
  if (isCouponsError) return <Typography>Error loading coupons</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">Coupons</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
        >
          Add Coupon
        </Button>
      </Box>
      <SharedTable
        columns={columns}
        data={tableData}
        LoadingData={isCouponsLoading}
      />

      {/* Create Coupon Popup */}
      <CustomPopup
        handleClose={handleCloseCreate}
        isOpen={isOpenCreate}
        content={
          <Box sx={{ p: 3, maxHeight: "90vh", overflowY: "auto" }}>
            <Typography variant="h6" mb={2}>
              Create Coupon
            </Typography>
            <TextField
              label="Name"
              fullWidth
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              label="Code"
              fullWidth
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              label="Start Date"
              fullWidth
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="End Date"
              fullWidth
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="Discount Percentage"
              fullWidth
              type="number"
              value={formData.discountPercentage}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  discountPercentage: parseFloat(e.target.value),
                })
              }
              margin="normal"
              required
              inputProps={{ min: 0, step: 0.1 }}
            />
            <TextField
              label="Max Allowed Uses"
              fullWidth
              type="number"
              value={formData.maxAllowed}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  maxAllowed: parseInt(e.target.value),
                })
              }
              margin="normal"
              required
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Usage Per User"
              fullWidth
              type="number"
              value={formData.numberOfUsageTimePerUser}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  numberOfUsageTimePerUser: parseInt(e.target.value),
                })
              }
              margin="normal"
              required
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Min Invoice Total"
              fullWidth
              type="number"
              value={formData.minInvoiceTotal}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  minInvoiceTotal: parseInt(e.target.value),
                })
              }
              margin="normal"
              required
              inputProps={{ min: 0 }}
            />
            <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
              <Typography>Active</Typography>
              <Switch
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
              />
            </Box>
            <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
              <Button onClick={handleCloseCreate}>Cancel</Button>
              <Button
                onClick={handleCreateSubmit}
                variant="contained"
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : "Create Coupon"}
              </Button>
            </Box>
          </Box>
        }
      />

      {/* Edit Coupon Popup */}
      <CustomPopup
        handleClose={handleCloseEdit}
        isOpen={isOpenEdit}
        content={
          <Box sx={{ p: 3, maxHeight: "90vh", overflowY: "auto" }}>
            <Typography variant="h6" mb={2}>
              Edit Coupon
            </Typography>
            <TextField
              label="Name"
              fullWidth
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              label="Code"
              fullWidth
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              label="Start Date"
              fullWidth
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="End Date"
              fullWidth
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="Discount Percentage"
              fullWidth
              type="number"
              value={formData.discountPercentage}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  discountPercentage: parseFloat(e.target.value),
                })
              }
              margin="normal"
              required
              inputProps={{ min: 0, step: 0.1 }}
            />
            <TextField
              label="Max Allowed Uses"
              fullWidth
              type="number"
              value={formData.maxAllowed}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  maxAllowed: parseInt(e.target.value),
                })
              }
              margin="normal"
              required
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Usage Per User"
              fullWidth
              type="number"
              value={formData.numberOfUsageTimePerUser}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  numberOfUsageTimePerUser: parseInt(e.target.value),
                })
              }
              margin="normal"
              required
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Min Invoice Total"
              fullWidth
              type="number"
              value={formData.minInvoiceTotal}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  minInvoiceTotal: parseInt(e.target.value),
                })
              }
              margin="normal"
              required
              inputProps={{ min: 0 }}
            />
            <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
              <Typography>Active</Typography>
              <Switch
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
              />
            </Box>
            <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
              <Button onClick={handleCloseEdit}>Cancel</Button>
              <Button
                onClick={handleUpdateSubmit}
                variant="contained"
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Update Coupon"}
              </Button>
            </Box>
          </Box>
        }
      />

      {/* Delete Coupon Popup */}
      <CustomPopup
        handleClose={handleCloseDelete}
        isOpen={isOpenDelete}
        content={
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
              Are you sure you want to delete this coupon?
            </Typography>
            <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
              <Button onClick={handleCloseDelete}>Cancel</Button>
              <Button
                onClick={handleDeleteSubmit}
                variant="contained"
                color="error"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Coupon"}
              </Button>
            </Box>
          </Box>
        }
      />
    </Box>
  );
};

export default CouponsTable;
