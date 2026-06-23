import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import Cards from 'react-credit-cards-2';
import 'react-credit-cards-2/dist/es/styles-compiled.css';
import { Controller, useForm } from 'react-hook-form';
import { connect } from 'react-redux';
import { setAlert } from '../../../redux/commonReducers/commonReducers';


import { getUserDetails } from '../../../utils/getUserDetails';
import Input from '../../../components/common/input/input';
import Select from '../../../components/common/select/select';
import { getAllCountry } from '../../../service/country/countryService';
import { getAllStateByCountry } from '../../../service/state/stateService';
import { getCustomer } from '../../../service/customers/customersService';
import { createPaymentProfile, deletePaymentProfile, getPaymentProfile } from '../../../service/payment/paymentService';
import Button from '../../../components/common/buttons/button';
import AlertDialog from '../../../components/common/alertDialog/alertDialog';
import CustomIcons from '../../../components/common/icons/CustomIcons';


const formatCardNumber = (value) => {
    return value
        .replace(/\D/g, '')               // only digits
        .replace(/(.{4})/g, '$1 ')        // add space every 4 digits
        .trim();
};

const validateCardNumber = (number) => {
    const cleaned = number.replace(/\s+/g, '');
    let sum = 0, shouldDouble = false;
    for (let i = cleaned.length - 1; i >= 0; i--) {
        let digit = parseInt(cleaned[i]);
        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0 || "Enter valid card number";
};

const formatExpiry = (value) => {
    let cleaned = value.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) {
        return cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    return cleaned;
};

const validateExpiry = (value) => {
    if (!/^\d{2}\/\d{2}$/.test(value)) return "Enter valid expiration date";

    const [mm, yy] = value.split('/').map((v) => parseInt(v, 10));
    if (mm < 1 || mm > 12) return "Invalid month";

    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;

    if (yy < currentYear || (yy === currentYear && mm < currentMonth)) {
        return "Card expired";
    }

    return true;
};

const validateCVV = (value) => /^\d{3,4}$/.test(value) || "Enter valid CVV";


const CreditCard = ({ setAlert }) => {
    const data = getUserDetails();

    const [countrys, setCountrys] = useState([]);
    const [billingStates, setBillingStates] = useState([]);
    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });

    const {
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            focus: "name",
            id: "",
            cardNumber: "",
            expMonthYear: "",
            cardCode: "",
            cardType: "",

            name: "",
            email: "",
            businessName: "",
            billingAddress1: "",
            billingAddress2: "",
            billingCity: "",
            billingState: "",
            billingCountry: "",
            billingZipcode: "",
            billingPhone: "",
        },
    });

    const handleOpenDeleteDialog = () => {
        setDialog({ open: true, title: 'Delete Payment Profile', message: 'Are you sure you want to delete payment profile?', actionButtonText: 'yes' });
    }

    const handleCloseDeleteDialog = () => {
        setDialog({ open: false, title: '', message: '', actionButtonText: '' });
    }

    const handleGetAllCountrys = async () => {
        const res = await getAllCountry()
        const data = res?.data?.result?.map((item) => {
            return {
                id: item.id,
                title: item.cntName
            }
        })
        setCountrys(data)
    }

    const handleGetAllBillingStatesByCountryId = async (id) => {
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

    const handleGetUserDetails = async () => {
        const res = await getCustomer(data?.userId);
        if (res?.data?.status === 200) {
            // reset(res?.data?.result);
            setValue("cardNumber", "");
            setValue("expMonthYear", "");
            setValue("cardCode", "");
            setValue("cardType", "");
            setValue("name", res?.data?.result?.name);
            setValue("email", res?.data?.result?.emailAddress);
            setValue("businessName", res?.data?.result?.businessInfo?.businessName);
            setValue("billingAddress1", res?.data?.result?.billingAddress1);
            setValue("billingAddress2", res?.data?.result?.billingAddress2);
            setValue("billingCity", res?.data?.result?.billingCity);
            setValue("billingCountry", res?.data?.result?.billingCountry);
            setValue("billingState", res?.data?.result?.billingState);
            setValue("billingZipcode", res?.data?.result?.billingZipcode);
            setValue("billingPhone", res?.data?.result?.billingPhone);

            // const selectedCountry = countrys?.find((row) => row?.title === res?.data?.result?.billingCountry) || null
            // handleGetAllBillingStatesByCountryId(selectedCountry?.id);
        }
    }

    const handleCustomerPaymentProfile = async () => {
        const res = await getPaymentProfile();
        if (res?.data?.status === 200) {
            setValue("cardType", res?.data?.result?.paymentProfile?.cardType || "");
            setValue("cardNumber", res?.data?.result?.paymentProfile?.cardNumber || "");
            setValue("name", res?.data?.result?.paymentProfile?.firstName);
            setValue("email", res?.data?.result?.paymentProfile?.email);
            setValue("businessName", res?.data?.result?.paymentProfile?.businessName);
            setValue("billingAddress1", res?.data?.result?.paymentProfile?.address);
            setValue("billingAddress2", res?.data?.result?.paymentProfile?.billingAddress2);
            setValue("billingCity", res?.data?.result?.paymentProfile?.city);
            setValue("billingZipcode", res?.data?.result?.paymentProfile?.postCode);
            setValue("billingPhone", res?.data?.result?.paymentProfile?.phone);
            setValue("billingCountry", res?.data?.result?.paymentProfile?.country);
            setValue("billingState", res?.data?.result?.paymentProfile?.state);
        } else {
            handleGetUserDetails();
        }
    }

    const handleDeletePaymentProfile = async () => {
        const res = await deletePaymentProfile();
        if (res?.data?.status === 200) {
            setAlert({ open: true, type: 'success', message: res?.data?.message });
            handleCustomerPaymentProfile()
            handleCloseDeleteDialog();
        } else {
            setAlert({ open: true, type: 'error', message: res?.data?.message });
        }
    }

    useEffect(() => {
        handleGetAllCountrys();
        handleCustomerPaymentProfile()
    }, [])

    useEffect(() => {
        if (countrys?.length > 0 && watch("billingCountry")) {
            const selectedCountry = countrys?.find((row) => row?.title === watch("billingCountry")) || null
            handleGetAllBillingStatesByCountryId(selectedCountry?.id);
        }
    }, [countrys, watch("billingCountry")])

    const submit = async (data) => {
        const payload = {
            cardNumber: data.cardNumber.replace(/\s+/g, ''),
            expMonthYear: data.expMonthYear,
            cardCode: data.cardCode,
            name: data.name,
            email: watch("email"),
            businessName: data.businessName,
            address: data.billingAddress1,
            city: data.billingCity,
            state: data.billingState,
            country: data.billingCountry,
            postCode: data.billingZipcode,
            phone: data.billingPhone,
        }
        const res = await createPaymentProfile(payload);
        if (res?.data?.status === 200) {
            setAlert({ open: true, type: 'success', message: res?.data?.message });

            handleCustomerPaymentProfile()
        } else {
            setAlert({ open: true, type: 'error', message: res?.data?.message });
        }
    }

    return (
        <>
            <div className='flex justify-center items-center'>
                <div className='max-w-96 text-center'>
                    <h2 className='text-3xl font-semibold mb-6 text-black'>Payment Profile</h2>

                    <div className='flex justify-center items-center gap-4'>
                        <div>
                            <img alt="sealserver" src="https://sealserver.trustwave.com/seal_image.php?customerId=ded751cddc1046b69288437788ee373b&size=105x54&style=invert" />
                        </div>
                        <div>
                            <img alt="authorize" src="https://verify.authorize.net/anetseal/images/secure90x72.gif" />
                        </div>
                    </div>

                    <div>
                        <p>For your Security we do not store your Credit Card. Your Credit Card information is stored at <NavLink to="http://www.authorize.net/" target="_blank" rel="noreferrer" className='text-blue-600'>http://www.authorize.net</NavLink>  which is an industry leader in security and PCI credit card controls. You have the right to remove this Credit Card and delete your account profile at 360Pipe at any time.</p>
                    </div>

                    <div className='my-6'>
                        <h2 className='text-3xl font-semibold text-black'>Credit Card Details</h2>
                    </div>

                    <form onSubmit={handleSubmit(submit)} className='flex flex-col gap-4'>
                        {
                            watch("cardType") && watch("cardNumber") ? (
                                <>
                                    <div className='flex justify-center items-center gap-4'>
                                        <Input
                                            label="Card Type"
                                            type="text"
                                            value={watch("cardType")}
                                            disabled={true}

                                        />
                                        <Input
                                            disabled={true}
                                            label="Card Number"
                                            type="text"
                                            value={watch("cardNumber")}
                                        />
                                    </div>
                                    <div className='mt-3 w-60'>
                                        <Button type="button" text={"Remove Credit Card"} onClick={() => handleOpenDeleteDialog()} />
                                    </div>
                                </>
                            ) : <>
                                <Cards
                                    number={watch("cardNumber")}
                                    name={watch("name")}
                                    expiry={watch("expMonthYear").replace("/", "")}
                                    cvc={watch("cardCode")}
                                    focused={watch("focus")}
                                />
                                <div>
                                    <Controller
                                        name="cardNumber"
                                        control={control}
                                        rules={{
                                            required: "Card Number is required",
                                            validate: validateCardNumber
                                        }}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                label="Card Number"
                                                type="text"
                                                value={formatCardNumber(field.value)}
                                                onChange={(e) => field.onChange(formatCardNumber(e.target.value))}
                                                error={errors?.cardNumber}
                                                onFocus={() => setValue("focus", "number")}
                                            />
                                        )}
                                    />
                                </div>

                                <div className='flex justify-center items-center gap-4'>
                                    {/* Expiry */}
                                    <Controller
                                        name="expMonthYear"
                                        control={control}
                                        rules={{
                                            required: "Expiration Date is required",
                                            validate: validateExpiry
                                        }}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                label="Expiration Date"
                                                type="text"
                                                placeholder="MM/YY"
                                                value={formatExpiry(field.value)}
                                                onChange={(e) => field.onChange(formatExpiry(e.target.value))}
                                                error={errors?.expMonthYear}
                                                onFocus={() => setValue("focus", "expiry")}
                                            />
                                        )}
                                    />

                                    {/* CVV */}
                                    <Controller
                                        name="cardCode"
                                        control={control}
                                        rules={{
                                            required: "Card Code is required",
                                            validate: validateCVV
                                        }}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                label="Card Code"
                                                type="text"
                                                placeholder="123"
                                                error={errors?.cardCode}
                                                onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                                                onFocus={() => setValue("focus", "cvc")}
                                            />
                                        )}
                                    />
                                </div>
                            </>
                        }

                        <div className='my-6'>
                            <h2 className='text-3xl font-semibold text-black'>Billing Details</h2>
                        </div>

                        <div>
                            <Controller
                                name="name"
                                control={control}
                                rules={{
                                    required: "Name is required"
                                }}
                                render={({ field }) => (
                                    <Input {...field} label="Name" type="text" error={errors?.name}
                                        disabled={watch("cardType") ? true : false}
                                        onChange={(e) => {
                                            field.onChange(e.target.value);
                                        }}
                                    />
                                )}
                            />
                        </div>

                        <div>
                            <Controller
                                name="businessName"
                                control={control}
                                rules={{
                                    required: "Business Name is required"
                                }}
                                render={({ field }) => (
                                    <Input {...field} label="Company Name" type="text" error={errors?.businessName}
                                        disabled={watch("cardType") ? true : false}
                                        onChange={(e) => {
                                            field.onChange(e.target.value);
                                        }}
                                    />
                                )}
                            />
                        </div>

                        <div>
                            <Controller
                                name="billingAddress1"
                                control={control}
                                rules={{
                                    required: "Address is required"
                                }}
                                render={({ field }) => (
                                    <Input {...field} label="Address 1" type="text" error={errors?.billingAddress1}
                                        disabled={watch("cardType") ? true : false}
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
                                        disabled={watch("cardType") ? true : false}
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
                                        disabled={watch("cardType") ? true : false}
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
                                        disabled={watch("cardType") ? true : false}
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
                                        disabled={(countrys?.length === 0 || watch("cardType")) ? true : false}
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
                                        disabled={(billingStates?.length === 0 || watch("cardType")) ? true : false}
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
                                    required: watch("billingPhone") ? "Phone is required" : false,
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
                                        disabled={watch("cardType") ? true : false}
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
                        {
                            !watch("cardType") ? (
                                <div className="my-3 flex justify-end items-center gap-3 cap">
                                    <div>
                                        <Button type="submit" text={"Update"} endIcon={<CustomIcons iconName={'fa-solid fa-floppy-disk'} css='cursor-pointer' />} />
                                    </div>
                                </div>) : null
                        }
                    </form>
                </div>
            </div>
            <AlertDialog
                open={dialog.open}
                title={dialog.title}
                message={dialog.message}
                actionButtonText={dialog.actionButtonText}
                handleAction={() => handleDeletePaymentProfile()}
                handleClose={() => handleCloseDeleteDialog()}
            />
        </>
    )
}


const mapDispatchToProps = {
    setAlert,
};

export default connect(null, mapDispatchToProps)(CreditCard);