import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { connect } from "react-redux";

import Button from "../../components/common/buttons/button";
import { changeClosePlanStatus, validateToken } from "../../service/closePlanService/closePlanService";
import { getAllClosePlanNotes, saveClosePlanNote } from "../../service/closePlanNotes/closePlanNotesService";
import { setAlert } from "../../redux/commonReducers/commonReducers";
import CustomIcons from "../../components/common/icons/CustomIcons";
import Components from "../../components/muiComponents/components";

// ---------- helpers ----------

function normalizeUrl(u) {
    if (!u) return "";
    const s = u.trim();
    if (!s) return "";
    // If user typed google.com, make it https://google.com
    if (/^https?:\/\//i.test(s)) return s;
    return `${s}`;
}

const getFileNameFromUrl = (url = "") => {
    try {
        const clean = url.split("?")[0];
        const name = clean.substring(clean.lastIndexOf("/") + 1);
        return decodeURIComponent(name || "File");
    } catch {
        return "File";
    }
};

const getExt = (name = "") => {
    const parts = name.split(".");
    return (parts[parts.length - 1] || "").toLowerCase();
};

const extMeta = (ext) => {
    if (["pdf"].includes(ext)) return { label: "PDF", icon: "📄" };
    if (["doc", "docx"].includes(ext)) return { label: "DOC", icon: "📝" };
    if (["png", "jpg", "jpeg", "webp"].includes(ext)) return { label: "IMG", icon: "🖼️" };
    if (["xls", "xlsx", "csv"].includes(ext)) return { label: "SHEET", icon: "📊" };
    if (["ppt", "pptx"].includes(ext)) return { label: "PPT", icon: "📽️" };
    return { label: "FILE", icon: "📎" };
};

const splitNextSteps = (text = "") => {
    // supports: newline OR "  " separation OR "1)..." style
    if (!text) return [];
    const byNewLine = text.split("\n").map((s) => s.trim()).filter(Boolean);
    if (byNewLine.length > 1) return byNewLine;

    // if single line, try to split by "  " (double spaces) or " • "
    const byDoubleSpace = text.split("  ").map((s) => s.trim()).filter(Boolean);
    if (byDoubleSpace.length > 1) return byDoubleSpace;

    const byBullet = text.split("•").map((s) => s.trim()).filter(Boolean);
    if (byBullet.length > 1) return byBullet;

    return [text.trim()];
};

const formatDateTime = (date) => {
    if (!date) return "";
    try {
        return new Date(date).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            // hour: "2-digit",
            // minute: "2-digit",   
        });
    } catch {
        return "";
    }
};

const EmptyComments = () => (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
        No comments yet. Be the first to ask a question or leave a note.
    </div>
);

// ---------- small UI blocks ----------
const Card = ({ title, right, children, className = "" }) => (
    <div
        className={
            "rounded-2xl border border-gray-200 bg-white shadow-sm " +
            "p-4 sm:p-5 " +
            className
        }
    >
        {(title || right) && (
            <div className="mb-3 flex items-center justify-between gap-3">
                {title ? <h3 className="text-sm font-semibold text-[#242424]">{title}</h3> : <div />}
                {right ? <div>{right}</div> : null}
            </div>
        )}
        {children}
    </div>
);

const Pill = ({ children }) => (
    <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-semibold text-gray-700">
        {children}
    </span>
);

