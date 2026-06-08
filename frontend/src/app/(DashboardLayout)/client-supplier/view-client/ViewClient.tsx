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
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CustomCheckbox from "@/app/components/forms/theme-elements/CustomCheckbox";
import SharedTable from "@/app/components/tables/DynamicTable";
import TableSkeleton from "@/app/components/TableSkeleton";
import { CustomPopup } from "@/utils/CustomPopup";
import { showToast } from "@/utils/ToastNotifications";
import {
  useGetAllclientQuery,
  useCreateclientMutation,
  useUpdateclientMutation,
  useDeleteclientMutation,
} from "@/store/slice/clientSliceApi";

// Types
interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

interface Client {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  deletedAt: string | null;
  addressId: number | null;
}

interface ClientFormData {
  id?: number;
  name: string;
  email: string;
  phone_number: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ClientListResponse {
  data: Client[];
  pagination: Pagination;
}

interface ApiResponse<T> {
  statusCode: number;
  isSuccess: boolean;
  data: T;
  message: string;
}

const columnHelper = createColumnHelper<Client>();

const ViewClient = () => {
  // State
  const [page] = useState(1);
  const limit = 10;
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ClientFormData>({
    name: "",
    email: "",
    phone_number: "",
    street: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
  });

  // API hooks
  const {
    data: clientsData,
    isLoading: isClientsLoading,
    isError: isClientsError,
  } = useGetAllclientQuery({ page, limit });
  const [createClient, { isLoading: isCreating }] = useCreateclientMutation();
  const [updateClient, { isLoading: isUpdating }] = useUpdateclientMutation();
  const [deleteClient, { isLoading: isDeleting }] = useDeleteclientMutation();

  // Table data
  const tableData = useMemo(() => {
    if (clientsData?.isSuccess && clientsData?.data?.data) {
      return clientsData.data.data;
    }
    return [];
  }, [clientsData]);

  // Handle Create popup
  const handleOpenCreate = () => {
    setFormData({
      name: "",
      email: "",
      phone_number: "",
      street: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
    });
    setIsOpenCreate(true);
  };

  const handleCloseCreate = () => setIsOpenCreate(false);

  // Handle Edit popup
  const handleOpenEdit = (client: Client) => {
    setSelectedClientId(client.id);
    setFormData({
      id: client.id,
      name: client.name,
      email: client.email,
      phone_number: client.phone_number,
      street: "", // Address details would need to be fetched separately
      city: "",
      state: "",
      country: "",
      postalCode: "",
    });
    setIsOpenEdit(true);
  };

  const handleCloseEdit = () => {
    setIsOpenEdit(false);
    setSelectedClientId(null);
  };

  // Handle Delete popup
  const handleOpenDelete = (clientId: number) => {
    setSelectedClientId(clientId);
    setIsOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setIsOpenDelete(false);
    setSelectedClientId(null);
  };

  // Handle Create submission
  const handleCreateSubmit = async () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone_number ||
      !formData.street ||
      !formData.city ||
      !formData.state ||
      !formData.country ||
      !formData.postalCode
    ) {
      showToast({ type: false, message: "Please fill all required fields" });
      return;
    }

