import React, { useEffect, useState, useMemo } from 'react';
import { getAllActivities } from '../../../service/results/results';
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
};

const ActivityCard = ({ title, icon, value, percentage, progressPercent, fillColor, railColor, leftLabel, rightLabel, leftSubLabel, rightSubLabel, leftLabelColor = "text-[#44288E]", rightLabelColor = "text-[#44288E]" }) => (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_8px_20px_rgba(0,0,0,0.05)] p-5 flex-1 w-full max-w-[350px]">
        <div className="flex justify-center items-center gap-2 mb-3">
            <div className="text-[#6B7280]">
                {icon}
            </div>
            <h3 className="text-[#4B5563] font-bold text-lg">{title}</h3>
        </div>
        <div className="flex flex-col items-center mb-4">
            <span className="text-4xl font-bold text-[#1F2937] leading-none mb-1">{value}</span>
            <span className="text-[#6B7280] text-sm font-medium">({percentage})</span>
        </div>
        <div className={`w-full h-1.5 rounded-full mb-2 overflow-hidden flex ${railColor}`}>
            <div className={`h-full ${fillColor}`} style={{ width: progressPercent }}></div>
        </div>
        <div className="flex justify-between w-full text-sm">
            <span className={leftLabelColor}>{leftLabel} <span className="text-[#44288E] font-bold">{leftSubLabel}</span></span>
            <span className={rightLabelColor}>{rightLabel} <span className="text-[#44288E] font-bold">{rightSubLabel}</span></span>
        </div>
    </div>
);

const Activities = () => {
    const [activities, setActivities] = useState([]);

    const handleGetActivities = async () => {
        const res = await getAllActivities();
        if (res?.data?.status === 200) {
            const data = res?.data?.result?.map((item, index) => ({
                ...item,
                rowId: index + 1,
            }));
            setActivities(data || []);
        }
    };

    useEffect(() => {
        document.title = "Activities - 360Pipe";
        handleGetActivities();
    }, []);

    // Compute totals for Hunter/Farmer card
    const totals = useMemo(() => {
        const hunter = activities.reduce((sum, item) => sum + (item.newMeetingCount || 0), 0);
        const farmer = activities.reduce((sum, item) => sum + (item.oldMeetingCount || 0), 0);
        const total = hunter + farmer;
        const hunterPct = total ? (hunter / total) * 100 : 0;
        return { hunter, farmer, total, hunterPct };
    }, [activities]);

    return (
        <div className="py-6 bg-[#F8FAFF]">
            {/* STAT CARDS */}
            <div className="flex gap-6 mb-8 justify-center flex-wrap">
                <ActivityCard
                    title="Meetings"
                    icon={<CustomIcons iconName="fa-solid fa-bolt" css="h-5 w-5 text-[#44288E]" />}
                    value="25"
                    percentage="50%"
                    progressPercent="50%"
                    fillColor="bg-[#44288E]"//#6D28D9
                    railColor="bg-[#DDD6FE]"
                    leftLabel="50" leftSubLabel="Actual" leftLabelColor="text-[#44288E] font-bold"
                    rightLabel="50" rightSubLabel="Goal" rightLabelColor="text-[#44288E] font-bold"
                />

                <ActivityCard
                    title="Onsite Intensity"
                    icon={<CustomIcons iconName="fa-solid fa-map-location-dot" css="h-5 w-5 text-[#44288E]" />}
                    value="8"
                    percentage="32%"
                    progressPercent="32%"
                    fillColor="bg-[#44288E]"
                    railColor="bg-[#DDD6FE]"
                    leftLabel="8" leftSubLabel="Onsite" leftLabelColor="text-[#44288E] font-bold"
                    rightLabel="17" rightSubLabel="Virtual" rightLabelColor="text-[#44288E] font-bold"
                />

                <ActivityCard
                    title="Hunter / Farmer"
                    icon={<CustomIcons iconName="fa-solid fa-handshake" css="h-5 w-5 text-[#44288E]" />}
                    value={totals.hunter}
                    percentage={`${Math.round(totals.hunterPct)}%`}
                    progressPercent={`${totals.hunterPct}%`}
                    fillColor="bg-[#65B79F]"
                    railColor="bg-[#44288E]"
                    leftLabel={totals.hunter} leftSubLabel="Hunter" leftLabelColor="text-[#44288E] font-bold"
                    rightLabel={totals.farmer} rightSubLabel="Farmer" rightLabelColor="text-[#44288E] font-bold"
                />
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
                            <th className="py-4 px-6 font-semibold text-sm tracking-wider uppercase" style={{ color: '#5B21B6' }}>
                                REP
                            </th>
                            <th className="py-4 px-6 font-semibold text-sm tracking-wider uppercase text-center" style={{ color: '#5B21B6' }}>
                                NET NEW
                            </th>
                            <th className="py-4 px-6 font-semibold text-sm tracking-wider uppercase text-center" style={{ color: '#5B21B6' }}>
                                EXISTING
                            </th>
                            <th className="py-4 px-6 font-semibold text-sm tracking-wider uppercase text-center" style={{ color: '#5B21B6' }}>
                                (ONSITE)
                            </th>
                            <th className="py-4 px-6 font-semibold text-sm tracking-wider uppercase text-center" style={{ color: '#5B21B6' }}>
                                TOTAL
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {activities.map((row, index) => {
                            const isLastRow = index === activities.length - 1;
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
                                    <td className="py-4 px-6 text-[#111827] font-semibold text-lg text-center">
                                        {row.newMeetingCount || 0}
                                    </td>
                                    <td className="py-4 px-6 text-[#111827] font-semibold text-lg text-center">
                                        {row.oldMeetingCount || 0}
                                    </td>
                                    <td className="py-4 px-6 text-[#6B7280] font-medium text-lg text-center">
                                        ({row.onsite || 0})
                                    </td>
                                    <td className="py-4 px-6 font-bold text-lg text-center" style={{ backgroundColor: '#F5F3FF', color: '#111827' }}>
                                        {(row.newMeetingCount || 0) + (row.oldMeetingCount || 0)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Activities;