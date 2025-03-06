import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, IconButton, Box } from "@mui/material";
import { ShoppingCart } from "@mui/icons-material";
import SearchBar from "../searchbar/SearchBar"; // Import the standalone SearchBar component

function Header({ setSearchQuery }) {
  const { isLoggedIn, user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Check if the user is an admin
  const isAdmin = user?.roles?.includes("ADMIN");

  // Derived state
  const loginClicked = location.pathname === "/login" || location.pathname === "/signup";
  const hideSearchBar = loginClicked;
  
  // Check if we're on the home page or products page
  const isHomePage = location.pathname === "/";

  // Handle navigation to products page with authentication check
  const handleNavigation = () => {
    if (isHomePage && isLoggedIn) {
      navigate("/products");
    } else {
      navigate("/");
    }
  };

  // Determine the button text based on current location and login status
  const homeButtonText = isLoggedIn && isHomePage ? "Products Page" : "Home";

  return (
    <AppBar position="static" sx={{ backgroundColor: "#3f51b5" }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        
        {/* Logo and Title */}
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ color: "white", textDecoration: "none", display: "flex", alignItems: "center" }}
        >
          <IconButton edge="start" color="inherit" aria-label="logo">
            <ShoppingCart />
          </IconButton>
          upGrad E-Shop
        </Typography>

        {/* The SearchBar component from ../searchbar/SearchBar */}
        {!hideSearchBar && <SearchBar setSearchQuery={setSearchQuery}/>}

        {/* Navigation Buttons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Button color="inherit" onClick={handleNavigation}>
            {homeButtonText}
          </Button>

          {/* Admin-Specific Button */}
          {isLoggedIn && isAdmin && (
            <Button color="inherit" component={Link} to="/add-product">
              Add Product
            </Button>
          )}

          {/* Logout & Login Buttons */}
          {isLoggedIn ? (
            <Button
              onClick={logout}
              sx={{
                backgroundColor: "#f30156",
                color: "white",
                "&:hover": { backgroundColor: "#c60044" },
              }}
            >
              Logout
            </Button>
          ) : (
            <>
              <Button
                component={Link}
                to="/login"
                sx={loginClicked ? { color: "white" } : { 
                  backgroundColor: "#f30156", 
                  color: "white", 
                  "&:hover": { backgroundColor: "#c60044" } 
                }}
              >
                LOGIN
              </Button>

              {loginClicked && (
                <Button color="inherit" component={Link} to="/signup">Signup</Button>
              )}
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;