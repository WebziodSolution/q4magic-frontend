
import React, { forwardRef } from 'react';
import { useTheme } from '@mui/material';
import Components from '../../muiComponents/components';
import Checkbox from '../checkBox/checkbox';

const CheckBoxSelect = forwardRef(
  (
    {
      size = "small",
      label,
      placeholder,
      error,
      value = [],
      onChange,
      options,
      disabled = false,
      checkAll = false,
      maxVisibleChips = 2,
      requiredFiledLabel = false,
      showAllOnHover = false,
    },
    ref
  ) => {
    const theme = useTheme();
    const selectOptions = Array.isArray(options) && options.length > 0 ? options : [];

    const finalOptions = checkAll
      ? [{ id: "__all__", title: "Select All" }, ...selectOptions]
      : selectOptions;

    const handleChange = (event, newValue) => {
      const allOption = newValue.find((opt) => opt.id === "__all__");

      if (allOption) {
        if (value.length === selectOptions.length) {
          onChange(event, []);
        } else {
          onChange(event, [...selectOptions]);
        }
        return;
      }
      onChange(event, newValue);
    };

    return (
      <div>
        <p className='mb-2 text-black text-left'>
          {label}
          {requiredFiledLabel && <span className='text-red-500 ml-1'>*</span>}
        </p>
        <Components.Autocomplete
          multiple
          disableCloseOnSelect
          options={finalOptions}
          size={size}
          disabled={disabled}
          getOptionLabel={(option) => option?.title || ""}
          value={value}
          isOptionEqualToValue={(option, val) => option?.id === val?.id}
          onChange={handleChange}
          noOptionsText={"No data found"}

          // 1. Handle the text display natively using renderTags
          renderTags={(tagValue) => {
            const visibleTitles = tagValue.slice(0, maxVisibleChips).map((opt) => opt.title).join(', ');
            const extraCount = tagValue.length - maxVisibleChips;
            const displayText = tagValue.length > 0
              ? `${visibleTitles}${extraCount > 0 ? `, +${extraCount} more` : ''}`
              : '';

            const tooltipContent = (
              <Components.Box sx={{ p: 0.5 }}>
                <Components.Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    color: theme.palette.secondary.main,
                    borderBottom: `1px solid ${theme.palette.divider || '#e0e0e0'}`,
                    pb: 0.5,
                    mb: 0.5,
                    fontSize: '16px'
                  }}
                >
                  {label}
                </Components.Typography>
                <Components.Box sx={{ maxHeight: '250px', overflowY: 'auto' }}>
                  {tagValue.map((opt) => (
                    <Components.Typography
                      key={opt.id}
                      variant="body2"
                      sx={{
                        py: 0.3,
                        color: theme.palette.text.primary,
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '14px',
                        '&:before': {
                          content: '""',
                          width: '4px',
                          height: '4px',
                          borderRadius: '50%',
                          backgroundColor: theme.palette.secondary.main,
                          marginRight: '8px',
                          flexShrink: 0
                        }
                      }}
                    >
                      {opt.title}
                    </Components.Typography>
                  ))}
                </Components.Box>
              </Components.Box>
            );

            const content = (
              <span
                style={{
                  maxWidth: 'calc(100% - 30px)', // Prevents text from overlapping the dropdown arrow
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  paddingLeft: '4px',
                  color: theme.palette.text.primary,
                }}
              >
                {displayText}
              </span>
            );

            if (showAllOnHover && tagValue.length > 0) {
              return (
                <Components.Tooltip
                  title={tooltipContent}
                  arrow
                  placement="top"
                  slotProps={{
                    tooltip: {
                      sx: {
                        backgroundColor: '#ffffff',
                        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                        border: `1px solid ${theme.palette.divider || '#e0e0e0'}`,
                        padding: '8px',
                        maxWidth: '300px',
                        '& .MuiTooltip-arrow': {
                          color: '#ffffff',
                          '&::before': {
                            border: `1px solid ${theme.palette.divider || '#e0e0e0'}`,
                          },
                        },
                      },
                    },
                  }}
                >
                  {content}
                </Components.Tooltip>
              );
            }
            return content;
          }}
          renderOption={(props, option, { selected }) => {
            if (option.id === "__all__") {
              const isAllChecked = value.length === selectOptions.length;
              return (
                <li {...props}>
                  <Checkbox checked={isAllChecked} />
                  <Components.ListItemText
                    secondary={option.title}
                    sx={{
                      '& .MuiTypography-root': {
                        color: isAllChecked ? '#ffffff !important' : 'inherit',
                      }
                    }}
                  />
                </li>
              );
            }

            return (
              <li {...props}>
                <Checkbox checked={selected} />
                <Components.ListItemText
                  secondary={option.title}
                  sx={{
                    '& .MuiTypography-root': {
                      color: selected ? '#ffffff !important' : 'inherit',
                    }
                  }}
                />
              </li>
            );
          }}
          componentsProps={{
            paper: {
              sx: {
                '& .MuiAutocomplete-option': {
                  padding: '0.5rem 1rem',
                  color: `${theme.palette.text.primary} !important`,
                  '&:hover': {
                    backgroundColor: `${theme.palette.custom.default2} !important`,
                  },
                  '&[aria-selected="true"]': {
                    backgroundColor: `${theme.palette.secondary.main} !important`,
                    color: `#ffffff !important`,
                    '& .MuiCheckbox-root': {
                      color: `#ffffff !important`,
                    },
                  },
                },
              },
            },
          }}

          // 2. Cleaned up renderInput with standardized padding
          renderInput={(params) => (
            <Components.TextField
              {...params}
              placeholder={value.length === 0 ? (placeholder || "Select options") : ""}
              error={!!error}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '4px',
                  color: `${theme.palette.text.primary} !important`,
                  minHeight: '40px',
                  padding: '0px 9px !important', // Forces standard vertical alignment
                  alignItems: 'center',
                  '& fieldset': {
                    borderColor: error
                      ? theme.palette.error.main
                      : theme.palette.secondary.main,
                  },
                  '&:hover fieldset': {
                    borderColor: error
                      ? theme.palette.error.main
                      : theme.palette.secondary.main,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: error
                      ? theme.palette.error.main
                      : theme.palette.secondary.main,
                  },
                },
                '& .MuiInputBase-input': {
                  color: `${theme.palette.text.primary} !important`,
                  // Collapses the actual text input area when values are selected so the cursor doesn't break alignment
                  padding: value.length > 0 ? '0px !important' : '8.5px 4px !important',
                  width: value.length > 0 ? '0px !important' : '100%',
                  minWidth: value.length > 0 ? '0px !important' : '30px',
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
        />
      </div>
    );
  }
);

