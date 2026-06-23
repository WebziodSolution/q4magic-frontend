import React, { useState } from 'react'
import { connect } from 'react-redux';
import { setAlert } from '../../../redux/commonReducers/commonReducers';

import { changePassword } from '../../../service/customers/customersService';
import CustomIcons from '../../../components/common/icons/CustomIcons';
import { Controller, useForm } from 'react-hook-form';
import Input from '../../../components/common/input/input';
import Button from '../../../components/common/buttons/button';

const ChangePassword = ({ setAlert }) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
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

    const {
        handleSubmit,
        control,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            oldPassword: '',
            newPassword: '',
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

    const toggleNewPasswordVisibility = () => {
        setIsNewPasswordVisible((prev) => !prev);
    };

    const toggleConfirmPasswordVisibility = () => {
        setIsConfirmPasswordVisible((prev) => !prev);
    };

    const submit = async () => {
        if (passwordError.every((error) => !error.showError)) {
            const res = await changePassword({
                oldPassword: watch('oldPassword'),
                newPassword: watch('newPassword'),
            });
            if (res?.data?.status === 200) {
                setAlert({ open: true, message: res?.data?.message, type: "success" })
            } else {
                setAlert({ open: true, message: res?.data?.message, type: "error" })
            }
        }
    }

    return (
        <>
            <div className="flex justify-center items-center">
                <form onSubmit={handleSubmit(submit)} className="max-w-96 w-full px-6 flex flex-col gap-4">
                    <div>
                        <Controller
                            name="oldPassword"
                            control={control}
                            rules={{
                                required: "Password is required",
                            }}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    label="Varify Current Password"
                                    type={isPasswordVisible ? "text" : "password"}
                                    error={errors?.oldPassword?.message}
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

                    <div className="relative">
                        <Controller
                            name="newPassword"
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
                                    label="New Password"
                                    type={isNewPasswordVisible ? "text" : "password"}
                                    error={errors?.newPassword?.message}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\s/g, "");
                                        field.onChange(value);
                                        validatePassword(value);
                                    }}
                                    onFocus={() => setShowPasswordRequirement(true)}
                                    onBlur={() => setShowPasswordRequirement(false)}
                                    endIcon={
                                        <span
                                            onClick={toggleNewPasswordVisibility}
                                            style={{ cursor: "pointer", color: "black" }}
                                        >
                                            {isNewPasswordVisible ? (
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
                                    {passwordError?.map((error, index) => (
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
                                required: "Password is required",
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

                    <div className="mt-6 flex justify-end items-center gap-3 cap">
                        <div>
                            <Button type="submit" text={"Update"} endIcon={<CustomIcons iconName={'fa-solid fa-floppy-disk'} css='cursor-pointer' />} />
                        </div>
                    </div>
                </form>
            </div>
        </>
    )
}

const mapDispatchToProps = {
    setAlert
};

export default connect(null, mapDispatchToProps)(ChangePassword);