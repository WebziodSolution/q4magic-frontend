import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { Controller, useForm } from 'react-hook-form';
import { connect } from 'react-redux';
import { setAlert, setSyncingPushStatus } from '../../../redux/commonReducers/commonReducers';

import Components from '../../../components/muiComponents/components';
import Button from '../../../components/common/buttons/button';
import CustomIcons from '../../../components/common/icons/CustomIcons';
import Select from '../../../components/common/select/select';

import { getAllActiveProducts } from '../../../service/products/productService';
import Input from '../../common/input/input';
import { createOpportunitiesProducts, getOpportunitiesProducts, updateOpportunitiesProducts } from '../../../service/opportunities/OpportunityProductsService';
import { handleRequestClose } from '../../../service/common/commonService';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

function OpportunitiesProductsModel({ setAlert, open, handleClose, id, opportunityId, handleGetAllOpportunitiesProducts, setSyncingPushStatus, oppName }) {
    const theme = useTheme()
    const [products, setProducts] = useState([])

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
            productId: null,
            oppId: null,
            name: null,
            price: null,
            qty: null,
        },
    });

    const onClose = () => {
        reset({
            id: null,
            productId: null,
            oppId: null,
            name: null,
            price: null,
            qty: null,
        });
        handleClose();
    };

    const handleGetAllProducts = async () => {
        if (open) {
            const res = await getAllActiveProducts()
            const data = res.data.result?.map((item, index) => {
                return {
                    ...item,
                    title: item.name
                }
            })
            setProducts(data)
        }
    }

    const handleGetProduct = async () => {
        if (id && open) {
            const res = await getOpportunitiesProducts(id)
            if (res.status === 200) {
                reset(res.result)
                setValue(
                    "price",
                    formatMoney(
                        res.result?.price !== null && res.result?.price !== undefined
                            ? Number(res.result.price).toFixed(2)
                            : ""
                    )
                );
            }
        }
    }

    useEffect(() => {
        handleGetProduct()
        handleGetAllProducts()
    }, [open])

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
        const newData = {
            ...data,
            qty: parseInt(data.qty),
            oppId: opportunityId,
            price: parseFloat(parseMoneyFloat(data.price)),
        }
        if (id) {
            const res = await updateOpportunitiesProducts(id, newData)
            if (res.status === 200) {
                setSyncingPushStatus(true)
                handleGetAllOpportunitiesProducts()
                onClose()
            } else {
                setAlert({
                    open: true,
                    message: res.message || "Fail to update opportunity partner",
                    type: "error"
                })
            }
        } else {
            const res = await createOpportunitiesProducts(newData);
            if (res.status === 201) {
                handleGetAllOpportunitiesProducts()
                setSyncingPushStatus(true);
                onClose()
            } else {
                setAlert({
                    open: true,
                    message: res.message || "Fail to add opportunity partner",
                    type: "error"
                })
            }
        }
    }

    return (
        <React.Fragment>
            <BootstrapDialog
                onClose={(event, reason) => handleRequestClose(event, reason, onClose)}
                open={open}
                aria-labelledby="customized-dialog-title"
                fullWidth
                maxWidth='sm'
            >
                <Components.DialogTitle sx={{ m: 0, p: 2, color: theme.palette.text.primary }} id="customized-dialog-title">
                    {id ? "Update" : "Add"} Product & Service For <strong>{oppName}</strong>
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

                <form noValidate onSubmit={handleSubmit(submit)} className='h-full'>
                    <Components.DialogContent dividers>
                        <div className='px-[30px]'>
                            <div className='grid gap-[30px]'>
                                <div>
                                    <Controller
                                        name={`productId`}
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Select
                                                options={products || []} // Prevent selecting the same account in both fields
                                                label={"Product"}
                                                requiredFiledLabel={true}
                                                placeholder="Select product"
                                                value={parseInt(watch(`productId`)) || null}
                                                onChange={(_, newValue) => {
                                                    if (newValue?.id) {
                                                        field.onChange(newValue.id);
                                                        setValue("name", newValue.name)
                                                        setValue("price", formatMoney(newValue?.price))
                                                    } else {
                                                        setValue(`productId`, null);
                                                        setValue("name", null)
                                                        setValue("price", null)
                                                    }
                                                }}
                                                error={errors?.productId}
                                            />
                                        )}
                                    />
                                </div>
                                <div>
                                    <Controller
                                        name="name"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                disabled
                                                label="Product Name"
                                                type={`text`}
                                            />
                                        )}
                                    />
                                </div>
                                <div>
                                    <Controller
                                        name="qty"
                                        control={control}
                                        rules={{
                                            required: "Qty name is required",
                                        }}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                requiredFiledLabel={true}
                                                disabled={!watch("name")}
                                                label="Quantity"
                                                type={`text`}
                                                error={errors.qty}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\D/g, '');
                                                    field.onChange(value);
                                                }}
                                            />
                                        )}
                                    />
                                </div>
                                <div>
                                    <Controller
                                        name="price"
                                        control={control}
                                        rules={{
                                            required: "price is required",
                                        }}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                type="text"
                                                requiredFiledLabel={true}
                                                disabled={!watch("name")}
                                                error={errors.price}
                                                onChange={(e) => {
                                                    let value = e.target.value;

                                                    // Remove everything except digits and dot
                                                    value = value.replace(/[^0-9.]/g, "");

                                                    // Allow only 1 dot
                                                    const parts = value.split(".");
                                                    if (parts.length > 2) {
                                                        value = parts[0] + "." + parts.slice(1).join("");
                                                    }

                                                    // Max 2 decimals
                                                    if (parts[1]) {
                                                        parts[1] = parts[1].slice(0, 2);
                                                    }

                                                    value = parts.join(".");

                                                    // Apply comma formatting
                                                    const formatted = formatMoney(value);

                                                    field.onChange(formatted);
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
                                </div>
                            </div>
                        </div>
                    </Components.DialogContent>

                    <Components.DialogActions>
                        <div className='flex justify-end items-center gap-4'>
                            <Button type={`submit`} text={id ? "Update" : "Submit"} endIcon={<CustomIcons iconName={'fa-solid fa-floppy-disk'} css='cursor-pointer' />} />
                            <Button type="button" text={"Cancel"} useFor='disabled' onClick={() => onClose()} startIcon={<CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer mr-2' />} />
                        </div>
                    </Components.DialogActions>
                </form>
            </BootstrapDialog>
        </React.Fragment>
    );
}

const mapDispatchToProps = {
    setAlert,
    setSyncingPushStatus
};

export default connect(null, mapDispatchToProps)(OpportunitiesProductsModel)