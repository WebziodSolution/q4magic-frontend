import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { setAlert, setLoading } from "../../../redux/commonReducers/commonReducers";

import CopyRight from "../../landingPage/copyRight"
import Header from "../../landingPage/header"
import Input from "../../../components/common/input/input";
import Button from "../../../components/common/buttons/button";

import { forgotPassword } from "../../../service/customers/customersService";
import { securityQuestions } from "../../../service/common/commonService";


const ForgotPassword = ({ setAlert, setLoading }) => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);

    const {
        handleSubmit,
        control,
        watch,
        reset,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            username: "",
            answer: null,
            question: null,
            questionId: null,
        },
    });

    const handleBack = () => {
        if (activeStep !== 0) {
            setActiveStep((prev) => prev - 1);
        } else {
            navigate("/login")
        }
    };

    const onSubmit = async (data) => {
        if (activeStep === 0) {
            const res = await forgotPassword(data);
            if (res?.data?.status === 200 || res?.data?.result?.question) {
                const question = securityQuestions?.find(q => q.title === res?.data?.result?.question)?.title
                setValue("question", question);
                setValue("questionId", res?.data?.result?.questionId);
                setActiveStep((prev) => prev + 1);
            } else {
                setAlert({ open: true, type: 'error', message: res?.data?.message?.split(":")[1] || 'An error occurred. Please try again later.' });
            }
        } else {
            const res = await forgotPassword(data);
            if (res?.data?.status === 200 && res?.data?.result?.isAnswerCorrect === true) {
                reset({
                    username: "",
                    answer: null,
                    question: null,
                    questionId: null,
                });
                setActiveStep(0);
                setAlert({ open: true, type: 'success', message: res?.data?.result?.message || 'Your password has been sent to your registered email address.' });
            } else {
                setAlert({ open: true, type: 'error', message: res?.data?.result?.message || 'An error occurred. Please try again later.' });
            }
        }
    }

    useEffect(() => {
        document.title = "Forgot Password - 360Pipe"
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
                            <p className="text-center text-2xl font-semibold text-black">Forgot Password</p>
                        </div>

                        <div className="flex justify-center">
                            <div className="min-w-96">
                                <div className="grid grid-cols-1 gap-4">
                                    {
                                        activeStep === 0 && (
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
                                                            label="User Name"
                                                            type="text"
                                                            error={errors?.username}
                                                            onChange={(e) => {
                                                                field.onChange(e);
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </div>
                                        )
                                    }
                                    {
                                        activeStep === 1 && (
                                            <div>
                                                <div className="mb-4">
                                                    <p className="text-md font-medium text-gray-700">{watch("question")}</p>
                                                </div>
                                                <Controller
                                                    name="answer"
                                                    control={control}
                                                    rules={{
                                                        required: "Answer is required",
                                                    }}
                                                    render={({ field }) => (
                                                        <Input
                                                            {...field}
                                                            // label="Answer"
                                                            placeholder="Enter answer"
                                                            type="text"
                                                            error={errors?.answer}
                                                            onChange={(e) => {
                                                                field.onChange(e);
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </div>
                                        )
                                    }
                                </div>

                            </div>
                        </div>

                        <div className="mt-6 flex justify-center items-center gap-3 cap">
                            <div>
                                <Button type="button" onClick={() => handleBack()} text={activeStep === 0 ? "Cancel" : "Back"} />
                            </div>

                            <div>
                                <Button type="submit" text={activeStep === 0 ? "Next" : "Submit"} />
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

export default connect(mapStateToProps, mapDispatchToProps)(ForgotPassword);