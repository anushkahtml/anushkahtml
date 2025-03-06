import { TextField, Button, Container, Typography, Link, Avatar, Box, Link as MuiLink } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useContext, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    contactNumber: "",
  });
  const [errors, setErrors] = useState({});
  const { signup } = useContext(AuthContext);

  const validate = () => {
    let tempErrors = {};
    const phonePattern = /^\d{10}$/;
    const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

    if (!formData.email) {
      tempErrors.email = "Email is required";
    } else if (!formData.email.includes("@")) {
      tempErrors.email = "Email must contain '@'";
    } else if (!formData.email.includes(".")) {
      tempErrors.email = "Email must contain a domain (e.g., gmail.com/yahoo.com)";
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email.match(emailPattern)) {
        tempErrors.email = "Invalid email format";
      }
    }

    if (!formData.password) {
      tempErrors.password = "Password is required";
    } else if (!formData.password.match(passwordPattern)) {
      tempErrors.password = "Password must be atleast 6 characters long, include one uppercase letter, one number, and one special symbol";
    }

    if (formData.confirmPassword !== formData.password) {
      tempErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.contactNumber.match(phonePattern)) {
      tempErrors.contactNumber = "Invalid contact number (must be 10 digits)";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      await signup(formData);
    }
  };  

  return (
    <>
      <Container 
        maxWidth="xs" 
        sx={{ mt: 8, display: "flex", flexDirection: "column", p: 4, textAlign: "center", alignItems: "center" }}
      >
        <Box>
          <Avatar sx={{ bgcolor: "#f00055", m: "auto" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography variant="h5" sx={{ mt: 1 }}>
            Sign Up
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="First Name"
              name="firstName"
              fullWidth
              margin="normal"
              required
              value={formData.firstName}
              onChange={handleChange}
            />
            <TextField
              label="Last Name"
              name="lastName"
              fullWidth
              margin="normal"
              required
              value={formData.lastName}
              onChange={handleChange}
            />
            <TextField
              label="Email Address"
              name="email"
              fullWidth
              margin="normal"
              required
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              fullWidth
              margin="normal"
              required
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
            />
            <TextField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              fullWidth
              margin="normal"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
            />
            <TextField
              label="Contact Number"
              name="contactNumber"
              fullWidth
              margin="normal"
              required
              value={formData.contactNumber}
              onChange={handleChange}
              error={!!errors.contactNumber}
              helperText={errors.contactNumber}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2, backgroundColor: "#3f51b5" }}
            >
              Sign Up
            </Button>
          </form>
          <Typography variant="body2" sx={{ mt: 2, textAlign: "right" }}>
            Already have an account? <MuiLink component={RouterLink} to="/login">Sign In</MuiLink>
          </Typography>
        </Box>
      </Container>

      <Typography variant="body2" sx={{ mt: 4, textAlign: "center" }}>
        Copyright © <Link href="https://upgrad.com">upGrad</Link> 2021.
      </Typography>
    </>
  );
};

export default Signup;