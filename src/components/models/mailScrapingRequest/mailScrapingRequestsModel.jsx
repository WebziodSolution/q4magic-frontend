import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { Controller, useForm } from 'react-hook-form';
import { connect } from 'react-redux';

import Components from '../../../components/muiComponents/components';
import Button from '../../../components/common/buttons/button';
import Input from '../../../components/common/input/input';
import { setAlert } from '../../../redux/commonReducers/commonReducers';
import CustomIcons from '../../../components/common/icons/CustomIcons';
import { changeScrapingMessageCount, getScrapingRequests } from '../../../service/emailScrapingRequest/emailScrapingRequest';
import { handleRequestClose } from '../../../service/common/commonService';


const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

function MailScrapingRequestsModel({ setAlert, open, handleClose, id, handleGetAllRecords }) {
    const theme = useTheme()

    const [loading, setLoading] = useState(false);

    const {
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            maxMessages: null
        },
    });

    const onClose = () => {
        setLoading(false);
        reset({
            maxMessages: null
        });
        handleClose();
    };

    const handleGetDetails = async () => {
        if (id && open) {
            const res = await getScrapingRequests(id);
            if (res?.status === 200) {
                reset(res?.result);
            }
        }
    }

    useEffect(() => {
        handleGetDetails()
    }, [open])

    const submit = async (data) => {
        setLoading(true);
        try {
            if (id) {
                const res = await changeScrapingMessageCount(id, data?.maxMessages);
                if (res?.status === 200) {
                    handleGetAllRecords();
                    // handleGetAllSyncRecords();
                    onClose();
                } else {
                    setLoading(false);
                    setAlert({
                        open: true,
                        message: res?.message || "Failed to update account",
                        type: "error"
                    });
                }
            }
        } catch (err) {
            setLoading(false);
            setAlert({
                open: true,
                message: err.message || "Something went wrong",
                type: "error"
            })
        }
    }

    return (
        <React.Fragment>
            <BootstrapDialog
            onClose={(event, reason) => handleRequestClose(event, reason, onClose)}
                open={open}
                aria-labelledby="customized-dialog-title"
                fullWidth
                maxWidth='sm'
            >
                <Components.DialogTitle sx={{ m: 0, p: 2, color: theme.palette.text.primary }} id="customized-dialog-title">
                    Update Request
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

                <form noValidate onSubmit={handleSubmit(submit)}>
                    <Components.DialogContent dividers>
                        <div className='py-3 px-[30px]'>
                            <div className='grid grid-cols-1'>
                                <Controller
                                    name="maxMessages"
                                    control={control}
                                    rules={{
                                        required: "Masages is required",
                                    }}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Max Messages Count"
                                            type={`text`}
                                            error={errors.maxMessages}
                                            onChange={(e) => {
                                                const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                                field.onChange(numericValue);
                                            }}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </Components.DialogContent>

                    <Components.DialogActions>
                        <div className='flex justify-end items-center gap-4'>
                            <Button type={`submit`} text={"Update"} isLoading={loading} endIcon={<CustomIcons iconName={'fa-solid fa-floppy-disk'} css='cursor-pointer' />} />
                            <Button type="button" text={"Cancel"} useFor='disabled' onClick={() => onClose()} startIcon={<CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer mr-2' />} />
                        </div>
                    </Components.DialogActions>
                </form>
            </BootstrapDialog>
        </React.Fragment>
    );
}

const mapDispatchToProps = {
    setAlert,
};

export default connect(null, mapDispatchToProps)(MailScrapingRequestsModel)