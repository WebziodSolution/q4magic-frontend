import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { connect } from 'react-redux';
import { setAlert } from '../../../redux/commonReducers/commonReducers';

import Components from '../../muiComponents/components';
import Button from '../../common/buttons/button';
import CustomIcons from '../../common/icons/CustomIcons';
import { getClosePlanByOppIdAndStatus } from '../../../service/closePlanService/closePlanService';
import { handleRequestClose } from '../../../service/common/commonService';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': { padding: theme.spacing(2) },
    '& .MuiDialogActions-root': { padding: theme.spacing(1) },
}));

function ClosePlanThumbModel({ setAlert, open, handleClose, opportunityId }) {
    const theme = useTheme();
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(false);

    const onClose = () => {
        setContacts([]);
        handleClose();
    };
  
    const getInitials = (name = '') => {
        const parts = name.trim().split(' ').filter(Boolean);
        const a = parts?.[0]?.[0] || 'U';
        const b = parts?.[1]?.[0] || '';
        return (a + b).toUpperCase();
    };

    const getStatusMeta = (status = '') => {
        const s = (status || '').toLowerCase();
        if (s.includes('active') || s.includes('open')) return { label: status || 'Active', cls: 'bg-[#0478DC]/10 text-[#0478DC] border-[#0478DC]/30' };
        if (s.includes('close') || s.includes('done')) return { label: status || 'Closed', cls: 'bg-green-50 text-green-700 border-green-200' };
        if (s.includes('pending')) return { label: status || 'Pending', cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' };
        return { label: status || '—', cls: 'bg-gray-50 text-gray-700 border-gray-200' };
    };

    const handleGetAllContact = async () => {
        if (!open || !opportunityId) return;

        setLoading(true);
        try {
            const res = await getClosePlanByOppIdAndStatus(opportunityId);
            const data =
                res?.result?.map((item) => ({
                    id: item.id,
                    contactName: item.contactName,
                    date: item.date,
                    status: item.status,
                })) || [];
            setContacts(data);
        } catch (e) {
            setContacts([]);
            setAlert && setAlert({ message: 'Failed to load contacts', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleGetAllContact();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    return (
        <React.Fragment>
            <BootstrapDialog onClose={(event, reason) => handleRequestClose(event, reason, onClose)} open={open} aria-labelledby="customized-dialog-title" fullWidth maxWidth="md">
                <Components.DialogTitle sx={{ m: 0, p: 2, color: theme.palette.text.primary }} id="customized-dialog-title">
                    <p className="text-base sm:text-lg font-bold text-[#242424]">
                        Comment Reply
                    </p>
                    <span className="text-xs sm:text-sm text-gray-500">
                        Showing contacts linked to this close plan
                    </span>
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
                            {loading ? (
                                <div className="space-y-3">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="rounded-2xl border border-gray-200 bg-white p-4 animate-pulse">
                                            <div className="flex items-start gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gray-200" />
                                                <div className="flex-1">
                                                    <div className="h-3 w-40 bg-gray-200 rounded mb-2" />
                                                    <div className="h-3 w-28 bg-gray-200 rounded" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : contacts?.length ? (
                                <div className="space-y-3">
                                    {contacts.map((row) => {
                                        const status = getStatusMeta(row?.status);
                                        return (
                                            <div
                                                key={row?.id}
                                                className="group rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition"
                                            >
                                                <div className="flex items-start gap-3">
                                                    {/* Avatar */}
                                                    <div className="h-10 w-10 shrink-0 rounded-full bg-[#7413D1]/10 flex items-center justify-center">
                                                        <span className="text-[#7413D1] font-bold text-sm">
                                                            {getInitials(row?.contactName)}
                                                        </span>
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <div className="font-semibold text-[#242424] text-sm truncate max-w-[220px] sm:max-w-[420px]">
                                                                {row?.contactName || '—'}
                                                            </div>                                                         
                                                        </div>

                                                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                                                            <CustomIcons iconName={'fa-solid fa-thumbs-up'} css="text-yellow-500 h-4 w-4" />
                                                            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${status.cls}`}>
                                                                {status.label}
                                                            </span>
                                                        </div>
                                                    </div>                                                  
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center">
                                    <div className="max-w-md text-center p-6">
                                        <div className="mx-auto h-12 w-12 rounded-2xl bg-[#0478DC]/10 flex items-center justify-center">
                                            <CustomIcons iconName={'fa-solid fa-circle-info'} css="text-[#0478DC] h-5 w-5" />
                                        </div>
                                        <h3 className="mt-3 text-sm font-bold text-[#242424]">No Reply Found</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            This close plan doesn’t have any linked yet.
                                        </p>
                                    </div>
                                </div>
                            )}
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
        </React.Fragment>
    );
}

const mapDispatchToProps = { setAlert };
export default connect(null, mapDispatchToProps)(ClosePlanThumbModel);
