import * as React from 'react';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Components from '../../muiComponents/components';
import { useTheme } from '@mui/material';

const BaseDatePicker = React.forwardRef(({
    label,
    placeholder,
    type,
    error,
    helperText,
    value,
    onChange,
    endIcon,
}, ref) => {
    const theme = useTheme();

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['DatePicker']}>
                <DatePicker
                    label={label || 'Basic date picker'}
                    value={value}
                    onChange={onChange}
                    ref={ref}
                    renderInput={(params) => (
                        <Components.TextField
                            {...params}
                            placeholder={placeholder}
                            helperText={helperText}
                            error={error}
                            InputProps={{
                                endAdornment: endIcon,
                                ...params.InputProps,
                            }}
                        />
                    )}
                    sx={{
                        '& .MuiStack-root': {
                            padding: 0
                        },
                        '& .MuiOutlinedInput-root': {
                            height: '2.2rem',
                            borderRadius: '4px',
                            height: '3rem',
                            transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                            '& fieldset': {
                                borderColor: error ? theme.palette.error.main : theme.palette.secondary.main,
                            },
                            '&:hover fieldset': {
                                borderColor: error ? theme.palette.error.main : theme.palette.secondary.main,
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: error ? theme.palette.error.main : theme.palette.secondary.main,
                            },
                        },
                        '& .MuiInputLabel-root': {
                            color: error ? theme.palette.error.main : theme.palette.secondary.main,
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                            color: error ? theme.palette.error.main : theme.palette.secondary.main,
                        },
                        '& .MuiInputBase-input': {
                            color: '#3b4056',
                        },
                        '& .Mui-disabled': {
                            color: '#3b4056',
                        },
                        '& .MuiFormHelperText-root': {
                            color: theme.palette.error.main,
                            fontSize: '14px',
                            fontWeight: '500',
                            marginX: 0.5,
                        },
                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
                    }}
                />

            </DemoContainer>
        </LocalizationProvider>
    );
});

export default BaseDatePicker;
