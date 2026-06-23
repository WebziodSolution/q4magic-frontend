import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { Controller, useForm } from 'react-hook-form';
import { connect } from 'react-redux';

import Components from '../../../components/muiComponents/components';
import Button from '../../../components/common/buttons/button';
import Input from '../../../components/common/input/input';
import { setAlert, setSyncingPushStatus } from '../../../redux/commonReducers/commonReducers';
import CustomIcons from '../../../components/common/icons/CustomIcons';
import Select from '../../common/select/select';
import { createSubUser, getCustomer, sendRegisterInvitation, updateSubUser, verifyEmail } from '../../../service/customers/customersService';
import { getAllSubUserTypes } from '../../../service/subUserType/subUserTypeService';
import DatePickerComponent from '../../common/datePickerComponent/datePickerComponent';
import dayjs from 'dayjs';
import { createQuota, deleteQuota, getAllCustomerQuotas, getQuota, updateQuota } from '../../../service/customerQuota/customerQuotaService';
import AlertDialog from '../../common/alertDialog/alertDialog';
import { Tooltip } from '@mui/material';
import { handleRequestClose } from '../../../service/common/commonService';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

const calendarType = [
    { id: 1, title: "Calendar Year" },
    { id: 2, title: "Financial Year" },
]

const terms = [
    { id: 1, title: 'Annual (4 quarters)', kind: 'quarterly' },
    { id: 2, title: 'Semi-Annual (2 quarters)', kind: 'semi' },
    { id: 3, title: 'Monthly', kind: 'monthly' },
];

const TERM_COUNTS = {
    monthly: 12,
    quarterly: 4,
    semi: 2,
    annual: 1,
};

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

function parseStartMonthIndex(startEvalPeriod) {
    try {
        if (!startEvalPeriod) return 0;
        const datePart = String(startEvalPeriod).split(',')[0]?.trim();
        const mm = parseInt((datePart || '').split('/')[0], 10);
        if (Number.isFinite(mm) && mm >= 1 && mm <= 12) return mm - 1; // 0-based
        return 0;
    } catch {
        return 0;
    }
}

function monthName(idx) { return MONTHS[(idx + 12) % 12]; }

function monthSpanLabel(startIdx, len) {
    const s = monthName(startIdx);
    const e = monthName(startIdx + len - 1);
    return `${s}–${e}`;
}

function buildLabelsForKind(kind, startMonthIndex) {
    switch (kind) {
        case 'monthly':
            // 12 single-month labels rotating from start
            return Array.from({ length: 12 }, (_, i) => monthName(startMonthIndex + i));
        case 'quarterly': {
            // 4 quarters of 3 months each
            const starts = [0, 3, 6, 9].map(o => (startMonthIndex + o) % 12);
            return starts.map((s, i) => `Q${i + 1} (${monthSpanLabel(s, 3)})`);
        }
        case 'semi': {
            // 2 halves: 6 months each
            const h1 = monthSpanLabel(startMonthIndex, 6);
            const h2 = monthSpanLabel(startMonthIndex + 6, 6);
            return [`(${h1})`, `(${h2})`];
        }
        case 'annual': {
            // 1 full-year label
            const full = monthSpanLabel(startMonthIndex, 12);
            return [`Annual (${full})`];
        }
        default:
            return [];
    }
}

