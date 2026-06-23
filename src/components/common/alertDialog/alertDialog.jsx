import React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Components from '../../muiComponents/components';
import Button from '../buttons/button';
import CustomIcons from '../icons/CustomIcons';
import { handleRequestClose } from '../../../service/common/commonService';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

export default function AlertDialog({ open, handleClose, title, message, handleAction, actionButtonText, loading, closeIcon = true, cancelButtonText = "No", cancelAction = true }) {
    const theme = useTheme();

    const onClose = () => {
        handleClose();
    };

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
                    {title}
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
                    <Components.Typography gutterBottom>
                        {message}
                    </Components.Typography>
                </Components.DialogContent>
                <Components.DialogActions>
                    <div className='flex justify-end items-center gap-2 w-full'>
                        <div>
                            <Button useFor={`error`} type={`button`} text={actionButtonText} onClick={handleAction} isLoading={loading} />
                        </div>
                        {
                            cancelAction && (
                                <div>
                                    <Button useFor={`disabled`} type={`button`} text={cancelButtonText} onClick={handleClose} isLoading={loading} />
                                </div>
                            )
                        }
                    </div>
                </Components.DialogActions>
            </BootstrapDialog>
        </React.Fragment>
    );
}
