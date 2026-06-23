import React, { useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Components from '../../muiComponents/components';
import Button from '../../common/buttons/button';
import CustomIcons from '../../common/icons/CustomIcons';
import Checkbox from '../../common/checkBox/checkbox';
import { deleteEvent } from '../../../service/calendar/calendarService';
import { connect } from 'react-redux';
import { setAlert } from '../../../redux/commonReducers/commonReducers';
import { handleRequestClose } from '../../../service/common/commonService';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

function DeleteEventAlert({ setAlert, open, handleClose, loading, id, thirdPartyCalendar, closeIcon = true, calParentId, deleteAll, handleGetAllEvents }) {
    const theme = useTheme();
    const [googleCalendar, setGoogleCalendar] = useState(false);
    const [outlookCalendar, setOutlookCalendar] = useState(false);

    const onClose = () => {
        handleClose();
        setGoogleCalendar(false);
        setOutlookCalendar(false);
    };

    const handleAction = async () => {
        const payload = {
            calId: id,
            googleCalendar: googleCalendar,
            outlookCalendar: outlookCalendar,
            calParentId: calParentId,
            deleteAll: deleteAll
        }
        const res = await deleteEvent(payload);
        if (res.status === 200) {
            handleGetAllEvents()
            onClose();
            setAlert({
                open: true,
                type: 'success',
                message: 'Event deleted successfully',
            })
        } else {
            setAlert({
                open: true,
                type: 'error',
                message: res.message || 'Failed to delete event',
            })
        }
    }

    return (
        <React.Fragment>
            <BootstrapDialog
                open={open}
                onClose={(event, reason) => handleRequestClose(event, reason, onClose)}
                aria-labelledby="customized-dialog-title"
                fullWidth
                maxWidth='sm'
            >
                <Components.DialogTitle sx={{ m: 0, p: 2, color: theme.palette.text.primary }} id="customized-dialog-title">
                    Delete Event
                </Components.DialogTitle>
                {
                    closeIcon && (
                        <Components.IconButton
                            aria-label="close"
                            onClick={onClose}
                            sx={(theme) => ({
                                position: 'absolute',
                                right: 8,
                                top: 8,
                                color: theme.palette.text.primary,
                            })}
                        >
                            <CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer text-black w-5 h-5' />
                        </Components.IconButton>
                    )
                }
                <Components.DialogContent dividers style={{ color: theme.palette.text.primary }}>
                    <div>
                        <p className='ml-2.5 mb-2'>
                            Are you sure you want to delete selected event?
                        </p>
                        <div className='w-72'>
                            {
                                thirdPartyCalendar?.googleCalendar && (
                                    <Checkbox
                                        text={"Delete from Google Calendar"}
                                        checked={googleCalendar}
                                        onChange={(e) => setGoogleCalendar(e.target.checked)}
                                        size={"medium"}
                                    />
                                )
                            }
                            {
                                thirdPartyCalendar?.outlookCalendar && (
                                    <Checkbox
                                        text={"Delete from Outlook Calendar"}
                                        checked={outlookCalendar}
                                        onChange={(e) => setOutlookCalendar(e.target.checked)}
                                        size={"medium"}
                                    />
                                )
                            }
                        </div>
                    </div>
                </Components.DialogContent>
                <Components.DialogActions>
                    <div className='flex justify-end items-center gap-2 w-full'>
                        <div>
                            <Button useFor={`error`} type={`button`} text={"Yes"} onClick={handleAction} isLoading={loading} />
                        </div>
                        <div>
                            <Button useFor={`disabled`} type={`button`} text={"No"} onClick={onClose} isLoading={loading} />
                        </div>
                    </div>
                </Components.DialogActions>
            </BootstrapDialog>
        </React.Fragment>
    );
}

const mapDispatchToProps = { setAlert };
export default connect(null, mapDispatchToProps)(DeleteEventAlert);

