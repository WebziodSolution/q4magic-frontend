import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { decryptUserId } from '../../../../utils/getUserDetails';
import { getTimeZones } from '../../../../service/timeZones/timeZoneService';
import Stapper from '../../../../components/common/stapper/stapper';
import Input from '../../../../components/common/input/input';
import Components from '../../../../components/muiComponents/components';
import { Controller, useForm } from 'react-hook-form';
import Button from '../../../../components/common/buttons/button';
import { getAllTeams } from '../../../../service/teamDetails/teamDetailsService';
import Select from '../../../../components/common/select/select';
import { getAllTeamMembers } from '../../../../service/teamMembers/teamMembersService';
import CustomIcons from '../../../../components/common/icons/CustomIcons';
import { getAllEventTypeList } from '../../../../service/calendar/calendarAppointmentEventType/calendarAppointmentEventTypeService';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { userTimeZone } from '../../../../service/common/commonService';
import { createTheme, ThemeProvider, useTheme } from '@mui/material';
import { freeSlotList, saveAppointment } from '../../../../service/calendar/calendarAppointment/calendarAppointmentService';
import { connect } from 'react-redux';
import { setAlert } from '../../../../redux/commonReducers/commonReducers';
// eslint-disable-next-line no-unused-vars
import { saveEvents } from '../../../../service/calendar/calendarService';
const formatDuration = (hours, minutes) => {
    if (hours && minutes) {
        const pad = (num) => String(num).padStart(2, '0');
        return `${pad(hours)}:${pad(minutes)} Hour`;
    }
    if (hours) {
        return `${hours} Hour${hours > 1 ? 's' : ''}`;
    }
    if (minutes) {
        return `${minutes} Min`;
    }
    return '';
};

const steps = ["", "", "", "", "", ""];

