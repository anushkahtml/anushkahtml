import React, { useEffect, useState, useContext, useCallback } from "react";
import {
  Stepper, Step, StepLabel, Button, TextField, MenuItem, Select, FormControl, Container, Box, Typography, Card, CardContent, IconButton,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { AuthContext } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import CustomSnackbar from "../snackbar/CustomSnackbar";
import ConfirmOrder from "./ConfirmOrder"; // Import the ConfirmOrder component

const steps = ["Items", "Select Address", "Confirm Order"];

const Orders = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editAddressId, setEditAddressId] = useState(null);
  const [selectedAddressDetails, setSelectedAddressDetails] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const [newAddress, setNewAddress] = useState({
    name: "",
    contactNumber: "",
    street: "",
    city: "",
    state: "",
    landmark: "",
    zipcode: "",
  });

  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  // Use the AuthContext for authentication
  const { authToken, isLoggedIn } = useContext(AuthContext);

  // State for Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Function to show snackbar
  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Get order items from location state
  useEffect(() => {
    if (location.state && location.state.items) {
      setOrderItems(location.state.items);
    } else {
      // Sample order item for demonstration
      setOrderItems([{
        id: "123",
        name: "Shoes",
        category: "Footwear",
        description: "wndr-13 sports shoes for men | Latest Stylish Casual sport shoes for men |running shoes for boys | Lace up Lightweight grey shoes for running, walking, gym, trekking, hiking & party",
        quantity: 1,
        price: 1000
      }]);
    }
  }, [location]);

  // Define fetchAddresses with useCallback BEFORE you use it in useEffect
  const fetchAddresses = useCallback(async () => {
    try {
      if (!authToken) {
        console.error("No auth token available");
        return;
      }

      console.log("Fetching addresses with x-auth-token");

      const response = await fetch("/api/addresses", {
        method: "GET",
        headers: {
          "x-auth-token": authToken,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", errorText);
        throw new Error(`Failed to fetch addresses: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched addresses:", data);
      setAddresses(data);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      showSnackbar("Failed to fetch addresses. Please try again.", "error");
    }
  }, [authToken]);

  // Now use fetchAddresses in useEffect
  useEffect(() => {
    if (isLoggedIn && authToken) {
      fetchAddresses();
    }
  }, [isLoggedIn, authToken, fetchAddresses]);

  // Update selectedAddressDetails when selectedAddress changes
  useEffect(() => {
    if (selectedAddress && addresses.length > 0) {
      const addressDetails = addresses.find(addr => addr.id === selectedAddress);
      setSelectedAddressDetails(addressDetails);
    } else {
      setSelectedAddressDetails(null);
    }
  }, [selectedAddress, addresses]);

  const handleNext = () => {
    if (activeStep === 1 && !selectedAddress) {
      showSnackbar("Please select an address!", "error");
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (activeStep === 1) {
      // Navigate back to the product details page
      const productId = orderItems[0]?.id;
      if (productId) {
        navigate(`/products/${productId}`);
      } else {
        navigate('/products'); // Fallback if no product ID
      }
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      showSnackbar("Order placed successfully!", "success");
      
      setTimeout(() => {
        navigate("/products");
      }, 3000);
    } catch (error) {
      console.error("Error placing order:", error);
      showSnackbar("Failed to place order. Please try again.", "error");
    }
  };

  const handleSaveAddress = async () => {
    // Validate required fields
    if (!newAddress.name || !newAddress.contactNumber || !newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zipcode) {
      showSnackbar("Please fill in all required fields.", "error");
      return;
    }

    try {
      if (isEditing && editAddressId) {
        // Update existing address
        await updateAddress();
      } else {
        // Create new address
        await createAddress();
      }
    } catch (error) {
      console.error("Address operation failed:", error);
    }
  };

  // Function to create a new address
  const createAddress = async () => {
    try {
      if (!authToken) {
        showSnackbar("Authentication token not available. Please login again.", "error");
        return;
      }

      console.log("Creating address with x-auth-token");

      const response = await fetch("/api/addresses", {
        method: "POST",
        headers: {
          "x-auth-token": authToken,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newAddress),
      });

      // Handle 401 error specifically
      if (response.status === 401) {
        console.error("Authentication error - please login again");
        showSnackbar("Your session may have expired. Please login again.", "error");
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", errorText);
        throw new Error(`Failed to save address: ${response.status}`);
      }

      const data = await response.json();
      console.log("Address saved:", data);

      // Update addresses list with new address
      setAddresses([...addresses, data]);
      setSelectedAddress(data.id);
      resetAddressForm();
      showSnackbar("Address saved successfully!", "success");
    } catch (error) {
      console.error("Error saving address:", error);
      showSnackbar(`Failed to save address: ${error.message}`, "error");
    }
  };

  // Function to update an existing address
  const updateAddress = async () => {
    try {
      if (!authToken) {
        showSnackbar("Authentication token not available. Please login again.", "error");
        return;
      }

      const response = await fetch(`/api/addresses/${editAddressId}`, {
        method: "PUT",
        headers: {
          "x-auth-token": authToken,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ...newAddress, id: editAddressId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", errorText);
        throw new Error(`Failed to update address: ${response.status}`);
      }

      const data = await response.json();

      // Update addresses list with updated address
      setAddresses(addresses.map((addr) => (addr.id === editAddressId ? data : addr)));
      resetAddressForm();
      setIsEditing(false);
      setEditAddressId(null);
      showSnackbar("Address updated successfully!", "success");
    } catch (error) {
      console.error("Error updating address:", error);
      showSnackbar(`Failed to update address: ${error.message}`, "error");
    }
  };

  // Handle opening delete confirmation dialog
  const openDeleteDialog = (id) => {
    setAddressToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Handle closing delete confirmation dialog
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setAddressToDelete(null);
  };

  // Function to delete an address
  const handleDeleteAddress = async () => {
    try {
      if (!authToken) {
        showSnackbar("Authentication token not available. Please login again.", "error");
        return;
      }

      const response = await fetch(`/api/addresses/${addressToDelete}`, {
        method: "DELETE",
        headers: {
          "x-auth-token": authToken
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", errorText);
        throw new Error(`Failed to delete address: ${response.status}`);
      }

      // Update addresses list by removing deleted address
      setAddresses(addresses.filter((addr) => addr.id !== addressToDelete));
      if (selectedAddress === addressToDelete) {
        setSelectedAddress("");
      }
      showSnackbar("Address deleted successfully!", "success");

      // Close the dialog
      closeDeleteDialog();
    } catch (error) {
      console.error("Error deleting address:", error);
      showSnackbar(`Failed to delete address: ${error.message}`, "error");
      closeDeleteDialog();
    }
  };

  // Function to edit an address
  const handleEditAddress = (address) => {
    setNewAddress({
      name: address.name,
      contactNumber: address.contactNumber,
      street: address.street,
      city: address.city,
      state: address.state,
      landmark: address.landmark || "",
      zipcode: address.zipcode,
    });
    setIsEditing(true);
    setEditAddressId(address.id);
  };

  // Reset address form
  const resetAddressForm = () => {
    setNewAddress({
      name: "",
      contactNumber: "",
      street: "",
      city: "",
      state: "",
      landmark: "",
      zipcode: "",
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    resetAddressForm();
    setIsEditing(false);
    setEditAddressId(null);
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <Container>
      <Box sx={{ width: "100%", margin: "20px auto" }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {activeStep === 1 && (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Typography variant="h6" sx={{ marginTop: 2 }}>
            Select Address
          </Typography>

          <FormControl sx={{ width: "50%", margin: "20px 0", 
          position: "relative",
          zIndex: 1}}>
            <Select
              value={selectedAddress}
              onChange={(e) => setSelectedAddress(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">
    <em>Select...</em>
  </MenuItem>

              {addresses.length === 0 ? (
                <MenuItem disabled value="">
                  No addresses available
                </MenuItem>
              ) : (
                addresses.map((address) => (
                  <MenuItem key={address.id} value={address.id}>
                    {address.name} - {address.street}, {address.city}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          {/* Display selected address details */}
          {selectedAddress && (
            <Box sx={{ width: "50%", marginBottom: 3 }}>
              <Typography variant="h6">Selected Address</Typography>
              {addresses
                .filter((addr) => addr.id === selectedAddress)
                .map((address) => (
                  <Card key={address.id} sx={{ marginTop: 1 }}>
                    <CardContent>
                      <Typography variant="body1"><strong>{address.name}</strong></Typography>
                      <Typography variant="body2">Contact: {address.contactNumber}</Typography>
                      <Typography variant="body2">
                        {address.street}, {address.city}, {address.state} - {address.zipcode}
                      </Typography>
                      {address.landmark && <Typography variant="body2">Landmark: {address.landmark}</Typography>}
                      <Box sx={{ display: "flex", justifyContent: "flex-end", marginTop: 1 }}>
                        <IconButton size="small" onClick={() => handleEditAddress(address)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => openDeleteDialog(address.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
            </Box>
          )}

          <Typography
            variant="h6"
            sx={{ margin: "10px 0", textAlign: "center", width: "50%" }}
          >
            -OR-
          </Typography>

          <Typography variant="h6" sx={{ marginTop: 3 }}>
            {isEditing ? "Edit Address" : "Add Address"}
          </Typography>

          <Box sx={{ width: "40%", display: "flex", flexDirection: "column", gap: 2, marginTop: 2 }}>
            <TextField label="Name *" fullWidth value={newAddress.name} onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })} />
            <TextField label="Contact Number *" fullWidth value={newAddress.contactNumber} onChange={(e) => setNewAddress({ ...newAddress, contactNumber: e.target.value })} />
            <TextField label="Street *" fullWidth value={newAddress.street} onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })} />
            <TextField label="City *" fullWidth value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} />
            <TextField label="State *" fullWidth value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} />
            <TextField label="Landmark" fullWidth value={newAddress.landmark} onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })} />
            <TextField label="Zipcode *" fullWidth value={newAddress.zipcode} onChange={(e) => setNewAddress({ ...newAddress, zipcode: e.target.value })} />
          </Box>

          <Box sx={{ display: "flex", gap: 2, marginTop: 2, width: "40%" }}>
            <Button variant="outlined" onClick={handleSaveAddress} sx={{ width: "100%", backgroundColor: "#3f51b5", color: "#ffffff" }}>
              {isEditing ? "Update Address" : "Save Address"}
            </Button>
            {isEditing && (
              <Button variant="outlined" color="secondary" onClick={handleCancelEdit}>
                Cancel
              </Button>
            )}
          </Box>
        </Box>
      )}

      {activeStep === 2 && (
        <Box>
          {/* Use the ConfirmOrder component here */}
          <ConfirmOrder
            orderItems={orderItems}
            selectedAddress={selectedAddressDetails}
            calculateTotalPrice={calculateTotalPrice}
          />
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 4, marginBottom: 2 }}>
        {activeStep > 0 && (
          <Button onClick={handleBack} variant="outlined" sx={{ border: "none" }}>
            BACK
          </Button>
        )}

        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            color="primary"
            onClick={handlePlaceOrder}
            sx={{ backgroundColor: "#3f51b5" }}
          >
            PLACE ORDER
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            sx={{ backgroundColor: "#3f51b5" }}
          >
            NEXT
          </Button>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Delete Address"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this address? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteAddress} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Custom Snackbar component */}
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

export default Orders;