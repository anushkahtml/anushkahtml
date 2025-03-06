import React, { useState, useContext } from "react";
import { TextField, Button, Container, Typography, Link, Avatar, Box, Link as MuiLink } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { AuthContext } from "../../context/AuthContext";
import { Link as RouterLink } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { login } = useContext(AuthContext);

  const validate = () => {
    let tempErrors = {};
    if (!email.includes("@")) tempErrors.email = "Email must contain '@'";
    else if (!email.includes(".")) tempErrors.email = "Email must contain a domain (e.g., gmail.com/yahoo.com)";
    else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.match(emailPattern)) tempErrors.email = "Invalid email format";
    }
    
    if (!password) tempErrors.password = "Password is required";
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      await login(email, password);
    }
  };

  return (
    <Container>
      <Container
        maxWidth="xs"
        sx={{
          mt: 8,
          display: "flex",
          flexDirection: "column",
          p: 4,
          textAlign: "center",
          alignItems: "center",
        }}
      >
        <Box>
          <Avatar sx={{ bgcolor: "#f00055", m: "auto" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography variant="h5" sx={{ mt: 1 }}>Sign in</Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email Address"
              fullWidth
              margin="normal"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!errors.password}
              helperText={errors.password}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2, backgroundColor: "#3f51b5" }}
            >
              Sign In
            </Button>
          </form>
        </Box>
        <Typography variant="body2" sx={{ mt: 2, width: "100%", textAlign: "right" }}>
          Don't have an account? <MuiLink component={RouterLink} to="/signup">Sign Up</MuiLink>
        </Typography>
      </Container>
  
      <Container sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="body2">
          Copyright © <Link href="https://upgrad.com">upGrad</Link> 2021.
        </Typography>
      </Container>
    </Container>
  );  
};

export default Login;