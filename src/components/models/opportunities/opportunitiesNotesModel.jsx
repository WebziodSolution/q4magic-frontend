import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { Controller, useForm } from 'react-hook-form';
import { connect } from 'react-redux';
import { setAlert } from '../../../redux/commonReducers/commonReducers';

import Components from '../../muiComponents/components';
import Button from '../../common/buttons/button';
import CustomIcons from '../../common/icons/CustomIcons';

import Input from '../../common/input/input';
import { getNotesById, saveOppNotes, updateOppNotes } from '../../../service/opportunitiesComment/opportunitiesCommentService';
import { handleRequestClose } from '../../../service/common/commonService';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

function OpportunitiesNotesModel({ setAlert, open, handleClose, id, opportunityId, handleGetAllOpportunitiesNotes }) {
    const theme = useTheme()
    const {
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            id: null,
            title: null,
            comment: null,
        },
    });

    const onClose = () => {
        reset({
            id: null,
            title: null,
            comment: null,
        });
        handleClose();
    };

    const handleGetNotes = async () => {
        if (id && open) {
            const res = await getNotesById(id)
            if (res.status === 200) {
                reset(res.result)
            }
        }
    }

    useEffect(() => {
        handleGetNotes()
    }, [open])

    const submit = async (data) => {
        const newData = {
            ...data,
            oppId: opportunityId
        }

        if (id) {
            const res = await updateOppNotes(id, newData)
            if (res.status === 200) {
                handleGetAllOpportunitiesNotes()
                onClose()
            } else {
                setAlert({
                    open: true,
                    message: res.message || "Fail to update note",
                    type: "error"
                })
            }
        } else {
            const res = await saveOppNotes(newData);
            if (res.status === 201) {
                handleGetAllOpportunitiesNotes()
                onClose()
            } else {
                setAlert({
                    open: true,
                    message: res.message || "Fail to add note",
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
                    {id ? "Update" : "Add"} Note
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

                <form noValidate onSubmit={handleSubmit(submit)} className='h-full'>
                    <Components.DialogContent dividers>
                        <div className='px-[30px]'>
                            <div className='grid gap-[30px]'>
                                <div>
                                    <Controller
                                        name="title"
                                        control={control}
                                        rules={{
                                            required: "Title is required",
                                        }}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                label="Title"
                                                requiredFiledLabel={true}
                                                type={`text`}
                                                error={errors.title}
                                            />
                                        )}
                                    />
                                </div>
                                <div>
                                    <Controller
                                        name="comment"
                                        control={control}
                                        rules={{
                                            required: "Comment is required",
                                        }}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                label="Note"
                                                type={`text`}
                                                requiredFiledLabel={true}
                                                error={errors.comment}
                                            />
                                        )}
                                    />
                                </div>
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
};

export default connect(null, mapDispatchToProps)(OpportunitiesNotesModel)