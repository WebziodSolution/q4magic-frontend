import React, { useEffect, useState } from 'react'
import { Tabs } from '../../../components/common/tabs/tabs';
import { Controller, useForm } from 'react-hook-form';
import { setAlert } from '../../../redux/commonReducers/commonReducers';

import { getUserDetails } from '../../../utils/getUserDetails';

import AuthidAthenticator from "../../../assets/svgs/authid-authenticator.svg";
import PasswordAuthenticator from "../../../assets/svgs/password-authenticator.svg";
import Input from '../../../components/common/input/input';
import Select from '../../../components/common/select/select';

import { getCustomer, updateCustomer } from '../../../service/customers/customersService';
import { securityQuestions } from '../../../service/common/commonService';
import { connect } from 'react-redux';
import Button from '../../../components/common/buttons/button';
import CustomIcons from '../../../components/common/icons/CustomIcons';

const tabData = [
    {
        label: 'Security Questions'
    },
    {
        label: 'Login Preferences'
    },
]

const Security = ({ setAlert }) => {
    const data = getUserDetails();

    const [selectedTab, setSelectedTab] = useState(0);
    const handleChangeTab = (value) => {
        setSelectedTab(value);
    }

    const {
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            id: "",
            loginPreference: "",
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
        return securityQuestions?.filter((q) => !selected.includes(q.id));
    };

    const handleGetUserDetails = async () => {
        const res = await getCustomer(data?.userId);
        if (res?.data?.status === 200) {
            reset(res?.data?.result);
            setValue("question1", securityQuestions?.find(q => q.title === res?.data?.result?.question1)?.id || null);
            setValue("question2", securityQuestions?.find(q => q.title === res?.data?.result?.question2)?.id || null);
            setValue("question3", securityQuestions?.find(q => q.title === res?.data?.result?.question3)?.id || null);
        }
    }

    const submit = async (newData) => {
        const req = {
            ...newData,
            question1: securityQuestions.find(q => q.id === parseInt(newData.question1))?.title || "",
            question2: securityQuestions.find(q => q.id === parseInt(newData.question2))?.title || "",
            question3: securityQuestions.find(q => q.id === parseInt(newData.question3))?.title || "",
        }
        const res = await updateCustomer(data?.userId, req);
        if (res?.data?.status === 200) {
            setAlert({
                open: true,
                type: "success",
                message: selectedTab === 0 ? "Security questions updated successfully." : "Login preference updated successfully.",
            });
        } else {
            setAlert({
                open: true,
                type: "error",
                message: res?.data?.message || "An error occurred. Please try again.",
            });
        }
    }

    useEffect(() => {
        handleGetUserDetails();
    }, []);

    useEffect(() => {

    }, [watch("loginPreference")]);
    return (
        <div className='flex justify-center items-center'>
            <div>
                {/* <Tabs tabsData={tabData} selectedTab={selectedTab} handleChange={handleChangeTab} /> */}
                <form className='w-[500px]' onSubmit={handleSubmit(submit)}>
                    {/* Question 1 */}
                    <div className="mb-6 flex justify-center items-center">
                        <div className="max-w-96 w-full">
                            <div className="flex gap-3">
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
                    {/* {selectedTab === 1 && (
                        <div className="grid md:grid-cols-2 gap-6">
                            <button
                                className={`border-2 ${watch("loginPreference") === "authId"
                                    ? "border-[#44288E] shadow-md"
                                    : "border-gray-200"
                                    } rounded-xl p-3 cursor-pointer transition-all hover:shadow-md`}
                                onClick={() => setValue("loginPreference", "authId")}
                                type="submit"
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
                            </button>

                            <button
                                className={`border-2 ${watch("loginPreference") === "password"
                                    ? "border-[#44288E] shadow-md"
                                    : "border-gray-200"
                                    } rounded-xl p-3 cursor-pointer transition-all hover:shadow-md`}
                                onClick={() => setValue("loginPreference", "password")}
                                type="submit"
                            >
                                <div className="flex flex-col items-center">
                                    <img
                                        src={PasswordAuthenticator}
                                        alt="Password"
                                        className="mb-3 h-14 md:h-20"
                                    />
                                    <p className="text-black font-medium capitalize">Password</p>
                                </div>
                            </button>
                        </div>
                    )} */}
                    {
                        selectedTab === 0 && (
                            <div className="mt-6 mb-3 flex justify-end items-center gap-3 cap">
                                <div>
                                    <Button type="submit" text={"Update"} endIcon={<CustomIcons iconName={'fa-solid fa-floppy-disk'} css='cursor-pointer' />} />
                                </div>
                            </div>
                        )
                    }
                </form>
            </div>
        </div>
    )
}

const mapDispatchToProps = {
    setAlert,
};

export default connect(null, mapDispatchToProps)(Security);