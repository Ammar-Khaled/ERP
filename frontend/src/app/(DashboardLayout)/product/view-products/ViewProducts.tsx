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
  FormControl,
  InputLabel,
  Select,
  Typography,
  MenuItem as MenuItemType,
} from "@mui/material";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DangerousIcon from "@mui/icons-material/Dangerous";
import AddIcon from "@mui/icons-material/Add";
import CustomCheckbox from "@/app/components/forms/theme-elements/CustomCheckbox";
import SharedTable from "@/app/components/tables/DynamicTable";
import TableSkeleton from "@/app/components/TableSkeleton";
import { CustomPopup } from "@/utils/CustomPopup";
import { showToast } from "@/utils/ToastNotifications";
import {
  useGetAllproductQuery,
  useCreateProductMutation,
  useAddDaamgedProductMutation,
} from "@/store/slice/productApiSlice";
import { useGetAllCategoriesQuery } from "@/store/slice/categoryApiSlice";
import { useGetAllunitQuery } from "@/store/slice/unitSliceApi";
import { useGetAllcurrenciesQuery } from "@/store/slice/currenciesSliceApi";
import { useSession } from "next-auth/react";

// Types
interface Product {
  id: number;
  name: string;
  nameAr: string;
  branchId: number;
  branchName: string;
  brand: string;
  categoryId: number;
  categoryName: string;
  isActive: boolean;
  unitId: number;
  unitName: string;
  currencyId: number;
  currencyName: string;
}

interface ProductItem {
  barcode: string;
  cost: string;
  price: string;
  name: string;
  nameAr: string;
  expiryDate: string;
}

interface ProductFormData {
  name: string;
  nameAr: string;
  branchId: string;
  brand: string;
  categoryId: string;
  isActive: boolean;
  unitId: string;
  currencyId: string;
  productItems: ProductItem[];
}

interface Category {
  id: number;
  name: string;
  description: string;
  branchId: number;
}

interface Unit {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
}

interface Currency {
  id: number;
  name: string;
  symbol: string;
}

const columnHelper = createColumnHelper<Product>();

