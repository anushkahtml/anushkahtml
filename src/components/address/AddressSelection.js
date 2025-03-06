import React from "react";
import { 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Typography, 
  Card, 
  CardContent, 
  IconButton 
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

const AddressSelection = ({ 
  addresses, 
  selectedAddress, 
  setSelectedAddress, 
  handleEditAddress, 
  handleDeleteAddress 
}) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <Typography variant="h6" sx={{ marginTop: 2, marginBottom: 2 }}>
        Select Delivery Address
      </Typography>

      <FormControl sx={{ width: "100%", margin: "20px 0" }}>
        <InputLabel>Select Address</InputLabel>
        <Select
          value={selectedAddress}
          onChange={(e) => setSelectedAddress(e.target.value)}
          displayEmpty
        >
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
        <Box sx={{ width: "100%", marginBottom: 3 }}>
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
                    <IconButton size="small" onClick={() => handleDeleteAddress(address.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))}
        </Box>
      )}
    </Box>
  );
};

export default AddressSelection;