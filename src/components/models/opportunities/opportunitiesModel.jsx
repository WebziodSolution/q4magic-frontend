import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { Controller, useForm } from 'react-hook-form';
import { connect } from 'react-redux';
import { setAlert, setSyncingPushStatus } from '../../../redux/commonReducers/commonReducers';

import draftToHtml from 'draftjs-to-html';
import { EditorState, convertToRaw } from 'draft-js';
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { getUserDetails } from '../../../utils/getUserDetails';

import Checkbox from '../../common/checkBox/checkbox';
import OpportunityContactModel from './opportunityContactModel';
import { Tooltip } from '@mui/material';
import Stapper from '../../common/stapper/stapper';
import DatePickerComponent from '../../../components/common/datePickerComponent/datePickerComponent';
import Components from '../../../components/muiComponents/components';
import Button from '../../../components/common/buttons/button';
import Input from '../../../components/common/input/input';
import CustomIcons from '../../../components/common/icons/CustomIcons';
import Select from '../../../components/common/select/select';
import OpportunitiesProductsModel from './opportunitiesProductsModel';
import OpportunitiesPartnersModel from "./opportunityPartnerModel";
import FileInputBox from '../../fileInputBox/fileInputBox';
import AlertDialog from '../../common/alertDialog/alertDialog';

import { createOpportunity, deleteOpportunityLogo, updateOpportunity } from '../../../service/opportunities/opportunitiesService';
import { getAllAccounts } from '../../../service/account/accountService';
import { opportunityStatus, uploadFiles, opportunityStages, brandfetchSrc, handleRequestClose } from '../../../service/common/commonService';
import { deleteOpportunitiesPartner, getAllOpportunitiesPartner } from '../../../service/opportunities/opportunityPartnerService';
import { deleteOpportunitiesProducts, getAllOpportunitiesProducts } from '../../../service/opportunities/OpportunityProductsService';
import { deleteOpportunitiesContact, getAllOpportunitiesContact, updateOpportunitiesContact } from '../../../service/opportunities/opportunitiesContactService';
// import { getAllSalesStages } from '../../../service/salesStage/salesStageService';

const toolbarProperties = {
    options: ['inline', 'list', 'link', 'history'],
    inline: {
        options: ['bold', 'italic', 'underline', 'strikethrough']
    },
    list: {
        options: ['unordered', 'ordered'],
    }
}

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

const steps = [
    "Opportunity Details",
    "Partner Details",
    "Contact Details",
    "Product & Service Details",
]

