import React, { useState, useContext, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  Box,
  Button,
  FormControl,
  Autocomplete,
  Paper,
  CircularProgress
} from "@mui/material";
import { AuthContext } from "../../context/AuthContext";
import CustomSnackbar from "../snackbar/CustomSnackbar";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

// Categories available for suggestions
const categories = [
  "Apparel",
  "Electronics",
  "Furniture",
  "Footwear",
  "Personal Care",
  "Books",
  "Toys",
  "Clothes"
];

const AddOrModifyProduct = () => {
  const { authToken } = useContext(AuthContext);
  const { id } = useParams(); // Get product ID from URL if editing
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  // Loading state
  const [loading, setLoading] = useState(isEditMode);
  
  // Product state
  const [product, setProduct] = useState({
    name: "",
    category: "",
    manufacturer: "",
    availableItems: "",
    price: "",
    imageUrl: "",
    description: ""
  });
  
  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  
  // Fetch product data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchProductDetails = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`/api/products/${id}`);
          const productData = response.data;
          
          setProduct({
            name: productData.name || "",
            category: productData.category || "",
            manufacturer: productData.manufacturer || "",
            availableItems: productData.availableItems || "",
            price: productData.price || "",
            imageUrl: productData.imageUrl || "",
            description: productData.description || ""
          });
          
          setLoading(false);
        } catch (error) {
          console.error("Error fetching product details:", error);
          showSnackbar("Failed to load product details", "error");
          setLoading(false);
        }
      };
      
      fetchProductDetails();
    }
  }, [id, isEditMode]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prevProduct => ({
      ...prevProduct,
      [name]: value
    }));
  };
  
  // Handle category change specifically
  const handleCategoryChange = (event, newValue) => {
    setProduct({
      ...product,
      category: newValue
    });
  };
  
  // Show snackbar helper function
  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  
  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!product.name || !product.category || !product.manufacturer || 
        !product.availableItems || !product.price) {
      showSnackbar("Please fill in all required fields", "error");
      return;
    }
    
    try {
      // Prepare data for API
      const productData = {
        name: product.name,
        category: product.category,
        manufacturer: product.manufacturer,
        availableItems: parseInt(product.availableItems),
        price: parseFloat(product.price),
        imageUrl: product.imageUrl || undefined,
        description: product.description || undefined
      };
      
      let response;
      
      if (isEditMode) {
        // Update existing product
        productData.id = id; // Add ID for update
        response = await fetch(`/api/products/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": authToken
          },
          body: JSON.stringify(productData)
        });
      } else {
        // Create new product
        response = await fetch("/api/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": authToken
          },
          body: JSON.stringify(productData)
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isEditMode ? 'update' : 'add'} product`);
      }
      
      const result = await response.json();
      console.log(`Product ${isEditMode ? 'updated' : 'added'} successfully:`, result);
      
      showSnackbar(`Product ${isEditMode ? 'updated' : 'added'} successfully!`);
      
      // Redirect to products page after successful submission with a slight delay
      setTimeout(() => {
        navigate("/products");
      }, 1500);
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} product:`, error);
      showSnackbar(error.message || `Failed to ${isEditMode ? 'update' : 'add'} product`, "error");
    }
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
  
  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={0} sx={{ p: 0, border: "none" }}>
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" component="h1">
            {isEditMode ? 'Edit Product' : 'Add Product'}
          </Typography>
        </Box>
        
        <form onSubmit={handleSubmit}>
          <Box mb={2}>
            <TextField
              fullWidth
              label="Name *"
              name="name"
              value={product.name}
              onChange={handleChange}
              placeholder="Comfortable Chair"
              required
            />
          </Box>
          
          <Box mb={2}>
            <FormControl fullWidth>
              <Autocomplete
                freeSolo
                options={categories}
                value={product.category}
                onChange={handleCategoryChange}
                inputValue={product.category}
                onInputChange={(event, newInputValue) => {
                  setProduct({
                    ...product,
                    category: newInputValue
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Category *"
                    name="category"
                    required
                    placeholder="Furniture"
                  />
                )}
              />
            </FormControl>
          </Box>
          
          <Box mb={2}>
            <TextField
              fullWidth
              label="Manufacturer *"
              name="manufacturer"
              value={product.manufacturer}
              onChange={handleChange}
              placeholder="Nilkamal"
              required
            />
          </Box>
          
          <Box mb={2}>
            <TextField
              fullWidth
              label="Available Items *"
              name="availableItems"
              type="number"
              value={product.availableItems}
              onChange={handleChange}
              placeholder="10"
              required
              inputProps={{ min: 0 }}
            />
          </Box>
          
          <Box mb={2}>
            <TextField
              fullWidth
              label="Price *"
              name="price"
              type="number"
              value={product.price}
              onChange={handleChange}
              placeholder="10000"
              required
              inputProps={{ min: 0, step: "0.01" }}
            />
          </Box>
          
          <Box mb={2}>
            <TextField
              fullWidth
              label="Image URL"
              name="imageUrl"
              value={product.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </Box>
          
          <Box mb={3}>
            <TextField
              fullWidth
              label="Product Description"
              name="description"
              value={product.description}
              onChange={handleChange}
              multiline
              rows={4}
            />
          </Box>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              backgroundColor: "#3f51b5",
              color: "white",
              py: 1.5,
              mb: 2,
              "&:hover": {
                backgroundColor: "#303f9f"
              }
            }}
          >
            {isEditMode ? 'UPDATE PRODUCT' : 'SAVE PRODUCT'}
          </Button>
        </form>
      </Paper>
      
      <CustomSnackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        severity={snackbarSeverity}
        backgroundColor={snackbarSeverity === "success" ? "#4caf50" : "#e64d3d"}
        textColor="#ffffff"
        progressColor="#ffffff"
      />
    </Container>
  );
};

export default AddOrModifyProduct;