import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';

import { connect } from 'react-redux';
import { setAlert, setSyncingPushStatus } from '../../../redux/commonReducers/commonReducers';

import { styled, Tooltip, tooltipClasses } from '@mui/material';
import Input from '../../../components/common/input/input';
import Button from '../../../components/common/buttons/button';
import CustomIcons from '../../../components/common/icons/CustomIcons';
import Components from '../../../components/muiComponents/components';
import OpportunitiesModel from '../../../components/models/opportunities/opportunitiesModel';
import PermissionWrapper from '../../../components/common/permissionWrapper/PermissionWrapper';
import CheckBoxSelect from '../../../components/common/select/checkBoxSelect';
import GroupedDataTable from '../../../components/common/table/groupedTable';

import { getAllOpportunitiesGroupedByStage, getOpportunityOptions, updateOpportunity } from '../../../service/opportunities/opportunitiesService';
import { opportunityStatus, opportunityStages } from '../../../service/common/commonService';
import { getAllAccounts } from '../../../service/account/accountService';
import Select from '../../../components/common/select/select';
import DatePickerComponent from '../../../components/common/datePickerComponent/datePickerComponent';
import { useForm } from 'react-hook-form';
import KeyContactModel from '../../../components/models/closePlan/keyContactModel';
import ClosePlanCommentModel from '../../../components/models/closePlan/closePlanCommentModel';
import OpportunityInfoModel from '../../../components/models/opportunities/opportunityInfoModel';

const HtmlTooltip = styled(({ className, ...props }) => (
    <Tooltip
        {...props}
        arrow
        enterDelay={150}
        enterNextDelay={150}
        leaveDelay={80}
        placement="right"
        classes={{ popper: className }}

    />
))(({ theme }) => ({
    /* Tooltip box */
    [`& .${tooltipClasses.tooltip}`]: {
        background: "linear-gradient(180deg, #ffffff 0%, #fbfbff 100%)",
        color: "#111827",
        border: "2px solid #eab308",
        boxShadow: "0 18px 45px rgba(0,0,0,0.12)",
        borderRadius: 5,
        padding: 12,
        maxWidth: 340,
        minWidth: 260,

        /* Typography */
        fontSize: theme.typography.pxToRem(12),
        lineHeight: 1.35,

        /* Smooth feel */
        backdropFilter: "blur(6px)",
    },

    /* Arrow */
    [`& .${tooltipClasses.arrow}`]: {
        color: "#ffffff", // arrow fill
        "&::before": {
            border: "2px solid #eab308", // border around arrow
            boxSizing: "border-box",
        },
    },
}));

