import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { styled, useTheme } from '@mui/material/styles';
import { Controller, useForm } from 'react-hook-form';

import Components from '../../../components/muiComponents/components';
import Button from '../../../components/common/buttons/button';
import Input from '../../../components/common/input/input';
import { setAlert, setSyncingPushStatus } from '../../../redux/commonReducers/commonReducers';
import CustomIcons from '../../../components/common/icons/CustomIcons';
import Select from '../../../components/common/select/select';

import { getAllOpportunities } from '../../../service/opportunities/opportunitiesService';
import { createTodo, getTodo, updateTodo } from '../../../service/todo/todoService';
import DatePickerComponent from '../../common/datePickerComponent/datePickerComponent';
import dayjs from 'dayjs';
import { createTodoAssign, getTodoAssign, updateTodoAssign } from '../../../service/todoAssign/todoAssignService';
import { getAllSubUsers } from '../../../service/customers/customersService';
import { getAllTeams } from '../../../service/teamDetails/teamDetailsService';
import { handleRequestClose } from '../../../service/common/commonService';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

function AssignTodo({ setAlert, open, handleClose, id, todoData }) {
    const theme = useTheme()

    const [loading, setLoading] = useState(false);
    const [teams, setTeams] = useState([]);
    const [customers, setCustomers] = useState([]);

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
            todoId: null,
            customerId: null,
            teamId: null,
            assignBy: null
        },
    });

    const onClose = () => {
        setLoading(false);
        reset({
            id: null,
            todoId: null,
            customerId: null,
            teamId: null,
            assignBy: null
        });
        handleClose();
    };

    const handleGetAllCustomers = async () => {
        if (open) {
            const res = await getAllSubUsers()
            const data = res?.data?.result?.map((item) => {
                return {
                    id: item.id,
                    title: item.username || item.name,
                    role: item.subUserTypeDto?.name || ''
                }
            })
            setCustomers(data)
        }
    }

    const handleGetAllTeams = async () => {
        if (open) {
            const res = await getAllTeams()
            const data = res?.data?.result?.map((item) => {
                return {
                    id: item.id,
                    title: item.name || ''
                }
            })
            setTeams(data)
        }
    }

    const handleGetTodoDetails = async () => {
        if (id && open) {
            const res = await getTodoAssign(id);
            if (res?.status === 200) {
                reset(res?.result);
            }
        }
    }

    useEffect(() => {
        handleGetAllTeams()
        handleGetAllCustomers()
        handleGetTodoDetails()
    }, [open])

    const submit = async (data) => {
        setLoading(true);
        const newData = {
            ...data,
            todoId: todoData?.id || null,
        }
        try {
            if (todoId) {
                const res = await updateTodoAssign(todoId, newData);
                if (res?.status === 200) {
                    onClose();
                } else {
                    setAlert({
                        open: true,
                        message: res?.message || "Failed to assign todo",
                        type: "error",
                    });
                }
            } else {
                const res = await createTodoAssign(newData);
                if (res?.status === 201) {
                    onClose();
                } else {
                    setAlert({
                        open: true,
                        message: res?.message || "Failed to assign todo",
                        type: "error",
                    });
                }
            }
        } catch (err) {
            setAlert({
                open: true,
                message: err.message || "Something went wrong",
                type: "error",
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
                    Assign {todoData?.title} To Team Or Members
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
                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <Controller
                                    name="teamId"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            options={teams}
                                            label={"Teams"}
                                            placeholder="Select Team"
                                            value={parseInt(watch("teamId")) || null}
                                            onChange={(_, newValue) => {
                                                if (newValue?.id) {
                                                    field.onChange(newValue.id);
                                                } else {
                                                    setValue("teamId", null);
                                                }
                                            }}
                                        />
                                    )}
                                />
                            </div>
                            <div>
                                <Controller
                                    name="customerId"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            options={customers}
                                            label={"Members"}
                                            placeholder="Select Member"
                                            value={parseInt(watch("customerId")) || null}
                                            onChange={(_, newValue) => {
                                                if (newValue?.id) {
                                                    field.onChange(newValue.id);
                                                } else {
                                                    setValue("customerId", null);
                                                }
                                            }}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </Components.DialogContent>

                    <Components.DialogActions>
                        <div className='flex justify-end items-center gap-4'>
                            <Button type={`submit`} text={todoId ? "Update" : "Submit"} isLoading={loading} />
                            <Button type="button" text={"Cancel"} disabled={loading} useFor='disabled' onClick={() => onClose()} />
                        </div>
                    </Components.DialogActions>
                </form>
            </BootstrapDialog>
        </React.Fragment>
    );
}

const mapDispatchToProps = {
    setAlert,
    setSyncingPushStatus
};

export default connect(null, mapDispatchToProps)(AssignTodo)
