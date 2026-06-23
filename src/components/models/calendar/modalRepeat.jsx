import React, { useEffect, useMemo, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { connect } from 'react-redux';
import dayjs from 'dayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { FormControlLabel, Radio, RadioGroup } from '@mui/material';

import Components from '../../muiComponents/components';
import Button from '../../common/buttons/button';
import CustomIcons from '../../common/icons/CustomIcons';
import Select from '../../common/select/select';
import { setAlert } from '../../../redux/commonReducers/commonReducers';
import { dateTimeFormatDB, handleRequestClose } from '../../../service/common/commonService';

const calRepeatEveryList = Array.from({ length: 99 }, (_, idx) => {
    const v = idx + 1;
    return { id: v, title: `${v}`, value: v };
});

const calRepeatEveryTypeList = [
    { id: 1, title: 'Day', value: 'day' },
    { id: 2, title: 'Week', value: 'week' },
    { id: 3, title: 'Month', value: 'month' },
    { id: 4, title: 'Year', value: 'year' },
];

const daysList = [
    { id: 1, title: 'Sunday', label: 'S' },
    { id: 2, title: 'Monday', label: 'M' },
    { id: 3, title: 'Tuesday', label: 'T' },
    { id: 4, title: 'Wednesday', label: 'W' },
    { id: 5, title: 'Thursday', label: 'T' },
    { id: 6, title: 'Friday', label: 'F' },
    { id: 7, title: 'Saturday', label: 'S' },
];

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': { padding: theme.spacing(2) },
    '& .MuiDialogActions-root': { padding: theme.spacing(1) },
}));

