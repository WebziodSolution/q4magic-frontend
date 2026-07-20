import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { Radio, RadioGroup, FormControlLabel, FormControl, useTheme } from '@mui/material';
import Select from '../../../../components/common/select/select';
import SelectMultiple from '../../../../components/common/select/selectMultiple';
import Checkbox from '../../../../components/common/checkBox/checkbox';
import Input from '../../../../components/common/input/input';
import Button from '../../../../components/common/buttons/button';
import { getUserDetails } from '../../../../utils/getUserDetails';
import { getCustomer, saveDefaultCalendar, saveMailNotification, saveTimeZone, saveWebConference } from '../../../../service/customers/customersService';
import { getTimeZones } from '../../../../service/timeZones/timeZoneService';
import { userTimeZone } from '../../../../service/common/commonService';
import { setAlert } from '../../../../redux/commonReducers/commonReducers';

const CalendarGeneralSetting = () => {
    const dispatch = useDispatch();
    const theme = useTheme();

    // State Variables
    const [timeZoneList, setTimeZoneList] = useState([]);
    const [selectedTimeZone, setSelectedTimeZone] = useState(null);
    const [selectedNotifications, setSelectedNotifications] = useState([]);
    const [smsNotification, setSmsNotification] = useState(false);
    const [webConferenceLink, setWebConferenceLink] = useState("This is testing Web Conference Link\n\nThank u");
    const [defaultCalendar, setDefaultCalendar] = useState("outlook");

    // Dynamic Interval Generator for Notifications: 15 mins to 24 hours (1440 mins)
    const notificationOptions = useMemo(() => {
        const options = [];
        for (let minutes = 15; minutes <= 1440; minutes += 15) {
            let title = "";
            const hrs = Math.floor(minutes / 60);
            const mins = minutes % 60;

            if (hrs > 0) {
                title += `${hrs} Hour`;
            }
            if (mins > 0) {
                if (title) title += " ";
                title += `${mins} Minute`;
            }
            options.push({
                id: minutes,
                title: title,
            });
        }
        return options;
    }, []);

    // Load initial data: Timezone options list and the current customer's profile timezone
    useEffect(() => {
        const loadInitialData = async () => {
            let initialTzVal = userTimeZone;

            // 1. Fetch user's profile timezone if available
            const userData = getUserDetails();
            if (userData?.userId) {
                try {
                    const customerRes = await getCustomer(userData.userId);
                    if (customerRes?.data?.status === 200) {
                        const dbTz = customerRes?.data?.result?.timeZone;
                        const dbWebConferenceLink = customerRes?.data?.result?.webConferenceLink;
                        const emailNotification = customerRes?.data?.result?.emailNotification;
                        const defaultCalendar = customerRes?.data?.result?.defaultCalendar;

                        if (dbTz) {
                            initialTzVal = dbTz;
                        }
                        if (dbWebConferenceLink) {
                            setWebConferenceLink(dbWebConferenceLink);
                        }
                        if (emailNotification) {
                            setSelectedNotifications(emailNotification?.split(",").map(Number));
                        }
                        if (defaultCalendar) {
                            setDefaultCalendar(defaultCalendar);
                        }
                    }
                } catch (err) {
                    console.error("Error fetching customer timezone:", err);
                }
            }

            // 2. Fetch all timezone options
            try {
                const res = await getTimeZones();
                if (res.status === 200) {
                    const mappedList = res?.result?.map((row) => ({
                        id: row.tmzId,
                        title: row.tmzTitle,
                        value: row.tmzValue
                    })) || [];
                    setTimeZoneList(mappedList);

                    // Match resolved timezone value or title with the list items
                    const match = mappedList.find(row => row.value === initialTzVal || row.title === initialTzVal);
                    if (match) {
                        setSelectedTimeZone(match.id);
                    } else if (mappedList.length > 0) {
                        setSelectedTimeZone(mappedList[0].id);
                    }
                }
            } catch (error) {
                console.error("Error loading timezones:", error);
            }
        };
        loadInitialData();
    }, []);

    // Time Zone selection handler: Saves via customer service endpoint
    const handleTimeZoneChange = async (event, newValue) => {
        const valId = newValue?.id || null;
        const timezoneVal = newValue?.value || "";
        setSelectedTimeZone(valId);

        if (timezoneVal) {
            try {
                const res = await saveTimeZone(timezoneVal);
                if (res?.status === 200 || res?.error === "") {
                    dispatch(setAlert({
                        open: true,
                        type: "success",
                        message: res?.message || "Timezone updated successfully!"
                    }));
                } else {
                    dispatch(setAlert({
                        open: true,
                        type: "error",
                        message: res?.message || "Failed to update timezone."
                    }));
                }
            } catch (error) {
                console.error("Error saving timezone:", error);
                dispatch(setAlert({
                    open: true,
                    type: "error",
                    message: "An error occurred while saving timezone."
                }));
            }
        }
    };

    // Notification save handler: Logs structured payload and pops alert
    const handleSaveNotification = async () => {
        const emailNotification = selectedNotifications?.length > 0
            ? `${[...selectedNotifications].sort((a, b) => a - b).join(",")}`
            : "";
        const res = await saveMailNotification(emailNotification)
        if (res.status === 200) {
            dispatch(setAlert({
                open: true,
                type: "success",
                message: "Notification settings saved successfully"
            }));
        } else {
            dispatch(setAlert({
                open: true,
                type: "error",
                message: "Failed to save notification settings"
            }));
        }
    };

    // Web Conference Link save handler: Logs content and pops alert
    const handleSaveWebConference = async () => {
        const res = await saveWebConference(webConferenceLink)
        if (res.status === 200) {
            dispatch(setAlert({
                open: true,
                type: "success",
                message: "Web Conference Link saved successfully"
            }));
        }

    };

    // Default Calendar selection handler: Logs selection change
    const handleDefaultCalendarChange = async (e) => {
        const val = e.target.value;
        setDefaultCalendar(val);
        const res = await saveDefaultCalendar(val);
        if (res.status === 200) {
            dispatch(setAlert({
                open: true,
                type: "success",
                message: "Save Default Calendar Successfully"
            }));
        } else {
            dispatch(setAlert({
                open: true,
                type: "success",
                message: "Fail to save default calendar"
            }));
        }
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Time Zone Card */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between min-h-[180px]">
                    <div>
                        <div className="flex items-center justify-center mb-6">
                            <div className="flex-1 border-t border-gray-300"></div>
                            <span className="px-4 text-base font-bold text-gray-800 tracking-wide uppercase">Time Zone</span>
                            <div className="flex-1 border-t border-gray-300"></div>
                        </div>
                        <div className="mb-4">
                            <Select
                                label="Select Timezone"
                                placeholder="Select Timezone"
                                options={timeZoneList}
                                value={selectedTimeZone}
                                onChange={handleTimeZoneChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Notification Card */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between min-h-[180px]">
                    <div>
                        <div className="flex items-center justify-center mb-4">
                            <div className="flex-1 border-t border-gray-300"></div>
                            <span className="px-4 text-base font-bold text-gray-800 tracking-wide uppercase">Notification</span>
                            <div className="flex-1 border-t border-gray-300"></div>
                        </div>

                        <div className="flex items-end justify-between gap-4 mb-4">
                            <div className="flex-1 text-left">
                                <SelectMultiple
                                    label="Select Time"
                                    placeholder="Select Time"
                                    options={notificationOptions}
                                    value={selectedNotifications}
                                    onChange={(newValue) => setSelectedNotifications(newValue)}
                                />
                            </div>
                            <div>
                                <Button
                                    text="Save"
                                    onClick={handleSaveNotification}
                                    useFor="primary"
                                    sx={{ px: 3, py: 1 }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Web Conference Link Card */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between min-h-[180px]">
                    <div>
                        <div className="flex items-center justify-center mb-6">
                            <div className="flex-1 border-t border-gray-300"></div>
                            <span className="px-4 text-base font-bold text-gray-800 tracking-wide uppercase">Web Conference Link</span>
                            <div className="flex-1 border-t border-gray-300"></div>
                        </div>
                        <div className="mb-4 text-left">
                            <Input
                                label="Web Conference Link"
                                placeholder="Enter Web Conference Link"
                                multiline={true}
                                rows={3}
                                value={webConferenceLink}
                                onChange={(e) => setWebConferenceLink(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-start mt-2">
                            <Button
                                text="Save"
                                onClick={handleSaveWebConference}
                                useFor="primary"
                                sx={{ px: 3, py: 1 }}
                            />
                        </div>
                    </div>
                </div>

                {/* Default Calendar Card */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between min-h-[180px]">
                    <div>
                        <div className="flex items-center justify-center mb-6">
                            <div className="flex-1 border-t border-gray-300"></div>
                            <span className="px-4 text-base font-bold text-gray-800 tracking-wide uppercase">Default Calendar</span>
                            <div className="flex-1 border-t border-gray-300"></div>
                        </div>
                        <div className="text-left">
                            <p className="text-black text-sm font-medium mb-3">Select Default Calendar</p>
                            <FormControl component="fieldset" className="w-full">
                                <RadioGroup
                                    aria-label="default-calendar"
                                    name="defaultCalendar"
                                    value={defaultCalendar}
                                    onChange={handleDefaultCalendarChange}
                                    className="space-y-3"
                                >
                                    <FormControlLabel
                                        value="google"
                                        control={<Radio sx={{ color: theme.palette.secondary.main, '&.Mui-checked': { color: theme.palette.secondary.main } }} />}
                                        label={
                                            <div className="flex items-center gap-3">
                                                <img src="/images/googlecalendar.png" className="w-5 h-5 object-contain" alt="Google Calendar Logo" />
                                                <span className="text-sm font-medium text-gray-800">Google Calendar</span>
                                            </div>
                                        }
                                    />
                                    <FormControlLabel
                                        value="outlook"
                                        control={<Radio sx={{ color: theme.palette.secondary.main, '&.Mui-checked': { color: theme.palette.secondary.main } }} />}
                                        label={
                                            <div className="flex items-center gap-3">
                                                <img src="/images/outlookcalendar.png" className="w-5 h-5 object-contain" alt="Outlook Calendar Logo" />
                                                <span className="text-sm font-medium text-gray-800">Outlook Calendar</span>
                                            </div>
                                        }
                                    />
                                </RadioGroup>
                            </FormControl>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
};

export default CalendarGeneralSetting;