"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
  Skeleton,
} from "@mui/material";
import {
  ShoppingCart,
  Search,
  Add,
  Remove,
  Delete,
  CreditCard,
  AccountBalanceWallet,
  LocalOffer,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import HeaderPOS from "../_components/HeaderPOS";
import ProductCard from "../_components/ProductCard";
import {
  useGetproductItemsQuery,
  useProductSearchQuery,
} from "@/store/slice/productApiSlice";
import { useCreateOrderMutation } from "@/store/slice/ordersApiSlice";
import { showToast } from "@/utils/ToastNotifications";
// Types
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  barcode?: string;
  discount: number;
  totalNumberOfValid: number;
}

interface CartItem extends Product {
  quantity: number;
}

interface Customer {
  id: string;
  name: string;
  loyaltyPoints: number;
}

interface Employee {
  id: string;
  name: string;
  role: string;
}

// Sample data
const customers: Customer[] = [
  { id: "1", name: "John Smith", loyaltyPoints: 150 },
  { id: "2", name: "Sarah Johnson", loyaltyPoints: 300 },
  { id: "3", name: "Michael Brown", loyaltyPoints: 75 },
];

const employees: Employee[] = [
  { id: "1", name: "David Wilson", role: "Sales Associate" },
  { id: "2", name: "Emma Davis", role: "Sales Associate" },
  { id: "3", name: "James Miller", role: "Manager" },
];

const StyledPaper = styled(Paper)(({ theme }) => ({
  height: "calc(100vh - 64px)",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
}));

