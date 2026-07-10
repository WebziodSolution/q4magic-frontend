import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { setAlert, setLoading } from '../../../redux/commonReducers/commonReducers';
import {
    getCalendarAuthentication,
    handleConnectGoogle,
    oauth2CallbackGoogleCalendar,
    revokeGoogleCalendar
} from '../../../service/googleCalendar/googleCalendarService';
import {
    outlookCalendarOauth,
    revokeOutlookCalendar
} from '../../../service/outlookCalendar/outlookCalendarService';
import { outlookCalendarUrl } from '../../../config/config';
import AlertDialog from '../../../components/common/alertDialog/alertDialog';

// Custom toggle switch matching the mockup aesthetics (pill shape, soft/vibrant blue)
const CustomToggle = ({ checked, onChange, disabled }) => {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-[#9ec5f9]' : 'bg-[#e4e4e7]'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out mt-[2px] ml-[2px] ${checked ? 'bg-[#0075eb] translate-x-5' : 'bg-white translate-x-0'
                    }`}
            />
        </button>
    );
};

const ManageApps = ({ setAlert, setLoading }) => {
    const [calendarAuth, setCalendarAuth] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({
        open: false,
        title: '',
        message: '',
        type: '', // 'google' or 'outlook'
    });

    const fetchAuthStatus = async () => {
        try {
            const res = await getCalendarAuthentication();
            if (res.status === 200) {
                setCalendarAuth(res.result);
            }
        } catch (error) {
            console.error("Failed to fetch calendar authentication status:", error);
        }
    };

    useEffect(() => {
        document.title = "Manage Apps - 360Pipe";
        fetchAuthStatus();
    }, []);

    // BroadcastChannel support for OAuth popup messaging
    useEffect(() => {
        const ocChannel = new BroadcastChannel('outlook-calendar-oauth');
        const gcChannel = new BroadcastChannel('google-calendar-oauth');

        gcChannel.onmessage = (event) => {
            if (event.data?.type === 'google-calendar-oauth-redirect') {
                const { code, state } = event.data;
                if (code) {
                    setLoading(true);
                    oauth2CallbackGoogleCalendar(code, state).then(res => {
                        if (res.status === 200) {
                            setAlert({
                                open: true,
                                type: "success",
                                message: "Google Calendar connected successfully",
                            });
                            fetchAuthStatus();
                        } else {
                            setAlert({
                                open: true,
                                type: "error",
                                message: res.message || 'Failed to connect Google Calendar',
                            });
                        }
                        setLoading(false);
                    }).catch(() => setLoading(false));
                }
            }
        };

        ocChannel.onmessage = (event) => {
            if (event.data?.type === 'outlook-calendar-oauth-redirect') {
                if (event.data.query) {
                    setLoading(true);
                    outlookCalendarOauth(event.data.query).then(res => {
                        if (res.status === 200) {
                            setAlert({
                                open: true,
                                type: "success",
                                message: "Outlook Calendar connected successfully",
                            });
                            fetchAuthStatus();
                        } else {
                            setAlert({
                                open: true,
                                type: "error",
                                message: 'Failed to connect Outlook Calendar',
                            });
                        }
                        setLoading(false);
                    }).catch(() => setLoading(false));
                }
            }
        };

        return () => {
            ocChannel.close();
            gcChannel.close();
        };
    }, [setAlert, setLoading]);

    const openOauthPopup = (url, name) => {
        let x = window.innerWidth / 2 - 600 / 2;
        let y = window.innerHeight / 2 - 700 / 2;
        const popup = window.open(url, name, "width=600,height=700,left=" + x + ",top=" + y);
        if (!popup || popup.closed || typeof popup.closed === 'undefined') {
            setAlert({
                open: true,
                type: "error",
                message: "Popup blocked! Please allow popups for this site.",
            });
            return null;
        }
        return popup;
    };

    const handleGoogleConnect = async () => {
        try {
            setLoading(true);
            const res = await handleConnectGoogle();
            if (res?.status === 200) {
                const popup = openOauthPopup(res?.result?.url, "GoogleCalendarWindow");
                if (!popup) return;

                window.gcSuccess = function (code, state) {
                    setLoading(true);
                    oauth2CallbackGoogleCalendar(code, state).then(res => {
                        if (res.status === 200) {
                            // setAlert({
                            //     open: true,
                            //     type: "success",
                            //     message: "Google Calendar connected successfully",
                            // });
                            fetchAuthStatus();
                        } else {
                            setAlert({
                                open: true,
                                type: "error",
                                message: res.message || 'Failed to connect Google Calendar',
                            });
                        }
                        setLoading(false);
                    }).catch(() => setLoading(false));
                };

                window.gcError = function () {
                    setAlert({
                        open: true,
                        type: "error",
                        message: "Something went wrong with Google Calendar connection!!!",
                    });
                };
            } else {
                setAlert({
                    open: true,
                    message: res.message || 'Failed to generate Google authentication URL',
                    type: 'error',
                });
            }
        } catch (e) {
            setAlert({
                open: true,
                message: 'Failed to connect Google Calendar',
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleOutlookConnect = async () => {
        try {
            const url = outlookCalendarUrl + '/outlookCalendarSignIn';
            const popup = openOauthPopup(url, "OutlookCalendarWindow");
            if (!popup) return;

            window.ocSuccess = function (data) {
                setLoading(true);
                outlookCalendarOauth(data).then(res => {
                    if (res.status === 200) {
                        // setAlert({
                        //     open: true,
                        //     type: "success",
                        //     message: "Outlook Calendar connected successfully",
                        // });
                        fetchAuthStatus();
                    } else {
                        setAlert({
                            open: true,
                            type: "error",
                            message: res.message || 'Failed to connect Outlook Calendar',
                        });
                    }
                    setLoading(false);
                }).catch(() => setLoading(false));
            };

            window.ocError = function () {
                setAlert({
                    open: true,
                    type: "error",
                    message: "Something went wrong with Outlook Calendar connection!!!",
                });
            };
        } catch (e) {
            setAlert({
                open: true,
                type: "error",
                message: "Failed to connect Outlook Calendar",
            });
        }
    };

    const handleDisconnectGoogle = async () => {
        try {
            setLoading(true);
            const res = await revokeGoogleCalendar();
            if (res?.status === 200) {
                setAlert({
                    open: true,
                    type: "success",
                    message: "Google Calendar disconnected successfully",
                });
                fetchAuthStatus();
            } else {
                setAlert({
                    open: true,
                    type: "error",
                    message: res?.message || "Failed to disconnect Google Calendar",
                });
            }
        } catch (e) {
            setAlert({
                open: true,
                type: "error",
                message: "Failed to disconnect Google Calendar",
            });
        } finally {
            setLoading(false);
            closeConfirmDialog();
        }
    };

    const handleDisconnectOutlook = async () => {
        try {
            setLoading(true);
            const res = await revokeOutlookCalendar();
            if (res?.status === 200) {
                setAlert({
                    open: true,
                    type: "success",
                    message: "Outlook Calendar disconnected successfully",
                });
                fetchAuthStatus();
            } else {
                setAlert({
                    open: true,
                    type: "error",
                    message: res?.message || "Failed to disconnect Outlook Calendar",
                });
            }
        } catch (e) {
            setAlert({
                open: true,
                type: "error",
                message: "Failed to disconnect Outlook Calendar",
            });
        } finally {
            setLoading(false);
            closeConfirmDialog();
        }
    };

    const openConfirmDialog = (type) => {
        const isGoogle = type === 'google';
        setConfirmDialog({
            open: true,
            title: `Disconnect ${isGoogle ? 'Google' : 'Outlook'} Calendar`,
            message: `Are you sure you want to disconnect your ${isGoogle ? 'Google' : 'Outlook'} Calendar? This will stop event syncing.`,
            type,
        });
    };

    const closeConfirmDialog = () => {
        setConfirmDialog({
            open: false,
            title: '',
            message: '',
            type: '',
        });
    };

    const handleConfirmAction = () => {
        if (confirmDialog.type === 'google') {
            handleDisconnectGoogle();
        } else if (confirmDialog.type === 'outlook') {
            handleDisconnectOutlook();
        }
    };

    return (
        <div className="mx-auto py-8 px-4 border flex justify-center">
            <div className="w-96">
                {/* Calendar Card */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">

                    {/* Header Divider */}
                    <div className="relative flex items-center justify-center mb-6">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <span className="relative bg-white px-4 text-xl font-medium text-gray-800">
                            Calendar
                        </span>
                    </div>

                    {/* App Integration List */}
                    <div className="flex flex-col gap-5">

                        {/* Google Calendar Row */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <img
                                    src="/images/googlecalendar.png"
                                    alt="Google Calendar"
                                    className="w-10 h-10 object-contain rounded-md"
                                />
                                <span className="text-gray-800 font-medium text-base">
                                    Google Calendar
                                </span>
                            </div>
                            <CustomToggle
                                checked={!!calendarAuth?.googleCalendar}
                                onChange={() =>
                                    calendarAuth?.googleCalendar
                                        ? openConfirmDialog('google')
                                        : handleGoogleConnect()
                                }
                            />
                        </div>

                        {/* Outlook Calendar Row */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <img
                                    src="/images/outlookcalendar.png"
                                    alt="Outlook Calendar"
                                    className="w-10 h-10 object-contain rounded-md"
                                />
                                <span className="text-gray-800 font-medium text-base">
                                    Outlook Calendar
                                </span>
                            </div>
                            <CustomToggle
                                checked={!!calendarAuth?.outlookCalendar}
                                onChange={() =>
                                    calendarAuth?.outlookCalendar
                                        ? openConfirmDialog('outlook')
                                        : handleOutlookConnect()
                                }
                            />
                        </div>

                    </div>
                </div>
            </div>
            <AlertDialog
                open={confirmDialog.open}
                title={confirmDialog.title}
                message={confirmDialog.message}
                actionButtonText="Disconnect"
                handleAction={handleConfirmAction}
                handleClose={closeConfirmDialog}
            />
        </div>
    );
};

const mapDispatchToProps = {
    setAlert,
    setLoading,
};

export default connect(null, mapDispatchToProps)(ManageApps);