import React, { useEffect, useState, useRef } from 'react'
import { Controller, useForm } from 'react-hook-form';
import { getUserDetails } from '../../../utils/getUserDetails';

import { getCustomer } from '../../../service/customers/customersService';
import FileInputBox from '../../../components/fileInputBox/fileInputBox';
import Input from '../../../components/common/input/input';
import { brandfetchSrc, uploadFiles } from '../../../service/common/commonService';
import { deleteBrandLogo, updateBusinessInfo, uploadBrandLogo } from '../../../service/businessInfo/businessInfoService';
import { setAlert } from '../../../redux/commonReducers/commonReducers';
import { connect } from 'react-redux';
import Button from '../../../components/common/buttons/button';
import CustomIcons from '../../../components/common/icons/CustomIcons';

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


const Brand = ({ setAlert }) => {
    const data = getUserDetails();
    const [formDataFile, setFormDataFile] = useState(null);

    const [isLogoMenuOpen, setIsLogoMenuOpen] = useState(false);
    const [isUploadLogoOpen, setIsUploadLogoOpen] = useState(false);
    const [isFetchLogoOpen, setIsFetchLogoOpen] = useState(false);
    const [domainDraft, setDomainDraft] = useState("");

    const logoMenuRef = useRef(null);
    const uploadLogoRef = useRef(null);
    const fetchLogoRef = useRef(null);


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
            cusId: "",
            businessName: "",
            brandName: "",
            brandLogo: "",
            websiteUrl: "",
        },
    });

    const handleImageChange = (event) => {
        if (event) {
            setFormDataFile(event)
            setValue("brandLogo", URL.createObjectURL(event));
        }
    }

    const handleUploadImage = (brandId) => {
        if (!formDataFile) {
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
                        }
                    })
                } else {
                    setAlert({ open: true, message: res?.data?.message, type: "error" })
                }
            });
        }
    }

    const handleDeleteImage = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (watch("id") && formDataFile === null) {
            const response = await deleteBrandLogo(watch("id"));
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

    const handleSaveFetchedLogo = async () => {
        const d = normalizeDomain(domainDraft);
        if (!d) return;
        const logoUrl = brandfetchSrc(d);
        setValue("brandLogo", logoUrl);
        setFormDataFile(null);
        setIsFetchLogoOpen(false);
        setDomainDraft("");

        const brandId = watch("id");
        if (brandId) {
            const res = await uploadBrandLogo({ brandLogo: logoUrl, brandId: brandId });
            if (res.data.status === 200) {
                setAlert({ open: true, message: "Logo updated successfully", type: "success" });
            } else {
                setAlert({ open: true, message: res?.data?.message, type: "error" });
            }
        }
    };

    useClickOutside(logoMenuRef, () => setIsLogoMenuOpen(false), isLogoMenuOpen);
    useClickOutside(uploadLogoRef, () => setIsUploadLogoOpen(false), isUploadLogoOpen);


    const handleGetUserDetails = async () => {
        const res = await getCustomer(data?.userId);
        if (res?.data?.status === 200) {
            if (res?.data?.result?.businessInfo) {
                reset(res?.data?.result?.businessInfo);
            }
        }
    }

    useEffect(() => {
        handleGetUserDetails();
    }, []);

    const submit = async (newData) => {
        const res = await updateBusinessInfo(watch("id"), newData);
        if (res?.data?.status === 200) {
            setAlert({ open: true, message: res?.data?.message, type: "success" })
        } else {
            setAlert({ open: true, message: res?.data?.message, type: "error" })
        }
    }

    return (
        <>
            <div className="flex justify-center items-center">
                <form onSubmit={handleSubmit(submit)} className="max-w-96 w-full px-6 flex flex-col gap-4">
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
                            name="brandName"
                            rules={{
                                required: "Brand Name is required"
                            }}
                            control={control}
                            render={({ field }) => (
                                <Input {...field} label="Brand Name" type="text"
                                    onChange={(e) => {
                                        field.onChange(e.target.value);
                                    }}
                                    error={errors?.brandName}
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
                                <Input
                                    {...field}
                                    label="Website URL"
                                    type="text"
                                    onChange={(e) => {
                                        field.onChange(e.target.value);
                                    }}
                                    error={errors?.websiteUrl}
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

            <Modals
                isUploadLogoOpen={isUploadLogoOpen}
                setIsUploadLogoOpen={setIsUploadLogoOpen}
                uploadLogoRef={uploadLogoRef}
                handleImageChange={handleImageChange}
                handleDeleteImage={handleDeleteImage}
                watch={watch}
                isFetchLogoOpen={isFetchLogoOpen}
                setIsFetchLogoOpen={setIsFetchLogoOpen}
                fetchLogoRef={fetchLogoRef}
                domainDraft={domainDraft}
                setDomainDraft={setDomainDraft}
                handleSaveFetchedLogo={handleSaveFetchedLogo}
                handleUploadImage={handleUploadImage}
                id={watch("id")}
            />
        </>
    )
}

const Modals = ({
    isUploadLogoOpen,
    setIsUploadLogoOpen,
    uploadLogoRef,
    handleImageChange,
    handleDeleteImage,
    watch,
    isFetchLogoOpen,
    setIsFetchLogoOpen,
    fetchLogoRef,
    domainDraft,
    setDomainDraft,
    handleSaveFetchedLogo,
    handleUploadImage,
    id
}) => {
    return (
        <>
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
                                onClick={() => {
                                    handleUploadImage(id);
                                    setIsUploadLogoOpen(false);
                                }}
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
        </>
    )
}


const mapDispatchToProps = {
    setAlert
};

export default connect(null, mapDispatchToProps)(Brand);