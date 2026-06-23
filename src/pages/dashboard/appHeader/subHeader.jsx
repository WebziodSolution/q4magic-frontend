import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { connect } from 'react-redux';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';

import { useTheme } from '@mui/material';
import { setFilterEndDate, setFilterStartDate, setHeaderTitle, setLoading, setOppSelectedTabIndex, setPerformanceSelectedTabIndex } from '../../../redux/commonReducers/commonReducers';
import CustomIcons from '../../../components/common/icons/CustomIcons';
import DatePickerComponent from '../../../components/common/datePickerComponent/datePickerComponent';
import { headerTitles, matchRoute } from '../../../service/common/commonService';

const RANGE_TYPES = [
    { id: "week", label: "Week" },
    { id: "month", label: "Month" },
    { id: "quarter", label: "Quarter" },
    { id: "ytd", label: "Year to Date" },
    { id: "custom", label: "Custom Date Range" },
]

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"]

/** ---------------- Date helpers (no libs) ---------------- */
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1)
const startOfYear = (d) => new Date(d.getFullYear(), 0, 1)
const startOfQuarter = (year, quarterIndex0Based) => new Date(year, quarterIndex0Based * 3, 1)
const endOfQuarter = (year, quarterIndex0Based) => new Date(year, quarterIndex0Based * 3 + 3, 0)

function getPreviousWorkWeekMonFri(today = new Date()) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const day = d.getDay()
    const currentWeekMonday = new Date(d)
    if (day === 0) currentWeekMonday.setDate(d.getDate() - 6)
    else currentWeekMonday.setDate(d.getDate() - (day - 1))
    const prevMonday = new Date(currentWeekMonday)
    prevMonday.setDate(currentWeekMonday.getDate() - 7)
    const prevFriday = new Date(prevMonday)
    prevFriday.setDate(prevMonday.getDate() + 4)
    return { start: prevMonday, end: prevFriday }
}

