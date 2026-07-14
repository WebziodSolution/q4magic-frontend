import React, { useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { connect } from 'react-redux';
import Components from '../../muiComponents/components';
import Button from '../../common/buttons/button';
import CustomIcons from '../../common/icons/CustomIcons';
import { getUserDetails, encryptUserId } from '../../../utils/getUserDetails';
import { setAlert } from '../../../redux/commonReducers/commonReducers';
import { siteURL } from '../../../config/config';
import SendEmailAppointmentModel from './sendEmailAppointmentModel';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(3),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(2),
    },
}));

function AppointmentLinkModel({ setAlert, open, handleClose }) {
    const theme = useTheme();
    const [shareAnchorEl, setShareAnchorEl] = useState(null);
    const [sendEmailOpen, setSendEmailOpen] = useState(false);

    const userDetails = getUserDetails();
    const cusId = userDetails?.userId;
    const encryptedUserId = encryptUserId(cusId);

    const displayLink = `${siteURL}/meeting?v=${encryptedUserId}`;
    const testLink = `${window.location.origin}/meeting?v=${encryptedUserId}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(displayLink);
            setAlert({
                open: true,
                type: 'success',
                message: 'Appointment link copied to clipboard!',
            });
        } catch (err) {
            console.error('Failed to copy text: ', err);
            setAlert({
                open: true,
                type: 'error',
                message: 'Failed to copy link.',
            });
        }
    };

    const handleView = () => {
        window.open(testLink, '_blank');
    };

    const handleShareClick = (event) => {
        setShareAnchorEl(event.currentTarget);
    };

    const handleShareClose = () => {
        setShareAnchorEl(null);
    };

    const handleSendEmail = () => {
        handleShareClose();
        setSendEmailOpen(true);
    };

    return (
        <React.Fragment>
            <BootstrapDialog
                open={open}
                onClose={handleClose}
                aria-labelledby="appointment-link-dialog-title"
                fullWidth
                maxWidth="sm"
            >
                <Components.DialogTitle
                    sx={{ m: 0, p: 2, fontWeight: 600, fontSize: '1.25rem', color: theme.palette.text.primary }}
                    id="appointment-link-dialog-title"
                >
                    Meeting Link
                </Components.DialogTitle>

                <Components.IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: theme.palette.text.primary,
                    }}
                >
                    <CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer text-gray-500 w-5 h-5' />
                </Components.IconButton>

                <Components.DialogContent dividers>
                    <div className="flex flex-col gap-4">
                        <p className="text-sm font-bold text-gray-800">
                            Send Public Meeting Link in Email or Text
                        </p>

                        <div className="flex items-center justify-between border-b border-gray-300 pb-2 pt-1 w-full gap-4">
                            <span className="text-gray-700 select-all font-normal break-all text-sm md:text-base">
                                {displayLink}
                            </span>
                            <div className="flex items-center gap-3 flex-shrink-0 text-gray-500">
                                {/* Copy Button */}
                                <Components.Tooltip title="Copy Link" arrow>
                                    <div onClick={handleCopy} className="cursor-pointer hover:text-[#44288E] transition-colors p-1">
                                        <CustomIcons iconName="fa-solid fa-copy" css="w-4 h-4" />
                                    </div>
                                </Components.Tooltip>

                                {/* View Button */}
                                <Components.Tooltip title="Open Link" arrow>
                                    <div onClick={handleView} className="cursor-pointer hover:text-[#44288E] transition-colors p-1">
                                        <CustomIcons iconName="fa-solid fa-eye" css="w-4 h-4" />
                                    </div>
                                </Components.Tooltip>

                                {/* Share Button */}
                                <Components.Tooltip title="Share" arrow>
                                    <div onClick={handleShareClick} className="cursor-pointer hover:text-[#44288E] transition-colors p-1">
                                        <CustomIcons iconName="fa-solid fa-share-nodes" css="w-4 h-4" />
                                    </div>
                                </Components.Tooltip>
                            </div>
                        </div>
                    </div>

                    {/* Share Dropdown Menu */}
                    <Components.Menu
                        anchorEl={shareAnchorEl}
                        open={Boolean(shareAnchorEl)}
                        onClose={handleShareClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                    >
                        <Components.MenuItem onClick={handleSendEmail} sx={{ gap: 1.5, minWidth: '150px' }}>
                            <CustomIcons iconName="fa-solid fa-envelope" css="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-800">Send Email</span>
                        </Components.MenuItem>
                    </Components.Menu>
                </Components.DialogContent>

                <Components.DialogActions>
                    <Button
                        type="button"
                        text={'Close'}
                        useFor="disabled"
                        onClick={handleClose}
                        startIcon={<CustomIcons iconName={'fa-solid fa-xmark'} css="cursor-pointer mr-2" />}
                    />
                </Components.DialogActions>
            </BootstrapDialog>

            <SendEmailAppointmentModel
                open={sendEmailOpen}
                handleClose={() => setSendEmailOpen(false)}
                displayLink={displayLink}
            />
        </React.Fragment>
    );
}

const mapDispatchToProps = { setAlert };
export default connect(null, mapDispatchToProps)(AppointmentLinkModel);
