import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { connect } from "react-redux";
import { Controller, useForm } from "react-hook-form";
import Cookies from 'js-cookie';

import '@authid/web-component'

import { setAlert, setLoading } from "../../../redux/commonReducers/commonReducers";

import Button from "../../../components/common/buttons/button";
import CopyRight from "../../landingPage/copyRight";
import Header from "../../landingPage/header";
import Stapper from "../../../components/common/stapper/stapper";
import CustomIcons from "../../../components/common/icons/CustomIcons";
import Input from "../../../components/common/input/input";

import Select from "../../../components/common/select/select";
import FileInputBox from "../../../components/fileInputBox/fileInputBox";
import Checkbox from "../../../components/common/checkBox/checkbox";
import { addCustomer, updateCustomer, userLogin, verifyEmail, verifyUsername } from "../../../service/customers/customersService";
import { getAllRoles } from "../../../service/roles/rolesService";
import { brandfetchSrc, getStaticRolesWithPermissions, securityQuestions, uploadFiles } from "../../../service/common/commonService";
import { getAllCountry } from "../../../service/country/countryService";
import { getAllStateByCountry } from "../../../service/state/stateService";
import { addBusinessInfo, deleteBrandLogo, updateBusinessInfo, uploadBrandLogo } from "../../../service/businessInfo/businessInfoService";
import { createSubUserTypes } from "../../../service/subUserType/subUserTypeService";
import DatePickerComponent from "../../../components/common/datePickerComponent/datePickerComponent";
import { deleteQuota, getAllCustomerQuotas } from "../../../service/customerQuota/customerQuotaService";
import Components from "../../../components/muiComponents/components";
import AlertDialog from "../../../components/common/alertDialog/alertDialog";
import AddQuotaModel from "../../../components/models/subUser/addQuotaModel";
import { getAllSubscriptionRates } from "../../../service/subscriptionRates/subscriptionRatesService";
import { createTeam, updateTeam } from "../../../service/teamDetails/teamDetailsService";

const steps = ["", "", "", "", "", ""];

const calendarType = [
    { id: 1, title: "Calendar Year" },
    { id: 2, title: "Financial Year" },
]

const useClickOutside = (ref, handler, when = true) => {
    useEffect(() => {
        if (!when) return;
        const listener = (event) => {
            const el = ref?.current;
            if (!el) return;
            if (el.contains(event.target)) return;
            const isPortal = event.target.closest(".MuiPopover-root") ||
                event.target.closest(".MuiAutocomplete-popper") ||
                event.target.closest(".MuiDialog-root") ||
                event.target.closest(".MuiMenu-root");
            if (isPortal) return;
            handler(event);
        };
        document.addEventListener("mousedown", listener, true);
        document.addEventListener("touchstart", listener, true);
        return () => {
            document.removeEventListener("mousedown", listener, true);
            document.removeEventListener("touchstart", listener, true);
        };
    }, [ref, handler, when]);
}

