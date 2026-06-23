import React, { forwardRef } from 'react';
import { useTheme } from '@mui/material';
import Components from '../../muiComponents/components';

const Select = forwardRef(({ size = "small", label, placeholder, error, helperText, value, onChange, options, disabled = false, onClick, onInputChange, freeSolo = false, requiredFiledLabel = false }, ref) => {
    const theme = useTheme();
    const selectOptions = Array.isArray(options) && options.length > 0 ? options : [];

    const selectedOption = selectOptions.find((option) => option.id === value) || null;

    return (
        <div>
            <p className='mb-2 text-black text-left'>
                {label}
                {
                    requiredFiledLabel && <span className='text-red-500 ml-1'>*</span>
                }
            </p>
            <Components.Autocomplete
                freeSolo={freeSolo}
                options={selectOptions}
                size={size}
                disabled={disabled}
                getOptionLabel={(option) => option?.title || ""}
                value={selectedOption}
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
                onChange={(event, newValue) => {
                    onChange(event, newValue);
                }}
                onInputChange={(event, newInputValue) => {
                    onInputChange?.(event, newInputValue);
                }}
                renderOption={(props, option) => {
                    // Extract the default onClick handler that MUI assigns to the option
                    const { onClick: defaultOnClick, ...restProps } = props;

                    return (
                        <li
                            {...restProps}
                            onClick={(event) => {
                                // 1. Fire MUI's default click handler so standard selection still works
                                if (defaultOnClick) {
                                    defaultOnClick(event);
                                }
                                // 2. Fire your custom onClick handler, passing the clicked option!
                                if (onClick) {
                                    onClick(event, option);
                                }
                            }}
                        >
                            {option?.title || ""}
                        </li>
                    );
                }}
                noOptionsText={'No data found'}
                renderInput={(params) => (
                    <Components.TextField
                        {...params}
                        // label={label || 'Options'}
                        placeholder={placeholder || 'Select options'}
                        error={!!error}
                        helperText={helperText}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '4px',
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
                                color: error ? theme.palette.error.main : theme.palette.text.primary,
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                                color: error ? theme.palette.error.main : theme.palette.text.primary,
                            },
                            '& .MuiInputBase-input': {
                                color: theme.palette.text.primary,
                            },
                            '& .Mui-disabled': {
                                color: theme.palette.text.primary,
                                borderColor: error ? theme.palette.error.main : theme.palette.secondary.main,
                            },
                            '& .MuiFormHelperText-root': {
                                color: theme.palette.error.main,
                                fontSize: '14px',
                                fontWeight: '500',
                                marginX: 0.5,
                            },
                            fontFamily: '"Inter", sans-serif',
                        }}
                    />
                )}
                componentsProps={{
                    paper: {
                        sx: {
                            '& .MuiAutocomplete-option': {
                                padding: '0.5rem 1rem',
                                '&:hover': {
                                    backgroundColor: `${theme.palette.custom.default2} !important`, // Enforce hover background color
                                    color: `${theme.palette.text.primary} !important`, // Enforce hover text color
                                },
                                '&[aria-selected="true"]': {
                                    backgroundColor: `${theme.palette.secondary.main} !important`, // Enforce selected background color
                                    color: "#ffffff !important", // Enforce selected text color
                                    '&:hover': {
                                        backgroundColor: `${theme.palette.secondary.main} !important`, // Retain secondary color on hover
                                    },
                                },
                            },
                        },
                    },
                }}
            />
        </div>
    );
});

export default Select;