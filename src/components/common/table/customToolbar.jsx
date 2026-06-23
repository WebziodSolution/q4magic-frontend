// at the top with other imports
import {
    GridToolbarContainer,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
    GridToolbarDensitySelector,
    GridToolbarExport,
    GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import { Box } from "@mui/material";

// brand colors
const BRAND = {
    primary: "#0478DC",
    secondary: "#7413D1",
    text: "#242424",
    subtle: "#f5f7fb",
    border: "#e6e8ee",
};

// ✅ Fully custom toolbar with brand styling + custom quick search
export default function CustomToolbar() {
    return (
        <GridToolbarContainer
            sx={{
                px: 2,
                py: 1.5,
                gap: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: BRAND.subtle,
                borderBottom: `1px solid ${BRAND.border}`,
            }}
        >
            {/* Left: buttons (columns, filters, density, export) */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    "& .MuiButton-startIcon": { mr: 1 },
                    "& .MuiButtonBase-root": {
                        color: BRAND.secondary,                  // text + icon color
                        fontWeight: 700,
                        letterSpacing: 0.4,
                    },
                    "& .MuiSvgIcon-root": { color: BRAND.secondary },
                }}
            >
                <GridToolbarColumnsButton />
                <GridToolbarFilterButton />
                <GridToolbarDensitySelector />
                <GridToolbarExport />
            </Box>

            {/* Right: custom-styled Quick Filter (search) */}
            <GridToolbarQuickFilter
                quickFilterParser={(value) => value.split(/\s+/).filter(Boolean)}
                sx={{
                    ml: "auto",
                    "& .MuiInputBase-root": {
                        borderRadius: 999,
                        backgroundColor: "#fff",
                        px: 1.5,
                        py: 0.25,
                        boxShadow: "0 0 0 1px transparent",
                        border: `1px solid ${BRAND.border}`,
                        transition: "box-shadow .15s ease, border-color .15s ease",
                    },
                    "& .MuiInputBase-root:hover": {
                        borderColor: BRAND.primary,
                    },
                    "& .MuiInputBase-root.Mui-focused": {
                        borderColor: BRAND.primary,
                        boxShadow: `0 0 0 3px ${BRAND.primary}22`,
                    },
                    "& .MuiInputBase-input": {
                        p: 1,
                        fontSize: 14,
                        color: BRAND.text,
                    },
                    "& .MuiSvgIcon-root": {
                        color: BRAND.text, // search icon color
                        mr: 1,
                    },
                    // remove the yellow underline style if any variant slips in
                    "& .MuiInput-underline:before, & .MuiInput-underline:after": {
                        borderBottom: "none !important",
                    },
                }}
                quickFilterProps={{
                    debounceMs: 400,
                    placeholder: "Search…",
                }}
            />
        </GridToolbarContainer>
    );
}
