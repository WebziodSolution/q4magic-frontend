import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getTimeZones } from '../../../../service/timeZones/timeZoneService';
import CustomIcons from '../../../../components/common/icons/CustomIcons';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { userTimeZone } from '../../../../service/common/commonService';
import { createTheme, ThemeProvider, useTheme } from '@mui/material';
import { freeSlotList, setAcceptOrRejectAppointment } from '../../../../service/calendar/calendarAppointment/calendarAppointmentService';
import Select from '../../../../components/common/select/select';
import Button from '../../../../components/common/buttons/button';

const decodeBase64Safe = (encoded) => {
    if (!encoded) return null;
    try {
        const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
        const jsonStr = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonStr);
    } catch (e) {
        try {
            return JSON.parse(atob(encoded));
        } catch (e2) {
            return null;
        }
    }
};

const parseAttendees = (calAttendees) => {
    if (!calAttendees) return [];
    if (Array.isArray(calAttendees)) return calAttendees;
    if (typeof calAttendees === 'object' && Array.isArray(calAttendees.attendees)) {
        return calAttendees.attendees;
    }
    if (typeof calAttendees === 'string') {
        try {
            const parsed = JSON.parse(calAttendees);
            if (Array.isArray(parsed)) return parsed;
            if (parsed && Array.isArray(parsed.attendees)) return parsed.attendees;
        } catch (e) {
            return [];
        }
    }
    return [];
};

const formatDuration = (slotTimeMinus) => {
    const mins = Number(slotTimeMinus) || 60;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (hours > 0 && remainingMins > 0) {
        return `${hours} Hr ${remainingMins} Min`;
    }
    if (hours > 0) {
        return `${hours} Hour${hours > 1 ? 's' : ''}`;
    }
    return `${remainingMins} Min`;
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

const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "";
    const parsed = dayjs(dateStr, ["MM/DD/YYYY HH:mm:ss", "YYYY-MM-DD HH:mm:ss", "MM/DD/YYYY"]);
    return parsed.isValid() ? parsed.format("MMM DD, YYYY") : dateStr;
};

