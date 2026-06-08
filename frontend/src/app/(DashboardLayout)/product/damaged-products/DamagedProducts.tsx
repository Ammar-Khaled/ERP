"use client";
import SharedTable from "@/app/components/tables/DynamicTable";
import {
  CheckboxProps,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
} from "@mui/material";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import CustomCheckbox from "@/app/components/forms/theme-elements/CustomCheckbox";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useGetAllproductDamegedQuery } from "@/store/slice/productDamegedApiSlice";
import TableSkeleton from "@/app/components/TableSkeleton";

// Define EnTableType to match the damaged products data structure
export interface EnTableType {
  id: number;
  barcode: string;
  cost: string;
  price: string;
  totalNumberOfValid: number;
  totalNumberOfDamaged: number;
  name: string;
  mainPhoto: string;
  expiryDate: string;
  deletedAt: string | null;
  productId: number;
  photos: string[];
}

const columnHelper = createColumnHelper<EnTableType>();

const DamagedProducts = () => {
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

  const columns = useMemo<ColumnDef<EnTableType>[]>(
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
        header: "Barcode",
        accessorKey: "barcode",
      },
      {
        header: "Cost",
        accessorKey: "cost",
      },
      {
        header: "Price",
        accessorKey: "price",
      },
      {
        header: "Valid Items",
        accessorKey: "totalNumberOfValid",
      },
      {
        header: "Damaged Items",
        accessorKey: "totalNumberOfDamaged",
      },
      {
        header: "Expiry Date",
        accessorKey: "expiryDate",
        cell: ({ row }) =>
          new Date(row.original.expiryDate).toLocaleDateString(),
      },

      {
        header: "Action",
        accessorKey: "action",
        cell: ({ row }) => {
          const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
          const open = Boolean(anchorEl);

          const handleClick = (event: MouseEvent<HTMLElement>) => {
            setAnchorEl(event.currentTarget);
          };

          const handleClose = () => {
            setAnchorEl(null);
          };

          return (
            <>
              <IconButton onClick={handleClick}>
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <MenuItem onClick={handleClose}>
                  <VisibilityIcon sx={{ mr: 1 }} /> View
                </MenuItem>
                <MenuItem onClick={handleClose}>
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

  const { data, isLoading, isError } = useGetAllproductDamegedQuery({});

  const tableData = useMemo(() => {
    if (data?.isSuccess && data?.data) {
      return data.data;
    }
    return [];
  }, [data]);
  if (isLoading) return <TableSkeleton rows={10} columns={10} />;
  if (isError) return <Typography>Error loading data</Typography>;

  return (
    <Box>
      <SharedTable data={tableData} columns={columns} LoadingData={isLoading} />
    </Box>
  );
};

export default DamagedProducts;
