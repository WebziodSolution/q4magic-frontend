import React, { useEffect, useState } from 'react';
import { getAllResults } from '../../../service/results/results';
import CustomIcons from '../../../components/common/icons/CustomIcons';

const getInitials = (name) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (parts[0][0] || "").toUpperCase();
};

const getAvatarColor = (name) => {
    const colors = [
        'bg-[#B48BED]',
        'bg-[#93C5FD]',
        'bg-[#A5B4FC]',
        'bg-[#4B5563]',
        'bg-[#FCA5A5]',
        'bg-[#FCD34D]',
        'bg-[#86EFAC]',
        'bg-[#F472B6]',
    ];
    let sum = 0;
    for (let i = 0; i < (name || "").length; i++) {
        sum += name.charCodeAt(i);
    }
    return colors[sum % colors.length];
}; const StatCard = ({ title, icon, children }) => (
    <div className={`bg-white rounded-xl border border-[#E5E7EB] shadow-[0_8px_20px_rgba(0,0,0,0.05)] p-4 w-full max-w-[400px] group ${title === "Pipeline" || title === "Meetings" ? "cursor-pointer" : ""}`}>
        <div className="flex justify-start items-center gap-3 mb-2 border-b border-b-[#E5E7EB] pb-2">
            <div className="text-[#44288E]">
                <CustomIcons iconName={icon} css="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">{title}</h3>
        </div>
        <div className="flex items-center justify-between px-2">
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

const Results = () => {
    const [results, setResults] = useState([]);
    const [totalPipeline, setTotalPipeline] = useState(0);
    const [totalRev, setTotalRev] = useState(0);


    const handleGetResults = async () => {
        const res = await getAllResults();
        if (res?.data?.status === 200) {
            const data = res?.data?.result?.map((item, index) => ({
                ...item,
                rowId: index + 1,
            }));
            setResults(data);
        }
    };

    useEffect(() => {
        document.title = "Results - 360Pipe";
        handleGetResults();
    }, []);

    // Recalculate totals from results whenever results change
    useEffect(() => {
        if (results.length > 0) {
            const pipeSum = results.reduce((acc, item) => acc + (Number(item.pipelineTotal) || 0), 0);
            const revSum = results.reduce((acc, item) => acc + (Number(item.rev) || 0), 0);
            setTotalPipeline(pipeSum);
            setTotalRev(revSum);
        } else {
            setTotalPipeline(0);
            setTotalRev(0);
        }
    }, [results]);

    return (
        <div className="py-6 bg-[#F8FAFF]">
            {/* STAT CARDS */}
            <div className="flex gap-6 mb-8 justify-center">
                <StatCard title="Pipeline" icon="fa-solid fa-coins">
                    <div className="flex flex-col items-center flex-1">
                        <span className="text-5xl font-extrabold text-[#111827]">
                            {moneyLabel(totalPipeline)}
                        </span>
                    </div>
                </StatCard>

                <StatCard title="Revenue" icon="fa-solid fa-chart-line">
                    <div className="flex flex-col items-center flex-1">
                        <span className="text-5xl font-extrabold text-[#111827]">
                            {moneyLabel(totalRev)}
                        </span>
                    </div>
                </StatCard>
            </div>

            <div
                className="w-full lg:w-full overflow-x-auto"
                style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.06)'
                }}
            >
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr style={{ backgroundColor: '#EDE9FE' }}>
                            <th className="py-4 px-6 font-semibold text-sm tracking-wider uppercase w-1/2" style={{ color: '#5B21B6' }}>
                                REP
                            </th>
                            <th className="py-4 px-6 font-semibold text-sm tracking-wider uppercase" style={{ color: '#5B21B6' }}>
                                PIPELINE
                            </th>
                            <th className="py-4 px-6 font-semibold text-sm tracking-wider uppercase" style={{ color: '#5B21B6' }}>
                                REVENUE
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((row, index) => {
                            const isLastRow = index === results.length - 1;
                            return (
                                <tr
                                    key={row.rowId || index}
                                    style={{ borderBottom: isLastRow ? 'none' : '1px solid #F1F5F9' }}
                                >
                                    <td className="py-4 px-6 flex items-center gap-4 text-[#6B7280]">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${getAvatarColor(row.rep_name)}`}
                                        >
                                            {getInitials(row.rep_name)}
                                        </div>
                                        <span className="text-base text-[#111827]">{row.rep_name || '—'}</span>
                                    </td>
                                    {/* <td className="py-4 px-6 flex items-center gap-4 text-[#6B7280]">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${getAvatarColor(row.rep_name)}`}
                                        >
                                            {getInitials(row.rep_name)}
                                        </div>
                                        <span className="text-base">{row.rep_name || '—'}</span>
                                    </td> */}
                                    <td className="py-4 px-6 text-[#111827] font-semibold text-lg">
                                        {row.pipelineTotal ? moneyLabel(row.pipelineTotal) : '$0'}
                                    </td>
                                    <td className="py-4 px-6 text-[#111827] font-bold text-lg">
                                        {row.rev ? moneyLabel(row.rev) : '$0'}
                                    </td>
                                </tr>
                            );
                        })}
                        {results.length === 0 && (
                            <tr>
                                <td colSpan="3" className="py-8 text-center text-[#6B7280]">
                                    No results found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Results;



// import React, { useEffect, useMemo, useState } from 'react';
// import ReactDOM from 'react-dom'; // added for portal
// import { connect } from 'react-redux';
// import { getAllResults } from '../../../service/results/results';
// import DataTable from '../../../components/common/table/table';
// import { getDashboardData } from '../../../service/customers/customersService';
// import CustomIcons from '../../../components/common/icons/CustomIcons';

// const StatCard = ({ title, icon, children }) => (
//     <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-4 w-full max-w-[400px] group ${title === "Pipeline" || "Meetings" ? "cursor-pointer" : ""}`}>
//         <div className="flex justify-center items-center gap-3 mb-2">
//             <div className="text-[#44288E]">
//                 <CustomIcons iconName={icon} css="h-6 w-6" />
//             </div>
//             <h3 className="text-lg font-bold text-slate-700">{title}</h3>
//         </div>
//         {/* <hr className="mb-4 border-gray-100" /> */}
//         <div className="flex items-center justify-between px-2">
//             {children}
//         </div>
//     </div>
// );

// const formatMoneyK = (num) => {
//     const n = parseInt(num || 0);
//     if (n >= 1_000_000) return `${parseInt(n / 1_000_000)}M`;
//     if (n >= 1_000) return `${parseInt(Math.round(n / 1_000))}K`;
//     return `${n}`;
// };

// const moneyLabel = (v) => `$${formatMoneyK(v)}`;

// const Results = ({ filterStartDate, filterEndDate }) => {
//     const [results, setResults] = useState([]);
//     const [dashboardData, setDashboardData] = useState(null);

//     // State for pipeline row hover
//     const [hoveredPipelineRow, setHoveredPipelineRow] = useState(null);
//     const [hoveredPipelinePos, setHoveredPipelinePos] = useState(null);

//     const handleGetDashboardData = async () => {
//         try {
//             const res = await getDashboardData({ startDate: filterStartDate, endDate: filterEndDate });
//             setDashboardData(res?.data?.result || null);
//         } catch (e) { console.log("Error", e); }
//     };

//     const handleGetResults = async () => {
//         const res = await getAllResults();
//         if (res?.data?.status === 200) {
//             const data = res?.data?.result?.map((item, index) => ({
//                 ...item,
//                 rowId: index + 1,
//             }));
//             setResults(data);
//         }
//     };

//     useEffect(() => {
//         document.title = "Results - 360Pipe";
//         handleGetDashboardData();
//         handleGetResults();
//     }, []);

//     const columns = [
//         {
//             field: 'rowId',
//             headerName: '#',
//             headerClassName: 'uppercase',
//             flex: 1,
//             maxWidth: 50,
//             sortable: false,
//         },
//         {
//             field: 'rep_name',
//             headerName: 'Rep',
//             headerClassName: 'uppercase',
//             flex: 1,
//             minWidth: 100,
//             sortable: false,
//         },
//         {
//             field: 'pipelineTotal',
//             headerName: 'Pipe',
//             headerClassName: 'uppercase',
//             flex: 1,
//             minWidth: 150,
//             renderCell: (params) => (
//                 <span>{params.value ? `${moneyLabel(params.value)}` : '$0'}</span>
//             ),
//         },
//         {
//             field: 'rev',
//             headerName: 'Rev',
//             headerClassName: 'uppercase',
//             flex: 1,
//             minWidth: 150,
//             renderCell: (params) => (
//                 <span>{params.value ? `${moneyLabel(params.value)}` : '$0'}</span>
//             ),
//         },
//     ];

//     const getRowId = (row) => row.rowId;

//     const ui = useMemo(() => {
//         const totalContacts = parseInt(dashboardData?.totalContacts || 0);
//         const totalMeetings = parseInt(dashboardData?.totalMeetings || 0);
//         const totalPipeLine = parseInt(dashboardData?.totalPipeLine || 0);

//         const netNew = parseInt(dashboardData?.totalNewMeetings || 0);
//         const existing = parseInt(dashboardData?.totalOldMeetings || 0);

//         const totalClosedDealAmount =
//             dashboardData?.totalClosedDealAmount != null ? parseInt(dashboardData.totalClosedDealAmount) : null;

//         const totalDealAmount =
//             dashboardData?.totalDealAmount != null ? parseInt(dashboardData.totalDealAmount) : null;

//         const percentClosedDealAmount =
//             totalDealAmount > 0 && totalClosedDealAmount != null
//                 ? parseInt(((totalClosedDealAmount / totalDealAmount) * 100))
//                 : null;

//         const pipeLineData = dashboardData?.pipeLineData || [];
//         const meetingData = dashboardData?.meetingData || [];

//         return {
//             totalContacts,
//             totalMeetings,
//             netNew,
//             existing,
//             totalPipeLine,
//             totalClosedDealAmount,
//             totalDealAmount,
//             percentClosedDealAmount,
//             pipeLineData,
//             meetingData,
//         };
//     }, [dashboardData]);

//     // Handlers for pipeline row hover
//     const handlePipelineRowMouseEnter = (row, event) => {
//         const rect = event.currentTarget.getBoundingClientRect();
//         setHoveredPipelineRow(row);
//         setHoveredPipelinePos({
//             top: rect.top + window.scrollY,          // adjust for page scroll
//             left: rect.left + rect.width + 10,       // show to the right of the row
//         });
//     };

//     const handlePipelineRowMouseLeave = () => {
//         setHoveredPipelineRow(null);
//         setHoveredPipelinePos(null);
//     };

//     return (
//         <div className="py-6 bg-[#F8FAFF]">
//             {/* STAT CARDS */}
//             <div className="flex gap-6 mb-8 justify-center">
//                 <StatCard title="Pipeline" icon="fa-solid fa-user-plus">
//                     <div className="flex flex-col items-center flex-1">
//                         <span className="text-5xl font-extrabold text-slate-800">
//                             {ui.totalPipeLine ? `${moneyLabel(ui.totalPipeLine)}` : "$0"}
//                         </span>
//                     </div>
//                     {ui?.pipeLineData?.length > 0 && (
//                         <div className="hidden group-hover:block h-80 w-[33%] overflow-y-auto absolute top-72 left-[300px] z-50">
//                             <table className="border-collapse">
//                                 <thead className="sticky top-0 z-10">
//                                     <tr className="bg-[#44288E] text-white">
//                                         <th className="px-4 py-1 text-left font-bold">Rep</th>
//                                         <th className="px-4 py-1 text-left font-bold">Account</th>
//                                         <th className="px-4 py-1 text-left font-bold w-40">Amount</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {ui.pipeLineData.map((row, i) => (
//                                         <tr
//                                             key={row.contactId ?? i}
//                                             className="odd:bg-white even:bg-gray-200 cursor-pointer"
//                                             onMouseEnter={(e) => handlePipelineRowMouseEnter(row, e)}
//                                             onMouseLeave={handlePipelineRowMouseLeave}
//                                         >
//                                             <td className="px-4 py-1">{row.created_by || '—'}</td>
//                                             <td className="px-4 py-1">{row.account || '—'}</td>
//                                             <td className="px-4 py-1">{moneyLabel(row.totalDealAmount) || '—'}</td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     )}
//                 </StatCard>

//                 <StatCard title="Attainment" icon="fa-solid fa-users-rectangle">
//                     <div className="flex flex-col items-center flex-1">
//                         <span className="text-5xl font-extrabold text-slate-800">
//                             {ui.percentClosedDealAmount == null ? "0%" : `${ui.percentClosedDealAmount}%`}
//                         </span>
//                         <span className="text-xl font-extrabold text-slate-800">
//                             {ui.totalClosedDealAmount != null && ui.totalDealAmount != null
//                                 ? `${moneyLabel(ui.totalClosedDealAmount)} / ${moneyLabel(ui.totalDealAmount)}`
//                                 : "No Data Available"}
//                         </span>
//                     </div>
//                 </StatCard>
//             </div>

//             <div className='border rounded-lg bg-white w-full lg:w-full'>
//                 <DataTable columns={columns} rows={results} getRowId={getRowId} height={480} hideFooter={true} />
//             </div>

//             {/* Portal for pipeline row opportunities popup */}
//             {hoveredPipelineRow &&
//                 hoveredPipelinePos &&
//                 ReactDOM.createPortal(
//                     <div
//                         className="fixed bg-white shadow-lg rounded-lg border border-gray-200 z-50"
//                         style={{
//                             top: hoveredPipelinePos.top,
//                             left: hoveredPipelinePos.left,
//                             minWidth: '300px',
//                             maxHeight: '400px',
//                             overflowY: 'auto',
//                         }}
//                     >
//                         {hoveredPipelineRow?.opps?.length > 0 ? (
//                             <table className="w-full border-collapse">
//                                 <thead>
//                                     <tr className="bg-[#44288E] text-white">
//                                         <th className="px-4 py-1 text-left w-80">Opportunity</th>
//                                         <th className="px-4 py-1 text-left">Amount</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {hoveredPipelineRow.opps.map((opp, idx) => (
//                                         <tr key={idx} className="odd:bg-white even:bg-gray-200">
//                                             <td className="px-4 py-1">{opp.name || '—'}</td>
//                                             <td className="px-4 py-1">{moneyLabel(opp.dealAmount) || '—'}</td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         ) : (
//                             <div className="p-4 text-gray-500">No opportunities</div>
//                         )}
//                     </div>,
//                     document.body
//                 )}
//         </div>
//     );
// };

// const mapStateToProps = (state) => ({
//     filterStartDate: state.common.filterStartDate,
//     filterEndDate: state.common.filterEndDate,
// });

// export default connect(mapStateToProps, null)(Results);