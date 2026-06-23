import React, { useEffect, useRef, useState } from "react";
import CustomIcons from "../../../components/common/icons/CustomIcons";

// Real API services
import {
    deleteTodo as deleteTodoApi,
    completeTodo,
    getTodoByTeam,
} from "../../../service/todo/todoService";
import {
    getAllTodosNotes,
    createTodoNote as createTodoNoteApi,
    updateTodoNote as updateTodoNoteApi,
    deleteTodoNote as deleteTodoNoteApi,
} from "../../../service/todoNote/todoNoteService";


// Shared modal for add / edit
import AddTodo from "../../../components/models/todo/addTodo";
import AlertDialog from "../../../components/common/alertDialog/alertDialog";
import { Tooltip } from "@mui/material";
import Components from "../../../components/muiComponents/components";
import { setAlert, setHeaderTitle } from "../../../redux/commonReducers/commonReducers";
import { connect } from "react-redux";
import { sendTaskReminder } from "../../../service/todoAssign/todoAssignService";
import Button from "../../../components/common/buttons/button";
import { getAllTeams } from "../../../service/teamDetails/teamDetailsService";
import CheckBoxSelect from "../../../components/common/select/checkBoxSelect";
import { NavLink, useLocation } from "react-router-dom";
import { getUserDetails } from "../../../utils/getUserDetails";
import Select from "../../../components/common/select/select";

// ----------------------------------------------------------------------
// Date & priority helpers (from real version)
// ----------------------------------------------------------------------
const formatDueShort = (iso) => {
    if (!iso) return "TBD";

    // Split the string manually to avoid any hidden timezone parsing
    const [year, month, day] = iso.split('-');
    if (!year || !month || !day) return iso;

    return `${parseInt(month)}/${day}`;
};

const formatDueLong = (iso) => {
    if (!iso) return "TBD";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
};

const formatNoteDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const m = d.getMonth() + 1;
    const day = d.getDate();
    return `${m}/${day}`;
};

