import React, { useState, useRef, useEffect } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { connect } from 'react-redux';
import Components from '../../muiComponents/components';
import Button from '../../common/buttons/button';
import CustomIcons from '../../common/icons/CustomIcons';
import { setAlert } from '../../../redux/commonReducers/commonReducers';
import { sendEmailAppointmentLink } from '../../../service/calendar/calendarAppointment/calendarAppointmentService';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(3),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(2),
    },
}));

function SendEmailAppointmentModel({ setAlert, open, handleClose, displayLink }) {
    const theme = useTheme();
    const inputRef = useRef(null);
    const [emails, setEmails] = useState([]);
    const [emailInput, setEmailInput] = useState('');
    const [message, setMessage] = useState('');
    const [sendLoading, setSendLoading] = useState(false);

    // Prefill message with the URL
    useEffect(() => {
        if (displayLink) {
            setMessage(`You may access my calendar by clicking this URL :\n\n${displayLink}`);
        }
    }, [displayLink, open]);

    // Reset fields when opening/closing
    useEffect(() => {
        if (!open) {
            setEmails([]);
            setEmailInput('');
        }
    }, [open]);

    const handleWrapperClick = () => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const trimmed = emailInput.trim().replace(/,/g, '');
            if (trimmed) {
                if (validateEmail(trimmed)) {
                    if (!emails.includes(trimmed)) {
                        setEmails([...emails, trimmed]);
                    }
                    setEmailInput('');
                } else {
                    setAlert({
                        open: true,
                        type: 'error',
                        message: 'Please enter a valid email address.',
                    });
                }
            }
        }
    };

    const handleRemoveEmail = (indexToRemove) => {
        setEmails(emails.filter((_, index) => index !== indexToRemove));
    };

    const handleSend = async () => {
        let finalEmails = [...emails];
        const trimmedInput = emailInput.trim();

        // Auto-add the currently typed email if it is valid
        if (trimmedInput) {
            if (validateEmail(trimmedInput)) {
                if (!finalEmails.includes(trimmedInput)) {
                    finalEmails.push(trimmedInput);
                }
            } else {
                setAlert({
                    open: true,
                    type: 'error',
                    message: `Invalid email address: "${trimmedInput}"`,
                });
                return;
            }
        }

        if (finalEmails.length === 0) {
            setAlert({
                open: true,
                type: 'error',
                message: 'Please add at least one email address.',
            });
            return;
        }

        setSendLoading(true);
        try {
            const payload = {
                emailsList: finalEmails,
                message: message
            };
            const res = await sendEmailAppointmentLink(payload);
            if (res?.status === 200) {
                setAlert({
                    open: true,
                    type: 'success',
                    message: 'Appointment link emailed successfully.',
                });
                handleClose();
            } else {
                setAlert({
                    open: true,
                    type: 'error',
                    message: res?.message || 'Failed to send email.',
                });
            }
        } catch (error) {
            console.error('Error sending appointment email:', error);
            setAlert({
                open: true,
                type: 'error',
                message: 'Error sending appointment email link.',
            });
        } finally {
            setSendLoading(false);
        }
    };

    return (
        <React.Fragment>
            <BootstrapDialog
                open={open}
                onClose={handleClose}
                aria-labelledby="send-email-dialog-title"
                fullWidth
                maxWidth="sm"
            >
                <Components.DialogTitle
                    sx={{ m: 0, p: 2, fontWeight: 600, fontSize: '1.25rem', color: theme.palette.text.primary }}
                    id="send-email-dialog-title"
                >
                    Send Email
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
                    <CustomIcons iconName={'fa-solid fa-xmark'} css="cursor-pointer text-gray-500 w-5 h-5" />
                </Components.IconButton>

                <Components.DialogContent dividers>
                    <div className="flex flex-col gap-6 py-2">
                        {/* Custom Emails Chip Input */}
                        <div className="flex flex-col gap-1.5 w-full text-left">
                            <span className="text-xs text-gray-500 font-medium">Email</span>
                            <div
                                onClick={handleWrapperClick}
                                className="flex flex-wrap gap-2 items-center border-b border-gray-300 pb-2 cursor-text min-h-[40px] w-full"
                            >
                                {emails.map((email, index) => (
                                    <Components.Chip
                                        key={email}
                                        label={email}
                                        onDelete={() => handleRemoveEmail(index)}
                                        size="small"
                                        sx={{
                                            backgroundColor: '#f1f1f1',
                                            color: '#333333',
                                            fontSize: '0.8125rem',
                                            '& .MuiChip-deleteIcon': {
                                                color: '#888888',
                                                '&:hover': {
                                                    color: '#555555',
                                                },
                                            },
                                        }}
                                    />
                                ))}
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={emailInput}
                                    onChange={(e) => setEmailInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={emails.length === 0 ? "Type email and press Enter..." : ""}
                                    className="flex-grow min-w-[150px] border-none outline-none text-sm text-gray-800 bg-transparent py-0.5"
                                />
                            </div>
                        </div>

                        {/* Message Textfield */}
                        <div className="w-full text-left">
                            <Components.TextField
                                multiline
                                minRows={4}
                                variant="standard"
                                label="Message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                fullWidth
                                InputLabelProps={{
                                    shrink: true,
                                    sx: {
                                        color: '#3b82f6',
                                        fontWeight: 500,
                                        fontSize: '14px',
                                        '&.Mui-focused': {
                                            color: '#3b82f6',
                                        }
                                    }
                                }}
                                sx={{
                                    '& .MuiInput-underline:before': {
                                        borderBottomColor: '#d1d5db',
                                    },
                                    '& .MuiInput-underline:after': {
                                        borderBottomColor: '#3b82f6',
                                    },
                                    '& .MuiInputBase-input': {
                                        fontSize: '15px',
                                        lineHeight: '1.5',
                                        color: '#333333',
                                    }
                                }}
                            />
                        </div>
                    </div>
                </Components.DialogContent>

                <Components.DialogActions>
                    <div className="flex justify-end gap-2 w-full">
                        <Button
                            type="button"
                            text="SEND"
                            useFor="primary"
                            onClick={handleSend}
                            isLoading={sendLoading}
                            disabled={sendLoading}
                            sx={{ minWidth: '90px' }}
                        />
                        <Button
                            type="button"
                            text="CLOSE"
                            useFor="primary"
                            onClick={handleClose}
                            sx={{ minWidth: '90px' }}
                        />
                    </div>
                </Components.DialogActions>
            </BootstrapDialog>
        </React.Fragment>
    );
}

const mapDispatchToProps = { setAlert };
export default connect(null, mapDispatchToProps)(SendEmailAppointmentModel);
