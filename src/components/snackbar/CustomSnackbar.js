import React, { useEffect, useState, useRef } from "react";
import { Snackbar, Alert, Box, LinearProgress } from "@mui/material";

const CustomSnackbar = ({ 
  open, 
  onClose, 
  message, 
  severity = "success", 
  duration = 4000,
  backgroundColor, 
  textColor = "white", 
  progressColor = "yellow" 
}) => {
  const [progress, setProgress] = useState(100);
  const [internalOpen, setInternalOpen] = useState(false);
  const timerRef = useRef(null);
  const intervalRef = useRef(null);

  const getBackgroundColor = () => {
    if (backgroundColor) return backgroundColor;
    switch (severity) {
      case "success": return "green";
      case "error": return "red";
      case "warning": return "orange";
      case "info": return "blue";
      default: return "green";
    }
  };

  useEffect(() => {
    if (open) {
      setInternalOpen(true);
      setProgress(100);

      const decrement = 100 / (duration / 50); 

      intervalRef.current = setInterval(() => {
        setProgress((prev) => Math.max(prev - decrement, 0));
      }, 50);

      timerRef.current = setTimeout(() => {
        clearInterval(intervalRef.current);
        setInternalOpen(false);
        onClose(); 
      }, duration);

      return () => {
        clearInterval(intervalRef.current);
        clearTimeout(timerRef.current);
      };
    }
  }, [open, duration, onClose]);

  return (
    <Snackbar open={internalOpen} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
      <Box sx={{ 
        width: "100%", 
        bgcolor: getBackgroundColor(), 
        color: textColor, 
        borderRadius: "5px", 
        overflow: "hidden"
      }}>
        <Alert 
          severity={severity} 
          sx={{ 
            color: textColor, 
            backgroundColor: "transparent",
            '& .MuiAlert-icon': { color: textColor }
          }}
        >
          {message}
        </Alert>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 4,
            bgcolor: "rgba(255, 255, 255, 0.1)",
            "& .MuiLinearProgress-bar": { backgroundColor: progressColor },
          }}
        />
      </Box>
    </Snackbar>
  );
};

export default CustomSnackbar;