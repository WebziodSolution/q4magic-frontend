import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { styled, useTheme } from '@mui/material/styles';
import { Controller, useForm } from 'react-hook-form';

import Components from '../../../components/muiComponents/components';
import Button from '../../../components/common/buttons/button';
import Input from '../../../components/common/input/input';
import Select from '../../../components/common/select/select';
import CustomIcons from '../../../components/common/icons/CustomIcons';
import { setAlert } from '../../../redux/commonReducers/commonReducers';
import { handleRequestClose } from '../../../service/common/commonService';
import { getEventTypeList, saveAppointmentEventType } from '../../../service/calendar/calendarAppointmentEventType/calendarAppointmentEventTypeService';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

function AppointmentEventTypeModel({ setAlert, open, handleClose, eventTypeId, handleGetAllEventTypes }) {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);

    const {
        handleSubmit,
        control,
        reset,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            id: null,
            title: '',
            description: '',
            durationHours: null,
            durationMinutes: null,
        },
    });

    // Populate options for Hours (0-24) and Minutes (0-55 in steps of 5)
    const hourOptions = Array.from({ length: 24 }, (_, i) => ({
        id: i,
        title: String(i),
    }));

    const minuteOptions = Array.from({ length: 4 }, (_, i) => ({
        id: i * 15,
        title: String(i * 15),
    }));

    const onClose = () => {
        setLoading(false);
        reset({
            id: null,
            title: '',
            description: '',
            durationHours: null,
            durationMinutes: null,
        });
        handleClose();
    };

    const handleGetEventTypeDetails = async () => {
        if (eventTypeId && open) {
            try {
                setLoading(true);
                const res = await getEventTypeList(eventTypeId);
                if (res?.status === 200) {
                    const data = res?.result;
                    reset({
                        id: data?.id || null,
                        title: data?.title || '',
                        description: data?.description || '',
                        durationHours: data?.durationHours,
                        durationMinutes: data?.durationMinutes,
                    });
                }
            } catch (error) {
                console.error("Error fetching event type details:", error);
                setAlert({
                    open: true,
                    message: "Failed to fetch event type details",
                    type: "error"
                });
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        if (open) {
            if (eventTypeId) {
                handleGetEventTypeDetails();
            } else {
                reset({
                    id: null,
                    title: '',
                    description: '',
                    durationHours: null,
                    durationMinutes: null,
                });
            }
        }
    }, [open, eventTypeId]);

    const submit = async (data) => {
        if (data.durationHours === 0 && data.durationMinutes === 0) {
            setAlert({
                open: true,
                message: "Duration cannot be 0 hours and 0 minutes",
                type: "error"
            });
            return;
        }

        setLoading(true);

        try {
            const res = await saveAppointmentEventType(eventTypeId || null, data);
            if (res?.status === 200 || res?.status === 201) {
                setAlert({
                    open: true,
                    message: `Event type ${eventTypeId ? 'updated' : 'created'} successfully`,
                    type: "success"
                });
                handleGetAllEventTypes();
                onClose();
            } else {
                setAlert({
                    open: true,
                    message: res?.message || "Failed to save event type",
                    type: "error"
                });
            }
        } catch (err) {
            setAlert({
                open: true,
                message: err.message || "Something went wrong",
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    };

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
                    {eventTypeId ? "Update" : "Add"} Appointment Event Type
                </Components.DialogTitle>

                <Components.IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: theme.palette.primary.icon,
                    }}
                >
                    <CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer text-black w-5 h-5' />
                </Components.IconButton>

                <form noValidate onSubmit={handleSubmit(submit)}>
                    <Components.DialogContent dividers>
                        <div className='px-[15px]'>
                            <div className='grid gap-[20px]'>
                                <Controller
                                    name="title"
                                    control={control}
                                    rules={{
                                        required: "Event Title is required",
                                    }}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Event Title"
                                            type="text"
                                            requiredFiledLabel={true}
                                            error={errors.title}
                                        />
                                    )}
                                />

                                <Controller
                                    name="description"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Event Description"
                                            type="text"
                                            multiline={true}
                                            rows={3}
                                        />
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <Controller
                                        name="durationHours"
                                        control={control}
                                        rules={{
                                            required: "Hours is required",
                                        }}
                                        render={({ field }) => (
                                            <Select
                                                options={hourOptions}
                                                label="Hours"
                                                placeholder="Select Hours"
                                                value={field.value}
                                                requiredFiledLabel={true}
                                                onChange={(_, newValue) => {
                                                    field.onChange(newValue ? newValue.id : null);
                                                }}
                                                error={errors.durationHours}
                                            />
                                        )}
                                    />

                                    <Controller
                                        name="durationMinutes"
                                        control={control}
                                        rules={{
                                            required: "Minutes is required",
                                        }}
                                        render={({ field }) => (
                                            <Select
                                                options={minuteOptions}
                                                label="Minutes"
                                                placeholder="Select Minutes"
                                                value={field.value}
                                                requiredFiledLabel={true}
                                                onChange={(_, newValue) => {
                                                    field.onChange(newValue ? newValue.id : null);
                                                }}
                                                error={errors.durationMinutes}
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </Components.DialogContent>

                    <Components.DialogActions>
                        <div className='flex justify-end items-center gap-4'>
                            <Button type="submit" text={eventTypeId ? "Update" : "Save"} isLoading={loading} endIcon={<CustomIcons iconName={'fa-solid fa-floppy-disk'} css='cursor-pointer' />} />
                            <Button type="button" text="Cancel" useFor='disabled' onClick={onClose} startIcon={<CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer mr-2' />} />
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

export default connect(null, mapDispatchToProps)(AppointmentEventTypeModel);
