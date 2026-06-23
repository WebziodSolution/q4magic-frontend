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

import { createContact, getAllContacts, getContactDetails, updateContact } from '../../../service/contact/contactService';
import { handleRequestClose, opportunityContactRoles } from '../../../service/common/commonService';
import { getAllAccounts } from '../../../service/account/accountService';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

function ContactModel({ setSyncingPushStatus, setAlert, open, handleClose, contactId, handleGetAllContacts }) {
    const theme = useTheme()
    const [loading, setLoading] = useState(false);
    const [contacts, setContacts] = useState([]);
    const [accounts, setAccounts] = useState([]);

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
            accountId: null,
            reportContactId: null,
            salesforceContactId: null,
            phone: null,
            firstName: null,
            middleName: null,
            lastName: null,
            linkedinProfile: null,
            title: null,
            emailAddress: null,
            role: null,
            notes: null,
            keyContact: null,
            recordStatus: null,
        },
    });

    const onClose = () => {
        setLoading(false);
        reset({
            id: null,
            accountId: null,
            reportContactId: null,
            salesforceContactId: null,
            phone: null,
            firstName: null,
            middleName: null,
            lastName: null,
            linkedinProfile: null,
            title: null,
            emailAddress: null,
            role: null,
            notes: null,
            keyContact: null,
            recordStatus: null,
        });
        handleClose();
    };

    const handleGetContactDetails = async () => {
        if (contactId && open) {
            const res = await getContactDetails(contactId);
            if (res?.status === 200) {
                reset(res?.result);
                if (res?.result?.role != null && res?.result?.role !== "") {
                    setValue("role", opportunityContactRoles.find(role => role.title === res?.result?.role)?.id || null);
                }
            }
        }
    }

    const handleGetContacts = async () => {
        if (open) {
            try {
                const contacts = await getAllContacts();
                const formattedContacts = contacts?.result?.map((contact) => ({
                    "id": contact.id || null,
                    "title": contact.firstName + " " + contact.lastName,
                }));
                setContacts(formattedContacts);
            } catch (error) {
                console.error("Error fetching contacts:", error);
            }
        }
    }

    const handleGetAllAccounts = async () => {
        if (open) {
            const res = await getAllAccounts("fetchType=Options");
            if (res?.status === 200) {
                const data = res?.result?.map((acc) => ({
                    title: acc.accountName,
                    id: acc.id,
                    salesforceAccountId: acc.salesforceAccountId
                }));
                setAccounts(data);
            }
        }
    };

    useEffect(() => {
        handleGetAllAccounts()
        handleGetContacts()
        handleGetContactDetails()
    }, [open])

    const submit = async (data) => {
        setLoading(true);
        const newData = {
            ...data,
            role: data?.role ? opportunityContactRoles.find(role => role.id === data.role)?.title : null,
        }
        try {
            if (contactId) {
                const res = await updateContact(contactId, newData);
                if (res?.status === 200) {
                    if (watch("salesforceContactId") !== null && watch("salesforceContactId") !== "") {
                        setSyncingPushStatus(true);
                    }
                    setLoading(false);
                    setAlert({
                        open: true,
                        message: "Contact updated successfully",
                        type: "success"
                    });
                    handleGetAllContacts();
                    onClose();
                } else {
                    setLoading(false);
                    setAlert({
                        open: true,
                        message: res?.message || "Failed to update contact",
                        type: "error"
                    });
                }
            } else {
                const res = await createContact(newData);
                if (res?.status === 201) {
                    setSyncingPushStatus(true);
                    setLoading(false);
                    setAlert({
                        open: true,
                        message: "Contact created successfully",
                        type: "success"
                    });
                    handleGetAllContacts();
                    onClose();
                } else {
                    setLoading(false);
                    setAlert({
                        open: true,
                        message: res?.message || "Failed to create contact",
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
                    {contactId ? "Update" : "Add New"} Contact
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
                                <div>
                                    <Controller
                                        name="accountId"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                options={accounts}
                                                label={"Company Name"}
                                                placeholder="Select Company"
                                                value={parseInt(watch("accountId")) || null}
                                                onChange={(_, newValue) => {
                                                    if (newValue?.id) {
                                                        field.onChange(newValue.id);
                                                    } else {
                                                        setValue("accountId", null);
                                                    }
                                                }}
                                            />
                                        )}
                                    />
                                </div>

                                <Controller
                                    name="firstName"
                                    control={control}
                                    rules={{
                                        required: "First name is required",
                                    }}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="First Name"
                                            type={`text`}
                                            requiredFiledLabel={true}
                                            error={errors.firstName}
                                        />
                                    )}
                                />

                                <Controller
                                    name="lastName"
                                    control={control}
                                    rules={{
                                        required: "Last name is required",
                                    }}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Last Name"
                                            type={`text`}
                                            requiredFiledLabel={true}
                                            error={errors.lastName}
                                        />
                                    )}
                                />

                                <Controller
                                    name="phone"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Phone"
                                            type={`text`}
                                            error={errors?.phone}
                                            onChange={(e) => {
                                                const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                                field.onChange(numericValue);
                                            }}
                                        />
                                    )}
                                />
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
                                            requiredFiledLabel={true}
                                            error={errors.title}
                                        />
                                    )}
                                />
                                <Controller
                                    name="emailAddress"
                                    control={control}
                                    rules={{
                                        pattern: {
                                            value: /^\S+@\S+$/i,
                                            message: "Email address is invalid",
                                        },
                                    }}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Email Address"
                                            type={`text`}
                                            error={errors.emailAddress}
                                        />
                                    )}
                                />

                                <Controller
                                    name="reportContactId"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            options={contacts}
                                            label={"Reports To"}
                                            placeholder="Select contact"
                                            value={parseInt(watch("reportContactId")) || null}
                                            onChange={(_, newValue) => {
                                                if (newValue?.id) {
                                                    field.onChange(newValue.id);
                                                } else {
                                                    setValue("reportContactId", null);
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
                            <Button type={`submit`} text={contactId ? "Update" : "Submit"} isLoading={loading} endIcon={<CustomIcons iconName={'fa-solid fa-floppy-disk'} css='cursor-pointer' />} />
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
    setSyncingPushStatus
};

export default connect(null, mapDispatchToProps)(ContactModel)