const ViewProducts = () => {
  // State
  const [page] = useState(1);
  const limit = 10;
  const [isOpenDangerous, setIsOpenDangerous] = useState(false);
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [damagedCount, setDamagedCount] = useState(0);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    nameAr: "",
    branchId: "",
    brand: "",
    categoryId: "",
    isActive: true,
    unitId: "",
    currencyId: "",
    productItems: [
      {
        barcode: "",
        cost: "",
        price: "",
        name: "",
        nameAr: "",
        expiryDate: "",
      },
    ],
  });

  // API hooks
  const { data, isLoading, isError } = useGetAllproductQuery({ page, limit });
  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useGetAllCategoriesQuery({ page: 1, limit: 100 });
  const { data: unitsData, isLoading: isUnitsLoading } = useGetAllunitQuery({
    page: 1,
    limit: 100,
  });
  const { data: currenciesData, isLoading: isCurrenciesLoading } =
    useGetAllcurrenciesQuery({ page: 1, limit: 100 });
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [addDamaged, { isLoading: isDamaging }] =
    useAddDaamgedProductMutation();

  // Table data
  const tableData = useMemo(() => {
    if (data?.isSuccess && data?.data?.data) {
      return data.data.data;
    }
    return [];
  }, [data]);

  // Dropdown data
  const categories = useMemo(
    () => categoriesData?.data?.data || [],
    [categoriesData]
  );
  const units = useMemo(() => unitsData?.data?.data || [], [unitsData]);
  const currencies = useMemo(
    () => currenciesData?.data?.data || [],
    [currenciesData]
  );

  // Handle Add Damaged popup
  const handleOpenDangerous = () => setIsOpenDangerous(true);
  const handleCloseDangerous = () => {
    setIsOpenDangerous(false);
    setDamagedCount(0);
  };

  // Handle Create popup
  const handleOpenCreate = () => {
    setFormData({
      name: "",
      nameAr: "",
      branchId: "",
      brand: "",
      categoryId: "",
      isActive: true,
      unitId: "",
      currencyId: "",
      productItems: [
        {
          barcode: "",
          cost: "",
          price: "",
          name: "",
          nameAr: "",
          expiryDate: "",
        },
      ],
    });
    setIsOpenCreate(true);
  };

  const handleCloseCreate = () => setIsOpenCreate(false);

  // Handle adding new product item
  const handleAddProductItem = () => {
    setFormData({
      ...formData,
      productItems: [
        ...formData.productItems,
        {
          barcode: "",
          cost: "",
          price: "",
          name: "",
          nameAr: "",
          expiryDate: "",
        },
      ],
    });
  };

  // Handle removing product item
  const handleRemoveProductItem = (index: number) => {
    setFormData({
      ...formData,
      productItems: formData.productItems.filter((_, i) => i !== index),
    });
  };

  // Handle product item change
  const handleProductItemChange = (
    index: number,
    field: keyof ProductItem,
    value: string
  ) => {
    const newProductItems = [...formData.productItems];
    newProductItems[index] = {
      ...newProductItems[index],
      [field]: value,
    };
    setFormData({ ...formData, productItems: newProductItems });
  };

  const session = useSession();

  // Handle Create submission
  const handleCreateSubmit = async () => {
    if (
      !formData.name ||
      !formData.brand ||
      !formData.categoryId ||
      !formData.unitId ||
      !formData.currencyId ||
      formData.productItems.some(
        (item) =>
          !item.barcode ||
          !item.cost ||
          !item.price ||
          !item.name ||
          !item.expiryDate
      )
    ) {
      showToast({ type: false, message: "Please fill all required fields" });
      return;
    }

    try {
      const response = await createProduct({
        name: formData.name,
        nameAr: formData.nameAr,
        branchId: parseInt(String(session.data?.user?.branchId || "0")),
        brand: formData.brand,
        categoryId: parseInt(formData.categoryId),
        isActive: formData.isActive,
        unitId: parseInt(formData.unitId),
        currencyId: parseInt(formData.currencyId),
        productItems: formData.productItems.map((item) => ({
          barcode: item.barcode,
          cost: +item.cost.toString(),
          price: +item.price.toString(),
          name: item.name,
          nameAr: item.nameAr,
          expiryDate: item.expiryDate,
          totalNumberOfValid: 0,
          totalNumberOfDamaged: 0,
          currencyId: parseInt(formData.currencyId),
          unitId: parseInt(formData.unitId),
          branchId: parseInt(formData.branchId),
          categoryId: parseInt(formData.categoryId),
          brand: formData.brand,
          deletedAt: null,
          isActive: true,
          mainPhoto: "",
          photos: [],
          variationOptions: [],
        })),
      }).unwrap();
      showToast({
        type: true,
        message: response.message || "Product created successfully",
      });
      handleCloseCreate();
    } catch (error: any) {
      showToast({
        type: false,
        message: error?.data?.message || "Failed to create product",
      });
    }
  };

  // Handle Add Damaged
  const handleAddDamaged = async (productId: number) => {
    if (damagedCount <= 0) {
      showToast({
        type: false,
        message: "Please enter a valid number of damaged items",
      });
      return;
    }
    try {
      const res = await addDamaged({
        numberOfDamaged: damagedCount,
        productItemId: productId.toString(),
      }).unwrap();
      showToast({ type: res.isSuccess, message: res.message });
      handleCloseDangerous();
    } catch (error: any) {
      showToast({
        type: false,
        message: error?.data?.message || "Failed to add damaged items",
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
  const columns = useMemo<ColumnDef<Product>[]>(
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
        header: "Brand",
        accessorKey: "brand",
      },
      {
        header: "Branch Name",
        accessorKey: "branchName",
      },
      {
        header: "Category Name",
        accessorKey: "categoryName",
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
        header: "Unit Name",
        accessorKey: "unitName",
      },
      {
        header: "Currency Name",
        accessorKey: "currencyName",
      },
      {
        header: "Action",
        accessorKey: "action",
        cell: ({ row }) => {
          const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
          const [selectedProduct, setSelectedProduct] =
            useState<Product | null>(null);

          const handleMenuOpen = (
            event: React.MouseEvent<HTMLElement>,
            product: Product
          ) => {
            setAnchorEl(event.currentTarget);
            setSelectedProduct(product);
          };

          const handleMenuClose = () => {
            setAnchorEl(null);
            setSelectedProduct(null);
          };
          return (
            <>
              <IconButton onClick={(e) => handleMenuOpen(e, row.original)}>
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={
                  Boolean(anchorEl) && selectedProduct?.id === row.original.id
                }
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
                <MenuItem onClick={handleMenuClose}>
                  <EditIcon sx={{ mr: 1 }} /> Edit
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleOpenDangerous();
                    handleMenuClose();
                  }}
                >
                  <DangerousIcon sx={{ mr: 1 }} /> Add Damaged
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>
                  <DeleteIcon sx={{ mr: 1 }} /> Delete
                </MenuItem>
              </Menu>
              <CustomPopup
                handleClose={handleCloseDangerous}
                isOpen={
                  isOpenDangerous && selectedProduct?.id === row.original.id
                }
                content={
                  <Box sx={{ p: 3 }}>
                    <TextField
                      placeholder="Enter number of damaged items"
                      fullWidth
                      type="number"
                      sx={{ mb: 2 }}
                      value={damagedCount}
                      onChange={(e) => setDamagedCount(+e.target.value)}
                    />
                    <Button
                      onClick={() => handleAddDamaged(row.original.id)}
                      variant="contained"
                      color="primary"
                      disabled={isDamaging}
                    >
                      {isDamaging ? "Processing..." : "Add Damaged"}
                    </Button>
                  </Box>
                }
              />
            </>
          );
        },
      },
    ],
    []
  );

  const [AllData, setAllData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const handlePaginationChange = (
    newPageIndex: number,
    newPageSize: number
  ) => {
    setPageIndex(newPageIndex);
    setPageSize(newPageSize);
  };

  // Initial data fetch
  useEffect(() => {
    if (data?.isSuccess && data?.data?.data) {
      setAllData(tableData || []);
      setTotalCount(data?.data?.pagination?.total || 0);
    }
  }, [tableData]);

  if (isLoading) return <TableSkeleton rows={10} columns={10} />;
  if (isError) return <Typography>Error loading data</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5"></Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
        >
          Add Product
        </Button>
      </Box>
      <SharedTable
        columns={columns}
        data={tableData}
        LoadingData={isLoading}
        totalCount={totalCount}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPaginationChange={handlePaginationChange}
      />
      <CustomPopup
        handleClose={handleCloseCreate}
        isOpen={isOpenCreate}
        content={
          <Box sx={{ p: 3, maxHeight: "90vh", overflowY: "auto" }}>
            <Typography variant="h6" mb={2}>
              Create Product
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
              label="Arabic Name"
              fullWidth
              value={formData.nameAr}
              onChange={(e) =>
                setFormData({ ...formData, nameAr: e.target.value })
              }
              margin="normal"
            />
            {/* <TextField
              label="Branch ID"
              fullWidth
              type="number"
              value={formData.branchId}
              onChange={(e) =>
                setFormData({ ...formData, branchId: e.target.value })
              }
              margin="normal"
              required
            /> */}
            <TextField
              label="Brand"
              fullWidth
              value={formData.brand}
              onChange={(e) =>
                setFormData({ ...formData, brand: e.target.value })
              }
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                label="Category"
                disabled={isCategoriesLoading}
              >
                {categories.map((category: Category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel id="isActive-label">Status</InputLabel>
              <Select
                labelId="isActive-label"
                value={formData.isActive ? "true" : "false"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isActive: e.target.value === "true",
                  })
                }
                label="Status"
              >
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel id="unit-label">Unit</InputLabel>
              <Select
                labelId="unit-label"
                value={formData.unitId}
                onChange={(e) =>
                  setFormData({ ...formData, unitId: e.target.value })
                }
                label="Unit"
                disabled={isUnitsLoading}
              >
                {units.map((unit: Unit) => (
                  <MenuItem key={unit.id} value={unit.id}>
                    {unit.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel id="currency-label">Currency</InputLabel>
              <Select
                labelId="currency-label"
                value={formData.currencyId}
                onChange={(e) =>
                  setFormData({ ...formData, currencyId: e.target.value })
                }
                label="Currency"
                disabled={isCurrenciesLoading}
              >
                {currencies.map((currency: Currency) => (
                  <MenuItem key={currency.id} value={currency.id}>
                    {currency.name} ({currency.symbol})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ mt: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="subtitle1">Product Items</Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddProductItem}
                >
                  Add Item
                </Button>
              </Box>
              {formData.productItems.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    mb: 3,
                    p: 2,
                    border: "1px solid #e0e0e0",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="subtitle2" mb={1}>
                    Item {index + 1}
                  </Typography>
                  <TextField
                    label="Item Name"
                    fullWidth
                    value={item.name}
                    onChange={(e) =>
                      handleProductItemChange(index, "name", e.target.value)
                    }
                    margin="normal"
                    required
                  />
                  <TextField
                    label="Item Arabic Name"
                    fullWidth
                    value={item.nameAr}
                    onChange={(e) =>
                      handleProductItemChange(index, "nameAr", e.target.value)
                    }
                    margin="normal"
                  />
                  <TextField
                    label="Barcode"
                    fullWidth
                    value={item.barcode}
                    onChange={(e) =>
                      handleProductItemChange(index, "barcode", e.target.value)
                    }
                    margin="normal"
                    required
                  />
                  <TextField
                    label="Cost"
                    fullWidth
                    type="number"
                    value={item.cost}
                    onChange={(e) =>
                      handleProductItemChange(index, "cost", e.target.value)
                    }
                    margin="normal"
                    required
                  />
                  <TextField
                    label="Price"
                    fullWidth
                    type="number"
                    value={item.price}
                    onChange={(e) =>
                      handleProductItemChange(index, "price", e.target.value)
                    }
                    margin="normal"
                    required
                  />
                  <TextField
                    label="Expiry Date"
                    fullWidth
                    type="date"
                    value={item.expiryDate}
                    onChange={(e) =>
                      handleProductItemChange(
                        index,
                        "expiryDate",
                        e.target.value
                      )
                    }
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                  {formData.productItems.length > 1 && (
                    <Button
                      color="error"
                      onClick={() => handleRemoveProductItem(index)}
                      sx={{ mt: 1 }}
                    >
                      Remove Item
                    </Button>
                  )}
                </Box>
              ))}
            </Box>
            <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
              <Button onClick={handleCloseCreate}>Cancel</Button>
              <Button
                onClick={handleCreateSubmit}
                variant="contained"
                disabled={
                  isCreating ||
                  isCategoriesLoading ||
                  isUnitsLoading ||
                  isCurrenciesLoading
                }
              >
                {isCreating ? "Creating..." : "Create Product"}
              </Button>
            </Box>
          </Box>
        }
      />
    </Box>
  );
};

export default ViewProducts;
