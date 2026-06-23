import React from "react";
import Components from "../../muiComponents/components";
import { useTheme } from "@mui/material";

const Checkbox = ({ text, onChange, checked = false, disabled, color = null, size }) => {
    const theme = useTheme();

    return (
        <Components.FormGroup>
            <Components.FormControlLabel
                control={
                    <Components.Checkbox
                        disabled={disabled}
                        size={size || "small"}
                        sx={{
                            "&.Mui-checked": {
                                color: color || theme.palette.secondary.main,
                            },
                            "&.MuiSvgIcon-root": {
                                color: color || theme.palette.secondary.main,
                            },
                            color: color || theme.palette.secondary.main,
                            paddingY: 0,
                        }}
                        checked={checked}
                        onChange={onChange}

                    />
                }
                label={text}
                sx={{
                    color: theme.palette.secondary.main,
                    margin: 0,
                    '& .MuiFormControlLabel-label': {
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        fontFamily: '"Inter", sans-serif'
                    }
                }}
            />
        </Components.FormGroup>
    );
};

export default Checkbox;