function ModalRepeat({ setAlert, open, handleClose, handleCloseRepeatModelOnSave, values, setValues }) {
    const theme = useTheme();

    const setIfExists = (name, value) => {
        if (value !== undefined && value !== null && value !== '') {
            setValues(name, value, { shouldDirty: false, shouldValidate: false });
        }
    };

    const [repeatEveryId, setRepeatEveryId] = useState(1);
    const [repeatTypeId, setRepeatTypeId] = useState(1);
    const [selectedDays, setSelectedDays] = useState([]);
    const [seriesStart, setSeriesStart] = useState(null);
    const [seriesEnd, setSeriesEnd] = useState(null);
    const [selectedOption, setSelectedOption] = useState(1); // for month/year

    const repeatEveryOption = useMemo(
        () => calRepeatEveryList.find((o) => o.id === repeatEveryId) || calRepeatEveryList[0],
        [repeatEveryId],
    );

    const repeatTypeOption = useMemo(
        () => calRepeatEveryTypeList.find((o) => o.id === repeatTypeId) || calRepeatEveryTypeList[0],
        [repeatTypeId],
    );

    const normalizeDateOnly = (d) => dayjs(dayjs(d).format('YYYY-MM-DD'));
    const ALL_DAY_IDS = useMemo(() => daysList.map((d) => d.id), []);

    const idsToDayNames = (ids) =>
        daysList
            .filter((d) => ids.includes(d.id))
            .map((d) => d.title)
            .join(',');

    const parseDayNamesOrIdsToIds = (raw) => {
        if (!raw) return [];
        const parts = String(raw)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        const numeric = parts
            .map((v) => parseInt(v, 10))
            .filter((v) => !Number.isNaN(v));
        if (numeric.length) return numeric;
        const ids = parts
            .map((name) => daysList.find((d) => d.title.toLowerCase() === name.toLowerCase())?.id)
            .filter(Boolean);
        return ids;
    };

    // ────────────────────────────────────────────────────────────────────────────────
    // handleChangeTextValue – exact logic from old modalRepeat.jsx, adapted to dayjs
    // ────────────────────────────────────────────────────────────────────────────────
    const handleChangeTextValue = () => {
        const repeatEvery = repeatEveryOption.value;
        const unit = repeatTypeOption.value; // 'day', 'week', 'month', 'year'
        const anchorDate = seriesStart ? dayjs(seriesStart) : dayjs();
        const dayOfMonth = anchorDate.date();
        const dayName = anchorDate.format('dddd');
        const monthName = anchorDate.format('MMMM');
        const weekOfMonthNo = Math.ceil(dayOfMonth / 7);
        const ordinal = (n) => {
            const s = ['th', 'st', 'nd', 'rd'];
            const v = n % 100;
            return n + (s[(v - 20) % 10] || s[v] || s[0]);
        };

        let tempCalRepeatSelectedOptionTextOne = '';
        let tempCalRepeatSelectedOptionTextTwo = '';
        let tempCalRepeatSelectedOptionTextThree = '';
        let tempOccours = '';
        let tempOutOccours = '';
        let tempCalRepeatType = '';

        if (unit === 'day') {
            if (repeatEvery === 1) {
                tempOccours = 'Occurs every day until';
                tempCalRepeatType = 'Daily';
            } else if (repeatEvery === 2) {
                tempOccours = 'Occurs every other day until';
                tempCalRepeatType = 'Custom';
            } else {
                tempOccours = `Occurs every ${repeatEvery} days until`;
                tempCalRepeatType = 'Custom';
            }
            tempOutOccours = tempOccours;
        } else if (unit === 'week') {
            const selectedDaysStr = selectedDays.map((id) => daysList.find((d) => d.id === id)?.title).join(', ');
            if (repeatEvery === 1) {
                tempOccours = `Occurs every ${selectedDaysStr} until`;
                tempCalRepeatType = 'Weekly';
            } else if (repeatEvery === 2) {
                tempOccours = `Occurs every other ${selectedDaysStr} until`;
                tempCalRepeatType = 'Custom';
            } else {
                tempOccours = `Occurs every ${repeatEvery} weeks on ${selectedDaysStr} until`;
                tempCalRepeatType = 'Custom';
            }
            tempOutOccours = tempOccours;
        } else if (unit === 'month') {
            tempCalRepeatSelectedOptionTextOne = `On day ${dayOfMonth}`;
            tempCalRepeatSelectedOptionTextTwo = `On the ${ordinal(weekOfMonthNo)} ${dayName}`;
            tempCalRepeatSelectedOptionTextThree = `On the last ${dayName}`;

            if (repeatEvery === 1 && selectedOption === 1) {
                tempCalRepeatType = 'Monthly';
            } else {
                tempCalRepeatType = 'Custom';
            }

            if (selectedOption === 1) {
                tempOccours = `Occurs on day ${dayOfMonth} until`;
                if (repeatEvery === 1) {
                    tempOutOccours = `Occurs on day ${dayOfMonth} of every month until`;
                } else if (repeatEvery === 2) {
                    tempOutOccours = `Occurs on day ${dayOfMonth} of every other month until`;
                } else {
                    tempOutOccours = `Occurs on day ${dayOfMonth} of every ${repeatEvery} months until`;
                }
            } else if (selectedOption === 2) {
                tempOccours = `Occurs on the ${ordinal(weekOfMonthNo)} ${dayName} until`;
                if (repeatEvery === 1) {
                    tempOutOccours = `Occurs every ${ordinal(weekOfMonthNo)} ${dayName} until`;
                } else if (repeatEvery === 2) {
                    tempOutOccours = `Occurs every other ${ordinal(weekOfMonthNo)} ${dayName} until`;
                } else {
                    tempOutOccours = `Occurs every ${repeatEvery} months on the ${ordinal(weekOfMonthNo)} ${dayName} of the month until`;
                }
            } else if (selectedOption === 3) {
                tempOccours = `Occurs the last ${dayName} until`;
                if (repeatEvery === 1) {
                    tempOutOccours = `Occurs every last ${dayName} until`;
                } else if (repeatEvery === 2) {
                    tempOutOccours = `Occurs every other last ${dayName} until`;
                } else {
                    tempOutOccours = `Occurs every ${repeatEvery} months of the last ${dayName} of the month until`;
                }
            }
        } else if (unit === 'year') {
            tempCalRepeatSelectedOptionTextOne = `On ${monthName} ${dayOfMonth}`;
            tempCalRepeatSelectedOptionTextTwo = `On the ${ordinal(weekOfMonthNo)} ${dayName} of ${monthName}`;
            tempCalRepeatSelectedOptionTextThree = `On the last ${dayName} of ${monthName}`;

            if (selectedOption === 1) {
                tempOccours = `Occurs every ${monthName} ${dayOfMonth}`;
                tempCalRepeatType = 'Yearly';
            } else if (selectedOption === 2) {
                tempOccours = `Occurs every year on the ${ordinal(weekOfMonthNo)} ${dayName} of ${monthName}`;
                tempCalRepeatType = 'Custom';
            } else if (selectedOption === 3) {
                tempOccours = `Occurs every year on the last ${dayName} of ${monthName}`;
                tempCalRepeatType = 'Custom';
            }
            tempOutOccours = tempOccours;
        }

        // Write computed texts back to parent form
        setValues('calRepeatSelectedOptionTextOne', tempCalRepeatSelectedOptionTextOne);
        setValues('calRepeatSelectedOptionTextTwo', tempCalRepeatSelectedOptionTextTwo);
        setValues('calRepeatSelectedOptionTextThree', tempCalRepeatSelectedOptionTextThree);
        setValues('occours', tempOccours);
        setValues('outOccours', tempOutOccours);
        setValues('calRepeatType', tempCalRepeatType === 'Daily' ? 2 : tempCalRepeatType === 'Weekly' ? 3 : tempCalRepeatType === 'Monthly' ? 4 : tempCalRepeatType === 'Yearly' ? 5 : tempCalRepeatType === 'Custom' ? 6 : 1);
        setValues('weekNo', weekOfMonthNo);
    };

    // Re-run text generation whenever relevant inputs change
    useEffect(() => {
        if (open) {
            handleChangeTextValue();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [repeatEveryId, repeatTypeId, selectedDays, seriesStart, selectedOption, open]);

    useEffect(() => {
        if (!open) return;

        const startVal = values?.start ? dayjs(values.start) : dayjs();
        const endVal = values?.calRepeatEndDate
            ? dayjs(values.calRepeatEndDate)
            : values?.end
                ? dayjs(values.end)
                : startVal.add(1, 'year');

        setSeriesStart(startVal);
        setSeriesEnd(endVal);

        const ev = values?.calRepeatEvery ? Number(values.calRepeatEvery) : 1;
        const evMatch = calRepeatEveryList.find((o) => o.value === ev);
        setRepeatEveryId(evMatch ? evMatch.id : 1);

        const unit = values?.calRepeatEveryType || null;
        const unitMatch = calRepeatEveryTypeList.find((o) => o.value === unit);
        const initialUnit = unitMatch ? unitMatch.value : 'day';
        setRepeatTypeId(unitMatch ? unitMatch.id : 1);

        if (initialUnit === 'day') {
            setSelectedDays(ALL_DAY_IDS);
        } else if (initialUnit === 'week') {
            if (values?.calRepeatDayName) {
                setSelectedDays(parseDayNamesOrIdsToIds(values.calRepeatDayName));
            } else if (values?.start) {
                const dow = dayjs(values.start).day();
                setSelectedDays([dow + 1]);
            } else {
                setSelectedDays([]);
            }
        } else {
            setSelectedDays([]);
        }

        // restore selected option for month/year
        if (values?.calRepeatSelectedOption) {
            setSelectedOption(values.calRepeatSelectedOption);
        } else {
            setSelectedOption(1);
        }

        setIfExists('calRepeatEvery', values.calRepeatEvery);
        setIfExists('calRepeatEveryType', values.calRepeatEveryType);
        setIfExists('calRepeatDayName', values.calRepeatDayName);
        setIfExists('calRepeatSelectedOption', values.calRepeatSelectedOption);
        if (values.calRepeatDate) setIfExists('calRepeatDate', values.calRepeatDate);
        if (values.calParentId) setIfExists('calParentId', values.calParentId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const toggleDay = (dayId) => {
        const unit = repeatTypeOption.value;
        setSelectedDays((prev) => {
            const next = prev.includes(dayId) ? prev.filter((id) => id !== dayId) : [...prev, dayId].sort((a, b) => a - b);
            if (unit === 'day') {
                if (next.length === 0) {
                    setRepeatTypeId(1);
                    return ALL_DAY_IDS;
                }
                if (next.length < 7) {
                    setRepeatTypeId(2);
                    return next;
                }
                return next;
            }
            if (unit === 'week') {
                if (next.length === 0 || next.length === 7) {
                    setRepeatTypeId(1);
                    return ALL_DAY_IDS;
                }
                return next;
            }
            return next;
        });
    };

    const onClose = () => handleClose();

    const handleSave = () => {
        const repeatEvery = repeatEveryOption.value;
        const repeatEveryType = repeatTypeOption.value;

        if (!repeatEvery || repeatEvery <= 0) {
            setAlert({ severity: 'error', message: 'Please select a repeat interval.' });
            return;
        }
        if (!seriesStart) {
            setAlert({ severity: 'error', message: 'Please select a start date.' });
            return;
        }
        if (!seriesEnd) {
            setAlert({ severity: 'error', message: 'Please select an end date.' });
            return;
        }
        if (dayjs(seriesEnd).isBefore(dayjs(seriesStart), 'day')) {
            setAlert({ severity: 'error', message: 'End date cannot be before start date.' });
            return;
        }

        setValues('calRepeatEvery', repeatEvery);
        setValues('calRepeatEveryType', repeatEveryType);
        setValues('calRepeatSelectedOption', selectedOption);

        if ((repeatEveryType === 'day' || repeatEveryType === 'week') && selectedDays.length > 0) {
            const ids = repeatEveryType === 'day' ? ALL_DAY_IDS : selectedDays;
            setValues('calRepeatDayName', idsToDayNames(ids));
        } else {
            setValues('calRepeatDayName', null);
        }

        setValues('calRepeatDate', dateTimeFormatDB(seriesStart));
        setValues('calRepeatEndDate', dateTimeFormatDB(seriesEnd));

        handleCloseRepeatModelOnSave();
    };

    const renderSummary = () => {
        const count = repeatEveryOption.value;
        const unitLabel = repeatTypeOption.title + (count > 1 ? 's' : '');
        let text = `Repeats every ${count} ${unitLabel}`;
        if ((repeatTypeOption.value === 'week' || repeatTypeOption.value === 'day') && selectedDays.length) {
            const dayLabels = daysList
                .filter((d) => selectedDays.includes(d.id))
                .map((d) => d.title)
                .join(', ');
            text += repeatTypeOption.value === 'day' ? ` (${dayLabels})` : ` on ${dayLabels}`;
        }
        if (seriesStart) text += ` starting ${dayjs(seriesStart).format('MM/DD/YYYY')}`;
        if (seriesEnd) text += ` until ${dayjs(seriesEnd).format('MM/DD/YYYY')}`;
        return text;
    };

    // Option texts for month/year radios
    const optionTextOne = values?.calRepeatSelectedOptionTextOne || '';
    const optionTextTwo = values?.calRepeatSelectedOptionTextTwo || '';
    const optionTextThree = values?.calRepeatSelectedOptionTextThree || '';
    const weekNo = values?.weekNo || Math.ceil((seriesStart ? dayjs(seriesStart).date() : 1) / 7);

    return (
        <React.Fragment>
            <BootstrapDialog onClose={(event, reason) => handleRequestClose(event, reason, onClose)} open={open} aria-labelledby="customized-dialog-title" fullWidth maxWidth="sm">
                <Components.DialogTitle sx={{ m: 0, p: 2, color: theme.palette.text.primary }} id="customized-dialog-title">
                    Repeat
                </Components.DialogTitle>
                <Components.IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={() => ({
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: theme.palette.primary.icon,
                    })}
                >
                    <CustomIcons iconName={'fa-solid fa-xmark'} css="cursor-pointer text-black w-5 h-5" />
                </Components.IconButton>
                <div>
                    <Components.DialogContent dividers>
                        <div className="flex flex-col gap-6">
                            {/* Start / End Date Pickers */}
                            <div className="flex flex-col gap-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            label="Start date"
                                            value={seriesStart ? normalizeDateOnly(seriesStart) : null}
                                            format="MM/DD/YYYY"
                                            onChange={(date) => {
                                                if (!date) return;
                                                const old = seriesStart ? dayjs(seriesStart) : dayjs();
                                                const merged = dayjs(date).hour(old.hour()).minute(old.minute()).second(old.second());
                                                setSeriesStart(merged);
                                            }}
                                            slotProps={{
                                                textField: {
                                                    variant: 'outlined',
                                                    size: 'small',
                                                    fullWidth: true,
                                                    sx: {
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: '4px',
                                                            transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                                                            '& fieldset': { borderColor: theme.palette.secondary?.main },
                                                            '&:hover fieldset': { borderColor: theme.palette.secondary?.main },
                                                            '&.Mui-focused fieldset': { borderColor: theme.palette.secondary?.main },
                                                        },
                                                        '& .MuiInputLabel-root': { color: theme.palette.text.primary, textTransform: 'capitalize' },
                                                        '& .MuiInputLabel-root.Mui-focused': { color: theme.palette.text.primary },
                                                        '& .MuiInputBase-input': { color: theme.palette.text.primary },
                                                        '& .Mui-disabled': { color: theme.palette.text.primary },
                                                        '& .MuiFormHelperText-root': {
                                                            color: theme.palette.error.main,
                                                            fontSize: '14px',
                                                            fontWeight: '500',
                                                            marginX: 0.5,
                                                        },
                                                        fontFamily: '"Inter", sans-serif',
                                                    },
                                                },
                                            }}
                                        />
                                    </LocalizationProvider>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            label="End date"
                                            value={seriesEnd ? normalizeDateOnly(seriesEnd) : null}
                                            format="MM/DD/YYYY"
                                            minDate={seriesStart ? normalizeDateOnly(seriesStart) : undefined}
                                            onChange={(date) => {
                                                if (!date) return;
                                                const old = seriesEnd ? dayjs(seriesEnd) : dayjs();
                                                const merged = dayjs(date).hour(old.hour()).minute(old.minute()).second(old.second());
                                                setSeriesEnd(merged);
                                            }}
                                            slotProps={{
                                                textField: {
                                                    variant: 'outlined',
                                                    size: 'small',
                                                    fullWidth: true,
                                                    sx: {
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: '4px',
                                                            transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                                                            '& fieldset': { borderColor: theme.palette.secondary?.main },
                                                            '&:hover fieldset': { borderColor: theme.palette.secondary?.main },
                                                            '&.Mui-focused fieldset': { borderColor: theme.palette.secondary?.main },
                                                        },
                                                        '& .MuiInputLabel-root': { color: theme.palette.text.primary, textTransform: 'capitalize' },
                                                        '& .MuiInputLabel-root.Mui-focused': { color: theme.palette.text.primary },
                                                        '& .MuiInputBase-input': { color: theme.palette.text.primary },
                                                        '& .Mui-disabled': { color: theme.palette.text.primary },
                                                        '& .MuiFormHelperText-root': {
                                                            color: theme.palette.error.main,
                                                            fontSize: '14px',
                                                            fontWeight: '500',
                                                            marginX: 0.5,
                                                        },
                                                        fontFamily: '"Inter", sans-serif',
                                                    },
                                                },
                                            }}
                                        />
                                    </LocalizationProvider>
                                </div>
                            </div>

                            {/* Repeat Every & Unit */}
                            <div className="flex flex-col gap-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <Select
                                        options={calRepeatEveryList}
                                        label="Repeat every"
                                        placeholder="Select"
                                        value={repeatEveryId}
                                        onChange={(_, newValue) => {
                                            if (newValue?.id) setRepeatEveryId(newValue.id);
                                        }}
                                    />
                                    <Select
                                        options={calRepeatEveryTypeList}
                                        label="Time unit"
                                        placeholder="Select"
                                        value={repeatTypeId}
                                        onChange={(_, newValue) => {
                                            if (!newValue?.id) return;
                                            setRepeatTypeId(newValue.id);
                                            const unit = newValue.value;
                                            if (unit === 'day') {
                                                setSelectedDays(ALL_DAY_IDS);
                                            } else if (unit === 'week') {
                                                setSelectedDays((prev) => {
                                                    if (prev?.length) return prev;
                                                    const dow = seriesStart ? dayjs(seriesStart).day() : dayjs().day();
                                                    return [dow + 1];
                                                });
                                            } else {
                                                setSelectedDays([]);
                                            }
                                            if (unit === 'month' || unit === 'year') {
                                                setSelectedOption(1);
                                            }
                                        }}
                                    />
                                </div>

                                {/* Day / Week Toggle Buttons */}
                                {(repeatTypeOption.value === 'week' || repeatTypeOption.value === 'day') && (
                                    <div className="flex flex-col gap-2">
                                        <p className="text-xs font-medium text-gray-600">
                                            {repeatTypeOption.value === 'day' ? 'Occurs every day (select days to convert to weekly)' : 'Repeat on'}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {daysList.map((day) => {
                                                const isSelected = selectedDays.includes(day.id);
                                                return (
                                                    <button
                                                        key={day.id}
                                                        type="button"
                                                        onClick={() => toggleDay(day.id)}
                                                        className={`w-9 h-9 flex items-center justify-center rounded-full border text-sm font-medium transition ${isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                                                            }`}
                                                    >
                                                        {day.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Month / Year Radio Group (matching old modal logic) */}
                                {(repeatTypeOption.value === 'month' || repeatTypeOption.value === 'year') && (
                                    <div className="flex flex-col gap-2 mt-2">
                                        <RadioGroup
                                            value={selectedOption}
                                            onChange={(e) => {
                                                const newVal = parseInt(e.target.value, 10);
                                                setSelectedOption(newVal);
                                                setValues('calRepeatSelectedOption', newVal);
                                            }}
                                        >
                                            <FormControlLabel value={1} control={<Radio
                                                sx={{
                                                    '&.Mui-checked': {
                                                        color: theme.palette.secondary.main, // or any color you prefer
                                                    },
                                                }}
                                            />} label={optionTextOne || (repeatTypeOption.value === 'month' ? 'On day X' : 'On Month Day')} />
                                            {weekNo !== 5 && (
                                                <FormControlLabel value={2} control={<Radio
                                                    sx={{
                                                        '&.Mui-checked': {
                                                            color: theme.palette.secondary.main, // or any color you prefer
                                                        },
                                                    }}
                                                />} label={optionTextTwo || (repeatTypeOption.value === 'month' ? 'On the nth weekday' : 'On the nth weekday of month')} />
                                            )}
                                            {weekNo > 3 && (
                                                <FormControlLabel value={3} control={<Radio
                                                    sx={{
                                                        '&.Mui-checked': {
                                                            color: theme.palette.secondary.main, // or any color you prefer
                                                        },
                                                    }}
                                                />} label={optionTextThree || (repeatTypeOption.value === 'month' ? 'On the last weekday' : 'On the last weekday of month')} />
                                            )}
                                        </RadioGroup>
                                    </div>
                                )}
                            </div>

                            {/* Summary */}
                            <div className="rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600">{values?.occours} {seriesEnd ? dayjs(seriesEnd)?.format('MM/DD/YYYY') : ""}</div>
                        </div>
                    </Components.DialogContent>

                    <Components.DialogActions>
                        <div className="flex justify-end items-center gap-4 px-2">
                            <Button type="button" text={'Submit'} onClick={handleSave} endIcon={<CustomIcons iconName={'fa-solid fa-floppy-disk'} css="cursor-pointer" />} />
                            <Button type="button" text={'Cancel'} useFor="disabled" onClick={onClose} startIcon={<CustomIcons iconName={'fa-solid fa-xmark'} css="cursor-pointer mr-2" />} />
                        </div>
                    </Components.DialogActions>
                </div>
            </BootstrapDialog>
        </React.Fragment>
    );
}

const mapDispatchToProps = { setAlert };
export default connect(null, mapDispatchToProps)(ModalRepeat);



// import React, { useEffect, useMemo, useState } from 'react';
// import { styled, useTheme } from '@mui/material/styles';
// import { connect } from 'react-redux';
// import dayjs from 'dayjs';
// import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// import Components from '../../muiComponents/components';
// import Button from '../../common/buttons/button';
// import CustomIcons from '../../common/icons/CustomIcons';
// import Select from '../../common/select/select';
// import { setAlert } from '../../../redux/commonReducers/commonReducers';
// import { dateTimeFormatDB, handleRequestClose } from '../../../service/common/commonService';

// const calRepeatEveryList = Array.from({ length: 99 }, (_, idx) => {
//     const v = idx + 1;
//     return { id: v, title: `${v}`, value: v };
// });

// const calRepeatEveryTypeList = [
//     { id: 1, title: 'Day', value: 'day' },
//     { id: 2, title: 'Week', value: 'week' },
//     { id: 3, title: 'Month', value: 'month' },
//     { id: 4, title: 'Year', value: 'year' },
// ];

// const daysList = [
//     { id: 1, title: 'Sunday', label: 'S' },
//     { id: 2, title: 'Monday', label: 'M' },
//     { id: 3, title: 'Tuesday', label: 'T' },
//     { id: 4, title: 'Wednesday', label: 'W' },
//     { id: 5, title: 'Thursday', label: 'T' },
//     { id: 6, title: 'Friday', label: 'F' },
//     { id: 7, title: 'Saturday', label: 'S' },
// ];

// const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
//     '& .MuiDialogContent-root': { padding: theme.spacing(2) },
//     '& .MuiDialogActions-root': { padding: theme.spacing(1) },
// }));

// function ModalRepeat({ setAlert, open, handleClose, handleCloseRepeatModelOnSave, values, setValues }) {
//     const theme = useTheme();

//     const setIfExists = (name, value) => {
//         if (value !== undefined && value !== null && value !== '') {
//             setValues(name, value, { shouldDirty: false, shouldValidate: false });
//         }
//     };

//     const [repeatEveryId, setRepeatEveryId] = useState(1);
//     const [repeatTypeId, setRepeatTypeId] = useState(1);
//     const [selectedDays, setSelectedDays] = useState([]);

//     const [seriesStart, setSeriesStart] = useState(null);
//     const [seriesEnd, setSeriesEnd] = useState(null);

//     const repeatEveryOption = useMemo(
//         () => calRepeatEveryList.find((o) => o.id === repeatEveryId) || calRepeatEveryList[0],
//         [repeatEveryId],
//     );

//     const repeatTypeOption = useMemo(
//         () => calRepeatEveryTypeList.find((o) => o.id === repeatTypeId) || calRepeatEveryTypeList[0],
//         [repeatTypeId],
//     );

//     const normalizeDateOnly = (d) => dayjs(dayjs(d).format('YYYY-MM-DD'));

//     const ALL_DAY_IDS = useMemo(() => daysList.map((d) => d.id), []);

//     const idsToDayNames = (ids) =>
//         daysList
//             .filter((d) => ids.includes(d.id))
//             .map((d) => d.title)
//             .join(',');

//     const parseDayNamesOrIdsToIds = (raw) => {
//         if (!raw) return [];
//         const parts = String(raw)
//             .split(',')
//             .map((s) => s.trim())
//             .filter(Boolean);

//         // legacy: "5,6"
//         const numeric = parts
//             .map((v) => parseInt(v, 10))
//             .filter((v) => !Number.isNaN(v));
//         if (numeric.length) return numeric;

//         // new: "Tuesday,Wednesday"
//         const ids = parts
//             .map((name) => daysList.find((d) => d.title.toLowerCase() === name.toLowerCase())?.id)
//             .filter(Boolean);
//         return ids;
//     };

//     const handleChangeTextValue = () => {
//         let tempCalRepeatSelectedOptionTextOne = "";
//         let tempCalRepeatSelectedOptionTextTwo = "";
//         let tempCalRepeatSelectedOptionTextThree = "";
//         let tempOccours = "";
//         let tempOutOccours = "";
//         let tempCalRepeatType = "";

//         // Helper to format ordinals (1st, 2nd, etc) similar to your requirement
//         const getOrdinal = (n) => {
//             const s = ["th", "st", "nd", "rd"];
//             const v = n % 100;
//             return n + (s[(v - 20) % 10] || s[v] || s[0]);
//         };

//         const repeatDate = values.calRepeatDate ? dayjs(values.calRepeatDate) : dayjs();
//         const dayName = repeatDate.format('dddd'); // EEEE equivalent
//         const monthName = repeatDate.format('MMMM'); // MMMM equivalent
//         const dateOfMonth = repeatDate.date();

//         // Calculate Week of Month (matches your Math.ceil(d/7) logic)
//         const weekOfMonthNo = Math.ceil(dateOfMonth / 7);

//         // --- DAILY LOGIC ---
//         if (values.calRepeatEveryType === "day") {
//             if (values.calRepeatEvery === 1) {
//                 tempOccours = "Occurs every day until";
//                 tempCalRepeatType = "Daily";
//             } else if (values.calRepeatEvery === 2) {
//                 tempOccours = "Occurs every other day until";
//                 tempCalRepeatType = "Custom";
//             } else {
//                 tempOccours = "Occurs every " + (values.calRepeatEvery || 1) + " days until";
//                 tempCalRepeatType = "Custom";
//             }
//             tempOutOccours = tempOccours;

//             // --- WEEKLY LOGIC ---
//         } else if (values.calRepeatEveryType === "week") {
//             const selectedDaysStr = Array.isArray(values.calRepeatDayName)
//                 ? values.calRepeatDayName.join(", ")
//                 : (values.calRepeatDayName || "");

//             if (values.calRepeatEvery === 1) {
//                 tempOccours = "Occurs every " + selectedDaysStr + " until";
//                 tempCalRepeatType = "Weekly";
//             } else if (values.calRepeatEvery === 2) {
//                 tempOccours = "Occurs every other " + selectedDaysStr + " until";
//                 tempCalRepeatType = "Custom";
//             } else {
//                 tempOccours = "Occurs every " + (values.calRepeatEvery || 1) + " weeks on " + selectedDaysStr + " until";
//                 tempCalRepeatType = "Custom";
//             }
//             tempOutOccours = tempOccours;

//             // --- MONTHLY LOGIC ---
//         } else if (values.calRepeatEveryType === "month") {
//             tempCalRepeatSelectedOptionTextOne = "On day " + dateOfMonth;
//             tempCalRepeatSelectedOptionTextTwo = "On the " + getOrdinal(weekOfMonthNo) + " " + dayName;
//             tempCalRepeatSelectedOptionTextThree = "On the last " + dayName;

//             if (values.calRepeatEvery === 1 && values.calRepeatSelectedOption === 1) {
//                 tempCalRepeatType = "Monthly";
//             } else {
//                 tempCalRepeatType = "Custom";
//             }

//             if (values.calRepeatSelectedOption === 1) {
//                 tempOccours = "Occurs on day " + dateOfMonth + " until";
//                 if (values.calRepeatEvery === 1) {
//                     tempOutOccours = "Occurs on day " + dateOfMonth + " of every month until";
//                 } else if (values.calRepeatEvery === 2) {
//                     tempOutOccours = "Occurs on day " + dateOfMonth + " of every other month until";
//                 } else {
//                     tempOutOccours = "Occurs on day " + dateOfMonth + " of every " + values.calRepeatEvery + " months until";
//                 }
//             } else if (values.calRepeatSelectedOption === 2) {
//                 tempOccours = "Occurs on the " + getOrdinal(weekOfMonthNo) + " " + dayName + " until";
//                 if (values.calRepeatEvery === 1) {
//                     tempOutOccours = "Occurs every " + getOrdinal(weekOfMonthNo) + " " + dayName + " until";
//                 } else if (values.calRepeatEvery === 2) {
//                     tempOutOccours = "Occurs every other " + getOrdinal(weekOfMonthNo) + " " + dayName + " until";
//                 } else {
//                     tempOutOccours = "Occurs every " + values.calRepeatEvery + " months on the " + getOrdinal(weekOfMonthNo) + " " + dayName + " of the month until";
//                 }
//             } else if (values.calRepeatSelectedOption === 3) {
//                 tempOccours = "Occurs the last " + dayName + " until";
//                 if (values.calRepeatEvery === 1) {
//                     tempOutOccours = "Occurs every last " + dayName + " until";
//                 } else if (values.calRepeatEvery === 2) {
//                     tempOutOccours = "Occurs every other last " + dayName + " until";
//                 } else {
//                     tempOutOccours = "Occurs every " + values.calRepeatEvery + " months of the last " + dayName + " of the month until";
//                 }
//             }

//             // --- YEARLY LOGIC ---
//         } else if (values.calRepeatEveryType === "year") {
//             tempCalRepeatSelectedOptionTextOne = "On " + monthName + " " + dateOfMonth;
//             tempCalRepeatSelectedOptionTextTwo = "On the " + getOrdinal(weekOfMonthNo) + " " + dayName + " of " + monthName;
//             tempCalRepeatSelectedOptionTextThree = "On the last " + dayName + " of " + monthName;

//             if (values.calRepeatSelectedOption === 1) {
//                 tempOccours = "Occurs every " + monthName + " " + dateOfMonth;
//                 tempCalRepeatType = "Yearly";
//             } else if (values.calRepeatSelectedOption === 2) {
//                 tempOccours = "Occurs every year on the " + getOrdinal(weekOfMonthNo) + " " + dayName + " of " + monthName;
//                 tempCalRepeatType = "Custom";
//             } else if (values.calRepeatSelectedOption === 3) {
//                 tempOccours = "Occurs every year on the last " + dayName + " of " + monthName;
//                 tempCalRepeatType = "Custom";
//             }
//             tempOutOccours = tempOccours;
//         }

//         // --- UPDATE FORM VALUES ---
//         setValues("calRepeatSelectedOptionTextOne", tempCalRepeatSelectedOptionTextOne);
//         setValues("calRepeatSelectedOptionTextTwo", tempCalRepeatSelectedOptionTextTwo);
//         setValues("calRepeatSelectedOptionTextThree", tempCalRepeatSelectedOptionTextThree);
//         setValues("occours", tempOccours);
//         setValues("outOccours", tempOutOccours);
//         setValues("calRepeatType", tempCalRepeatType);
//         setValues("weekNo", weekOfMonthNo);
//     };

//     useEffect(() => {
//         if (!open) return;

//         // --- init start/end from parent values (keep time part from start/end, but date picker shows date only)
//         const startVal = values?.start ? dayjs(values.start) : dayjs();
//         const endVal = values?.calRepeatEndDate
//             ? dayjs(values.calRepeatEndDate)
//             : values?.end
//                 ? dayjs(values.end)
//                 : startVal.add(1, 'year');

//         setSeriesStart(startVal);
//         setSeriesEnd(endVal);

//         // --- repeat every
//         const ev = values?.calRepeatEvery ? Number(values.calRepeatEvery) : 1;
//         const evMatch = calRepeatEveryList.find((o) => o.value === ev);
//         setRepeatEveryId(evMatch ? evMatch.id : 1);

//         // --- unit
//         const unit = values?.calRepeatEveryType || null; // day|week|month|year
//         const unitMatch = calRepeatEveryTypeList.find((o) => o.value === unit);
//         const initialUnit = unitMatch ? unitMatch.value : 'day';
//         setRepeatTypeId(unitMatch ? unitMatch.id : 1);

//         // --- selected days
//         // Daily => default ALL selected
//         if (initialUnit === 'day') {
//             setSelectedDays(ALL_DAY_IDS);
//         } else if (initialUnit === 'week') {
//             if (values?.calRepeatDayName) {
//                 setSelectedDays(parseDayNamesOrIdsToIds(values.calRepeatDayName));
//             } else if (values?.start) {
//                 const dow = dayjs(values.start).day(); // 0..6
//                 setSelectedDays([dow + 1]); // store 1..7
//             } else {
//                 setSelectedDays([]);
//             }
//         } else {
//             setSelectedDays([]);
//         }

//         // Keep these if already exist
//         if (values) {
//             setIfExists('calRepeatEvery', values.calRepeatEvery);
//             setIfExists('calRepeatEveryType', values.calRepeatEveryType);
//             setIfExists('calRepeatDayName', values.calRepeatDayName);
//             setIfExists('calRepeatSelectedOption', values.calRepeatSelectedOption);
//             if (values.calRepeatDate) setIfExists('calRepeatDate', values.calRepeatDate);
//             if (values.calParentId) setIfExists('calParentId', values.calParentId);
//         }
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [open]);

//     const toggleDay = (dayId) => {
//         const unit = repeatTypeOption.value; // current unit

//         setSelectedDays((prev) => {
//             const next = prev.includes(dayId) ? prev.filter((id) => id !== dayId) : [...prev, dayId].sort((a, b) => a - b);

//             // ✅ Daily behavior
//             // - Daily starts with ALL selected.
//             // - If user unselects any one => convert to Weekly with remaining.
//             // - If user unselects all => back to Daily (ALL selected).
//             if (unit === 'day') {
//                 if (next.length === 0) {
//                     // back to Daily => ALL
//                     setRepeatTypeId(1); // Day
//                     return ALL_DAY_IDS;
//                 }
//                 if (next.length < 7) {
//                     // convert to weekly with remaining
//                     setRepeatTypeId(2); // Week
//                     return next;
//                 }
//                 return next;
//             }

//             // ✅ Weekly behavior
//             // - If user selects ALL => convert to Daily
//             // - If user unselects all => convert to Daily (ALL)
//             if (unit === 'week') {
//                 if (next.length === 0) {
//                     setRepeatTypeId(1); // Day
//                     return ALL_DAY_IDS;
//                 }
//                 if (next.length === 7) {
//                     setRepeatTypeId(1); // Day
//                     return ALL_DAY_IDS;
//                 }
//                 return next;
//             }

//             return next;
//         });
//     };

//     const onClose = () => handleClose();

//     const handleSave = () => {
//         const repeatEvery = repeatEveryOption.value;
//         const repeatEveryType = repeatTypeOption.value; // day|week|month|year

//         if (!repeatEvery || repeatEvery <= 0) {
//             setAlert({ severity: 'error', message: 'Please select a repeat interval.' });
//             return;
//         }
//         if (!seriesStart) {
//             setAlert({ severity: 'error', message: 'Please select a start date.' });
//             return;
//         }
//         if (!seriesEnd) {
//             setAlert({ severity: 'error', message: 'Please select an end date.' });
//             return;
//         }
//         if (dayjs(seriesEnd).isBefore(dayjs(seriesStart), 'day')) {
//             setAlert({ severity: 'error', message: 'End date cannot be before start date.' });
//             return;
//         }

//         // --- write back to parent RHF ---
//         setValues('calRepeatEvery', repeatEvery);
//         setValues('calRepeatEveryType', repeatEveryType);
//         // setValues('calRepeatType', getCalRepeatTypeLabel(repeatEveryType));

//         // ✅ day/week both store day names
//         if ((repeatEveryType === 'day' || repeatEveryType === 'week') && selectedDays.length > 0) {
//             // Daily must always be ALL days
//             const ids = repeatEveryType === 'day' ? ALL_DAY_IDS : selectedDays;
//             setValues('calRepeatDayName', idsToDayNames(ids));
//         } else {
//             setValues('calRepeatDayName', null);
//         }

//         // ✅ store repeat date anchors consistently
//         setValues('calRepeatDate', dateTimeFormatDB(seriesStart));
//         setValues('calRepeatEndDate', dateTimeFormatDB(seriesEnd));

//         // ✅ IMPORTANT: do NOT modify event start/end here (Repeat modal should not change event time)

//         // handleClose();
//         handleCloseRepeatModelOnSave()
//     };

//     const renderSummary = () => {
//         const count = repeatEveryOption.value;
//         const unitLabel = repeatTypeOption.title + (count > 1 ? 's' : '');
//         let text = `Repeats every ${count} ${unitLabel}`;

//         if ((repeatTypeOption.value === 'week' || repeatTypeOption.value === 'day') && selectedDays.length) {
//             const dayLabels = daysList
//                 .filter((d) => selectedDays.includes(d.id))
//                 .map((d) => d.title)
//                 .join(', ');
//             text += repeatTypeOption.value === 'day' ? ` (${dayLabels})` : ` on ${dayLabels}`;
//         }

//         if (seriesStart) text += ` starting ${dayjs(seriesStart).format('MM/DD/YYYY')}`;
//         if (seriesEnd) text += ` until ${dayjs(seriesEnd).format('MM/DD/YYYY')}`;

//         return text;
//     };

//     useEffect(() => {
//         const data = calRepeatEveryTypeList?.find((row) => row.id === repeatTypeId).value
//         setValues("calRepeatType", data === "day" ? 2 : data === "week" ? 3 : data === "month" ? 4 : data === "year" ? 5 : 1)
//     }, [repeatTypeId])

//     return (
//         <React.Fragment>
//             <BootstrapDialog onClose={(event, reason) => handleRequestClose(event, reason, onClose)} open={open} aria-labelledby="customized-dialog-title" fullWidth maxWidth="sm">
//                 <Components.DialogTitle sx={{ m: 0, p: 2, color: theme.palette.text.primary }} id="customized-dialog-title">
//                     Repeat
//                 </Components.DialogTitle>

//                 <Components.IconButton
//                     aria-label="close"
//                     onClick={onClose}
//                     sx={() => ({
//                         position: 'absolute',
//                         right: 8,
//                         top: 8,
//                         color: theme.palette.primary.icon,
//                     })}
//                 >
//                     <CustomIcons iconName={'fa-solid fa-xmark'} css="cursor-pointer text-black w-5 h-5" />
//                 </Components.IconButton>

//                 <div>
//                     <Components.DialogContent dividers>
//                         <div className="flex flex-col gap-6">
//                             <div className="flex flex-col gap-3">
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                                     <LocalizationProvider dateAdapter={AdapterDayjs}>
//                                         <DatePicker
//                                             label="Start date"
//                                             value={seriesStart ? normalizeDateOnly(seriesStart) : null}
//                                             format="MM/DD/YYYY"
//                                             onChange={(date) => {
//                                                 if (!date) return;
//                                                 // preserve time from old seriesStart
//                                                 const old = seriesStart ? dayjs(seriesStart) : dayjs();
//                                                 const merged = dayjs(date).hour(old.hour()).minute(old.minute()).second(old.second());
//                                                 setSeriesStart(merged);
//                                             }}
//                                             slotProps={{
//                                                 textField: {
//                                                     variant: 'outlined',
//                                                     size: 'small',
//                                                     fullWidth: true,
//                                                     sx: {
//                                                         '& .MuiOutlinedInput-root': {
//                                                             borderRadius: '4px',
//                                                             transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
//                                                             '& fieldset': { borderColor: theme.palette.secondary?.main },
//                                                             '&:hover fieldset': { borderColor: theme.palette.secondary?.main },
//                                                             '&.Mui-focused fieldset': { borderColor: theme.palette.secondary?.main },
//                                                         },
//                                                         '& .MuiInputLabel-root': { color: theme.palette.text.primary, textTransform: 'capitalize' },
//                                                         '& .MuiInputLabel-root.Mui-focused': { color: theme.palette.text.primary },
//                                                         '& .MuiInputBase-input': { color: theme.palette.text.primary },
//                                                         '& .Mui-disabled': { color: theme.palette.text.primary },
//                                                         '& .MuiFormHelperText-root': {
//                                                             color: theme.palette.error.main,
//                                                             fontSize: '14px',
//                                                             fontWeight: '500',
//                                                             marginX: 0.5,
//                                                         },
//                                                         fontFamily: '"Inter", sans-serif',
//                                                     },
//                                                 },
//                                             }}
//                                         />
//                                     </LocalizationProvider>

//                                     <LocalizationProvider dateAdapter={AdapterDayjs}>
//                                         <DatePicker
//                                             label="End date"
//                                             value={seriesEnd ? normalizeDateOnly(seriesEnd) : null}
//                                             format="MM/DD/YYYY"
//                                             minDate={seriesStart ? normalizeDateOnly(seriesStart) : undefined}
//                                             onChange={(date) => {
//                                                 if (!date) return;
//                                                 // preserve time from old seriesEnd
//                                                 const old = seriesEnd ? dayjs(seriesEnd) : dayjs();
//                                                 const merged = dayjs(date).hour(old.hour()).minute(old.minute()).second(old.second());
//                                                 setSeriesEnd(merged);
//                                             }}
//                                             slotProps={{
//                                                 textField: {
//                                                     variant: 'outlined',
//                                                     size: 'small',
//                                                     fullWidth: true,
//                                                     sx: {
//                                                         '& .MuiOutlinedInput-root': {
//                                                             borderRadius: '4px',
//                                                             transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
//                                                             '& fieldset': { borderColor: theme.palette.secondary?.main },
//                                                             '&:hover fieldset': { borderColor: theme.palette.secondary?.main },
//                                                             '&.Mui-focused fieldset': { borderColor: theme.palette.secondary?.main },
//                                                         },
//                                                         '& .MuiInputLabel-root': { color: theme.palette.text.primary, textTransform: 'capitalize' },
//                                                         '& .MuiInputLabel-root.Mui-focused': { color: theme.palette.text.primary },
//                                                         '& .MuiInputBase-input': { color: theme.palette.text.primary },
//                                                         '& .Mui-disabled': { color: theme.palette.text.primary },
//                                                         '& .MuiFormHelperText-root': {
//                                                             color: theme.palette.error.main,
//                                                             fontSize: '14px',
//                                                             fontWeight: '500',
//                                                             marginX: 0.5,
//                                                         },
//                                                         fontFamily: '"Inter", sans-serif',
//                                                     },
//                                                 },
//                                             }}
//                                         />
//                                     </LocalizationProvider>
//                                 </div>
//                             </div>

//                             <div className="flex flex-col gap-3">
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                                     <Select
//                                         options={calRepeatEveryList}
//                                         label="Repeat every"
//                                         placeholder="Select"
//                                         value={repeatEveryId}
//                                         onChange={(_, newValue) => {
//                                             if (newValue?.id) setRepeatEveryId(newValue.id);
//                                         }}
//                                     />
//                                     <Select
//                                         options={calRepeatEveryTypeList}
//                                         label="Time unit"
//                                         placeholder="Select"
//                                         value={repeatTypeId}
//                                         onChange={(_, newValue) => {
//                                             if (!newValue?.id) return;
//                                             setRepeatTypeId(newValue.id);

//                                             // when user explicitly changes unit, keep UI consistent
//                                             const unit = newValue.value; // day|week|month|year
//                                             if (unit === 'day') {
//                                                 setSelectedDays(ALL_DAY_IDS);
//                                             } else if (unit === 'week') {
//                                                 // if empty, default to start day
//                                                 setSelectedDays((prev) => {
//                                                     if (prev?.length) return prev;
//                                                     const dow = seriesStart ? dayjs(seriesStart).day() : dayjs().day();
//                                                     return [dow + 1];
//                                                 });
//                                             } else {
//                                                 setSelectedDays([]);
//                                             }
//                                         }}
//                                     />
//                                 </div>

//                                 {(repeatTypeOption.value === 'week' || repeatTypeOption.value === 'day') && (
//                                     <div className="flex flex-col gap-2">
//                                         <p className="text-xs font-medium text-gray-600">
//                                             {repeatTypeOption.value === 'day' ? 'Occurs every day (select days to convert to weekly)' : 'Repeat on'}
//                                         </p>
//                                         <div className="flex flex-wrap gap-2">
//                                             {daysList.map((day) => {
//                                                 const isSelected = selectedDays.includes(day.id);
//                                                 return (
//                                                     <button
//                                                         key={day.id}
//                                                         type="button"
//                                                         onClick={() => toggleDay(day.id)}
//                                                         className={`w-9 h-9 flex items-center justify-center rounded-full border text-sm font-medium transition
//                               ${isSelected
//                                                                 ? 'bg-blue-600 text-white border-blue-600'
//                                                                 : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
//                                                             }`}
//                                                     >
//                                                         {day.label}
//                                                     </button>
//                                                 );
//                                             })}
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>

//                             <div className="rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600">{renderSummary()}</div>
//                         </div>
//                     </Components.DialogContent>

//                     <Components.DialogActions>
//                         <div className="flex justify-end items-center gap-4 px-2">
//                             <Button
//                                 type="button"
//                                 text={'Submit'}
//                                 onClick={handleSave}
//                                 endIcon={<CustomIcons iconName={'fa-solid fa-floppy-disk'} css="cursor-pointer" />}
//                             />
//                             <Button
//                                 type="button"
//                                 text={'Cancel'}
//                                 useFor="disabled"
//                                 onClick={onClose}
//                                 startIcon={<CustomIcons iconName={'fa-solid fa-xmark'} css="cursor-pointer mr-2" />}
//                             />
//                         </div>
//                     </Components.DialogActions>
//                 </div>
//             </BootstrapDialog>
//         </React.Fragment>
//     );
// }

// const mapDispatchToProps = { setAlert };

// export default connect(null, mapDispatchToProps)(ModalRepeat);