export default CheckBoxSelect;


// import React, { forwardRef } from 'react';
// import { useTheme } from '@mui/material';
// import Components from '../../muiComponents/components';
// import Checkbox from '../checkBox/checkbox';

// const CheckBoxSelect = forwardRef(
//   (
//     {
//       size = "small",
//       label,
//       placeholder,
//       error,
//       value = [],
//       onChange,
//       options,
//       disabled = false,
//       checkAll = false,
//       maxVisibleChips = 2, // Add this prop
//       requiredFiledLabel = false,
//     },
//     ref
//   ) => {
//     const theme = useTheme();
//     const selectOptions = Array.isArray(options) && options.length > 0 ? options : [];

//     // Add virtual "Select All" item only for rendering, not stored in value
//     const finalOptions = checkAll
//       ? [{ id: "__all__", title: "Select All" }, ...selectOptions]
//       : selectOptions;

//     const handleChange = (event, newValue) => {
//       // Handle "Select All" click
//       const allOption = newValue.find((opt) => opt.id === "__all__");

//       if (allOption) {
//         if (value.length === selectOptions.length) {
//           // if already all selected → clear all
//           onChange(event, []);
//         } else {
//           // otherwise select all
//           onChange(event, [...selectOptions]);
//         }
//         return;
//       }

//       // Otherwise, normal multiple selection
//       onChange(event, newValue);
//     };

//     // Function to render custom input with limited chips
//     const renderCustomInput = (params) => {
//       const selectedCount = value.length;
//       const visibleChips = value.slice(0, maxVisibleChips);

