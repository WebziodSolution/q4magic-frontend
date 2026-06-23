import { useTheme } from '@mui/material';
import Components from '../../muiComponents/components';

const Button = ({
    useFor = "primary",
    type,
    text,
    onClick,
    disabled = false,
    isLoading = false,
    startIcon = null,
    endIcon = null,
    value = null,
    id,
    className,          // for Tailwind classes
    sx: userSx,         // for MUI sx overrides
    ...rest             // capture any other props (e.g., fullWidth)
}) => {
    const theme = useTheme();
    const ButtonComponent = isLoading ? Components.LoadingButton : Components.Button;

    // Base styles for all buttons
    const baseStyles = {
        borderRadius: 1,
        fontWeight: 500,
        fontFamily: '"Inter", sans-serif',
        // height: height || 40,
        textTransform: "uppercase",
        fontSize: "16px",
        border: 1,
        // borderColor:theme.palette.secondary.main,
        color: theme.palette.secondary.main,
    };

    // Styles when useFor !== "primary"
    const normalStyles = {
        background: useFor === "error"
            ? theme.palette.error.main
            : useFor === "success"
                ? theme.palette.success.main
                : useFor === "disabled"
                    ? theme.palette.background.default
                    : theme.palette.secondary.light,
        color: useFor !== "primary" ? "#fff" : theme.palette.text.primary,
        "&:hover": {
            boxShadow: 0,
            opacity: 0.9,
        },
        // px: 5,
        // py: 1,
        fontWeight: "bold",
        position: "relative",
        overflow: "hidden",
        boxShadow: 0,
        textTransform: "uppercase",
        // cursor: disabled ? "not-allowed" : "pointer"
    };

    const primaryStyles = {
        background: theme.palette.primary.main,
        color: theme.palette.secondary.main,
        fontWeight: "bold",
        position: "relative",
        overflow: "hidden",
        boxShadow: 0,
        textTransform: "uppercase",
        "& .overlay": {
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: 0,
            bgcolor: theme.palette.secondary.main,
            transition: "height 0.3s ease-out",
            zIndex: 0,
        },
        "& .btn-text": {
            position: "relative",
            zIndex: 1,
            transition: "color 0.3s ease",
        },
        "&:hover .overlay": {
            height: "100%",
        },
        "&:hover .btn-text": {
            color: "#fff",
        },
        "&:hover": {
            boxShadow: 0,
        },
        "&:MuiButton-root:disabled": {
            cursor: "not-allowed",
        },
    };

    return (
        <ButtonComponent
            // fullWidth
            disabled={disabled || isLoading}
            type={type}
            onClick={onClick}
            variant="contained"
            loading={isLoading}
            id={id}
            data-value={value}
            className={className}
            sx={{
                ...baseStyles,
                ...(useFor === "primary" ? primaryStyles : normalStyles),
                textTransform: "capitalize",
                cursor: disabled ? "not-allowed" : "pointer",
                ...userSx,
            }}
            {...rest}
        >
            {useFor === "primary" ? (
                <>
                    <span className="overlay" />
                    <span className="btn-text flex items-center gap-2">
                        {startIcon}
                        {text}
                        {endIcon}
                    </span>
                </>
            ) : (
                <>
                    {startIcon}
                    {text}
                    {endIcon}
                </>
            )}
        </ButtonComponent>

    );
};

export default Button;
