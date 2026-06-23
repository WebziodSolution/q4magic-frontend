import { Menu, MenuItem } from "@mui/material";

const Dropdown = ({ value, onChange, options = [], anchorEl, setAnchorEl }) => {
    const open = Boolean(anchorEl);

    const handleClose = () => setAnchorEl(null);

    return (
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{ disablePadding: true }}
            PaperProps={{
                sx: {
                    mt: 1.5,
                    overflow: "visible",
                    paddingY: "5px",
                    boxShadow: "0px 15px 40px rgba(0,0,0,0.15)",
                    minWidth: 180,
                    "&:before": {
                        content: '""',
                        display: "block",
                        position: "absolute",
                        width: 14,
                        height: 14,
                        bgcolor: "background.paper",
                        top: -7,
                        left: "2000px",
                        transform: "translateX(-50%) rotate(45deg)",
                    }
                }
            }}
        >
            {options.map((opt) => (
                <MenuItem
                    key={opt.value}
                    onClick={() => {
                        onChange(opt.value);
                        handleClose();
                    }}
                    className="px-4 py-2 h-10 text-sm hover:bg-gray-100"
                >
                    {opt.label}
                </MenuItem>
            ))}
        </Menu>
    );
};

export default Dropdown;