const SelectNewSlots = () => {
    const theme = useTheme();
    const [searchParams] = useSearchParams();
    const v = searchParams.get('v') || '';
    const reqData = searchParams.get('req') || '';

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
    const [attendeesList, setAttendeesList] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [successData, setSuccessData] = useState(null);

    const [timeZoneList, setTimeZoneList] = useState([]);
    const [selectedTimeZoneId, setSelectedTimeZoneId] = useState('');
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [slots, setSlots] = useState([]);

    // Initialize meeting details from decoded req
    useEffect(() => {
        const initData = async () => {
            if (!reqData) {
                setErrorMessage('Invalid meeting request link. Request data is missing.');
                setPageLoading(false);
                return;
            }

            const decoded = decodeBase64Safe(reqData);
            if (!decoded) {
                setErrorMessage('Unable to decode meeting request details. The link may be expired or corrupted.');
                setPageLoading(false);
                return;
            }

            try {
                setPageLoading(true);

                // Fetch timezones
                const tzRes = await getTimeZones();
                let tzOptions = [];
                if (tzRes?.status === 200 && Array.isArray(tzRes?.result)) {
                    tzOptions = tzRes.result.map((row) => ({
                        id: row.tmzId,
                        title: row.tmzTitle,
                        value: row.tmzValue,
                    }));
                    setTimeZoneList(tzOptions);
                }

                setAppointmentData(decoded);

                // Parse attendees
                const attList = parseAttendees(decoded.calAttendees);
                setAttendeesList(attList);

                // Initial timezone selection
                const meetingTz = decoded.calTimeZone || decoded.memTimeZone || userTimeZone;
                const matchedTz = tzOptions.find((t) => t.value === meetingTz || t.title === meetingTz) ||
                    tzOptions.find((t) => t.value === userTimeZone);
                if (matchedTz) {
                    setSelectedTimeZoneId(matchedTz.id);
                } else if (tzOptions.length > 0) {
                    setSelectedTimeZoneId(tzOptions[0].id);
                }

                // Initial date from first requested slot or today
                if (Array.isArray(decoded.timeSlots) && decoded.timeSlots.length > 0) {
                    const firstSlotStart = decoded.timeSlots[0].start;
                    const parsed = dayjs(firstSlotStart, ["MM/DD/YYYY HH:mm:ss", "YYYY-MM-DD HH:mm:ss", "MM/DD/YYYY"]);
                    if (parsed.isValid() && parsed.isAfter(dayjs().subtract(1, 'day'))) {
                        setSelectedDate(parsed);
                    }
                }
            } catch (err) {
                console.error("Error initializing appointment slot selector:", err);
                setErrorMessage('Failed to initialize meeting data.');
            } finally {
                setPageLoading(false);
            }
        };

        initData();
    }, [reqData, v]);

    // Fetch free slots whenever date, timezone, or appointmentData changes
    useEffect(() => {
        const fetchSlots = async () => {
            if (!appointmentData || !selectedTimeZoneId || !selectedDate) return;

            setSlotsLoading(true);
            try {
                const selectedTzObj = timeZoneList.find((t) => t.id === selectedTimeZoneId);
                const tzValue = selectedTzObj ? selectedTzObj.value : (appointmentData?.calTimeZone || userTimeZone);

                const isToday = selectedDate.isSame(dayjs(), 'day');
                const currentDateYNVal = isToday ? "Y" : "N";

                const payload = {
                    slotTimeMinus: appointmentData?.slotTimeMinus || 60,
                    slotDateTime: selectedDate.format("MM/DD/YYYY"),
                    slotUserId: String(appointmentData?.customerId || ""),
                    timeZone: tzValue,
                    currentDateYN: currentDateYNVal,
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
                date: dateStr,
            });
        }
    };

    const handleSubmitNewSlot = async () => {
        if (!selectedSlot) {
            alert("Please select a time slot.");
            return;
        }

        try {
            setSubmitting(true);
            const selectedTzObj = timeZoneList.find((t) => t.id === selectedTimeZoneId);
            const tzValue = selectedTzObj ? selectedTzObj.value : (appointmentData?.calTimeZone || userTimeZone);

            const payload = {
                v: v,
                req: reqData,
                status: "accept",
                start: selectedSlot.start,
                end: selectedSlot.end,
                timeZone: tzValue,
            };

            const res = await setAcceptOrRejectAppointment(payload);
            if (res?.status === 200 || (!res?.error && res?.result)) {
                setSuccessData({
                    ...appointmentData,
                    start: selectedSlot.start,
                    end: selectedSlot.end,
                    calTimeZone: tzValue,
                    attendees: attendeesList,
                });
            } else {
                alert(res?.message || res?.error || "Failed to schedule appointment.");
            }
        } catch (error) {
            console.error("Error setting appointment with new slot:", error);
            alert(error?.response?.data?.message || error?.message || "An error occurred while saving the meeting.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex-row items-start justify-center bg-gray-50 p-4">
            {pageLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="w-12 h-12 border-4 border-purple-700 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 font-medium">Loading meeting details...</p>
                </div>
            ) : errorMessage ? (
                <div className="max-w-md mx-auto bg-white p-8 rounded-xl border border-gray-200 shadow-md text-center space-y-6 mt-12">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto border border-red-200">
                        <CustomIcons iconName="fa-solid fa-circle-exclamation" css="text-red-500 text-3xl" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-gray-900">Unable to Load Request</h2>
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
                            Meeting Scheduled Successfully!
                        </h2>
                        <p className="text-gray-600 text-sm font-medium">
                            Your selected time slot has been confirmed and added to the calendar.
                        </p>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-5 text-left space-y-3 mt-4 bg-gray-50 text-black">
                        <div className="font-bold text-gray-900 text-base border-b border-gray-200 pb-2">
                            {successData.eventTitle || successData.title ? `Meeting with ${successData.title}` : "Meeting"}
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
                            <div className="flex items-center gap-2 text-xs text-gray-700">
                                <CustomIcons iconName="fa-solid fa-user-tie" css="text-gray-500 text-sm" />
                                <span><strong>Host:</strong> {successData.customerName}</span>
                            </div>
                        )}

                        {attendeesList.length > 0 && (
                            <div className="border-t border-gray-200 pt-3 space-y-2">
                                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                                    <CustomIcons iconName="fa-solid fa-users" css="text-purple-700 text-xs" />
                                    Attendee(s):
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {attendeesList.map((email, idx) => (
                                        <span
                                            key={idx}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-200 rounded-md text-xs font-medium text-gray-800"
                                        >
                                            <CustomIcons iconName="fa-regular fa-envelope" css="text-purple-600 text-xs" />
                                            {email}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {successData.description && (
                            <div className="border-t border-gray-200 pt-3 text-xs text-gray-700">
                                <p><strong>Notes:</strong> {successData.description}</p>
                            </div>
                        )}
                    </div>

                    <div className="pt-2">
                        <p className="text-gray-500 text-xs font-medium">
                            The meeting has been set on the calendar and invitations have been sent to all attendees.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <p className='text-2xl font-bold text-black'>
                            Select New Time Slot
                        </p>
                        {/* <p className="text-gray-600 mt-1 text-sm">
                            Choose an available time slot with{' '}
                            <span className="font-semibold text-gray-900">{appointmentData?.title || 'the invitee'}</span>
                        </p> */}
                    </div>

                    {/* Duration Header */}
                    <div className="flex items-center justify-center gap-2.5 text-gray-800 text-lg font-semibold mb-5 bg-white border border-gray-200 py-2 px-4 rounded-full max-w-fit mx-auto shadow-sm">
                        <CustomIcons iconName="fa-regular fa-clock" css="text-purple-700 text-lg" />
                        <span>Duration: {formatDuration(appointmentData?.slotTimeMinus)}</span>
                    </div>

                    {/* Attendee(s) Section */}
                    {attendeesList.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
                            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                                    <CustomIcons iconName="fa-solid fa-users" css="text-purple-700 text-sm" />
                                    Attendee(s) ({attendeesList.length})
                                </span>
                                {appointmentData?.customerName && (
                                    <span className="text-xs text-gray-500">
                                        Host: <strong className="text-gray-700">{appointmentData.customerName}</strong>
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {attendeesList.map((email, idx) => (
                                    <span
                                        key={idx}
                                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 border border-purple-200 rounded-full text-xs font-medium text-purple-900 shadow-xs"
                                    >
                                        <CustomIcons iconName="fa-regular fa-envelope" css="text-purple-600 text-xs" />
                                        {email}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Notes from Invitee if provided */}
                    {appointmentData?.description && (
                        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 mb-6 text-left shadow-xs">
                            <p className="text-xs font-semibold text-amber-800 mb-1 flex items-center gap-1.5">
                                <CustomIcons iconName="fa-regular fa-message" css="text-amber-700 text-xs" />
                                Notes from {appointmentData?.title || 'Invitee'}:
                            </p>
                            <p className="text-xs text-gray-700 leading-relaxed">{appointmentData.description}</p>
                        </div>
                    )}

                    {/* Previously Requested Slots Info */}
                    {Array.isArray(appointmentData?.timeSlots) && appointmentData.timeSlots.length > 0 && (
                        <div className="bg-gray-100 border border-gray-200 rounded-xl p-3.5 mb-6 text-left">
                            <p className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                                <CustomIcons iconName="fa-regular fa-calendar" css="text-gray-600 text-xs" />
                                Originally Requested Slots:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {appointmentData.timeSlots.map((ts, idx) => (
                                    <span key={idx} className="text-xs bg-white border border-gray-200 px-2.5 py-1 rounded text-gray-600">
                                        {formatDisplayDate(ts.start)} at {formatSlotTime(ts.start?.split(" ")[1])}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Calendar & Slots Selection */}
                    <div className="flex flex-col md:flex-row justify-center items-start gap-6 w-full mb-6">
                        {/* Calendar Column */}
                        <div className="flex-1 flex justify-center bg-white p-3 rounded-xl border border-gray-200 shadow-sm w-full md:w-auto">
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
                        <div className="w-full md:w-56 flex flex-col items-center md:items-start bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between w-full mb-3 pb-2 border-b border-gray-100">
                                <p className="text-gray-900 font-semibold text-base">
                                    {selectedDate.format("MM/DD/YYYY")}
                                </p>
                                {selectedSlot && (
                                    <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                                        1 selected
                                    </span>
                                )}
                            </div>

                            {slotsLoading ? (
                                <div className="py-8 text-center w-full">
                                    <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                    <p className="text-gray-500 text-xs">Loading available slots...</p>
                                </div>
                            ) : slots?.length > 0 ? (
                                <div className="flex flex-col gap-2.5 w-full max-h-72 overflow-y-auto pr-1">
                                    {slots.map((slot) => {
                                        const dateStr = selectedDate.format("MM/DD/YYYY");
                                        const slotStartVal = `${dateStr} ${slot}`;
                                        const isSelected = selectedSlot?.start === slotStartVal;

                                        return (
                                            <button
                                                key={slot}
                                                type="button"
                                                onClick={() => handleSelectSlot(slot)}
                                                className={`w-full py-2 px-3 text-center text-sm font-semibold rounded-lg border-2 transition-all duration-150 flex items-center justify-between ${isSelected
                                                    ? "border-purple-600 bg-purple-50 text-purple-900 font-bold shadow-sm ring-1 ring-purple-600"
                                                    : "border-gray-200 text-gray-800 hover:border-gray-300 hover:bg-gray-50 bg-white"
                                                    }`}
                                            >
                                                <span>{formatSlotTime(slot)}</span>
                                                {isSelected && (
                                                    <CustomIcons iconName="fa-solid fa-check" css="text-purple-700 text-sm" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-8 text-center w-full">
                                    <CustomIcons iconName="fa-regular fa-calendar-xmark" css="text-gray-400 text-2xl mb-1" />
                                    <p className="text-gray-500 text-xs">No slots available for this date</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Timezone Selector */}
                    <div className="max-w-md mx-auto mb-8 space-y-2">
                        <label className="block text-sm font-semibold text-gray-800 text-left">
                            Select Timezone
                        </label>
                        <div className="flex items-center gap-3">
                            <CustomIcons iconName="fa-solid fa-globe" css="text-purple-700 text-xl" />
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

                    {/* Actions */}
                    <div className="flex items-center justify-center gap-4">
                        <Button
                            type="button"
                            text="Cancel"
                            className="w-32 py-2.5 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-medium rounded-lg"
                            onClick={() => window.close()}
                        />
                        <Button
                            type="button"
                            text={submitting ? "Saving..." : "Save & Confirm"}
                            disabled={!selectedSlot || submitting}
                            className={`px-6 py-2.5 font-bold rounded-lg ${selectedSlot && !submitting
                                ? "bg-purple-700 hover:bg-purple-800 text-white shadow-md cursor-pointer"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                            onClick={handleSubmitNewSlot}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SelectNewSlots;