const SubHeader = ({ headerTitle, setHeaderTitle, setFilterStartDate, setFilterEndDate, setPerformanceSelectedTabIndex, performanceSelectedTabIndex, oppSelectedTabIndex, setOppSelectedTabIndex, }) => {
    const theme = useTheme()
    const locaiton = useLocation()
    const currentPath = locaiton?.pathname

    const [rangeType, setRangeType] = useState("quarter")
    const [quarter, setQuarter] = useState("Q1")
    const [isOpen, setIsOpen] = useState(false)
    const popoverRef = useRef(null)
    const triggerRef = useRef(null)

    const { control, watch, setValue } = useForm({
        defaultValues: {
            startDate: null,
            endDate: null,
        },
    })

    const startDate = watch("startDate")
    const endDate = watch("endDate")

    const rangeLabel = useMemo(() => {
        if (rangeType === "quarter") return quarter
        return RANGE_TYPES.find((r) => r.id === rangeType)?.label || "Week"
    }, [rangeType, quarter])

    const applyPresetRange = (type, q = quarter) => {
        const today = new Date()
        if (type === "week") {
            const { start, end } = getPreviousWorkWeekMonFri(today)
            setValue("startDate", start)
            setValue("endDate", end)
            return
        }
        if (type === "month") {
            setValue("startDate", startOfMonth(today))
            setValue("endDate", today)
            return
        }
        if (type === "ytd") {
            setValue("startDate", startOfYear(today))
            setValue("endDate", today)
            return
        }
        if (type === "quarter") {
            const qi = Math.max(0, QUARTERS.indexOf(q))
            setValue("startDate", startOfQuarter(today.getFullYear(), qi))
            setValue("endDate", endOfQuarter(today.getFullYear(), qi))
            return
        }
        if (type === "custom") {
            setValue("startDate", new Date())
            setValue("endDate", new Date())
        }
    }

    const handleSelectRangeType = (id) => setRangeType(id)
    const handleQuarterChange = (q) => {
        setQuarter(q)
        setRangeType("quarter")
    }

    useEffect(() => {
        applyPresetRange(rangeType, quarter)
    }, [rangeType, quarter])

    useEffect(() => {
        if (!isOpen) return;
        const isClickInsideDatePickerPortal = (target) => {
            const el = target instanceof Element ? target : null;
            if (!el) return false;
            return Boolean(
                el.closest(".MuiPickersPopper-root") ||
                el.closest(".MuiPopover-root") ||
                el.closest(".MuiDialog-root") ||
                el.closest(".MuiModal-root") ||
                el.closest(".MuiPaper-root")
            );
        };
        const onDocClickCapture = (e) => {
            const pop = popoverRef.current;
            const trg = triggerRef.current;
            if (isClickInsideDatePickerPortal(e.target)) return;
            if (pop?.contains(e.target)) return;
            if (trg?.contains(e.target)) return;
            setIsOpen(false);
        };
        const onKey = (e) => {
            if (e.key === "Escape") {
                setIsOpen(false);
                triggerRef.current?.querySelector?.("button")?.focus?.();
            }
        };
        document.addEventListener("click", onDocClickCapture, true);
        document.addEventListener("keydown", onKey, true);
        return () => {
            document.removeEventListener("click", onDocClickCapture, true);
            document.removeEventListener("keydown", onKey, true);
        };
    }, [isOpen]);

    useEffect(() => {
        const today = new Date()
        const month = today.getMonth()
        const qIndex = Math.floor(month / 3)
        const currentQuarter = QUARTERS[qIndex] || "Q1"
        setQuarter(currentQuarter)
        setRangeType("quarter")
        applyPresetRange("quarter", currentQuarter)
    }, [])

    useEffect(() => {
        const matched = headerTitles.find((h) => matchRoute(h.path, currentPath))
        if (matched) setHeaderTitle(matched.title)
    }, [currentPath, setHeaderTitle])

    useEffect(() => {
        if (startDate && endDate) {
            setFilterStartDate(dayjs(startDate).format("MM/DD/YYYY"))
            setFilterEndDate(dayjs(endDate).format("MM/DD/YYYY"))
        }
    }, [startDate, endDate])

    return (
        <header className={`w-full full bg-[linear-gradient(90deg,#5B21B6_0%,#8d53e8_45%,#b698ea_100%)] z-30 relative ${currentPath?.includes("performance") || locaiton?.pathname.includes("opportunity-view") || locaiton?.pathname?.includes("deals") ? "pb-4" : ""} `} style={{ borderColor: theme.palette.secondary.main }}>
            {/* Using grid-cols-3 to force exact centering of the middle element */}
            <div className="grid grid-cols-3 items-start px-6 py-2 lg:py-3">

                {/* 1. Left Section (Logo) */}
                <div className="flex justify-start">
                    <button
                        type="button"
                        aria-haspopup="menu"
                        className="flex items-center gap-2 bg-[#44288E] text-white px-4 py-1 rounded-md transition min-w-[120px] justify-between"
                    >
                        <span className="text-lg font-medium">Team</span>
                        <CustomIcons iconName={"fa-solid fa-chevron-down"} css={"text-sm opacity-80"} />
                    </button>
                </div>

                {/* 2. Center Section (Title) */}
                <div className="flex justify-center text-center">
                    <p className='text-white text-3xl font-semibold whitespace-nowrap'>
                        {headerTitle}
                    </p>
                </div>

                {/* 3. Right Section (Filters & Dropdown) */}
                <div className="flex justify-end items-center gap-4">
                    <div className="relative inline-block">
                        <div ref={triggerRef} className="flex items-center gap-4">
                            <button
                                type="button"
                                aria-haspopup="menu"
                                aria-expanded={isOpen ? "true" : "false"}
                                onClick={() => setIsOpen((s) => !s)}
                                className="flex items-center gap-2 bg-[#44288E] text-white px-4 py-1 rounded-md transition min-w-[120px] justify-between"
                            >
                                <span className="text-lg font-medium">{rangeLabel}</span>
                                <CustomIcons iconName={"fa-solid fa-chevron-down"} css={"text-sm opacity-80"} />
                            </button>
                        </div>

                        {isOpen && (
                            <div
                                ref={popoverRef}
                                className="absolute right-0 mt-2 z-50 w-72 sm:w-[360px] rounded-lg border border-gray-200 bg-white shadow-xl overflow-hidden"
                                role="menu"
                            >
                                <div className="flex items-center justify-end px-3 py-2 border-b bg-white">
                                    <button
                                        type="button"
                                        className="h-8 w-8 rounded-md hover:bg-gray-100 flex items-center justify-center"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <CustomIcons iconName={"fa-solid fa-xmark"} css={"text-gray-700 text-lg"} />
                                    </button>
                                </div>

                                <div className="py-1">
                                    {RANGE_TYPES.map((o) => {
                                        const selected = rangeType === o.id
                                        return (
                                            <button
                                                key={o.id}
                                                type="button"
                                                className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left group/item hover:bg-[#44288E] hover:text-white ${selected ? "bg-[#44288E]" : "bg-white"}`}
                                                onClick={() => handleSelectRangeType(o.id)}
                                            >
                                                <span className={`${selected ? "text-white font-medium" : "text-gray-700 group-hover/item:text-white"}`}>
                                                    {o.label}
                                                </span>
                                            </button>
                                        )
                                    })}
                                </div>

                                {rangeType === "quarter" && (
                                    <div className="px-4 py-3 border-t bg-white">
                                        <label className="flex items-center justify-between gap-2">
                                            <span className="text-sm text-gray-700">Quarter</span>
                                            <select
                                                className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm focus:outline-none"
                                                value={quarter}
                                                onChange={(e) => handleQuarterChange(e.target.value)}
                                            >
                                                {QUARTERS.map((q) => (
                                                    <option key={q} value={q}>{q}</option>
                                                ))}
                                            </select>
                                        </label>
                                    </div>
                                )}

                                <div className="px-4 py-3 border-t bg-white">
                                    <div className="grid grid-cols-2 gap-3">
                                        <DatePickerComponent setValue={setValue} control={control} name="startDate" label="Start Date" />
                                        <DatePickerComponent
                                            setValue={setValue}
                                            control={control}
                                            name="endDate"
                                            label="End Date"
                                            minDate={watch("startDate")}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {
                currentPath?.includes("performance") && (
                    <div className="flex justify-center items-center absolute inset-x-0 -bottom-5">
                        <button
                            onClick={() => setPerformanceSelectedTabIndex(0)}
                            className={`px-6 py-1.5 text-[18px] font-medium transition-colors border rounded-tl-md rounded-bl-md ${performanceSelectedTabIndex === 0
                                ? 'bg-[#44288E] text-white border-[#44288E]'
                                : 'bg-[#D9C6F5] text-black border-transparent'
                                }`}
                        >
                            Activity
                        </button>
                        <button
                            onClick={() => setPerformanceSelectedTabIndex(1)}
                            className={`px-6 py-1.5 text-[18px] font-medium transition-colors border rounded-tr-md rounded-br-md ${performanceSelectedTabIndex === 1
                                ? 'bg-[#44288E] text-white border-[#44288E]'
                                : 'bg-[#D9C6F5] text-black border-transparent'
                                }`}
                        >
                            Results
                        </button>
                    </div>
                )
            }

            {
                (currentPath?.includes("opportunity-view") || currentPath?.includes("deals")) && (
                    <div className="flex justify-center items-center absolute inset-x-0 -bottom-5">
                        <button
                            onClick={() => setOppSelectedTabIndex(0)}
                            className={`px-6 py-1.5 text-[18px] font-medium transition-colors border rounded-tl-md rounded-bl-md ${oppSelectedTabIndex === 0
                                ? 'bg-[#44288E] text-white border-[#44288E]'
                                : 'bg-[#D9C6F5] text-black border-transparent'
                                }`}
                        >
                            Opp360
                        </button>
                        <button
                            onClick={() => setOppSelectedTabIndex(1)}
                            className={`px-6 py-1.5 text-[18px] font-medium transition-colors border border-l-[#44288E] border-r-[#44288E] ${oppSelectedTabIndex === 1
                                ? 'bg-[#44288E] text-white border-[#44288E]'
                                : 'bg-[#D9C6F5] text-black border-transparent'
                                }`}
                        >
                            Notes
                        </button>
                        <button
                            onClick={() => setOppSelectedTabIndex(2)}
                            className={`px-6 py-1.5 text-[18px] font-medium transition-colors border rounded-tr-md rounded-br-md ${oppSelectedTabIndex === 2
                                ? 'bg-[#44288E] text-white border-[#44288E]'
                                : 'bg-[#D9C6F5] text-black border-transparent'
                                }`}
                        >
                            Deal Docs
                        </button>
                    </div>
                )
            }
        </header>
    )
}

const mapStateToProps = (state) => ({
    loading: state.common.loading,
    headerTitle: state.common.headerTitle,
    performanceSelectedTabIndex: state.common.performanceSelectedTabIndex,
    oppSelectedTabIndex: state.common.oppSelectedTabIndex,
})

const mapDispatchToProps = {
    setLoading,
    setHeaderTitle,
    setFilterStartDate,
    setFilterEndDate,
    setPerformanceSelectedTabIndex,
    setOppSelectedTabIndex,
}

export default connect(mapStateToProps, mapDispatchToProps)(SubHeader)


// import { useEffect, useMemo, useRef, useState } from 'react';
// import { NavLink, useLocation } from 'react-router-dom';
// import { connect } from 'react-redux';
// import { useForm } from 'react-hook-form';
// import dayjs from 'dayjs';

// import { useTheme } from '@mui/material';
// import { setFilterEndDate, setFilterStartDate, setHeaderTitle, setLoading } from '../../../redux/commonReducers/commonReducers';
// import CustomIcons from '../../../components/common/icons/CustomIcons';
// import DatePickerComponent from '../../../components/common/datePickerComponent/datePickerComponent';
// import { headerTitles, matchRoute } from '../../../service/common/commonService';
// import UserDropdown from './userDropDown';

// const RANGE_TYPES = [
//     { id: "week", label: "Week" },
//     { id: "month", label: "Month" },
//     { id: "quarter", label: "Quarter" },
//     { id: "ytd", label: "Year to Date" },
//     { id: "custom", label: "Custom Date Range" },
// ]

// const QUARTERS = ["Q1", "Q2", "Q3", "Q4"]

// /** ---------------- Date helpers (no libs) ---------------- */
// const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1)
// const startOfYear = (d) => new Date(d.getFullYear(), 0, 1)
// const startOfQuarter = (year, quarterIndex0Based) => new Date(year, quarterIndex0Based * 3, 1)
// const endOfQuarter = (year, quarterIndex0Based) => new Date(year, quarterIndex0Based * 3 + 3, 0)

// /**
//  * ALWAYS previous work week (Mon–Fri) relative to today.
//  */
// function getPreviousWorkWeekMonFri(today = new Date()) {
//     const d = new Date(today.getFullYear(), today.getMonth(), today.getDate())
//     const day = d.getDay() // 0=Sun..6=Sat

//     // Monday of current week
//     const currentWeekMonday = new Date(d)
//     if (day === 0) currentWeekMonday.setDate(d.getDate() - 6) // Sunday
//     else currentWeekMonday.setDate(d.getDate() - (day - 1))

//     // Previous week Monday
//     const prevMonday = new Date(currentWeekMonday)
//     prevMonday.setDate(currentWeekMonday.getDate() - 7)

//     // Previous week Friday
//     const prevFriday = new Date(prevMonday)
//     prevFriday.setDate(prevMonday.getDate() + 4)

//     return { start: prevMonday, end: prevFriday }
// }

// const SubHeader = ({ headerTitle, setHeaderTitle, setFilterStartDate, setFilterEndDate, }) => {
//     const theme = useTheme()
//     const locaiton = useLocation()
//     const currentPath = locaiton?.pathname

//     // Date range dropdown state
//     const [rangeType, setRangeType] = useState("quarter") // default Week
//     const [quarter, setQuarter] = useState("Q1")
//     const [isOpen, setIsOpen] = useState(false)
//     const popoverRef = useRef(null)
//     const inputRef = useRef(null)
//     const triggerRef = useRef(null)

//     const { control, watch, setValue } = useForm({
//         defaultValues: {
//             startDate: null,
//             endDate: null,
//         },
//     })

//     const startDate = watch("startDate")
//     const endDate = watch("endDate")

//     const rangeLabel = useMemo(() => {
//         if (rangeType === "quarter") return quarter
//         return RANGE_TYPES.find((r) => r.id === rangeType)?.label || "Week"
//     }, [rangeType, quarter])

//     const applyPresetRange = (type, q = quarter) => {
//         const today = new Date()

//         if (type === "week") {
//             const { start, end } = getPreviousWorkWeekMonFri(today)
//             setValue("startDate", start)
//             setValue("endDate", end)
//             return
//         }

//         if (type === "month") {
//             setValue("startDate", startOfMonth(today))
//             setValue("endDate", today)
//             return
//         }

//         if (type === "ytd") {
//             setValue("startDate", startOfYear(today))
//             setValue("endDate", today)
//             return
//         }

//         if (type === "quarter") {
//             const qi = Math.max(0, QUARTERS.indexOf(q))
//             setValue("startDate", startOfQuarter(today.getFullYear(), qi))
//             setValue("endDate", endOfQuarter(today.getFullYear(), qi))
//             return
//         }

//         if (type === "custom") {
//             // Reset for user selection
//             setValue("startDate", new Date())
//             setValue("endDate", new Date())
//         }
//     }

//     const handleSelectRangeType = (id) => {
//         setRangeType(id)
//     }

//     const handleQuarterChange = (q) => {
//         setQuarter(q)
//         setRangeType("quarter")
//     }

//     // apply whenever option changes
//     useEffect(() => {
//         applyPresetRange(rangeType, quarter)
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [rangeType, quarter])

//     // Close popover on outside click + Esc
//     useEffect(() => {
//         if (!isOpen) return;

//         const isClickInsideDatePickerPortal = (target) => {
//             // MUI date picker renders calendar in a portal with these common roots/classes
//             const el = target instanceof Element ? target : null;
//             if (!el) return false;

//             // Check if click happened inside MUI Popper / Dialog / Paper used by DatePicker
//             return Boolean(
//                 el.closest(".MuiPickersPopper-root") ||
//                 el.closest(".MuiPopover-root") ||
//                 el.closest(".MuiDialog-root") ||
//                 el.closest(".MuiModal-root") ||
//                 el.closest(".MuiPaper-root")
//             );
//         };

//         const onDocClickCapture = (e) => {
//             const pop = popoverRef.current;
//             const trg = triggerRef.current;

//             // If click is in the calendar popup (portal), don't close
//             if (isClickInsideDatePickerPortal(e.target)) return;

//             // If click is inside popover or trigger, don't close
//             if (pop?.contains(e.target)) return;
//             if (trg?.contains(e.target)) return;

//             setIsOpen(false);
//         };

//         const onKey = (e) => {
//             if (e.key === "Escape") {
//                 setIsOpen(false);
//                 // focus the icon button (first focusable inside trigger)
//                 triggerRef.current?.querySelector?.("button")?.focus?.();
//             }
//         };

//         // Use click (not mousedown) so date picker can process selection first
//         document.addEventListener("click", onDocClickCapture, true);
//         document.addEventListener("keydown", onKey, true);

//         return () => {
//             document.removeEventListener("click", onDocClickCapture, true);
//             document.removeEventListener("keydown", onKey, true);
//         };
//     }, [isOpen]);

//     useEffect(() => {
//         const today = new Date()
//         const month = today.getMonth() // 0–11
//         const qIndex = Math.floor(month / 3) // 0–3
//         const currentQuarter = QUARTERS[qIndex] || "Q1"

//         setQuarter(currentQuarter)
//         setRangeType("quarter")
//         applyPresetRange("quarter", currentQuarter)

//         const handleKeyDown = (event) => {
//             if ((event.metaKey || event.ctrlKey) && event.key === "k") {
//                 event.preventDefault()
//                 inputRef.current?.focus()
//             }
//         }

//         document.addEventListener("keydown", handleKeyDown)
//         return () => document.removeEventListener("keydown", handleKeyDown)
//     }, [])

//     useEffect(() => {
//         const matched = headerTitles.find((h) =>
//             matchRoute(h.path, currentPath)
//         )

//         if (matched) {
//             setHeaderTitle(matched.title)
//         }
//     }, [currentPath, setHeaderTitle])

//     useEffect(() => {
//         if (startDate && endDate) {
//             setFilterStartDate(dayjs(startDate).format("MM/DD/YYYY"))
//             setFilterEndDate(dayjs(endDate).format("MM/DD/YYYY"))
//         }
//     }, [startDate, endDate])
//     //  bg-gradient-to-r from-[#4972E5] to-[#527EF4]
//     //bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600
//     // bg-gradient-to-r from-[#2c5ebd] via-[#4a80ed] to-[#2e5ec1]
//     return (
//         <header className="w-full bg-gradient-to-r from-[#1B3B89] via-[#4a80ed] to-[#1B3B89] z-50" style={{ borderColor: theme.palette.secondary.main }}>
//             <div className="flex justify-between items-center px-6 py-2 lg:py-1">
//                 <div className="hidden lg:flex justify items-center gap-8">
//                     <div className="flex items-center">
//                         <NavLink to={"/dashboard"}>
//                             <img src="/images/logo/360Pipe_logo_white.png" alt="360Pipe Logo" className="h-[50px] my-1 w-36" />
//                         </NavLink>
//                     </div>
//                 </div>

//                 <div>
//                     <p className='text-white text-3xl font-semibold lg:mr-12'>
//                         {headerTitle}
//                     </p>
//                 </div>

//                 {/* Date Range Dropdown (new UI) */}
//                 <div className="relative inline-block">
//                     {/* Label + Filter Icon (OPEN ONLY on icon click) */}
//                     <div ref={triggerRef} className="flex items-center gap-4">
//                         <button
//                             type="button"
//                             aria-haspopup="menu"
//                             aria-expanded={isOpen ? "true" : "false"}
//                             aria-label="Open date range filters"
//                             title="Filter"
//                             onClick={() => setIsOpen((s) => !s)}
//                             onKeyDown={(e) => {
//                                 if (e.key === "Enter" || e.key === " ") {
//                                     e.preventDefault()
//                                     setIsOpen((s) => !s)
//                                 }
//                             }}
//                             className="flex items-center gap-2 bg-blue-900/70 text-white px-4 py-1 border border-white/30 hover:bg-blue-900 transition"
//                         >
//                             <span className="text-lg font-medium">{rangeLabel}</span>
//                             <CustomIcons iconName={"fa-solid fa-chevron-down"} css={"text-sm opacity-80"} />
//                         </button>
//                         {/* <span className="select-none text-white text-2xl font-semibold border border-white/50 rounded-md px-3 py-1">
//                             {rangeLabel}
//                         </span> */}

//                         {/* <button
//                             type="button"
//                             aria-haspopup="menu"
//                             aria-expanded={isOpen ? "true" : "false"}
//                             aria-label="Open date range filters"
//                             title="Filter"
//                             className="h-9 w-9 rounded-md bg-white/15 hover:bg-white/25 active:bg-white/30 flex items-center justify-center"
//                             onClick={() => setIsOpen((s) => !s)}
//                             onKeyDown={(e) => {
//                                 if (e.key === "Enter" || e.key === " ") {
//                                     e.preventDefault()
//                                     setIsOpen((s) => !s)
//                                 }
//                             }}
//                         >
//                             <CustomIcons iconName={"fa-solid fa-filter"} css={"text-white text-sm"} />
//                         </button> */}

//                         <div className="z-30">
//                             <UserDropdown />
//                         </div>
//                     </div>

//                     {isOpen && (
//                         <div
//                             ref={popoverRef}
//                             className="absolute right-0 mt-2 z-50 w-72 sm:w-[360px] rounded-lg border border-gray-200 bg-white shadow-xl overflow-hidden"
//                             role="menu"
//                             aria-label="Date range menu"
//                         >
//                             {/* Header */}
//                             <div className="flex items-center justify-end px-3 py-2 border-b bg-white">
//                                 <button
//                                     type="button"
//                                     className="h-8 w-8 rounded-md hover:bg-gray-100 flex items-center justify-center"
//                                     onClick={() => setIsOpen(false)}
//                                     title="Close"
//                                     aria-label="Close date range menu"
//                                 >
//                                     <CustomIcons iconName={"fa-solid fa-xmark"} css={"text-gray-700 text-lg"} />
//                                 </button>
//                             </div>

//                             {/* Options */}
//                             <div className="py-1">
//                                 {RANGE_TYPES.map((o) => {
//                                     const selected = rangeType === o.id
//                                     return (
//                                         <button
//                                             key={o.id}
//                                             type="button"
//                                             className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left hover:bg-gray-50 ${selected ? "bg-blue-50" : "bg-white"
//                                                 }`}
//                                             role="menuitemradio"
//                                             aria-checked={selected ? "true" : "false"}
//                                             onClick={() => handleSelectRangeType(o.id)}
//                                         >
//                                             <span className={`${selected ? "text-blue-700 font-medium" : "text-gray-700"}`}>
//                                                 {o.label}
//                                             </span>
//                                         </button>
//                                     )
//                                 })}
//                             </div>

//                             {/* Quarter selector */}
//                             {rangeType === "quarter" && (
//                                 <div className="px-4 py-3 border-t bg-white">
//                                     <label className="flex items-center justify-between gap-2">
//                                         <span className="text-sm text-gray-700">Quarter</span>
//                                         <select
//                                             className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm focus:outline-none"
//                                             value={quarter}
//                                             onChange={(e) => handleQuarterChange(e.target.value)}
//                                         >
//                                             {QUARTERS.map((q) => (
//                                                 <option key={q} value={q}>
//                                                     {q}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                     </label>
//                                 </div>
//                             )}

//                             {/* Dates */}
//                             <div className="px-4 py-3 border-t bg-white">
//                                 <div className="grid grid-cols-2 gap-3">
//                                     <DatePickerComponent setValue={setValue} control={control} name="startDate" label="Start Date" />
//                                     <DatePickerComponent
//                                         setValue={setValue}
//                                         control={control}
//                                         name="endDate"
//                                         label="End Date"
//                                         minDate={watch("startDate")}
//                                     />
//                                 </div>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </header>
//     )
// }

// const mapStateToProps = (state) => ({
//     loading: state.common.loading,
//     headerTitle: state.common.headerTitle,
// })

// const mapDispatchToProps = {
//     setLoading,
//     setHeaderTitle,
//     setFilterStartDate,
//     setFilterEndDate,
// }

// export default connect(mapStateToProps, mapDispatchToProps)(SubHeader)