// ---------- main ----------
const Closeplan = ({ setAlert }) => {
    const { token } = useParams();
    const [copiedIndex, setCopiedIndex] = useState(null);

    const [loading, setLoading] = useState(true);
    const [closePlan, setClosePlan] = useState(null);

    const [looksPerfect, setLooksPerfect] = useState(false)
    const [isComment, setIsComment] = useState(false)
    const [isCommentDisabled, setIsCommentDisabled] = useState(false)

    const [comments, setComments] = useState([]);
    const [contactId, setContactId] = useState(null)
    const [closePlanCreatedById, setClosePlanCreatedById] = useState(null)
    const [commentText, setCommentText] = useState("")
    const [closePlanId, setClosePlanId] = useState(null)

    const closeCommentDrawer = () => setIsComment(false);

    const handleValidateToken = async () => {
        setLoading(true);
        try {
            const res = await validateToken(token);

            // ✅ adjust these lines if your API shape is different
            // common patterns: res.result / res.data / res.data.result
            const data = res?.result?.data

            if (res?.status === 200 && data) {
                setLooksPerfect(data?.status ? true : false)
                if (data?.status) {
                    setIsCommentDisabled(true)
                }
                setClosePlanCreatedById(data?.createdBy)
                setContactId(data?.contactId)
                setClosePlanId(data?.closePlanId)

                handleGetAllComments(data?.closePlanId, data?.contactId)
                setClosePlan(data);
            } else {
                setClosePlan(null);
            }
        } catch (e) {
            setClosePlan(null);
        } finally {
            setLoading(false);
        }
    };

    const handleGetAllComments = async (closePlanId, contactId) => {
        const res = await getAllClosePlanNotes(closePlanId, contactId)
        if (res.status === 200) {
            setComments(res.result)
            // if (res.result?.length > 0) {
            //     setIsComment(true)
            // }
        }
    }

    const handleSaveComment = async () => {
        const payload = {
            sendTo: closePlanCreatedById,
            createdBy: contactId,
            comments: commentText,
            closePlanId: closePlanId
        }
        const res = await saveClosePlanNote(payload)
        if (res?.status === 201) {
            setCommentText("")
            setAlert({
                open: true,
                message: "Comment added successfully",
                type: "success"
            })
            handleGetAllComments(closePlanId, contactId)
        } else {
            setAlert({
                open: true,
                message: res?.message,
                type: "error"
            })
        }
    }

    const handleSaveStatus = async () => {
        if (!looksPerfect) {
            setIsComment(false)
            const res = await changeClosePlanStatus(closePlanId);
            if (res.status === 200) {
                setLooksPerfect(true)
                setIsCommentDisabled(true)
            } else {
                setLooksPerfect(false)
                setAlert({
                    open: true,
                    message: "Server error",
                    type: "error"
                })
            }
        }
    }

    useEffect(() => {
        document.title = "ClosePlan - 360Pipe"
        if (token) handleValidateToken();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const keyContacts = useMemo(() => {
        return closePlan?.opportunityContactDto || []
    }, [closePlan]);

    const nextSteps = useMemo(() => splitNextSteps(closePlan?.nextSteps || ""), [closePlan]);

    const sharedFiles = useMemo(() => {
        const docs = closePlan?.docsAttachmentsDtoList || [];

        return docs
            .map((d) => {
                const hasFile = !!d?.fileUrl;
                const hasLink = !!d?.link;

                // If API sometimes sends both, prefer showing file (you can change this rule)
                if (hasFile) {
                    const nameFromUrl = getFileNameFromUrl(d.fileUrl);
                    const ext = getExt(nameFromUrl);
                    return {
                        id: d?.id,
                        type: "file",
                        url: d?.fileUrl,
                        name: d?.fileName || nameFromUrl || "Attachment",
                        ext,
                        meta: extMeta(ext),
                    };
                }

                if (hasLink) {
                    const url = normalizeUrl(d.link); // ensures http/https
                    return {
                        id: d?.id,
                        type: "link",
                        url,
                        name: d?.linkName || d?.link || "Link",
                        meta: {
                            icon: "🔗",
                            label: "Link",
                        },
                        raw: d?.link,
                    };
                }

                return null;
            })
            .filter(Boolean);
    }, [closePlan]);

    const handleCopyUrl = async (url, index) => {
        try {
            await navigator.clipboard.writeText(url);
            setCopiedIndex(index);
            setAlert({
                open: true,
                message: 'URL copied to clipboard!',
                type: 'success'
            });
            setTimeout(() => setCopiedIndex(null), 1500);
        } catch (e) {
            console.error("Copy failed:", e);
            setAlert({
                open: true,
                message: 'Failed to copy URL',
                type: 'error'
            });
        }
    };
    return (
        <div className="min-h-screen bg-gray-50">
            {/* top bar */}
            {/* <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-[#7413D1]/10 flex items-center justify-center">
                            <span className="text-[#7413D1] font-black">Q</span>
                        </div>
                        <div>
                            <div className="text-sm font-extrabold text-[#242424] leading-4">Customer Deal Portal</div>
                            <div className="text-xs text-gray-500">360Pipe Close Plan</div>
                        </div>
                    </div>
                </div>
            </div> */}

            {/* body */}
            <div className="mx-auto max-w-full px-20 py-6 sm:py-8">
                {loading ? (
                    <div className="grid gap-4">
                        <div className="h-28 rounded-2xl bg-white border border-gray-200 animate-pulse" />
                        <div className="h-48 rounded-2xl bg-white border border-gray-200 animate-pulse" />
                        <div className="h-48 rounded-2xl bg-white border border-gray-200 animate-pulse" />
                    </div>
                ) : !closePlan ? (
                    <Card title="Invalid or expired link">
                        <div className="text-sm text-gray-600">
                            We couldn’t load the close plan for this token. Please request a new link from the account team.
                        </div>
                    </Card>
                ) : (
                    <>
                        <div className="relative z-10 flex justify-start items-center gap-3 text-lg font-semibold">
                            <p>
                                {closePlan?.contactName?.split(" ")[0]},
                            </p>

                            <p>
                                Please comment:
                            </p>

                            <div className="flex justify-start items-center gap-3 ml-5">
                                <div className="flex justify-start items-center gap-2">
                                    <button
                                        onClick={handleSaveStatus}
                                        className={`flex items-center gap-2 px-4 py-1.5 rounded-sm border transition-all duration-400 ${looksPerfect ? "bg-green-600 border-green-600 text-white cursor-not-allowed" : "border-green-600 text-green-600 bg-transparent hover:bg-green-600 hover:text-white"} group`}>
                                        <CustomIcons
                                            iconName="fa-solid fa-thumbs-up"
                                            css={`h-4 w-4 transition-colors duration-400 ${looksPerfect ? "text-yellow-400" : "text-green-600 group-hover:text-white"}`}
                                        />
                                        Looks Perfect
                                    </button>
                                </div>
                                <Button disabled={isCommentDisabled} useFor={isComment ? "" : "primary"} text={"Comment / Suggestion"} onClick={() => setIsComment(true)} />
                            </div>
                        </div>

                        {/* main grid like image */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-2">
                            <div className="grid gap-4 lg:col-span-12">
                                {/* Executive Summary */}
                                <Card
                                    title="Executive Summary"
                                    right={
                                        <Pill>
                                            AI (first 5 boxes)
                                        </Pill>
                                    }
                                >
                                    {/* businessValue is HTML from backend
                                    <div
                                        className="prose prose-sm max-w-none text-gray-700"
                                        // NOTE: if you want sanitize -> use DOMPurify
                                        dangerouslySetInnerHTML={{ __html: closePlan?.businessValue || "<p>—</p>" }}
                                    /> */}
                                </Card>

                                {/* 2x2 blocks */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <Card title="Business Value">
                                        <div
                                            className="prose prose-sm max-w-none text-gray-700"
                                            dangerouslySetInnerHTML={{ __html: closePlan?.businessValue || "<p>—</p>" }}
                                        />
                                    </Card>

                                    <Card title="Time Line">
                                        {closePlan?.decisionMap?.length > 0 ? (
                                            <ul className="space-y-1 text-sm">
                                                {closePlan?.decisionMap?.map(
                                                    (c) => (
                                                        <li key={c.id}>
                                                            <span className="font-medium text-indigo-600">
                                                                {c.process}
                                                            </span>
                                                            {c.processDate && (
                                                                <>
                                                                    <span className="mx-1 text-gray-500">
                                                                        –
                                                                    </span>
                                                                    <span>
                                                                        {c.processDate ? new Date(c.processDate).toLocaleDateString("en-US", {
                                                                            month: "numeric",
                                                                            day: "numeric",
                                                                            year: "numeric",
                                                                        })
                                                                            : "-"}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        ) : (
                                            <div className="text-sm text-gray-600">
                                                -
                                            </div>
                                        )}
                                    </Card>

                                    <Card title="Stakeholders">
                                        {keyContacts?.length ? (
                                            <ul className="space-y-1 text-sm">
                                                {keyContacts?.map(
                                                    (c) => (
                                                        <li key={c.id}>
                                                            <span className="font-medium text-indigo-600">
                                                                {c.contactName}
                                                            </span>
                                                            {c.role && (
                                                                <>
                                                                    <span className="mx-1 text-gray-500">
                                                                        –
                                                                    </span>
                                                                    <span>
                                                                        {c.role}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        ) : (
                                            <div className="text-sm text-gray-600">No key contacts found.</div>
                                        )}
                                    </Card>

                                    <Card
                                        title="Shared Files"
                                    >
                                        {sharedFiles?.length ? (
                                            <div className="space-y-2">
                                                {sharedFiles.map((item, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2"
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="h-9 w-9 rounded-xl bg-[#0478DC]/10 flex items-center justify-center">
                                                                <span className="text-[#0478DC]">{item.meta.icon}</span>
                                                            </div>

                                                            <div className="min-w-0">
                                                                <div className="truncate text-sm font-semibold text-[#242424]">
                                                                    {item.name}
                                                                </div>

                                                                <div className="text-xs text-gray-500">
                                                                    {item.type === "file"
                                                                        ? item.meta.label
                                                                        : item.url}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* ACTION AREA */}
                                                        <div className="flex items-center gap-2">
                                                            {item.type === "file" ? (
                                                                <a
                                                                    href={item.url}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold bg-[#7413D1] text-white hover:brightness-95 transition"
                                                                    title="Open"
                                                                >
                                                                    Open
                                                                </a>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleCopyUrl(item.url, index)}
                                                                    className={`p-2 rounded-lg transition-all duration-200 ${copiedIndex === index
                                                                        ? "bg-green-100 text-green-600"
                                                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                                                                        }`}
                                                                    title={copiedIndex === index ? "Copied!" : "Copy URL"}
                                                                >
                                                                    {copiedIndex === index ? (
                                                                        <CustomIcons iconName={"fa-solid fa-check"} css="w-4 h-4" />
                                                                    ) : (
                                                                        <CustomIcons iconName={"fa-regular fa-copy"} css="w-4 h-4" />
                                                                    )}
                                                                </button>
                                                            )}
                                                        </div>

                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-sm text-gray-600">No shared files.</div>
                                        )}


                                    </Card>

                                    <Card title="ROI / TCO">
                                        <div className="text-sm text-gray-600">
                                            -
                                            {/* Add ROI/TCO numbers when you have fields (savings, cost, payback period, etc.). */}
                                        </div>
                                    </Card>

                                    <Card title="Next Step(s)">
                                        {nextSteps?.length ? (
                                            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                                                {nextSteps.map((s, i) => (
                                                    <li key={i}>{s}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="text-sm text-gray-600">—</div>
                                        )}
                                    </Card>
                                </div>
                            </div>

                            {(isComment && !looksPerfect) && (
                                <div
                                    className="fixed inset-0 z-40 bg-black/30 lg:bg-black/20"
                                    onClick={closeCommentDrawer}
                                />
                            )}
                            <div
                                className={`fixed top-0 right-0 z-50 mt-16 lg:mt-0 bg-white text-gray-900 h-screen border-l border-gray-300 w-[600px] flex flex-col transform transition-transform duration-300 ease-in-out shadow-xl ${(isComment && !looksPerfect) ? "translate-x-0" : "translate-x-full"}`}
                            >
                                {/* Header (fixed) */}
                                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-300">
                                    <p className="text-lg font-semibold text-[#242424]">Comment / Suggestion</p>

                                    <Components.IconButton onClick={closeCommentDrawer}>
                                        <CustomIcons iconName={"fa-solid fa-close"} css="cursor-pointer h-6 w-6 text-black" />
                                    </Components.IconButton>
                                </div>

                                {/* ✅ Leave comment section (fixed) */}
                                <div className="p-4 border-b border-gray-200">
                                    <Card title="Leave comment / Question">
                                        <div className="rounded-xl border border-gray-200 bg-white p-3">
                                            <textarea
                                                value={commentText}
                                                onChange={(e) => setCommentText(e.target.value)}
                                                rows={4}
                                                className="w-full resize-none bg-transparent text-sm text-gray-800 outline-none"
                                                placeholder="Ask a question or leave a comment…"
                                            />
                                        </div>

                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <Button text={"Save"} onClick={handleSaveComment} startIcon={<CustomIcons iconName={'fa-solid fa-floppy-disk'} css='cursor-pointer' />} />
                                        </div>
                                    </Card>
                                </div>

                                {/* ✅ Comments section (ONLY this scrolls) */}
                                <div className="flex-1 min-h-0 overflow-y-auto p-4">
                                    <Card
                                        title="Comments"
                                        right={
                                            <Pill>
                                                {comments?.length || 0} {comments?.length === 1 ? "comment" : "comments"}
                                            </Pill>
                                        }
                                    >
                                        {!comments?.length ? (
                                            <EmptyComments />
                                        ) : (
                                            <div className="space-y-3">
                                                {comments?.map((c, idx) => {
                                                    const noteText = c?.comments || "";
                                                    const createdAt = c?.createdAt;
                                                    const createdByName = c?.createdByName;
                                                    const createdBy = c?.createdBy
                                                    return (
                                                        <div
                                                            key={c?.id ?? idx}
                                                            className={`rounded-2xl border ${contactId === createdBy ? "border-blue-600" : "border-gray-200"} bg-white p-3 sm:p-4`}
                                                        >
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                                                    <div className={`font-semibold ${contactId === createdBy ? "text-blue-600" : "text-black "} text-sm truncate max-w-[220px] sm:max-w-[360px]`}>
                                                                        {createdByName}
                                                                    </div>

                                                                    {createdAt ? (
                                                                        <span className="text-xs text-gray-500">
                                                                            • {formatDateTime(createdAt)}
                                                                        </span>
                                                                    ) : null}
                                                                </div>

                                                                <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap break-words">
                                                                    {noteText || "—"}
                                                                </div>

                                                                {idx !== comments.length - 1 ? (
                                                                    <div className="mt-4 h-px w-full bg-gray-100" />
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </Card>
                                </div>
                            </div>

                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const mapDispatchToProps = {
    setAlert,
};

export default connect(null, mapDispatchToProps)(Closeplan)