// import Components from "../../muiComponents/components";
// import { useTheme } from "@mui/material";

// export const Tabs = ({ selectedTab, handleChange, tabsData, type = "default", center = false, fontSize = null }) => {
//   const theme = useTheme();

//   // Define styles based on type
//   const getContainerStyles = () => {
//     switch (type) {
//       case "pipeline":
//         return {
//           // borderBottom: "2px solid #E0E0E0", // subtle container line
//           backgroundColor: "#fafafa",        // light background for the whole bar
//         };
//       case "header":
//         return {
//           borderBottom: "none",
//           backgroundColor: "#ffffff",
//         };
//       default: // "default"
//         return {
//           borderBottom: "1px solid #E0E0E0",
//           backgroundColor: "transparent",
//         };
//     }
//   };

//   const getTabStyles = (isSelected, isHeaderType, isPipelineType) => {
//     const base = {
//       color: isPipelineType?"#624B8B" : theme.palette.text.primary,
//       fontWeight: isSelected ? 600 : 400,
//       fontSize: fontSize ? fontSize : "20px",
//       textTransform: "none",
//       padding: isPipelineType?"12px 12px":"8px 8px",
//       cursor: "pointer",
//       display: "flex",
//       alignItems: "center",
//       gap: "7px",
//       position: "relative",
//       fontFamily: '"Inter", sans-serif',
//       transition: "background-color 0.3s ease",
//     };

//     // Type-specific background
//     if (isHeaderType) {
//       base.backgroundColor = isSelected ? "rgba(33, 150, 243, 0.08)" : "transparent";
//     } else if (isPipelineType) {
//       base.backgroundColor = isSelected ? "#E7DBFE" : "transparent"; // light purple for active
//       base.borderRadius = "8px"; // rounding on all corners
//     } else {
//       base.backgroundColor = "transparent";
//     }

//     return base;
//   };

//   const getAfterStyles = (isSelected, isHeaderType, isPipelineType) => {
//     const afterBase = {
//       content: '""',
//       position: "absolute",
//       bottom: 0,
//       left: "50%",
//       transform: "translateX(-50%)",
//       height: isHeaderType ? "3px" : isPipelineType ? "4px" : "3px", // thicker for pipeline
//       width: isSelected ? "100%" : "0%",
//       transition: "width 0.3s ease-in-out",
//     };

//     if (isPipelineType) {
//       afterBase.backgroundColor = "transparent"; // No bottom line for pipeline tabs
//     } else if (isHeaderType) {
//       afterBase.backgroundColor = theme.palette.secondary.main;
//     } else {
//       afterBase.backgroundColor = theme.palette.secondary.main;
//     }

//     return afterBase;
//   };

//   return (
//     <Components.Box
//       sx={{
//         width: "100%",
//         display: "flex",
//         justifyContent: center ? "center" : "start",
//         gap: "20px",
//         overflowX: "auto",
//         whiteSpace: "nowrap",
//         scrollbarWidth: "none",
//         "&::-webkit-scrollbar": { display: "none" },
//         fontFamily: '"Inter", sans-serif',
//         ...getContainerStyles(),
//       }}
//     >
//       {[...new Map(tabsData?.map((item) => [item.label, item])).values()].map(
//         (item, index) => {
//           const isSelected = selectedTab === index;
//           const isHeaderType = type === "header";
//           const isPipelineType = type === "pipeline";

//           return (
//             <Components.Box
//               key={index}
//               onClick={() => handleChange(index)}
//               sx={{
//                 ...getTabStyles(isSelected, isHeaderType, isPipelineType),
//                 "&::after": getAfterStyles(isSelected, isHeaderType, isPipelineType),
//                 "&:hover::after": {
//                   width: "100%",
//                 },
//               }}
//             >
//               {item.icon && <span>{item.icon}</span>}
//               {item.label && <span>{item.label}</span>}
//             </Components.Box>
//           );
//         }
//       )}
//     </Components.Box>
//   );
// };


import Components from "../../muiComponents/components";
import { useTheme } from "@mui/material";

export const Tabs = ({ selectedTab, handleChange, tabsData, type = "default", center = false, fontSize = null }) => {
  const theme = useTheme();

  return (
    <Components.Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: center ? "center" : "start",
        gap: "20px",
        borderBottom: type === "default" ? "1px solid #E0E0E0" : "none",
        overflowX: "auto",
        whiteSpace: "nowrap",
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": { display: "none" },
        backgroundColor: type === "header" ? "#ffffff" : "transparent",
        fontFamily: '"Inter", sans-serif'
      }}
    >
      {[...new Map(tabsData?.map((item) => [item.label, item])).values()].map(
        (item, index) => {
          const isSelected = selectedTab === index;
          const isHeaderType = type === "header";

          return (
            <Components.Box
              key={index}
              onClick={() => handleChange(index)}
              sx={{
                color: isSelected ? "#5A2E9B" : "#6A3FAE",
                fontWeight: isSelected ? 600 : 400,
                fontSize: fontSize ? fontSize : "20px",
                textTransform: "none",
                padding: "8px 8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "7px",
                position: "relative",
                fontFamily: '"Inter", sans-serif',
                transition: "background-color 0.3s ease",

                // Keep the background logic for the header type
                backgroundColor: "transparent",

                // The Animated Bottom Border
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: 0,
                  left: "50%",
                  transform: "translateX(-50%)", // Centers the line so it grows outward
                  height: isHeaderType ? "3px" : "3px",
                  width: isSelected ? "100%" : "0%", // Full width if selected, 0% if not
                  backgroundColor: "#6A3FAE",
                  transition: "width 0.3s ease-in-out", // The animation effect
                },

                // Triggers the width to expand to 100% on hover
                "&:hover::after": {
                  width: "100%",
                }
              }}
            >
              {item.icon && <span>{item.icon}</span>}
              {item.label && <span>{item.label}</span>}
            </Components.Box>
          );
        }
      )}
    </Components.Box>
  );
};