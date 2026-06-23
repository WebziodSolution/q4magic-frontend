import React, { useEffect, useMemo, useState } from "react";
import { deleteAllMails, deleteAllMailsByRequestId, deleteAllMailsInbox, deleteByRequestIdInbox, getMailByGroup } from "../../service/tempMail/tempMail";
import Checkbox from "../../components/common/checkBox/checkbox";
import { setAlert } from "../../redux/commonReducers/commonReducers";
import Components from "../../components/muiComponents/components";
import CustomIcons from "../../components/common/icons/CustomIcons";
import { createAllContact } from "../../service/contact/contactService";
import Button from "../../components/common/buttons/button";
import { connect } from "react-redux";
import AlertDialog from "../../components/common/alertDialog/alertDialog";
import SelectMultiple from "../../components/common/select/selectMultiple";

const Summary = ({ setAlert }) => {
    const [groups, setGroups] = useState([]);
    const [openAccordionId, setOpenAccordionId] = useState(null);

    const [selectedByGroup, setSelectedByGroup] = useState([]);
    const [dialogAddContacts, setDialogAddContacts] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [selectedEmails, setSelectedEmails] = useState(null)
    const [groupIndex, setGroupIndex] = useState(null)

    const [dialogDeleteInbox, setDialogDeleteInbox] = useState({ open: false, title: '', message: '', actionButtonText: '' });


    const handleOpenDeleteDialogInbox = (email, groupIndex) => {
        setSelectedEmails(email)
        setGroupIndex(groupIndex)
        setDialogDeleteInbox({ open: true, title: 'Delete Mail', message: 'Are you sure! Do you want to delete all this mails from Inbox?', actionButtonText: 'yes' });
    }

    const handleCloseDeleteDialogInbox = () => {
        setSelectedEmails(null)
        setGroupIndex(null)
        setDialogDeleteInbox({ open: false, title: '', message: '', actionButtonText: '' });
    }

    const handleOpenDeleteDialog = (email, groupIndex) => {
        setSelectedEmails(email)
        setGroupIndex(groupIndex)
        setDialog({ open: true, title: 'Delete Mail', message: 'Are you sure! Do you want to delete all this mails?', actionButtonText: 'yes' });
    }

    const handleCloseDeleteDialog = () => {
        setSelectedEmails(null)
        setGroupIndex(null)
        setDialog({ open: false, title: '', message: '', actionButtonText: '' });
    }

    const handleOpenAddContactsDialog = () => {
        setDialogAddContacts({ open: true, title: 'Add To Contacts', message: 'Are you sure! Do you want to add all selected mails into contacts?', actionButtonText: 'yes' });
    }

    const handleCloseContactsDialog = () => {
        setDialogAddContacts({ open: false, title: '', message: '', actionButtonText: '' });
    }

    const getAllSelectedEmailIds = () => {
        if (!Array.isArray(selectedByGroup)) return [];

        return selectedByGroup.flatMap((entry) => {
            if (!entry) return [];
            if (Array.isArray(entry)) return entry; // partial selection
            if (entry.emailsId && Array.isArray(entry.emailsId)) return entry.emailsId; // full selection
            return [];
        });
    };

    const handleGetAllMails = async () => {
        try {
            const res = await getMailByGroup();
            const arr = res?.result?.result ?? res?.data?.result ?? [];
            setGroups(arr);
            setSelectedByGroup(Array(arr.length).fill([]));
        } catch (err) {
            setGroups([]);
            setSelectedByGroup([]);
        } finally {
        }
    };

    const handleCreateAllContacts = async () => {
        const data = getAllSelectedEmailIds()
        const res = await createAllContact(data);
        if (res?.status !== 201) {
            setAlert({
                open: true,
                type: 'error',
                message: res?.message || 'Failed to add in contacts.',
            })
            handleCloseContactsDialog()
        } else {
            handleCloseContactsDialog()
            handleGetAllMails();
            setSelectedByGroup([])
        }
    }

    useEffect(() => {
        handleGetAllMails();
    }, []);

    const getEntryArray = (entry) => {
        if (!entry) return [];
        return Array.isArray(entry) ? entry : (entry.emailsId ?? []);
    };

    const isAllShape = (entry) => {
        return !!entry && !Array.isArray(entry) && Array.isArray(entry.emailsId);
    };

    const setEntry = (groupIndex, value) => {
        setSelectedByGroup((prev) => {
            const next = prev.slice();
            next[groupIndex] = value;
            return next;
        });
    };

    const toggleRow = (groupIndex, emailId, checked) => {
        setSelectedByGroup((prev) => {
            const curr = prev[groupIndex];
            const ids = new Set(getEntryArray(curr));
            if (checked) ids.add(emailId);
            else ids.delete(emailId);

            const next = prev.slice();
            next[groupIndex] = Array.from(ids);
            return next;
        });
    };

    const toggleAllInGroup = (groupIndex, requestId, allIds, checked) => {
        if (checked) {
            setEntry(groupIndex, { requestId, emailsId: allIds });
        } else {
            setEntry(groupIndex, []);
        }
    };

    const handleDeleteGroup = async () => {
        const entry = selectedByGroup[groupIndex];
        if (!entry || (Array.isArray(entry) && entry.length === 0)) {
            setAlert({
                open: true,
                type: "error",
                message: "Please select emails first"
            })
            return;
        }

        try {
            if (!Array.isArray(entry) && entry.requestId) {
                await deleteAllMailsByRequestId(entry.requestId);

                setSelectedByGroup(prev => prev.filter((_, i) => i !== groupIndex));
                if (openAccordionId === selectedEmails) setOpenAccordionId(null);
                handleGetAllMails()
                handleCloseDeleteDialog()
            } else {
                await deleteAllMails(entry);

                setSelectedByGroup(prev => {
                    const next = [...prev];
                    next[groupIndex] = [];
                    return next;
                });
                handleGetAllMails()
                handleCloseDeleteDialog()
            }
        } catch (err) {
            console.error("Delete failed", err);
            alert("Delete failed. Please try again.");
        }
    };

    const handleDeleteGroupInbox = async () => {
        const entry = selectedByGroup[groupIndex];
        if (!entry || (Array.isArray(entry) && entry.length === 0)) {
            setAlert({
                open: true,
                type: "error",
                message: "Please select emails first"
            })
            return;
        }

        try {
            if (!Array.isArray(entry) && entry.requestId) {
                await deleteByRequestIdInbox(entry.requestId);

                setSelectedByGroup(prev => prev.filter((_, i) => i !== groupIndex));
                if (openAccordionId === selectedEmails) setOpenAccordionId(null);
                handleGetAllMails()
                handleCloseDeleteDialogInbox()
            } else {
                await deleteAllMailsInbox(entry);

                setSelectedByGroup(prev => {
                    const next = [...prev];
                    next[groupIndex] = [];
                    return next;
                });
                handleGetAllMails()
                handleCloseDeleteDialogInbox()
            }
        } catch (err) {
            console.error("Delete failed", err);
            alert("Delete failed. Please try again.");
        }
    };

    return (
        <section className="mx-auto py-6 lg:max-h-[540px] 4k:max-h-[700px] overflow-y-auto">
            {groups?.length === 0 ? (
                <div className="p-6 text-gray-600 border border-gray-200 rounded-lg bg-white text-center">
                    No data found.
                </div>
            ) : (
                <div className="divide-y divide-gray-200 rounded border border-gray-200 bg-white">
                    {groups.map((g, index) => (
                        <AccordionItem
                            key={index}
                            groupIndex={index}
                            id={g.email}
                            title={g.email}
                            totalMessages={g.totalMessages}
                            emails={g.emails || []}
                            requestId={g.requestId}
                            open={openAccordionId === g.email}
                            onToggle={() =>
                                setOpenAccordionId((prev) => (prev === g.email ? null : g.email))
                            }
                            // selection props (array-based model)
                            selectedEntry={selectedByGroup[index]}
                            getEntryArray={getEntryArray}
                            isAllShape={isAllShape}
                            onToggleRow={(emailId, checked) => toggleRow(index, emailId, checked)}
                            onToggleAll={(allIds, checked) =>
                                toggleAllInGroup(index, g.requestId, allIds, checked)
                            }
                            onDeleteGroup={() => handleOpenDeleteDialog(g.email, index)}
                            onDeleteGroupInbox={() => handleOpenDeleteDialogInbox(g.email, index)}
                            handleCreateAllContacts={handleOpenAddContactsDialog}
                        />
                    ))}
                </div>
            )}
            <AlertDialog
                open={dialogAddContacts.open}
                title={dialogAddContacts.title}
                message={dialogAddContacts.message}
                actionButtonText={dialogAddContacts.actionButtonText}
                handleAction={() => handleCreateAllContacts()}
                handleClose={() => handleCloseContactsDialog()}
            />
            <AlertDialog
                open={dialog.open}
                title={dialog.title}
                message={dialog.message}
                actionButtonText={dialog.actionButtonText}
                handleAction={() => handleDeleteGroup()}
                handleClose={() => handleCloseDeleteDialog()}
            />
            <AlertDialog
                open={dialogDeleteInbox.open}
                title={dialogDeleteInbox.title}
                message={dialogDeleteInbox.message}
                actionButtonText={dialogDeleteInbox.actionButtonText}
                handleAction={() => handleDeleteGroupInbox()}
                handleClose={() => handleCloseDeleteDialogInbox()}
            />
        </section>
    );
};

