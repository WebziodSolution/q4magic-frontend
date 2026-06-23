import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { connect } from 'react-redux';
import { setAlert, setSyncingPushStatus } from '../../../redux/commonReducers/commonReducers';

import Components from '../../muiComponents/components';
import Button from '../../common/buttons/button';
import CustomIcons from '../../common/icons/CustomIcons';
import Checkbox from '../../common/checkBox/checkbox';
import { deleteOpportunitiesContact, getAllOpportunitiesContact, updateOpportunitiesContact } from '../../../service/opportunities/opportunitiesContactService';
import { Tooltip } from '@mui/material';
import AlertDialog from '../../common/alertDialog/alertDialog';
import { handleRequestClose } from '../../../service/common/commonService';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': { padding: theme.spacing(2) },
    '& .MuiDialogActions-root': { padding: theme.spacing(1) },
}));

function OpportunityKeyContactModel({
    setAlert,
    open,
    handleClose,
    opportunityId,
    handleGetAllOppContact,
    setSyncingPushStatus,
    oppName
}) {
    const theme = useTheme();
    const [contacts, setContacts] = useState([]);
    const [selectedContactId, setSelectedContactId] = useState(null);
    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });

    const onClose = () => {
        setContacts([]);
        setSelectedContactId(null)
        handleClose();
    };

    const handleOpenDeleteDialog = (contactId) => {
        setSelectedContactId(contactId);
        setDialog({ open: true, title: 'Delete Contact', message: 'Are you sure! Do you want to delete this contact?', actionButtonText: 'yes' });
    }

    const handleCloseDeleteDialog = () => {
        setSelectedContactId(null);
        setDialog({ open: false, title: '', message: '', actionButtonText: '' });
    }

    const handleDeleteContact = async () => {
        const res = await deleteOpportunitiesContact(selectedContactId);
        if (res.status === 200) {
            setSyncingPushStatus(true);           
            handleGetAllContact();
            handleCloseDeleteDialog();
        } else {
            setAlert({
                open: true,
                message: res?.message || "Failed to delete contact",
                type: "error"
            });
        }
    }

    const handleGetAllContact = async () => {
        if (open) {
            const res = await getAllOpportunitiesContact(opportunityId);
            const data = res?.result?.map((item) => ({
                id: item.id,
                title: item?.contactName,
                oppId: opportunityId,
                contactId: item.contactId,
                role: item?.role,
                isKey: item.isKey,
                salesforceContactId: item?.salesforceContactId,
                isDeleted: false,
            })) || [];
            setContacts(data);
        }
    };

    const handleToggleKey = (row, checked) => {
        setContacts((prev) => {
            const currentKeyCount = prev.filter((r) => r.isKey).length;
            const alreadyKey = row.isKey;

            if (checked && !alreadyKey && currentKeyCount >= 4) {
                setAlert({
                    open: true,
                    type: 'warning',
                    message: 'You can mark up to 4 key contacts.',
                });
                return prev;
            }

            return prev.map((item) =>
                item.contactId === row.contactId
                    ? { ...item, isKey: checked, isDeleted: false }
                    : item
            );
        });
    };

    useEffect(() => {
        handleGetAllContact();
    }, [open]);

    const submit = async () => {
        if (contacts?.length > 0) {
            const res = await updateOpportunitiesContact(contacts);
            if (res?.status === 200) {
                setSyncingPushStatus(true);
                handleGetAllOppContact();
                onClose();
            } else {
                setAlert({
                    open: true,
                    message: res.message || 'Fail to update contact',
                    type: 'error',
                });
            }
        }
    };

    return (
        <React.Fragment>
            <BootstrapDialog onClose={(event, reason) => handleRequestClose(event, reason, onClose)} open={open} aria-labelledby="customized-dialog-title" fullWidth maxWidth="md">
                <Components.DialogTitle sx={{ m: 0, p: 2, color: theme.palette.text.primary }} id="customized-dialog-title">
                    Add Key Contact For <strong>{oppName}</strong>
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

                <Components.DialogContent
                    dividers
                    sx={{
                        height: '70vh',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <div className="py-3 px-[30px] h-full">
                        <div className="max-h-[63vh] overflow-y-auto border rounded-md overflow-hidden">
                            <table className="min-w-full border-collapse">
                                {/* 🔵 Blue sticky header */}
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-[#0478DC] text-white">
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold w-40">Key Contact</th>
                                        <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                                    </tr>
                                </thead>

                                {/* Body with zebra rows */}
                                <tbody>
                                    {contacts?.length > 0 ? (
                                        contacts.map((row, i) => (
                                            <tr key={row.contactId ?? i} className="odd:bg-white even:bg-gray-200">
                                                <td className="px-4 py-3 text-sm">
                                                    {row.title || '—'}
                                                    {row.role && (
                                                        <>
                                                            <span className="mx-1 text-indigo-600">
                                                                –
                                                            </span>
                                                            <span className='text-indigo-600'>
                                                                {row.role}
                                                            </span>
                                                        </>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm ">
                                                    <Checkbox
                                                        onChange={(e) => handleToggleKey(row, e.target.checked)}
                                                        checked={!!row.isKey}
                                                        disabled={
                                                            !row.isKey && contacts?.filter((r) => r.isKey).length >= 4
                                                        }
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-sm flex justify-center items-center">
                                                    <Tooltip title="Delete" arrow>
                                                        <div className='bg-red-600 h-6 w-6 flex justify-center items-center rounded-full text-white'>
                                                            <Components.IconButton onClick={() => handleOpenDeleteDialog(row.id)}>
                                                                <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer text-white h-3 w-3' />
                                                            </Components.IconButton>
                                                        </div>
                                                    </Tooltip>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-4 text-center text-sm font-semibold">
                                                No records
                                            </td>
                                        </tr>
                                    )}
                                </tbody>

                                {/* Sticky footer summary */}
                                <tfoot className="bg-gray-100 sticky bottom-0">
                                    <tr>
                                        <td colSpan={3} className="px-4 py-2 text-sm font-semibold text-gray-700">
                                            <div className="flex justify-between items-center">
                                                <span>Key Contacts: {contacts?.filter((r) => r.isKey).length} / 4</span>
                                                <span>Total Contacts: {contacts.length}</span>
                                            </div>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </Components.DialogContent>

                <Components.DialogActions>
                    <div className="flex justify-end items-center gap-4">
                        <Button disabled={contacts?.length === 0} type="button" text={'Save'} onClick={() => submit()} endIcon={<CustomIcons iconName={'fa-solid fa-floppy-disk'} css='cursor-pointer' />} />
                        <Button type="button" text={'Cancel'} useFor="disabled" onClick={() => onClose()} startIcon={<CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer mr-2' />} />
                    </div>
                </Components.DialogActions>
            </BootstrapDialog>
            <AlertDialog
                open={dialog.open}
                title={dialog.title}
                message={dialog.message}
                actionButtonText={dialog.actionButtonText}
                handleAction={() => handleDeleteContact()}
                handleClose={() => handleCloseDeleteDialog()}
            />
        </React.Fragment>
    );
}

const mapDispatchToProps = { setAlert, setSyncingPushStatus };
export default connect(null, mapDispatchToProps)(OpportunityKeyContactModel);
