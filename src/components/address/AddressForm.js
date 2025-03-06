import React from "react";
import { Box, TextField, Button, Typography } from "@mui/material";

const AddressForm = ({ 
  newAddress, 
  setNewAddress, 
  handleSaveAddress, 
  isEditing, 
  handleCancelEdit 
}) => {
  return (
    <>
      <Typography variant="h6" sx={{ marginTop: 3 }}>
        {isEditing ? "Edit Address" : "Add Address"}
      </Typography>

      <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2, marginTop: 2 }}>
        <TextField 
          label="Name *" 
          fullWidth 
          value={newAddress.name} 
          onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })} 
        />
        <TextField 
          label="Contact Number *" 
          fullWidth 
          value={newAddress.contactNumber} 
          onChange={(e) => setNewAddress({ ...newAddress, contactNumber: e.target.value })} 
        />
        <TextField 
          label="Street *" 
          fullWidth 
          value={newAddress.street} 
          onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })} 
        />
        <TextField 
          label="City *" 
          fullWidth 
          value={newAddress.city} 
          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} 
        />
        <TextField 
          label="State *" 
          fullWidth 
          value={newAddress.state} 
          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} 
        />
        <TextField 
          label="Landmark" 
          fullWidth 
          value={newAddress.landmark} 
          onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })} 
        />
        <TextField 
          label="Zipcode *" 
          fullWidth 
          value={newAddress.zipcode} 
          onChange={(e) => setNewAddress({ ...newAddress, zipcode: e.target.value })} 
        />
      </Box>

      <Box sx={{ display: "flex", gap: 2, marginTop: 2, width: "100%" }}>
        <Button 
          variant="outlined" 
          onClick={handleSaveAddress} 
          sx={{ width: "100%", backgroundColor: "#3f51b5", color: "#ffffff" }}
        >
          {isEditing ? "Update Address" : "Save Address"}
        </Button>
        {isEditing && (
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={handleCancelEdit}
          >
            Cancel
          </Button>
        )}
      </Box>
    </>
  );
};

export default AddressForm;