//       return (
//         <Components.TextField
//           {...params}
//           // label={label || "Options"}
//           placeholder={placeholder || "Select options"}
//           error={!!error}
//           InputProps={{
//             ...params.InputProps,
//             startAdornment: (
//               <>
//                 {visibleChips.map((option, index) => (
//                   <Components.Chip
//                     key={option.id}
//                     label={option.title}
//                     // size="small"
//                     onDelete={() => {
//                       const newValue = value.filter(item => item.id !== option.id);
//                       onChange({}, newValue);
//                     }}
//                     // deleteIcon={<CustomIcons iconName={'fa fa-solid fa-xmark'}/>}
//                     sx={{
//                       margin: '1px',
//                       '& .MuiAutocomplete-option': {
//                         padding: '0.5rem 1rem',
//                         color: `${theme.palette.text.primary} !important`,
//                         '&:hover': {
//                           backgroundColor: `${theme.palette.custom.default2} !important`,
//                         },
//                         '&[aria-selected="true"]': {
//                           backgroundColor: `${theme.palette.secondary.main} !important`,
//                           color: `#ffffff !important`,
//                           '& .MuiCheckbox-root': {
//                             color: `#ffffff !important`,
//                           },
//                         },
//                       },
//                     }}
//                     size='small'
//                   />
//                 ))}
//                 {selectedCount > maxVisibleChips && (
//                   <Components.Chip
//                     label={`+${selectedCount - maxVisibleChips} more`}
//                     size="small"
//                     variant="outlined"
//                     sx={{
//                       margin: '2px',
//                       borderColor: theme.palette.secondary.main,
//                       color: theme.palette.secondary.main,
//                     }}
//                   />
//                 )}
//               </>
//             ),
//           }}
//           sx={{
//             '& .MuiOutlinedInput-root': {
//               borderRadius: '4px',
//               color: `${theme.palette.text.primary} !important`,
//               minHeight: '40px',
//               alignItems: 'flex-start',
//               paddingTop: '8px',
//               '& fieldset': {
//                 borderColor: error
//                   ? theme.palette.error.main
//                   : theme.palette.secondary.main,
//               },
//               '&:hover fieldset': {
//                 borderColor: error
//                   ? theme.palette.error.main
//                   : theme.palette.secondary.main,
//               },
//               '&.Mui-focused fieldset': {
//                 borderColor: error
//                   ? theme.palette.error.main
//                   : theme.palette.secondary.main,
//               },
//             },
//             '& .MuiInputLabel-root': {
//               color: `${theme.palette.text.primary} !important`,
//             },
//             '& .MuiInputLabel-root.Mui-focused': {
//               color: `${theme.palette.text.primary} !important`,
//             },
//             '& .MuiInputBase-input': {
//               color: `${theme.palette.text.primary} !important`,
//             },
//             '& .Mui-disabled': {
//               color: theme.palette.text.disabled,
//             },
//             '& .MuiFormHelperText-root': {
//               color: theme.palette.error.main,
//               fontSize: '14px',
//               fontWeight: '500',
//               marginX: 0.5,
//             },
//             fontFamily: '"Inter", sans-serif',
//           }}
//         />
//       );
//     };

//     return (
//       <div>
//         <p className='mb-2 text-black text-left'>
//           {label}
//           {
//             requiredFiledLabel && <span className='text-red-500 ml-1'>*</span>
//           }
//         </p>
//         <Components.Autocomplete
//           multiple
//           disableCloseOnSelect
//           options={finalOptions}
//           size={size}
//           disabled={disabled}
//           getOptionLabel={(option) => option?.title || ""}
//           value={value}
//           isOptionEqualToValue={(option, val) => option?.id === val?.id}
//           onChange={handleChange}
//           noOptionsText={"No data found"}
//           renderOption={(props, option, { selected }) => {
//             // Render "Select All" state
//             if (option.id === "__all__") {
//               const isAllChecked = value.length === selectOptions.length;
//               return (
//                 <li {...props}>
//                   <Checkbox checked={isAllChecked} />
//                   <Components.ListItemText
//                     secondary={option.title}
//                     sx={{
//                       '& .MuiTypography-root': {
//                         color: isAllChecked ? '#ffffff !important' : 'inherit',
//                       }
//                     }}
//                   />
//                 </li>
//               );
//             }

//             // Normal option
//             return (
//               <li {...props}>
//                 <Checkbox checked={selected} />
//                 <Components.ListItemText
//                   secondary={option.title}
//                   sx={{
//                     '& .MuiTypography-root': {
//                       color: selected ? '#ffffff !important' : 'inherit',
//                     }
//                   }}
//                 />
//               </li>
//             );
//           }}
//           componentsProps={{
//             paper: {
//               sx: {
//                 '& .MuiAutocomplete-option': {
//                   padding: '0.5rem 1rem',
//                   color: `${theme.palette.text.primary} !important`,
//                   '&:hover': {
//                     backgroundColor: `${theme.palette.custom.default2} !important`,
//                   },
//                   '&[aria-selected="true"]': {
//                     backgroundColor: `${theme.palette.secondary.main} !important`,
//                     color: `#ffffff !important`,
//                     '& .MuiCheckbox-root': {
//                       color: `#ffffff !important`,
//                     },
//                   },
//                 },
//               },
//             },
//           }}
//           renderInput={renderCustomInput}
//         />
//       </div>
//     );
//   }
// );

// export default CheckBoxSelect;  