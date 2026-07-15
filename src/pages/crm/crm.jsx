import { connect } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import { setAlert, setLoading, setLoadingMessage, setSalesforceUserDetails, setSyncCount, setSyncingPullStatus, setSyncingPushStatus, setSyncStatus, setSalesforceTokens, clearSalesforceTokens } from '../../redux/commonReducers/commonReducers';

import SalesForceLogo from '../../assets/svgs/salesforce.svg';
import { connectToSalesforce, exchangeToken, getUserInfo } from '../../service/salesforce/connect/salesforceConnectService';
import AlertDialog from '../../components/common/alertDialog/alertDialog';
import { getSyncStatus, saveSyncStatus } from '../../service/syncStatus/syncStatusService';
import { fetchAndSetSalesforceTokens } from '../../utils/salesforceTokenHelper';
import { getUserDetails } from '../../utils/getUserDetails';
import { removeUserSalesForceToken } from '../../service/customers/customersService';

const UserInfoSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center max-w-sm w-full animate-pulse">
        <div className="w-24 h-24 rounded-full bg-gray-200 -mt-16 mb-4"></div>
        <div className="h-6 w-3/4 bg-gray-200 rounded-lg mb-2"></div>
        <div className="h-4 w-1/2 bg-gray-200 rounded-lg mb-4"></div>
        <div className="h-4 w-2/3 bg-gray-200 rounded-lg mb-4"></div>
        <div className="mt-6 w-full py-3 bg-gray-200 rounded-full"></div>
    </div>
);

