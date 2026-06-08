"use client";
import SharedTable from "@/app/components/tables/DynamicTable";
import { EnTableType } from "@/app/components/tables/tableData";
import {
  Avatar,
  AvatarGroup,
  Box,
  CheckboxProps,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import CustomCheckbox from "@/app/components/forms/theme-elements/CustomCheckbox";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useGetAllInventoryQuery } from "@/store/slice/inventoryApiSlice";
import TableSkeleton from "@/app/components/TableSkeleton";

const ViewInventory = () => {
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

  const { data, isLoading } = useGetAllInventoryQuery({});

  const columns = useMemo<ColumnDef<any>[]>(
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
        header: "name",
        accessorKey: "name",
      },
      {
        header: "Active",
        accessorKey: "isActive",

        cell: ({ row }) => {
          return (
            <>
              <CustomCheckbox
                checked={row.original.isActive}
                onChange={() => {}}
                className="cursor-pointer"
              />
            </>
          );
        },
      },
      {
        header: "action",
        accessorKey: "procedure",
        cell: ({ row }) => {
          const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

          const handleMenuOpen = (event: MouseEvent<HTMLElement>) => {
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
              >
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                  }}
                >
                  <EditIcon />
                  Edit
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                  }}
                >
                  <DeleteIcon />
                  Delete
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                  }}
                >
                  <VisibilityIcon />
                  View
                </MenuItem>
              </Menu>
            </>
          );
        },
      },
    ],
    []
  );

  if (isLoading) return <TableSkeleton rows={10} columns={10} />;

  return (
    <SharedTable
      LoadingData={isLoading}
      data={data?.data?.data || []}
      columns={columns}
    />
  );
};

export default ViewInventory;
