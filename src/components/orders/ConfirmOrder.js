import React from "react";
import { Box, Typography, Paper, Grid, Divider } from "@mui/material";

const ConfirmOrder = ({ orderItems, selectedAddress, calculateTotalPrice }) => {
  return (
    <Box sx={{ marginTop: 4 }}>
  <Box sx={{ display: "flex", width: "100%", height: "auto", flexWrap: "wrap" }}>
    {/* Product Card */}
    <Paper 
      sx={{ 
        p: 3, 
        width: { xs: "100%", md: "65%" }, // Full width on small screens, 65% on medium+
        display: "flex", 
        flexDirection: "column",
        justifyContent: "space-between",
        borderRadius: { xs: "4px", md: "4px 0 0 4px" }, // Adjust rounded corners for small screens
        boxSizing: "border-box"
      }}
    >
      <Box>
        <Typography variant="h5" gutterBottom>
          {orderItems[0]?.name || "Product"}
        </Typography>
        <Typography variant="body1" gutterBottom>
          Quantity: {orderItems[0]?.quantity || 1}
        </Typography>
        <Typography variant="body1" gutterBottom>
          Category: {orderItems[0]?.category || ""}
        </Typography>
        <Typography variant="body2" sx={{ my: 2 }}>
          {orderItems[0]?.description || ""}
        </Typography>
      </Box>
      <Box>
        <Typography variant="h6" color="error" marginBottom={3}>
          Total Price : ₹ {calculateTotalPrice()}
        </Typography>
      </Box>
    </Paper>

    {/* Address Card */}
    <Paper 
      sx={{ 
        p: 3, 
        width: { xs: "100%", md: "35%" }, // Full width on small screens, 35% on medium+
        display: "flex", 
        flexDirection: "column",
        justifyContent: "flex-start",
        borderRadius: { xs: "4px", md: "0 4px 4px 0" }, // Adjust rounded corners
        borderLeft: { md: "none" }, // Only remove left border for medium+ screens
        boxSizing: "border-box"
      }}
    >
      <Typography variant="h5" gutterBottom>
        Address Details :
      </Typography>
      {selectedAddress && (
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body1">
            {selectedAddress.name}
          </Typography>
          <Typography variant="body1">
            Contact Number: {selectedAddress.contactNumber}
          </Typography>
          <Typography variant="body1">
            {selectedAddress.street}, {selectedAddress.city}
          </Typography>
          <Typography variant="body1">
            {selectedAddress.state}
          </Typography>
          <Typography variant="body1">
            {selectedAddress.zipcode}
          </Typography>
        </Box>
      )}
    </Paper>
  </Box>
</Box>
  );
};

export default ConfirmOrder;