import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Button, Container, Typography, Box, TextField, Paper, Grid, CircularProgress
} from "@mui/material";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/products/${id}`);
        setProduct(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product details:", error);
        setError("Failed to load product details. Please try again later.");
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  const handleQuantityChange = (event) => {
    const value = parseInt(event.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  const handlePlaceOrder = () => {
    // Create a copy of the product with the selected quantity
    const orderItem = {
      id: product.id,
      name: product.name,
      category: product.category,
      description: product.description,
      quantity: quantity,
      price: product.price
    };
    
    // Navigate to orders page with the selected product
    navigate("/orders", { state: { items: [orderItem] } });
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Box mt={4}>
          <Typography variant="h6" color="error" align="center">
            {error}
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container>
        <Box mt={4}>
          <Typography variant="h6" align="center">
            Product not found.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Paper elevation={0} sx={{ p: 0, border: "none", overflow: "hidden" }}>
        <Grid container>
          {/* Product Image */}
          <Grid item xs={12} md={6} sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 4 }}>
            <Box 
              component="img"
              sx={{ width: "350px", height: "300px", objectFit: "cover" }}
              src={product.imageUrl || "https://placehold.co/350x350"}
              alt={product.name}
              onError={(e) => {
                e.target.src = "https://placehold.co/350x350";
                e.target.alt = "Product image not available";
              }}
            />
          </Grid>
          
          {/* Product Details */}
          <Grid item xs={12} md={6} sx={{ p: 4, bgcolor: "white" }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 500 }}>
              {product.name}
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Category: <strong>{product.category}</strong>
              </Typography>
              <Box sx={{ 
                mt: 1, 
                display: "inline-block", 
                padding: "6px 14px", 
                border: "2px solid blue", 
                borderRadius: "20px",
                backgroundColor: "#3f51b5",
                color: "#fff",
                fontWeight: "550"
              }}>
                Available Quantity: {product.quantity || 148}
              </Box>
            </Box>
            
            <Typography variant="body1" paragraph sx={{ my: 3, display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: showFullDescription ? "none" : 3, overflow: "hidden" }}>
              {product.description}
            </Typography>
            {product.description && product.description.length > 150 && (
              <Button onClick={() => setShowFullDescription(!showFullDescription)} sx={{ textTransform: "none" }}>
                {showFullDescription ? "Read Less" : "Read More"}
              </Button>
            )}
            
            <Typography variant="h5" color="error" sx={{ fontWeight: 600, mb: 3 }}>
              ₹{product.price}
            </Typography>
            
            <Box sx={{ mb: 4 }}>
              <TextField
                label="Enter Quantity *"
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                inputProps={{ min: 1, max: 99 }}
                sx={{
                    width: "300px",
                    "& .MuiInputBase-root": { height: "50px" },
                    "& .MuiInputBase-input": { height: "50px", padding: "0 14px" },
                  }}
              />
            </Box>
            
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              sx={{ minWidth: "150px", fontWeight: "600", backgroundColor: "#3f51b5", "&:hover": { backgroundColor: "#303f9f" } }}
              onClick={handlePlaceOrder}
            >
              PLACE ORDER
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default ProductDetails;