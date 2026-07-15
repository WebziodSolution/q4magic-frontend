import { useEffect, useMemo, useState, useRef, useLayoutEffect } from "react";
import ReactDOM from "react-dom";
import { getDashboardData } from "../../service/customers/customersService";
import { useNavigate } from "react-router-dom";
import { connect } from "react-redux";
import CustomIcons from "../../components/common/icons/CustomIcons";
import AlertDialog from "../../components/common/alertDialog/alertDialog";
import { clearSalesforceTokens, setSalesforceTokens, setSalesforceUserDetails } from "../../redux/commonReducers/commonReducers";
import { getUserDetails } from "../../utils/getUserDetails";
import { fetchAndSetSalesforceTokens } from "../../utils/salesforceTokenHelper";
import { getUserInfo } from "../../service/salesforce/connect/salesforceConnectService";

// --- StatCard with reduced height and font sizes ---
const StatCard = ({ title, icon, children, gradient, onMouseEnter, onMouseLeave }) => (
    <div
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`bg-white rounded-2xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] p-5 w-full min-h-[170px] max-w-[300px] flex flex-col group relative transition-all duration-300 hover:-translate-y-1 ${title === "Pipeline" || title === "Meetings" ? "cursor-pointer" : ""}`}
    >
        <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl ${gradient} flex items-center justify-center shadow-lg transform transition-transform duration-300 group-hover:scale-110`}>
                <div className="text-white text-base">
                    <CustomIcons iconName={icon} />
                </div>
            </div>
            <h3 className="text-sm font-semibold text-slate-600 tracking-tight">{title}</h3>
        </div>
        <div className="flex flex-col flex-1 w-full">
            {children}
        </div>
    </div>
);

const formatMoneyK = (num) => {
    const n = parseInt(num || 0);
    if (n >= 1_000_000) return `${parseInt(n / 1_000_000)}M`;
    if (n >= 1_000) return `${parseInt(Math.round(n / 1_000))}K`;
    return `${n}`;
};

const moneyLabel = (v) => `$${formatMoneyK(v)}`;

// Helper to adjust popup position so it stays inside viewport
const adjustPopupPosition = (triggerRect, popupWidth, popupHeight, offset = 10) => {
    let left = triggerRect.left + triggerRect.width + offset;
    let top = triggerRect.top;

    if (left + popupWidth > window.innerWidth) {
        left = triggerRect.left - popupWidth - offset;
    }
    if (left < 0) {
        left = offset;
    }

    if (top + popupHeight > window.innerHeight) {
        top = window.innerHeight - popupHeight - offset;
    }
    if (top < 0) {
        top = offset;
    }

    return { top, left };
};

const Dashboard = ({ filterStartDate, filterEndDate, salesforceUserDetails, salesforceAccessToken, salesforceInstanceUrl, setSalesforceUserDetails, setSalesforceTokens }) => {
    const navigate = useNavigate();
    const userDetails = getUserDetails()

    const [dashboardData, setDashboardData] = useState(null);
    const [openCRMAlert, setOpenCRMAlert] = useState(false);

    // --- Pipeline card popup visibility ---
    const [showPipelinePopup, setShowPipelinePopup] = useState(false);
    const [pipelineCardRect, setPipelineCardRect] = useState(null);

    // --- Pipeline row hover state (for opportunity popup) ---
    const [hoveredPipelineRow, setHoveredPipelineRow] = useState(null);
    const [hoveredPipelineRowRect, setHoveredPipelineRowRect] = useState(null);
    const rowPopupRef = useRef();
    const [rowPopupStyle, setRowPopupStyle] = useState({}); // final position + visibility

    // --- Single timeout for all popups (card + row) ---
    const hideGroupTimeout = useRef(null);

    const cancelHideGroup = () => {
        if (hideGroupTimeout.current) clearTimeout(hideGroupTimeout.current);
    };

    const scheduleHideGroup = () => {
        cancelHideGroup();
        hideGroupTimeout.current = setTimeout(() => {
            setShowPipelinePopup(false);
            setPipelineCardRect(null);
            setHoveredPipelineRow(null);
            setHoveredPipelineRowRect(null);
        }, 150);
    };

    const handleGetDashboardData = async () => {
        try {
            const res = await getDashboardData({ startDate: filterStartDate, endDate: filterEndDate });
            setDashboardData(res?.data?.result || null);
        } catch (e) {
            console.log("Error", e);
        }
    };

    useEffect(() => {
        document.title = "Dashboard - 360Pipe";
        if (filterStartDate && filterEndDate) {
            handleGetDashboardData();
        }
    }, [filterStartDate, filterEndDate]);

    const ui = useMemo(() => {
        const totalContacts = parseInt(dashboardData?.totalContacts || 0);
        const totalMeetings = parseInt(dashboardData?.totalMeetings || 0);
        const totalPipeLine = parseInt(dashboardData?.totalPipeLine || 0);
        const netNew = parseInt(dashboardData?.totalNewMeetings || 0);
        const existing = parseInt(dashboardData?.totalOldMeetings || 0);
        const totalClosedDealAmount =
            dashboardData?.totalClosedDealAmount != null ? parseInt(dashboardData.totalClosedDealAmount) : null;
        const totalDealAmount =
            dashboardData?.totalDealAmount != null ? parseInt(dashboardData.totalDealAmount) : null;
        const percentClosedDealAmount =
            totalDealAmount > 0 && totalClosedDealAmount != null
                ? parseInt(((totalClosedDealAmount / totalDealAmount) * 100))
                : null;
        const pipeLineData = dashboardData?.pipeLineData || [];
        const meetingData = dashboardData?.meetingData || [];

        return {
            totalContacts,
            totalMeetings,
            netNew,
            existing,
            totalPipeLine,
            totalClosedDealAmount,
            totalDealAmount,
            percentClosedDealAmount,
            pipeLineData,
            meetingData
        };
    }, [dashboardData]);

    // --- Handlers for pipeline card popup ---
    const handlePipelineCardMouseEnter = (e) => {
        cancelHideGroup();
        const rect = e.currentTarget.getBoundingClientRect();
        setPipelineCardRect(rect);
        setShowPipelinePopup(true);
    };

    const handlePipelineCardMouseLeave = () => {
        scheduleHideGroup();
    };

    const handlePipelinePopupMouseEnter = () => {
        cancelHideGroup();
    };

    const handlePipelinePopupMouseLeave = () => {
        scheduleHideGroup();
    };

    // --- Handlers for pipeline row popup ---
    const handlePipelineRowMouseEnter = (id, row, event) => {
        cancelHideGroup();
        const rect = event.currentTarget.getBoundingClientRect();
        setHoveredPipelineRow({ id, row });
        setHoveredPipelineRowRect(rect);
        // Reset style so that on next hover we measure again
        setRowPopupStyle({ visibility: 'hidden' });
    };

    const handlePipelineRowMouseLeave = () => {
        scheduleHideGroup();
    };

    const handleRowPopupMouseEnter = () => {
        cancelHideGroup();
    };

    const handleRowPopupMouseLeave = () => {
        scheduleHideGroup();
    };

    // Measure row popup after it renders and adjust position
    useLayoutEffect(() => {
        if (hoveredPipelineRow && hoveredPipelineRowRect && rowPopupRef.current) {
            const { width, height } = rowPopupRef.current.getBoundingClientRect();
            if (width > 0 && height > 0) {
                const { top, left } = adjustPopupPosition(hoveredPipelineRowRect, width, height, 10);
                setRowPopupStyle({
                    top,
                    left,
                    visibility: 'visible'
                });
            }
        }
    }, [hoveredPipelineRow, hoveredPipelineRowRect]);

    const initSalesForce = async () => {
        if (!salesforceAccessToken && !salesforceInstanceUrl) {
            const tokens = await fetchAndSetSalesforceTokens(userDetails?.userId);
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
            } else {
                setOpenCRMAlert(true);
            }
        }
    }

    useEffect(() => {
        initSalesForce()
    }, [])
    return (
        <div className="w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex items-stretch justify-center gap-6 flex-wrap lg:flex-nowrap">

                    {/* New Contacts */}
                    <StatCard title="New Contacts" icon="fa-solid fa-user-plus" gradient="bg-gradient-to-br from-emerald-500 to-emerald-600">
                        <div className="mt-2">
                            <span className="text-5xl font-bold text-slate-800 tracking-tight">{ui.totalContacts}</span>
                        </div>
                    </StatCard>

                    {/* Meetings */}
                    <StatCard title="Meetings" icon="fa-solid fa-users-rectangle" gradient="bg-gradient-to-br from-blue-500 to-blue-600">
                        <div className="mt-2">
                            <div className="text-5xl font-bold text-slate-800 mb-3 tracking-tight">{ui.totalMeetings}</div>
                            <div className="space-y-2 w-full">
                                <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                                        <span className="text-sm font-medium text-slate-600">Net New</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-800">{ui.netNew}</span>
                                </div>
                                <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                                        <span className="text-sm font-medium text-slate-600">Existing</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-800">{ui.existing}</span>
                                </div>
                            </div>
                        </div>

                        {/* Meetings accounts popup (stays inside card) */}
                        {ui?.meetingData?.length > 0 && (
                            <div className="hidden group-hover:block w-96 max-h-96 overflow-hidden absolute top-full left-1/2 -translate-x-1/2 mt-2 shadow-2xl z-50 bg-white rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3">
                                    <p className="font-semibold">Accounts</p>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {ui.meetingData.map((item, index) => (
                                        <div key={index} className="px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-200 cursor-pointer transition-colors border-b border-slate-100 last:border-0">
                                            {item.account_name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </StatCard>

                    {/* Pipeline */}
                    <StatCard
                        title="Pipeline"
                        icon="fa-solid fa-dollar-sign"
                        gradient="bg-gradient-to-br from-cyan-500 to-cyan-600"
                        onMouseEnter={handlePipelineCardMouseEnter}
                        onMouseLeave={handlePipelineCardMouseLeave}
                    >
                        <div className="mt-2">
                            <span className="text-5xl font-bold text-slate-800 tracking-tight">
                                {ui.totalPipeLine ? moneyLabel(ui.totalPipeLine) : "$0"}
                            </span>
                        </div>
                    </StatCard>

                    {/* Attainment */}
                    <StatCard title="Attainment" icon="fa-solid fa-bullseye" gradient="bg-gradient-to-br from-orange-500 to-orange-600">
                        <div className="mt-2 w-full">
                            <span className="text-5xl font-bold text-slate-800 tracking-tight">
                                {ui.percentClosedDealAmount == null ? "0%" : `${ui.percentClosedDealAmount}%`}
                            </span>
                            <div className="mt-4 w-full">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-slate-600">Progress</span>
                                    <span className="text-sm font-semibold text-slate-700">
                                        {ui.totalClosedDealAmount != null && ui.totalDealAmount != null
                                            ? `${moneyLabel(ui.totalClosedDealAmount)} / ${moneyLabel(ui.totalDealAmount)}`
                                            : "No Goal Set"}
                                    </span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
                                    <div
                                        className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                                        style={{ width: `${ui.percentClosedDealAmount || 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </StatCard>
                </div>
            </div>

            <AlertDialog
                open={openCRMAlert}
                handleClose={() => setOpenCRMAlert(false)}
                title="Connect to CRM"
                message="Please connect your CRM account to view and synchronize your sales data."
                handleAction={() => {
                    setOpenCRMAlert(false);
                    navigate("/dashboard/mycrm");
                }}
                actionButtonText="Connect"
                cancelButtonText="Later"
            />

            {/* Portal for Pipeline card table popup */}
            {showPipelinePopup && pipelineCardRect && ui.pipeLineData.length > 0 &&
                ReactDOM.createPortal(
                    <div
                        onMouseEnter={handlePipelinePopupMouseEnter}
                        onMouseLeave={handlePipelinePopupMouseLeave}
                        className="fixed bg-white shadow-2xl rounded-xl border border-slate-200 z-[60] animate-in fade-in slide-in-from-top-2 duration-200"
                        style={{
                            top: pipelineCardRect.bottom,
                            left: Math.min(pipelineCardRect.left, window.innerWidth - 450),
                            minWidth: '450px',
                            maxHeight: '300px',
                            overflowY: 'auto',
                        }}
                    >
                        <div className="overflow-hidden rounded-xl">
                            <table className="w-full bg-white">
                                <thead className="sticky top-0 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Rep</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Account</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ui?.pipeLineData?.map((row, i) => (
                                        <tr
                                            key={row.contactId ?? i}
                                            className={`border-b border-slate-100 hover:bg-slate-200 cursor-pointer transition-colors ${hoveredPipelineRow?.id === row.id ? 'bg-slate-200' : ''}`}
                                            onMouseEnter={(e) => handlePipelineRowMouseEnter(row?.id, row, e)}
                                            onMouseLeave={handlePipelineRowMouseLeave}
                                        >
                                            <td className="px-4 py-3 text-sm text-slate-700">{row.created_by || '—'}</td>
                                            <td className="px-4 py-3 text-sm text-slate-700">{row.account || '—'}</td>
                                            <td className="px-4 py-3 text-sm font-semibold text-slate-800">{moneyLabel(row.totalDealAmount) || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>,
                    document.body
                )
            }

            {/* Portal for Pipeline row opportunity popup */}
            {hoveredPipelineRow && (
                ReactDOM.createPortal(
                    <div
                        ref={rowPopupRef}
                        onMouseEnter={handleRowPopupMouseEnter}
                        onMouseLeave={handleRowPopupMouseLeave}
                        className="fixed bg-white shadow-2xl rounded-xl border border-slate-200 z-[60] animate-in fade-in duration-200"
                        style={{
                            ...rowPopupStyle,
                            minWidth: '350px',
                            maxHeight: '400px',
                            overflowY: 'auto',
                        }}
                    >
                        {console.log("hoveredPipelineRow?.row?.opps", hoveredPipelineRow)}
                        {hoveredPipelineRow?.row?.opps?.length > 0 ? (
                            <div className="overflow-hidden rounded-xl">
                                <table className="w-full border-collapse">
                                    <thead className="sticky top-0 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold text-sm">Opportunity</th>
                                            <th className="px-4 py-3 text-left font-semibold text-sm">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {hoveredPipelineRow?.row?.opps?.map((opp, idx) => (
                                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-200 transition-colors cursor-pointer">
                                                <td className="px-4 py-3 text-sm text-slate-700">{opp.name || '—'}</td>
                                                <td className="px-4 py-3 text-sm font-semibold text-slate-800">{moneyLabel(opp.dealAmount) || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-6 text-slate-500 text-sm text-center">No opportunities available</div>
                        )}
                    </div>,
                    document.body
                )
            )}
        </div>
    );
};

const mapStateToProps = (state) => ({
    filterStartDate: state.common.filterStartDate,
    filterEndDate: state.common.filterEndDate,
    salesforceUserDetails: state.common.salesforceUserDetails,
    salesforceAccessToken: state.common.salesforceAccessToken,
    salesforceInstanceUrl: state.common.salesforceInstanceUrl,
});

const mapDispatchToProps = {
    setSalesforceTokens,
    clearSalesforceTokens,
    setSalesforceUserDetails
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);