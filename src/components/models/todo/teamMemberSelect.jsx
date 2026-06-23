import React, { forwardRef } from 'react';
import { useTheme, ListSubheader, Checkbox } from '@mui/material';
import Components from '../../muiComponents/components';

const TeamMemberSelect = forwardRef(
    (
        {
            size = 'small',
            label,
            placeholder,
            error,
            helperText,
            value,
            onChange,
            options,
            disabled = false,
            multiple = false,
            requiredFiledLabel = false
        },
        ref
    ) => {
        const theme = useTheme();

        // Handle grouped data: teams + individuals
        const groupedOptions = React.useMemo(() => {
            if (!options) return [];

            const { teams = [], individuals = [] } = options;
            const allOptions = [];

            teams.forEach((team) => {
                allOptions.push({ group: team.name, isHeader: true });
                team.members.forEach((member) => {
                    allOptions.push({
                        group: team.name,
                        title: member.name,
                        id: member.id,
                        isHeader: false,
                    });
                });
            });

            if (individuals.length > 0) {
                allOptions.push({ group: 'Other Members', isHeader: true });
                individuals.forEach((ind) => {
                    allOptions.push({
                        group: 'Other Members',
                        title: ind.name,
                        id: ind.id,
                        isHeader: false,
                    });
                });
            }

            return allOptions;
        }, [options]);

        // Find currently selected value(s)
        const selectableOptions = groupedOptions?.filter((o) => !o.isHeader) || [];

        let selectedOption = null;
        if (multiple) {
            // FIX 1: Map the value array to ensure we only get exactly ONE option object per selected ID.
            // This prevents duplicate objects from causing uncheck failures.
            selectedOption = (value || [])
                .map((valId) => selectableOptions.find((opt) => opt.id === valId))
                .filter(Boolean); // Remove any undefined results
        } else {
            selectedOption = selectableOptions.find((opt) => opt.id === value) || null;
        }

        return (
            <>
                <p className='mb-2 text-black text-left'>
                    {label}
                    {
                        requiredFiledLabel && <span className='text-red-500 ml-1'>*</span>
                    }
                </p>
                <Components.Autocomplete
                    options={selectableOptions}
                    size={size}
                    disabled={disabled}
                    multiple={multiple}
                    disableCloseOnSelect={multiple}
                    getOptionLabel={(option) => option?.title || ''}
                    value={selectedOption}
                    isOptionEqualToValue={(option, val) => option?.id === val?.id}
                    onChange={(_, newValue) => {
                        if (multiple) {
                            // FIX 2: Ensure the returned array of IDs contains strictly unique values
                            const uniqueIds = Array.from(new Set(newValue.map((opt) => opt.id)));
                            onChange(uniqueIds);
                        } else {
                            onChange(newValue?.id || '');
                        }
                    }}
                    groupBy={(option) => option.group || ''}
                    noOptionsText="No data found"
                    renderGroup={(params) => [
                        <ListSubheader
                            key={params.group}
                            sx={{
                                position: 'static',
                                pointerEvents: 'none',
                                fontWeight: 'bold',
                                fontSize: '0.9rem',
                                bgcolor: '#f5f5f5',
                                fontFamily: '"Inter", sans-serif',
                            }}
                        >
                            {params.group}
                        </ListSubheader>,
                        params.children,
                    ]}
                    // FIX 3: Safely extract 'key' from props to satisfy React 18, 
                    // and disable pointer events on the Checkbox so it doesn't steal the list item click.
                    renderOption={(props, option, { selected }) => {
                        const { key, ...optionProps } = props;
                        return (
                            <li key={key} {...optionProps}>
                                {multiple && (
                                    <Checkbox
                                        checked={selected}
                                        style={{ pointerEvents: 'none' }}
                                        sx={{ mr: 1 }}
                                    />
                                )}
                                {option.title}
                            </li>
                        );
                    }}
                    renderInput={(params) => (
                        <Components.TextField
                            {...params}
                            inputRef={ref}
                            // label={label || 'Options'}
                            placeholder={placeholder || 'Select options'}
                            error={!!error}
                            helperText={helperText}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '4px',
                                    transition:
                                        'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
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
                                '& .MuiInputLabel-root': {
                                    color: error
                                        ? theme.palette.error.main
                                        : theme.palette.text.primary,
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: error
                                        ? theme.palette.error.main
                                        : theme.palette.text.primary,
                                },
                                '& .MuiInputBase-input': {
                                    color: theme.palette.text.primary,
                                },
                                '& .Mui-disabled': {
                                    color: theme.palette.text.primary,
                                    borderColor: error
                                        ? theme.palette.error.main
                                        : theme.palette.secondary.main,
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
                                        backgroundColor: `${theme.palette.custom.default2} !important`,
                                        color: `${theme.palette.text.primary} !important`,
                                    },
                                    '&[aria-selected="true"]': {
                                        backgroundColor: `${theme.palette.secondary.main} !important`,
                                        color: '#ffffff !important',
                                        '&:hover': {
                                            backgroundColor: `${theme.palette.secondary.main} !important`,
                                        },
                                    },
                                },
                            },
                        },
                    }}
                />
            </>
        );
    }
);

export default TeamMemberSelect;


