import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { connect } from 'react-redux';
import { setAlert, setLoading } from '../../../redux/commonReducers/commonReducers';
import Cookies from 'js-cookie';

import '@authid/web-component'
import AuthIDComponent from '@authid/react-component';

import AuthIdLogo from "../../../assets/svgs/authid-logo.svg"
import AuthIdSignUpSvg from '../../../assets/svgs/authid-signup.svg';
import AuthidAthenticator from "../../../assets/svgs/authid-authenticator.svg";
import PasswordAuthenticator from "../../../assets/svgs/password-authenticator.svg";

import Stapper from '../../../components/common/stapper/stapper';
import CustomIcons from '../../../components/common/icons/CustomIcons';

import Header from '../../landingPage/header';
import CopyRight from '../../landingPage/copyRight';

import { checkValidSubUserToken, updateCustomer, userLogin, verifyUsername } from '../../../service/customers/customersService';
import { addUser, updateUser } from '../../../service/auth/authIdAccountService';
import { getCurrentLocation } from '../../../service/common/radarService';
import { capitalize, securityQuestions } from '../../../service/common/commonService';
import Input from '../../../components/common/input/input';
import Button from '../../../components/common/buttons/button';
import Select from '../../../components/common/select/select';

const steps = ["", ""];

const SubUserRegister = ({ setAlert, setLoading }) => {
    const navigate = useNavigate();
    const { token } = useParams();

    const [activeStep, setActiveStep] = useState(0);

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [showPasswordRequirement, setShowPasswordRequirement] = useState(false);
    const [finalUrl, setFinalUrl] = useState(null);
    // const [authOperationData, setAuthOperationData] = useState(null);
    const [validUsername, setValidUsername] = useState(null);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const [stopRegisterProcess, setStopRegisterProcess] = useState(false);

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

    const {
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            loginPreference: "",
            documentType: "",
            authId: "",
            id: "",
            emailAddress: "",
            username: "",
            password: "",
            name: "",
            question1: "",
            question2: "",
            question3: "",
            answer1: "",
            answer2: "",
            answer3: "",
        },
    });

    const getFilteredQuestions = (current) => {
        const selected = [watch("question1"), watch("question2"), watch("question3")].filter(
            (q) => q && q !== current
        );
        return securityQuestions.filter((q) => !selected.includes(q.id));
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

    const checkValidUrl = async () => {
        const response = await checkValidSubUserToken(token)
        if (response.data?.result?.status !== 200) {
            setStopRegisterProcess(true)
            setAlert({ open: true, message: response.data.message, type: "error" })
        } else {
            setValue("id", response.data?.result?.userId?.toString() || null)
            setValue("emailAddress", response.data?.result?.email || "")
            setValue("username", response.data?.result?.email || "")
        }
    }

    // const handleAuthSuccess = async (event) => {
    //     setLoading(true);
    //     if (event.data.success && authOperationData) {
    //         const updateJsonData = {
    //             authOperationId: authOperationData.operationId,
    //             authSelfieOperationId: '',
    //             id: authOperationData.userData?.id
    //         };
    //         setValue("authId", authOperationData.userData?.id);
    //         try {
    //             const updateResponse = await updateUser(updateJsonData);
    //             if (updateResponse.data?.status === 200) {
    //                 setLoading(false);
    //                 handleCloseAuthModel();
    //                 setAlert({
    //                     open: true,
    //                     type: "success",
    //                     message: "Verification process is completed. Let's continue with registration process.",
    //                 });
    //                 if (parseInt(watch("documentType")) === 21) {
    //                     let name = updateResponse?.data?.result?.authUserData?.userInfo?.NameOfHolder?.split(" ") || [];
    //                     if (name.length > 0) {
    //                         setValue(
    //                             "name",
    //                             name[0].charAt(0).toUpperCase() + name[0].slice(1).toLowerCase() + name[1].charAt(0).toUpperCase() + name[1].slice(1).toLowerCase()
    //                         );

    //                     }
    //                     setValue("address1", capitalize(updateResponse?.data?.result?.authUserData?.userInfo?.Address?.toLowerCase()?.replaceAll(/[^a-zA-Z0-9.,\-\s]/gi, " ")));
    //                 } else if (parseInt(watch("documentType")) === 2) {
    //                     setValue("name", capitalize(updateResponse?.data?.result?.authUserData?.userInfo?.NameOfHolder?.toLowerCase() + updateResponse?.data?.result?.authUserData?.userInfo?.primaryID?.toLowerCase()));
    //                     setValue("city", capitalize(updateResponse?.data?.result?.authUserData?.userInfo?.AddressCity?.toLowerCase()));
    //                     let pc = updateResponse?.data?.result?.authUserData?.userInfo?.AddressPostalCode?.split("-");
    //                     if (pc.length > 0) {
    //                         setValue("zipCode", pc[0]);
    //                     }
    //                     setValue("address1", capitalize(updateResponse?.data?.result?.authUserData?.userInfo?.AddressStreet?.toLowerCase()?.replaceAll(/[^a-zA-Z0-9.,\-\s]/gi, " ")));
    //                 }
    //                 setActiveStep((prevStep) => prevStep + 1);
    //             } else {
    //                 handleCloseAuthModel();
    //                 setAlert({
    //                     open: true,
    //                     type: "error",
    //                     message: "An error occurred. Please try again.",
    //                 });
    //             }
    //         } catch (error) {
    //             handleCloseAuthModel();
    //             setAlert({
    //                 open: true,
    //                 type: "error",
    //                 message: "An error occurred. Please try again.",
    //             });
    //         }
    //     }
    // };

    // const handleAuthFailure = (event) => {
    //     switch (event.data.pageName) {
    //         case "documentFailedPage":
    //         case "documentFailedNonMobilePage":
    //         case "networkErrorPage":
    //         case "livenessErrorPage":
    //         case "docScanWasmTimeoutPage":
    //         case "requestTimeoutPage":
    //             // We don't want to stop the process for these pages
    //             return;
    //         case "verifiedMatchFailPage":
    //         case "verifyDeclinedPage":
    //         case "docScanResolutionTooLowPage":
    //         case "videoDeviceNotFoundPage":
    //         case "standardErrorPage":
    //         case "defaultFailedPage":
    //             handleCloseAuthModel();
    //             setAlert({
    //                 open: true,
    //                 type: "error",
    //                 message: "Verification failed. Please try again.",
    //             });
    //             break;
    //         default:
    //             handleCloseAuthModel();
    //             break;
    //     }
    // };

    // const handleAuthenticator = async () => {
    //     try {
    //         const locationResponse = await getCurrentLocation();
    //         if (locationResponse?.address?.country === "United States") {
    //             setValue("documentType", "2");
    //         } else if (locationResponse?.address?.country === "India") {
    //             setValue("documentType", "21");
    //         }

    //         let addUserRequestData = {
    //             email: watch("emailAddress"),
    //             documentType: watch("documentType")
    //         };
    //         setLoading(true);

    //         let response = await addUser(addUserRequestData);
    //         if (response.data.status === 201) {
    //             if (response.data.result?.error === "") {
    //                 const userData = response.data.result?.userData;
    //                 const i = response.data.result?.operationId || "";
    //                 const s = response.data.result?.oneTimeSecret || "";
    //                 const finalUrl = "https://id.authid.ai/?i=" + i + "&s=" + s;
    //                 setAuthOperationData({
    //                     operationId: response.data.result?.operationId,
    //                     oneTimeSecret: response.data.result?.oneTimeSecret,
    //                     userData: userData
    //                 });
    //                 setFinalUrl(finalUrl);
    //                 setLoading(false);
    //             } else {
    //                 setLoading(false);
    //                 setAlert({
    //                     type: "error",
    //                     message: "An error occurred. Please try again.",
    //                     open: true
    //                 });
    //             }
    //         } else {
    //             setLoading(false);
    //             setAlert({
    //                 type: "error",
    //                 message: "An error occurred. Please try again.",
    //                 open: true
    //             });
    //         }
    //     } catch (error) {
    //         setLoading(false);
    //         setAlert({
    //             type: "error",
    //             message: "An error occurred. Please try again.",
    //             open: true
    //         });
    //     }
    // };

    // const handleCloseAuthModel = () => {
    //     setLoading(false);
    //     setFinalUrl(null);
    //     setAuthOperationData(null);
    // };

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

    const toggleConfirmPasswordVisibility = () => {
        setIsConfirmPasswordVisible((prev) => !prev);
    };

    const handleBack = () => {
        if (activeStep !== 0) {
            setActiveStep((prev) => prev - 1);
        } else {
            navigate("/pricing")
        }
    };

    useEffect(() => {
        checkValidUrl()
    }, [])

    // useEffect(() => {
    //     const handleMessage = (event) => {
    //         const data = event.data;

    //         if (typeof data !== "object" || data === null) {
    //             return;
    //         }

    //         if ("success" in data) {
    //             if (data.success === true) {
    //                 handleAuthSuccess(event);
    //             } else {
    //                 handleAuthFailure(event);
    //             }
    //         } else if ("pageName" in data) {
    //             handleAuthFailure(event);
    //         }
    //     };

    //     window.addEventListener("message", handleMessage);
    //     return () => {
    //         window.removeEventListener("message", handleMessage);
    //     };
    // }, [authOperationData]);

    const onSubmit = async (data) => {
        if (activeStep === 0) {
            if (validUsername && passwordError.every((error) => !error.showError)) {
                setActiveStep((prev) => prev + 1);
            }
        }
        // else if (activeStep === 1) {
        //     handleAuthenticator();
        // } 
        else if (activeStep === 1) {
            setLoading(true);
            // if (watch("loginPreference") === null || watch("loginPreference") === "") {
            //     setAlert({
            //         open: true,
            //         message: "Please select a login preference.",
            //         type: "error"
            //     });
            //     return;
            // }
            const resetData = {
                ...data,
                // authId: watch("authId"),
                question1: securityQuestions.find(q => q.id === parseInt(data.question1))?.title || "",
                question2: securityQuestions.find(q => q.id === parseInt(data.question2))?.title || "",
                question3: securityQuestions.find(q => q.id === parseInt(data.question3))?.title || "",
            }
            const res = await updateCustomer(watch("id"), resetData);
            if (res.data.status === 200) {
                setLoading(false);
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
                        subUser: res?.data?.result?.subUser
                    };
                    localStorage.setItem("userInfo", JSON.stringify(userdata));
                    navigate("/dashboard")
                    // setAlert({ open: true, type: "success", message: res?.data?.message || "Login successful" })
                } else {
                    setAlert({ open: true, type: "error", message: res?.data?.result?.error || res?.data?.msg || "Server error" })
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
        else {
            setActiveStep((prev) => prev + 1);
        }
    };

    return (
        <>
            <div className="h-screen flex flex-col">
                <div className="fixed z-50 w-full px-2 md:px-5 lg:px-20 border-b border-gray-200 shadow-sm bg-white">
                    <Header />
                </div>
                <div className="flex items-center justify-center px-2 md:px-5 py-28 lg:px-20 md:py-20">
                    <form className="p-6" onSubmit={handleSubmit(onSubmit)}>
                        <div>
                            <p className="text-center text-2xl font-semibold text-black capitalize">Welcome, let's get you setup</p>
                            <p className="text-center text-lg font-normal">Now please tell us a little more about yourself.</p>
                        </div>
                        <div className="my-6 flex justify-center">
                            <Stapper steps={steps} activeStep={activeStep} orientation="horizontal" width={700} />
                        </div>
                        {
                            activeStep === 0 && (
                                <div className="flex justify-center">
                                    <div className="min-w-80">
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <Controller
                                                    name="username"
                                                    control={control}
                                                    rules={{
                                                        required: "Username is required",
                                                    }}
                                                    render={({ field }) => (
                                                        <Input
                                                            {...field}
                                                            label="Username"
                                                            type={`text`}
                                                            error={errors?.username}
                                                            onChange={(e) => {
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

                                            <div>
                                                <Controller
                                                    name="confirmPassword"
                                                    control={control}
                                                    rules={{
                                                        required: "Confirm Password is required",
                                                        validate: {
                                                            isMatch: (value) =>
                                                                value === watch("password") || "Passwords do not match",
                                                        },
                                                    }}
                                                    render={({ field }) => (
                                                        <Input
                                                            {...field}
                                                            label="Confirm Password"
                                                            type={isConfirmPasswordVisible ? "text" : "password"}
                                                            error={errors?.confirmPassword?.message}
                                                            onChange={(e) => {
                                                                const value = e.target.value.replace(/\s/g, "");
                                                                field.onChange(value);
                                                            }}
                                                            endIcon={
                                                                <span
                                                                    onClick={toggleConfirmPasswordVisibility}
                                                                    style={{ cursor: "pointer", color: "black" }}
                                                                >
                                                                    {isConfirmPasswordVisible ? (
                                                                        <CustomIcons iconName="fa-solid fa-eye" css="cursor-pointer text-black" />
                                                                    ) : (
                                                                        <CustomIcons iconName="fa-solid fa-eye-slash" css="cursor-pointer text-black" />
                                                                    )}
                                                                </span>
                                                            }
                                                        />
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                        {/* {
                            activeStep === 1 && (
                                <div className="flex justify-center">
                                    <div className="max-w-3xl px-10">
                                        <div>
                                            <p className="text-center md:text-2xl font-semibold text-black my-6">Identity Verification Required - Biometric Check</p>
                                        </div>

                                        <div className="md:flex justify-center items-start gap-5">
                                            <div className="md:pr-5 flex md:block justify-center">
                                                <img src={AuthIdSignUpSvg} alt="Authid Signup" style={{ width: '170px' }} />
                                            </div>
                                            <div className="w-full">
                                                <p className="text-left my-3 md:my-0">To ensure the security of both your account and our platform, we need to confirm your identity due to the advanced capabilities of our tools. SalesAndMarketing.ai uses the industry-leading biometric solution <NavLink to="https://www.authid.ai/" target="_blank" rel="noreferrer" className="text-blue-600">AuthID</NavLink> for verification. You'll need a valid <strong>Driver's License</strong> and your <strong>cell phone</strong> to complete the process.</p>
                                                <p className="text-left">You can choose a one-time biometric verification or continue using a traditional password for future logins - though we recommend going passwordless for a faster and more secure experience.</p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm font-bold mt-3 text-black text-center">
                                                Powered by
                                            </p>
                                            <div className="flex justify-center items-center gap-3 my-2">
                                                <NavLink to={'https://authid.ai/'} target="_blank" rel="noreferrer">
                                                    <img src={AuthIdLogo} alt="AuthID Logo" className="h-[70px]" />
                                                </NavLink>
                                                <NavLink to={'https://kaiasoft.com/'} target="_blank" rel="noreferrer">
                                                    <img src="/images/logo/kaiasoft-logo.png" alt="Kaiasoft Logo" className="h-[70px]" />
                                                </NavLink>
                                            </div>
                                            <p className="text-sm text-center mb-3">
                                                Would you like to enable passwordless Authentication for your SaaS contact   <NavLink className={'text-blue-600'} to={'https://kaiasoft.com/'} target="_blank" rel="noreferrer">Kaiasoft.com</NavLink>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )
                        } */}
                        {
                            activeStep === 1 && (
                                <div className="flex justify-center items-center">
                                    <div className="max-w-3xl w-full px-6">
                                        {/* <div>
                                            <p className="text-center text-lg md:text-xl text-black my-5 font-semibold">
                                                Choose Your Login Preference
                                            </p>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">

                                            <div
                                                className={`border-2 ${watch("loginPreference") === "authId"
                                                    ? "border-blue-600 shadow-md"
                                                    : "border-gray-200"
                                                    } rounded-xl p-3 cursor-pointer transition-all hover:shadow-md`}
                                                onClick={() => setValue("loginPreference", "authId")}
                                            >
                                                <div className="flex flex-col items-center">
                                                    <img
                                                        src={AuthidAthenticator}
                                                        alt="Biometric Authenticator"
                                                        className="mb-3 h-14 md:h-20"
                                                    />
                                                    <p className="text-black font-medium capitalize">
                                                        Biometric Authenticator
                                                    </p>
                                                </div>
                                            </div>

                                            <div
                                                className={`border-2 ${watch("loginPreference") === "password"
                                                    ? "border-blue-600 shadow-md"
                                                    : "border-gray-200"
                                                    } rounded-xl p-3 cursor-pointer transition-all hover:shadow-md`}
                                                onClick={() => setValue("loginPreference", "password")}
                                            >
                                                <div className="flex flex-col items-center">
                                                    <img
                                                        src={PasswordAuthenticator}
                                                        alt="Password"
                                                        className="mb-3 h-14 md:h-20"
                                                    />
                                                    <p className="text-black font-medium capitalize">Password</p>
                                                </div>
                                            </div>
                                        </div> */}

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
                        <div className="mt-6 flex justify-center items-center gap-3 cap">
                            {
                                activeStep > 0 && (
                                    <div>
                                        <Button type="button" onClick={() => handleBack()} text={"Back"} disabled={stopRegisterProcess} />
                                    </div>
                                )
                            }

                            <div>
                                <Button type="submit" text={activeStep === 1 ? "Let's Go" : "next"} disabled={stopRegisterProcess} />
                            </div>
                        </div>
                    </form>
                </div>
                {/* {finalUrl != null ? (
                    <div className="fixed inset-0 z-50 bg-white h-screen w-screen">
                        <div>
                            <AuthIDComponent
                                url={finalUrl}
                                webauth={true}
                            />
                        </div>
                        <button
                            onClick={() => { handleCloseAuthModel() }}
                            className="absolute top-5 right-5 w-10 h-10 text-xl font-bold z-50 text-black border-2 border-black rounded-full"
                        >
                            <CustomIcons iconName="fa-solid fa-xmark" css="cursor-pointer text-black text-xl" />
                        </button>
                    </div>
                ) : null} */}

                <div className="fixed bottom-0 z-30 w-full border-b border-gray-200 shadow-sm bg-white">
                    <CopyRight />
                </div>
            </div>
        </>
    )
}

const mapDispatchToProps = {
    setAlert,
    setLoading
};

export default connect(null, mapDispatchToProps)(SubUserRegister);