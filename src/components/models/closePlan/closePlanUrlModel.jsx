import React, { useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { connect } from 'react-redux';
import { setAlert } from '../../../redux/commonReducers/commonReducers';

import Components from '../../muiComponents/components';
import Button from '../../common/buttons/button';
import CustomIcons from '../../common/icons/CustomIcons';
import { handleRequestClose } from '../../../service/common/commonService';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': { padding: theme.spacing(2) },
    '& .MuiDialogActions-root': { padding: theme.spacing(1) },
}));

function ClosePlanUrlModel({
    setAlert,
    open,
    handleClose,
    closePlanUrl = []
}) {
    const theme = useTheme();
    const [copiedIndex, setCopiedIndex] = useState(null);

    const onClose = () => {
        setCopiedIndex(null);
        handleClose();
    };

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

    return (
        <React.Fragment>
            <BootstrapDialog onClose={(event, reason) => handleRequestClose(event, reason, onClose)} open={open} aria-labelledby="customized-dialog-title" fullWidth maxWidth="md">
                <Components.DialogTitle sx={{ m: 0, p: 2, color: theme.palette.text.primary }} id="customized-dialog-title">
                    Close Plan URL's
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
                        maxHeight: '70vh',
                        p: 0,
                    }}
                >
                    {closePlanUrl.length === 0 ? (
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
                        <div className="overflow-hidden">
                            <div className="overflow-y-auto max-h-[calc(70vh-130px)]">
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
                </Components.DialogContent>

                <Components.DialogActions sx={{ p: 3, backgroundColor: theme.palette.background.paper }}>
                    <div className="flex justify-end items-center gap-4 w-full">
                        <Button
                            type="button"
                            text={'Close'}
                            useFor="disabled"
                            onClick={onClose}
                            startIcon={<CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer mr-2' />}
                        />
                    </div>
                </Components.DialogActions>
            </BootstrapDialog>
        </React.Fragment>
    )
};

const mapDispatchToProps = { setAlert };
export default connect(null, mapDispatchToProps)(ClosePlanUrlModel);