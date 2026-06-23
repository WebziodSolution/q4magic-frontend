import React, { useEffect } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { Controller, useForm } from 'react-hook-form';
import { connect } from 'react-redux';

import Components from '../../../components/muiComponents/components';
import Button from '../../../components/common/buttons/button';
import Input from '../../../components/common/input/input';
import { setAlert, setLoading, setSyncingPushStatus } from '../../../redux/commonReducers/commonReducers';
import CustomIcons from '../../../components/common/icons/CustomIcons';
import Select from '../../common/select/select';
import { createProducts, getProducts, updateProducts } from '../../../service/products/productService';
import Checkbox from '../../common/checkBox/checkbox';
import { handleRequestClose } from '../../../service/common/commonService';


const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

const productType = [
    {
        id: 1,
        title: "Product"
    },
    {
        id: 2,
        title: "Service"
    }
]

function AddProductModel({ setAlert, open, handleClose, id, handleGetAllProducts }) {
    const theme = useTheme()

    const {
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            id: "",
            type: "",
            name: "",
            code: "",
            price: "",
            description: "",
            isActive: false
        },
    });

    const onClose = () => {
        reset({
            id: "",
            type: "",
            name: "",
            code: "",
            price: "",
            description: "",
            isActive: false
        });
        handleClose();
    };

    const handleGetProduct = async () => {
        if (id && open) {
            const response = await getProducts(id);
            if (response?.data?.status === 200) {
                reset(response?.data?.result)
                setValue("type", productType?.find(row => row.title === response?.data?.result?.type)?.id || null);
            }
        }
    }

    useEffect(() => {
        handleGetProduct();
    }, [open]);

    const submit = async (data) => {
        const newData = {
            ...data,
            type: productType?.find(row => row.id === parseInt(data.type))?.title || null,
        }

        if (id) {
            const res = await updateProducts(id, newData)
            if (res.data.status === 200) {
                handleGetAllProducts()
                onClose()
            } else {
                setAlert(({
                    open: true,
                    message: res.data.message || "Fail to update product"
                }))
            }
        } else {
            const res = await createProducts(newData)
            if (res.data.status === 201) {
                handleGetAllProducts()
                onClose()
            } else {
                setAlert(({
                    open: true,
                    message: res.data.message || "Fail to add product"
                }))
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
                    {id ? "Update" : "Add"} Product
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
                        <div>
                            <div>
                                <Controller
                                    name="type"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            options={productType}
                                            label={"Type"}
                                            placeholder="Select type"
                                            value={parseInt(watch("type")) || null}
                                            onChange={(_, newValue) => {
                                                if (newValue?.id) {
                                                    field.onChange(newValue.id);
                                                } else {
                                                    setValue("type", null);
                                                }
                                            }}
                                        />
                                    )}
                                />
                            </div>

                            <div>
                                <Controller
                                    name="name"
                                    control={control}
                                    rules={{
                                        required: "Product Name is required",
                                    }}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Product Name"
                                            type={`text`}
                                            error={errors.name}
                                            onChange={(e) => {
                                                field.onChange(e);
                                            }}
                                        />
                                    )}
                                />
                            </div>

                            <div>
                                <Controller
                                    name="code"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Product Code"
                                            type={`text`}
                                            onChange={(e) => {
                                                field.onChange(e);
                                            }}
                                        />
                                    )}
                                />
                            </div>

                            <div>
                                <Controller
                                    name="price"
                                    rules={{
                                        required: "Price is required",
                                    }}
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Price"
                                            type={`text`}
                                            error={errors.price}
                                            onChange={(e) => {
                                                const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                                field.onChange(numericValue);
                                            }}
                                        />
                                    )}
                                />
                            </div>

                            <div className='flex justify-start items-center'>
                                <Controller
                                    name="isActive"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox
                                            text="Active"
                                            checked={watch("isActive")}
                                            onChange={(e) => field.onChange(e.target.checked)}
                                        />
                                    )}
                                />
                            </div>

                            <div className='col-span-2'>
                                <Controller
                                    name="description"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Description"
                                            type={`text`}
                                            onChange={(e) => {
                                                field.onChange(e);
                                            }}
                                            multiline={true}
                                        />
                                    )}
                                />
                            </div>
                        </div>

                    </Components.DialogContent>

                    <Components.DialogActions>
                        <div className={`flex justify-end items-center gap-4`}>
                            <div>
                                <Button type={`submit`} text={id ? "Update" : "Submit"} endIcon={<CustomIcons iconName={'fa-solid fa-floppy-disk'} css='cursor-pointer' />} />
                                <Button type="button" text={"Cancel"} useFor='disabled' onClick={() => onClose()} startIcon={<CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer mr-2' />}/>
                            </div>
                        </div>
                    </Components.DialogActions>
                </form>
            </BootstrapDialog>
        </React.Fragment>
    );
}

const mapDispatchToProps = {
    setAlert,
    setSyncingPushStatus,
    setLoading
};

export default connect(null, mapDispatchToProps)(AddProductModel)