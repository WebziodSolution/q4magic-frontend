import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { connect } from 'react-redux';
import { setAlert } from '../../../redux/commonReducers/commonReducers';

import Components from '../../muiComponents/components';
import Button from '../../common/buttons/button';
import CustomIcons from '../../common/icons/CustomIcons';
import { getClosePlanByOppId } from '../../../service/closePlanService/closePlanService';
import { getAllClosePlanNotes, saveClosePlanNote } from '../../../service/closePlanNotes/closePlanNotesService';
import { getUserDetails } from '../../../utils/getUserDetails';
import { handleRequestClose } from '../../../service/common/commonService';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': { padding: theme.spacing(2) },
    '& .MuiDialogActions-root': { padding: theme.spacing(1) },
}));

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

const EmptyComments = () => (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
        No comments yet. Be the first to ask a question or leave a note.
    </div>
);

const Pill = ({ children }) => (
    <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-semibold text-gray-700">
        {children}
    </span>
);

function ClosePlanCommentModel({ setAlert, open, handleClose, opportunityId }) {
    const theme = useTheme();
    const userDetails = getUserDetails()

    const [contacts, setContacts] = useState([]);
    const [comments, setComments] = useState([])
    const [commentText, setCommentText] = useState("")
    const [closePlanId, setClosePlanId] = useState(null)
    const [contactId, setContactId] = useState(null)
    const [closePlanCreatedById, setClosePlanCreatedById] = useState(null)

    const onClose = () => {
        setContacts([]);
        setClosePlanCreatedById(null)
        setClosePlanId(null)
        setContactId(null)
        setCommentText("")
        setComments([])
        handleClose();
    };

    const formatDateTime = (date) => {
        if (!date) return '';
        try {
            return new Date(date).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
        } catch {
            return '';
        }
    };

    const getInitials = (name = '') => {
        const parts = name.trim().split(' ').filter(Boolean);
        const a = parts?.[0]?.[0] || 'U';
        const b = parts?.[1]?.[0] || '';
        return (a + b).toUpperCase();
    };

    const handleGetAllContact = async () => {
        if (!open || !opportunityId) return;
        try {
            const res = await getClosePlanByOppId(opportunityId);
            const data =
                res?.result?.map((item) => ({
                    id: item.id,
                    contactName: item.contactName,
                    date: item.date,
                    status: item.status,
                    contactId: item.contactId,
                })) || [];
            setClosePlanCreatedById(res?.result?.[0]?.cusId)
            setContacts(data);
        } catch (e) {
            setContacts([]);
            setAlert && setAlert({ message: 'Failed to load contacts', type: 'error' });
        }
    };

    const handleGetAllComments = async (closePlanId, contactId) => {
        setClosePlanId(closePlanId)
        setContactId(contactId)

        const res = await getAllClosePlanNotes(closePlanId, contactId)
        if (res.status === 200) {
            setComments(res.result)
        }
    }

    const handleSaveComment = async () => {
        const payload = {
            sendTo: contactId,
            createdBy: closePlanCreatedById,
            comments: commentText,
            closePlanId: closePlanId
        }
        const res = await saveClosePlanNote(payload)
        if (res?.status === 201) {
            setAlert({
                open: true,
                message: "Comment added successfully",
                type: "success"
            })
            setCommentText("")
            setClosePlanId(null)
            setContactId(null)
            handleGetAllComments(closePlanId, contactId)
        } else {
            setAlert({
                open: true,
                message: res?.message,
                type: "error"
            })
        }
    }

    useEffect(() => {
        handleGetAllContact();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    return (
        <React.Fragment>
            <BootstrapDialog onClose={(event, reason) => handleRequestClose(event, reason, onClose)} open={open} aria-labelledby="customized-dialog-title" fullWidth maxWidth="md">
                <Components.DialogTitle sx={{ m: 0, p: 2, color: theme.palette.text.primary }} id="customized-dialog-title">
                    Comments
                </Components.DialogTitle>

                <Components.IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={(theme) => ({
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: theme.palette.primary.icon,
                    })}
                >
                    <CustomIcons iconName={'fa-solid fa-xmark'} css="cursor-pointer text-black w-5 h-5" />
                </Components.IconButton>

                {/* Content */}
                <Components.DialogContent
                    dividers
                >
                    <div className="h-full bg-gray-50">
                        <div className="h-full overflow-auto py-4">
                            <div className="space-y-3">
                                {contacts.map((row) => {
                                    return (
                                        <div
                                            onClick={() => handleGetAllComments(row.id, row.contactId)}
                                            key={row.id}
                                            className={`cursor-pointer group rounded-lg border bg-white p-4 shadow-sm transition-all duration-200
  ${closePlanId === row.id && contactId === row.contactId
                                                    ? "border-blue-600 ring-2 ring-blue-100"
                                                    : "border-gray-200 hover:border-blue-300 hover:shadow-md"
                                                }`}

                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-[#7413D1]/10 flex items-center justify-center">
                                                    <span className="text-[#7413D1] font-bold text-sm">
                                                        {getInitials(row?.contactName)}
                                                    </span>
                                                </div>

                                                <div className="font-semibold text-[#242424] text-sm truncate max-w-[220px] sm:max-w-[420px]">
                                                    {row?.contactName || '—'}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {
                                (contactId && closePlanId) && (
                                    <div
                                        className={`mt-4 transition-all duration-300 ease-out
    ${contactId && closePlanId
                                                ? "opacity-100 translate-y-0"
                                                : "opacity-0 -translate-y-2 pointer-events-none h-0 overflow-hidden"
                                            }`}
                                    >
                                        <Card title="Leave comment / Question">
                                            <div className="rounded-xl border border-gray-200 bg-white p-3">
                                                <textarea
                                                    value={commentText}
                                                    onChange={(e) => setCommentText(e.target.value)}
                                                    rows={4}
                                                    className="w-full resize-none bg-transparent text-sm text-gray-800 outline-none
             focus:ring-2 focus:ring-blue-100 rounded-md p-2 transition"
                                                    placeholder="Ask a question or leave a comment…"
                                                />
                                            </div>

                                            <div className="mt-3 flex flex-wrap gap-2">
                                                <Button disabled={!commentText} text={"Submit"} onClick={() => handleSaveComment()} />
                                            </div>
                                        </Card>

                                        <div className="mt-3">
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
                                                            const createdByName = c?.createdByName
                                                            const createdBy = c?.createdBy
                                                            return (
                                                                <div
                                                                    key={c?.id ?? idx}
                                                                    className={`rounded-2xl border ${userDetails?.userId === createdBy ? "border-blue-600" :"border-gray-200"} bg-white p-3 sm:p-4`}
                                                                >
                                                                    <div className="flex items-start gap-3">
                                                                        <div className="min-w-0 flex-1">
                                                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                                                                <div className={`font-semibold ${userDetails?.userId === createdBy ? "text-blue-600" : "text-black "} text-sm truncate max-w-[220px] sm:max-w-[360px]`}>
                                                                                    {createdByName}
                                                                                </div>

                                                                                {createdAt ? (
                                                                                    <span className={`text-xs text-gray-500`}>
                                                                                        • {formatDateTime(createdAt)}
                                                                                    </span>
                                                                                ) : null}
                                                                            </div>

                                                                            <div className="mt-2 text-sm text-black whitespace-pre-wrap break-words">
                                                                                {noteText || "—"}
                                                                            </div>

                                                                            {idx !== comments.length - 1 ? (
                                                                                <div className="mt-4 h-px w-full bg-gray-100" />
                                                                            ) : null}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </Card>
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </Components.DialogContent>

                <Components.DialogActions sx={{ p: 3, backgroundColor: theme.palette.background.paper }}>
                    <div className="flex justify-end items-center gap-4 w-full">
                        <Button
                            type="button"
                            text={'Close'}
                            useFor="disabled"
                            onClick={onClose}
                            startIcon={<CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer mr-2' />}
                        />
                    </div>
                </Components.DialogActions>
            </BootstrapDialog>
        </React.Fragment >
    );
}

const mapDispatchToProps = { setAlert };
export default connect(null, mapDispatchToProps)(ClosePlanCommentModel);
