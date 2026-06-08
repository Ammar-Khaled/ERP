"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Box,
  Button,
  CheckboxProps,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import CustomCheckbox from "@/app/components/forms/theme-elements/CustomCheckbox";
import SharedTable from "@/app/components/tables/DynamicTable";
// import {
//   useGetAllCategoriesQuery,
//   useCreateCategoryMutation,
//   useUpdateCategoryMutation,
//   useDeleteCategoryMutation,
// } from "@/store/slice/categoryApiSlice";
import { showToast } from "@/utils/ToastNotifications";
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetAllCategoriesQuery,
  useUpdateCategoryMutation,
} from "@/store/slice/categoryApiSlice";
import { useSession } from "next-auth/react";
import TableSkeleton from "@/app/components/TableSkeleton";

// Types
interface Category {
  id: number;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  branchId: number;
}

interface CategoryFormData {
  id?: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  branchId: string;
}

const columnHelper = createColumnHelper<Category>();

const CategoriesPage = () => {
  // State for table and actions
  const [page, setPage] = useState(1);
  const limit = 10;

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupMode, setPopupMode] = useState<"add" | "edit" | "view">("add");
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    nameAr: "",
    description: "",
    descriptionAr: "",
    branchId: "",
  });

  // API hooks
  const {
    data: categoriesData,
    isLoading,
    isError,
  } = useGetAllCategoriesQuery({ page, limit });
  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryMutation();

  const session = useSession();

  // Handle popup
  const handlePopupOpen = (
    mode: "add" | "edit" | "view",
    category?: Category
  ) => {
    setPopupMode(mode);
    if (mode === "add") {
      setFormData({
        name: "",
        nameAr: "",
        description: "",
        descriptionAr: "",
        branchId: "",
      });
    } else if (category) {
      setFormData({
        id: category.id.toString(),
        name: category.name,
        nameAr: category.nameAr || "",
        description: category.description,
        descriptionAr: category.descriptionAr || "",
        branchId: category.branchId.toString(),
      });
    }
    setIsPopupOpen(true);
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
    setFormData({
      name: "",
      nameAr: "",
      description: "",
      descriptionAr: "",
      branchId: "",
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!formData.name || !formData.description) {
      showToast({ type: false, message: "Please fill all required fields" });
      return;
    }

    try {
      if (popupMode === "add") {
        await createCategory({
          name: formData.name,
          nameAr: formData.nameAr,
          description: formData.description,
          descriptionAr: formData.descriptionAr,
          branchId: parseInt(String(session.data?.user?.branchId || "0")),
        }).unwrap();
        showToast({ type: true, message: "Category created successfully" });
      } else if (popupMode === "edit" && formData.id) {
        await updateCategory({
          id: formData.id,
          name: formData.name,
          nameAr: formData.nameAr,
          description: formData.description,
          descriptionAr: formData.descriptionAr,
        }).unwrap();
        showToast({ type: true, message: "Category updated successfully" });
      }
      handlePopupClose();
    } catch (error: any) {
      showToast({
        type: false,
        message: error?.data?.message || "Operation failed",
      });
    }
  };

  // Indeterminate checkbox for table
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
  const columns = useMemo<ColumnDef<Category>[]>(
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
        header: "Description",
        accessorKey: "description",
      },
      {
        header: "Actions",
        accessorKey: "actions",
        cell: ({ row }) => {
          // Handle menu actions
          const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
          const [selectedCategory, setSelectedCategory] =
            useState<Category | null>(null);
          const handleMenuOpen = (
            event: React.MouseEvent<HTMLElement>,
            category: Category
          ) => {
            setAnchorEl(event.currentTarget);
            setSelectedCategory(category);
          };

          const handleMenuClose = () => {
            setAnchorEl(null);
            setSelectedCategory(null);
          };
          // Handle delete
          const handleDelete = async () => {
            if (selectedCategory) {
              try {
                await deleteCategory({
                  id: selectedCategory.id.toString(),
                }).unwrap();
                showToast({
                  type: true,
                  message: "Category deleted successfully",
                });
                handleMenuClose();
              } catch (error: any) {
                showToast({
                  type: false,
                  message: error?.data?.message || "Failed to delete category",
                });
              }
            }
          };
          return (
            <>
              <IconButton onClick={(e) => handleMenuOpen(e, row.original)}>
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={
                  Boolean(anchorEl) && selectedCategory?.id === row.original.id
                }
                onClose={handleMenuClose}
              >
                {/* <MenuItem onClick={() => handlePopupOpen("view", row.original)}>
                <VisibilityIcon sx={{ mr: 1 }} /> View
              </MenuItem> */}
                <MenuItem onClick={() => handlePopupOpen("edit", row.original)}>
                  <EditIcon sx={{ mr: 1 }} /> Edit
                </MenuItem>
                <MenuItem onClick={handleDelete}>
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

  // Transform API data
  const categories: Category[] = useMemo(() => {
    if (categoriesData?.isSuccess && categoriesData?.data?.data) {
      return categoriesData.data.data.map((item: any) => ({
        id: item.id,
        name: item.name,
        nameAr: item.nameAr || "",
        description: item.description,
        descriptionAr: item.descriptionAr || "",
        branchId: item.branchId,
      }));
    }
    return [];
  }, [categoriesData]);

  const pagination = categoriesData?.data?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  };

  if (isLoading) return <TableSkeleton rows={10} columns={10} />;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">Categories</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handlePopupOpen("add")}
        >
          Add Category
        </Button>
      </Box>

      {isError && (
        <Typography color="error">Error loading categories</Typography>
      )}
      <SharedTable data={categories} columns={columns} />
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <Button
          variant="outlined"
          disabled={!pagination.hasPrev}
          onClick={() => setPage((prev) => prev - 1)}
          sx={{ mr: 1 }}
        >
          Previous
        </Button>
        <Typography sx={{ mx: 2 }}>
          Page {pagination.page} of {pagination.totalPages}
        </Typography>
        <Button
          variant="outlined"
          disabled={!pagination.hasNext}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next
        </Button>
      </Box>

      {/* Popup for Add/Edit/View */}
      <Dialog
        open={isPopupOpen}
        onClose={handlePopupClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {popupMode === "add"
            ? "Add Category"
            : popupMode === "edit"
            ? "Edit Category"
            : "View Category"}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            disabled={popupMode === "view"}
            required
          />
          <TextField
            fullWidth
            label="Arabic Name"
            value={formData.nameAr}
            onChange={(e) =>
              setFormData({ ...formData, nameAr: e.target.value })
            }
            margin="normal"
            disabled={popupMode === "view"}
          />
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            margin="normal"
            multiline
            rows={3}
            disabled={popupMode === "view"}
            required
          />
          <TextField
            fullWidth
            label="Arabic Description"
            value={formData.descriptionAr}
            onChange={(e) =>
              setFormData({ ...formData, descriptionAr: e.target.value })
            }
            margin="normal"
            multiline
            rows={3}
            disabled={popupMode === "view"}
          />
          {/* <TextField
            fullWidth
            label="Branch ID"
            value={formData.branchId}
            onChange={(e) =>
              setFormData({ ...formData, branchId: e.target.value })
            }
            margin="normal"
            type="number"
            disabled={popupMode === "view"}
            required
          /> */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePopupClose}>Cancel</Button>
          {popupMode !== "view" && (
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={isCreating || isUpdating}
            >
              {isCreating || isUpdating
                ? "Processing..."
                : popupMode === "add"
                ? "Create"
                : "Update"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoriesPage;