const Opportunities = ({ setAlert, setSyncingPushStatus, syncingPullStatus }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const canEditOpps = PermissionWrapper.hasPermission({
        functionalityName: "Opportunities",
        moduleName: "Opportunities",
        actionId: 2,
    });

    const [editingRowId, setEditingRowId] = useState(null);
    const [accounts, setAccounts] = useState([]);

    const [opportunities, setOpportunities] = useState([]);
    const [open, setOpen] = useState(false);
    const [openInfoModel, setOpenInfoModel] = useState(false);
    const [infoRowId, setInfoRowId] = useState(null);

    const [selectedOpportunityId, setSelectedOpportunityId] = useState(null);
    // const [selectedOpportunityName, setSelectedOpportunityName] = useState(null);

    const [opportunitiesOptions, setOpportunitiesOptions] = useState(null)

    // NOTE: these now hold ARRAYS OF OPTION OBJECTS from CheckBoxSelect
    const [searchText, setSearchText] = useState(null);

    const [selectedOppStage, setSelectedOppStage] = useState([])
    const [selectedOppStatus, setSelectedOppStatus] = useState([])

    const [openContactModel, setOpenContactModel] = useState(false);
    const [openCommentsModel, setOpenCommentsModel] = useState(false)
    const [copiedIndex, setCopiedIndex] = useState(null);

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

    const handleSearch = (event) => {
        setSearchText(event.target.value);
    };

    const handleSearchIconClick = () => {
        handleGetOpportunities()
    };

    const handleOpenCommentModel = (id) => {
        setSelectedOpportunityId(id);
        setOpenCommentsModel(true)
    }

    const handleCloseCommentModel = () => {
        setSelectedOpportunityId(null);
        setOpenCommentsModel(false)
    }

    const handleOpenContactModel = (row) => {
        setSelectedOpportunityId(row.id);
        // setSelectedOpportunityName(row.opportunity)
        setOpenContactModel(true);
        setInfoRowId(row.id);
    }

    const handleCloseContactModel = () => {
        setSelectedOpportunityId(null);
        setOpenContactModel(false);
        setInfoRowId(null);
    }

    const handleGetOpportunityOptions = async () => {
        const res = await getOpportunityOptions()
        setOpportunitiesOptions(res?.result?.[0])
    }

    const handleSetStages = (event, newValue) => {
        setSelectedOppStage(newValue || []);
    }

    const handleSetStatus = (event, newValue) => {
        setSelectedOppStatus(newValue || []);
    }

    const handleGetOpportunities = async () => {
        try {
            let opportunityStages = []
            let oppStatus = []

            if (selectedOppStage?.length > 0) {
                opportunityStages = selectedOppStage
                    .map((opt) => opt?.title)
                    .filter(Boolean);
            }
            if (selectedOppStatus?.length > 0) {
                oppStatus = selectedOppStatus
                    .map((opt) => opt?.title)
                    .filter(Boolean);
            }

            let params = {
                salesStage: opportunityStages,
                status: oppStatus,
            };

            const searchParams = new URLSearchParams();
            if (searchText !== null && searchText !== "") {
                searchParams.append("search", searchText);
            }
            if (params.salesStage?.length) {
                params.salesStage.forEach((item) => searchParams.append("salesStage", item));
            }
            if (params.status?.length) {
                params.status.forEach((item) => searchParams.append("status", item));
            }

            const queryString = searchParams.toString();

            const opportunities = await getAllOpportunitiesGroupedByStage(queryString);
            setOpportunities(opportunities?.result || []);
        } catch (error) {
            console.error("Error fetching opportunities:", error);
        }
    }

    const handleOpenInfoModel = (opportunityId = null) => {
        setSelectedOpportunityId(opportunityId);
        setOpenInfoModel(true);
        setInfoRowId(opportunityId);      // ⬅️ highlight this row
    };

    const handleCloseInfoModel = () => {
        setSelectedOpportunityId(null);
        setOpenInfoModel(false);
        setInfoRowId(null);               // ⬅️ remove highlight when closing
    };

    const handleOpen = (opportunityId = null) => {
        setSelectedOpportunityId(opportunityId);
        setOpen(true);
    }

    const handleClose = () => {
        setSelectedOpportunityId(null);
        setOpen(false);
    }

    const handleGetAllAccounts = async () => {
        const res = await getAllAccounts("fetchType=Options");
        if (res?.status === 200) {
            const data = res?.result?.map((acc) => ({
                title: acc.accountName,
                id: acc.id,
                salesforceAccountId: acc.salesforceAccountId
            }));
            setAccounts(data);
        }
    };

    useEffect(() => {
        document.title = "Opportunities - 360Pipe"
        handleGetAllAccounts()
        handleGetOpportunityOptions()
    }, []);

    useEffect(() => {
        handleGetOpportunities()
    }, [selectedOppStage, selectedOppStatus])

    useEffect(() => {
        if (syncingPullStatus && location.pathname === '/dashboard/opportunities') {
            handleGetOpportunities();
        }
    }, [syncingPullStatus]);

    const withEditTooltip = (text, params, children) => {
        if (!params.colDef?.editable) return children;

        return (
            <Tooltip title={text} arrow>
                <span className="cursor-pointer w-full block">
                    {children}
                </span>
            </Tooltip>
        );
    };

    const formatStatusTime = (date) => {
        if (!date) return "—";
        return new Date(date).toLocaleString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
        });
    };

    // Close the editing cell when user clicks anywhere outside the edit component
    // (used to implement "click outside to save" behavior).
    const useClickAwayCommit = ({
        wrapperRef,
        enabled,
        onCommit,
    }) => {
        useEffect(() => {
            if (!enabled) return;

            const onPointerDown = (e) => {
                const el = wrapperRef?.current;
                if (!el) return;

                // IMPORTANT:
                // Many MUI inputs (Autocomplete, Select/Menu, DatePicker, etc.)
                // render their dropdown/popup in a portal (outside wrapperRef).
                // In that case, clicking an option looks like a "click-away" and
                // would prematurely commit/close the cell.
                //
                // So: if the click happened inside any common MUI popup container,
                // we ignore it and let the input handle the selection normally.
                const target = e.target;
                if (target?.closest?.(
                    [
                        '.MuiAutocomplete-popper',
                        '.MuiPickersPopper-root',
                        '.MuiPopover-root',
                        '.MuiMenu-root',
                        '.MuiDialog-root',
                        '.MuiModal-root',
                        '.MuiPopper-root',
                        // react-select (if your Select component uses it)
                        '[class*="react-select__menu"]',
                        '[class*="react-select__menu-list"]',
                    ].join(',')
                )) {
                    return;
                }
                if (el.contains(e.target)) return;
                onCommit?.(e);
            };

            // capture so it runs before MUI potentially stops propagation
            document.addEventListener('mousedown', onPointerDown, true);
            document.addEventListener('touchstart', onPointerDown, true);
            return () => {
                document.removeEventListener('mousedown', onPointerDown, true);
                document.removeEventListener('touchstart', onPointerDown, true);
            };
        }, [enabled, wrapperRef, onCommit]);
    };

    const columns = [
        // {
        //     field: 'rowId',
        //     headerName: '#',
        //     headerClassName: 'uppercase',
        //     flex: 1,
        //     maxWidth: 50,
        //     sortable: false,
        // },
        {
            field: 'valid8',
            headerName: 'Valid8',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 90,
            sortable: false,
            align: 'center',
            renderCell: (params) => {
                return (
                    <>
                        {
                            params?.row?.closePlanDtoList?.length > 0 ? (
                                <div className="flex justify-start items-center mt-2 gap-1">
                                    <HtmlTooltip
                                        arrow
                                        placement="right"
                                        title={
                                            params.row?.closePlanDtoList?.length ? (
                                                <div className="min-w-[260px] max-w-[340px]">
                                                    <div className="flex items-center justify-between gap-3 pb-2">
                                                        <p className="text-[12px] font-semibold text-gray-900">Looks Perfect</p>
                                                    </div>

                                                    <div className="h-px bg-gray-200/70 mb-2" />

                                                    <div className="space-y-2 max-h-56 overflow-auto">
                                                        {params.row.closePlanDtoList?.map((cp, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex items-center justify-between gap-3 px-2"
                                                            >
                                                                <p className="text-[12px] font-semibold text-gray-900 truncate max-w-[140px]">
                                                                    {cp.contactName}
                                                                </p>

                                                                <span className="text-[11px] font-medium text-gray-600 whitespace-nowrap">
                                                                    {
                                                                        params.row.closePlanDtoList?.some((row) => row.status != null) ?
                                                                            formatStatusTime(cp.statusTime) :
                                                                            <button
                                                                                onClick={() => handleCopyUrl(cp.url, index)}
                                                                                className={`p-2 rounded-lg transition-all duration-200 ${copiedIndex === index
                                                                                    ? 'bg-green-100 text-green-600'
                                                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                                                                                    }`}
                                                                                title={copiedIndex === index ? 'Copied!' : 'Copy Close Plan URL'}
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
                                                                    }
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="min-w-[240px]">
                                                    <p className="text-[12px] font-semibold text-gray-900">No close plan activity</p>
                                                </div>
                                            )
                                        }

                                    >
                                        <Components.IconButton>
                                            <CustomIcons
                                                iconName={'fa-solid fa-thumbs-up'}
                                                css={`cursor-pointer ${params.row.closePlanDtoList?.some((row) => row.status != null) ? "text-green-600" : "text-yellow-500"}  h-4 w-4`}
                                            />
                                        </Components.IconButton>
                                    </HtmlTooltip>
                                    {
                                        params.row.closePlanDtoList?.some((row) => row.hasComment === true) && (
                                            <HtmlTooltip
                                                arrow
                                                placement="right"
                                                title={
                                                    params.row?.closePlanCommentDto?.length && (
                                                        <div className="min-w-[260px] max-w-[340px]">
                                                            <div className="flex items-center justify-between gap-3 pb-2">
                                                                <p className="text-[12px] font-semibold text-gray-900">Latest Comments</p>
                                                            </div>

                                                            <div className="h-px bg-gray-200/70 mb-2" />

                                                            <div className="space-y-2 max-h-56 overflow-auto">
                                                                {params.row.closePlanCommentDto?.map((item, index) => (
                                                                    <div key={index} className="flex items-start justify-between gap-3 px-2 mb-4">
                                                                        {/* Left side: name + comment */}
                                                                        <div className="min-w-0 flex-1">
                                                                            <div className="flex items-center gap-2 min-w-0">
                                                                                <p className="text-[12px] font-semibold text-gray-900 truncate max-w-[140px]">
                                                                                    {item.createdByName}
                                                                                </p>
                                                                            </div>

                                                                            {/* Comment: wrap + 2-line clamp */}
                                                                            <p className="text-[12px] text-blue-600 whitespace-normal break-words overflow-hidden text-ellipsis line-clamp-4">
                                                                                {item?.comments}
                                                                            </p>
                                                                        </div>

                                                                        {/* Right side: date */}
                                                                        <span className="text-[11px] font-medium text-gray-600 whitespace-nowrap pt-[2px]">
                                                                            {formatStatusTime(item.createdAt)}
                                                                        </span>
                                                                    </div>

                                                                ))}
                                                            </div>
                                                        </div>
                                                    )
                                                }

                                            >
                                                <Components.IconButton onClick={() => handleOpenCommentModel(params.row.id)}>
                                                    <CustomIcons
                                                        iconName={'fa-solid fa-comment'}
                                                        css="cursor-pointer text-red-600 h-4 w-4"
                                                    />
                                                </Components.IconButton>
                                            </HtmlTooltip>
                                        )
                                    }
                                </div>
                            ) :
                                <p>-</p>
                        }
                    </>
                )
            }
        },
        {
            field: 'accountName',
            headerName: 'Account',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 150,
            editable: canEditOpps,
            renderCell: (params) =>
                withEditTooltip(
                    "Click To Edit",
                    params,
                    <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
                        {params.value ? params.value : '-'}
                    </span>
                ),
            renderEditCell: (params) => <AccountEditCell {...params} />,
        },
        {
            field: 'opportunity',
            headerName: 'Opportunity Name',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 250,
            editable: canEditOpps,
            renderCell: (params) =>
                withEditTooltip(
                    "Click To Edit",
                    params,
                    <span className="block overflow-hidden text-ellipsis whitespace-nowrap">{params.value || '-'}</span>
                ),
            renderEditCell: (params) => <OpportunityNameEditCell {...params} />,
        },
        {
            field: 'dealAmount',
            headerName: 'Deal Amount',
            flex: 1,
            maxWidth: 150,
            align: 'right',
            headerAlign: 'left',
            editable: canEditOpps,
            headerClassName: 'uppercase',
            renderCell: (params) => {
                const val = parseInt(params.value);
                if (val === null || val === undefined || val === '') {
                    return withEditTooltip(`$${params.row.listPrice?.toLocaleString('en-US')}-${parseInt(params.row.discountPercentage)}(%) = $${parseInt(params.row.dealAmount)?.toLocaleString('en-US')}`, params, <span>-</span>);
                }
                const num = parseInt(val);
                if (Number.isNaN(num)) {
                    return withEditTooltip(`$${params.row.listPrice?.toLocaleString('en-US')}-${parseInt(params.row.discountPercentage)}(%) = $${parseInt(params.row.dealAmount)?.toLocaleString('en-US')}`, params, <span>-</span>);
                }
                const formatted = `$${num.toLocaleString('en-US')}`;
                return withEditTooltip(`$${params.row.listPrice?.toLocaleString('en-US')}-${parseInt(params.row.discountPercentage)}(%) = $${parseInt(params.row.dealAmount)?.toLocaleString('en-US')}`, params, <span>{formatted}</span>);
            },
            renderEditCell: (params) => <DealAmountEditCell {...params} />,
        },
        {
            field: "salesStage",
            headerName: "Sales Stage",
            flex: 1,
            maxWidth: 200,
            headerClassName: 'uppercase',
            editable: canEditOpps,
            renderCell: (params) => {
                withEditTooltip(
                    "Click To Edit",
                    params,
                    <span className="block overflow-hidden text-ellipsis whitespace-nowrap">{params.value || '-'}</span>
                );
            },
            renderEditCell: (params) => <SalesStageEditCell {...params} />,
        },
        {
            field: 'closeDate',
            headerName: 'Close Date',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 150,
            align: 'center',
            editable: canEditOpps,
            renderCell: (params) =>
                withEditTooltip(
                    "Click To Edit",
                    params,
                    <span>
                        {params.value ? new Date(params.value).toLocaleDateString() : ''}
                    </span>
                ),
            renderEditCell: (params) => <CloseDateEditCell {...params} />,
        },
        {
            field: 'nextSteps',
            headerName: 'Next Step',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 300,
            editable: canEditOpps,
            renderCell: (params) => {
                const display =
                    params.value !== "" && params.value !== null && params.value !== undefined
                        ? params.value
                        : "-";

                return withEditTooltip(
                    "Click To Edit",
                    params,
                    <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
                        {display}
                    </span>
                );
            },
            renderEditCell: (params) => <NextStepsEditCell {...params} />,
        },
        {
            field: 'action',
            headerName: 'action',
            headerClassName: 'uppercase',
            sortable: false,
            flex: 1,
            maxWidth: 150,
            headerAlign: 'center',
            renderCell: (params) => {
                return (
                    <div className='flex items-center gap-2 justify-center h-full'>
                        <PermissionWrapper
                            functionalityName="Opportunities"
                            moduleName="Opportunities"
                            actionId={2}
                            component={
                                <Tooltip title="Info" arrow>
                                    <div className='bg-blue-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                        <Components.IconButton onClick={() => handleOpenInfoModel(params.row.id)}>
                                            <CustomIcons iconName={'fa-solid fa-info'} css='cursor-pointer text-white h-4 w-4' />
                                        </Components.IconButton>
                                    </div>
                                </Tooltip>
                            }
                        />
                        <PermissionWrapper
                            functionalityName="Opportunities"
                            moduleName="Opportunities"
                            actionId={2}
                            component={
                                <Tooltip title="Edit" arrow>
                                    <div className='bg-green-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                        <Components.IconButton onClick={() => navigate(`/dashboard/opportunity-view/${params.row.id}`)}>
                                            <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-white h-4 w-4' />
                                        </Components.IconButton>
                                    </div>
                                </Tooltip>
                            }
                        />
                        <PermissionWrapper
                            functionalityName="Close Plan"
                            moduleName="Close Plan"
                            actionId={1}
                            component={
                                <Tooltip title="Close Plane" arrow>
                                    <div className='bg-gray-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                        <Components.IconButton onClick={() => handleOpenContactModel(params.row)}>
                                            <CustomIcons iconName={'fa-solid fa-envelope'} css='cursor-pointer text-white h-4 w-4' />
                                        </Components.IconButton>
                                    </div>
                                </Tooltip>
                            }
                        />
                    </div>
                );
            },
        },
    ];

    const CloseDateEditCell = (params) => {
        const { id, field, api, value } = params;

        const wrapperRef = React.useRef(null);

        const originalValue = React.useRef(value ?? null);

        // Local RHF form just for this cell
        const { control, setValue: rhfSetValue, watch } = useForm({
            defaultValues: {
                closeDate: value ?? null,
            },
        });

        const currentDate = watch("closeDate");

        // This will be passed into DatePickerComponent
        const handleSetValue = (name, newValue) => {
            // update RHF internal value so the picker shows correctly
            rhfSetValue(name, newValue);

            // update the DataGrid cell value
            api.setEditCellValue(
                { id, field, value: newValue },
                null
            );
        };

        const handleSave = () => {
            api.stopCellEditMode({ id, field });
        };

        const handleCancel = () => {
            rhfSetValue("closeDate", originalValue.current);
            api.setEditCellValue({
                id,
                field,
                value: originalValue.current,
            });
            api.stopCellEditMode({
                id,
                field,
                ignoreModifications: true,
            });
        };

        // ✅ click outside -> save (commit) and close edit mode
        useClickAwayCommit({
            wrapperRef,
            enabled: true,
            onCommit: () => {
                if (!currentDate) {
                    // if invalid, revert
                    handleCancel();
                    return;
                }
                handleSave();
            },
        });

        return (
            <div ref={wrapperRef} className="deal-amount-edit-container flex justify-start items-center gap-3 p-3">
                <div className="flex-1 w-60">
                    <DatePickerComponent
                        name="closeDate"
                        // label="Close Date"
                        control={control}
                        setValue={handleSetValue}
                        minDate={new Date()}
                        maxDate={null}
                        required={true}
                    />
                </div>
            </div>
        );
    };

    const SalesStageEditCell = (params) => {
        const { id, field, api, value } = params;

        const wrapperRef = React.useRef(null);

        const stageOptions = opportunityStages || [];

        const originalValue = React.useRef(value ?? "");

        const [selectedId, setSelectedId] = React.useState(() => {
            const found = stageOptions.find((opt) => opt.title === value);
            return found ? found.id : null;
        });

        const handleChange = (event, newValue) => {
            const newStage = newValue?.title ?? "";
            const newId = newValue?.id ?? null;

            setSelectedId(newId);

            api.setEditCellValue(
                { id, field, value: newStage },
                event
            );
        };

        const handleSave = () => {
            api.stopCellEditMode({ id, field });
        };

        const handleCancel = () => {
            api.setEditCellValue({
                id,
                field,
                value: originalValue.current,
            });
            api.stopCellEditMode({
                id,
                field,
                ignoreModifications: true,
            });
        };

        // ✅ click outside -> save (commit) and close edit mode
        useClickAwayCommit({
            wrapperRef,
            enabled: true,
            onCommit: () => {
                handleSave();
            },
        });

        return (
            <div ref={wrapperRef} className="deal-amount-edit-container flex justify-start items-center gap-3 p-3">
                <div className="flex-1 w-60">
                    <Select
                        placeholder="Select stage"
                        options={stageOptions}
                        value={selectedId}
                        onChange={handleChange}
                        onKeyDown={(e) => {
                            // Escape -> cancel/revert
                            if (e.key === 'Escape') {
                                e.stopPropagation();
                                handleCancel();
                            }
                        }}
                    />
                </div>
            </div>
        );
    };

    const AccountEditCell = (params) => {
        const { id, api, row } = params;

        const wrapperRef = React.useRef(null);

        const originalValue = React.useRef({
            accountId: row.accountId ?? null,
            accountName: row.accountName ?? "",
        });

        const [selectedId, setSelectedId] = React.useState(() => {
            const found = accounts.find(
                (opt) => opt.id === row.accountId || opt.title === row.accountName
            );
            return found ? found.id : null;
        });

        const handleChange = (event, newValue) => {
            const newId = newValue?.id ?? null;
            const newName = newValue?.title ?? "";

            setSelectedId(newId);

            // ✅ This is the only thing the grid *must* know:
            api.setEditCellValue(
                { id, field: "accountName", value: newName },
                event
            );

            // optional – visually keep row in sync, but we won't depend on it
            api.setEditCellValue(
                { id, field: "accountId", value: newId },
                event
            );
        };

        const handleCancel = () => {
            api.setEditCellValue({
                id,
                field: "accountName",
                value: originalValue.current.accountName,
            });
            api.setEditCellValue({
                id,
                field: "accountId",
                value: originalValue.current.accountId,
            });
            api.stopCellEditMode({
                id,
                field: "accountName",
                ignoreModifications: true,
            });
        };

        // ✅ click outside -> save (commit) and close edit mode
        useClickAwayCommit({
            wrapperRef,
            enabled: true,
            onCommit: () => {
                api.stopCellEditMode({ id, field: "accountName" });
            },
        });

        return (
            <div ref={wrapperRef} className="deal-amount-edit-container flex justify-start items-center gap-3 p-3">
                <div className="flex-1 w-60">
                    <Select
                        placeholder="Select account"
                        options={accounts}
                        value={selectedId}
                        onChange={handleChange}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                                e.stopPropagation();
                                handleCancel();
                            }
                        }}
                    />
                </div>
            </div>
        );
    };

    const OpportunityNameEditCell = (params) => {
        const { id, field, api, value } = params;

        const wrapperRef = React.useRef(null);

        const [inputValue, setInputValue] = React.useState(value ?? '');
        const originalValue = React.useRef(value ?? '');

        const handleChange = (event) => {
            const newVal = event.target.value;
            setInputValue(newVal);
            api.setEditCellValue({ id, field, value: newVal }, event);
        };

        const handleSave = () => {
            api.stopCellEditMode({ id, field });
        };

        const handleCancel = () => {
            api.setEditCellValue({ id, field, value: originalValue.current });
            api.stopCellEditMode({ id, field, ignoreModifications: true });
        };

        // ✅ click outside -> save (commit) and close edit mode
        useClickAwayCommit({
            wrapperRef,
            enabled: true,
            onCommit: () => {
                if (inputValue === null || inputValue === "") {
                    handleCancel();
                    return;
                }
                handleSave();
            },
        });

        return (
            <div ref={wrapperRef} className="deal-amount-edit-container flex justify-start items-center gap-3 p-3">
                <Input
                    value={inputValue}
                    onChange={handleChange}
                    autoFocus
                    className="flex-1"
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            e.stopPropagation();
                            handleCancel();
                        }
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            e.stopPropagation();
                            if (inputValue === null || inputValue === "") {
                                handleCancel();
                                return;
                            }
                            handleSave();
                        }
                    }}
                />
            </div>
        );
    };

    const DealAmountEditCell = (params) => {
        const { id, field, api, value } = params;

        const wrapperRef = React.useRef(null);
        const inputRef = React.useRef(null);

        // ✅ format ONLY integer digits with commas
        const formatWithCommas = (raw) => {
            if (raw === null || raw === undefined || raw === "") return "";
            const intOnly = raw.toString().replace(/\D/g, ""); // digits only
            if (!intOnly) return "";
            return intOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        };

        // ✅ sanitize to ONLY integer digits (no dot ever)
        const sanitizeValue = (val) => {
            if (val === null || val === undefined) return "";
            return val.toString().replace(/\D/g, ""); // remove everything except digits
        };

        const [inputValue, setInputValue] = React.useState(() => {
            if (value === null || value === undefined || value === "") return "";
            return formatWithCommas(value);
        });

        const originalValue = React.useRef(value);

        const handleChange = (event) => {
            const rawInput = event.target.value;
            const caretPos = event.target.selectionStart ?? rawInput.length;

            // caret calc: how many digits before caret (ignore commas/other chars)
            const digitsBeforeCaret = sanitizeValue(rawInput.slice(0, caretPos)).length;

            // sanitize full, then format
            const cleanedFull = sanitizeValue(rawInput);     // "12345"
            const formattedFull = formatWithCommas(cleanedFull); // "12,345"

            setInputValue(formattedFull);

            // ✅ store only integer digits in grid state
            api.setEditCellValue({ id, field, value: cleanedFull }, event);

            // restore caret after formatting: place caret after same count of digits
            requestAnimationFrame(() => {
                if (!inputRef.current) return;

                let pos = 0;
                let digitCount = 0;

                while (pos < formattedFull.length && digitCount < digitsBeforeCaret) {
                    if (/\d/.test(formattedFull[pos])) digitCount++;
                    pos++;
                }

                inputRef.current.setSelectionRange(pos, pos);
            });
        };

        const handleSave = () => {
            api.stopCellEditMode({ id, field });
        };

        const handleCancel = () => {
            api.setEditCellValue(
                {
                    id,
                    field,
                    value:
                        originalValue.current === null || originalValue.current === undefined
                            ? ""
                            : sanitizeValue(originalValue.current),
                }
            );
            api.stopCellEditMode({ id, field, ignoreModifications: true });
        };

        // ✅ click outside -> save
        useClickAwayCommit({
            wrapperRef,
            enabled: true,
            onCommit: () => {
                if (inputValue === null || inputValue === "") {
                    handleCancel();
                    return;
                }
                handleSave();
            },
        });

        return (
            <div
                ref={wrapperRef}
                className="deal-amount-edit-container flex justify-start items-center gap-3 px-3"
            >
                <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={handleChange}
                    autoFocus
                    inputMode="numeric"
                    onKeyDown={(e) => {
                        if (e.key === "Escape") {
                            e.stopPropagation();
                            handleCancel();
                        }
                        if (e.key === "Enter") {
                            e.preventDefault();
                            e.stopPropagation();
                            if (inputValue === null || inputValue === "") {
                                handleCancel();
                                return;
                            }
                            handleSave();
                        }

                        // ✅ optional: block "." and other non-digit typing at keydown level too
                        if (e.key === "." || e.key === ",") {
                            // comma will be auto-added by formatting; user doesn't need to type it
                            e.preventDefault();
                        }
                    }}
                />
            </div>
        );
    };

    const NextStepsEditCell = (params) => {
        const { id, field, api, value } = params;

        const wrapperRef = React.useRef(null);

        const [inputValue, setInputValue] = React.useState(value ?? "");
        const originalValue = React.useRef(value ?? "");

        // ✅ when this edit cell mounts, mark this row as editing for height change
        useEffect(() => {
            setEditingRowId(id ? id : null);
            return () => setEditingRowId(null);
        }, [id]);

        const handleChange = (event) => {
            const newVal = event.target.value;
            setInputValue(newVal);
            api.setEditCellValue({ id, field, value: newVal }, event);
        };

        const handleSave = () => {
            // commit current value and exit edit mode
            setEditingRowId(null);
            api.stopCellEditMode({ id, field });
        };

        const handleCancel = () => {
            // revert to original and exit without saving
            setEditingRowId(null);
            api.setEditCellValue({ id, field, value: originalValue.current });
            api.stopCellEditMode({ id, field, ignoreModifications: true });
        };

        // ✅ click outside -> save (commit) and close edit mode
        useClickAwayCommit({
            wrapperRef,
            enabled: true,
            onCommit: () => {
                if (inputValue === null || inputValue === "") {
                    handleCancel();
                    return;
                }
                handleSave();
            },
        });

        return (
            <div ref={wrapperRef} className="deal-amount-edit-container flex justify-start items-center gap-3 p-3">
                <Input
                    value={inputValue}
                    onChange={handleChange}
                    autoFocus
                    className="flex-1"
                    multiline={true}
                    rows={4}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            e.stopPropagation();
                            handleCancel();
                        }
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                            // Ctrl/Cmd + Enter to save for multiline
                            e.preventDefault();
                            e.stopPropagation();
                            if (inputValue === null || inputValue === "") {
                                handleCancel();
                                return;
                            }
                            handleSave();
                        }
                    }}
                />
            </div>
        );
    };

    const processRowUpdate = async (newRow, oldRow) => {
        try {
            const cleanedAmount =
                newRow.dealAmount === '' || newRow.dealAmount == null
                    ? null
                    : parseInt(newRow.dealAmount);

            // 🔹 Build base payload
            const updatedData = {
                ...newRow,
                nextSteps: newRow.nextSteps,
                dealAmount: cleanedAmount,
            };

            // 🔹 If account name changed, map it to accountId
            if (newRow.accountName && newRow.accountName !== oldRow.accountName) {
                const selectedAccount = accounts.find(
                    (acc) => acc.title === newRow.accountName
                );

                if (selectedAccount) {
                    updatedData.accountId = selectedAccount.id;
                }
            }

            // ✅ (optional) also ensure the row the grid keeps uses the new id
            const rowToReturn = {
                ...newRow,
                dealAmount: cleanedAmount,
                accountId: updatedData.accountId ?? newRow.accountId,
            };

            if (cleanedAmount === null || cleanedAmount === "") {
                setAlert({
                    open: true,
                    message: "Deal amount can not be empty",
                    type: "error"
                });
                return oldRow;
            }

            if (newRow.nextSteps === null || newRow.nextSteps === "") {
                setAlert({
                    open: true,
                    message: "Next step can not be empty",
                    type: "error"
                });
                return oldRow;
            }

            // 👇 accountId is now included in updatedData
            const res = await updateOpportunity(newRow.id, updatedData);
            if (res.status === 200) {
                setSyncingPushStatus(true);
                handleGetOpportunities();
                return rowToReturn;
            } else {
                setAlert({
                    open: true,
                    message: res?.message || "Failed to update opportunity",
                    type: "error",
                });
                return oldRow;
            }
        } catch (error) {
            setAlert({
                open: true,
                message: "Something went wrong while updating opportunity",
                type: "error",
            });
            return oldRow;
        }
    };

    const actionButtons = () => {
        return (
            <PermissionWrapper
                functionalityName="Opportunities"
                moduleName="Opportunities"
                actionId={1}
                component={
                    <div>
                        <Button type={`button`} text={'Add Opportunity'} onClick={() => handleOpen()} startIcon={<CustomIcons iconName="fa-solid fa-plus" css="h-5 w-5" />} />
                    </div>
                }
            />
        )
    }

    const filterComponent = () => {
        return (
            <div className='lg:w-[550px] flex justify-start items-center gap-4'>
                <div className='w-full'>
                    <CheckBoxSelect
                        label="Sales Stages"
                        placeholder="Select sales stages"
                        options={opportunitiesOptions?.opportunitiesStagesOptions || []}
                        value={selectedOppStage}
                        onChange={handleSetStages}
                        maxVisibleChips={1}
                        showAllOnHover={true}
                    />
                </div>
                <div className='w-full'>
                    <CheckBoxSelect
                        label="Deal Status"
                        placeholder="Select deal status"
                        options={opportunityStatus || []}
                        value={selectedOppStatus}
                        onChange={handleSetStatus}
                        maxVisibleChips={1}
                        showAllOnHover={true}
                    />
                </div>
            </div>
        )
    }

    const getRowClassNameForGrid = (params) => {
        // params.row.id is your opportunityId (from API)
        if (params?.row?.id === infoRowId) {
            return 'info-selected-row';
        }
        return '';
    };

    return (
        <>
            <div className='border rounded-lg bg-white w-full lg:w-full'>
                <GroupedDataTable
                    groups={opportunities}
                    columns={columns}
                    // height={350}
                    showSearch={true}
                    searchPlaceholder={"Type account or opportunity name..."}
                    searchValue={searchText}
                    onSearchChange={handleSearch}
                    onSearchClick={handleSearchIconClick}
                    showButtons={true}
                    buttons={actionButtons}
                    showFilters={true}
                    filtersComponent={filterComponent}
                    processRowUpdate={processRowUpdate}
                    onCellEditStop={(params, event) => {
                        if (params.reason === "enterKeyDown") {
                            event.defaultMuiPrevented = true;
                        }
                    }}
                    // ⬇️ NEW: only the grid that contains this row id will grow in height
                    editingRowId={editingRowId}
                    getRowClassName={getRowClassNameForGrid}
                />
            </div>

            <OpportunitiesModel open={open} handleClose={handleClose} opportunityId={selectedOpportunityId} handleGetAllOpportunities={handleGetOpportunities} />

            <OpportunityInfoModel
                open={openInfoModel}
                handleClose={handleCloseInfoModel}
                opportunityId={selectedOpportunityId}
            />
            <KeyContactModel open={openContactModel} handleClose={handleCloseContactModel} opportunityId={selectedOpportunityId} handleGetAllOpportunities={handleGetOpportunities} />
            <ClosePlanCommentModel open={openCommentsModel} handleClose={handleCloseCommentModel} opportunityId={selectedOpportunityId} />
        </>
    )
}

const mapStateToProps = (state) => ({
    syncingPullStatus: state.common.syncingPullStatus,
});

const mapDispatchToProps = {
    setAlert,
    setSyncingPushStatus
};

export default connect(mapStateToProps, mapDispatchToProps)(Opportunities)