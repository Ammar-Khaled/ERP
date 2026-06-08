"use client";

import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Add } from "@mui/icons-material";

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

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "all 0.3s ease-in-out",
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[3],
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[8],
  },
  position: "relative",
  overflow: "hidden",
}));

const DiscountBadge = styled(Chip)(({ theme }) => ({
  position: "absolute",
  top: theme.spacing(1),
  right: theme.spacing(1),
  backgroundColor: theme.palette.error.main,
  color: theme.palette.common.white,
  fontWeight: "bold",
}));

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 600,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1, 2),
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
  "&:hover": {
    background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
  },
}));

export default function ProductCard({
  product,
  onAddToCart,
}: ProductCardProps) {
  return (
    <StyledCard onClick={() => onAddToCart(product)}>
      {product.discount > 0 && (
        <DiscountBadge label={`${product.discount}% OFF`} />
      )}
      <CardMedia
        component="img"
        height="140"
        image={product.image}
        alt={product.name}
        sx={{ objectFit: "cover", backgroundColor: "#f5f5f5" }}
      />
      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          padding: 1,
          "&:last-child": {
            paddingBottom: 0,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "70%",
            }}
          >
            {product.name}
          </Typography>
          <Typography
            variant="subtitle1"
            color="primary"
            sx={{ fontWeight: 600 }}
          >
            ${product.price.toFixed(2)}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {product.totalNumberOfValid}
        </Typography>
        <StyledButton
          variant="contained"
          startIcon={<Add />}
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          fullWidth
        >
          Add to Cart
        </StyledButton>
      </CardContent>
    </StyledCard>
  );
}
