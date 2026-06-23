import React, { useMemo, useState } from "react";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { Controller } from "react-hook-form";
import { useTheme } from '@mui/material';
import { createTheme, ThemeProvider } from "@mui/material/styles";

const DatePickerComponent = ({ name, setValue, control, label, minDate, maxDate, required = false, disabled = false, showDates = null, requiredFiledLabel = false }) => {
  const theme = useTheme();
  
  // State to manually control the visibility of the calendar picker
  const [open, setOpen] = useState(false);

  const customTheme = createTheme({
    components: {
      MuiDayCalendar: {
        styleOverrides: {
          weekDayLabel: {
            color: '#000000',
          }
        }
      },
      MuiPickersDay: {
        styleOverrides: {
          root: {
            color: "#000000",
            "&:hover": {
              backgroundColor: theme.palette.secondary.main,
              color: "#ffffff",
            },
            "&.Mui-selected": {
              backgroundColor: `${theme.palette.secondary.main} !important`,
              color: "#ffffff !important",
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            color: "#000000",
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: theme.palette.text.primary,
          },
        },
      },
      MuiPickersCalendarHeader: {
        styleOverrides: {
          root: {
            color: "#000000",
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            color: "#000000",
          },
        },
      },
    },
  });

  const enabledDatesSet = useMemo(() => {
    if (!showDates || showDates.size === 0) return false;

    return new Set(
      Array.from(showDates)
        .map((d) => {
          const datePart = String(d).split(" ")[0];
          return dayjs(datePart, "MM/DD/YYYY").format("MM/DD/YYYY");
        })
        .filter(Boolean)
    );
  }, [showDates]);

  return (
    <div>
      <p className='mb-2 text-black text-left'>
        {label}
        {
          requiredFiledLabel && <span className='text-red-500 ml-1'>*</span>
        }
      </p>
      <ThemeProvider theme={customTheme}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Controller
            name={name}
            control={control}
            rules={{
              required: required
            }}
            render={({ field, fieldState }) => (
              <DatePicker
                {...field}
                // Control the open state manually
                open={open}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
                disabled={disabled}
                format="MM/DD/YYYY"
                // Ensure value defaults to null if field is empty to prevent errors with maxDate logic
                value={field.value ? dayjs(field.value) : null}
                onChange={(date) => {
                  setValue(name, date ? dayjs(date).format("MM/DD/YYYY") : null);
                }}
                minDate={minDate ? dayjs(minDate) : null}
                maxDate={maxDate ? dayjs(maxDate) : null}
                slotProps={{
                  textField: {
                    // Trigger the picker when the input field is clicked
                    onClick: () => !disabled && setOpen(true),
                    fullWidth: true,
                    variant: "outlined",
                    error: !!fieldState.error,
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '4px',
                        cursor: disabled ? 'default' : 'pointer', // Show pointer on hover
                        transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                        '& fieldset': {
                          borderColor: fieldState.error
                            ? theme.palette.error.main
                            : theme.palette.secondary.main,
                        },
                        '&:hover fieldset': {
                          borderColor: fieldState.error
                            ? theme.palette.error.main
                            : theme.palette.secondary.main,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: fieldState.error
                            ? theme.palette.error.main
                            : theme.palette.secondary.main,
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: fieldState.error
                          ? theme.palette.error.main
                          : theme.palette.text.primary,
                      },
                      '& .MuiInputBase-input': {
                        color: theme.palette.text.primary,
                        height: 7,
                        cursor: disabled ? 'default' : 'pointer', // Ensure text area also shows pointer
                      },
                      '& .MuiInputBase-input.Mui-disabled': {
                        color: theme.palette.text.primary,
                        WebkitTextFillColor: theme.palette.text.primary,
                      },
                      fontFamily: '"Inter", sans-serif',
                    },
                  },
                }}
                shouldDisableDate={(day) => {
                  if (!enabledDatesSet) return false;
                  const formatted = dayjs(day).format("MM/DD/YYYY");
                  return !enabledDatesSet.has(formatted);
                }}
              />
            )}
          />
        </LocalizationProvider>
      </ThemeProvider>
    </div>
  );
};

export default DatePickerComponent;