export default function POSPage() {
  const theme = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchInput, setSearchInput] = useState(""); // Temporary input for search
  const [searchQuery, setSearchQuery] = useState(""); // Submitted search query
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [barcodeSearch, setBarcodeSearch] = useState("");
  const [page, setPage] = useState(1);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [error, setError] = useState("");
  const limit = 10;

  // Fetch data based on searchQuery
  const {
    data: searchData,
    isLoading: isSearchLoading,
    isError: isSearchError,
  } = useProductSearchQuery(
    { name: searchQuery, page, limit },
    { skip: !searchQuery }
  );
  const {
    data: itemsData,
    isLoading: isItemsLoading,
    isError: isItemsError,
  } = useGetproductItemsQuery({ page, limit }, { skip: !!searchQuery });
  const [createOrder, { isLoading: isOrderLoading }] = useCreateOrderMutation();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Transform API data to match Product interface
  const products: Product[] = useMemo(() => {
    const data = searchQuery ? searchData : itemsData;
    if (data?.isSuccess && data?.data?.data) {
      return data.data.data.map((item: any) => ({
        id: item.id.toString(),
        name: item.name,
        price: parseFloat(item.price),
        category: item.categoryId.toString(),
        image: item.mainPhoto,
        barcode: item.barcode,
        discount: 0,
        totalNumberOfValid: item.totalNumberOfValid || 0,
      }));
    }
    return [];
  }, [searchData, itemsData, searchQuery]);

  const isLoading = searchQuery ? isSearchLoading : isItemsLoading;
  const isError = searchQuery ? isSearchError : isItemsError;

  const pagination = (searchQuery
    ? searchData?.data?.pagination
    : itemsData?.data?.pagination) || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  };

  const addToCart = (product: Product) => {
    if (product.totalNumberOfValid === 0) {
      setError("Product out of stock");
      showToast({ type: false, message: "Product out of stock" });
      return;
    }
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        if (existingItem.quantity >= product.totalNumberOfValid) {
          setError("Cannot add more; stock limit reached");
          showToast({
            type: false,
            message: "Cannot add more; stock limit reached",
          });
          return prevCart;
        }
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, change: number) => {
    const product = products.find((p) => p.id === id);
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(
                0,
                Math.min(
                  item.quantity + change,
                  product?.totalNumberOfValid || item.quantity
                )
              ),
            }
          : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === "SAVE10") {
      const subtotal = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      setCouponDiscount(subtotal * 0.1);
      setError("");
      showToast({ type: true, message: "Coupon applied successfully" });
    } else {
      setCouponDiscount(0);
      setError("Invalid coupon code");
      showToast({ type: false, message: "Invalid coupon code" });
    }
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const itemDiscountTotal = cart.reduce(
      (sum, item) => sum + (item.discount / 100) * item.price * item.quantity,
      0
    );
    const subtotalAfterItemDiscounts = subtotal - itemDiscountTotal;
    const couponDiscountTotal = couponDiscount;
    const tax = (subtotalAfterItemDiscounts - couponDiscountTotal) * 0.1;
    const total = subtotalAfterItemDiscounts - couponDiscountTotal + tax;
    return { subtotal, itemDiscountTotal, couponDiscountTotal, tax, total };
  };

  const { subtotal, itemDiscountTotal, couponDiscountTotal, tax, total } =
    calculateTotals();

  const handlePayNow = async () => {
    if (!selectedCustomer) {
      setError("Please select a customer");
      showToast({ type: false, message: "Please select a customer" });
      return;
    }
    if (!selectedEmployee) {
      setError("Please select an employee");
      showToast({ type: false, message: "Please select an employee" });
      return;
    }

    const orderData = {
      date: new Date().toISOString(),
      inventoryId: 1, // Mocked, replace with actual inventoryId
      clientId: parseInt(selectedCustomer),
      couponId: couponCode.toUpperCase() === "SAVE10" ? 1 : 0, // Mocked couponId
      currencyId: 1, // Mocked, replace with actual currencyId
      items: cart.map((item) => ({
        numberOfItems: item.quantity,
        productItemId: parseInt(item.id),
      })),
    };

    try {
      const response = await createOrder(orderData).unwrap();
      if (response.isSuccess) {
        showToast({
          type: true,
          message: response.message || "Order created successfully",
        });
        clearCart();
        setSelectedCustomer("");
        setSelectedEmployee("");
        setCouponCode("");
        setCouponDiscount(0);
        setSelectedPaymentMethod("");
      } else {
        showToast({
          type: false,
          message: response.message || "Failed to create order",
        });
      }
    } catch (error: any) {
      showToast({
        type: false,
        message: error?.data?.message || "Failed to create order",
      });
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    const product = products.find((p) => p.barcode === barcodeSearch);
    if (product) {
      addToCart(product);
      setBarcodeSearch("");
    }
  }, [barcodeSearch, products]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchQuery(searchInput.trim());
      setPage(1); // Reset page on new search
    }
  };

  const paymentMethods = [
    { value: "cash", label: "Cash", icon: <AccountBalanceWallet /> },
    { value: "credit", label: "Credit Card", icon: <CreditCard /> },
    { value: "debit", label: "Debit Card", icon: <CreditCard /> },
    { value: "mobile", label: "Mobile Payment", icon: <LocalOffer /> },
  ];

  const renderCart = () => (
    <Grid item xs={12} lg={4}>
      <StyledPaper>
        {isLoading && <Typography>Loading...</Typography>}
        {isError && (
          <Typography color="error">Error loading products</Typography>
        )}
        {error && <Typography color="error">{error}</Typography>}
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">
            <ShoppingCart sx={{ mr: 1, verticalAlign: "middle" }} />
            Shopping Cart
          </Typography>
          <Button
            variant="text"
            onClick={clearCart}
            disabled={cart.length === 0}
          >
            Clear Cart
          </Button>
        </Box>

        <Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>
          {cart.map(
            (item) =>
              item.quantity > 0 && (
                <Box key={item.id} sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1">{item.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        ${item.price.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Discount: {item.discount}%
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(item.id, -1)}
                        aria-label="Decrease quantity"
                        disabled={item.quantity === 1}
                      >
                        <Remove />
                      </IconButton>
                      <Typography>{item.quantity}</Typography>
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(item.id, 1)}
                        aria-label="Increase quantity"
                        disabled={item.quantity >= item.totalNumberOfValid}
                      >
                        <Add />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(item.id, -item.quantity)}
                        aria-label="Remove item"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                </Box>
              )
          )}
        </Box>

        <Box sx={{ p: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography>Subtotal</Typography>
              <Typography>${subtotal.toFixed(2)}</Typography>
            </Box>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography color="text.secondary">Item Discounts</Typography>
              <Typography color="text.secondary">
                -${itemDiscountTotal.toFixed(2)}
              </Typography>
            </Box>
            {couponDiscount > 0 && (
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography color="text.secondary">
                  Coupon ({couponCode})
                </Typography>
                <Typography color="text.secondary">
                  -${couponDiscount.toFixed(2)}
                </Typography>
              </Box>
            )}
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography color="text.secondary">Tax (10%)</Typography>
              <Typography color="text.secondary">${tax.toFixed(2)}</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6">${total.toFixed(2)}</Typography>
            </Box>
          </Box>

          <Grid container spacing={1} sx={{ mb: 2 }}>
            <Grid item xs={8}>
              <TextField
                fullWidth
                label="Coupon Code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocalOffer />
                    </InputAdornment>
                  ),
                }}
                aria-label="Enter coupon code"
              />
            </Grid>
            <Grid item xs={4}>
              <Button
                fullWidth
                variant="outlined"
                onClick={applyCoupon}
                disabled={!couponCode}
              >
                Apply
              </Button>
            </Grid>
          </Grid>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="payment-method-label">Payment Method</InputLabel>
            <Select
              labelId="payment-method-label"
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              label="Payment Method"
              aria-label="Select payment method"
            >
              {paymentMethods.map((method) => (
                <MenuItem key={method.value} value={method.value}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {method.icon}
                    {method.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            fullWidth
            variant="contained"
            size="large"
            disabled={
              cart.length === 0 || !selectedPaymentMethod || isOrderLoading
            }
            onClick={handlePayNow}
          >
            {isOrderLoading ? "Processing..." : "Pay Now"}
          </Button>
        </Box>
      </StyledPaper>
    </Grid>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <HeaderPOS />
      <Box
        sx={{
          width: "90%",
          display: "flex",
          justifyContent: "center",
          margin: "0 auto",
          flexDirection: "column",
          padding: 2,
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab label="Products" />
          <Tab label="Details" />
        </Tabs>

        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            {activeTab === 0 ? (
              <>
                <Box sx={{ p: 2 }}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      placeholder="Search products..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search />
                          </InputAdornment>
                        ),
                      }}
                      aria-label="Search products"
                    />
                  </Grid>
                </Box>

                {isLoading && (
                  <Grid container spacing={2}>
                    {Array.from({ length: 6 }).map((_, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Skeleton variant="rectangular" height={140} />
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="text" width="40%" />
                        <Skeleton variant="rectangular" height={36} />
                      </Grid>
                    ))}
                  </Grid>
                )}
                {isError && (
                  <Typography color="error">Error loading products</Typography>
                )}
                {!isLoading && !isError && (
                  <Box sx={{ p: 2, flexGrow: 1, overflow: "auto" }}>
                    <Grid container spacing={2}>
                      {products.map((product) => (
                        <Grid item xs={12} sm={6} md={4} key={product.id}>
                          <ProductCard
                            product={product}
                            onAddToCart={addToCart}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
                {!isLoading &&
                  !isError &&
                  products.length === 0 &&
                  searchQuery && (
                    <Typography>
                      No products found for "{searchQuery}"
                    </Typography>
                  )}
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
              </>
            ) : (
              <StyledPaper>
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6">Customer Details</Typography>
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel id="customer-select-label">Customer</InputLabel>
                    <Select
                      labelId="customer-select-label"
                      value={selectedCustomer}
                      onChange={(e) => setSelectedCustomer(e.target.value)}
                      label="Customer"
                      aria-label="Select customer"
                    >
                      {customers.map((customer) => (
                        <MenuItem key={customer.id} value={customer.id}>
                          {customer.name} ({customer.loyaltyPoints} points)
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel id="employee-select-label">Employee</InputLabel>
                    <Select
                      labelId="employee-select-label"
                      value={selectedEmployee}
                      onChange={(e) => setSelectedEmployee(e.target.value)}
                      label="Employee"
                      aria-label="Select employee"
                    >
                      {employees.map((employee) => (
                        <MenuItem key={employee.id} value={employee.id}>
                          {employee.name} ({employee.role})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ p: 2 }}>
                  <TextField
                    fullWidth
                    label="Scan Barcode"
                    value={barcodeSearch}
                    onChange={(e) => setBarcodeSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocalOffer />
                        </InputAdornment>
                      ),
                    }}
                    aria-label="Scan barcode"
                  />
                </Box>
              </StyledPaper>
            )}
          </Grid>
          {renderCart()}
        </Grid>
      </Box>
    </Box>
  );
}
