import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { Controller, useForm } from 'react-hook-form';
import { connect } from 'react-redux';

import Components from '../../../components/muiComponents/components';
import Button from '../../../components/common/buttons/button';
import Input from '../../../components/common/input/input';
import { setAlert } from '../../../redux/commonReducers/commonReducers';
import CustomIcons from '../../../components/common/icons/CustomIcons';

import { getTempMail, updateMail } from '../../../service/tempMail/tempMail';
import { handleRequestClose } from '../../../service/common/commonService';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

function TempMailModel({ setAlert, open, handleClose, id, handleGetAllMails }) {
    const theme = useTheme()

    const [loading, setLoading] = useState(false);
    const {
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            email: '',
            companyName: '',
            jobTitle: '',
            website: '',
            phone: '',
        },
    });

    const onClose = () => {
        setLoading(false);
        reset({
            email: '',
            companyName: '',
            jobTitle: '',
            website: '',
            phone: '',
        });
        handleClose();
    };

    const handleGetMail = async () => {
        if (id && open) {
            const res = await getTempMail(id);
            if (res?.status === 200) {
                reset(res?.result);
            }
        }
    }

    useEffect(() => {
        handleGetMail()
    }, [open])

    const submit = async (data) => {
        setLoading(true);
        try {
            if (id) {
                const res = await updateMail(id, data);
                if (res?.status === 200) {
                    setLoading(false);
                    handleGetAllMails();
                    onClose();
                } else {
                    setLoading(false);
                    setAlert({
                        open: true,
                        message: res?.message || "Failed to update mail",
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
                maxWidth='md'
            >
                <Components.DialogTitle sx={{ m: 0, p: 2, color: theme.palette.text.primary }} id="customized-dialog-title">
                    Update E-Mail Details
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
                        <div className='px-[30px]'>
                            <div className='grid gap-[30px]'>
                                <Controller
                                    name="email"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Sender Email"
                                            type={`text`}
                                            disabled
                                        />
                                    )}
                                />
                                <Controller
                                    name="companyName"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Company Name"
                                            type={`text`}
                                            onChange={(e) => {
                                                field.onChange(e);
                                            }}
                                        />
                                    )}
                                />
                                <Controller
                                    name="jobTitle"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Job Title"
                                            type={`text`}
                                            error={errors.jobTitle}
                                            onChange={(e) => {
                                                field.onChange(e);
                                            }}
                                        />
                                    )}
                                />
                                <Controller
                                    name="phone"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Phone Number"
                                            type={`text`}
                                            onChange={(e) => {
                                                field.onChange(e.target.value);
                                            }}
                                        />
                                    )}
                                />
                                <Controller
                                    name="website"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Website"
                                            type={`text`}
                                            onChange={(e) => {
                                                field.onChange(e);
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
                            <Button type="button" text={"Cancel"} disabled={loading} useFor='disabled' onClick={() => onClose()} startIcon={<CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer mr-2' />} />
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

export default connect(null, mapDispatchToProps)(TempMailModel)