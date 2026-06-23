import React from 'react';
import { connect } from 'react-redux';
import { styled, useTheme } from '@mui/material/styles';

import Components from '../../muiComponents/components';
import Button from '../../common/buttons/button';
import { setAlert } from '../../../redux/commonReducers/commonReducers';
import CustomIcons from '../../common/icons/CustomIcons';

// NEW: uploader + picker
import MultipleFileUpload from '../../fileInputBox/multipleFileUpload';
import { handleRequestClose } from '../../../service/common/commonService';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': { padding: theme.spacing(2) },
    '& .MuiDialogActions-root': { padding: theme.spacing(1) },
}));

function AttachmentsModel({ setAlert, open, handleClose, data }) {
    const theme = useTheme();

    const onClose = () => {
        handleClose()
    };

    return (
        <React.Fragment>
            <BootstrapDialog onClose={(event, reason) => handleRequestClose(event, reason, onClose)} open={open} aria-labelledby="customized-dialog-title" fullWidth maxWidth='md'>
                <Components.DialogTitle sx={{ m: 0, p: 2, color: theme.palette.text.primary }} id="customized-dialog-title">
                    Attachments
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
                    <CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer text-black w-5 h-5' />
                </Components.IconButton>


                <Components.DialogContent dividers>
                    <div>
                        <MultipleFileUpload
                            existingImages={data?.attachments}
                            isFileUpload={false}
                            removableExistingAttachments={false}
                        />
                    </div>
                </Components.DialogContent>

                <Components.DialogActions>
                    <div className='flex justify-end items-center gap-4'>
                        <Button type="button" text={"Cancel"} useFor='disabled' onClick={() => onClose()} startIcon={<CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer mr-3' />} />
                    </div>
                </Components.DialogActions>
            </BootstrapDialog>
        </React.Fragment>
    );
}

const mapDispatchToProps = {
    setAlert
};

export default connect(null, mapDispatchToProps)(AttachmentsModel);