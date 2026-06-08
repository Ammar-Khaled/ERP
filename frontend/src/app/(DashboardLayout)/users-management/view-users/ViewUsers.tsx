"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Box,
  Button,
  CheckboxProps,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Menu,
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
  useCreateUserMutation,
  useDeleteUserMutation,
  useGetAlluserQuery,
  useUpdateUserMutation,
} from "@/store/slice/userSliceApi";
import { useGetAllRolesQuery } from "@/store/slice/permissionSliceApi";
import { useSession } from "next-auth/react";

// Types
interface Role {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  deletedAt: string | null;
}

interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  phone: string;
  isActive: boolean;
  isBlocked: boolean;
  deletedAt: string | null;
  addressId: number | null;
  branchId: number;
  roleIds: number[];
}

interface UserFormData {
  id?: number;
  username: string;
  email: string;
  name: string;
  phone: string;
  password?: string;
  branchId: string;
  roleIds: number[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface UserListResponse {
  data: User[];
  pagination: Pagination;
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

const columnHelper = createColumnHelper<User>();

const ViewUsers = () => {
  // State
  const [page] = useState(1);
  const limit = 10;
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    username: "",
    email: "",
    name: "",
    phone: "",
    password: "",
    branchId: "",
    roleIds: [],
  });

  // API hooks
  const {
    data: usersData,
    isLoading: isUsersLoading,
    isError: isUsersError,
  } = useGetAlluserQuery({ page, limit });
  const { data: rolesData, isLoading: isRolesLoading } = useGetAllRolesQuery({
    page: 1,
    limit: 100,
  });
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  // Table data
  const tableData = useMemo(() => {
    if (usersData?.isSuccess && usersData?.data?.data) {
      return usersData.data.data;
    }
    return [];
  }, [usersData]);

  // Roles data
  const roles = useMemo(() => {
    if (rolesData?.isSuccess && rolesData?.data?.data) {
      return rolesData.data.data;
    }
    return [];
  }, [rolesData]);

  // Handle Create popup
  const handleOpenCreate = () => {
    setFormData({
      username: "",
      email: "",
      name: "",
      phone: "",
      password: "",
      branchId: "",
      roleIds: [],
    });
    setIsOpenCreate(true);
  };

  const handleCloseCreate = () => setIsOpenCreate(false);

  // Handle Edit popup
  const handleOpenEdit = (user: User) => {
    setSelectedUserId(user.id);
    setFormData({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      phone: user.phone,
      branchId: user.branchId.toString(),
      roleIds: user.roleIds,
    });
    setIsOpenEdit(true);
  };

  const handleCloseEdit = () => {
    setIsOpenEdit(false);
    setSelectedUserId(null);
  };

  // Handle Delete popup
  const handleOpenDelete = (userId: number) => {
    setSelectedUserId(userId);
    setIsOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setIsOpenDelete(false);
    setSelectedUserId(null);
  };

  // Handle role selection
  const handleRoleChange = (event: any) => {
    const value = event.target.value as number[];
    setFormData({ ...formData, roleIds: value });
  };

  // Handle Create submission
  const handleCreateSubmit = async () => {
    if (
      !formData.username ||
      !formData.email ||
      !formData.name ||
      !formData.phone ||
      !formData.password ||
      !formData.branchId
    ) {
      showToast({ type: false, message: "Please fill all required fields" });
      return;
    }

    try {
      const response = await createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password!,
        username: formData.username,
        phone: formData.phone,
        branchId: parseInt(formData.branchId),
        roleIds: formData.roleIds,
      }).unwrap();
      showToast({
        type: true,
        message: response.message || "User created successfully",
      });
      handleCloseCreate();
    } catch (error: any) {
      showToast({
        type: false,
        message: error?.data?.message || "Failed to create user",
      });
    }
  };

  const session = useSession();

  // Handle Update submission
  const handleUpdateSubmit = async () => {
    if (
      !formData.id ||
      !formData.username ||
      !formData.email ||
      !formData.name ||
      !formData.phone ||
      !formData.branchId
    ) {
      showToast({ type: false, message: "Please fill all required fields" });
      return;
    }

    try {
      const response = await updateUser({
        id: formData.id,
        name: formData.name,
        email: formData.email,
        username: formData.username,
        phone: formData.phone,
        branchId: session.data?.user.branchId || parseInt(formData.branchId),
        roleIds: formData.roleIds,
        password: formData.password,
      }).unwrap();
      showToast({
        type: true,
        message: response.message || "User updated successfully",
      });
      handleCloseEdit();
    } catch (error: any) {
      showToast({
        type: false,
        message: error?.data?.message || "Failed to update user",
      });
    }
  };

  // Handle Delete submission
  const handleDeleteSubmit = async () => {
    if (!selectedUserId) {
      showToast({ type: false, message: "No user selected" });
      return;
    }

    try {
      const response = await deleteUser({ id: selectedUserId }).unwrap();
      showToast({
        type: true,
        message: response.message || "User deleted successfully",
      });
      handleCloseDelete();
    } catch (error: any) {
      showToast({
        type: false,
        message: error?.data?.message || "Failed to delete user",
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
  const columns = useMemo<ColumnDef<User>[]>(
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
        header: "Username",
        accessorKey: "username",
      },
      {
        header: "Name",
        accessorKey: "name",
      },
      {
        header: "Email",
        accessorKey: "email",
      },
      {
        header: "Phone",
        accessorKey: "phone",
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
        header: "Blocked",
        accessorKey: "isBlocked",
        cell: ({ row }) => (
          <Chip
            label={row.original.isBlocked ? "Blocked" : "Not Blocked"}
            color={row.original.isBlocked ? "error" : "success"}
            size="small"
          />
        ),
      },
      {
        header: "Roles",
        accessorKey: "roleIds",
        cell: ({ row }) => (
          <Box>
            {row.original.roleIds.map((roleId) => {
              const role = roles.find((r: Role) => r.id === roleId);
              return role ? (
                <Chip
                  key={roleId}
                  label={role.name}
                  size="small"
                  sx={{ mr: 0.5, mb: 0.5 }}
                />
              ) : null;
            })}
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
    [roles]
  );

  if (isUsersLoading) return <TableSkeleton rows={10} columns={9} />;
  if (isUsersError) return <Typography>Error loading users</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5"></Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
        >
          Add User
        </Button>
      </Box>
      <SharedTable
        columns={columns}
        data={tableData}
        LoadingData={isUsersLoading}
      />

      {/* Create User Popup */}
      <CustomPopup
        handleClose={handleCloseCreate}
        isOpen={isOpenCreate}
        content={
          <Box sx={{ p: 3, maxHeight: "90vh", overflowY: "auto" }}>
            <Typography variant="h6" mb={2}>
              Create User
            </Typography>
            <TextField
              label="Username"
              fullWidth
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              margin="normal"
              required
            />
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
              label="Email"
              fullWidth
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              label="Phone"
              fullWidth
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              label="Password"
              fullWidth
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              label="Branch ID"
              fullWidth
              type="number"
              value={formData.branchId}
              onChange={(e) =>
                setFormData({ ...formData, branchId: e.target.value })
              }
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="roles-label">Roles</InputLabel>
              <Select
                labelId="roles-label"
                multiple
                value={formData.roleIds}
                onChange={handleRoleChange}
                label="Roles"
                disabled={isRolesLoading}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => {
                      const role = roles.find((r: Role) => r.id === value);
                      return role ? (
                        <Chip key={value} label={role.name} size="small" />
                      ) : null;
                    })}
                  </Box>
                )}
              >
                {roles.map((role: Role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
              <Button onClick={handleCloseCreate}>Cancel</Button>
              <Button
                onClick={handleCreateSubmit}
                variant="contained"
                disabled={isCreating || isRolesLoading}
              >
                {isCreating ? "Creating..." : "Create User"}
              </Button>
            </Box>
          </Box>
        }
      />

      {/* Edit User Popup */}
      <CustomPopup
        handleClose={handleCloseEdit}
        isOpen={isOpenEdit}
        content={
          <Box sx={{ p: 3, maxHeight: "90vh", overflowY: "auto" }}>
            <Typography variant="h6" mb={2}>
              Edit User
            </Typography>
            <TextField
              label="Username"
              fullWidth
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              margin="normal"
              required
            />
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
              label="Email"
              fullWidth
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              label="Phone"
              fullWidth
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              label="Password"
              fullWidth
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              margin="normal"
              helperText="Leave blank to keep current password"
            />
            <TextField
              label="Branch ID"
              fullWidth
              type="number"
              value={formData.branchId}
              onChange={(e) =>
                setFormData({ ...formData, branchId: e.target.value })
              }
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="roles-label">Roles</InputLabel>
              <Select
                labelId="roles-label"
                multiple
                value={formData.roleIds}
                onChange={handleRoleChange}
                label="Roles"
                disabled={isRolesLoading}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => {
                      const role = roles.find((r: Role) => r.id === value);
                      return role ? (
                        <Chip key={value} label={role.name} size="small" />
                      ) : null;
                    })}
                  </Box>
                )}
              >
                {roles.map((role: Role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
              <Button onClick={handleCloseEdit}>Cancel</Button>
              <Button
                onClick={handleUpdateSubmit}
                variant="contained"
                disabled={isUpdating || isRolesLoading}
              >
                {isUpdating ? "Updating..." : "Update User"}
              </Button>
            </Box>
          </Box>
        }
      />

      {/* Delete User Popup */}
      <CustomPopup
        handleClose={handleCloseDelete}
        isOpen={isOpenDelete}
        content={
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
              Are you sure you want to delete this user?
            </Typography>
            <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
              <Button onClick={handleCloseDelete}>Cancel</Button>
              <Button
                onClick={handleDeleteSubmit}
                variant="contained"
                color="error"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete User"}
              </Button>
            </Box>
          </Box>
        }
      />
    </Box>
  );
};

export default ViewUsers;
