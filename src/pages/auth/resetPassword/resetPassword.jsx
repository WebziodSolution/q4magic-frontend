import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';

import { checkValidToken, resetPassword } from '../../../service/customers/customersService';
import { setAlert, setLoading } from "../../../redux/commonReducers/commonReducers";
import Header from '../../landingPage/header';
import CopyRight from '../../landingPage/copyRight';
import CustomIcons from '../../../components/common/icons/CustomIcons';
import Input from '../../../components/common/input/input';
import Button from '../../../components/common/buttons/button';

const ResetPassword = ({ setAlert, setLoading }) => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const [showPasswordRequirement, setShowPasswordRequirement] = useState(false);

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
    const [isTokenValid, setIsTokenValid] = useState(false);

    const {
        handleSubmit,
        control,
        watch,
        formState: { errors },
        setValue
    } = useForm({
        defaultValues: {
            userId: null,
            password: '',
            confirmPassword: '',
        },
    });

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

    const checkValidUrl = async () => {
        const response = await checkValidToken(token)
        if (response.data?.result?.status !== 200) {
            setAlert({ open: true, message: response.data.message, type: "error" })
            return;
        } else {
            setIsTokenValid(true)
            setValue("userId", response.data?.result?.userId || null)
        }
    }

    const onSubmit = async (data) => {
        await checkValidUrl();
        const res = await resetPassword({ ...data, token: token })
        if (res.data?.status === 200) {
            setAlert({ open: true, message: res.data.message, type: "success" })
            navigate('/login')
        } else {
            setAlert({ open: true, message: res.data.message, type: "error" })
        }
    }

    useEffect(() => {
        document.title = "Reset Password - 360Pipe"
        checkValidUrl()
    }, [])

    return (
        <>
            <div className="h-screen flex flex-col">
                <div className="fixed z-50 w-full px-5 lg:px-20 border-b border-gray-200 shadow-sm bg-white">
                    <Header />
                </div>

                <div className="flex items-center justify-center px-5 lg:px-20 py-40">
                    <form className="p-6" onSubmit={handleSubmit(onSubmit)}>
                        <div className='my-4'>
                            <p className="text-center text-2xl font-semibold text-black">Reset Password</p>
                        </div>
                        <div className="flex justify-center">
                            <div className="min-w-96">
                                <div className="relative mb-4">
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
                                                        {!isPasswordVisible ? (
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

                                <div className="relative">
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
                                                        {!isConfirmPasswordVisible ? (
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
                        <div className="mt-6 flex justify-end items-center gap-3 cap">
                            <div>
                                <Button type="submit" text={"Reset"} disabled={!isTokenValid} />
                            </div>
                        </div>
                    </form>
                </div>

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

const mapStateToProps = (state) => ({
    loading: state.common.loading,
});

export default connect(mapStateToProps, mapDispatchToProps)(ResetPassword);