// import React, { forwardRef } from 'react';
// import { useTheme, ListSubheader } from '@mui/material';
// import Components from '../../muiComponents/components';

// const TeamMemberSelect = forwardRef(
//     (
//         {
//             size = 'small',
//             label,
//             placeholder,
//             error,
//             helperText,
//             value,
//             onChange,
//             options,
//             disabled = false,
//         },
//         ref
//     ) => {
//         const theme = useTheme();
//         // Handle grouped data: teams + individuals
//         const groupedOptions = React.useMemo(() => {
//             if (!options) return [];

//             const { teams = [], individuals = [] } = options;

//             // Flatten into a single array for Autocomplete, but include a "group" label
//             const allOptions = [];

//             teams.forEach((team) => {
//                 allOptions.push({ group: team.name, isHeader: true });
//                 team.members.forEach((member) => {
//                     allOptions.push({
//                         group: team.name,
//                         title: member.name,
//                         id: member.id,
//                         isHeader: false,
//                     });
//                 });
//             });

//             if (individuals.length > 0) {
//                 allOptions.push({ group: 'Other Members', isHeader: true });
//                 individuals.forEach((ind) => {
//                     allOptions.push({
//                         group: 'Other Members',
//                         title: ind.name,
//                         id: ind.id,
//                         isHeader: false,
//                     });
//                 });
//             }

//             return allOptions;
//         }, [options]);

//         // Find currently selected value
//         const selectedOption = groupedOptions?.find((opt) => opt.id === value) || null;
//         return (
//             <Components.Autocomplete
//                 options={groupedOptions?.filter((o) => !o.isHeader)} // only members selectable
//                 size={size}
//                 disabled={disabled}
//                 getOptionLabel={(option) => option?.title || ''}
//                 value={selectedOption}
//                 isOptionEqualToValue={(option, val) => option?.id === val?.id}
//                 onChange={(_, newValue) => onChange(newValue || '')}
//                 groupBy={(option) => option.group || ''}
//                 noOptionsText="No data found"
//                 renderGroup={(params) => [
//                     <ListSubheader
//                         key={params.group}
//                         sx={{
//                             position: 'static',
//                             pointerEvents: 'none',
//                             fontWeight: 'bold',
//                             fontSize: '0.9rem',
//                             bgcolor: '#f5f5f5',
//                             fontFamily: '"Inter", sans-serif',
//                         }}
//                     >
//                         {params.group}
//                     </ListSubheader>,
//                     params.children,
//                     // <div key={params.key} className='ml-6'>
//                     //     {params.children}
//                     // </div>
//                 ]}
//                 renderInput={(params) => (
//                     <Components.TextField
//                         {...params}
//                         inputRef={ref}
//                         label={label || 'Options'}
//                         placeholder={placeholder || 'Select options'}
//                         error={!!error}
//                         helperText={helperText}
//                         sx={{
//                             '& .MuiOutlinedInput-root': {
//                                 borderRadius: '4px',
//                                 transition:
//                                     'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
//                                 '& fieldset': {
//                                     borderColor: error
//                                         ? theme.palette.error.main
//                                         : theme.palette.secondary.main,
//                                 },
//                                 '&:hover fieldset': {
//                                     borderColor: error
//                                         ? theme.palette.error.main
//                                         : theme.palette.secondary.main,
//                                 },
//                                 '&.Mui-focused fieldset': {
//                                     borderColor: error
//                                         ? theme.palette.error.main
//                                         : theme.palette.secondary.main,
//                                 },
//                             },
//                             '& .MuiInputLabel-root': {
//                                 color: error
//                                     ? theme.palette.error.main
//                                     : theme.palette.text.primary,
//                             },
//                             '& .MuiInputLabel-root.Mui-focused': {
//                                 color: error
//                                     ? theme.palette.error.main
//                                     : theme.palette.text.primary,
//                             },
//                             '& .MuiInputBase-input': {
//                                 color: theme.palette.text.primary,
//                             },
//                             '& .Mui-disabled': {
//                                 color: theme.palette.text.primary,
//                                 borderColor: error
//                                     ? theme.palette.error.main
//                                     : theme.palette.secondary.main,
//                             },
//                             '& .MuiFormHelperText-root': {
//                                 color: theme.palette.error.main,
//                                 fontSize: '14px',
//                                 fontWeight: '500',
//                                 marginX: 0.5,
//                             },
//                             fontFamily: '"Inter", sans-serif',
//                         }}
//                     />
//                 )}
//                 componentsProps={{
//                     paper: {
//                         sx: {
//                             '& .MuiAutocomplete-option': {
//                                 padding: '0.5rem 1rem',
//                                 '&:hover': {
//                                     backgroundColor: `${theme.palette.custom.default2} !important`,
//                                     color: `${theme.palette.text.primary} !important`,
//                                 },
//                                 '&[aria-selected="true"]': {
//                                     backgroundColor: `${theme.palette.secondary.main} !important`,
//                                     color: '#ffffff !important',
//                                     '&:hover': {
//                                         backgroundColor: `${theme.palette.secondary.main} !important`,
//                                     },
//                                 },
//                             },
//                         },
//                     },
//                 }}
//             />
//         );
//     }
// );

// export default TeamMemberSelect;
