import React, { useEffect, useState, useCallback } from "react";
import { FormControl, Select, MenuItem } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
    Button, Card, CardContent, CardMedia, Typography, Grid, ToggleButtonGroup, ToggleButton,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, Alert,
    Menu, Tooltip
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

const ProductsPage = ({ isAdmin, searchQuery }) => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, productId: null, productName: "" });
    const [sortOption, setSortOption] = useState("");
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    const [anchorEl, setAnchorEl] = useState(null);
    
    // Maximum number of categories to show in the toggle bar
    const MAX_VISIBLE_CATEGORIES = 8;

    const showSnackbar = useCallback((message, severity = "success") => {
        setSnackbar({ open: true, message, severity });
    }, []);


    const fetchProducts = useCallback(async () => {
        try {
            const response = await axios.get("/api/products");
            setProducts(response.data);
            
            // Extract categories from products
            const uniqueCategories = [...new Set(response.data.map(product => product.category))].filter(Boolean);
            setCategories(uniqueCategories);
        } catch (error) {
            console.error("Error fetching products:", error);
            showSnackbar("Failed to load products", "error");
        }
    }, [showSnackbar]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleDelete = async (productId) => {
        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                showSnackbar("Unauthorized: Please log in", "error");
                return;
            }

            if (!productId) {
                console.error("Invalid productId");
                showSnackbar("Error: Invalid product ID", "error");
                return;
            }

            await axios.delete(`/api/products/${productId}`, {
                headers: {
                    "x-auth-token": token
                }
            });

            // Update local state after successful deletion
            const updatedProducts = products.filter((p) => p.id !== productId && p._id !== productId);
            setProducts(updatedProducts);
            
            // Recalculate categories after deletion
            const updatedCategories = [...new Set(updatedProducts.map(product => product.category))].filter(Boolean);
            setCategories(updatedCategories);
            
            // If the deleted product's category no longer exists and it was selected, reset to "All"
            if (selectedCategory && !updatedCategories.includes(selectedCategory)) {
                setSelectedCategory("");
            }
            
            showSnackbar("Product deleted successfully", "success");
        } catch (error) {
            console.error("Error deleting product:", error);
            showSnackbar("Failed to delete product. Check authentication.", "error");
        }
    };

    const handleEditClick = (productId) => {
        navigate(`/edit-product/${productId}`);
    };

    // Navigate to product details page
    const handleBuyClick = (productId) => {
        navigate(`/products/${productId}`);
    };

    const handleCategoryMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCategoryMenuClose = () => {
        setAnchorEl(null);
    };

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        handleCategoryMenuClose();
    };

    const filterAndSortProducts = useCallback(() => {
        let filteredProducts = products.filter((product) =>
            (!selectedCategory || product.category === selectedCategory) &&
            (product.name.toLowerCase().includes((searchQuery || "").toLowerCase()))
        );

        let sortedProducts = [...filteredProducts]; // Copy array to prevent mutation

        switch (sortOption) {
            case "priceLowToHigh":
                sortedProducts.sort((a, b) => a.price - b.price);
                break;
            case "priceHighToLow":
                sortedProducts.sort((a, b) => b.price - a.price);
                break;
            case "newest":
                // Simply reverse the default order (which is oldest to newest)
                sortedProducts.reverse();
                break;
            default:
                break;
        }

        setDisplayedProducts(sortedProducts);
    }, [products, selectedCategory, searchQuery, sortOption]);

    useEffect(() => {
        filterAndSortProducts();
    }, [filterAndSortProducts]);

    // Split categories into visible and hidden
    const visibleCategories = categories.slice(0, MAX_VISIBLE_CATEGORIES);
    const overflowCategories = categories.slice(MAX_VISIBLE_CATEGORIES);

    return (
        <div style={{ padding: "20px 80px" }}>
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, productId: null, productName: "" })}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete the product "{deleteDialog.productName}"?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, productId: null, productName: "" })}>Cancel</Button>
                    <Button
                        onClick={() => {
                            if (deleteDialog.productId) {
                                handleDelete(deleteDialog.productId);
                                setDeleteDialog({ open: false, productId: null, productName: "" });
                            } else {
                                showSnackbar("Invalid product ID", "error");
                            }
                        }}
                        variant="contained"
                        color="error"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar 
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert 
                    onClose={() => setSnackbar({ ...snackbar, open: false })} 
                    severity={snackbar.severity}
                    sx={{ width: '100%', backgroundColor: snackbar.message.includes("Product deleted successfully") ? "#4CAF50" : "" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Category Filter */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                <ToggleButtonGroup
                    value={selectedCategory}
                    exclusive
                    onChange={(e, newCategory) => setSelectedCategory(newCategory || "")}
                >
                    <ToggleButton value="">All</ToggleButton>
                    {visibleCategories.map((category) => (
                        <ToggleButton key={category} value={category}>{category}</ToggleButton>
                    ))}
                    {overflowCategories.length > 0 && (
                        <Tooltip title="More categories">
                            <ToggleButton value="more" onClick={handleCategoryMenuOpen}>
                                <MoreHorizIcon />
                            </ToggleButton>
                        </Tooltip>
                    )}
                </ToggleButtonGroup>
                
                {/* Overflow menu for additional categories */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleCategoryMenuClose}
                >
                    {overflowCategories.map((category) => (
                        <MenuItem 
                            key={category} 
                            onClick={() => handleCategorySelect(category)}
                            selected={selectedCategory === category}
                        >
                            {category}
                        </MenuItem>
                    ))}
                </Menu>
            </div>

            {/* Sort Dropdown */}
            <div style={{ marginTop: "16px" }}>
                <Typography variant="h6" sx={{ fontWeight: "600" }}>
                    Sort By:
                </Typography>
                <FormControl sx={{ minWidth: 200 }}>
                    <Select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                        displayEmpty
                        style={{ width: 300, height: 45 }}
                        renderValue={(selected) =>
                            selected ? selected : <em style={{ color: "#9e9e9e" }}>Select...</em>
                        }
                    >
                        <MenuItem value="" disabled>
                        </MenuItem>
                        <MenuItem value="default">Default</MenuItem>
                        <MenuItem value="priceLowToHigh">Price: Low to High</MenuItem>
                        <MenuItem value="priceHighToLow">Price: High to Low</MenuItem>
                        <MenuItem value="newest">Newest</MenuItem>
                    </Select>
                </FormControl>
            </div>

            {/* Product Grid */}
            <Grid container spacing={6} justifyContent="center">
                {displayedProducts.map((product) => (
                    <Grid item xs={12} sm={6} mt={4} md={4} key={product.id || product._id} style={{ display: "flex", justifyContent: "center" }}>
                        <Card style={{ width: "300px", height: "420px", display: "flex", flexDirection: "column" }}>
                            <CardMedia
                                component="img"
                                height="200"
                                image={product.imageUrl || "https://placehold.co/300x200"}
                                alt={product.name}
                                style={{ objectFit: "cover", width: "100%" }}
                            />
                            <CardContent style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                <Typography variant="h6">{product.name}</Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {product.description && product.description.length > 100
                                        ? `${product.description.substring(0, 100)}...`
                                        : product.description}
                                </Typography>
                                <Typography variant="h6">₹{product.price}</Typography>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                                    <Button 
                                        variant="contained" 
                                        color="primary" 
                                        size="small" 
                                        style={{ width: "25%" }}
                                        onClick={() => handleBuyClick(product.id || product._id)}
                                    >
                                        BUY
                                    </Button>
                                    {isAdmin && (
                                        <div style={{ display: "flex", gap: "8px" }}>
                                            <IconButton 
                                                color="primary" 
                                                size="small"
                                                onClick={() => handleEditClick(product.id || product._id)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton 
                                                color="error" 
                                                size="small" 
                                                onClick={() => setDeleteDialog({ 
                                                    open: true, 
                                                    productId: product.id || product._id, 
                                                    productName: product.name 
                                                })}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </div>
    );
};

export default ProductsPage;