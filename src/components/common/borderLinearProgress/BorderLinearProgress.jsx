import React from "react";
import { Box, Typography, LinearProgress, linearProgressClasses } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[300],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.secondary.main, // light blue
  },
}));

const BorderLinearProgressWithLabel = ({ value }) => {
  return (
    <Box display="flex" alignItems="center" sx={{ width: "100%" }}>
      {/* Progress bar */}
      <Box sx={{ flexGrow: 1, mr: 1 }}>
        <StyledLinearProgress variant="determinate" value={value} />
      </Box>

      {/* Percentage label */}
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="#000000">
          {`${Math.round(value)}%`}
        </Typography>
      </Box>
    </Box>
  );
};

export default BorderLinearProgressWithLabel;