const Appointment = ({ setAlert }) => {
    const theme = useTheme();
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
    const [searchParams] = useSearchParams();
    const encryptedVal = searchParams.get('v');
    const decryptedUserId = decryptUserId(encryptedVal);

    const [activeStep, setActiveStep] = useState(0);
    const [timeZoneList, setTimeZoneList] = useState([])
    const [teams, setTeams] = useState([])
    const [events, setEvents] = useState([])
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [teamEmails, setTeamEmails] = useState([]);
    const [guestEmails, setGuestEmails] = useState([]);
    const [emailInput, setEmailInput] = useState("");
    const [guestEmailsInitialized, setGuestEmailsInitialized] = useState(false);
    const inputRef = useRef(null);

    const {
        handleSubmit,
        control,
        watch,
        setValue,
        register,
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: "",
            email: "",
            teamId: "",
            selectedMembers: [],
            memTimeZone: userTimeZone || "",
            slotTimeMinus: "",
            currentDateYN: "",
            start: "",
            end: "",
            description: "",
            calAetId: ""
        },
    });

    const selectedEvent = events?.find(e => e.id === watch("calAetId"));

    const [slots, setSlots] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [lastDateTz, setLastDateTz] = useState({ date: "", tz: "" });

    const formatSlotTime = (timeStr) => {
        if (!timeStr) return "";
        const [hourStr, minuteStr] = timeStr.split(":");
        const hour = parseInt(hourStr, 10);
        const ampm = hour >= 12 ? "PM" : "AM";
        const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
        const paddedHour = String(formattedHour).padStart(2, '0');
        return `${paddedHour}:${minuteStr} ${ampm}`;
    };

    const handleGetFreeSlots = async () => {
        const selectedTzId = watch("memTimeZone");
        if (selectedDate && selectedTzId && selectedEvent) {
            setSlotsLoading(true);
            try {
                const selectedTzObj = timeZoneList?.find(tz => tz.id === selectedTzId);
                const tzValue = selectedTzObj ? selectedTzObj.value : "";

                const isToday = selectedDate.isSame(dayjs(), 'day');
                const currentDateYNVal = isToday ? "Y" : "N";
                setValue("currentDateYN", currentDateYNVal);

                const payload = {
                    slotTimeMinus: (selectedEvent.durationHours * 60) + (selectedEvent.durationMinutes || 0),
                    slotDateTime: selectedDate.format("MM/DD/YYYY"),
                    slotUserId: String(decryptedUserId),
                    timeZone: tzValue,
                    currentDateYN: currentDateYNVal
                };

                const res = await freeSlotList(userTimeZone, payload);
                if (res?.status === 200) {
                    setSlots(res?.result?.freeSlotList || []);
                } else {
                    setSlots([]);
                }
            } catch (error) {
                console.error("Error fetching free slots:", error);
                setSlots([]);
            } finally {
                setSlotsLoading(false);
            }
        } else {
            setSlots([]);
        }
    };

    const handleSelectSlot = (slot) => {
        const dateStr = selectedDate.format("MM/DD/YYYY");
        const startDateTime = `${dateStr} ${slot}`;

        const durationMinutes = (selectedEvent.durationHours * 60) + (selectedEvent.durationMinutes || 0);
        const startDayjs = dayjs(`${dateStr} ${slot}`, "MM/DD/YYYY HH:mm:ss");
        const endDayjs = startDayjs.add(durationMinutes, 'minute');
        const endDateTime = endDayjs.format("MM/DD/YYYY HH:mm:ss");

        setValue("start", startDateTime, { shouldValidate: true });
        setValue("end", endDateTime, { shouldValidate: true });
    };

    const handleBack = () => {
        if (activeStep !== 0) {
            setActiveStep((prev) => prev - 1);
        }
    };
    const handleGetTimeZones = async () => {
        const res = await getTimeZones()
        if (res.status === 200) {
            const data = res?.result?.map((row) => {
                return {
                    id: row.tmzId,
                    title: row.tmzTitle,
                    value: row.tmzValue
                }
            })
            setTimeZoneList(data)
            const defaultTz = data?.find(row => row.value === userTimeZone);
            if (defaultTz) {
                setValue("memTimeZone", defaultTz.id);
            }
        }
    }

    const handleGetAllTeams = async () => {
        const res = await getAllTeams(decryptedUserId);
        if (res.status === 200) {
            const formattedTeams = res.result?.reverse()?.map((row, index) => ({
                id: row.id,
                title: row.name,
            }));
            setTeams(formattedTeams);
        }
    }

    const handleGetAllTeamMembers = async () => {
        try {
            const res = await getAllTeamMembers(watch("teamId"))
            if (res?.status === 200 && Array.isArray(res?.result)) {
                const emails = res.result?.map(row => row?.email).filter(Boolean);
                setTeamEmails(emails);
                setValue("selectedMembers", emails);
            }
        } catch (error) {
            console.error("Error fetching team members:", error);
        }
    }

    const handleGetAllEventTypes = async () => {
        if (activeStep === 2) {
            const res = await getAllEventTypeList(decryptedUserId)
            if (res?.status === 200) {
                setEvents(res?.result)
            }
        }
    }

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleWrapperClick = () => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const trimmed = emailInput.trim().replace(/,/g, '');
            if (trimmed) {
                if (validateEmail(trimmed)) {
                    if (!guestEmails.includes(trimmed)) {
                        setGuestEmails([...guestEmails, trimmed]);
                    }
                    setEmailInput('');
                } else {
                    setAlert({
                        open: true,
                        type: 'error',
                        message: 'Please enter a valid email address.',
                    });
                }
            }
        }
    };

    const handleRemoveGuestEmail = (indexToRemove) => {
        setGuestEmails(guestEmails.filter((_, index) => index !== indexToRemove));
    };

    const onSubmit = async (data) => {
        if (activeStep === 4) {
            try {
                const selectedTzId = watch("memTimeZone");
                const selectedTzObj = timeZoneList?.find(tz => tz.id === selectedTzId);
                const tzValue = selectedTzObj ? selectedTzObj.value : "";

                const payload = {
                    calAetId: watch("calAetId"),
                    title: watch("name"),
                    description: watch("description") || "",
                    start: watch("start"),
                    end: watch("end"),
                    calTimeZone: tzValue,
                    calAttendees: JSON.stringify({ attendees: [...guestEmails, watch("email")] }),
                    customerId: decryptedUserId,
                    slotTimeMinus: (selectedEvent.durationHours * 60) + (selectedEvent.durationMinutes || 0),
                    contactList: [],
                    currentDateYN: watch("currentDateYN"),
                    memTimeZone: tzValue
                };
                const res = await saveAppointment(payload);
                if (res.status === 200) {
                    setAlert({ open: true, message: res?.message || "Meeting scheduled successfully!", type: 'success' });
                    setActiveStep((prev) => prev + 1);
                } else {
                    setAlert({ open: true, message: res?.message || "Failed to schedule meeting.", type: 'error' });
                }
            } catch (error) {
                console.error("Error scheduling meeting:", error);
                setAlert({ open: true, message: error?.message || "An error occurred.", type: 'error' });
            }
        } else {
            setActiveStep((prev) => prev + 1);
        }
    }

    useEffect(() => {
        handleGetTimeZones()
        handleGetAllTeams()
    }, [])

    useEffect(() => {
        if (watch("teamId")) {
            handleGetAllTeamMembers()
        } else {
            setTeamEmails([]);
            setValue("selectedMembers", []);
        }
    }, [watch("teamId")])

    useEffect(() => {
        handleGetAllEventTypes()
    }, [activeStep])

    useEffect(() => {
        if (activeStep === 3) {
            const dateStr = selectedDate?.format("MM/DD/YYYY") || "";
            const tzId = watch("memTimeZone");

            if (lastDateTz.date !== dateStr || lastDateTz.tz !== tzId) {
                setValue("start", "");
                setValue("end", "");
                setLastDateTz({ date: dateStr, tz: tzId });
            }
            handleGetFreeSlots();
        }
    }, [selectedDate, watch("memTimeZone"), activeStep]);

    useEffect(() => {
        if (activeStep === 4 && !guestEmailsInitialized) {
            const initialEmails = [...teamEmails];
            setGuestEmails(initialEmails);
            setGuestEmailsInitialized(true);
        } else if (activeStep !== 4) {
            setGuestEmailsInitialized(false);
        }
    }, [activeStep, teamEmails, guestEmailsInitialized]);

    return (
        <div className="min-h-screen flex-row items-start justify-center bg-gray-50 p-4">
            <div className='text-center'>
                <p className='text-3xl font-medium text-black'>
                    Welcome to 360Pipe's Meeting Scheduling.
                </p>
                <p className="text-sm font-medium text-gray-700 mt-1">
                    Please select meeting type and follow the instruction to add meeting to my calendar.
                </p>
            </div>

            <div className={`w-full mx-auto transition-all duration-300 ${activeStep === 4 ? 'max-w-4xl' : 'max-w-xl'}`}>
                <div className="my-8 flex justify-center">
                    <Stapper steps={steps} activeStep={activeStep} orientation="horizontal" width={700} />
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    {
                        activeStep === 0 && (
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <Controller
                                        name="name"
                                        control={control}
                                        rules={{
                                            required: "Name is required",
                                        }}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                label="Name"
                                                type="text"
                                                error={errors?.name}
                                                onChange={(e) => {
                                                    field.onChange(e.target.value);
                                                }}
                                            />
                                        )}
                                    />
                                </div>

                                <div>
                                    <Controller
                                        name="email"
                                        control={control}
                                        rules={{
                                            required: "Email is required",
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: "Invalid email address",
                                            },
                                        }}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                label="Email"
                                                type={`text`}
                                                error={errors?.email}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\s/g, "");
                                                    field.onChange(value);
                                                }}
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                        )
                    }
                    {
                        activeStep === 1 && (
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <Controller
                                        name="teamId"
                                        control={control}
                                        rules={{ required: "Team is required" }}
                                        render={({ field }) => (
                                            <Select
                                                options={teams}
                                                label="Select Team"
                                                value={field.value || null}
                                                onChange={(_, newValue) => field.onChange(newValue?.id || null)}
                                                error={errors?.teamId}
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                        )
                    }
                    {
                        activeStep === 2 && (
                            <div className="grid grid-cols-1 gap-4">
                                <Controller
                                    name="calAetId"
                                    control={control}
                                    rules={{ required: "Meeting type is required" }}
                                    render={({ field }) => (
                                        <div className="grid grid-cols-1 gap-4">
                                            {events?.map((event, index) => {
                                                const isSelected = field.value === event.id;
                                                // Curated custom colors to match mockup styles (blue, yellow, etc.)
                                                const colorsList = [
                                                    { border: 'border-blue-500', ring: 'ring-blue-500', bg: 'bg-blue-50/10' },
                                                    { border: 'border-amber-500', ring: 'ring-amber-500', bg: 'bg-amber-50/10' },
                                                    { border: 'border-emerald-500', ring: 'ring-emerald-500', bg: 'bg-emerald-50/10' },
                                                    { border: 'border-purple-500', ring: 'ring-purple-500', bg: 'bg-purple-50/10' },
                                                ];
                                                const color = colorsList[index % colorsList.length];

                                                return (
                                                    <div
                                                        key={event.id}
                                                        onClick={() => field.onChange(event.id)}
                                                        className={`cursor-pointer border-2 rounded-lg p-5 bg-white ${isSelected
                                                            ? `ring-2 ${color.ring} ${color.bg} shadow-md ${color.border}`
                                                            : 'shadow-sm hover:border-yellow-400'
                                                            }`}
                                                    >
                                                        <div className="flex flex-col gap-3">
                                                            <div className="flex items-center gap-3">
                                                                <CustomIcons iconName="fa-regular fa-calendar-check" css="text-black text-xl" />
                                                                <span className="font-semibold text-lg text-black">{event.title}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <CustomIcons iconName="fa-regular fa-clock" css="text-black text-lg" />
                                                                <span className="text-gray-700 text-sm font-medium">
                                                                    {formatDuration(event.durationHours, event.durationMinutes)}
                                                                </span>
                                                            </div>
                                                            {event.description && (
                                                                <p className="text-gray-600 text-sm whitespace-pre-line mt-1">
                                                                    {event.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                />
                                {errors?.calAetId && (
                                    <p className="text-red-500 text-sm font-medium text-center mt-2">
                                        {errors.calAetId.message}
                                    </p>
                                )}
                            </div>
                        )
                    }
                    {
                        activeStep === 3 && (
                            <div className="grid grid-cols-1">
                                {selectedEvent && (
                                    <div className="flex items-center justify-center gap-3 text-black text-2xl font-semibold mb-2">
                                        <CustomIcons iconName="fa-regular fa-clock" css="text-black text-2xl" />
                                        <span>{formatDuration(selectedEvent.durationHours, selectedEvent.durationMinutes)}</span>
                                    </div>
                                )}

                                <div className="flex flex-col md:flex-row justify-center items-start gap-8 max-w-2xl w-full mx-auto mb-6">
                                    {/* Calendar Column */}
                                    <div className="flex-1 flex justify-center bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                                        <ThemeProvider theme={customTheme}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DateCalendar
                                                    value={selectedDate}
                                                    onChange={(newDate) => setSelectedDate(newDate)}
                                                    views={['day']}
                                                    minDate={dayjs()}
                                                    maxDate={dayjs().add(5, 'day')}
                                                />
                                            </LocalizationProvider>
                                        </ThemeProvider>
                                    </div>

                                    {/* Slots Column */}
                                    <div className="w-full md:w-48 flex flex-col items-center md:items-start">
                                        <p className="text-gray-900 font-semibold mb-4 text-lg">
                                            {selectedDate.format("MM/DD/YYYY")}
                                        </p>

                                        {slotsLoading ? (
                                            <p className="text-gray-500 text-sm py-4">Loading slots...</p>
                                        ) : slots?.length > 0 ? (
                                            <div className="flex flex-col gap-3 w-full">
                                                {slots.map((slot) => {
                                                    const dateStr = selectedDate.format("MM/DD/YYYY");
                                                    const slotStartVal = `${dateStr} ${slot}`;
                                                    const isSelected = watch("start") === slotStartVal;

                                                    return (
                                                        <button
                                                            key={slot}
                                                            type="button"
                                                            onClick={() => handleSelectSlot(slot)}
                                                            className={`w-full py-2.5 px-4 text-center text-sm font-semibold rounded-md border-2 transition-all duration-150 ${isSelected
                                                                ? "border-amber-500 text-black font-bold shadow-sm"
                                                                : "border-gray-300 text-black hover:border-gray-400 bg-white"
                                                                }`}
                                                        >
                                                            {formatSlotTime(slot)}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-sm py-4 text-center md:text-left">No slots available</p>
                                        )}

                                        <input type="hidden" {...register("start", { required: "Please select a time slot" })} />
                                        {errors?.start && (
                                            <p className="text-red-500 text-xs font-semibold mt-2 text-center md:text-left">
                                                {errors.start.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-6 max-w-md w-full mx-auto">
                                    <p className="mb-2 text-black text-left text-sm font-medium">Select Timezone</p>
                                    <div className="flex items-center gap-3">
                                        <CustomIcons iconName="fa-solid fa-globe" css="text-gray-700 text-xl" />
                                        <div className="flex-1">
                                            <Controller
                                                name="memTimeZone"
                                                control={control}
                                                rules={{ required: "Timezone is required" }}
                                                render={({ field }) => (
                                                    <Select
                                                        options={timeZoneList}
                                                        value={field.value || null}
                                                        onChange={(_, newValue) => field.onChange(newValue?.id || null)}
                                                        error={errors?.memTimeZone}
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                    {
                        activeStep === 4 && (
                            <div className="flex flex-col md:flex-row gap-8 md:divide-x divide-gray-200 bg-white p-6 rounded-lg border border-gray-200 shadow-sm text-left">
                                {/* Left Column: Event Summary */}
                                <div className="flex-1 md:pr-8 space-y-4 text-black">
                                    {selectedEvent && (
                                        <>
                                            <h2 className="text-3xl font-bold text-gray-900 leading-tight">
                                                {selectedEvent.title}
                                            </h2>
                                            <div className="flex items-center gap-3 text-gray-700 font-semibold text-base">
                                                <CustomIcons iconName="fa-regular fa-clock" css="text-gray-600 text-lg" />
                                                <span>{formatDuration(selectedEvent.durationHours, selectedEvent.durationMinutes)}</span>
                                            </div>
                                            {watch("start") && (
                                                <div className="flex items-center gap-3 text-gray-700 font-semibold text-base">
                                                    <CustomIcons iconName="fa-regular fa-calendar-check" css="text-gray-600 text-lg" />
                                                    <span>
                                                        {dayjs(watch("start"), "MM/DD/YYYY HH:mm:ss").format("hh:mm A")} - {dayjs(watch("end"), "MM/DD/YYYY HH:mm:ss").format("hh:mm A, MM/DD/YYYY")}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-3 text-gray-700 font-semibold text-base">
                                                <CustomIcons iconName="fa-solid fa-globe" css="text-gray-600 text-lg" />
                                                <span>
                                                    {timeZoneList?.find(tz => tz.id === watch("memTimeZone"))?.title || watch("memTimeZone")}
                                                </span>
                                            </div>
                                            {selectedEvent.description && (
                                                <p className="text-gray-650 text-sm mt-4 leading-relaxed border-t border-gray-150 pt-4 font-medium">
                                                    {selectedEvent.description}
                                                </p>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Right Column: Enter Details */}
                                <div className="flex-1 md:pl-8 space-y-6">
                                    <h2 className="text-2xl font-bold text-gray-950 text-center md:text-left">
                                        Enter Details
                                    </h2>

                                    {/* Guest Email(s) */}
                                    <div className="flex flex-col gap-1.5 w-full text-left">
                                        <span className="text-xs text-gray-500 font-medium">Guest Email(s)</span>
                                        <div
                                            onClick={handleWrapperClick}
                                            className="flex flex-wrap gap-2 items-center border-b border-gray-300 pb-2 cursor-text min-h-[40px] w-full"
                                        >
                                            {guestEmails.map((email, index) => (
                                                <Components.Chip
                                                    key={email}
                                                    label={email}
                                                    onDelete={() => handleRemoveGuestEmail(index)}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: '#f1f1f1',
                                                        color: '#333333',
                                                        fontSize: '0.8125rem',
                                                        '& .MuiChip-deleteIcon': {
                                                            color: '#888888',
                                                            '&:hover': {
                                                                color: '#555555',
                                                            },
                                                        },
                                                    }}
                                                />
                                            ))}
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                value={emailInput}
                                                onChange={(e) => setEmailInput(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                placeholder={guestEmails.length === 0 ? "Type email and press Enter..." : ""}
                                                className="flex-grow min-w-[150px] border-none outline-none text-sm text-gray-800 bg-transparent py-0.5"
                                            />
                                        </div>
                                    </div>

                                    {/* Description Notes */}
                                    <div className="space-y-2">
                                        <Controller
                                            name="description"
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    label="Please share anything that will help prepare for our meeting."
                                                    multiline={true}
                                                    rows={4}
                                                    placeholder="Add any details or notes here..."
                                                />
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        )
                    }
                    {
                        activeStep === 5 && (
                            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-md text-center max-w-md mx-auto my-6 space-y-6">
                                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto border border-green-150">
                                    <CustomIcons iconName="fa-solid fa-circle-check" css="text-green-500 text-3xl" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-extrabold text-gray-900">Meeting Scheduled!</h2>
                                    <p className="text-gray-600 text-sm font-medium">
                                        Great! Your meeting has been booked with 360Pipe
                                    </p>
                                </div>

                                {selectedEvent && (
                                    <div className=" border border-gray-150 rounded-lg p-5 text-left space-y-3 mt-4 text-black">
                                        <div className="font-bold text-gray-850 text-base">{selectedEvent.title}</div>
                                        {watch("start") && (
                                            <div className="flex items-center gap-2 text-sm text-gray-750 font-semibold">
                                                <CustomIcons iconName="fa-regular fa-calendar-check" css="text-gray-600 text-sm" />
                                                <span>
                                                    {dayjs(watch("start"), "MM/DD/YYYY HH:mm:ss").format("hh:mm A")} - {dayjs(watch("end"), "MM/DD/YYYY HH:mm:ss").format("hh:mm A, MM/DD/YYYY")}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-sm text-gray-750 font-semibold">
                                            <CustomIcons iconName="fa-solid fa-globe" css="text-gray-600 text-sm" />
                                            <span>
                                                {timeZoneList?.find(tz => tz.id === watch("memTimeZone"))?.title || watch("memTimeZone")}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <p className="text-gray-600 text-sm font-medium">
                                        Meeting schedule event has been sent to your email address.
                                    </p>
                                </div>

                            </div>
                        )
                    }
                    {
                        activeStep < 5 && (
                            <div className="mt-6">
                                <div className="flex justify-center items-center gap-3">
                                    {
                                        activeStep !== 0 && (
                                            <div>
                                                <Button type="button" onClick={() => handleBack()} text={"Back"} />
                                            </div>
                                        )
                                    }

                                    <div>
                                        <Button type="submit" startIcon={activeStep === 4 ? <CustomIcons iconName="fa-regular fa-calendar-check" css="text-gray-600 text-sm" /> : null} text={activeStep === 4 ? "SCHEDULE MEETING" : "Next"} />
                                    </div>
                                </div>
                            </div>
                        )
                    }
                </form>
            </div>
        </div>
    );
};

export default connect(null, { setAlert })(Appointment);


// {
//     "calAetId": 11,
//     "title": "Jay Patel",
//     "description": "360pipe meeting",
//     "start": "07/16/2026 10:00:00",
//     "end": "07/16/2026 11:15:00",
//     "calTimeZone": "Asia/Calcutta",
//     "calAttendees": "{\"attendees\":[\"jay@ematrixinfotech.com\"]}",
//     "slotMember": "JWf2",
//     "slotTimeMinus": 75,
//     "contactList": [],
//     "currentDateYN": "N",
//     "memTimeZone": "Asia/Calcutta"
// }

// {
//     "calAetId": 1,
//     "title": "Jay Patel",
//     "description": "360pipe meeting",
//     "start": "07/16/2026 10:00:00",
//     "end": "07/16/2026 11:15:00",
//     "calTimeZone": "Asia/Calcutta",
//     "calAttendees": "{\"attendees\":[\"rajan@ematrixinfotech.com\"]}",
//     "slotMember": "MzYy",
//     "slotTimeMinus": 75,
//     "contactList": [],
//     "currentDateYN": "N",
//     "memTimeZone": "Asia/Calcutta"
// }

// {
//     "calAetId": 11,
//         "title": "Jay Patel",
//             "description": "",
//                 "start": "07/15/2026 12:30:00",
//                     "end": "07/15/2026 13:45:00",
//                         "calTimeZone": "Asia/Calcutta",
//                             "calAttendees": "{\"attendees\":[\"rajan@ematrixinfotech.com\",\"nishit@ematrixinfotech.com\",\"jay@ematrixinfotech.com\"]}",
//                                 "slotMember": "JWf2",
//                                     "slotTimeMinus": 75,
//                                         "contactList": [],
//                                             "currentDateYN": "N",
//                                                 "memTimeZone": "Asia/Calcutta"
// }