    try {
      const response = await createClient({
        name: formData.name,
        email: formData.email,
        phone_number: formData.phone_number,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          postalCode: formData.postalCode,
        },
      }).unwrap();
      showToast({
        type: true,
        message: response.message || "Client created successfully",
      });
      handleCloseCreate();
    } catch (error: any) {
      showToast({
        type: false,
        message: error?.data?.message || "Failed to create client",
      });
    }
  };

  // Handle Update submission
  const handleUpdateSubmit = async () => {
    if (
      !formData.id ||
      !formData.name ||
      !formData.email ||
      !formData.phone_number ||
      !formData.street ||
      !formData.city ||
      !formData.state ||
      !formData.country ||
      !formData.postalCode
    ) {
      showToast({ type: false, message: "Please fill all required fields" });
      return;
    }

    try {
      const response = await updateClient({
        id: formData.id,
        name: formData.name,
        email: formData.email,
        phone_number: formData.phone_number,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          postalCode: formData.postalCode,
        },
      }).unwrap();
      showToast({
        type: true,
        message: response.message || "Client updated successfully",
      });
      handleCloseEdit();
    } catch (error: any) {
      showToast({
        type: false,
        message: error?.data?.message || "Failed to update client",
      });
    }
  };

  // Handle Delete submission
  const handleDeleteSubmit = async () => {
    if (!selectedClientId) {
      showToast({ type: false, message: "No client selected" });
      return;
    }

    try {
      const response = await deleteClient({ id: selectedClientId }).unwrap();
      showToast({
        type: true,
        message: response.message || "Client deleted successfully",
      });
      handleCloseDelete();
    } catch (error: any) {
      showToast({
        type: false,
        message: error?.data?.message || "Failed to delete client",
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
  const columns = useMemo<ColumnDef<Client>[]>(
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
        header: "Email",
        accessorKey: "email",
      },
      {
        header: "Phone",
        accessorKey: "phone_number",
      },
      // {
      //   header: "Address ID",
      //   accessorKey: "addressId",
      //   cell: ({ row }) => (
      //     <Typography>{row.original.addressId || "N/A"}</Typography>
      //   ),
      // },
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

  if (isClientsLoading) return <TableSkeleton rows={10} columns={7} />;
  if (isClientsError) return <Typography>Error loading clients</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">Clients</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
        >
          Add Client
        </Button>
      </Box>
      <SharedTable
        columns={columns}
        data={tableData}
        LoadingData={isClientsLoading}
      />

      {/* Create Client Popup */}
      <CustomPopup
        handleClose={handleCloseCreate}
        isOpen={isOpenCreate}
        content={
          <Box sx={{ p: 3, maxHeight: "90vh", overflowY: "auto" }}>
            <Typography variant="h6" mb={2}>
              Create Client
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
              label="Phone Number"
              fullWidth
              value={formData.phone_number}
              onChange={(e) =>
                setFormData({ ...formData, phone_number: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              label="Street"
              fullWidth
              value={formData.street}
              onChange={(e) =>
                setFormData({ ...formData, street: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              label="City"
              fullWidth
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              label="State"
              fullWidth
              value={formData.state}
              onChange={(e) =>
                setFormData({ ...formData, state: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              label="Country"
              fullWidth
              value={formData.country}
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              label="Postal Code"
              fullWidth
              value={formData.postalCode}
              onChange={(e) =>
                setFormData({ ...formData, postalCode: e.target.value })
              }
              margin="normal"
              required
            />
            <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
              <Button onClick={handleCloseCreate}>Cancel</Button>
              <Button
                onClick={handleCreateSubmit}
                variant="contained"
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : "Create Client"}
              </Button>
            </Box>
          </Box>
        }
      />

      {/* Edit Client Popup */}
      <CustomPopup
        handleClose={handleCloseEdit}
        isOpen={isOpenEdit}
        content={
          <Box sx={{ p: 3, maxHeight: "90vh", overflowY: "auto" }}>
            <Typography variant="h6" mb={2}>
              Edit Client
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
              label="Phone Number"
              fullWidth
              value={formData.phone_number}
              onChange={(e) =>
                setFormData({ ...formData, phone_number: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              label="Street"
              fullWidth
              value={formData.street}
              onChange={(e) =>
                setFormData({ ...formData, street: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              label="City"
              fullWidth
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              label="State"
              fullWidth
              value={formData.state}
              onChange={(e) =>
                setFormData({ ...formData, state: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              label="Country"
              fullWidth
              value={formData.country}
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              label="Postal Code"
              fullWidth
              value={formData.postalCode}
              onChange={(e) =>
                setFormData({ ...formData, postalCode: e.target.value })
              }
              margin="normal"
              required
            />
            <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
              <Button onClick={handleCloseEdit}>Cancel</Button>
              <Button
                onClick={handleUpdateSubmit}
                variant="contained"
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Update Client"}
              </Button>
            </Box>
          </Box>
        }
      />

      {/* Delete Client Popup */}
      <CustomPopup
        handleClose={handleCloseDelete}
        isOpen={isOpenDelete}
        content={
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
              Are you sure you want to delete this client?
            </Typography>
            <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
              <Button onClick={handleCloseDelete}>Cancel</Button>
              <Button
                onClick={handleDeleteSubmit}
                variant="contained"
                color="error"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Client"}
              </Button>
            </Box>
          </Box>
        }
      />
    </Box>
  );
};

export default ViewClient;
