/*
//Tried to separate the Address related logics from the Orders page but the Snackbar when you update the address successfully the progress bar just goes back and forth indefinitely/or sometimes freezes, it was atleast making Orders page have -350 lines of code, but yeah other than that Snackbar was working just fine for all the other parts...

import React, { useState, useEffect, useContext, useCallback } from "react";
import { Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from "@mui/material";
import { AuthContext } from "../../context/AuthContext";
import AddressSelection from "./AddressSelection";
import AddressForm from "./AddressForm";

const AddressManagement = ({ onAddressSelect, showSnackbar, setSnackbarOpen }) => {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editAddressId, setEditAddressId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [newAddress, setNewAddress] = useState({
    name: "",
    contactNumber: "",
    street: "",
    city: "",
    state: "",
    landmark: "",
    zipcode: "",
  });

  // Use the AuthContext for authentication
  const { authToken, isLoggedIn } = useContext(AuthContext);

  // Define fetchAddresses with useCallback 
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
  }, [authToken, showSnackbar]);

  // Use fetchAddresses in useEffect
  useEffect(() => {
    if (isLoggedIn && authToken) {
      fetchAddresses();
    }
  }, [isLoggedIn, authToken, fetchAddresses]);

  // Update selectedAddressDetails when selectedAddress changes
  useEffect(() => {
    if (selectedAddress && addresses.length > 0) {
      const addressDetails = addresses.find(addr => addr.id === selectedAddress);
      onAddressSelect(addressDetails);
    } else {
      onAddressSelect(null);
    }
  }, [selectedAddress, addresses, onAddressSelect]);

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
      
      setTimeout(() => {
        setSnackbarOpen(false); // Using the prop passed from parent
      }, 5000);

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

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      <AddressSelection 
        addresses={addresses}
        selectedAddress={selectedAddress}
        setSelectedAddress={setSelectedAddress}
        handleEditAddress={handleEditAddress}
        handleDeleteAddress={openDeleteDialog}
      />

      <Box sx={{ width: "40%" }}>
        <AddressForm 
          newAddress={newAddress}
          setNewAddress={setNewAddress}
          handleSaveAddress={handleSaveAddress}
          isEditing={isEditing}
          handleCancelEdit={handleCancelEdit}
        />
      </Box>
      
      //Delete Confirmation Dialog
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
    </Box>
  );
};

export default AddressManagement;
*/