import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { connect } from 'react-redux';
import { Controller, useForm } from 'react-hook-form';
import { setAlert, setLoading } from '../../../../redux/commonReducers/commonReducers';
import { getUserDetails } from '../../../../utils/getUserDetails';

import { Tooltip } from '@mui/material';
import AddSalesProcessName from './addSalesProcessName';
import Select from '../../../common/select/select';
import Components from '../../../../components/muiComponents/components';
import Button from '../../../../components/common/buttons/button';
import Input from '../../../../components/common/input/input';
import CustomIcons from '../../../../components/common/icons/CustomIcons';
import DatePickerComponent from '../../../common/datePickerComponent/datePickerComponent';

import { getAllProcessNameByCustomer } from '../../../../service/processName/processNameService';
import { createSalesProcess, getSalesProcess, updateSalesProcess } from '../../../../service/salesProcess/salesProcessService';
import { getAllOpportunitiesContact } from '../../../../service/opportunities/opportunitiesContactService';
import { handleRequestClose } from '../../../../service/common/commonService';


const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

function AddSalesProcessModel({ setAlert, open, handleClose, id, oppId, handleGetAllSalesProcess }) {
    const theme = useTheme()
    const userdata = getUserDetails();
    const [openModel, setOpenModel] = useState(false)

    const [salesProcessName, setSalesProcessName] = useState([])
    const [contacts, setContacts] = useState([])
    const [goLiveStage, setGoLiveStage] = useState(false)

    const {
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            id: "",
            oppId: "",
            goLive: null,
            reason: null,
            processDate: null,
            process: null,
            notes: "",
            contactId: null,
        },
    });

    const handleOpenModel = () => {
        setOpenModel(true)
    }
    const handleCloseModel = () => {
        setOpenModel(false)
    }

    const onClose = () => {
        reset({
            id: "",
            oppId: "",
            goLive: null,
            processDate: null,
            process: "",
            notes: "",
            contactId: null,
            reason: null
        });
        handleClose();
        setGoLiveStage(false)
    };

    const handleGetAllSalesProcessName = async () => {
        if (open) {
            const res = await getAllProcessNameByCustomer(userdata?.userId);
            if (res.status === 200) {
                const data = res?.result?.map((row) => ({
                    "id": row.id || null,
                    "title": row.name
                }));
                setSalesProcessName(data);
            }
        }
    }

    const handleGetAllContact = async () => {
        if (open) {
            const res = await getAllOpportunitiesContact(oppId);
            const data = res?.result?.map((item) => ({
                id: item.id,
                title: item?.contactName,
                oppId: oppId,
                contactId: item.contactId,
                role: item?.role,
                isKey: item.isKey,
                salesforceContactId: item?.salesforceContactId,
                isDeleted: false,
            })) || [];
            setContacts(data);
        }
    }

    const handleGetSalesProcess = async () => {
        if (open && id) {
            const res = await getSalesProcess(id);
            if (res.status === 200) {
                reset(res.result);
                setValue(
                    "process",
                    salesProcessName?.find(stage => stage.title === res?.result?.process)?.id || null
                );
            }
        }
    }

    useEffect(() => {
        handleGetAllSalesProcessName()
        handleGetAllContact()
        handleGetSalesProcess()
    }, [open])

    const submit = async (data, actionType = "submit") => {
        const newData = {
            ...data,
            process: salesProcessName?.find(stage => stage.id === parseInt(data.process))?.title || null,
            oppId: oppId
        };
        if (id) {
            // UPDATE
            const res = await updateSalesProcess(id, newData);
            if (res.status === 200) {
                // For update we always close
                onClose();
                handleGetAllSalesProcess();
            } else {
                setAlert({
                    open: true,
                    message: res.message,
                    type: "error",
                });
            }
        } else {
            // CREATE
            const res = await createSalesProcess(newData);
            if (res.status === 201) {

                if (actionType === "submitAndNew") {
                    // ✅ Keep modal open, just clear form for a new entry
                    reset({
                        id: "",
                        oppId: "",
                        goLive: null,
                        processDate: null,
                        process: "",
                        notes: "",
                        contactId: null,
                        reason: null,
                    });
                    setGoLiveStage(false); // hide Go Live fields again
                    handleGetAllSalesProcess();
                } else {
                    // Normal Submit → close modal
                    onClose();
                    handleGetAllSalesProcess();
                }

            } else {
                setAlert({
                    open: true,
                    message: res.message,
                    type: "error",
                });
            }
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
                    {id ? "Update" : "Add"} Close Plan
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

                <form
                    noValidate
                    onSubmit={handleSubmit((data) => submit(data, "submit"))}
                >
                    <Components.DialogContent dividers>
                        <div className='grid gap-[30px]'>
                            <div className="flex items-center gap-3">
                                <div className="w-full">
                                    <Controller
                                        name="process"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Select
                                                options={salesProcessName}
                                                label={"Name"}
                                                placeholder="Select process name"
                                                value={parseInt(watch("process")) || null}
                                                requiredFiledLabel={true}
                                                onChange={(_, newValue) => {
                                                    if (newValue?.id) {
                                                        field.onChange(newValue.id);
                                                        if (newValue.title === "Go Live") {
                                                            setGoLiveStage(true)
                                                        } else {
                                                            setGoLiveStage(false)
                                                        }
                                                    } else {
                                                        setValue("process", null);
                                                        setGoLiveStage(false)
                                                    }
                                                }}
                                                error={errors?.process}
                                            />
                                        )}
                                    />
                                </div>

                                <div className="flex items-center mt-7 gap-3">
                                    <Tooltip title="Add" arrow>
                                        <button
                                            type="button"
                                            onClick={handleOpenModel}
                                            className="bg-green-600 h-5 w-5 flex justify-center items-center rounded-full text-white"
                                        >
                                            <CustomIcons iconName="fa-solid fa-plus" css="text-white h-3 w-3" />
                                        </button>
                                    </Tooltip>
                                    {
                                        watch("process") && (
                                            <Tooltip title="Edit" arrow>
                                                <button
                                                    type="button"
                                                    onClick={handleOpenModel}
                                                    className="bg-blue-600 h-5 w-5 flex justify-center items-center rounded-full text-white"
                                                >
                                                    <CustomIcons iconName="fa-solid fa-pen-to-square" css="text-white h-3 w-3" />
                                                </button>
                                            </Tooltip>
                                        )
                                    }
                                </div>
                            </div>


                            <div>
                                <Controller
                                    name="contactId"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <Select
                                            options={contacts}
                                            label={"Contact"}
                                            requiredFiledLabel={true}
                                            placeholder="Select contact"
                                            value={parseInt(watch("contactId")) || null}
                                            onChange={(_, newValue) => {
                                                if (newValue?.id) {
                                                    field.onChange(newValue.id);
                                                } else {
                                                    setValue("contactId", null);
                                                }
                                            }}
                                            error={errors?.contactId}
                                        />
                                    )}
                                />
                            </div>

                            <div>
                                <DatePickerComponent requiredFiledLabel={true} setValue={setValue} control={control} name='processDate' label={`Process Date`} minDate={new Date()} maxDate={null} required={true} />
                            </div>

                            <div>
                                <Controller
                                    name="notes"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Notes"
                                            type={`text`}
                                            onChange={(e) => {
                                                field.onChange(e);
                                            }}
                                            multiline={true}
                                            rows={3}
                                        />
                                    )}
                                />
                            </div>

                            {
                                goLiveStage && (
                                    <>
                                        <div>
                                            <DatePickerComponent requiredFiledLabel={true} setValue={setValue} control={control} name='goLive' label={`Go Live`} minDate={new Date()} maxDate={null} required={true} />
                                        </div>

                                        <div>
                                            <Controller
                                                name="reason"
                                                control={control}
                                                rules={{ required: true }}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        label="Reason"
                                                        type={`text`}
                                                        requiredFiledLabel={true}
                                                        onChange={(e) => {
                                                            field.onChange(e);
                                                        }}
                                                        multiline={true}
                                                        rows={2}
                                                        error={errors?.reason}
                                                    />
                                                )}
                                            />
                                        </div>
                                    </>
                                )
                            }
                        </div>
                    </Components.DialogContent>

                    <Components.DialogActions>
                        <div className='flex justify-end items-center gap-4'>
                            {
                                !id && (
                                    <Button
                                        type="button"
                                        text="Submit & New"
                                        onClick={handleSubmit((data) => submit(data, "submitAndNew"))}
                                        endIcon={<CustomIcons iconName={'fa-solid fa-floppy-disk'} css='cursor-pointer' />}
                                    />
                                )
                            }
                            <Button
                                type="submit"
                                text={id ? "Update" : "Submit"}
                                endIcon={<CustomIcons iconName={'fa-solid fa-floppy-disk'} css='cursor-pointer' />}
                            />
                            <Button type="button" text={"Cancel"} useFor='disabled' onClick={() => onClose()} startIcon={<CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer mr-2' />} />
                        </div>
                    </Components.DialogActions>
                </form>
            </BootstrapDialog>
            <AddSalesProcessName open={openModel} handleClose={handleCloseModel} oppId={oppId} id={watch("process") || null} handleGetAllSalesProcessName={handleGetAllSalesProcessName} />
        </React.Fragment>
    );
}

const mapDispatchToProps = {
    setAlert,
    setLoading
};

export default connect(null, mapDispatchToProps)(AddSalesProcessModel)