const normalizeDomain = (raw) => {
    const v = (raw || "").trim();
    if (!v) return "";
    let d = v.replace(/^https?:\/\//i, "");
    d = d.split("/")[0].split("?")[0].trim();
    d = d.replace(/\.+$/, "");
    return d;
};

const Register = ({ setAlert, setLoading }) => {
    const navigate = useNavigate();

    const [activeStep, setActiveStep] = useState(0);
    const [formDataFile, setFormDataFile] = useState(null);

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [showPasswordRequirement, setShowPasswordRequirement] = useState(false);
    const [roles, setRoles] = useState([]);
    const [countrys, setCountrys] = useState([]);
    const [states, setStates] = useState([]);
    const [billingStates, setBillingStates] = useState([]);

    const [validUsername, setValidUsername] = useState(null);
    const [validEmail, setValidEmail] = useState(null);

    const [passwordError, setPasswordError] = useState([
        {
            condition: (value) => value.length >= 8,
            message: 'Minimum 8 characters long',
            showError: true,
        },
        {
            condition: (value) => /[a-z]/.test(value),
            message: 'At least one lowercase character',
            showError: true,
        },
        {
            condition: (value) => /[A-Z]/.test(value),
            message: 'At least one uppercase character',
            showError: true,
        },
        {
            condition: (value) => /[\d@$!%*?&]/.test(value),
            message: 'At least one number or special character',
            showError: true,
        },
    ]);

    const [isLogoMenuOpen, setIsLogoMenuOpen] = useState(false);
    const [isUploadLogoOpen, setIsUploadLogoOpen] = useState(false);
    const [isFetchLogoOpen, setIsFetchLogoOpen] = useState(false);
    const [domainDraft, setDomainDraft] = useState("");

    const logoMenuRef = useRef(null);
    const uploadLogoRef = useRef(null);
    const fetchLogoRef = useRef(null);

    const [quota, setQuota] = useState([])
    const [subscriptionRates, setSubscriptionRates] = useState([])
    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [selectedQuotaId, setSelectedQuotaId] = useState(null)
    const [openModel, setOpenModel] = useState(false)

    const {
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            planId: "",
            subscribeToNewsletter: true,
            billingAddressSameAsPrimary: true,
            loginPreference: "",
            documentType: "",
            authId: "",
            id: "",
            username: "",
            password: "",
            accountOwner: "",
            managerId: "",
            firstName: "",
            lastName: "",
            title: "",
            roleId: 3,
            emailAddress: "",
            cellPhone: "",
            address1: "",
            address2: "",
            city: "",
            state: "",
            country: "United States",
            zipCode: "",
            quota: "",
            evalPeriod: "",
            calendarYearType: "",
            startEvalPeriod: null,
            endEvalPeriod: null,
            question1: "",
            question2: "",
            question3: "",
            answer1: "",
            answer2: "",
            answer3: "",
            billingAddress1: "",
            billingAddress2: "",
            billingCity: "",
            billingState: "",
            billingCountry: "",
            billingZipcode: "",
            billingPhone: "",
            dateRegistered: "",

            brandId: "",
            cusId: null,
            businessName: "",
            brandName: "",
            brandLogo: "",
            websiteUrl: "",
            name: "",
            teamId: null
        },
    });

    const handleOpenModel = (id = null) => {
        setSelectedQuotaId(id)
        setOpenModel(true)
    }

    const handleCloseModel = () => {
        setSelectedQuotaId(null)
        setOpenModel(false)
    }

    const handleOpenDeleteDialog = (id) => {
        setSelectedQuotaId(id);
        setDialog({ open: true, title: 'Delete Contact', message: 'Are you sure! Do you want to delete this quota?', actionButtonText: 'yes' });
    }

    const handleCloseDeleteDialog = () => {
        setSelectedQuotaId(null);
        setDialog({ open: false, title: '', message: '', actionButtonText: '' });
    }

    const handleDeleteQuota = async () => {
        const res = await deleteQuota(selectedQuotaId);
        if (res.status === 200) {
            handleGetAllQuotas();
            handleCloseDeleteDialog();
        } else {
            setAlert({
                open: true,
                message: res?.message || "Failed to delete contact",
                type: "error"
            });
        }
    }

    const getFilteredQuestions = (current) => {
        const selected = [watch("question1"), watch("question2"), watch("question3")].filter(
            (q) => q && q !== current
        );
        return securityQuestions.filter((q) => !selected.includes(q.id));
    };

    const handleVerifyEmail = async () => {
        const email = watch("emailAddress");
        if (email) {
            const response = await verifyEmail(email);
            if (response?.data?.status === 200) {
                setValidEmail(true);
            } else {
                setAlert({
                    open: true,
                    type: "error",
                    message: response?.data?.message || "An error occurred. Please try again.",
                });
                setValidEmail(false);
            }
        }
    };

    const handleVerifyUsername = async () => {
        const username = watch("username");
        if (username) {
            const response = await verifyUsername(username);
            if (response?.data?.status === 200) {
                setValidUsername(true);
            } else {
                setAlert({
                    open: true,
                    type: "error",
                    message: response?.data?.message || "An error occurred. Please try again.",
                });
                setValidUsername(false);
            }
        }
    };

    const handleGetAllCountrys = async () => {
        if (activeStep === 2) {
            const res = await getAllCountry()
            const data = res?.data?.result?.map((item) => {
                return {
                    id: item.id,
                    title: item.cntName
                }
            })
            setCountrys(data?.filter((item) => item.id === 100 || item.id === 16))
            handleGetAllStatesByCountryId(100)
        }
    }

    const handleGetAllStatesByCountryId = async (id = 100) => {
        if (activeStep === 2) {
            const res = await getAllStateByCountry(id)
            const data = res?.data?.result?.map((item) => {
                return {
                    ...item,
                    id: item.id,
                    title: item.stateLong
                }
            })
            setStates(data)

            if (watch("state")) {
                const selectedState = data?.filter((row) => row?.title === watch("state"))?.[0] || null
                setValue("state", selectedState?.title)
            }
        }
    }

    const handleGetAllBillingStatesByCountryId = async (id) => {
        if (activeStep === 2) {
            const res = await getAllStateByCountry(id)
            const data = res?.data?.result?.map((item) => {
                return {
                    ...item,
                    id: item.id,
                    title: item.stateLong
                }
            })
            setBillingStates(data)

            if (watch("billingState")) {
                const selectedState = data?.filter((row) => row?.title === watch("billingState"))?.[0] || null
                setValue("billingState", selectedState?.title)
            }
        }
    }

    const handleGetAllRoles = async () => {
        const response = await getAllRoles();
        const data = response?.data?.result?.map(role => ({ id: role.id, title: role.role })) || [];
        setRoles(data);
    }

    const validatePassword = (value) => {
        const updatedErrors = passwordError.map((error) => ({
            ...error,
            showError: !error.condition(value),
        }));
        setPasswordError(updatedErrors);
        return updatedErrors.every((error) => !error.showError) || 'Password does not meet all requirements.';
    };

    const togglePasswordVisibility = () => {
        setIsPasswordVisible((prev) => !prev);
    };

    const handleBack = () => {
        if (activeStep !== 0) {
            setActiveStep((prev) => prev - 1);
        } else {
            navigate("/pricing")
        }
    };

    const handleImageChange = (event) => {
        if (event) {
            setFormDataFile(event)
            setValue("brandLogo", URL.createObjectURL(event));
        }
    }

    const handleUploadImage = (brandId) => {
        if (!formDataFile) {
            setLoading(false);
            setActiveStep((prev) => prev + 1);
            // navigate("/pricing")
            return;
        } else {
            const formData = new FormData();
            formData.append("files", formDataFile);
            formData.append("folderName", "brandLogo");
            formData.append("userId", brandId);

            uploadFiles(formData).then((res) => {
                if (res.data.status === 200) {
                    const { imageURL } = res?.data?.result[0];
                    uploadBrandLogo({ brandLogo: imageURL, brandId: brandId }).then((res) => {
                        if (res.data.status !== 200) {
                            setAlert({ open: true, message: res?.data?.message, type: "error" })
                        } else {
                            setFormDataFile(null)
                            setLoading(false);
                            // navigate("/pricing");
                            setActiveStep((prev) => prev + 1);
                        }
                    })
                } else {
                    setAlert({ open: true, message: res?.data?.message, type: "error" })
                    setLoading(false);
                }
            });
        }
    }

    const handleDeleteImage = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (watch("brandId") && formDataFile === null) {
            const response = await deleteBrandLogo(watch("brandId"));
            if (response.data.status === 200) {
                setValue("brandLogo", "");
                setFormDataFile(null);
            } else {
                setAlert({ open: true, message: response.data.message, type: "error" })
            }
        } else {
            setValue("brandLogo", "");
            setFormDataFile(null);
        }
    }

    const handleSaveFetchedLogo = () => {
        const d = normalizeDomain(domainDraft);
        if (!d) return;
        setValue("brandLogo", brandfetchSrc(d));
        setFormDataFile(null);
        setIsFetchLogoOpen(false);
        setDomainDraft("");
    };

    const handleGetAllQuotas = async () => {
        if (activeStep === 3 && watch("cusId")) {
            const res = await getAllCustomerQuotas(watch("cusId"))
            setQuota(res?.result)
        }
    }

    const handleGetAllSubscriptionRates = async () => {
        const res = await getAllSubscriptionRates()
        const rates = res?.result || res?.data?.result || res || [];
        setSubscriptionRates(rates);
        if (rates.length > 0 && localStorage.getItem("planId")) {
            setValue("planId", parseInt(localStorage.getItem("planId")));
            localStorage.removeItem("planId")
        }
    }

    useClickOutside(logoMenuRef, () => setIsLogoMenuOpen(false), isLogoMenuOpen);
    useClickOutside(uploadLogoRef, () => setIsUploadLogoOpen(false), isUploadLogoOpen);

    const onSubmit = async (data) => {
        if (activeStep === 0) {
            if (data.planId && validEmail && validUsername && passwordError.every((error) => !error.showError)) {
                setActiveStep((prev) => prev + 1);
            }
        }
        else if (activeStep === 2) {
            setLoading(true);
            const resetData = {
                ...data,
                question1: securityQuestions?.find(q => q.id === parseInt(data.question1))?.title || "",
                question2: securityQuestions?.find(q => q.id === parseInt(data.question2))?.title || "",
                question3: securityQuestions?.find(q => q.id === parseInt(data.question3))?.title || "",
                ...(
                    watch("billingAddressSameAsPrimary") && {
                        billingAddress1: data.address1,
                        billingAddress2: data.address2,
                        billingCity: data.city,
                        billingState: data.state,
                        billingCountry: data.country,
                        billingZipcode: data.zipCode,
                        // billingPhone: data.cellPhone,
                    }
                )
            }
            if (watch("cusId")) {
                const res = await updateCustomer(parseInt(watch("cusId")), resetData);
                if (res.data.status === 200) {
                    setLoading(false);
                    setActiveStep((prev) => prev + 1);
                } else {
                    setLoading(false);
                    setAlert({
                        type: "error",
                        message: "An error occurred. Please try again.",
                        open: true
                    });
                }
            } else {
                const res = await addCustomer(resetData);
                if (res.data.status === 201) {
                    setValue("cusId", res?.data?.result?.id)
                    const roles = {
                        userId: parseInt(res?.data?.result?.id),
                        data: getStaticRolesWithPermissions()
                    }
                    const roleRes = await createSubUserTypes(roles);
                    if (roleRes?.data?.status === 201) {
                        setLoading(false);
                        setActiveStep((prev) => prev + 1);
                    } else {
                        setLoading(false);
                        setAlert({ open: true, message: roleRes?.data?.message || "Roles not created.", type: "error" })
                    }
                } else {
                    setLoading(false);
                    setAlert({
                        type: "error",
                        message: "An error occurred. Please try again.",
                        open: true
                    });
                }
            }
        }
        else if (activeStep === 4) {
            if (data.name !== null && data.name !== "") {
                const resdata = {
                    name: data.name,
                    teamId: data.teamId,
                    createdBy: parseInt(watch("cusId")),
                }
                if (resdata?.teamId) {
                    const res = await updateTeam(resdata?.teamId, resdata)
                    if (res.status === 200) {
                        setActiveStep((prev) => prev + 1);
                    } else {
                        setLoading(false);
                        setAlert({ open: true, type: "error", message: res?.result?.message || "Server error" })
                    }
                    return
                }
                const res = await createTeam(resdata)
                if (res.status === 201) {
                    setValue("teamId", res?.result?.id)
                    setActiveStep((prev) => prev + 1);
                } else {
                    setLoading(false);
                    setAlert({ open: true, type: "error", message: res?.message || "Server error" })
                }
            } else {
                setActiveStep((prev) => prev + 1);
            }
        }
        else if (activeStep === 5) {
            setLoading(true);
            const newData = {
                id: watch("brandId"),
                cusId: watch("cusId"),
                businessName: watch("businessName"),
                // brandName: watch("brandName"),
                brandLogo: watch("brandLogo"),
                websiteUrl: watch("websiteUrl"),
            }
            if (watch("brandId")) {
                const res = await updateBusinessInfo(parseInt(watch("brandId")), newData);
                if (res.data.status === 200) {
                    setValue("brandId", res?.data?.result?.id)
                    handleUploadImage(watch("brandId"));
                } else {
                    setLoading(false);
                    setAlert({ open: true, message: res.data.message, type: "error" })
                }
            } else {
                const res = await addBusinessInfo(newData);
                if (res.data.status === 201) {
                    setValue("brandId", res?.data?.result?.id)
                    handleUploadImage(res?.data?.result?.id);
                } else {
                    setLoading(false);
                    setAlert({ open: true, message: res.data.message, type: "error" })
                }
            }
        } else if (activeStep === 6) {
            // navigate("/login")
            let newData = {
                email: watch("emailAddress"),
                password: watch("password")
            }
            const res = await userLogin(newData)
            if (res?.data?.status === 200 && res?.data?.result?.token) {
                Cookies.set('authToken', res?.data?.result?.token, { expires: 0.5 });
                const userdata = {
                    username: res?.data?.result?.username,
                    email: res?.data?.result?.email,
                    userId: res?.data?.result?.userId,
                    roleId: res?.data?.result?.roleId,
                    roleName: res?.data?.result?.roleName,
                    permissions: res?.data?.result?.permissions?.rolesActions,
                    subUser: res?.data?.result?.subUser,
                    name: res?.data?.result?.name
                };
                localStorage.setItem("userInfo", JSON.stringify(userdata));
                navigate("/dashboard")
                // setAlert({ open: true, type: "success", message: res?.data?.message || "Login successful" })
            } else {
                setAlert({ open: true, type: "error", message: res?.data?.result?.message || "Server error" })
            }
        }
        else {
            setActiveStep((prev) => prev + 1);
        }
    };

    useEffect(() => {
        if (Cookies.get('authToken')) {
            navigate("/dashboard");
        }
        handleGetAllSubscriptionRates()
        handleGetAllRoles();
    }, [])

    useEffect(() => {
        handleGetAllCountrys();
        if (activeStep === 3) {
            handleOpenModel()
        }
    }, [activeStep])

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

    return (
        <>
            <div className="h-screen flex flex-col">
                <div className="fixed z-50 w-full px-2 md:px-5 lg:px-20 border-b border-gray-200 shadow-sm bg-white">
                    <Header />
                </div>

                <div className="flex items-center justify-center px-2 md:px-5 py-28 lg:px-20 md:py-20">
                    <form className="p-6" onSubmit={handleSubmit(onSubmit)}>
                        <div>
                            <p className="text-center text-2xl font-semibold text-black">Registration</p>
                        </div>

                        <div className="my-6 flex justify-center">
                            <Stapper steps={steps} activeStep={activeStep} orientation="horizontal" width={700} />
                        </div>

                        {
                            activeStep === 0 && (
                                <div className="flex justify-center">
                                    <div className="min-w-80">
                                        <Controller
                                            name="planId"
                                            control={control}
                                            rules={{ required: "Please select a plan" }}
                                            render={({ field }) => (
                                                <div className="mb-6">
                                                    {/* <p className="text-gray-700 text-sm font-semibold mb-3 text-left">Select Subscription Plan *</p> */}
                                                    {subscriptionRates.length === 0 ? (
                                                        <div className="p-4 border border-gray-200 rounded-xl bg-gray-50 animate-pulse flex justify-between items-center">
                                                            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fadeIn">
                                                            {subscriptionRates.map((plan) => {
                                                                const isSelected = field.value === plan.id;
                                                                return (
                                                                    <div
                                                                        key={plan.id}
                                                                        onClick={() => field.onChange(plan.id)}
                                                                        className={`cursor-pointer p-3 border-2 rounded-xl transition-all flex flex-col justify-between text-left ${isSelected
                                                                            ? "border-[#44288E] bg-[#44288E]/5 shadow-sm"
                                                                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white"
                                                                            }`}
                                                                    >
                                                                        <div className="flex items-center justify-between mb-1 gap-2">
                                                                            <span className={`text-xs font-bold ${isSelected ? "text-[#44288E]" : "text-gray-900"}`}>
                                                                                {plan.licenseType}
                                                                            </span>
                                                                            <div className={`h-4 w-4 shrink-0 rounded-full border flex items-center justify-center ${isSelected ? "border-[#44288E] bg-[#44288E]" : "border-gray-300"}`}>
                                                                                {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                                                                            </div>
                                                                        </div>
                                                                        <span className="text-sm font-extrabold text-[#44288E]">
                                                                            ${plan.amount} <span className="text-[10px] font-normal text-gray-500">/mo</span>
                                                                        </span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                    {errors?.planId && (
                                                        <p className="text-red-500 text-xs mt-1 text-left">{errors.planId.message}</p>
                                                    )}
                                                </div>
                                            )}
                                        />
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <Controller
                                                    name="username"
                                                    control={control}
                                                    rules={{
                                                        required: "Username is required",
                                                        pattern: {
                                                            value: /^\S+$/, // no spaces allowed
                                                            message: "Username cannot contain spaces"
                                                        }
                                                    }}
                                                    render={({ field }) => (
                                                        <Input
                                                            {...field}
                                                            label="Username"
                                                            type="text"
                                                            error={errors?.username}
                                                            onChange={(e) => {
                                                                // remove spaces as user types
                                                                const value = e.target.value.replace(/\s/g, "");
                                                                field.onChange(value);
                                                            }}
                                                            onBlur={() => {
                                                                handleVerifyUsername();
                                                            }}
                                                            endIcon={
                                                                validUsername === true ? (
                                                                    <CustomIcons iconName={'fa-solid fa-check'} css={`text-green-500`} />
                                                                ) : validUsername === false ? (
                                                                    <CustomIcons iconName={'fa-solid fa-xmark'} css={`text-red-500`} />
                                                                ) : null
                                                            }
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
                                                            error={errors?.emailAddress}
                                                            onChange={(e) => {
                                                                const value = e.target.value.replace(/\s/g, "");
                                                                field.onChange(value);
                                                            }}
                                                            onBlur={() => {
                                                                handleVerifyEmail();
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

                                            {/* <div>
                                                <Controller
                                                    name="cellPhone"
                                                    control={control}
                                                    rules={{
                                                        required: "Phone is required",
                                                        maxLength: {
                                                            value: 10,
                                                            message: 'Enter valid phone number',
                                                        },
                                                        minLength: {
                                                            value: 10,
                                                            message: 'Enter valid phone number',
                                                        },
                                                    }}
                                                    render={({ field }) => (
                                                        <Input
                                                            {...field}
                                                            label="Phone"
                                                            type={`text`}
                                                            error={errors?.cellPhone}
                                                            onChange={(e) => {
                                                                const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                                                field.onChange(numericValue);
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </div> */}

                                            <div className="relative">
                                                <Controller
                                                    name="password"
                                                    control={control}
                                                    rules={{
                                                        required: "Password is required",
                                                        validate: {
                                                            minLength: (value) =>
                                                                value.length >= 8 || "Minimum 8 characters long",
                                                            hasLowercase: (value) =>
                                                                /[a-z]/.test(value) || "At least one lowercase character",
                                                            hasUppercase: (value) =>
                                                                /[A-Z]/.test(value) || "At least one uppercase character",
                                                            hasNumberOrSpecial: (value) =>
                                                                /[\d@$!%*?&]/.test(value) || "At least one number or special character",
                                                        },
                                                    }}
                                                    render={({ field }) => (
                                                        <Input
                                                            {...field}
                                                            label="Password"
                                                            type={isPasswordVisible ? "text" : "password"}
                                                            error={errors?.password?.message}
                                                            onChange={(e) => {
                                                                const value = e.target.value.replace(/\s/g, "");
                                                                field.onChange(value);
                                                                validatePassword(value);
                                                            }}
                                                            onFocus={() => setShowPasswordRequirement(true)}
                                                            onBlur={() => setShowPasswordRequirement(false)}
                                                            endIcon={
                                                                <span
                                                                    onClick={togglePasswordVisibility}
                                                                    style={{ cursor: "pointer", color: "black" }}
                                                                >
                                                                    {isPasswordVisible ? (
                                                                        <CustomIcons iconName="fa-solid fa-eye" css="cursor-pointer text-black" />
                                                                    ) : (
                                                                        <CustomIcons iconName="fa-solid fa-eye-slash" css="cursor-pointer text-black" />
                                                                    )}
                                                                </span>
                                                            }
                                                        />
                                                    )}
                                                />

                                                {
                                                    showPasswordRequirement && (
                                                        <div
                                                            className={`absolute -top-44 border-2 bg-white shadow z-50 md:w-96 rounded-md p-2 transform ${showPasswordRequirement ? 'translate-y-12 opacity-100' : 'translate-y-0 opacity-0'}`}
                                                        >
                                                            {passwordError.map((error, index) => (
                                                                <div key={index} className="flex items-center">
                                                                    <p className="grow text-black text-sm">{error.message}</p>
                                                                    <p>
                                                                        {error.showError ? (
                                                                            <CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer text-red-600' />
                                                                        ) : (
                                                                            <CustomIcons iconName={'fa-solid fa-check'} css='cursor-pointer text-green-600' />
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>

                                                    )
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        }

                        {
                            activeStep === 1 && (
                                <div className="flex justify-center items-center">
                                    <div className="max-w-3xl w-full px-6">
                                        {/* Question 1 */}
                                        <div className="my-6 flex justify-center items-center">
                                            <div className="max-w-96 w-full">
                                                <div className="flex gap-3">
                                                    <p className="text-lg text-black">1</p>
                                                    <div className="w-full">
                                                        <div className="mb-3">
                                                            <Controller
                                                                name="question1"
                                                                control={control}
                                                                rules={{ required: "Question 1 is required" }}
                                                                render={({ field }) => (
                                                                    <Select
                                                                        options={getFilteredQuestions(field.value)}
                                                                        label="Security Question One"
                                                                        placeholder="Select question"
                                                                        value={parseInt(watch("question1")) || null}
                                                                        onChange={(_, newValue) => field.onChange(newValue?.id || null)}
                                                                        error={errors?.question1}
                                                                    />
                                                                )}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Controller
                                                                name="answer1"
                                                                control={control}
                                                                rules={{ required: "Answer 1 is required" }}
                                                                render={({ field }) => (
                                                                    <Input {...field} label="Question One Answer" type="text" error={errors?.answer1} />
                                                                )}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Question 2 */}
                                        <div className="my-6 flex justify-center items-center">
                                            <div className="max-w-96 w-full">
                                                <div className="flex gap-3">
                                                    <p className="text-lg text-black">2</p>
                                                    <div className="w-full">
                                                        <div className="mb-3">
                                                            <Controller
                                                                name="question2"
                                                                control={control}
                                                                rules={{ required: "Question 2 is required" }}
                                                                render={({ field }) => (
                                                                    <Select
                                                                        options={getFilteredQuestions(field.value)}
                                                                        label="Security Question Two"
                                                                        placeholder="Select question"
                                                                        value={parseInt(watch("question2")) || null}
                                                                        onChange={(_, newValue) => field.onChange(newValue?.id || null)}
                                                                        error={errors?.question2}
                                                                    />
                                                                )}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Controller
                                                                name="answer2"
                                                                control={control}
                                                                rules={{ required: "Answer 2 is required" }}
                                                                render={({ field }) => (
                                                                    <Input {...field} label="Question Two Answer" type="text" error={errors?.answer2} />
                                                                )}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Question 3 */}
                                        <div className="my-6 flex justify-center items-center">
                                            <div className="max-w-96 w-full">
                                                <div className="flex gap-3">
                                                    <p className="text-lg text-black">3</p>
                                                    <div className="w-full">
                                                        <div className="mb-3">
                                                            <Controller
                                                                name="question3"
                                                                control={control}
                                                                rules={{ required: "Question 3 is required" }}
                                                                render={({ field }) => (
                                                                    <Select
                                                                        options={getFilteredQuestions(field.value)}
                                                                        label="Security Question Three"
                                                                        placeholder="Select question"
                                                                        value={parseInt(watch("question3")) || null}
                                                                        onChange={(_, newValue) => field.onChange(newValue?.id || null)}
                                                                        error={errors?.question3}
                                                                    />
                                                                )}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Controller
                                                                name="answer3"
                                                                control={control}
                                                                rules={{ required: "Answer 3 is required" }}
                                                                render={({ field }) => (
                                                                    <Input {...field} label="Question Three Answer" type="text" error={errors?.answer3} />
                                                                )}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            )
                        }
                        {
                            activeStep === 2 && (
                                <div className="flex justify-center items-center">
                                    <div className={`${!watch("billingAddressSameAsPrimary") ? "max-w-[60rem]" : "max-w-[30rem]"} w-full px-6`}>
                                        <div className={`grid ${!watch("billingAddressSameAsPrimary") ? "md:grid-cols-[1fr_auto_1fr] grid-cols-1" : "grid-cols-1"} gap-4`}>
                                            <div className="flex flex-col gap-4">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <Controller
                                                        name="firstName"
                                                        control={control}
                                                        rules={{
                                                            required: "First Name is required"
                                                        }}
                                                        render={({ field }) => (
                                                            <Input {...field} label="First Name" type="text"
                                                                onChange={(e) => {
                                                                    field.onChange(e.target.value);
                                                                }}
                                                                error={errors?.firstName}
                                                            />
                                                        )}
                                                    />
                                                    <Controller
                                                        name="lastName"
                                                        control={control}
                                                        rules={{
                                                            required: "Last Name is required"
                                                        }}
                                                        render={({ field }) => (
                                                            <Input {...field} label="Last Name" type="text"
                                                                onChange={(e) => {
                                                                    field.onChange(e.target.value);
                                                                }}
                                                                error={errors?.lastName}
                                                            />
                                                        )}
                                                    />
                                                </div>

                                                <div>
                                                    <Controller
                                                        name="title"
                                                        control={control}
                                                        rules={{
                                                            required: "Title is required"
                                                        }}
                                                        render={({ field }) => (
                                                            <Input {...field} label="Title" type="text"
                                                                onChange={(e) => {
                                                                    field.onChange(e.target.value);
                                                                }}
                                                                error={errors?.title}
                                                            />
                                                        )}
                                                    />
                                                </div>

                                                <div>
                                                    <Controller
                                                        name="roleId"
                                                        control={control}
                                                        rules={{
                                                            required: "Role is required"
                                                        }}
                                                        render={({ field }) => (
                                                            <Select
                                                                options={roles}
                                                                label={"Role"}
                                                                placeholder="Select role"
                                                                value={parseInt(watch("roleId")) || null}
                                                                onChange={(_, newValue) => {
                                                                    field.onChange(newValue.id);
                                                                }}
                                                                error={errors?.roleId}
                                                            />
                                                        )}
                                                    />
                                                </div>

                                                <div>
                                                    <Controller
                                                        name="address1"
                                                        control={control}
                                                        rules={{
                                                            required: "Address is required"
                                                        }}
                                                        render={({ field }) => (
                                                            <Input {...field} label="Address 1" type="text" error={errors?.address1}
                                                                onChange={(e) => {
                                                                    field.onChange(e.target.value);
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                </div>

                                                <div>
                                                    <Controller
                                                        name="address2"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Input {...field} label="Address 2" type="text"
                                                                onChange={(e) => {
                                                                    field.onChange(e.target.value);
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                </div>

                                                <div>
                                                    <Controller
                                                        name="city"
                                                        control={control}
                                                        rules={{
                                                            required: "City is required"
                                                        }}
                                                        render={({ field }) => (
                                                            <Input {...field} label="City" type="text" error={errors?.city}
                                                                onChange={(e) => {
                                                                    field.onChange(e.target.value);
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                </div>

                                                <div>
                                                    <Controller
                                                        name="zipCode"
                                                        control={control}
                                                        rules={{
                                                            required: "Zip Code is required"
                                                        }}
                                                        render={({ field }) => (
                                                            <Input {...field} label="Post Code" type="text" error={errors?.zipCode}
                                                                onChange={(e) => {
                                                                    const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                                                    field.onChange(numericValue);
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                </div>

                                                <div>
                                                    <Controller
                                                        name="country"
                                                        control={control}
                                                        rules={{
                                                            required: "Country is required"
                                                        }}
                                                        render={({ field }) => (
                                                            <Select
                                                                options={countrys}
                                                                label={"Country"}
                                                                placeholder="Select country"
                                                                value={countrys?.filter((row) => row.title === watch("country"))?.[0]?.id || null}
                                                                onChange={(_, newValue) => {
                                                                    if (newValue?.id) {
                                                                        field.onChange(newValue.title);
                                                                        handleGetAllStatesByCountryId(newValue.id);
                                                                    } else {
                                                                        setValue("country", null);
                                                                        setStates([]);
                                                                    }
                                                                }}
                                                                error={errors?.country}
                                                            />
                                                        )}
                                                    />
                                                </div>

                                                <div>
                                                    <Controller
                                                        name="state"
                                                        control={control}
                                                        rules={{
                                                            required: "State is required"
                                                        }}
                                                        render={({ field }) => (
                                                            <Select
                                                                disabled={states?.length === 0}
                                                                options={states}
                                                                label={"State"}
                                                                placeholder="Select state"
                                                                value={states?.filter((row) => row.title === watch("state"))?.[0]?.id || null}
                                                                onChange={(_, newValue) => {
                                                                    if (newValue?.id) {
                                                                        field.onChange(newValue.title);
                                                                    } else {
                                                                        setValue("state", null);
                                                                    }
                                                                }}
                                                                error={errors?.state}
                                                            />
                                                        )}
                                                    />
                                                </div>

                                                <div>
                                                    <Controller
                                                        name="calendarYearType"
                                                        control={control}
                                                        rules={{ required: "Calendar Year Type is required" }}
                                                        render={({ field }) => (
                                                            <Select
                                                                options={calendarType}
                                                                label="Calendar Type"
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
                                                            <DatePickerComponent setValue={setValue} control={control} name='startEvalPeriod' label={`Start Eval Period`} minDate={null} maxDate={null} required={true} />
                                                        </div>
                                                    )
                                                }

                                                {
                                                    watch("calendarYearType") && (
                                                        <div>
                                                            <DatePickerComponent setValue={setValue} control={control} name='endEvalPeriod' label={`End Eval Period`} minDate={null} maxDate={null} required={true} />
                                                        </div>
                                                    )
                                                }

                                                <div>
                                                    <Controller
                                                        name="billingAddressSameAsPrimary"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Checkbox
                                                                text="My Billing Address Is Same As My Address"
                                                                checked={watch("billingAddressSameAsPrimary")}
                                                                onChange={(e) => field.onChange(e.target.checked)}
                                                            />
                                                        )}
                                                    />
                                                </div>
                                            </div>

                                            {
                                                !watch("billingAddressSameAsPrimary") && (
                                                    <div className="hidden md:block w-px bg-gray-200 self-stretch my-5"></div>
                                                )
                                            }

                                            <div className="flex flex-col gap-4">
                                                {
                                                    !watch("billingAddressSameAsPrimary") && (
                                                        <>
                                                            <div>
                                                                <p className="text-center text-lg md:text-xl text-black mb-5 font-semibold">
                                                                    Billing Information
                                                                </p>
                                                            </div>

                                                            <div className="hidden md:block h-[84px]"></div>
                                                            <div className="hidden md:block h-[84px]"></div>

                                                            <div>
                                                                <Controller
                                                                    name="billingAddress1"
                                                                    control={control}
                                                                    rules={{
                                                                        required: "Address is required"
                                                                    }}
                                                                    render={({ field }) => (
                                                                        <Input {...field} label="Address 1" type="text" error={errors?.billingAddress1}
                                                                            onChange={(e) => {
                                                                                field.onChange(e.target.value);
                                                                            }}
                                                                        />
                                                                    )}
                                                                />
                                                            </div>

                                                            <div>
                                                                <Controller
                                                                    name="billingAddress2"
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <Input {...field} label="Address 2" type="text"
                                                                            onChange={(e) => {
                                                                                field.onChange(e.target.value);
                                                                            }}
                                                                        />
                                                                    )}
                                                                />
                                                            </div>

                                                            <div>
                                                                <Controller
                                                                    name="billingCity"
                                                                    control={control}
                                                                    rules={{
                                                                        required: "City is required"
                                                                    }}
                                                                    render={({ field }) => (
                                                                        <Input {...field} label="City" type="text" error={errors?.billingCity}
                                                                            onChange={(e) => {
                                                                                field.onChange(e.target.value);
                                                                            }}
                                                                        />
                                                                    )}
                                                                />
                                                            </div>

                                                            <div>
                                                                <Controller
                                                                    name="billingZipcode"
                                                                    control={control}
                                                                    rules={{
                                                                        required: "Zip Code is required"
                                                                    }}
                                                                    render={({ field }) => (
                                                                        <Input {...field} label="Post Code" type="text" error={errors?.billingZipcode}
                                                                            onChange={(e) => {
                                                                                const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                                                                field.onChange(numericValue);
                                                                            }}
                                                                        />
                                                                    )}
                                                                />
                                                            </div>

                                                            <div>
                                                                <Controller
                                                                    name="billingCountry"
                                                                    control={control}
                                                                    rules={{
                                                                        required: "Country is required"
                                                                    }}
                                                                    render={({ field }) => (
                                                                        <Select
                                                                            disabled={countrys?.length === 0}
                                                                            options={countrys}
                                                                            label={"Country"}
                                                                            placeholder="Select country"
                                                                            value={countrys?.filter((row) => row.title === watch("billingCountry"))?.[0]?.id || null}
                                                                            onChange={(_, newValue) => {
                                                                                if (newValue?.id) {
                                                                                    field.onChange(newValue.title);
                                                                                    handleGetAllBillingStatesByCountryId(newValue.id);
                                                                                } else {
                                                                                    setValue("billingCountry", null);
                                                                                    setBillingStates([]);
                                                                                }
                                                                            }}
                                                                            error={errors?.billingCountry}
                                                                        />
                                                                    )}
                                                                />
                                                            </div>

                                                            <div>
                                                                <Controller
                                                                    name="billingState"
                                                                    control={control}
                                                                    rules={{
                                                                        required: "State is required"
                                                                    }}
                                                                    render={({ field }) => (
                                                                        <Select
                                                                            disabled={billingStates?.length === 0}
                                                                            options={billingStates}
                                                                            label={"State"}
                                                                            placeholder="Select state"
                                                                            value={billingStates?.filter((row) => row.title === watch("billingState"))?.[0]?.id || null}
                                                                            onChange={(_, newValue) => {
                                                                                if (newValue?.id) {
                                                                                    field.onChange(newValue.title);
                                                                                } else {
                                                                                    setValue("billingState", null);
                                                                                }
                                                                            }}
                                                                            error={errors?.billingState}
                                                                        />
                                                                    )}
                                                                />
                                                            </div>

                                                            <div>
                                                                <Controller
                                                                    name="billingPhone"
                                                                    control={control}
                                                                    rules={{
                                                                        required: "Phone is required",
                                                                        maxLength: {
                                                                            value: 10,
                                                                            message: 'Enter valid phone number',
                                                                        },
                                                                        minLength: {
                                                                            value: 10,
                                                                            message: 'Enter valid phone number',
                                                                        },
                                                                    }}
                                                                    render={({ field }) => (
                                                                        <Input
                                                                            {...field}
                                                                            label="Phone"
                                                                            type={`text`}
                                                                            error={errors?.billingPhone}
                                                                            onChange={(e) => {
                                                                                const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                                                                field.onChange(numericValue);
                                                                            }}
                                                                        />
                                                                    )}
                                                                />
                                                            </div>
                                                        </>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                        {
                            activeStep === 3 && (
                                <>
                                    <div>
                                        <p className="text-center text-lg md:text-xl text-black font-semibold">
                                            Enter Your Quota
                                        </p>
                                    </div>
                                    <div className="flex justify-center items-center">
                                        <div className="overflow-y-auto max-w-xl">
                                            {/* Title bar */}
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-[22px] font-semibold"></h3>

                                                <div className='bg-green-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                                    <Components.IconButton onClick={() => handleOpenModel()}>
                                                        <CustomIcons iconName={'fa-solid fa-plus'} css='cursor-pointer text-white h-4 w-4' />
                                                    </Components.IconButton>
                                                </div>
                                            </div>

                                            {/* Table */}
                                            <div className="border rounded-md overflow-hidden">
                                                <table className="w-full text-left border-collapse">
                                                    {/* Header */}
                                                    <thead className="sticky top-0 bg-white z-10">
                                                        <tr style={{ backgroundColor: '#EDE9FE' }}>
                                                            <th className="py-4 px-6 font-semibold text-[0.875rem] leading-[1.25rem] tracking-wider uppercase text-left w-16" style={{ color: '#5B21B6' }}>#</th>
                                                            <th className="py-4 px-6 font-semibold text-[0.875rem] leading-[1.25rem] tracking-wider uppercase text-left w-60" style={{ color: '#5B21B6' }}>Term</th>
                                                            <th className="py-4 px-6 font-semibold text-[0.875rem] leading-[1.25rem] tracking-wider uppercase text-right w-40" style={{ color: '#5B21B6' }}>Quota</th>
                                                            <th className="py-4 px-6 font-semibold text-[0.875rem] leading-[1.25rem] tracking-wider uppercase text-right w-40" style={{ color: '#5B21B6' }}>Action</th>
                                                        </tr>
                                                    </thead>

                                                    {/* Body */}
                                                    {quota?.length > 0 ? (
                                                        <tbody>
                                                            {quota.map((row, i) => {
                                                                const isLastRow = i === (quota?.length || 0) - 1;
                                                                return (
                                                                    <tr key={row.id ?? i} style={{ borderBottom: isLastRow ? 'none' : '1px solid #F1F5F9' }} className="transition-colors hover:bg-[#F5F3FF]">
                                                                        <td className="px-6 py-4 align-middle text-sm font-bold text-[#111827]">{i + 1}</td>
                                                                        <td className="px-6 py-4 align-middle text-sm text-[#111827] font-medium">{row.term || '—'}</td>
                                                                        <td className="px-6 py-4 align-middle text-sm text-[#111827] font-medium text-right">${row.quota?.toLocaleString('en-US') || '—'}</td>
                                                                        <td className="px-6 py-4 align-middle">
                                                                            <div className='flex items-center gap-2 justify-end h-full'>
                                                                                <div className='bg-green-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                                                                    <Components.IconButton onClick={() => handleOpenModel(row.id)}>
                                                                                        <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-white h-4 w-4' />
                                                                                    </Components.IconButton>
                                                                                </div>
                                                                                <div className='bg-red-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                                                                    <Components.IconButton onClick={() => handleOpenDeleteDialog(row.id)}>
                                                                                        <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer text-white h-4 w-4' />
                                                                                    </Components.IconButton>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            })}
                                                        </tbody>
                                                    ) : (
                                                        <tbody>
                                                            <tr>
                                                                <td
                                                                    colSpan={4}
                                                                    className="px-4 py-4 text-center text-sm font-semibold"
                                                                >
                                                                    No records
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    )}
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )
                        }
                        {
                            activeStep === 4 && (
                                <>
                                    <div>
                                        <p className="text-center text-lg md:text-xl text-black my-5 font-semibold">
                                            Tell Us Your Team Name
                                        </p>
                                    </div>
                                    <div className='w-full'>
                                        <Controller
                                            name="name"
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    label="Team Name"
                                                    type={`text`}
                                                />
                                            )}
                                        />
                                    </div>
                                </>
                            )
                        }
                        {
                            activeStep === 5 && (
                                <>
                                    <div>
                                        <p className="text-center text-lg md:text-xl text-black my-5 font-semibold">
                                            What is your business name, brand name and brand website?
                                        </p>
                                    </div>

                                    <div className="flex justify-center items-center">
                                        <div className="max-w-96 w-full px-6 flex flex-col gap-4">
                                            <div>
                                                <Controller
                                                    name="businessName"
                                                    control={control}
                                                    rules={{
                                                        required: "Business Name is required"
                                                    }}
                                                    render={({ field }) => (
                                                        <Input {...field} label="Business Name" type="text"
                                                            onChange={(e) => {
                                                                field.onChange(e.target.value);
                                                            }}
                                                            error={errors?.businessName}
                                                        />
                                                    )}
                                                />
                                            </div>

                                            <div>
                                                <Controller
                                                    name="websiteUrl"
                                                    rules={{
                                                        required: "Website URL is required"
                                                    }}
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Input {...field} label="Website URL" type="text"
                                                            onChange={(e) => {
                                                                field.onChange(e.target.value);
                                                            }}
                                                            onBlur={(e) => {
                                                                field.onBlur();
                                                                const domain = normalizeDomain(e.target.value);
                                                                if (domain) {
                                                                    setValue("brandLogo", brandfetchSrc(domain));
                                                                    setFormDataFile(null);
                                                                }
                                                            }}
                                                            error={errors?.websiteUrl}
                                                        />
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className='flex justify-center items-center'>
                                        <div className="mt-3 relative">
                                            <div
                                                className="h-40 w-40 border-2 border-dashed border-gray-300 rounded-full flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-gray-50 transition-all overflow-hidden bg-white"
                                                onClick={() => setIsLogoMenuOpen(!isLogoMenuOpen)}
                                            >
                                                {watch("brandLogo") ? (
                                                    <img src={watch("brandLogo")} alt="Brand Logo" className="h-40 w-40 object-contain p-2" />
                                                ) : (
                                                    <div className="flex flex-col items-center p-4">
                                                        <CustomIcons iconName="fa-solid fa-image" css="text-gray-400 text-3xl mb-2" />
                                                        <p className="text-xs text-center text-gray-500 font-medium">Click to upload or fetch brand logo</p>
                                                    </div>
                                                )}
                                            </div>

                                            {isLogoMenuOpen && (
                                                <div ref={logoMenuRef} className="absolute z-50 left-60 -translate-x-1/2 bottom-5 mb-2 w-48 rounded-xl bg-white shadow-xl border border-gray-200 overflow-hidden">
                                                    <button type="button" className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-2" onClick={() => { setIsUploadLogoOpen(true); setIsLogoMenuOpen(false); }}>
                                                        <CustomIcons iconName="fa-solid fa-upload" css="h-4 w-4" /> Upload Logo
                                                    </button>
                                                    <button type="button" className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-2 border-t" onClick={() => { setIsFetchLogoOpen(true); setIsLogoMenuOpen(false); }}>
                                                        <CustomIcons iconName="fa-solid fa-cloud-arrow-down" css="h-4 w-4" /> Fetch Logo by URL
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )
                        }
                        {
                            activeStep === 6 && (
                                <>
                                    <div>
                                        <p className="text-center text-lg md:text-xl text-black my-5 font-semibold capitalize">
                                            {watch("username")}, your account is ready!
                                        </p>
                                    </div>
                                    <div className="flex justify-center items-center">
                                        <div className="md:max-w-96 w-full md:px-6 flex flex-col gap-4">
                                            <div>
                                                <Controller
                                                    name="subscribeToNewsletter"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Checkbox
                                                            text="Subscribe to 360Pipe Skills and Update"
                                                            checked={watch("subscribeToNewsletter")}
                                                            onChange={(e) => field.onChange(e.target.checked)}
                                                        />
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )
                        }
                        <div className="mt-6">
                            <div className="flex justify-center items-center gap-3">
                                {
                                    activeStep !== 6 && (
                                        <div>
                                            <Button type="button" onClick={() => handleBack()} text={"Back"} />
                                        </div>
                                    )
                                }

                                <div>
                                    <Button type="submit" text={activeStep === 6 ? "Let's Go" : "next"} />
                                </div>
                            </div>
                            {
                                activeStep === 0 && (
                                    <div className="flex justify-center items-center mt-4 text-sm">
                                        <p>
                                            Already have an account? &nbsp;
                                            <NavLink to="/login">
                                                <span className="text-blue-500">Login</span>
                                            </NavLink>
                                        </p>
                                    </div>
                                )
                            }
                        </div>
                    </form>
                </div>

                <div className="fixed bottom-0 z-30 w-full border-b border-gray-200 shadow-sm bg-white">
                    <CopyRight />
                </div>

                {/* Upload Logo Modal */}
                {isUploadLogoOpen && (
                    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 px-4">
                        <div
                            ref={uploadLogoRef}
                            className="w-full max-w-sm rounded-xl bg-white shadow-2xl border border-gray-200 overflow-hidden"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                                <p className="text-sm font-semibold text-gray-900">Upload Brand Logo</p>
                                <button
                                    type="button"
                                    className="h-8 w-8 rounded-md hover:bg-gray-100 flex items-center justify-center"
                                    onClick={() => setIsUploadLogoOpen(false)}
                                    title="Close"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 flex justify-center items-center">
                                <div className="h-40 w-40">
                                    <FileInputBox
                                        onFileSelect={handleImageChange}
                                        onRemove={handleDeleteImage}
                                        value={watch("brandLogo")}
                                        text="Click to select or drag brand logo"
                                    />
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-4 py-3 bg-gray-50 border-t flex justify-end">
                                <Button
                                    type="button"
                                    onClick={() => setIsUploadLogoOpen(false)}
                                    text="Done"
                                    className="px-6 py-2 bg-blue-600 text-white"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Fetch Logo Modal */}
                {isFetchLogoOpen && (
                    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 px-4">
                        <div
                            ref={fetchLogoRef}
                            className="w-full max-w-sm rounded-xl bg-white shadow-2xl border border-gray-200 overflow-hidden"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                                <p className="text-sm font-semibold text-gray-900">Fetch Logo via Domain</p>
                                <button
                                    type="button"
                                    className="h-8 w-8 rounded-md hover:bg-gray-100 flex items-center justify-center"
                                    onClick={() => setIsFetchLogoOpen(false)}
                                    title="Close"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-4">
                                <p className="text-xs text-gray-600 mb-2 font-medium">Enter company domain to fetch logo (e.g. google.com)</p>
                                <div className="flex flex-col gap-4">
                                    <Input
                                        placeholder="example.com"
                                        value={domainDraft}
                                        onChange={(e) => setDomainDraft(e.target.value)}
                                        autoFocus
                                    />

                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outlined"
                                            onClick={() => { setIsFetchLogoOpen(false); setDomainDraft(""); }}
                                            text="Cancel"
                                            className="px-4 py-1.5 text-xs"
                                        />
                                        <Button
                                            type="button"
                                            onClick={handleSaveFetchedLogo}
                                            text="Fetch & Save"
                                            className="px-4 py-1.5 text-xs bg-blue-600 text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <AddQuotaModel open={openModel} handleClose={handleCloseModel} customerId={watch("cusId")} id={selectedQuotaId} startEvalPeriod={watch("startEvalPeriod")} endEvalPeriod={watch("endEvalPeriod")} handleGetAllQuota={handleGetAllQuotas} />
                <AlertDialog
                    open={dialog.open}
                    title={dialog.title}
                    message={dialog.message}
                    actionButtonText={dialog.actionButtonText}
                    handleAction={() => handleDeleteQuota()}
                    handleClose={() => handleCloseDeleteDialog()}
                />
            </div>
        </>
    );
};

const mapDispatchToProps = {
    setAlert,
    setLoading
};

export default connect(null, mapDispatchToProps)(Register);