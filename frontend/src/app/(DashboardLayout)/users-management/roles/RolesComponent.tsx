"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Box,
  Button,
  Checkbox,
  CheckboxProps,
  Chip,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Typography,
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
  useGetAllRolesQuery,
  useGetAllpermissionsQuery,
  useCraeteRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetRoleByIdQuery,
} from "@/store/slice/permissionSliceApi";

// Types
interface Permission {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
}

interface Role {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  deletedAt: string | null;
  permissions: Permission[];
}

interface RoleFormData {
  id?: number;
  name: string;
  description: string;
  permissionIds: number[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface RoleListResponse {
  data: Role[];
  pagination: Pagination;
}

interface ApiResponse<T> {
  statusCode: number;
  isSuccess: boolean;
  data: T;
  message: string;
}

const columnHelper = createColumnHelper<Role>();

const RolesComponent = () => {
  // State
  const [page] = useState(1);
  const limit = 10;
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [formData, setFormData] = useState<RoleFormData>({
    name: "",
    description: "",
    permissionIds: [],
  });

  // API hooks
  const {
    data: rolesData,
    isLoading: isRolesLoading,
    isError: isRolesError,
  } = useGetAllRolesQuery({ page, limit });
  const { data: permissionsData, isLoading: isPermissionsLoading } =
    useGetAllpermissionsQuery({});
  const [createRole, { isLoading: isCreating }] = useCraeteRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();
  const { data: selectedRoleData, isLoading: isSelectedRoleLoading } =
    useGetRoleByIdQuery({ id: selectedRoleId! }, { skip: !selectedRoleId });

  // Table data
  const tableData = useMemo(() => {
    if (rolesData?.isSuccess && rolesData?.data?.data) {
      return rolesData.data.data;
    }
    return [];
  }, [rolesData]);

  // Permissions data
  const permissions = useMemo(() => {
    if (permissionsData?.isSuccess && permissionsData?.data) {
      return permissionsData.data;
    }
    return [];
  }, [permissionsData]);

  // Handle Create popup
  const handleOpenCreate = () => {
    setFormData({
      name: "",
      description: "",
      permissionIds: [],
    });
    setIsOpenCreate(true);
  };

  const handleCloseCreate = () => setIsOpenCreate(false);

  // Handle Edit popup
  const handleOpenEdit = (role: Role) => {
    setSelectedRoleId(role.id);
    setIsOpenEdit(true);
  };

  const handleCloseEdit = () => {
    setIsOpenEdit(false);
    setSelectedRoleId(null);
  };

  // Handle Delete popup
  const handleOpenDelete = (roleId: number) => {
    setSelectedRoleId(roleId);
    setIsOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setIsOpenDelete(false);
    setSelectedRoleId(null);
  };

  // Handle permission checkbox change
  const handlePermissionChange = (permissionId: number) => {
    setFormData((prev) => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permissionId)
        ? prev.permissionIds.filter((id) => id !== permissionId)
        : [...prev.permissionIds, permissionId],
    }));
  };

  // Populate form data for edit
  useEffect(() => {
    if (selectedRoleData?.isSuccess && selectedRoleData?.data && isOpenEdit) {
      setFormData({
        id: selectedRoleData.data.id,
        name: selectedRoleData.data.name,
        description: selectedRoleData.data.description,
        permissionIds: selectedRoleData.data.permissions.map(
          (p: Permission) => p.id
        ),
      });
    }
  }, [selectedRoleData, isOpenEdit]);

  // Handle Create submission
  const handleCreateSubmit = async () => {
    if (!formData.name || !formData.description) {
      showToast({ type: false, message: "Please fill all required fields" });
      return;
    }

    try {
      const response = await createRole({
        name: formData.name,
        description: formData.description,
        permissionIds: formData.permissionIds,
      }).unwrap();
      showToast({
        type: true,
        message: response.message || "Role created successfully",
      });
      handleCloseCreate();
    } catch (error: any) {
      showToast({
        type: false,
        message: error?.data?.message || "Failed to create role",
      });
    }
  };

  // Handle Update submission
  const handleUpdateSubmit = async () => {
    if (!formData.id || !formData.name || !formData.description) {
      showToast({ type: false, message: "Please fill all required fields" });
      return;
    }

    try {
      const response = await updateRole({
        id: formData.id,
        name: formData.name,
        description: formData.description,
        permissionIds: formData.permissionIds,
      }).unwrap();
      showToast({
        type: true,
        message: response.message || "Role updated successfully",
      });
      handleCloseEdit();
    } catch (error: any) {
      showToast({
        type: false,
        message: error?.data?.message || "Failed to update role",
      });
    }
  };

  // Handle Delete submission
  const handleDeleteSubmit = async () => {
    if (!selectedRoleId) {
      showToast({ type: false, message: "No role selected" });
      return;
    }

    try {
      const response = await deleteRole({ id: selectedRoleId }).unwrap();
      showToast({
        type: true,
        message: response.message || "Role deleted successfully",
      });
      handleCloseDelete();
    } catch (error: any) {
      showToast({
        type: false,
        message: error?.data?.message || "Failed to delete role",
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
  const columns = useMemo<ColumnDef<Role>[]>(
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
        header: "Permissions",
        accessorKey: "permissions",
        cell: ({ row }) => (
          <Box>
            {row.original.permissions.slice(0, 3).map((perm: Permission) => (
              <Chip
                key={perm.id}
                label={perm.name}
                size="small"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))}
            {row.original.permissions.length > 3 && (
              <Chip
                label={`+${row.original.permissions.length - 3}`}
                size="small"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            )}
          </Box>
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
                    handleOpenDelete(row.original.id);
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

  if (isRolesLoading) return <TableSkeleton rows={10} columns={6} />;
  if (isRolesError) return <Typography>Error loading roles</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">Roles</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
        >
          Add Role
        </Button>
      </Box>
      <SharedTable
        columns={columns}
        data={tableData}
        LoadingData={isRolesLoading}
      />

      {/* Create Role Popup */}
      <CustomPopup
        handleClose={handleCloseCreate}
        isOpen={isOpenCreate}
        content={
          <Box sx={{ p: 3, maxHeight: "90vh", overflowY: "auto" }}>
            <Typography variant="h6" mb={2}>
              Create Role
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
              label="Description"
              fullWidth
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              margin="normal"
              required
            />
            <Typography variant="subtitle1" mt={2} mb={1}>
              Permissions
            </Typography>
            <Box
              sx={{
                maxHeight: "300px",
                overflowY: "auto",
                border: "1px solid #e0e0e0",
                p: 2,
                borderRadius: 1,
              }}
            >
              {permissions.map((permission: Permission) => (
                <FormControlLabel
                  key={permission.id}
                  control={
                    <Checkbox
                      checked={formData.permissionIds.includes(permission.id)}
                      onChange={() => handlePermissionChange(permission.id)}
                      disabled={isPermissionsLoading}
                    />
                  }
                  label={`${permission.name} - ${permission.description}`}
                />
              ))}
            </Box>
            <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
              <Button onClick={handleCloseCreate}>Cancel</Button>
              <Button
                onClick={handleCreateSubmit}
                variant="contained"
                disabled={isCreating || isPermissionsLoading}
              >
                {isCreating ? "Creating..." : "Create Role"}
              </Button>
            </Box>
          </Box>
        }
      />

      {/* Edit Role Popup */}
      <CustomPopup
        handleClose={handleCloseEdit}
        isOpen={isOpenEdit}
        content={
          <Box sx={{ p: 3, maxHeight: "90vh", overflowY: "auto" }}>
            <Typography variant="h6" mb={2}>
              Edit Role
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
              label="Description"
              fullWidth
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              margin="normal"
              required
            />
            <Typography variant="subtitle1" mt={2} mb={1}>
              Permissions
            </Typography>
            <Box
              sx={{
                maxHeight: "300px",
                overflowY: "auto",
                border: "1px solid #e0e0e0",
                p: 2,
                borderRadius: 1,
              }}
            >
              {permissions.map((permission: Permission) => (
                <FormControlLabel
                  key={permission.id}
                  control={
                    <Checkbox
                      checked={formData.permissionIds.includes(permission.id)}
                      onChange={() => handlePermissionChange(permission.id)}
                      disabled={isPermissionsLoading || isSelectedRoleLoading}
                    />
                  }
                  label={`${permission.name} - ${permission.description}`}
                />
              ))}
            </Box>
            <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
              <Button onClick={handleCloseEdit}>Cancel</Button>
              <Button
                onClick={handleUpdateSubmit}
                variant="contained"
                disabled={
                  isUpdating || isPermissionsLoading || isSelectedRoleLoading
                }
              >
                {isUpdating ? "Updating..." : "Update Role"}
              </Button>
            </Box>
          </Box>
        }
      />

      {/* Delete Role Popup */}
      <CustomPopup
        handleClose={handleCloseDelete}
        isOpen={isOpenDelete}
        content={
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
              Are you sure you want to delete this role?
            </Typography>
            <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
              <Button onClick={handleCloseDelete}>Cancel</Button>
              <Button
                onClick={handleDeleteSubmit}
                variant="contained"
                color="error"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Role"}
              </Button>
            </Box>
          </Box>
        }
      />
    </Box>
  );
};

export default RolesComponent;
