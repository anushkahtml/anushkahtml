import React from "react";
import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const SearchBar = ({ setSearchQuery }) => {
  return (
    <TextField
      variant="outlined"
      placeholder="Search..."
      onChange={(e) => setSearchQuery(e.target.value)} // Update search state on input change
      sx={{
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        borderRadius: "5px",
        width: "350px",
        "& input": {
          color: "white",
          padding: "10px",
        },
        "& fieldset": { border: "none" },
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: "white" }} />
          </InputAdornment>
        ),
      }}
    />
  );
};

export default SearchBar;