function OpportunitiesModel({ setAlert, open, handleClose, opportunityId, handleGetAllOpportunities, setSyncingPushStatus }) {
    const userdata = getUserDetails();
    const [activeStep, setActiveStep] = useState(0)
    // const [opportunityStages, setOpportunityStages] = useState([])

    const [whyDoAnything, setWhyDoAnything] = useState(() => EditorState.createEmpty());
    const [businessValue, setBusinessValue] = useState(() => EditorState.createEmpty());
    // const [decisionMap, setDecisionMap] = useState(() => EditorState.createEmpty());

    const theme = useTheme()
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);

    const [opportunitiesPartner, setOpportunitiesPartner] = useState([]);
    const [opportunitiesProducts, setOpportunitiesProducts] = useState([]);
    const [opportunitiesContacts, setOpportunitiesContacts] = useState([]);

    const [openPartnerModel, setOpenPartnerModel] = useState(false);
    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [selectedOppPartnerId, setSelectedOppPartnerId] = useState(null);

    const [openProductModel, setOpenProductModel] = useState(false);
    const [dialogProduct, setDialogProduct] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [selectedProductId, setSelectedProductId] = useState(null);

    const [initialIsKey, setInitialIsKey] = useState({});
    const [editedContacts, setEditedContacts] = useState([]);
    const [openContactModel, setOpenContactModel] = useState(false);
    const [dialogContact, setDialogContact] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [selectedContactId, setSelectedContactId] = useState(null);
    const [dialogLogo, setDialogLogo] = useState({ open: false, title: '', message: '', actionButtonText: '' });

    const handleBack = () => {
        setActiveStep((prev) => prev - 1)
    }

    const handleNext = () => {
        setActiveStep((prev) => prev + 1)
    }

    const handleOpenContactModel = () => {
        setOpenContactModel(true);
    };

    const handleCloseContactModel = () => {
        setOpenContactModel(false);
    };

    const handleOpenPartnerModel = (id) => {
        setSelectedOppPartnerId(id);
        setOpenPartnerModel(true);
    };

    const handleClosePartnerModel = () => {
        setSelectedOppPartnerId(null);
        setOpenPartnerModel(false);
    };

    const handleOpenDeleteLogoDialog = () => {
        setDialogLogo({ open: true, title: 'Delete Logo', message: 'Are you sure! Do you want to delete this logo?', actionButtonText: 'yes' });
    }

    const handleCloseDeleteLogoDialog = () => {
        setDialogLogo({ open: false, title: '', message: '', actionButtonText: '' });
    }

    const handleOpenDeleteDialog = (id) => {
        setSelectedOppPartnerId(id);
        setDialog({ open: true, title: 'Delete Partner', message: 'Are you sure! Do you want to delete this logo?', actionButtonText: 'yes' });
    }

    const handleCloseDeleteDialog = () => {
        setSelectedOppPartnerId(null);
        setDialog({ open: false, title: '', message: '', actionButtonText: '' });
    }

    const handleOpenProductModel = (id) => {
        setSelectedProductId(id);
        setOpenProductModel(true);
    };

    const handleCloseProductModel = () => {
        setSelectedProductId(null);
        setOpenProductModel(false);
    };

    const handleOpenDeleteProductDialog = (id) => {
        setSelectedProductId(id);
        setDialogProduct({ open: true, title: 'Delete Product', message: 'Are you sure! Do you want to delete this product?', actionButtonText: 'yes' });
    }

    const handleCloseDeleteProductDialog = () => {
        setSelectedProductId(null);
        setDialogProduct({ open: false, title: '', message: '', actionButtonText: '' });
    }

    const handleOpenDeleteContactDialog = (id) => {
        setSelectedContactId(id);
        setDialogContact({ open: true, title: 'Delete Contact', message: 'Are you sure! Do you want to delete this contact?', actionButtonText: 'yes' });
    }

    const handleCloseDeleteContactDialog = () => {
        setSelectedContactId(null);
        setDialogContact({ open: false, title: '', message: '', actionButtonText: '' });
    }

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
            opportunity: null,
            salesStage: null,
            dealAmount: null,
            discountPercentage: 0,
            listPrice: null,
            closeDate: null,
            nextSteps: null,
            accountId: null,
            salesforceOpportunityId: null,
            status: 3,
            logo: null,
            newLogo: null,
            whyDoAnything: null,
            businessValue: null,
            currentEnvironment: null,
            decisionMap: null,
            opportunityDocs: [],
            domain: null
        },
    });

    const handleDeleteOppLogo = async () => {
        if (opportunityId && watch("logo")) {
            const res = await deleteOpportunityLogo(opportunityId);
            if (res?.status === 200) {
                setValue("newLogo", null)
                setValue("logo", null)
                handleCloseDeleteLogoDialog()
            } else {
                setAlert({
                    open: true,
                    message: res?.message || "Failed to delete opportunity logo",
                    type: "error"
                });
            }
        }
        if (watch("newLogo") || watch("logo")) {
            setValue("newLogo", null)
            setValue("logo", null)
            handleCloseDeleteLogoDialog()
        }
    }

    const handleDeletePartner = async () => {
        if (selectedOppPartnerId) {
            const res = await deleteOpportunitiesPartner(selectedOppPartnerId);
            if (res?.status === 200) {
                setSyncingPushStatus(true);
                handleGetAllOpportunitiesPartner()
                handleCloseDeleteDialog()
            } else {
                setAlert({
                    open: true,
                    message: res?.message || "Failed to delete opportunity partner",
                    type: "error"
                });
            }
        }
    }

    const handleDeleteProduct = async () => {
        if (selectedProductId) {
            const res = await deleteOpportunitiesProducts(selectedProductId);
            if (res?.status === 200) {
                setSyncingPushStatus(true);
                handleGetOppProduct()
                handleCloseDeleteProductDialog()
            } else {
                setAlert({
                    open: true,
                    message: res?.message || "Failed to delete opportunity product",
                    type: "error"
                });
            }
        }
    }

    const handleDeleteContact = async () => {
        if (selectedContactId) {
            const res = await deleteOpportunitiesContact(selectedContactId);
            if (res?.status === 200) {
                setSyncingPushStatus(true)
                handleGetOppContacts()
                handleCloseDeleteContactDialog()
            } else {
                setAlert({
                    open: true,
                    message: res?.message || "Failed to delete opportunity contact",
                    type: "error"
                });
            }
        }
    }

    const onClose = () => {
        setOpportunitiesContacts([])
        setOpportunitiesPartner([])
        setOpportunitiesProducts([])
        setLoading(false);
        reset({
            id: null,
            accountId: null,
            opportunity: null,
            salesStage: null,
            dealAmount: null,
            discountPercentage: 0,
            listPrice: null,
            closeDate: null,
            nextSteps: null,
            salesforceOpportunityId: null,
            status: 1,
            logo: null,
            newLogo: null,
            opportunityDocs: [],
            domain: null
        });
        setActiveStep(0)
        handleClose();
    };

    const handleGetAllAccounts = async () => {
        if (open) {
            setLoading(true);
            const res = await getAllAccounts("fetchType=Options");
            if (res?.status === 200) {
                const data = res?.result?.map((acc) => ({
                    title: acc.accountName,
                    id: acc.id,
                    salesforceAccountId: acc.salesforceAccountId
                }));
                setAccounts(data);
                setLoading(false);
            }
        }
    };

    const handleGetAllOpportunitiesPartner = async () => {
        if (open && (watch("id") || opportunityId)) {
            const res = await getAllOpportunitiesPartner(watch("id") || opportunityId)
            setOpportunitiesPartner(res?.result)
        }
    }

    const handleGetOppProduct = async () => {
        if (open && (watch("id") || opportunityId)) {
            const res = await getAllOpportunitiesProducts(watch("id") || opportunityId)
            setOpportunitiesProducts(res.result)
        }
    }

    const handleGetOppContacts = async () => {
        if (open && (watch("id") || opportunityId)) {
            const res = await getAllOpportunitiesContact(watch("id") || opportunityId);
            const list = Array.isArray(res?.result) ? res.result : [];

            // ✅ Sort: isKey === true first
            const sortedList = [...list].sort((a, b) => {
                // true values should come first
                if (a.isKey === b.isKey) return 0;
                return a.isKey ? -1 : 1;
            });

            setOpportunitiesContacts(sortedList);

            const map = {};
            sortedList.forEach(c => {
                if (c?.id != null) map[c.id] = !!c.isKey;
            });

            setInitialIsKey(map);
            setEditedContacts([]);
        }
    };

    const handleToggleKeyContact = (rowId) => {
        const current = opportunitiesContacts.find(r => r.id === rowId);
        if (!current) return;

        const newVal = !current.isKey;
        const keyCount = opportunitiesContacts.filter(c => c.isKey).length;

        // 🧠 Prevent enabling beyond 4
        if (newVal && keyCount >= 4) {
            setAlert({
                open: true,
                type: "warning",
                message: "You can select up to 4 key contacts only.",
            });
            return;
        }

        // ✅ Update UI state
        setOpportunitiesContacts(prev =>
            prev.map(r => (r.id === rowId ? { ...r, isKey: newVal } : r))
        );

        // ✅ Track edits
        setEditedContacts(prev => {
            const originally = initialIsKey[rowId];
            const existsIdx = prev.findIndex(e => e.id === rowId);

            if (newVal === originally) {
                if (existsIdx >= 0) {
                    const copy = prev.slice();
                    copy.splice(existsIdx, 1);
                    return copy;
                }
                return prev;
            }

            if (existsIdx >= 0) {
                const copy = prev.slice();
                copy[existsIdx] = { id: rowId, isKey: newVal };
                return copy;
            }
            return [...prev, { id: rowId, isKey: newVal }];
        });
    };

    const handleBulkUpdateKeyContacts = async () => {
        try {
            const res = await updateOpportunitiesContact(editedContacts)
            if (res.status === 200) {
                setSyncingPushStatus(true)
                setAlert({ open: true, type: "success", message: "Contacts updated" });
                await handleGetOppContacts();
            } else {
                setAlert({ open: true, type: "error", message: "Fail to update contacts" });
            }
        } catch (e) {
            setAlert({ open: true, type: "error", message: "Failed to update contacts" });
        }
    };

    const handleImageChange = async (file) => {
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);                    // <-- send the File object
        formData.append("folderName", "oppLogo");
        formData.append("userId", String(userdata?.userId || ""));

        // IMPORTANT: don't set Content-Type; the browser sets multipart boundary
        uploadFiles(formData).then((res) => {
            if (res.data.status === 200) {
                const { imageURL } = res?.data?.result?.[0] || {};
                setValue("logo", null)
                setValue("newLogo", imageURL || "");
            } else {
                setAlert({ open: true, message: res?.data?.message, type: "error" });
            }
        });
    };

    const formatMoney = (val) => {
        if (!val) return "";
        const [intPartRaw, decimalRaw] = val.toString().replace(/,/g, "").split(".");

        const intWithCommas = intPartRaw
            .replace(/\D/g, "")
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        if (decimalRaw !== undefined) {
            return `${intWithCommas}.${decimalRaw.slice(0, 2)}`;
        }
        return intWithCommas;
    };

    const parseMoneyFloat = (val) => {
        if (!val) return 0;
        return parseFloat(val.replace(/,/g, "")).toFixed(2);
    };

    const submit = async (data) => {

        const whyDoAnythingHtml = whyDoAnything
            ? draftToHtml(convertToRaw(whyDoAnything.getCurrentContent()))
            : null;

        const businessValueHtml = businessValue
            ? draftToHtml(convertToRaw(businessValue.getCurrentContent()))
            : null;

        const newData = {
            ...data,
            whyDoAnything: whyDoAnythingHtml,
            businessValue: businessValueHtml,
            // decisionMap: decisionMapHtml,
            dealAmount: data.dealAmount ? parseFloat(parseMoneyFloat(data.dealAmount)) : null,
            discountPercentage: data.discountPercentage ? parseFloat(parseMoneyFloat(data.discountPercentage)) : null,
            listPrice: data.listPrice ? parseFloat(parseMoneyFloat(data.listPrice)) : null,
            salesStage: opportunityStages?.find(stage => stage.id === parseInt(data.salesStage))?.title || null,
            status: opportunityStatus?.find(row => row.id === parseInt(data.status))?.title || null,
            newLogo: watch("newLogo"),
            logo: watch("newLogo") === null ? brandfetchSrc(watch("domain")) : watch("logo")
        }
        try {
            if (activeStep === 0) {
                setLoading(true);
                if (watch("id")) {
                    const res = await updateOpportunity(watch("id"), newData);
                    if (res?.status === 200) {
                        if (watch("salesforceOpportunityId") !== null && watch("salesforceOpportunityId") !== "") {
                            setSyncingPushStatus(true);
                        }
                        setLoading(false);
                        handleNext()
                    } else {
                        setLoading(false);
                        setAlert({
                            open: true,
                            message: res?.message || "Failed to update opportunity",
                            type: "error"
                        });
                    }
                } else {
                    const res = await createOpportunity(newData);
                    if (res?.status === 201) {
                        setValue("id", res?.result?.id)
                        setSyncingPushStatus(true);
                        setLoading(false);
                        handleNext()
                    } else {
                        setLoading(false);
                        setAlert({
                            open: true,
                            message: res?.message || "Failed to create opportunity",
                            type: "error"
                        });
                    }
                }
            } else if (activeStep === 3) {
                const res = await getAllOpportunitiesProducts(watch("id") || opportunityId)
                setOpportunitiesProducts(res.result)
                handleGetAllOpportunities()
                setLoading(false);
                onClose()
            }
            else {
                setLoading(false);
                handleNext()
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

    useEffect(() => {
        handleGetAllAccounts()
        // handleGetAllStages()
    }, [open])

    return (
        <React.Fragment>
            <BootstrapDialog
                onClose={(event, reason) => handleRequestClose(event, reason, onClose)}
                open={open}
                aria-labelledby="customized-dialog-title"
                // fullScreen={opportunityId != null}
                // maxWidth={opportunityId ? 'xl' : "xl"}
                maxWidth={"md"}
                fullWidth
            >
                <Components.DialogTitle sx={{ m: 0, p: 2, color: theme.palette.text.primary }} id="customized-dialog-title">
                    {opportunityId ? "Update" : "Create"} Opportunity
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
                        <div className='flex justify-center'>
                            <div className='w-[800px]'>
                                <Stapper steps={steps} activeStep={activeStep} orientation={`horizontal`} labelFontSize="14px" />
                            </div>
                        </div>
                        <div className='px-[30px]'>
                            {
                                activeStep === 0 && (
                                    <>
                                        <div className='mt-8'>
                                            <div className='flex justify-center items-center'>
                                                <div className='w-40 h-40'>
                                                    <FileInputBox
                                                        type="OppLogo"
                                                        onFileSelect={handleImageChange}
                                                        onRemove={handleOpenDeleteLogoDialog}
                                                        value={watch("logo") || watch("newLogo")}
                                                        text="Upload Opportunity Logo"
                                                    />
                                                </div>
                                            </div>


                                            <div className='flex flex-col gap-[30px] md:col-span-2'>
                                                <Controller
                                                    name="domain"
                                                    control={control}
                                                    rules={{
                                                        pattern: {
                                                            // Regex to match domain format (e.g., google.com) and exclude http/https
                                                            value: /^(?!https?:\/\/)[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/,
                                                            message: "Please enter a valid domain (e.g., example.com) without http://"
                                                        }
                                                    }}
                                                    render={({ field, fieldState: { error } }) => (
                                                        <div>
                                                            <Input
                                                                {...field}
                                                                label="Domain"
                                                                type="text"
                                                                placeholder="Enter domain for fetch logo (e.g. example.com) without http://"
                                                                error={errors.domain}
                                                                onChange={(e) => {
                                                                    field.onChange(e); // Updates React Hook Form state
                                                                }}
                                                                onBlur={(e) => {
                                                                    const value = e.target.value.trim();
                                                                    if (value && /^(?!https?:\/\/)[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(value)) {
                                                                        const formattedDomain = value.toLowerCase();
                                                                        if (watch("newLogo") === null) {
                                                                            setValue("domain", formattedDomain);
                                                                            setValue("logo", brandfetchSrc(formattedDomain));
                                                                        }
                                                                    } else {
                                                                        setValue("logo", null);
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                />
                                                <div>
                                                    <Controller
                                                        name="accountId"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Select
                                                                options={accounts}
                                                                label={"Account"}
                                                                placeholder="Select Account"
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
                                                    name="opportunity"
                                                    control={control}
                                                    rules={{
                                                        required: "Opportunity name is required",
                                                    }}
                                                    render={({ field }) => (
                                                        <Input
                                                            {...field}
                                                            label="Opportunity Name"
                                                            type={`text`}
                                                            error={errors.opportunity}
                                                            requiredFiledLabel={true}
                                                            onChange={(e) => {
                                                                field.onChange(e);
                                                            }}
                                                        />
                                                    )}
                                                />
                                                <Controller
                                                    name="listPrice"
                                                    control={control}
                                                    rules={{
                                                        required: "List amount is required",
                                                    }}
                                                    render={({ field }) => (
                                                        <Input
                                                            {...field}
                                                            label="List Amount"
                                                            type="text"
                                                            requiredFiledLabel={true}
                                                            error={errors.dealAmount}
                                                            onChange={(e) => {
                                                                let value = e.target.value;

                                                                // ✅ Allow only digits
                                                                value = value.replace(/[^0-9]/g, "");

                                                                const formatted = formatMoney(value);
                                                                field.onChange(formatted);

                                                                const listAmount = parseInt(parseMoneyFloat(formatted));
                                                                const dealPrice = Math.floor((listAmount * parseInt(watch("discountPercentage"))) / 100);
                                                                const total = listAmount - dealPrice;

                                                                if (watch("discountPercentage")) {
                                                                    setValue("dealAmount", formatMoney(total));
                                                                } else {
                                                                    setValue("dealAmount", formatMoney(listAmount));
                                                                }
                                                            }}

                                                            startIcon={
                                                                <CustomIcons
                                                                    iconName={"fa-solid fa-dollar-sign"}
                                                                    css={"text-lg text-black mr-2"}
                                                                />
                                                            }
                                                        />
                                                    )}
                                                />
                                                <Controller
                                                    name="discountPercentage"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Input
                                                            {...field}
                                                            disabled={!watch("listPrice")}
                                                            label="Discount(%)"
                                                            type="text"
                                                            onChange={(e) => {
                                                                let value = e.target.value;

                                                                // ✅ Allow only digits
                                                                value = value.replace(/[^0-9]/g, "");

                                                                const num = value === "" ? 0 : parseInt(value);

                                                                // ✅ Prevent > 100
                                                                if (num > 100) return;

                                                                field.onChange(value);

                                                                const listAmount = parseInt(parseMoneyFloat(watch("listPrice")));
                                                                const dealPrice = Math.floor((listAmount * num) / 100);
                                                                const total = listAmount - dealPrice;

                                                                setValue("dealAmount", formatMoney(total));
                                                            }}

                                                            startIcon={
                                                                <CustomIcons
                                                                    iconName={"fa-solid fa-percent"}
                                                                    css={"text-lg text-black mr-2"}
                                                                />
                                                            }
                                                        />
                                                    )}
                                                />
                                                <Controller
                                                    name="dealAmount"
                                                    control={control}
                                                    rules={{
                                                        required: "Deal amount is required",
                                                    }}
                                                    render={({ field }) => (
                                                        <Input
                                                            {...field}
                                                            label="Deal Amount"
                                                            type="text"
                                                            placeholder=" "
                                                            requiredFiledLabel={true}
                                                            disabled={!watch("listPrice")}
                                                            onChange={(e) => {
                                                                let value = e.target.value;

                                                                // ✅ Allow only digits
                                                                value = value.replace(/[^0-9]/g, "");

                                                                const formatted = formatMoney(value);
                                                                field.onChange(formatted);

                                                                const listAmountStr = watch("listPrice");
                                                                if (!listAmountStr) {
                                                                    setValue("discountPercentage", "");
                                                                    return;
                                                                }

                                                                const listAmount = parseInt(parseMoneyFloat(listAmountStr));
                                                                const dealPrice = parseInt(parseMoneyFloat(value));

                                                                if (!listAmount || Number.isNaN(listAmount) || Number.isNaN(dealPrice)) {
                                                                    setValue("discountPercentage", "");
                                                                    return;
                                                                }

                                                                let percent = ((listAmount - dealPrice) * 100) / listAmount;

                                                                // ✅ Clamp 0–100
                                                                if (percent < 0) percent = 0;
                                                                if (percent > 100) percent = 100;

                                                                setValue("discountPercentage", Math.floor(percent).toString());
                                                            }}
                                                            error={errors.dealAmount}
                                                            startIcon={
                                                                <CustomIcons
                                                                    iconName={"fa-solid fa-dollar-sign"}
                                                                    css={"text-lg text-black mr-2"}
                                                                />
                                                            }
                                                        />
                                                    )}
                                                />
                                                <Controller
                                                    name="salesStage"
                                                    control={control}
                                                    rules={{
                                                        required: "Sales stage is required",
                                                    }}
                                                    render={({ field }) => (
                                                        <Select
                                                            options={opportunityStages}
                                                            label={"Stage"}
                                                            requiredFiledLabel={true}
                                                            placeholder="Select Stage"
                                                            value={parseInt(watch("salesStage")) || null}
                                                            error={errors.salesStage}
                                                            onChange={(_, newValue) => {
                                                                if (newValue?.id) {
                                                                    field.onChange(newValue.id);
                                                                } else {
                                                                    setValue("salesStage", null);
                                                                }
                                                            }}
                                                        />
                                                    )}
                                                />
                                                <DatePickerComponent requiredFiledLabel={true} setValue={setValue} control={control} name='closeDate' label={`Close Date`} minDate={new Date()} maxDate={null} required={true} />
                                                <Controller
                                                    name="status"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            options={opportunityStatus}
                                                            label={"Status"}
                                                            requiredFiledLabel={true}
                                                            placeholder="Select status"
                                                            value={parseInt(watch("status")) || null}
                                                            onChange={(_, newValue) => {
                                                                if (newValue?.id) {
                                                                    field.onChange(newValue.id);
                                                                } else {
                                                                    setValue("status", null);
                                                                }
                                                            }}
                                                        />
                                                    )}
                                                />
                                                <Controller
                                                    name="nextSteps"
                                                    control={control}
                                                    rules={{
                                                        required: "Next steps is required",
                                                    }}
                                                    render={({ field }) => (
                                                        <Input
                                                            {...field}
                                                            multiline={true}
                                                            rows={3}
                                                            requiredFiledLabel={true}
                                                            label="Next Step"
                                                            type={`text`}
                                                            error={errors.nextSteps}
                                                            onChange={(e) => {
                                                                field.onChange(e.target.value);
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </div>

                                            <div className='mt-4'>
                                                <p className='mb-2'>
                                                    Why Do Anything
                                                </p>
                                                <Editor
                                                    editorState={whyDoAnything}
                                                    wrapperClassName="editor-wrapper-custom border border-gray-300 rounded-md"
                                                    editorClassName="editor-class p-2 h-40 overflow-y-auto"
                                                    toolbarClassName="toolbar-class border-b border-gray-300"
                                                    onEditorStateChange={(state) => {
                                                        setWhyDoAnything(state)
                                                    }}
                                                    toolbar={toolbarProperties}
                                                />
                                            </div>
                                            {/* <div className='my-4'>
                                                <p className='mb-2'>
                                                    Current Environment
                                                </p>
                                                <Editor
                                                    editorState={currentEnvironment}
                                                    wrapperClassName="editor-wrapper-custom border border-gray-300 rounded-md"
                                                    editorClassName="editor-class p-2 h-40 overflow-y-auto"
                                                    toolbarClassName="toolbar-class border-b border-gray-300"
                                                    onEditorStateChange={(state) => {
                                                        setCurrentEnvironment(state)
                                                    }}
                                                    toolbar={toolbarProperties}
                                                />
                                            </div> */}

                                            <div className='my-4'>
                                                <p className='mb-2'>
                                                    Business Value
                                                </p>
                                                <Editor
                                                    editorState={businessValue}
                                                    wrapperClassName="editor-wrapper-custom border border-gray-300 rounded-md"
                                                    editorClassName="editor-class p-2 h-40 overflow-y-auto"
                                                    toolbarClassName="toolbar-class border-b border-gray-300"
                                                    onEditorStateChange={(state) => {
                                                        setBusinessValue(state)
                                                    }}
                                                    toolbar={toolbarProperties}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )
                            }
                            {
                                activeStep === 1 && (
                                    <div className="p-[30px]">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-[22px] font-semibold"></h3>
                                            {
                                                opportunitiesPartner?.length === 0 && (
                                                    <div>
                                                        <Button type={`button`} text={'Add Partner Or Competitors'} onClick={() => handleOpenPartnerModel()} startIcon={<CustomIcons iconName="fa-solid fa-plus" css="h-5 w-5" />} />
                                                    </div>
                                                )
                                            }
                                        </div>

                                        <div className="border rounded-md overflow-hidden">
                                            <div className="h-56 overflow-y-auto">
                                                <table className="min-w-full border-collapse">
                                                    {/* Header */}
                                                    <thead className="sticky top-0 z-10">
                                                        <tr className="bg-[#0478DC] text-white">
                                                            <th className="px-4 py-3 text-left text-sm font-semibold w-16">#</th>
                                                            <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                                                            <th className="px-4 py-3 text-left text-sm font-semibold">Role</th>
                                                            <th className="px-4 py-3 text-right text-sm font-semibold w-40">Action</th>
                                                        </tr>
                                                    </thead>

                                                    {/* Body */}
                                                    <tbody>
                                                        {(opportunitiesPartner?.length ? opportunitiesPartner : []).map((row, i) => (
                                                            <tr
                                                                key={row.id ?? i}
                                                                className="odd:bg-white even:bg-[#0000003B]"
                                                            >
                                                                <td className="px-4 py-3 text-sm font-bold">{i + 1}</td>
                                                                <td className="px-4 py-3 text-sm">{row.accountName || "—"}</td>
                                                                <td className="px-4 py-3 text-sm">{row.role || "—"}</td>
                                                                <td className="px-4 py-3">
                                                                    <div className='flex items-center gap-2 justify-end h-full'>
                                                                        <Tooltip title="Edit" arrow>
                                                                            <div className='bg-[#44288E] h-7 w-7 flex justify-center items-center rounded-full text-white'>
                                                                                <Components.IconButton onClick={() => handleOpenPartnerModel(row.id)}>
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
                                                        ))}

                                                        {/* Empty state */}
                                                        {(!opportunitiesPartner || opportunitiesPartner.length === 0) && (
                                                            <tr className="odd:bg-white">
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
                                )
                            }
                            {
                                activeStep === 2 && (
                                    <div className="p-[30px]">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-[22px] font-semibold"></h3>

                                            <div className="flex items-center gap-3">
                                                {editedContacts.length > 0 && (
                                                    <Tooltip title="Save" arrow>
                                                        <div className='bg-green-600 h-7 w-7 px-3 flex justify-center items-center rounded-full text-white'>
                                                            <Components.IconButton onClick={handleBulkUpdateKeyContacts} title="Update key contacts">
                                                                <CustomIcons iconName={'fa-solid fa-floppy-disk'} css='cursor-pointer text-white h-3 w-3' />
                                                            </Components.IconButton>
                                                        </div>
                                                    </Tooltip>
                                                )}

                                                <div>
                                                    <Button type={`button`} text={'Add Contact'} onClick={() => handleOpenContactModel()} startIcon={<CustomIcons iconName="fa-solid fa-plus" css="h-5 w-5" />} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border rounded-md overflow-hidden">
                                            <div className="max-h-56 overflow-y-auto">
                                                <table className="min-w-full border-collapse">
                                                    <thead className="sticky top-0 z-10">
                                                        <tr className="bg-[#0478DC] text-white">
                                                            <th className="px-4 py-3 text-left text-sm font-semibold w-16">#</th>
                                                            <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                                                            <th className="px-4 py-3 text-left text-sm font-semibold">Key Contact</th>
                                                            <th className="px-4 py-3 text-right text-sm font-semibold w-40">Action</th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        {opportunitiesContacts?.length > 0 ? (
                                                            opportunitiesContacts.map((row, i) => (
                                                                <tr
                                                                    key={row.id ?? i}
                                                                    className="odd:bg-white even:bg-gray-200"
                                                                >
                                                                    <td className="px-4 py-3 text-sm font-bold">{i + 1}</td>
                                                                    <td className="px-4 py-3 text-sm">{row.contactName || "—"}</td>

                                                                    <td className="px-4 py-3 text-sm">
                                                                        <div className="flex justify-start">
                                                                            <Checkbox
                                                                                checked={!!row.isKey}
                                                                                disabled={
                                                                                    opportunitiesContacts.filter(c => c.isKey).length >= 4 && !row.isKey
                                                                                }
                                                                                onChange={() => handleToggleKeyContact(row.id)}
                                                                            />
                                                                        </div>
                                                                    </td>

                                                                    <td className="px-4 py-3">
                                                                        <div className='flex items-center justify-end h-full'>
                                                                            <Tooltip title="Delete" arrow>
                                                                                <div className='bg-red-600 h-7 w-7 flex justify-center items-center rounded-full text-white'>
                                                                                    <Components.IconButton onClick={() => handleOpenDeleteContactDialog(row.id)}>
                                                                                        <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer text-white h-3 w-3' />
                                                                                    </Components.IconButton>
                                                                                </div>
                                                                            </Tooltip>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td
                                                                    colSpan={4}
                                                                    className="px-4 py-4 text-center text-sm font-semibold"
                                                                >
                                                                    No records
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                            {
                                activeStep === 3 && (
                                    <div className="p-[30px]">
                                        {/* Title bar */}
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-[22px] font-semibold"></h3>

                                            <div>
                                                <Button type={`button`} text={'Add Product & Service'} onClick={() => handleOpenProductModel()} startIcon={<CustomIcons iconName="fa-solid fa-plus" css="h-5 w-5" />} />
                                            </div>
                                        </div>

                                        <div className="border rounded-md overflow-hidden">
                                            <div className="max-h-56 overflow-y-auto">
                                                <table className="min-w-full border-collapse">
                                                    <thead className="sticky top-0 z-10">
                                                        <tr className="bg-[#0478DC] text-white">
                                                            <th className="px-4 py-3 text-left text-sm font-semibold w-16">#</th>
                                                            <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                                                            <th className="px-4 py-3 text-right text-sm font-semibold w-28">Qty</th>
                                                            <th className="px-4 py-3 text-right text-sm font-semibold w-32">Price</th>
                                                            <th className="px-4 py-3 text-right text-sm font-semibold w-40">Total Price</th>
                                                            <th className="px-4 py-3 text-right text-sm font-semibold w-40">Action</th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        {(opportunitiesProducts?.length ? opportunitiesProducts : []).map((row, i) => {
                                                            const qty = parseFloat(row?.qty) || 0;
                                                            const price = parseFloat(row?.price) || 0;
                                                            const total = qty * price;

                                                            return (
                                                                <tr key={row.id ?? i} className="odd:bg-white even:bg-gray-200">
                                                                    <td className="px-4 py-3 text-sm font-bold">{i + 1}</td>
                                                                    <td className="px-4 py-3 text-sm">{row.name || "—"}</td>
                                                                    <td className="px-4 py-3 text-sm text-right">{qty || "—"}</td>
                                                                    <td className="px-4 py-3 text-sm text-right">
                                                                        {price
                                                                            ? `$${price.toLocaleString('en-US')}`
                                                                            : "—"}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm text-right">
                                                                        {total
                                                                            ? `$${total.toLocaleString('en-US')}`
                                                                            : "—"}
                                                                    </td>

                                                                    <td className="px-4 py-3">
                                                                        <div className='flex items-center gap-2 justify-end h-full'>
                                                                            <div className='bg-[#44288E] h-7 w-7 flex justify-center items-center rounded-full text-white'>
                                                                                <Tooltip title="Edit" arrow>
                                                                                    <Components.IconButton onClick={() => handleOpenProductModel(row.id)}>
                                                                                        <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-white h-3 w-3' />
                                                                                    </Components.IconButton>
                                                                                </Tooltip>
                                                                            </div>
                                                                            <div className='bg-red-600 h-7 w-7 flex justify-center items-center rounded-full text-white'>
                                                                                <Tooltip title="Delete" arrow>
                                                                                    <Components.IconButton onClick={() => handleOpenDeleteProductDialog(row.id)}>
                                                                                        <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer text-white h-3 w-3' />
                                                                                    </Components.IconButton>
                                                                                </Tooltip>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}

                                                        {(!opportunitiesProducts || opportunitiesProducts.length === 0) && (
                                                            <tr>
                                                                <td colSpan={6} className="px-4 py-4 text-center text-sm font-semibold">
                                                                    No records
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                    </Components.DialogContent>

                    <Components.DialogActions>
                        <div className='flex justify-end items-center gap-4'>
                            {
                                activeStep !== 0 && (
                                    <Button onClick={handleBack} type={`button`} text={"back"} isLoading={loading} startIcon={<CustomIcons iconName={'fa-solid fa-arrow-left'} css='cursor-pointer' />} />
                                )
                            }
                            <Button type={`submit`} text={activeStep === 3 ? "Submit" : "Next"} isLoading={loading} endIcon={activeStep === 3 ? <CustomIcons iconName={'fa-solid fa-floppy-disk'} css='cursor-pointer' /> : <CustomIcons iconName={'fa-solid fa-arrow-right'} css='cursor-pointer' />} />
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
                handleAction={() => handleDeletePartner()}
                handleClose={() => handleCloseDeleteDialog()}
            />
            <AlertDialog
                open={dialogProduct.open}
                title={dialogProduct.title}
                message={dialogProduct.message}
                actionButtonText={dialogProduct.actionButtonText}
                handleAction={() => handleDeleteProduct()}
                handleClose={() => handleCloseDeleteProductDialog()}
            />
            <AlertDialog
                open={dialogContact.open}
                title={dialogContact.title}
                message={dialogContact.message}
                actionButtonText={dialogContact.actionButtonText}
                handleAction={() => handleDeleteContact()}
                handleClose={() => handleCloseDeleteContactDialog()}
            />
            <AlertDialog
                open={dialogLogo.open}
                title={dialogLogo.title}
                message={dialogLogo.message}
                actionButtonText={dialogLogo.actionButtonText}
                handleAction={() => handleDeleteOppLogo()}
                handleClose={() => handleCloseDeleteLogoDialog()}
            />
            <OpportunitiesPartnersModel open={openPartnerModel} handleClose={handleClosePartnerModel} id={selectedOppPartnerId} opportunityId={opportunityId || watch("id")} handleGetAllOpportunitiesPartners={handleGetAllOpportunitiesPartner} oppName={watch("opportunity")} />
            <OpportunitiesProductsModel open={openProductModel} handleClose={handleCloseProductModel} id={selectedProductId} opportunityId={opportunityId || watch("id")} handleGetAllOpportunitiesProducts={handleGetOppProduct} oppName={watch("opportunity")} />
            <OpportunityContactModel open={openContactModel} handleClose={handleCloseContactModel} opportunityId={opportunityId || watch("id")} handleGetAllOppContact={handleGetOppContacts} oppName={watch("opportunity")} />
        </React.Fragment>
    );
}

const mapDispatchToProps = {
    setAlert,
    setSyncingPushStatus
};

export default connect(null, mapDispatchToProps)(OpportunitiesModel)