const normalizeIsoDate = (v) => {
    if (!v) return "";

    // If it's already YYYY-MM-DD, just return it
    if (/^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);

    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "";

    // Extract local parts to prevent the "previous day" shift
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const priorityIntToLabel = (p) => {
    if (p === 1) return "Critical";
    if (p === 2) return "High";
    return "Normal";
};

const getCurrentUser = () => {
    try {
        const raw = localStorage.getItem("user") || localStorage.getItem("userData") || localStorage.getItem("profile");
        if (!raw) return {};
        return JSON.parse(raw) || {};
    } catch {
        return {};
    }
};

const status = [
    { id: 1, title: "Open Action" },
    { id: 2, title: "Completed" },
    { id: 3, title: "All" },
];

// ----------------------------------------------------------------------
// TodoScreen
// ----------------------------------------------------------------------
const Todo = ({ setAlert, setHeaderTitle }) => {
    const userData = getUserDetails();
    const locaiton = useLocation()
    // --- Refs for note auto-save (from copy) ---
    const noteInputRef = useRef(null);
    const noteInputWrapRef = useRef(null);

    // --- Data from API ---
    const [tasks, setTasks] = useState([]);
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState(1);

    const [selectedTask, setSelectedTask] = useState(null);

    // --- Notes state (from real version) ---
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [newNoteInput, setNewNoteInput] = useState("");

    // --- Modal state for AddTodo (from real version) ---
    const [addTodoOpen, setAddTodoOpen] = useState(false);
    const [editingTodoId, setEditingTodoId] = useState(null);

    const [todoId, setTodoId] = useState(null);
    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [closeTodoDialog, setCloseTodoDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });

    // ------------------------------------------------------------------
    // Mapping helpers (API ⇔ UI)
    // ------------------------------------------------------------------
    const mapApiAttachmentsToUiMaterials = (todoAttachmentsDtos = []) => {
        return (todoAttachmentsDtos || [])
            .filter(Boolean)
            .map((a) => {
                const isLink = (a.type || "").toLowerCase() === "link";
                if (isLink) {
                    return {
                        type: "link",
                        id: a.id,
                        name: a.linkName || a.fileName || "Link",
                        url: a.link || "",
                    };
                }
                return {
                    type: "file",
                    id: a.id,
                    name: a.fileName || a.imageName || "Attachment",
                    url: a.path || "",
                };
            });
    };

    const mapApiTodoToUi = (t) => {
        const relatedTo = t?.relatedTo;
        const due = normalizeIsoDate(t?.dueDate);
        const todoAssignData = t?.todoAssignData || [];
        const totalAssignees = todoAssignData.length;
        const completedAssignees = todoAssignData.filter(a => a.complectedWork === 100).length;
        const completionProgress = todoAssignData?.filter(a => a.complectedWork > 0 && a.complectedWork >= 100).length;
        const completionProgressPercent =
            totalAssignees > 0
                ? Math.round((completedAssignees / totalAssignees) * 100)
                : 0;

        const statusColor =
            completionProgress === 0
                ? "#D7D8F4"
                : (completedAssignees === totalAssignees ? "#44288E" : "#EED5B9");

        // ✅ Date-only comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dueDateObj = t?.dueDate ? new Date(t.dueDate) : null;
        if (dueDateObj) {
            dueDateObj.setHours(0, 0, 0, 0);
        }

        const isOverdue = dueDateObj ? dueDateObj < today : false;
        const isDueToday = dueDateObj ? dueDateObj.getTime() === today.getTime() : false;
        const isDueFuture = dueDateObj ? dueDateObj > today : false;

        return {
            id: t?.id,
            relatedTo: relatedTo,
            title: t?.task || "",
            desc: t?.description || "",
            dueDate: due,
            priority: (
                typeof t?.priority === "number"
                    ? priorityIntToLabel(t.priority)
                    : (t?.priorityLabel || "Normal")
            ).toLowerCase(),
            materials: mapApiAttachmentsToUiMaterials(t?.todoAttachmentsDtos || t?.images || []),
            notes: [],
            assignedBy: t?.assignedByName || t?.assignedBy || "",
            team: t?.team || "",
            createdDate: t?.createdDate || "",
            assignees: t?.assignees || [],
            totalAssignees,
            completedAssignees,
            statusColor,
            completionProgressPercent,
            createdBy: t?.createdBy,
            createdByName: t?.createdByName,
            teamName: t?.teamName,
            todoAssignData,

            isOverdue,
            isDueToday,
            isDueFuture
        };
    };
    // ------------------------------------------------------------------
    // Data fetching
    // ------------------------------------------------------------------

    const refreshNotes = async (todoId, baseTask = null) => {
        if (!todoId) return;
        try {
            const res = await getAllTodosNotes(todoId);
            const list = res?.result || res?.data || res || [];
            const notesUi = (Array.isArray(list) ? list : []).map((n) => ({
                id: n?.id,
                text: n?.note || "",
                createdOn: n?.createdAt || n?.createdOn || "",
                todoId: n?.todoId,
            }));

            setSelectedTask((prev) => {
                const next = { ...(baseTask || prev), notes: notesUi };
                return next;
            });
            setTasks((prev) =>
                (prev || []).map((t) => (t.id === todoId ? { ...t, notes: notesUi } : t))
            );
        } catch (e) {
            console.error("refreshNotes error:", e);
        }
    };

    const handleGetAllTeams = async () => {
        const res = await getAllTeams();
        const data = res?.result?.map((t) => ({ id: t.id, title: t.name })) || [];
        setTeams(data);
    }

    const handleTeamChange = async (event, newValue) => {
        setSelectedTeam(newValue);
    }

    const handleGetTodoByTeam = async () => {
        const teamIds = selectedTeam?.map(t => t.id) || [];
        const res = await getTodoByTeam({ teamIds, status: status?.find(s => s.id === selectedStatus)?.title === "Open Action" ? "Pending" : status?.find(s => s.id === selectedStatus)?.title || "" });
        const uiTodos = (Array.isArray(res?.result) ? res.result : []).map(mapApiTodoToUi);
        setTasks(uiTodos);
    }

    useEffect(() => {
        if (locaiton.pathname === "/dashboard/todos") {
            const title = userData?.roleName?.toUpperCase() === "SALES MANAGER" ? "Team Actions" : "My Actions"
            document.title = `${title} - 360Pipe`;

            setHeaderTitle(title)
        }
        handleGetAllTeams()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locaiton.pathname]);

    useEffect(() => {
        handleGetTodoByTeam();
    }, [selectedTeam, selectedStatus])

    const openAddModal = () => {
        setEditingTodoId(null);
        setAddTodoOpen(true);
    };

    const openEditModal = (task) => {
        setEditingTodoId(task.id);
        setAddTodoOpen(true);
    };

    const handleCloseAddTodo = () => {
        setAddTodoOpen(false);
        setEditingTodoId(null);
    };

    // ------------------------------------------------------------------
    // Notes CRUD
    // ------------------------------------------------------------------
    const stripLegacyPrefix = (s = "") => s.replace(/^\s*\d{1,2}\/\d{1,2}\s*-\s*/g, "").trim();

    const handleEditNote = (noteObj) => {
        setEditingNoteId(noteObj.id);
        setNewNoteInput(stripLegacyPrefix(noteObj.text || ""));
    };

    const handleSaveNote = async () => {
        if (!selectedTask?.id) return;

        const updatedText = newNoteInput.trim();
        if (!updatedText) {
            setEditingNoteId(null);
            setNewNoteInput("");
            return;
        }

        const user = getCurrentUser();
        const customerId = user?.customerId ?? user?.customer ?? null;

        try {
            if (editingNoteId === null) {
                // create
                const payload = {
                    id: null,
                    note: updatedText,
                    todoId: selectedTask.id,
                    customerId: customerId ?? null,
                    createdAt: null,
                };
                await createTodoNoteApi(payload);
                await refreshNotes(selectedTask.id);
                setNewNoteInput("");
            } else {
                // update
                const payload = {
                    id: editingNoteId,
                    note: updatedText,
                    todoId: selectedTask.id,
                    customerId: customerId ?? null,
                    createdAt: null,
                };
                await updateTodoNoteApi(editingNoteId, payload);
                await refreshNotes(selectedTask.id);
                setEditingNoteId(null);
                setNewNoteInput("");
            }
        } catch (e) {
            console.error("save note error:", e);
        }
    };

    const handleDeleteNote = async (noteId) => {
        if (!selectedTask?.id || !noteId) return;
        try {
            await deleteTodoNoteApi(noteId);
            await refreshNotes(selectedTask.id);
        } catch (e) {
            console.error("delete note error:", e);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSaveNote();
        } else if (e.key === "Escape") {
            setEditingNoteId(null);
            setNewNoteInput("");
        }
    };

    const handleNoteInputChange = (e) => setNewNoteInput(e.target.value);

    // Auto‑focus when editing a note
    useEffect(() => {
        if (editingNoteId !== null) {
            requestAnimationFrame(() => noteInputRef?.current?.focus?.());
        }
    }, [editingNoteId]);

    // Click‑outside auto‑save
    useEffect(() => {
        const onDocPointerDown = (e) => {
            if (!selectedTask?.id) return;
            if (editingNoteId === null && !newNoteInput.trim()) return;

            const wrap = noteInputWrapRef.current;
            if (wrap && wrap.contains(e.target)) return;

            handleSaveNote();
        };

        document.addEventListener("mousedown", onDocPointerDown, true);
        document.addEventListener("touchstart", onDocPointerDown, true);
        return () => {
            document.removeEventListener("mousedown", onDocPointerDown, true);
            document.removeEventListener("touchstart", onDocPointerDown, true);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editingNoteId, newNoteInput, selectedTask?.id]);

    const handleSendTaskReminder = async (userId, todoId, assignId) => {
        // console.log("first", userId, todoId, assignId)
        const res = await sendTaskReminder(userId, todoId, assignId);
        if (res.status === 200) {
            setAlert({
                open: true,
                message: "Reminder sent successfully",
                type: "success"
            })
        } else {
            setAlert({
                open: true,
                message: res?.message || "Failed to send reminder",
                type: "error"
            })
        }
    }

    // ------------------------------------------------------------------
    // Manager View (UI from copy, logic from real)
    // ------------------------------------------------------------------
    const ManagerView = ({ task }) => (
        <div className="flex-1 overflow-y-auto px-6 py-3 space-y-4">
            {/* Header info */}
            <div>
                {/* <div className="text-sm text-black mb-1 font-bold">Due: {formatDueLong(task.dueDate)}</div> */}
                <div className="text-sm text-black">
                    <strong>Assigned by:</strong> {task.createdByName || "N/A"} &nbsp; <strong>Team:</strong> {task.teamName || "N/A"}
                </div>
            </div>

            {/* Description */}
            <div>
                <h3 className="text-sm font-bold text-slate-800 mb-2">Description</h3>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">{task.desc}</p>
            </div>

            {/* Required Materials */}
            {task.materials && task.materials.length > 0 && (
                <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-3">Required Materials</h3>
                    <div className="space-y-2">
                        {task.materials.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm group">
                                {item.type === "link" ? (
                                    <CustomIcons iconName="fa-solid fa-link" css="text-blue-500 h-4 w-4" />
                                ) : (
                                    <CustomIcons iconName="fa-solid fa-file-pdf" css="text-red-500 h-4 w-4" />
                                )}
                                <a
                                    href={item.url || "#"}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-600 hover:underline font-medium"
                                >
                                    {item.name}
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Completion Progress */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 flex items-center">
                <h3 className="text-sm font-bold text-slate-800 w-56">Completion Progress</h3>
                <div className="flex items-center w-full gap-2">
                    <div className="flex justify-between text-sm text-slate-600 font-semibold">
                        <span>{task.completionProgressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${task.completionProgressPercent}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Assignees (if any) */}
            {task.todoAssignData && task.todoAssignData.length > 0 && (
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-800 mb-3">Team Progress</h3>
                    <div className="space-y-4">
                        {task.todoAssignData.map((assignee) => (
                            <div key={assignee.id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                        <span className="text-blue-600 font-semibold text-sm">
                                            {assignee.userName.split(' ').map(n => n[0]).join('')}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-800">{assignee.userName}</div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="flex items-center gap-1">
                                                <CustomIcons iconName={assignee.complectedWork !== 100 ? 'fa-solid fa-clock' : "fa-solid fa-circle-check"} css={`${assignee.complectedWork !== 100 ? 'text-yellow-500' : 'text-green-500'}`} />
                                                <span className={`font-medium capitalize ${assignee.complectedWork !== 100 ? 'text-yellow-500' : 'text-green-500'}`}>{assignee.complectedWork !== 100 ? "Pending" : "Complected"}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {/* <div>
                                    {
                                        assignee.complectedWork !== 100 && (
                                            <Button
                                                onClick={() => handleSendTaskReminder(assignee.userId, task.id, assignee.id)}
                                                text={"Send Reminder"}
                                                useFor="error"
                                            />
                                        )
                                    }
                                </div> */}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 justify-end">
                <Button
                    useFor="success"
                    onClick={() => openEditModal(task)}
                    text={'Edit Task'}
                />

                <Button
                    disabled={task?.completionProgressPercent === 100}
                    onClick={() => handleOpenCloseTodoDialog(task.id)}
                    text={"Close Task"}
                />
            </div>
        </div>
    );

    const handleOpenDeleteDialog = (todoId) => {
        setTodoId(todoId);
        setDialog({ open: true, title: 'Delete Todo', message: 'Are you sure! Do you want to delete this todo?', actionButtonText: 'yes' });
    }

    const handleCloseDeleteDialog = () => {
        setTodoId(null);
        setDialog({ open: false, title: '', message: '', actionButtonText: '' });
    }

    const handleDeleteTodo = async () => {
        const res = await deleteTodoApi(todoId);
        if (res.status === 200) {
            handleGetTodoByTeam()
            handleCloseDeleteDialog();
        } else {
            setAlert({
                open: true,
                message: res?.message || "Failed to delete todo",
                type: "error"
            });
        }
    }

    const StatusPill = ({ task }) => {
        const completed = task?.completedAssignees || 0;
        const total = task?.totalAssignees || 0;
        const bg = task?.statusColor || "#E5E7EB";
        const pendingAssignees = task?.todoAssignData?.filter(a => a.complectedWork !== 100) || [];

        const pillContent = (
            <div className="flex justify-center py-2 cursor-pointer">
                <div
                    className="inline-flex items-center justify-center rounded-full px-5 py-1.5 text-sm font-semibold"
                    style={{
                        backgroundColor: bg,
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.65)",
                    }}
                >
                    <span className={`${completed === total ? "text-white" : "text-black"} opacity-90`}>
                        {completed} / {total} Complete
                    </span>
                </div>
            </div>
        );

        if (pendingAssignees.length === 0) {
            return pillContent;
        }

        const tooltipContent = (
            <div className="bg-white rounded-md p-3 w-64 shadow-md text-left font-sans">
                <h4 className="text-[15px] font-semibold text-slate-700 mb-2 px-1">Pending</h4>

                <div className="flex flex-col">
                    {pendingAssignees.map((a, index) => (
                        <div
                            key={a.id || index}
                            className="flex items-start gap-3 py-3 border-t border-slate-200/60"
                        >
                            {/* Avatar & Status Badge */}
                            <div className="relative shrink-0">
                                <img
                                    src={a.avatar || `https://ui-avatars.com/api/?name=${a.userName}&background=c7d2fe&color=3730a3`}
                                    alt={a.userName}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                {/* Example dynamic badge based on user state (replace with your logic) */}
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center bg-yellow-500">
                                    {/* Optional small icon inside badge */}
                                </div>
                            </div>

                            {/* User Details */}
                            <div className="flex flex-col flex-1 gap-1">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold text-slate-700">
                                        {a.userName}
                                    </span>
                                    <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                                        {/* Clock Icon */}
                                        <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5 text-slate-400">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Pending
                                    </span>
                                </div>
                                <div className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                                    {/* Minus Circle Icon */}
                                    <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5 text-indigo-400">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Pending
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );

        return (
            <Tooltip
                title={tooltipContent}
                arrow
                placement="bottom"
                slotProps={{
                    tooltip: {
                        sx: {
                            // 1. Set the background to white to match your card
                            backgroundColor: 'white',
                            // 2. Remove default padding so your card fits perfectly
                            padding: 0,
                            maxWidth: 'none',
                        }
                    },
                    arrow: {
                        sx: {
                            // 5. Make the arrow white to match the tooltip body
                            color: 'gray',
                            // 6. Optional: add a slight drop shadow to the arrow itself
                            "&::before": {
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            },
                        }
                    }
                }}
            >
                {pillContent}
            </Tooltip>
        );
    };

    const handleOpenCloseTodoDialog = (todoId) => {
        setTodoId(todoId);
        setCloseTodoDialog({ open: true, title: 'Close Todo', message: 'Are you sure! Do you want to close this todo?', actionButtonText: 'yes' });
    }

    const handleCloseCloseTodoDialog = () => {
        setTodoId(null);
        setCloseTodoDialog({ open: false, title: '', message: '', actionButtonText: '' });
    }

    const handleCompleteTodo = async () => {
        if (todoId) {
            const res = await completeTodo(todoId);
            if (res.status === 200) {
                handleGetTodoByTeam(null)
                setAlert({
                    open: true,
                    message: "Task closed successfully",
                    type: "success"
                })
                handleCloseCloseTodoDialog()
            } else {
                setAlert({
                    open: true,
                    message: res?.message || "Failed to close task",
                    type: "error"
                })
            }
        }
    }

    // ------------------------------------------------------------------
    // Render (UI from copy, adapted with real state & handlers)
    // ------------------------------------------------------------------
    return (
        <>
            <div className="max-w-7xl mx-auto flex gap-6 h-[80vh] mb-2">
                <div
                    className={`bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col transition-all duration-300 ${selectedTask ? "w-2/3" : "w-full"
                        }`}
                >
                    <div className="p-4 flex items-center justify-between rounded-t-xl">
                        <div className="flex items-center gap-3">
                            <div>
                                <div className='w-60'>
                                    <Select
                                        options={status}
                                        placeholder="Select status"
                                        value={selectedStatus}
                                        onChange={(_, newValue) => {
                                            if (newValue?.id) {
                                                setSelectedStatus(newValue.id);
                                            } else {
                                                setSelectedStatus(null);
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className='w-60'>
                                    <CheckBoxSelect
                                        placeholder="Select teams"
                                        options={teams || []}
                                        value={selectedTeam}
                                        onChange={handleTeamChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <Button
                                onClick={openAddModal}
                                text={'New Task'}
                                startIcon={<CustomIcons iconName="fa-solid fa-plus" css="h-4 w-4" />}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-white z-10">
                                <tr style={{ backgroundColor: '#EDE9FE' }}>
                                    <th className="py-4 px-6 font-semibold text-[0.875rem] leading-[1.25rem] tracking-wider uppercase text-left" style={{ color: '#5B21B6' }}>Action Item</th>
                                    <th className="py-4 px-6 font-semibold text-[0.875rem] leading-[1.25rem] tracking-wider uppercase text-right" style={{ color: '#5B21B6' }}>Due</th>
                                    {
                                        userData?.roleName?.toLowerCase() === "sales manager" && (
                                            <th className="py-4 px-6 font-semibold text-[0.875rem] leading-[1.25rem] tracking-wider uppercase text-center" style={{ color: '#5B21B6' }}>Status</th>
                                        )
                                    }
                                    <th className="py-4 px-6 font-semibold text-[0.875rem] leading-[1.25rem] tracking-wider uppercase text-center" style={{ color: '#5B21B6' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks?.length > 0 ? tasks?.map((task, index) => {
                                    const isSelected = selectedTask && selectedTask.id === task.id;
                                    const isLastRow = index === (tasks?.length || 0) - 1;
                                    return (
                                        <tr
                                            key={task.id}
                                            onClick={async () => {
                                                setSelectedTask(task);
                                                setNewNoteInput("");
                                                setEditingNoteId(null);
                                                await refreshNotes(task.id, task);
                                            }}
                                            style={{ borderBottom: isLastRow ? 'none' : '1px solid #F1F5F9' }}
                                            className={`cursor-pointer transition-colors hover:bg-[#F5F3FF] ${isSelected ? "bg-[#F5F3FF]" : ""}`}
                                        >
                                            <td className="px-6 py-4 align-middle">
                                                <div className="flex items-stretch">
                                                    <div className="flex items-start gap-2">
                                                        <div
                                                            className={`flex justify-center items-center gap-1 p-1 rounded-full w-5 h-5 
                                                                ${task.completionProgressPercent === 100 ? "bg-transparent w-0 h-0" :task.isOverdue
                                                                    ? "bg-red-600"
                                                                    : task.isDueToday
                                                                        ? "bg-yellow-400"
                                                                        : "bg-gray-300"
                                                                }`}
                                                        >
                                                            {task.completionProgressPercent === 100 ? null : task.isOverdue || task.isDueToday ? (
                                                                <CustomIcons iconName={"fa-solid fa-exclamation"} css={"text-white"} />
                                                            ) : null}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div>
                                                                <div className="font-bold text-slate-800 text-sm truncate">
                                                                    {task.relatedTo}
                                                                </div>
                                                                <div className={`text-slate-500 text-sm truncate ${selectedTask ? " w-60" : ""}`}>
                                                                    {task.title}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 align-middle text-right text-base text-[#111827] font-medium">
                                                {formatDueShort(task.dueDate)}
                                            </td>
                                            {
                                                userData?.roleName?.toLowerCase() === "sales manager" && (
                                                    <td className="px-6 py-4 align-middle text-center">
                                                        <StatusPill task={task} />
                                                    </td>
                                                )
                                            }


                                            <td className="px-6 py-4 align-middle flex justify-center text-sm text-slate-600 font-medium">
                                                {
                                                    task?.createdBy === userData?.userId && (
                                                        <Tooltip title="Delete" arrow>
                                                            <div className='bg-red-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                                                <Components.IconButton
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        handleOpenDeleteDialog(task.id)
                                                                    }}
                                                                >
                                                                    <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer text-white h-4 w-4' />
                                                                </Components.IconButton>
                                                            </div>
                                                        </Tooltip>
                                                    )
                                                }
                                            </td>
                                        </tr>
                                    );
                                }) :
                                    <tr>
                                        <td colSpan={4} className="px-6 py-10 text-center text-slate-400">
                                            No tasks found.
                                        </td>
                                    </tr>
                                }
                            </tbody>
                        </table>
                    </div>
                </div>

                {selectedTask && (
                    <div className="w-1/2 bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col animate-fadeIn">
                        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 mb-1">{selectedTask.relatedTo}</h2>
                                {/* <div className="text-sm text-slate-500">Due: {formatDueLong(selectedTask.dueDate)}</div> */}
                                <div className="text-sm text-black font-bold">Due: {formatDueLong(selectedTask.dueDate)}</div>
                            </div>
                            <Components.IconButton
                                onClick={() => {
                                    setSelectedTask(null);
                                    setNewNoteInput("");
                                }}
                            >
                                <CustomIcons iconName="fa-solid fa-xmark" css="text-black h-5 w-5 cursor-pointer" />
                            </Components.IconButton>
                        </div>

                        {userData?.roleName?.toLowerCase() === "sales manager" ? (
                            <ManagerView task={selectedTask} />
                        ) : (
                            <div className="flex-1 overflow-y-auto px-6 py-3 space-y-4">
                                <div>
                                    <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                                        {selectedTask.desc || "No description provided."}
                                    </p>
                                </div>

                                {selectedTask.materials && selectedTask.materials.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800 mb-3">Required Materials</h3>
                                        <div className="space-y-2">
                                            {selectedTask.materials.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-sm group">
                                                    {item.type === "link" ? (
                                                        <CustomIcons iconName="fa-solid fa-link" css="text-blue-500 h-4 w-4" />
                                                    ) : (
                                                        <CustomIcons iconName="fa-solid fa-file" css="text-red-500 h-4 w-4" />
                                                    )}
                                                    {item.type === "link" ? (
                                                        <NavLink
                                                            href={item.url || "#"}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-blue-600 hover:underline font-medium"
                                                        >
                                                            {item.name}
                                                        </NavLink>
                                                    ) : (
                                                        <p className="text-blue-600 font-medium">
                                                            {item.name}
                                                        </p>
                                                    )
                                                    }
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-sm font-bold text-slate-800">My Notes</h3>
                                    </div>

                                    <div className="space-y-3 mb-4 max-h-40 overflow-y-auto pr-2">
                                        {(selectedTask.notes || []).length > 0 ? (
                                            selectedTask.notes.map((note) => (
                                                <div key={note.id} className="flex items-start gap-2 group">
                                                    <span className="text-black font-semibold text-sm">
                                                        {formatNoteDate(note.createdOn)}
                                                    </span>
                                                    <p
                                                        className="text-slate-600 flex-1 cursor-text text-sm"
                                                        onClick={() => handleEditNote(note)}
                                                    >
                                                        {stripLegacyPrefix(note.text)}
                                                    </p>
                                                    {
                                                        selectedTask?.createdBy === userData?.userId && (
                                                            <button
                                                                onClick={() => handleDeleteNote(note.id)}
                                                                className="p-1 rounded hover:bg-red-100 transition"
                                                                title="Delete note"
                                                            >
                                                                <CustomIcons iconName="fa-solid fa-trash" css="text-red-500 h-3 w-3" />
                                                            </button>
                                                        )
                                                    }
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-slate-400 italic">No notes yet. Add your first note below.</p>
                                        )}
                                    </div>
                                </div>
                                {
                                    selectedTask?.createdBy === userData?.userId && (
                                        <div ref={noteInputWrapRef} className="my-2">
                                            <input
                                                ref={noteInputRef}
                                                type="text"
                                                value={newNoteInput}
                                                onChange={handleNoteInputChange}
                                                onKeyDown={handleKeyPress}
                                                placeholder="Type your note"
                                                className="w-full border border-slate-200 rounded p-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
                                            />
                                        </div>
                                    )
                                }
                                {
                                    selectedTask?.createdBy === userData?.userId && (
                                        <div className="flex gap-3 justify-end">
                                            <Button
                                                useFor="success"
                                                onClick={() => openEditModal(selectedTask)}
                                                text={'Edit Task'}
                                            />
                                            <Button
                                                disabled={selectedTask?.completionProgressPercent === 100}
                                                onClick={() => handleOpenCloseTodoDialog(selectedTask.id)}
                                                text={"Mark Complete"}
                                            />
                                        </div>
                                    )
                                }
                            </div>
                        )}
                    </div>
                )}
            </div>

            <AddTodo
                open={addTodoOpen}
                handleClose={handleCloseAddTodo}
                todoId={editingTodoId}
                handleGetAllTodos={handleGetTodoByTeam}
            />
            <AlertDialog
                open={dialog.open}
                title={dialog.title}
                message={dialog.message}
                actionButtonText={dialog.actionButtonText}
                handleAction={() => handleDeleteTodo()}
                handleClose={() => handleCloseDeleteDialog()}
            />

            <AlertDialog
                open={closeTodoDialog.open}
                title={closeTodoDialog.title}
                message={closeTodoDialog.message}
                actionButtonText={closeTodoDialog.actionButtonText}
                handleAction={() => handleCompleteTodo()}
                handleClose={() => handleCloseCloseTodoDialog()}
            />
        </>
    );
};

const mapDispatchToProps = {
    setAlert,
    setHeaderTitle
}

export default connect(null, mapDispatchToProps)(Todo)