function SubUserModel({ setSyncingPushStatus, setAlert, open, handleClose, id, handleGetAllUsers }) {
    const theme = useTheme()
    const [validEmail, setValidEmail] = useState(null);
    const [validEmailError, setValidEmailError] = useState(null);

    const [subUsersTypes, setSubUsersTypes] = useState([]);
    const [emailAddress, setEmailAddress] = useState(null);
    const [isEmailExits, setIsEmailExits] = useState(false);
    const [customerQuotaDtos, setCustomerQuotaDto] = useState([])
    // const [openModel, setOpenModel] = useState(false)
    const [selectedQuotaId, setSelectedQuotaId] = useState(null)
    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [showCloseButton, setShowCloseButton] = useState(false)

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
            firstName: "",
            lastName: "",
            title: "",
            emailAddress: "",
            subUserTypeId: "",
            crmId: null,
            username: "",
            password: "",
            calendarYearType: "",

            startEvalPeriod: null,
            endEvalPeriod: null,

            quotaId: null,
            quota: '',
            term: '',
            amount1: '',
            amount2: '',
            amount3: '',
            amount4: '',
            amount5: '',
            amount6: '',
            amount7: '',
            amount8: '',
            amount9: '',
            amount10: '',
            amount11: '',
            amount12: '',
        },
    });

    const handleOpenDeleteDialog = (id) => {
        setSelectedQuotaId(id);
        setDialog({ open: true, title: 'Delete Contact', message: 'Are you sure! Do you want to delete this quota?', actionButtonText: 'yes' });
    }

    const handleCloseDeleteDialog = () => {
        setSelectedQuotaId(null);
        setDialog({ open: false, title: '', message: '', actionButtonText: '' });
    }

    const handleResetQuota = () => {
        setShowCloseButton(false)
        setValue("quotaId", null)
        setValue("quota", null)
        setValue("term", null)
        setValue("amount1", null)
        setValue("amount2", null)
        setValue("amount3", null)
        setValue("amount4", null)
        setValue("amount5", null)
        setValue("amount6", null)
        setValue("amount7", null)
        setValue("amount8", null)
        setValue("amount9", null)
        setValue("amount10", null)
        setValue("amount11", null)
        setValue("amount12", null)
    }

    const handleDeleteQuota = async () => {
        const res = await deleteQuota(selectedQuotaId);
        if (res.status === 200) {
            handleResetQuota()
            handleGetUserQuota();
            handleCloseDeleteDialog();
        } else {
            setAlert({
                open: true,
                message: res?.message || "Failed to delete contact",
                type: "error"
            });
        }
    }

    const onClose = () => {
        reset({
            id: "",
            firstName: "",
            lastName: "",
            title: "",
            emailAddress: "",
            subUserTypeId: "",
            crmId: null,
            username: "",
            password: "",
            calendarYearType: "",

            startEvalPeriod: null,
            endEvalPeriod: null,

            quotaId: null,
            quota: '',
            term: '',
            amount1: '',
            amount2: '',
            amount3: '',
            amount4: '',
            amount5: '',
            amount6: '',
            amount7: '',
            amount8: '',
            amount9: '',
            amount10: '',
            amount11: '',
            amount12: '',
        });
        setValidEmail(null);
        setIsEmailExits(false);
        setEmailAddress(null);
        handleClose();
    };

    const handleVerifyEmail = async () => {
        const email = watch("emailAddress");
        const accId = id || null;
        const type = "subuser";
        if (email) {
            const response = await verifyEmail(email, type, accId);
            if (response?.data?.status === 200) {
                setValidEmail(true);
            } else {
                setAlert({
                    open: true,
                    type: "error",
                    message: response?.data?.message || "An error occurred. Please try again.",
                });
                setValidEmailError(response?.data?.message)
                setValidEmail(false);
            }
        }
    };

    const handleGetUser = async () => {
        if (id && open) {
            const response = await getCustomer(id);
            if (response?.data?.status === 200) {
                if (response?.data?.result?.emailAddress) {
                    setIsEmailExits(true);
                }
                setValue("id", response?.data?.result?.id || "");
                setValue("firstName", response?.data?.result?.firstName || "");
                setValue("lastName", response?.data?.result?.lastName || "");
                setValue("title", response?.data?.result?.title || "");
                setValue("emailAddress", response?.data?.result?.emailAddress || "");
                setEmailAddress(response?.data?.result?.emailAddress || null);
                setValue("subUserTypeId", response?.data?.result?.subUserTypeId || "");
                setValue("username", response?.data?.result?.username || "");
                setValue("password", response?.data?.result?.password || "");
                setValue("calendarYearType", response?.data?.result?.calendarYearType ? calendarType?.find((item) => item.title === response?.data?.result?.calendarYearType)?.id : null);
                if (response?.data?.result?.calendarYearType) {
                    setValue("startEvalPeriod", response?.data?.result?.startEvalPeriod)
                    setValue("endEvalPeriod", response?.data?.result?.endEvalPeriod)
                } else {
                    const currentYear = dayjs().year();
                    const firstDay = dayjs(`${currentYear}-01-01`).format("MM/DD/YYYY");
                    const lastDay = dayjs(`${currentYear}-12-31`).format("MM/DD/YYYY");
                    setValue("startEvalPeriod", firstDay);
                    setValue("endEvalPeriod", lastDay);
                }

            }
        }
    }

    const handleGetUserQuota = async () => {
        if (id && open) {
            const response = await getAllCustomerQuotas(id);
            if (response?.status === 200) {
                if (response?.result) {
                    setCustomerQuotaDto(response?.result)
                }

            }
        }
    }

    const handleGetSubUserTypes = async () => {
        if (open) {
            const response = await getAllSubUserTypes();
            if (response?.status === 200) {
                const formattedSubUserTypes = response?.data?.result?.map((type) => ({
                    title: type.name,
                    id: type.id,
                }));
                setSubUsersTypes(formattedSubUserTypes);
            }
        }
    }

    const handleSendInvitation = async () => {
        const data = {
            email: watch("emailAddress"),
            name: watch("name"),
            userId: watch("id"),
        }
        if (watch("emailAddress") !== "" && watch("emailAddress") != null) {
            const response = await sendRegisterInvitation(data);
            if (response?.data?.status === 200) {
                setAlert({
                    open: true,
                    type: "success",
                    message: response?.data?.message || "Invitation sent successfully.",
                });
            } else {
                setAlert({
                    open: true,
                    type: "error",
                    message: response?.data?.message || "An error occurred. Please try again.",
                });
            }
        } else {
            setAlert({
                open: true,
                type: "error",
                message: "Email is required to send invitation.",
            });
        }
    }

    useEffect(() => {
        setShowCloseButton(false)
        handleGetSubUserTypes();
        handleGetUser();
        handleGetUserQuota()
    }, [open]);

    useEffect(() => {
        const t = Number(watch("calendarYearType"));
        if (t === 1) {
            const now = new Date();
            const y = now.getFullYear();
            const start = new Date(y, 0, 1);      // Jan 1
            const end = new Date(y, 11, 31);      // Dec 31

            const formatDate = (date) => {
                const mm = String(date.getMonth() + 1).padStart(2, '0');
                const dd = String(date.getDate()).padStart(2, '0');
                const yyyy = date.getFullYear();
                return `${mm}/${dd}/${yyyy}`;
            };

            setValue("startEvalPeriod", formatDate(start));
            setValue("endEvalPeriod", formatDate(end));
        } else {
            setValue("startEvalPeriod", null);
            setValue("endEvalPeriod", null);
        }
    }, [watch("calendarYearType")]);

    // keep digits only
    const sanitizeInt = (val) => {
        if (val === null || val === undefined) return '';
        return String(val).replace(/\D/g, '');
    };

    // format integer with commas
    const formatInt = (val) => {
        const digits = sanitizeInt(val);
        if (!digits) return '';
        return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    // parse integer safely
    const parseIntSafe = (val) => {
        const digits = sanitizeInt(String(val ?? '').replace(/,/g, ''));
        return digits ? parseInt(digits, 10) : 0;
    };


    const handleIntegerChange = (field, e) => {
        const target = e.target;
        const raw = target.value;
        const caret = target.selectionStart ?? raw.length;

        const digitsBeforeCaret = sanitizeInt(raw.slice(0, caret)).length;

        const cleaned = sanitizeInt(raw);
        const formatted = formatInt(cleaned);

        field.onChange(formatted);

        requestAnimationFrame(() => {
            try {
                let pos = 0, seen = 0;
                while (pos < formatted.length && seen < digitsBeforeCaret) {
                    if (/\d/.test(formatted[pos])) seen++;
                    pos++;
                }
                target.setSelectionRange(pos, pos);
            } catch { }
        });
    };


    const formatMoney = (val) => {
        if (!val && val !== 0) return "";
        const [intPartRaw, decimalRaw] = val.toString().replace(/,/g, "").split(".");

        const intWithCommas = intPartRaw
            .replace(/\D/g, "")
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        if (decimalRaw !== undefined) {
            return `${intWithCommas}.${decimalRaw.slice(0, 2)}`;
        }
        return intWithCommas;
    };

    const handleSetQuota = async (id) => {
        if (id) {
            const response = await getQuota(id);
            if (response?.result) {
                setShowCloseButton(true);
                const r = response.result;

                setValue('quotaId', r?.id || '');

                // 🟢 show 3,435.54 style in quota input
                setValue('quota', r?.quota != null ? formatInt(Math.round(r.quota)) : '');

                // Map incoming term title back to our id
                const termData = terms.find(item => item.title === r?.term);
                setValue('term', termData?.id || '');

                // 🟢 show formatted amounts for amount1..amount12
                for (let i = 1; i <= 12; i++) {
                    const key = `amount${i}`;
                    const rawAmount = r?.[key];
                    setValue(key, rawAmount != null ? formatMoney(rawAmount) : '');
                }
            }
        }
    };


    const submit = async (data) => {
        const newData = {
            firstName: watch("firstName") || "",
            lastName: watch("lastName") || "",
            title: watch("title") || "",
            emailAddress: watch("emailAddress") || "",
            subUserTypeId: watch("subUserTypeId") || "",
            crmId: watch("crmId") || null,
            username: watch("username") || "",
            password: watch("password") || "",
            calendarYearType: calendarType?.find((item) => item.id === watch("calendarYearType"))?.title || "",
            startEvalPeriod: watch("startEvalPeriod"),
            endEvalPeriod: watch("endEvalPeriod"),
        }

        if ((id && watch("emailAddress") === emailAddress) || validEmail) {
            if (id) {
                const res = await updateSubUser(id, newData);
                if (res?.data.status === 200) {
                    setSyncingPushStatus(true);
                    handleGetAllUsers();
                    onClose();
                } else {
                    setAlert({
                        open: true,
                        type: "error",
                        message: res?.data?.message || "An error occurred. Please try again.",
                    });
                }
            } else {
                const res = await createSubUser(newData);
                if (res?.data.status === 201) {
                    setValue("id", res?.data?.result?.id || "");
                    setSyncingPushStatus(true);
                    handleGetAllUsers();
                    onClose();
                } else {
                    setAlert({
                        open: true,
                        type: "error",
                        message: res?.data?.message || "An error occurred. Please try again.",
                    });
                    return;
                }
            }
        } else if (!validEmail) {
            setAlert({
                open: true,
                type: "error",
                message: validEmailError,
            });
        }
        else {
            setAlert({
                open: true,
                type: "error",
                message: "Email is not valid or already registered.",
            });
        }
    }

    const submitQuota = async () => {
        const selectedTerm = terms.find(t => t.id === parseInt(watch('term')));
        if (!selectedTerm || !watch("quota")) return;

        const quotaData = {
            id: watch("quotaId"),
            quota: parseIntSafe(watch("quota")),
            term: selectedTerm.title,

            amount1: parseIntSafe(watch("amount1")),
            amount2: parseIntSafe(watch("amount2")),
            amount3: parseIntSafe(watch("amount3")),
            amount4: parseIntSafe(watch("amount4")),
            amount5: parseIntSafe(watch("amount5")),
            amount6: parseIntSafe(watch("amount6")),
            amount7: parseIntSafe(watch("amount7")),
            amount8: parseIntSafe(watch("amount8")),
            amount9: parseIntSafe(watch("amount9")),
            amount10: parseIntSafe(watch("amount10")),
            amount11: parseIntSafe(watch("amount11")),
            amount12: parseIntSafe(watch("amount12")),

            customerId: id,
        };

        if (watch("quotaId")) {
            const response = await updateQuota(watch("quotaId"), quotaData);
            if (response?.status === 200) {
                handleResetQuota()
                handleGetUserQuota();
            } else {
                setAlert({
                    open: true,
                    type: "error",
                    message: response?.data?.message || "An error occurred. Please try again.",
                });
            }
        } else {
            const response = await createQuota(quotaData);
            if (response?.status === 201) {
                handleResetQuota()
                handleGetUserQuota();
            } else {
                setAlert({
                    open: true,
                    type: "error",
                    message: response?.data?.message || "An error occurred. Please try again.",
                });
            }
        }
    };

    const selectedTerm = terms?.find(t => t.id === parseInt(watch('term')));

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
                    {id ? "Update" : "Create"} Member
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
                                        name="firstName"
                                        control={control}
                                        rules={{
                                            required: "First name is required",
                                        }}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                label="First name"
                                                type={`text`}
                                                requiredFiledLabel={true}
                                                error={errors.firstName}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                }}
                                            />
                                        )}
                                    />
                                </div>

                                <div>
                                    <Controller
                                        name="lastName"
                                        control={control}
                                        rules={{
                                            required: "Last name is required",
                                        }}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                label="Last name"
                                                type={`text`}
                                                requiredFiledLabel={true}
                                                error={errors.lastName}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                }}
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
                                                requiredFiledLabel={true}
                                                error={errors.title}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                }}
                                            />
                                        )}
                                    />
                                </div>

                                <div>
                                    <Controller
                                        name="subUserTypeId"
                                        control={control}
                                        rules={{ required: "Sub User Type is required" }}
                                        render={({ field }) => (
                                            <Select
                                                options={subUsersTypes}
                                                requiredFiledLabel={true}
                                                label="Member Role"
                                                placeholder="Select role"
                                                value={parseInt(watch("subUserTypeId")) || null}
                                                onChange={(_, newValue) => field.onChange(newValue?.id || null)}
                                                error={errors?.subUserTypeId}
                                            />
                                        )}
                                    />
                                </div>

                                <div>
                                    <Controller
                                        name="emailAddress"
                                        control={control}
                                        rules={{
                                            required: "Email is required",
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: "Invalid email address",
                                            },
                                        }}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                label="Email"
                                                type={`text`}
                                                requiredFiledLabel={true}
                                                error={errors?.emailAddress}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\s/g, "");
                                                    field.onChange(value);
                                                }}
                                                onBlur={() => {
                                                    if (emailAddress !== watch("emailAddress")) {
                                                        handleVerifyEmail();
                                                        setIsEmailExits(false);
                                                    } else {
                                                        setIsEmailExits(true);
                                                        setValidEmail(true);
                                                    }
                                                }}
                                                endIcon={
                                                    validEmail === true ? (
                                                        <CustomIcons iconName={'fa-solid fa-check'} css={`text-green-500`} />
                                                    ) : validEmail === false ? (
                                                        <CustomIcons iconName={'fa-solid fa-xmark'} css={`text-red-500`} />
                                                    ) : null
                                                }
                                            />
                                        )}
                                    />
                                </div>

                                {
                                    id && (
                                        <>
                                            <div className='grid gap-[30px]'>
                                                <div>
                                                    <Controller
                                                        name="calendarYearType"
                                                        control={control}
                                                        rules={{ required: "Calendar Year Type is required" }}
                                                        render={({ field }) => (
                                                            <Select
                                                                requiredFiledLabel={true}
                                                                options={calendarType}
                                                                label="Sales Manager Calendar Type"
                                                                placeholder="Select calendar type"
                                                                value={parseInt(watch("calendarYearType")) || null}
                                                                onChange={(_, newValue) => field.onChange(newValue?.id || null)}
                                                                error={errors?.calendarYearType}
                                                            />
                                                        )}
                                                    />
                                                </div>
                                                {
                                                    watch("calendarYearType") && (
                                                        <div>
                                                            <DatePickerComponent requiredFiledLabel={true} setValue={setValue} control={control} name='startEvalPeriod' label={`Start Eval Period`} minDate={null} maxDate={null} required={true} />
                                                        </div>
                                                    )
                                                }

                                                {
                                                    watch("calendarYearType") && (
                                                        <div>
                                                            <DatePickerComponent requiredFiledLabel={true} setValue={setValue} control={control} name='endEvalPeriod' label={`End Eval Period`} minDate={null} maxDate={null} required={true} />
                                                        </div>
                                                    )
                                                }
                                            </div>

                                            <div>
                                                <Controller
                                                    name="term"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            options={terms}
                                                            label="Period"
                                                            placeholder="Select period"
                                                            value={parseInt(watch('term')) || null}
                                                            onChange={(_, newValue) => {
                                                                for (let i = 1; i <= 12; i++) setValue(`amount${i}`, null, { shouldDirty: true });
                                                                field.onChange(newValue?.id || null);
                                                            }}
                                                        />

                                                    )}
                                                />
                                            </div>

                                            <div>
                                                <Controller
                                                    name="quota"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Input
                                                            {...field}
                                                            label="Quota"
                                                            type="text"
                                                            onChange={(e) => handleIntegerChange(field, e)}
                                                            startIcon={
                                                                <CustomIcons
                                                                    iconName={"fa-solid fa-dollar-sign"}
                                                                    css={"text-lg text-black mr-2"}
                                                                />
                                                            }
                                                        />
                                                    )}
                                                />

                                            </div>

                                            <div className='grid gap-[30px]'>
                                                {(() => {
                                                    if (!selectedTerm) return null;
                                                    const startMonthIndex = parseStartMonthIndex(watch("startEvalPeriod"));
                                                    const kind = terms.find(t => t.id === parseInt(watch('term')))?.kind;
                                                    const count = TERM_COUNTS[kind] || 0;
                                                    const labels = buildLabelsForKind(kind, startMonthIndex).slice(0, count);
                                                    return (
                                                        <>
                                                            {Array.from({ length: count }, (_, i) => {
                                                                const n = i + 1;                   // amount1..amountN
                                                                const fieldName = `amount${n}`;
                                                                const labelText = `${labels[i]} Amount` || `Amount ${n}`;
                                                                return (
                                                                    <div key={fieldName}>
                                                                        <Controller
                                                                            name={fieldName}
                                                                            control={control}
                                                                            rules={{ required: watch('term') ? `${labelText} is required` : false }}
                                                                            render={({ field }) => (
                                                                                <Input
                                                                                    {...field}
                                                                                    label={labelText}
                                                                                    type="text"
                                                                                    onChange={(e) => handleIntegerChange(field, e)}
                                                                                    error={errors?.[fieldName]}
                                                                                    startIcon={
                                                                                        <CustomIcons
                                                                                            iconName={"fa-solid fa-dollar-sign"}
                                                                                            css={"text-lg text-black mr-2"}
                                                                                        />
                                                                                    }
                                                                                />
                                                                            )}
                                                                        />

                                                                    </div>
                                                                );
                                                            })}
                                                        </>
                                                    );
                                                })()}
                                            </div>

                                            <div className='flex items-center gap-3'>
                                                <Tooltip title="Save" arrow>
                                                    <div className='bg-green-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                                        <Components.IconButton onClick={() => submitQuota()}>
                                                            <CustomIcons iconName={'fa-solid fa-floppy-disk'} css='cursor-pointer text-white h-4 w-4' />
                                                        </Components.IconButton>
                                                    </div>
                                                </Tooltip>
                                                {
                                                    showCloseButton && (
                                                        <Tooltip title="Cancel" arrow>
                                                            <div className='bg-gray-800 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                                                <Components.IconButton onClick={() => handleResetQuota()}>
                                                                    <CustomIcons iconName={'fa-solid fa-close'} css='cursor-pointer text-white h-4 w-4' />
                                                                </Components.IconButton>
                                                            </div>
                                                        </Tooltip>
                                                    )
                                                }
                                            </div>

                                            <div>
                                                <div className="border rounded-md overflow-hidden">
                                                    <div className="max-h-56 overflow-y-auto">
                                                        <table className="min-w-full border-collapse">
                                                            {/* Header */}
                                                            <thead className="sticky top-0 bg-white z-10">
                                                                <tr style={{ backgroundColor: '#EDE9FE' }}>
                                                                    <th className="py-4 px-6 font-semibold text-[0.875rem] leading-[1.25rem] tracking-wider uppercase text-left w-16" style={{ color: '#5B21B6' }}>#</th>
                                                                    <th className="py-4 px-6 font-semibold text-[0.875rem] leading-[1.25rem] tracking-wider uppercase text-left" style={{ color: '#5B21B6' }}>Term</th>
                                                                    <th className="py-4 px-6 font-semibold text-[0.875rem] leading-[1.25rem] tracking-wider uppercase text-right w-40" style={{ color: '#5B21B6' }}>Quota</th>
                                                                    <th className="py-4 px-6 font-semibold text-[0.875rem] leading-[1.25rem] tracking-wider uppercase text-right w-40" style={{ color: '#5B21B6' }}>Action</th>
                                                                </tr>
                                                            </thead>

                                                            {/* Body */}
                                                            <tbody>
                                                                {(customerQuotaDtos?.length ? customerQuotaDtos : []).map((row, i) => {
                                                                    const isLastRow = i === (customerQuotaDtos?.length || 0) - 1;
                                                                    return (
                                                                        <tr key={row.id ?? i} style={{ borderBottom: isLastRow ? 'none' : '1px solid #F1F5F9' }} className="transition-colors hover:bg-[#F5F3FF]">
                                                                            <td className="px-6 py-4 align-middle text-sm font-bold text-[#111827]">{i + 1}</td>
                                                                            <td className="px-6 py-4 align-middle text-sm text-[#111827] font-medium">{row.term || "—"}</td>
                                                                            <td className="px-6 py-4 align-middle text-sm text-[#111827] font-medium text-right">
                                                                                {typeof row.quota === "number"
                                                                                    ? `$${row.quota.toLocaleString()}`
                                                                                    : row.quota
                                                                                        ? `$${Number(row.quota).toLocaleString()}`
                                                                                        : "—"}
                                                                            </td>
                                                                            <td className="px-6 py-4 align-middle">
                                                                                <div className='flex items-center gap-2 justify-end h-full'>
                                                                                    <Tooltip title="Edit" arrow>
                                                                                        <div className='bg-green-600 h-7 w-7 flex justify-center items-center rounded-full text-white'>
                                                                                            <Components.IconButton onClick={() => handleSetQuota(row.id)}>
                                                                                                <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-white h-3 w-3' />
                                                                                            </Components.IconButton>
                                                                                        </div>
                                                                                    </Tooltip>
                                                                                    <Tooltip title="Delete" arrow>
                                                                                        <div className='bg-red-600 h-7 w-7 flex justify-center items-center rounded-full text-white'>
                                                                                            <Components.IconButton onClick={() => handleOpenDeleteDialog(row.id)}>
                                                                                                <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer text-white h-3 w-3' />
                                                                                            </Components.IconButton>
                                                                                        </div>
                                                                                    </Tooltip>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    )
                                                                })}

                                                                {/* Empty state */}
                                                                {(!customerQuotaDtos || customerQuotaDtos.length === 0) && (
                                                                    <tr>
                                                                        <td colSpan={4} className="px-4 py-4 text-center text-sm font-semibold">
                                                                            No records
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>

                                            </div>
                                        </>
                                    )
                                }

                            </div>
                            <div className='w-60 mt-5'>
                                {
                                    id && (
                                        <Button disabled={!isEmailExits} type={`button`} text={"Send Invitation"} useFor='success' onClick={() => handleSendInvitation()} />
                                    )
                                }
                            </div>
                        </div>
                    </Components.DialogContent>

                    <Components.DialogActions>
                        <div className={`flex justify-end items-center gap-4`}>
                            <div>
                                <Button type={`submit`} text={id ? "Update" : "Submit"} endIcon={<CustomIcons iconName={'fa-solid fa-floppy-disk'} css='cursor-pointer' />} />
                            </div>
                            <Button type="button" text={"Cancel"} useFor='disabled' onClick={() => onClose()} startIcon={<CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer mr-2' />} />
                        </div>
                    </Components.DialogActions>
                </form>
            </BootstrapDialog>
            <AlertDialog
                open={dialog.open}
                title={dialog.title}
                message={dialog.message}
                actionButtonText={dialog.actionButtonText}
                handleAction={() => handleDeleteQuota()}
                handleClose={() => handleCloseDeleteDialog()}
            />
        </React.Fragment>
    );
}

const mapDispatchToProps = {
    setAlert,
    setSyncingPushStatus,
};

export default connect(null, mapDispatchToProps)(SubUserModel)