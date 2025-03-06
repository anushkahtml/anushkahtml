import React, { useState, useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/home/Home";
import Header from "./components/header/Header";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import { AuthContext } from "./context/AuthContext";
import ProductsPage from "./components/products-page/ProductsPage";
import ProductDetails from "./components/products-page/ProductDetails";
import Orders from "./components/orders/Orders";
import AddOrModifyProduct from "./components/admin/AddOrModifyProduct";

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { user } = useContext(AuthContext);
  const isAdmin = user?.roles?.includes("ADMIN");

  return (
    <>
      <Header setSearchQuery={setSearchQuery} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Updated product routes */}
        <Route path="/products" element={<ProductsPage searchQuery={searchQuery} isAdmin={isAdmin} />} />
        <Route path="/products/:id" element={<ProductDetails isAdmin={isAdmin} />} />
        
        {/* Protected admin routes */}
        <Route path="/add-product" element={<ProtectedRoute Component={AddOrModifyProduct} />} />
        <Route path="/edit-product/:id" element={<ProtectedRoute Component={AddOrModifyProduct} />} />
        <Route path="/orders" element={<Orders />} />
      </Routes>
    </>
  );
}

// 🔒 Protected Route for Admins Only
function ProtectedRoute({ Component }) {
  const { isLoggedIn, user } = useContext(AuthContext);
  const isAdmin = user?.roles?.includes("ADMIN");

  return isLoggedIn && isAdmin ? <Component /> : <Navigate to="/" />;
}

export default App;