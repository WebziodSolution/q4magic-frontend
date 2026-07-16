import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form';
import { NavLink, useNavigate } from 'react-router-dom';
import { connect } from 'react-redux';
import Cookies from 'js-cookie';

import '@authid/web-component'
import AuthIDComponent from '@authid/react-component';

import { clearSalesforceTokens, setAlert, setLoading, setSalesforceTokens, setSalesforceUserDetails } from "../../../redux/commonReducers/commonReducers";

import Header from '../../landingPage/header'
import CopyRight from '../../landingPage/copyRight'
import Input from '../../../components/common/input/input';
import CustomIcons from '../../../components/common/icons/CustomIcons';
import Button from '../../../components/common/buttons/button';
import { userLogin } from '../../../service/customers/customersService';
import { loginWithAuthID } from '../../../service/auth/authIdAccountService';
import { fetchAndSetSalesforceTokens } from '../../../utils/salesforceTokenHelper';
import { getUserInfo } from '../../../service/salesforce/connect/salesforceConnectService';

const Login = ({ setAlert, loading, salesforceUserDetails, setSalesforceTokens, clearSalesforceTokens, setSalesforceUserDetails }) => {
    const navigate = useNavigate();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [loginPreference, setLoginPreference] = useState(null);

    const emailRef = useRef(null);
    const passwordRef = useRef(null);

    const [showAuth, setShowAuth] = useState(false);
    const [finalUrl, setFinalUrl] = useState(null);
    const [userData, setUserData] = useState(null);
    const [jsonResponse, setJsonResponse] = useState(null);

    const {
        handleSubmit,
        control,
        reset,
        watch,
        setError,
        formState: { errors },
    } = useForm({
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const handleCloseAuthModel = () => {
        setShowAuth(false);
        setFinalUrl(null);
    };

    const togglePasswordVisibility = () => {
        setIsPasswordVisible((prev) => !prev);
    };

    const handleAuthFailureCount = () => {
        setAlert({
            open: true,
            message: "You have exceeded the maximum number of login attempts. Please try using password.",
            type: "error",
        });
        handleCloseAuthModel();
        setLoginPreference("password");
    }

    const handleSubmitAuth = async () => {
        if (!watch("email")) {
            setError("email", { type: "manual", message: "Email is required" });
            return;
        }

        const response = await loginWithAuthID(watch("email"));
        if (response?.status === 200) {
            const uData = response.data.result.userData;
            const customerData = response.data.result.customerData;
            localStorage.setItem("userInfo", JSON.stringify(customerData));
            setUserData(uData);
            setJsonResponse(response);

            const t = response.data.result.transactionId;
            const s = response.data.result.oneTimeSecret;
            const url = `https://id.authid.ai/?t=${t}&s=${s}`;

            setFinalUrl(url);
            setShowAuth(true);
        } else {
            setAlert({
                open: true,
                message: response?.data?.message || "An error occurred. Please try again.",
                type: "error",
            });
        }
    };

    const onSubmit = async (data) => {
        const res = await userLogin(data)
        if (res?.data?.result?.loginPreference) {
            setLoginPreference(res?.data?.result?.loginPreference || "password")
            // if (res?.data?.result?.loginPreference === "authId") {
            //     handleSubmitAuth()
            // }
        } else if (res?.data?.status === 200 && res?.data?.result?.token) {
            Cookies.set('authToken', res?.data?.result?.token, { expires: 0.5 });
            const userdata = {
                username: res?.data?.result?.username,
                email: res?.data?.result?.email,
                userId: res?.data?.result?.userId,
                roleId: res?.data?.result?.roleId,
                roleName: res?.data?.result?.roleName,
                permissions: res?.data?.result?.permissions?.rolesActions,
                subUser: res?.data?.result?.subUser,
                name: res?.data?.result?.name,
            };
            localStorage.setItem("userInfo", JSON.stringify(userdata));
            const tokens = await fetchAndSetSalesforceTokens(res?.data?.result?.userId);
            if (tokens != null) {
                setSalesforceTokens(tokens);
                let currentToken = tokens?.accessToken;
                let currentUrl = tokens?.instanceUrl;
                if (currentToken && currentUrl && !salesforceUserDetails) {
                    const userRes = await getUserInfo(currentToken, currentUrl);
                    const data = userRes?.result?.data || null;
                    if (data) {
                        setSalesforceUserDetails(data);
                        navigate("/dashboard")
                    } else {
                        setSalesforceUserDetails(null)
                        clearSalesforceTokens();
                        navigate("/dashboard")
                    }
                }
            } else {
                navigate("/dashboard")
            }
            // setAlert({ open: true, type: "success", message: res?.data?.message || "Login successful" })
        } else {
            setAlert({ open: true, type: "error", message: res?.data?.result?.error || res?.data?.msg || "Server error" })
        }
    }

    const initSalesforce = async () => {

    }

    useEffect(() => {
        if (Cookies.get('authToken')) {
            navigate("/dashboard");
        }
    }, [])

    useEffect(() => {
        if (!showAuth) return;

        const handleMessage = (event) => {
            // Debug logging to see what comes in
            if (event.data?.pageName === "verifiedMatchFailPage") {
                handleAuthFailureCount();
            }
            if (event.data?.params?.message === "LIVENESS_FINISHED") {
                if (!userData?.userId) {
                    setAlert({
                        open: true,
                        message: "An error occurred. Please try again.",
                        type: "error",
                    });
                }
            }

            if (event.data?.success) {
                Cookies.set('authToken', jsonResponse?.data?.result?.authToken, { expires: 0.5 });
                localStorage.setItem("userInfo", JSON.stringify(jsonResponse?.data?.result?.customerData));
                handleCloseAuthModel();
                // setAlert({
                //     open: true,
                //     message: "Login successful",
                //     type: "success",
                // });
                navigate("/dashboard");
            } else {
                switch (event.data.pageName) {
                    case "documentFailedPage":
                    case "documentFailedNonMobilePage":
                    case "networkErrorPage":
                    case "livenessErrorPage":
                    case "docScanWasmTimeoutPage":
                    case "requestTimeoutPage":
                    case "transactionNotValidPage":
                    case "transactionMaxAttemptsPage":
                    case "QRCodePage":
                        return;
                    case "verifiedMatchFailPage":
                    case "verifyDeclinedPage":
                    case "docScanResolutionTooLowPage":
                    case "videoDeviceNotFoundPage":
                    case "standardErrorPage":
                    case "defaultFailedPage":
                        break;
                    default:
                        break;
                }
            }
        };

        window.addEventListener("message", handleMessage, false);
        return () => window.removeEventListener("message", handleMessage, false);
    }, [showAuth, userData, jsonResponse]);

    useEffect(() => {
        if (loginPreference === "password" && passwordRef.current) {
            passwordRef.current.focus();
        }
    }, [loginPreference]);

    return (
        <>
            <div className="h-screen flex flex-col">
                <div className="fixed z-50 w-full px-5 lg:px-20 border-b border-gray-200 shadow-sm bg-white">
                    <Header />
                </div>

                <div className="flex items-center justify-center px-5 lg:px-20 py-40">
                    <form className="p-6" onSubmit={handleSubmit(onSubmit)}>
                        <div className='my-4'>
                            <p className="text-center text-2xl font-semibold text-black">Sign In</p>
                        </div>
                        <div className="flex justify-center">
                            <div className="min-w-96">
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <Controller
                                            name="email"
                                            control={control}
                                            rules={{
                                                required: "Email or Username is required",
                                            }}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    ref={emailRef}
                                                    label="Email / Username"
                                                    type="text"
                                                    error={errors?.email}
                                                    disabled={loginPreference === "password"}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/\s/g, "");
                                                        field.onChange(value);
                                                    }}
                                                    endIcon={
                                                        <span
                                                            onClick={() => { setLoginPreference(null); reset(); emailRef.current.focus(); }}
                                                            style={{ cursor: "pointer", color: "black" }}
                                                        >
                                                            {loginPreference === "password" ? (
                                                                <CustomIcons iconName="fa-solid fa-xmark" css="cursor-pointer text-black" />
                                                            ) : null}
                                                        </span>
                                                    }
                                                />
                                            )}
                                        />
                                    </div>

                                    {loginPreference === "password" && (
                                        <div>
                                            <Controller
                                                name="password"
                                                control={control}
                                                rules={{
                                                    required: "Password is required",
                                                }}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        ref={passwordRef}
                                                        label="Password"
                                                        type={isPasswordVisible ? "text" : "password"}
                                                        error={errors?.password?.message}
                                                        onChange={(e) => {
                                                            const value = e.target.value.replace(/\s/g, "");
                                                            field.onChange(value);
                                                        }}
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
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 flex justify-end items-start gap-3 cap">
                                    <div className='grow'>
                                        {loginPreference === "password" && (
                                            <>
                                                <NavLink to="/forgotpassword">
                                                    <span className="text-blue-500">Forgot Password? </span>
                                                </NavLink>
                                                <span className='text-black'>|</span>
                                            </>
                                        )}
                                        <NavLink to="/register">
                                            <span className="text-blue-500"> Registration</span>
                                        </NavLink>
                                    </div>
                                    <div>
                                        <Button type="submit" text={"Sign in"} isLoading={loading} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                {finalUrl != null ? (
                    <div className="fixed inset-0 z-50 bg-white h-screen w-screen">
                        <div>
                            <AuthIDComponent
                                url={finalUrl}
                                webauth={true} // Ensure this prop is explicitly passed
                            />
                        </div>
                        <button
                            onClick={() => { handleCloseAuthModel() }}
                            className="absolute top-5 right-5 w-10 h-10 text-xl font-bold z-50 text-black border-2 border-black rounded-full"
                        >
                            <CustomIcons iconName="fa-solid fa-xmark" css="cursor-pointer text-black text-xl" />
                        </button>
                    </div>
                ) : null}
                <div className="fixed bottom-0 z-30 w-full border-b border-gray-200 shadow-sm bg-white">
                    <CopyRight />
                </div>
            </div>
        </>
    )
}

const mapDispatchToProps = {
    setAlert,
    setLoading,
    setSalesforceTokens,
    clearSalesforceTokens,
    setSalesforceUserDetails
};

const mapStateToProps = (state) => ({
    loading: state.common.loading,
    salesforceUserDetails: state.common.salesforceUserDetails,
    salesforceAccessToken: state.common.salesforceAccessToken,
    salesforceInstanceUrl: state.common.salesforceInstanceUrl,
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);