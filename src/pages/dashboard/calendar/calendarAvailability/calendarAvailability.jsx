import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getUserDetails } from '../../../../utils/getUserDetails';
import Select from '../../../../components/common/select/select';
import Checkbox from '../../../../components/common/checkBox/checkbox';
import Button from '../../../../components/common/buttons/button';
import { setAlert } from '../../../../redux/commonReducers/commonReducers';
import { getAvailabilitySlotsList, saveAvailabilitySlots } from '../../../../service/calendar/calendarAppointment/calendarAppointmentService';

const CalendarAvailability = () => {
    const dispatch = useDispatch();
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);

    const userDetails = getUserDetails();
    const cusId = userDetails?.userId;

    // Generate time options: 12:00 AM to 11:45 PM in 15-minute intervals
    const timeOptions = React.useMemo(() => {
        const options = [];
        for (let h = 0; h < 24; h++) {
            const period = h < 12 ? 'AM' : 'PM';
            let hour12 = h % 12;
            if (hour12 === 0) hour12 = 12;
            const hourStr12 = hour12 < 10 ? `0${hour12}` : `${hour12}`;
            const hourStr24 = h < 10 ? `0${h}` : `${h}`;

            for (let m = 0; m < 60; m += 15) {
                const minStr = m === 0 ? '00' : `${m}`;
                const time12 = `${hourStr12}:${minStr} ${period}`;
                const time24 = `${hourStr24}:${minStr}:00`;
                options.push({
                    id: time24,
                    title: time12,
                });
            }
        }
        return options;
    }, []);

    const dayOrder = {
        'Sunday': 0,
        'Monday': 1,
        'Tuesday': 2,
        'Wednesday': 3,
        'Thursday': 4,
        'Friday': 5,
        'Saturday': 6
    };

    const fetchAvailability = async () => {
        setLoading(true);
        try {
            const res = await getAvailabilitySlotsList(cusId);
            if (res?.status === 200 && Array.isArray(res?.result) && res?.result.length > 0) {
                const sorted = [...res.result].sort((a, b) => dayOrder[a.dayName] - dayOrder[b.dayName]);
                setSlots(sorted);
            } else {
                // Initialize defaults
                const defaultDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                const defaultSlots = defaultDays.map(dayName => ({
                    id: 0,
                    startTime: '10:00:00',
                    endTime: '17:00:00',
                    dayName: dayName,
                    cusId: cusId,
                    available: 'Y'
                }));
                setSlots(defaultSlots);
            }
        } catch (error) {
            console.error('Error fetching calendar availability:', error);
            dispatch(setAlert({
                open: true,
                message: 'Failed to fetch calendar availability.',
                type: 'error'
            }));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAvailability();
    }, [cusId]);

    const handleCheckboxChange = (index, isChecked) => {
        const updated = [...slots];
        updated[index] = {
            ...updated[index],
            available: isChecked ? 'Y' : 'N'
        };
        setSlots(updated);
    };

    const handleTimeChange = (index, field, value) => {
        const updated = [...slots];
        updated[index] = {
            ...updated[index],
            [field]: value || ''
        };
        setSlots(updated);
    };

    const handleSave = async () => {
        // Validate that startTime < endTime for active days
        const invalidDay = slots.find(slot => slot.available === 'Y' && slot.startTime >= slot.endTime);
        if (invalidDay) {
            dispatch(setAlert({
                open: true,
                message: `Start time must be before end time for ${invalidDay.dayName}.`,
                type: 'error'
            }));
            return;
        }

        setSaveLoading(true);
        try {
            // Ensure payload has the correct cusId mapped
            const payload = slots.map(slot => ({
                ...slot,
                cusId: cusId
            }));
            const res = await saveAvailabilitySlots(payload);
            if (res?.status === 200) {
                dispatch(setAlert({
                    open: true,
                    message: 'Availability slots saved successfully.',
                    type: 'success'
                }));
                fetchAvailability();
            } else {
                dispatch(setAlert({
                    open: true,
                    message: res?.message || 'Failed to save availability slots.',
                    type: 'error'
                }));
            }
        } catch (error) {
            console.error('Error saving availability slots:', error);
            dispatch(setAlert({
                open: true,
                message: 'Error saving availability slots.',
                type: 'error'
            }));
        } finally {
            setSaveLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-10">
                <span className="text-gray-500 font-medium">Loading availability settings...</span>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="flex flex-col gap-4 w-full">
                <div className="flex flex-col gap-4 w-full">
                    {slots.map((slot, index) => (
                        <div key={slot.dayName} className="flex flex-row items-end gap-4 md:gap-4 py-2 border-b border-gray-50 last:border-0 w-full">
                            {/* Checkbox */}
                            <div className="flex-shrink-0 pb-2">
                                <Checkbox
                                    checked={slot.available === 'Y'}
                                    onChange={(e) => handleCheckboxChange(index, e.target.checked)}
                                />
                            </div>

                            {/* Day Name */}
                            <div className="w-24 md:w-60 flex-shrink-0 pb-2">
                                <span className="font-semibold text-gray-700 text-[15px] select-none">
                                    {slot.dayName}
                                </span>
                            </div>

                            {/* Dropdowns */}
                            <div className="flex flex-1 items-center gap-4 md:gap-6">
                                <div className="flex-1">
                                    <Select
                                        options={timeOptions}
                                        label="Start Time"
                                        value={slot.startTime}
                                        disabled={slot.available !== 'Y'}
                                        onChange={(_, option) => handleTimeChange(index, 'startTime', option?.id)}
                                    />
                                </div>
                                <div className="flex-1">
                                    <Select
                                        options={timeOptions}
                                        label="End Time"
                                        value={slot.endTime}
                                        disabled={slot.available !== 'Y'}
                                        onChange={(_, option) => handleTimeChange(index, 'endTime', option?.id)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-center mt-6">
                    <Button
                        text="SAVE"
                        onClick={handleSave}
                        isLoading={saveLoading}
                        disabled={saveLoading}
                        useFor="primary"
                        sx={{ px: 5, py: 1.2, minWidth: '120px' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default CalendarAvailability;
