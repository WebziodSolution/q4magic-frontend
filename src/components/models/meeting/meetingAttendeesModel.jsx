import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { Controller, useForm } from 'react-hook-form';
import { connect } from 'react-redux';
import { setAlert } from '../../../redux/commonReducers/commonReducers';

import Components from '../../muiComponents/components';
import Button from '../../common/buttons/button';
import CustomIcons from '../../common/icons/CustomIcons';

import Input from '../../common/input/input';
import { getMeetingsAttendeesById, saveMeetingAttendees, updateMeetingAttendees } from '../../../service/meetingAttendees/meetingAttendeesService';
import { getAllOpportunitiesContact } from '../../../service/opportunities/opportunitiesContactService';
import Select from '../../common/select/select';
import { handleRequestClose } from '../../../service/common/commonService';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

function MeetingAttendeesModel({ setAlert, open, handleClose, meetingid, id, opportunityId, handleGetAllMeetingAttendees }) {
    const theme = useTheme()

    const [opportunitiesContacts, setOpportunitiesContacts] = useState([])

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
            meetingId: null,
            contactId: null,
            title: null,
            role: null,
            note: null,
        },
    });

    const onClose = () => {
        reset({
            id: null,
            meetingId: null,
            contactId: null,
            title: null,
            role: null,
            note: null,
        });
        handleClose();
    };

    const handleGetMeetingsAttendeesById = async () => {
        if (id && open) {
            const res = await getMeetingsAttendeesById(id)
            if (res.status === 200) {
                reset(res.result)
            }
        }
    }

    const handleGetOppContacts = async () => {
        if (open && opportunityId) {
            const res = await getAllOpportunitiesContact(opportunityId);
            const data = res?.result?.map((item) => ({
                id: item.contactId,
                title: item.contactName,
                role: item.role,
                contactTitle: item.role,
            })) || [];
            setOpportunitiesContacts(data);
        }
    };

    useEffect(() => {
        handleGetOppContacts()
        handleGetMeetingsAttendeesById()
    }, [open])

    const submit = async (data) => {
        const newData = {
            ...data,
            meetingId: meetingid,
        }

        if (id) {
            const res = await updateMeetingAttendees(id, newData)
            if (res.status === 200) {
                handleGetAllMeetingAttendees(meetingid)
                onClose()
            } else {
                setAlert({
                    open: true,
                    message: res.message || "Fail to update attendees",
                    type: "error"
                })
            }
        } else {
            const res = await saveMeetingAttendees(newData);
            if (res.status === 201) {
                handleGetAllMeetingAttendees(meetingid)
                onClose()
            } else {
                setAlert({
                    open: true,
                    message: res.message || "Fail to save attendees",
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
                    {id ? "Update" : "Add"} Attendees
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
                                        name="contactId"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Select
                                                options={opportunitiesContacts}
                                                label="Contact"
                                                placeholder="Select contact"
                                                value={parseInt(watch('contactId')) || null}
                                                onChange={(_, newValue) => {
                                                    field.onChange(newValue?.id || null);
                                                    setValue("title", newValue?.role || null);
                                                    setValue("role", newValue?.role || null);
                                                }}
                                                error={errors.contactId}
                                            />

                                        )}
                                    />
                                </div>

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
                                                type={`text`}
                                                error={errors.title}
                                            />
                                        )}
                                    />
                                </div>
                                <div>
                                    <Controller
                                        name="role"
                                        control={control}
                                        rules={{
                                            required: "Role is required",
                                        }}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                label="Role"
                                                type={`text`}
                                                error={errors.role}
                                            />
                                        )}
                                    />
                                </div>

                                <div>
                                    <Controller
                                        name="note"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                label="Note"
                                                type={`text`}
                                                multiline={true}
                                                rows={3}
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

export default connect(null, mapDispatchToProps)(MeetingAttendeesModel)