import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import CustomIcons from '../../../../components/common/icons/CustomIcons';
import { setAcceptOrRejectAppointment } from '../../../../service/calendar/calendarAppointment/calendarAppointmentService';
import dayjs from 'dayjs';

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

const decodeSlotIndexSafe = (encoded) => {
    if (!encoded) return 0;
    try {
        const decoded = atob(encoded.replace(/-/g, '+').replace(/_/g, '/'));
        const parsed = parseInt(decoded, 10);
        return isNaN(parsed) ? 0 : parsed;
    } catch (e) {
        const parsed = parseInt(encoded, 10);
        return isNaN(parsed) ? 0 : parsed;
    }
};

const SetAppointment = () => {
    const [searchParams] = useSearchParams();
    const v = searchParams.get('v') || '';
    const status = searchParams.get('status') || '';
    const timeSlotId = searchParams.get('timeSlotId') || '';
    const reqData = searchParams.get('req') || '';

    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [appointmentData, setAppointmentData] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const hasProcessedRef = useRef(false);

    useEffect(() => {
        const handleProcessAppointment = async () => {
            if (hasProcessedRef.current) return;
            hasProcessedRef.current = true;

            if (!v || !status) {
                setLoading(false);
                setErrorMessage('Invalid meeting request link parameters.');
                return;
            }

            const parsedReq = decodeBase64Safe(reqData);

            try {
                setLoading(true);
                const payload = {
                    v,
                    status,
                    timeSlotId,
                    req: reqData
                };

                const res = await setAcceptOrRejectAppointment(payload);
                if (res?.status === 200) {
                    setSuccess(true);
                    const dataFromApi = res?.result?.result || res?.result || res?.data || {};
                    const mergedData = { ...parsedReq, ...dataFromApi };

                    if ((!mergedData.start || !mergedData.end) && Array.isArray(parsedReq?.timeSlots)) {
                        const slotIdx = decodeSlotIndexSafe(timeSlotId);
                        const chosen = parsedReq.timeSlots[slotIdx] || parsedReq.timeSlots[0];
                        if (chosen) {
                            mergedData.start = chosen.start;
                            mergedData.end = chosen.end;
                        }
                    }

                    if (!mergedData.invitee && parsedReq?.title) {
                        mergedData.invitee = parsedReq.title;
                    }

                    if (!mergedData.calTimeZone && parsedReq?.calTimeZone) {
                        mergedData.calTimeZone = parsedReq.calTimeZone;
                    }

                    if (!mergedData.description && parsedReq?.description) {
                        mergedData.description = parsedReq.description;
                    }

                    setAppointmentData(mergedData);
                } else {
                    setErrorMessage(res?.message || 'Failed to update meeting status.');
                }
            } catch (error) {
                console.error('Error processing appointment request:', error);
                setErrorMessage(error?.response?.data?.message || error?.message || 'An unexpected error occurred.');
            } finally {
                setLoading(false);
            }
        };

        handleProcessAppointment();
    }, [v, status, timeSlotId, reqData]);

    const isAccept = status?.toLowerCase() === 'accept';

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-lg mx-auto">
                <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-lg text-center space-y-6">
                    {loading ? (
                        <div className="py-12 space-y-4">
                            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="text-gray-600 font-medium">Processing your meeting request...</p>
                        </div>
                    ) : errorMessage ? (
                        <div className="space-y-6">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto border border-red-200 shadow-sm">
                                <CustomIcons iconName="fa-solid fa-circle-exclamation" css="text-red-500 text-3xl" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-gray-900">Request Error</h2>
                                <p className="text-red-600 text-sm font-medium">{errorMessage}</p>
                            </div>
                        </div>
                    ) : success && isAccept ? (
                        <div className="space-y-6">
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto border border-green-200 shadow-sm">
                                <CustomIcons iconName="fa-solid fa-circle-check" css="text-green-500 text-3xl" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                                    Meeting accepted successfully!
                                </h2>
                                <p className="text-gray-600 text-sm font-medium">
                                    The meeting has been confirmed and scheduled on your calendar.
                                </p>
                            </div>

                            {appointmentData && (
                                <div className="border border-gray-200 rounded-lg p-5 text-left space-y-3 mt-4 bg-gray-50 text-black">
                                    <div className="font-bold text-gray-900 text-base border-b border-gray-200 pb-2">
                                        {appointmentData.title ? `Meeting with ${appointmentData.title}` : (appointmentData.eventType || 'Meeting')}
                                    </div>

                                    {appointmentData.start && (
                                        <div className="flex items-center gap-2.5 text-sm text-gray-800 font-semibold bg-white p-2.5 rounded border border-gray-200">
                                            <CustomIcons iconName="fa-regular fa-calendar-check" css="text-green-600 text-base" />
                                            <span>
                                                {dayjs(appointmentData.start, "MM/DD/YYYY HH:mm:ss").isValid()
                                                    ? `${dayjs(appointmentData.start, "MM/DD/YYYY HH:mm:ss").format("hh:mm A")} - ${dayjs(appointmentData.end, "MM/DD/YYYY HH:mm:ss").format("hh:mm A, MM/DD/YYYY")}`
                                                    : `${appointmentData.start} - ${appointmentData.end}`}
                                            </span>
                                        </div>
                                    )}

                                    {appointmentData.calTimeZone && (
                                        <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                            <CustomIcons iconName="fa-solid fa-globe" css="text-gray-500 text-sm" />
                                            <span>{appointmentData.calTimeZone}</span>
                                        </div>
                                    )}

                                    {appointmentData.invitee && (
                                        <div className="border-t border-gray-200 pt-3 space-y-1 text-xs text-gray-700">
                                            <p><strong>Invitee:</strong> {appointmentData.invitee} {appointmentData.inviteeEmail ? `(${appointmentData.inviteeEmail})` : ''}</p>
                                            {appointmentData.description && (
                                                <p><strong>Notes:</strong> {appointmentData.description}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="pt-2">
                                <p className="text-gray-500 text-xs font-medium">
                                    Calendar invitation and confirmation emails have been sent to all attendees.
                                </p>
                            </div>
                        </div>
                    ) : success && !isAccept ? (
                        <div className="space-y-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto border border-red-300 shadow-sm">
                                <CustomIcons iconName="fa-solid fa-circle-xmark" css="text-red-500 text-3xl" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                                    Meeting rejected successfully!
                                </h2>
                                <p className="text-gray-600 text-sm font-medium">
                                    This appointment request has been declined. No event has been added to your calendar.
                                </p>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default SetAppointment;
