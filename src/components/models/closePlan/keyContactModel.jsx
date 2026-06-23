import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { connect } from 'react-redux';
import { setAlert } from '../../../redux/commonReducers/commonReducers';

import Stapper from '../../common/stapper/stapper';
import Components from '../../muiComponents/components';
import Button from '../../common/buttons/button';
import CustomIcons from '../../common/icons/CustomIcons';
import Checkbox from '../../common/checkBox/checkbox';

import { saveClosePlan } from '../../../service/closePlanService/closePlanService';
import { getAllOpportunitiesContact } from '../../../service/opportunities/opportunitiesContactService';
import { getOpportunityDetails } from '../../../service/opportunities/opportunitiesService';
import { handleRequestClose } from '../../../service/common/commonService';


const steps = [
    "Select Conatcts",
    "Copy Url"
]

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': { padding: theme.spacing(2) },
    '& .MuiDialogActions-root': { padding: theme.spacing(1) },
}));

function KeyContactModel({
    setAlert,
    open,
    handleClose,
    opportunityId,
    handleGetAllOpportunities
}) {
    const theme = useTheme();
    const [activeStep, setActiveStep] = useState(0)
        
    const [oppDetails, setOppDetails] = useState(null)
    const [contacts, setContacts] = useState([]);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [closePlanUrl, setClosePlanUrl] = useState([]);

    const onClose = () => {
        setActiveStep(0)
        setContacts([]);
        setOppDetails(null)
        handleClose();
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1)
    }

    const handleNext = () => {
        setActiveStep((prev) => prev + 1)
    }

    const handleCopyUrl = (url, index) => {
        navigator.clipboard.writeText(url)
            .then(() => {
                setCopiedIndex(index);
                // Show success feedback
                setAlert({
                    open: true,
                    message: 'URL copied to clipboard!',
                    type: 'success'
                });

                // Reset copied state after 2 seconds
                setTimeout(() => {
                    setCopiedIndex(null);
                }, 5000);
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
                setAlert({
                    open: true,
                    message: 'Failed to copy URL',
                    type: 'error'
                });
            });
    };

    const handleOpenUrl = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handleToggleAll = (isChecked) => {
        if (isChecked) {
            setContacts((prev) => prev.map((r) => ({ ...r, isAdd: true })));
        } else {
            setContacts((prev) => prev.map((r) => ({ ...r, isAdd: false })));
        }
    }

    const handleSelectRow = (row, isChecked) => {
        if (isChecked) {
            setContacts((prev) =>
                prev.map((r) => (r.id === row.id ? { ...r, isAdd: true } : r))
            );
        } else {
            setContacts((prev) =>
                prev.map((r) => (r.id === row.id ? { ...r, isAdd: false } : r))
            );
        }
    }

    const handleGetAllContact = async () => {
        if (open && opportunityId) {
            const response = await getOpportunityDetails(opportunityId);
            if (response?.status === 200) {
                setOppDetails(response?.result)
            }
            const res = await getAllOpportunitiesContact(opportunityId);
            const data = res?.result?.filter((row) => row.isKey === true)?.map((item) => ({
                id: item.id,
                title: item.contactName,
                isAdd: false,
                role: item.role,
                contactId: item.contactId,
            })) || [];
            setContacts(data);

        }
    };

    useEffect(() => {
        handleGetAllContact();
    }, [open]);

    const submit = async () => {
        if (contacts?.filter((row) => row.isAdd).length > 0) {
            const payload = contacts?.filter((row) => row.isAdd).map((item) => ({
                oppId: opportunityId,
                contactId: item.contactId,
            }))
            const res = await saveClosePlan(payload);
            if (res.status === 201) {
                setClosePlanUrl(res?.result);
                handleGetAllOpportunities()
                handleNext()
            } else {
                setAlert({
                    open: true,
                    message: 'Fail to create close plan',
                    type: 'error',
                });
            }
        } else {
            setAlert({
                open: true,
                message: "Please select at least one conatct",
                type: "error"
            })
        }
    }

    return (
        <React.Fragment>
            <BootstrapDialog onClose={(event, reason) => handleRequestClose(event, reason, onClose)} open={open} aria-labelledby="customized-dialog-title" fullWidth maxWidth="md">
                <Components.DialogTitle sx={{ m: 0, p: 2, color: theme.palette.text.primary }} id="customized-dialog-title">
                    Send Close Plan For <strong>{oppDetails?.opportunity}</strong>
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
                    <CustomIcons iconName={'fa-solid fa-xmark'} css="cursor-pointer text-black w-5 h-5" />
                </Components.IconButton>

                <Components.DialogContent
                    dividers
                    sx={{
                        height: '70vh',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <div className='flex justify-center'>
                        <div className='w-[800px]'>
                            <Stapper steps={steps} activeStep={activeStep} orientation={`horizontal`} labelFontSize="14px" />
                        </div>
                    </div>

                    <div className="py-3 px-[30px] h-full">
                        {
                            activeStep === 0 && (
                                <>
                                    <div className="max-h-[63vh] overflow-y-auto border rounded-md overflow-hidden">
                                        <table className="min-w-full border-collapse">
                                            {/* 🔵 Blue sticky header */}
                                            <thead className="sticky top-0 z-10">
                                                <tr className="bg-[#0478DC] text-white">
                                                    {/* Check-all header (replaces '#') */}
                                                    <th className="px-4 py-3 text-left text-sm font-semibold w-14">
                                                        <Checkbox
                                                            checked={contacts?.length > 0 && contacts.every((row) => row.isAdd)}
                                                            onChange={(e) => handleToggleAll(e.target.checked)}
                                                            color={"#ffffff"}
                                                        />
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {contacts?.length > 0 ? (
                                                    contacts.map((row, i) => (
                                                        <tr key={row.contactId ?? i} className="odd:bg-white even:bg-gray-200">
                                                            <td className="px-4 py-3 text-sm">
                                                                <Checkbox
                                                                    onChange={(e) => handleSelectRow(row, e.target.checked)}
                                                                    checked={!!row.isAdd}
                                                                />
                                                            </td>
                                                            <td className="px-4 py-3 text-sm">
                                                                {row.title || '—'}
                                                                {row.role && (
                                                                    <>
                                                                        <span className="mx-1 text-gray-500">–</span>
                                                                        <span className='text-indigo-600'>
                                                                            {row.role}
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={3} className="px-4 py-4 text-center text-sm font-semibold">
                                                            No records
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>                        
                                </>
                            )
                        }
                        {
                            activeStep === 1 && (
                                <>
                                    {closePlanUrl?.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-16 px-4">
                                            <CustomIcons
                                                iconName={'fa-solid fa-link-slash'}
                                                css="text-gray-300 w-16 h-16 mb-4"
                                            />
                                            <h3 className="text-lg font-medium text-gray-700 mb-2">No URLs Available</h3>
                                            <p className="text-gray-500 text-center max-w-md">
                                                There are no close plan URLs to display for this contact.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="mt-3">
                                            <div className="max-h-[calc(70vh-130px)] border rounded-md overflow-hidden">
                                                {closePlanUrl.map((item, index) => (
                                                    <div
                                                        key={index}
                                                        className={`grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                                            }`}
                                                    >
                                                        {/* Contact Name */}
                                                        <div className="col-span-4 flex items-center">
                                                            <div className="flex items-center gap-3">
                                                                <div>
                                                                    <span className="font-medium text-gray-800">
                                                                        {item.contactName}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* URL */}
                                                        <div className="col-span-7 flex items-center">
                                                            <div className="flex items-center gap-3 w-full">
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <CustomIcons
                                                                            iconName={'fa-solid fa-globe'}
                                                                            css="text-gray-400 w-4 h-4 flex-shrink-0"
                                                                        />
                                                                        <div
                                                                            className="truncate text-blue-600 hover:text-blue-800 cursor-pointer"
                                                                            onClick={() => handleOpenUrl(item.url)}
                                                                            title="Click to open URL"
                                                                        >
                                                                            {item.url}
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 mt-1 truncate">
                                                                        {new URL(item.url).hostname}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="col-span-1 flex items-center justify-center">
                                                            <button
                                                                onClick={() => handleCopyUrl(item.url, index)}
                                                                className={`p-2 rounded-lg transition-all duration-200 ${copiedIndex === index
                                                                    ? 'bg-green-100 text-green-600'
                                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                                                                    }`}
                                                                title={copiedIndex === index ? 'Copied!' : 'Copy URL'}
                                                            >
                                                                {copiedIndex === index ? (
                                                                    <CustomIcons
                                                                        iconName={'fa-solid fa-check'}
                                                                        css="w-4 h-4"
                                                                    />
                                                                ) : (
                                                                    <CustomIcons
                                                                        iconName={'fa-regular fa-copy'}
                                                                        css="w-4 h-4"
                                                                    />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )
                        }
                    </div>
                </Components.DialogContent>

                <Components.DialogActions>
                    <div className="flex justify-end items-center gap-4">
                        <Button type="button" text={activeStep === 1 ? 'Back' : "Next"} onClick={() => activeStep === 0 ? submit() : handleBack()} endIcon={activeStep === 1 ? <CustomIcons iconName={'fa-solid fa-arrow-left'} css='cursor-pointer' /> : <CustomIcons iconName={'fa-solid fa-arrow-right'} css='cursor-pointer' />} />
                        <Button type="button" text={'Cancel'} useFor="disabled" onClick={() => onClose()} startIcon={<CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer mr-2' />} />
                    </div>
                </Components.DialogActions>
            </BootstrapDialog>
        </React.Fragment>
    )
};

const mapDispatchToProps = { setAlert };
export default connect(null, mapDispatchToProps)(KeyContactModel);
