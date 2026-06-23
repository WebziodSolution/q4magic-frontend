import React, { forwardRef } from 'react';
import { InputAdornment, useTheme } from '@mui/material';
import Components from '../../muiComponents/components';

const Input = forwardRef(({ disabled = false, multiline = false, rows = 2, name, label, placeholder, type, error, helperText, value, onChange, endIcon = null, startIcon, InputLabelProps, onFocus, onBlur, requiredFiledLabel = false, onKeyDown }, ref) => {
    const theme = useTheme();
    return (
        <div>
            {
                (label !== null && label !== "") && (
                    <p className='mb-2 text-black text-left'>
                        {label}
                        {
                            requiredFiledLabel && <span className='text-red-500 ml-1'>*</span>
                        }
                    </p>
                )
            }
            <Components.TextField
                variant="outlined"
                multiline={multiline}
                rows={rows}
                autoHeight={multiline && rows ? true : false}
                fullWidth
                disabled={disabled}
                size='small'
                name={name}
                // label={label}
                placeholder={placeholder ? placeholder : label ? `Enter ${label?.toLowerCase()}` : `Enter value`}
                value={type === 'date' ? value || new Date().toISOString().split('T')[0] : value || ''}
                type={type}
                onChange={onChange}
                inputRef={ref}
                error={!!error}
                helperText={helperText}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '4px',
                        transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                        '& fieldset': {
                            borderColor: error ? theme.palette.error.main : theme.palette.secondary?.main,
                        },
                        '&:hover fieldset': {
                            borderColor: error ? theme.palette.error.main : theme.palette.secondary?.main,
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: error ? theme.palette.error.main : theme.palette.secondary?.main,
                        },
                    },
                    '& .MuiInputLabel-root': {
                        color: error ? theme.palette.error.main : theme.palette.text.primary,
                        textTransform: "capitalize"
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                        color: error ? theme.palette.error.main : theme.palette.text.primary,
                    },
                    '& .MuiInputBase-input': {
                        color: theme.palette.text.primary,
                    },
                    '& .Mui-disabled': {
                        color: theme.palette.text.primary,
                    },
                    '& .MuiFormHelperText-root': {
                        color: theme.palette.error.main,
                        fontSize: '14px',
                        fontWeight: '500',
                        marginX: 0.5
                    },
                    fontFamily: '"Inter", sans-serif'
                }}
                InputLabelProps={InputLabelProps}
                InputProps={{
                    startAdornment: startIcon,
                    endAdornment: endIcon
                }}
                onBlur={onBlur}
                onFocus={onFocus}
                onKeyDown={onKeyDown}
            />
        </div>
    );
});

export default Input;
