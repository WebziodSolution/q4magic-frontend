import React, { useEffect } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { connect } from 'react-redux';
import { Controller, useForm } from 'react-hook-form';
import { setAlert, setLoading } from '../../../../redux/commonReducers/commonReducers';

import Components from '../../../../components/muiComponents/components';
import Button from '../../../../components/common/buttons/button';
import Input from '../../../../components/common/input/input';
import CustomIcons from '../../../../components/common/icons/CustomIcons';

import { createProcessName, getProcessName, updateProcessName } from '../../../../service/processName/processNameService';
import { getUserDetails } from '../../../../utils/getUserDetails';
import { handleRequestClose } from '../../../../service/common/commonService';


const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

function AddSalesProcessName({ setAlert, open, handleClose, id, oppId, handleGetAllSalesProcessName }) {
    const theme = useTheme()
    const userdata = getUserDetails();

    const {
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            id: "",
            name: ""
        },
    });

    const onClose = () => {
        reset({
            id: "",
            name: ""
        });
        handleClose();
    };

    const handleGetSalesProcessName = async () => {
        if (open && id) {
            const res = await getProcessName(id);
            if (res.status === 200) {
                reset(res.result);
            }
        }
    }

    useEffect(() => {
        handleGetSalesProcessName()
    }, [open])

    const submit = async (data) => {
        const newData = {
            ...data,
            createdBy: userdata.userId,
            oppId: oppId
        }
        if (id) {
            const res = await updateProcessName(id, newData);
            if (res.status === 200) {
                onClose()
                handleGetAllSalesProcessName()
            } else {
                setAlert({
                    open: true,
                    message: res.message,
                    type: "error"
                })
            }
        } else {
            const res = await createProcessName(newData);
            if (res.status === 201) {
                onClose()
                handleGetAllSalesProcessName()
            } else {
                setAlert({
                    open: true,
                    message: res.message,
                    type: "error"
                })
            }
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
                    {id ? "Update" : "Add"} Sales Process Name
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
                        <div className='grid gap-[30px]'>
                            <div>
                                <Controller
                                    name="name"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Process Name"
                                            type={`text`}
                                            requiredFiledLabel={true}
                                            onChange={(e) => {
                                                field.onChange(e);
                                            }}
                                            error={errors?.name}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </Components.DialogContent>

                    <Components.DialogActions>
                        <div className='flex justify-end items-center gap-4'>
                            <Button type={`submit`} text={id ? "Update" : "Submit"} endIcon={<CustomIcons iconName={'fa-solid fa-floppy-disk'} css='cursor-pointer' />} />
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
    setLoading
};

export default connect(null, mapDispatchToProps)(AddSalesProcessName)