const mapDispatchToProps = {
    setAlert,
};

export default connect(null, mapDispatchToProps)(Summary)

/* ---------------------------------------------------------------
   Accordion Item
--------------------------------------------------------------- */
function AccordionItem({
    groupIndex,
    id,
    title,
    totalMessages,
    emails,
    requestId,
    open,
    onToggle,
    selectedEntry,
    getEntryArray,
    isAllShape,
    onToggleRow,
    onToggleAll,
    onDeleteGroup,
    onDeleteGroupInbox,
    handleCreateAllContacts
}) {
    const hasSelection =
        Array.isArray(selectedEntry)
            ? selectedEntry.length > 0
            : !!(
                selectedEntry &&
                Array.isArray(selectedEntry.emailsId) &&
                selectedEntry.emailsId.length > 0
            );

    return (
        <div id={id} className="border-b last:border-b-0">
            {/* Header */}
            <div className="w-full flex justify-between items-center px-6 py-4 hover:bg-gray-50">
                <button
                    onClick={onToggle}
                    className="flex-1 flex flex-col sm:flex-row sm:items-center sm:gap-3 text-left"
                >
                    <span className="text-base font-medium text-gray-900">{title}</span>
                    <span className="mt-1 sm:mt-0 inline-flex items-center rounded-full border border-[#44288E] bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-[#44288E]">
                        Records: {emails.length}
                    </span>
                </button>

                <div className="flex items-center gap-3">
                    {open && hasSelection && (
                        <div className="flex justify-center items-center gap-5 w-[450px]">
                            <Button type={`button`} text={'Add to Contacts'} onClick={() => handleCreateAllContacts()} />

                            <Button useFor='error' type={`button`} text={'Delete From Inbox'} onClick={onDeleteGroupInbox} />

                            <div className="bg-red-600 h-8 w-8 flex justify-center items-center rounded-full text-white">
                                <Components.IconButton onClick={onDeleteGroup}>
                                    <CustomIcons
                                        iconName={"fa-solid fa-trash"}
                                        css="cursor-pointer text-white h-4 w-4"
                                    />
                                </Components.IconButton>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={onToggle}
                        className="text-gray-500 hover:text-gray-700 transition"
                        title="Expand/Collapse"
                    >
                        <svg
                            className={`h-5 w-5 transition-transform duration-500 ${open ? "rotate-180" : "rotate-0"
                                }`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Accordion body with transition */}
            <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${open ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                    }`}
            >
                <div className="px-6 pb-6">
                    <EmailTable
                        rows={emails}
                        requestId={requestId}
                        selectedEntry={selectedEntry}
                        getEntryArray={getEntryArray}
                        isAllShape={isAllShape}
                        onToggleRow={onToggleRow}
                        onToggleAll={onToggleAll}
                    />
                </div>
            </div>
        </div>
    );
}

/* ---------------------------------------------------------------
   Email Table (filters + fixed header + scroll body)
--------------------------------------------------------------- */
function EmailTable({
    rows,
    requestId,
    selectedEntry,
    getEntryArray,
    isAllShape,
    onToggleRow,
    onToggleAll,
}) {
    // ---------- build unique options ----------
    const { emailOptions, companyOptions } = useMemo(() => {
        const emailSet = new Set();
        const companySet = new Set();

        for (const r of rows || []) {
            if (r?.email) emailSet.add(String(r.email).trim());
            if (r?.companyName) companySet.add(String(r.companyName).trim());
        }

        const toOptions = (set) =>
            Array.from(set)
                .filter(Boolean)
                .sort((a, b) => a.localeCompare(b))
                .map((val) => ({ id: val, title: val }));

        return {
            emailOptions: toOptions(emailSet),
            companyOptions: toOptions(companySet),
        };
    }, [rows]);

    // ---------- local filter state (ids are the raw string values) ----------
    const [emailFilterIds, setEmailFilterIds] = useState([]);
    const [companyFilterIds, setCompanyFilterIds] = useState([]);

    // If rows change (new group loaded), reset filters
    useEffect(() => {
        setEmailFilterIds([]);
        setCompanyFilterIds([]);
    }, [rows]);

    // ---------- apply filters ----------
    const filteredRows = useMemo(() => {
        return (rows || []).filter((r) => {
            const byEmail =
                emailFilterIds.length === 0 ||
                (r?.email ? emailFilterIds.includes(String(r.email).trim()) : false);

            const byCompany =
                companyFilterIds.length === 0 ||
                (r?.companyName
                    ? companyFilterIds.includes(String(r.companyName).trim())
                    : false);

            return byEmail && byCompany;
        });
    }, [rows, emailFilterIds, companyFilterIds]);

    // ---------- selection helpers ----------
    const ids = useMemo(
        () =>
            filteredRows
                .map((r) => r?.id)
                .filter((x) => x !== null && x !== undefined),
        [filteredRows]
    );

    const selectedArr = getEntryArray(selectedEntry);
    const total = ids.length;
    const selectedCount = ids.filter((id) => selectedArr.includes(id)).length;

    const allChecked = total > 0 && selectedCount === total;
    const indeterminate = selectedCount > 0 && selectedCount < total;

    // ---------- UI ----------
    return (
        <div className="mt-3 border border-gray-200 rounded overflow-hidden">
            {/* Filter bar */}
            <div className=" p-3 bg-gray-50 border-b border-gray-200 flex justify-start items-center">
                <div className="flex justify-start items-end grow gap-3">
                    <div className="w-72">
                        <SelectMultiple
                            label="Filter by Email"
                            placeholder="Choose email(s)"
                            options={emailOptions}
                            value={emailFilterIds}
                            onChange={setEmailFilterIds}
                        />
                    </div>

                    <div className="w-72">
                        <SelectMultiple
                            label="Filter by Company"
                            placeholder="Choose company(s)"
                            options={companyOptions}
                            value={companyFilterIds}
                            onChange={setCompanyFilterIds}
                        />
                    </div>

                    <div>
                        <button
                            className="h-10 px-3 rounded border border-gray-300 hover:bg-white"
                            onClick={() => {
                                setEmailFilterIds([]);
                                setCompanyFilterIds([]);
                            }}
                        >
                            Clear filters
                        </button>
                    </div>
                </div>

                <div className="flex items-end gap-2">
                    <div className="ml-auto text-sm text-gray-700 self-center">
                        <span>
                            Selected : <strong>{selectedCount}</strong> / {total}
                        </span>
                    </div>
                </div>
            </div>

            {filteredRows.length > 0 ? (
                <>
                    <div className="overflow-x-auto">
                        <div className="max-h-96 overflow-y-auto">
                            <table className="min-w-full border-collapse">
                                <thead className="bg-gray-50 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50 sticky top-0">
                                            <Checkbox
                                                checked={allChecked && isAllShape(selectedEntry)}
                                                indeterminate={
                                                    indeterminate || (allChecked && !isAllShape(selectedEntry))
                                                }
                                                onChange={(e) => onToggleAll(ids, e.target.checked)}
                                                aria-label="Select all rows"
                                                title={() => { }}
                                            />
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50 sticky top-0">
                                            #
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50 sticky top-0">
                                            First Name
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50 sticky top-0">
                                            Last Name
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50 sticky top-0">
                                            Email
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50 sticky top-0">
                                            Company
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50 sticky top-0">
                                            Job Title
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50 sticky top-0">
                                            Website
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50 sticky top-0">
                                            Phone
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {filteredRows.map((r, i) => {
                                        const emailId = r?.id;
                                        const isChecked = selectedArr.includes(emailId);

                                        return (
                                            <tr key={emailId ?? i} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <Checkbox
                                                        checked={isChecked}
                                                        onChange={(e) => onToggleRow(emailId, e.target.checked)}
                                                        aria-label={`Select row ${i + 1}`}
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-800 font-bold">
                                                    {i + 1}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-800">
                                                    {r.firstName || "—"}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-800">
                                                    {r.lastName || "—"}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-800">
                                                    {r.email || "—"}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-800">
                                                    {r.companyName || "—"}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-800">
                                                    {r.jobTitle || "—"}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-[#44288E] truncate max-w-[220px]">
                                                    {r.website ? (
                                                        <a
                                                            href={
                                                                r.website.startsWith("http")
                                                                    ? r.website
                                                                    : `https://${r.website}`
                                                            }
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="hover:underline"
                                                            title={r.website}
                                                        >
                                                            {r.website}
                                                        </a>
                                                    ) : (
                                                        "—"
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-800">
                                                    {r.phone || "—"}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="py-10">
                    <p className="text-center font-bold">No records</p>
                </div>
            )}
        </div>
    );
}