const Crm = ({ loadingMessage, setLoadingMessage, setLoading, setAlert, loading, setSyncCount, setSyncingPushStatus, setSyncingPullStatus, salesforceUserDetails, setSalesforceUserDetails, syncStatus, setSyncStatus, setSalesforceTokens, clearSalesforceTokens, salesforceAccessToken, salesforceInstanceUrl }) => {
    const exchangingRef = useRef(false);
    const popupRef = useRef(null);
    const intervalRef = useRef(null);
    const userData = getUserDetails()

    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [syncMessage, setSyncMessage] = useState(null)

    const handleOpenDialog = () => {
        setDialog({
            open: true,
            title: 'Log Out',
            message: 'Are you sure! Do you want to log out from salesforce account?',
            actionButtonText: 'yes'
        });
    };

    const handleCloseDialog = () => {
        setDialog({ open: false, title: '', message: '', actionButtonText: '' });
    };

    const handleGetSalesForceUserInfo = async (tokenOverride, urlOverride) => {
        try {
            const token = tokenOverride || salesforceAccessToken;
            const url = urlOverride || salesforceInstanceUrl;

            if (token && url) {
                const userRes = await getUserInfo(token, url);
                const data = userRes?.result?.data || null;
                if (data) {
                    initSalesForce()
                    setSalesforceUserDetails(data);
                    localStorage.setItem("salesforceUserData", JSON.stringify(data));
                    setSyncingPushStatus(true);
                    await handleSyncData()
                } else {
                    setSalesforceUserDetails(null)
                    localStorage.removeItem("salesforceUserData");
                    clearSalesforceTokens();
                }
            }
        } catch (error) {
            console.error("Error fetching user info:", error);
        }
    };

    const stopPopupWatcher = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const closePopup = () => {
        try {
            if (popupRef.current && !popupRef.current.closed) {
                popupRef.current.close();
            }
        } catch (e) {
            // ignore
        }
        popupRef.current = null;
    };

    const handleSyncData = async () => {
        setSyncStatus(true)
        setSyncMessage("Please wait ! We are syncing your data.....")
        const res = await saveSyncStatus()
        if (res.status === 200) {
            handleGetSyncStatus();
        }
    }

    const handleLogin = async () => {
        // prevent multiple clicks / multiple popups
        if (loading) return;

        setLoadingMessage("Connecting to Salesforce.......")
        setLoading(true);
        exchangingRef.current = false;

        try {
            const res = await connectToSalesforce();

            if (!res?.result?.url) {
                setAlert({ open: true, type: "error", message: "Failed to get Salesforce login URL." });
                setLoading(false);
                setLoadingMessage(null)
                return;
            }

            const width = 600, height = 700;
            const left = window.screenX + (window.outerWidth - width) / 2;
            const top = window.screenY + (window.outerHeight - height) / 2;

            // close any previous popup/interval just in case
            stopPopupWatcher();
            closePopup();

            const popup = window.open(
                res.result.url,
                "Salesforce Login",
                `width=${width},height=${height},left=${left},top=${top}`
            );

            if (!popup) {
                setAlert({ open: true, type: "error", message: "Popup blocked. Please allow popups and try again." });
                setLoading(false);
                setLoadingMessage(null)
                return;
            }

            popupRef.current = popup;

            intervalRef.current = setInterval(async () => {
                try {
                    if (!popupRef.current || popupRef.current.closed) {
                        stopPopupWatcher();
                        setLoading(false);
                        exchangingRef.current = false;
                        return;
                    }

                    // ⚠️ This throws SecurityError while popup is on Salesforce domain.
                    // We catch it and ignore until it comes back to our domain.
                    const popupUrl = popupRef.current.location.href;

                    // handle error from Salesforce redirect
                    if (popupUrl.includes("error=")) {
                        stopPopupWatcher();
                        setAlert({ open: true, type: "error", message: "Salesforce authentication failed." });
                        closePopup();
                        setLoading(false);
                        setLoadingMessage(null)
                        exchangingRef.current = false;
                        return;
                    }

                    // handle success redirect (back to frontend)
                    if (popupUrl.includes("code=")) {
                        if (exchangingRef.current) return; // prevent multiple hits
                        exchangingRef.current = true;

                        stopPopupWatcher(); // stop before awaiting anything

                        const qs = popupUrl.split("?")[1] || "";
                        const params = new URLSearchParams(qs);
                        const code = params.get("code");

                        if (!code) {
                            exchangingRef.current = false;
                            closePopup();
                            setLoading(false);
                            setLoadingMessage(null)
                            return;
                        }

                        const tokenRes = await exchangeToken(code);
                        const token = tokenRes?.result?.data?.access_token;
                        const instanceUrl = tokenRes?.result?.data?.instance_url;

                        if (token && instanceUrl) {
                            setSalesforceTokens({ accessToken: token, instanceUrl: instanceUrl });
                            setAlert({
                                open: true,
                                type: "success",
                                message: "Account successfully connected to Salesforce."
                            });
                            closePopup();
                            await handleGetSalesForceUserInfo(token, instanceUrl);
                            setLoading(false);
                            setLoadingMessage(null)
                            return;
                        }

                        setAlert({ open: true, type: "error", message: "Token exchange failed." });
                        closePopup();
                        setLoading(false);
                        exchangingRef.current = false;
                    }

                } catch (err) {
                    // ✅ THIS IS THE FIX: ignore cross-origin SecurityError silently
                    if (err?.name === "SecurityError") {
                        return; // do nothing, wait for redirect back to our domain
                    }

                    // other unexpected errors -> stop
                    stopPopupWatcher();
                    closePopup();
                    setLoading(false);
                    exchangingRef.current = false;

                    setAlert({
                        open: true,
                        type: "error",
                        message: "Unexpected error while connecting to Salesforce."
                    });
                }
            }, 500);

        } catch (err) {
            stopPopupWatcher();
            closePopup();
            setAlert({ open: true, type: "error", message: "Error connecting to the server." });
            setLoading(false);
            exchangingRef.current = false;
        }
    };

    const handleLogout = async () => {
        localStorage.removeItem("salesforceUserData");
        clearSalesforceTokens();
        setSalesforceUserDetails(null);

        const res = await removeUserSalesForceToken(userData?.userId)
        if (res.status === 200) {
            setAlert({
                open: true,
                type: "success",
                message: "Logged out successfully from Salesforce."
            });
        } else {
            setAlert({
                open: true,
                type: "error",
                message: "Failed to disconnect."
            });
        }
        handleCloseDialog();
    };

    const handleGetSyncStatus = async () => {
        try {
            const res = await getSyncStatus();
            if (res?.status === 200) {
                if (res?.result?.status === 1 || res?.result?.status === 2) {
                    setSyncMessage(res?.result?.statusMessage || "Please wait ! We are syncing your data.....")
                    setSyncStatus(true)
                } else {
                    setSyncMessage(null)
                    setSyncStatus(false)
                    setSyncingPushStatus(true);
                }
            } else {
                setSyncMessage(null)
                setSyncStatus(false)
                setSyncingPushStatus(true);
            }
        } catch (error) {
            console.error("Error fetching sync status:", error);
        }
    };

    const initSalesForce = async () => {
        if (!salesforceAccessToken && !salesforceInstanceUrl) {
            const tokens = await fetchAndSetSalesforceTokens(userData?.userId);
            if (tokens != null) {
                setSalesforceTokens(tokens);
                let currentToken = tokens?.accessToken;
                let currentUrl = tokens?.instanceUrl;
                if (currentToken && currentUrl && !salesforceUserDetails) {
                    const userRes = await getUserInfo(currentToken, currentUrl);
                    const data = userRes?.result?.data || null;
                    if (data) {
                        setSalesforceUserDetails(data);
                    } else {
                        setSalesforceUserDetails(null)
                        clearSalesforceTokens();
                    }
                }
            }
        }
    }

    useEffect(() => {
        let interval;
        if (syncStatus) {
            handleGetSyncStatus();
            interval = setInterval(() => {
                handleGetSyncStatus()
            }, 5000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [syncStatus]);

    useEffect(() => {
        initSalesForce()
    }, [])

    return (
        <div className='pt-10'>
            {(loading && salesforceUserDetails === null) ? (
                <UserInfoSkeleton />
            ) : salesforceUserDetails ? (
                <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center max-w-sm w-full">
                    <div className="mb-6">
                        <img src={SalesForceLogo} alt="Salesforce Logo" className="mb-3 h-14 md:h-20" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-800">{salesforceUserDetails?.name}</h2>
                    <p className="text-gray-500 mb-4">{salesforceUserDetails?.email}</p>

                    <a
                        href={salesforceUserDetails?.profile}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#44288E] text-sm font-medium underline hover:text-[#44288E] transition-colors duration-200"
                    >
                        View Salesforce Profile
                    </a>
                    {
                        syncStatus && (
                            <div className='flex justify-start gap-3 items-center'>
                                <div className="w-6 h-6">
                                    <div className="w-full h-full rounded-full border-4 border-[#44288E] border-t-transparent border-r-transparent animate-spinDualRing"></div>
                                </div>
                                <p className="text-black my-4 text-sm">{syncMessage}</p>
                            </div>
                        )
                    }
                    <div className='flex justify-between gap-4 w-full mt-4'>
                        <button
                            disabled={syncStatus}
                            onClick={handleOpenDialog}
                            className={`flex-1 py-3 bg-[#44288E] text-white rounded shadow-md hover:bg-[#44288E] transition-colors duration-300 ${syncStatus ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center max-w-sm w-full">
                    <div className="mb-6">
                        <img src={SalesForceLogo} alt="Salesforce Logo" className="mb-3 h-14 md:h-20" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">Connect to Salesforce</h2>
                    <p className="text-gray-500 text-center mb-6">
                        Log in to your Salesforce account to synchronize your data.
                    </p>

                    <button
                        onClick={handleLogin}
                        type="button"
                        className="relative px-8 py-3 rounded-full group overflow-hidden font-medium text-[#44288E] border border-[#44288E]"
                    >
                        <span className="absolute bottom-0 left-0 w-full h-0 transition-all duration-300 ease-out bg-[#44288E] group-hover:h-full"></span>
                        <span className="relative z-10 transition-colors duration-300 group-hover:text-white text-lg font-bold">
                            Log in with Salesforce
                        </span>
                    </button>
                </div>
            )}

            <AlertDialog
                open={dialog.open}
                title={dialog.title}
                message={dialog.message}
                actionButtonText={dialog.actionButtonText}
                handleAction={() => handleLogout()}
                handleClose={() => handleCloseDialog()}
            />
        </div>
    );
};

const mapStateToProps = (state) => ({
    loading: state.common.loading,
    salesforceUserDetails: state.common.salesforceUserDetails,
    syncStatus: state.common.syncStatus,
    loadingMessage: state.common.loadingMessage,
    salesforceAccessToken: state.common.salesforceAccessToken,
    salesforceInstanceUrl: state.common.salesforceInstanceUrl,
});

const mapDispatchToProps = {
    setLoading,
    setAlert,
    setSyncingPullStatus,
    setSyncingPushStatus,
    setLoadingMessage,
    setSyncCount,
    setSalesforceUserDetails,
    setSyncStatus,
    setSalesforceTokens,
    clearSalesforceTokens
};

export default connect(mapStateToProps, mapDispatchToProps)(Crm);
