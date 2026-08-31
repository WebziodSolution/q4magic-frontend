import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getTimeZones } from '../../../../service/timeZones/timeZoneService';
import CustomIcons from '../../../../components/common/icons/CustomIcons';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { userTimeZone } from '../../../../service/common/commonService';
import { createTheme, ThemeProvider, useTheme } from '@mui/material';
import { freeSlotList, getEditAppointmentDetails, updateAppointmentDateTime } from '../../../../service/calendar/calendarAppointment/calendarAppointmentService';
import Select from '../../../../components/common/select/select';
import Button from '../../../../components/common/buttons/button';
import Stapper from '../../../../components/common/stapper/stapper';

const formatDuration = (hours, minutes) => {
    if (hours && minutes && Number(minutes) > 0) {
        const pad = (num) => String(num).padStart(2, '0');
        return `${pad(hours)}:${pad(minutes)} Hour`;
    }
    if (hours && Number(hours) > 0) {
        return `${hours} Hour${Number(hours) > 1 ? 's' : ''}`;
    }
    if (minutes && Number(minutes) > 0) {
        return `${minutes} Min`;
    }
    return '1 Hour';
};

const formatSlotTime = (timeStr) => {
    if (!timeStr) return "";
    const parts = timeStr.split(":");
    if (parts.length < 2) return timeStr;
    const hour = parseInt(parts[0], 10);
    const minute = parseInt(parts[1], 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    const paddedHour = hour12 < 10 ? `0${hour12}` : `${hour12}`;
    const minuteStr = minute < 10 ? `0${minute}` : `${minute}`;
    return `${paddedHour}:${minuteStr} ${ampm}`;
};

const EditAppointment = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id') || '';
    const v = searchParams.get('v') || '';

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
                            backgroundColor: theme.palette?.secondary?.main || '#44288E',
                            color: "#ffffff",
                        },
                        "&.Mui-selected": {
                            backgroundColor: `${theme.palette?.secondary?.main || '#44288E'} !important`,
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
                        color: theme.palette?.text?.primary || '#000000',
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

    const [pageLoading, setPageLoading] = useState(true);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [appointmentData, setAppointmentData] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [successData, setSuccessData] = useState(null);

    const [timeZoneList, setTimeZoneList] = useState([]);
    const [selectedTimeZoneId, setSelectedTimeZoneId] = useState('');
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [slots, setSlots] = useState([]);

    // Fetch initial details and timezones
    useEffect(() => {
        const initData = async () => {
            if (!id) {
                setErrorMessage('Invalid or missing appointment ID.');
                setPageLoading(false);
                return;
            }

            try {
                setPageLoading(true);
                // 1. Fetch timezones
                const tzRes = await getTimeZones();
                let tzOptions = [];
                if (tzRes?.status === 200 && Array.isArray(tzRes?.result)) {
                    tzOptions = tzRes.result.map(row => ({
                        id: row.tmzId,
                        title: row.tmzTitle,
                        value: row.tmzValue
                    }));
                    setTimeZoneList(tzOptions);
                }

                // 2. Fetch appointment details
                const appRes = await getEditAppointmentDetails(id, v);
                if (appRes?.status === 200 || (appRes?.result && !appRes?.error)) {
                    const data = appRes?.result || appRes?.data;
                    setAppointmentData(data);

                    // Set initial timezone
                    const appTz = data?.calTimeZone || userTimeZone;
                    const matchedTz = tzOptions.find(t => t.value === appTz || t.title === appTz) || tzOptions.find(t => t.value === userTimeZone);
                    if (matchedTz) {
                        setSelectedTimeZoneId(matchedTz.id);
                    } else if (tzOptions.length > 0) {
                        setSelectedTimeZoneId(tzOptions[0].id);
                    }

                    // Set initial date from appointment start if available
                    if (data?.start) {
                        const parsedStart = dayjs(data.start, "MM/DD/YYYY HH:mm:ss");
                        if (parsedStart.isValid()) {
                            setSelectedDate(parsedStart);
                        }
                    }
                } else {
                    setErrorMessage(appRes?.message || appRes?.error || 'Failed to load appointment details.');
                }
            } catch (error) {
                console.error("Error initializing edit appointment:", error);
                setErrorMessage(error?.response?.data?.message || error?.message || 'Error loading appointment details.');
            } finally {
                setPageLoading(false);
            }
        };

        initData();
    }, [id, v]);

    // Fetch free slots whenever date, timezone, or appointmentData changes
    useEffect(() => {
        const fetchSlots = async () => {
            if (!appointmentData || !selectedTimeZoneId || !selectedDate) return;

            setSlotsLoading(true);
            try {
                const selectedTzObj = timeZoneList.find(t => t.id === selectedTimeZoneId);
                const tzValue = selectedTzObj ? selectedTzObj.value : (appointmentData?.calTimeZone || userTimeZone);

                const isToday = selectedDate.isSame(dayjs(), 'day');
                const currentDateYNVal = isToday ? "Y" : "N";

                const payload = {
                    slotTimeMinus: appointmentData?.slotTimeMinus || 60,
                    slotDateTime: selectedDate.format("MM/DD/YYYY"),
                    slotUserId: String(appointmentData?.customerId || ""),
                    timeZone: tzValue,
                    currentDateYN: currentDateYNVal
                };

                const res = await freeSlotList(userTimeZone, payload);
                if (res?.status === 200 && Array.isArray(res?.result?.freeSlotList)) {
                    setSlots(res.result.freeSlotList);
                } else {
                    setSlots([]);
                }
            } catch (error) {
                console.error("Error fetching free slots:", error);
                setSlots([]);
            } finally {
                setSlotsLoading(false);
            }
        };

        fetchSlots();
    }, [selectedDate, selectedTimeZoneId, appointmentData]);

    const handleSelectSlot = (slot) => {
        const dateStr = selectedDate.format("MM/DD/YYYY");
        const startDateTime = `${dateStr} ${slot}`;
        const durationMin = Number(appointmentData?.slotTimeMinus || 60);
        const startDayjs = dayjs(`${dateStr} ${slot}`, "MM/DD/YYYY HH:mm:ss");
        const endDayjs = startDayjs.add(durationMin, 'minute');
        const endDateTime = endDayjs.format("MM/DD/YYYY HH:mm:ss");

        if (selectedSlot?.start === startDateTime) {
            setSelectedSlot(null);
        } else {
            setSelectedSlot({
                start: startDateTime,
                end: endDateTime,
                slotTime: slot,
                date: dateStr
            });
        }
    };

    const handleSubmitReschedule = async () => {
        if (!selectedSlot) {
            alert("Please select a time slot.");
            return;
        }

        try {
            setSubmitting(true);
            const selectedTzObj = timeZoneList.find(t => t.id === selectedTimeZoneId);
            const tzValue = selectedTzObj ? selectedTzObj.value : (appointmentData?.calTimeZone || userTimeZone);

            const payload = {
                id: appointmentData?.id || id,
                start: selectedSlot.start,
                end: selectedSlot.end,
                timeZone: tzValue,
                v: v
            };

            const res = await updateAppointmentDateTime(payload);
            if (res?.status === 200 || (!res?.error && res?.result)) {
                setSuccessData({
                    ...appointmentData,
                    start: selectedSlot.start,
                    end: selectedSlot.end,
                    calTimeZone: tzValue
                });
            } else {
                alert(res?.message || res?.error || "Failed to update appointment date and time.");
            }
        } catch (error) {
            console.error("Error updating appointment:", error);
            alert(error?.response?.data?.message || error?.message || "An error occurred while updating the meeting.");
        } finally {
            setSubmitting(false);
        }
    };

    const steps = ["", "", "", "", "", ""];

    return (
        <div className="min-h-screen flex-row items-start justify-center bg-gray-50 p-4">
            {pageLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 font-medium">Loading appointment details...</p>
                </div>
            ) : errorMessage ? (
                <div className="max-w-md mx-auto bg-white p-8 rounded-xl border border-gray-200 shadow-md text-center space-y-6 mt-12">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto border border-red-200">
                        <CustomIcons iconName="fa-solid fa-circle-exclamation" css="text-red-500 text-3xl" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-gray-900">Unable to Load Appointment</h2>
                        <p className="text-red-600 text-sm font-medium">{errorMessage}</p>
                    </div>
                </div>
            ) : successData ? (
                <div className="max-w-lg mx-auto bg-white p-8 rounded-xl border border-gray-200 shadow-lg text-center space-y-6 mt-8">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto border border-green-200 shadow-sm">
                        <CustomIcons iconName="fa-solid fa-circle-check" css="text-green-500 text-3xl" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                            Meeting updated successfully!
                        </h2>
                        <p className="text-gray-600 text-sm font-medium">
                            Your appointment has been rescheduled and updated on your calendar.
                        </p>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-5 text-left space-y-3 mt-4 bg-gray-50 text-black">
                        <div className="font-bold text-gray-900 text-base border-b border-gray-200 pb-2">
                            {successData.title || "Meeting"}
                        </div>

                        {successData.start && (
                            <div className="flex items-center gap-2.5 text-sm text-gray-800 font-semibold bg-white p-2.5 rounded border border-gray-200">
                                <CustomIcons iconName="fa-regular fa-calendar-check" css="text-green-600 text-base" />
                                <span>
                                    {dayjs(successData.start, "MM/DD/YYYY HH:mm:ss").isValid()
                                        ? `${dayjs(successData.start, "MM/DD/YYYY HH:mm:ss").format("hh:mm A")} - ${dayjs(successData.end, "MM/DD/YYYY HH:mm:ss").format("hh:mm A, MM/DD/YYYY")}`
                                        : `${successData.start} - ${successData.end}`}
                                </span>
                            </div>
                        )}

                        {successData.calTimeZone && (
                            <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                <CustomIcons iconName="fa-solid fa-globe" css="text-gray-500 text-sm" />
                                <span>{successData.calTimeZone}</span>
                            </div>
                        )}

                        {successData.customerName && (
                            <div className="border-t border-gray-200 pt-3 space-y-1 text-xs text-gray-700">
                                <p><strong>Host:</strong> {successData.customerName}</p>
                                {successData.description && (
                                    <p><strong>Notes:</strong> {successData.description}</p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="pt-2">
                        <p className="text-gray-500 text-xs font-medium">
                            Your local calendar and connected Google/Outlook calendars have been updated. Updated calendar invitations have been sent to all attendees.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-2xl mx-auto">
                    {/* Stepper matching Image 2
                    <div className="my-6 flex justify-center">
                        <Stapper steps={steps} activeStep={3} orientation="horizontal" width={600} />
                    </div> */}
                    <div className='text-center mb-6'>
                        <p className='text-2xl font-medium text-black'>
                            Meeting Rescheduling with {appointmentData?.customerName} for {appointmentData?.title}
                        </p>
                        <p className='mt-3'>
                            Current time slot :
                            <span className='mt-1 ml-2 font-semibold text-black'>
                                {dayjs(appointmentData?.start, ["MM/DD/YYYY HH:mm:ss", "YYYY-MM-DD HH:mm:ss"]).isValid()
                                    ? dayjs(appointmentData?.start, ["MM/DD/YYYY HH:mm:ss", "YYYY-MM-DD HH:mm:ss"]).format("hh:mm A")
                                    : (formatSlotTime(appointmentData?.start) || appointmentData?.start)}
                            </span>
                        </p>
                    </div>
                    {/* Duration Header */}
                    <div className="flex items-center justify-center gap-3 text-black text-2xl font-semibold mb-6">
                        <CustomIcons iconName="fa-regular fa-clock" css="text-black text-2xl" />
                        <span>
                            {formatDuration(appointmentData?.durationHours, appointmentData?.durationMinutes)}
                        </span>
                    </div>

                    {/* Calendar & Slots Column */}
                    <div className="flex flex-col md:flex-row justify-center items-start gap-8 w-full mb-6">
                        {/* Calendar Column */}
                        <div className="flex-1 flex justify-center bg-white p-2 rounded-lg border border-gray-100 shadow-sm w-full md:w-auto">
                            <ThemeProvider theme={customTheme}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DateCalendar
                                        value={selectedDate}
                                        onChange={(newDate) => setSelectedDate(newDate)}
                                        views={['day']}
                                        minDate={dayjs()}
                                    />
                                </LocalizationProvider>
                            </ThemeProvider>
                        </div>

                        {/* Slots Column */}
                        <div className="w-full md:w-56 flex flex-col items-center md:items-start">
                            <div className="flex items-center justify-between w-full mb-3">
                                <p className="text-gray-900 font-semibold text-lg">
                                    {selectedDate.format("MM/DD/YYYY")}
                                </p>
                                {selectedSlot && (
                                    <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                        1 selected
                                    </span>
                                )}
                            </div>

                            {slotsLoading ? (
                                <p className="text-gray-500 text-sm py-4">Loading slots...</p>
                            ) : slots?.length > 0 ? (
                                <div className="flex flex-col gap-3 w-full max-h-72 overflow-y-auto pr-1">
                                    {slots.map((slot) => {
                                        const dateStr = selectedDate.format("MM/DD/YYYY");
                                        const slotStartVal = `${dateStr} ${slot}`;
                                        const isSelected = selectedSlot?.start === slotStartVal;

                                        return (
                                            <button
                                                key={slot}
                                                type="button"
                                                onClick={() => handleSelectSlot(slot)}
                                                className={`w-full py-2.5 px-4 text-center text-sm font-semibold rounded-md border-2 transition-all duration-150 flex items-center justify-between ${isSelected
                                                    ? "border-amber-500 bg-amber-50/50 text-black font-bold shadow-sm ring-1 ring-amber-500"
                                                    : "border-gray-300 text-black hover:border-gray-400 bg-white"
                                                    }`}
                                            >
                                                <span>{formatSlotTime(slot)}</span>
                                                {isSelected && (
                                                    <CustomIcons iconName="fa-solid fa-check" css="text-amber-600 text-sm" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm py-4 text-center md:text-left">No slots available</p>
                            )}
                        </div>
                    </div>

                    {/* Timezone Selector matching Image 2 */}
                    <div className="max-w-md mx-auto mb-8 space-y-2">
                        <label className="block text-sm font-semibold text-gray-800">
                            Select Timezone
                        </label>
                        <div className="flex items-center gap-3">
                            <CustomIcons iconName="fa-solid fa-globe" css="text-gray-600 text-xl" />
                            <div className="flex-1">
                                <Select
                                    label=""
                                    options={timeZoneList}
                                    value={selectedTimeZoneId}
                                    onChange={(e) => setSelectedTimeZoneId(e.target.value)}
                                    placeholder="Select Timezone"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit and Cancel Buttons */}
                    <div className="flex items-center justify-center gap-4">
                        <Button
                            type="button"
                            text="Cancel"
                            className="w-32 py-2.5 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-medium rounded-lg"
                            onClick={() => window.close()}
                        />
                        <Button
                            type="button"
                            text={submitting ? "Updating..." : "Submit"}
                            disabled={!selectedSlot || submitting}
                            className={`w-32 py-2.5 font-bold rounded-lg ${selectedSlot && !submitting
                                ? "bg-purple-700 hover:bg-purple-800 text-white shadow-md"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                            onClick={handleSubmitReschedule}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditAppointment;
