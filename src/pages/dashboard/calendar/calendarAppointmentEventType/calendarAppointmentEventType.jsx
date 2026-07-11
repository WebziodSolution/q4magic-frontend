import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import DataTable from '../../../../components/common/table/table';
import CustomIcons from '../../../../components/common/icons/CustomIcons';
import AlertDialog from '../../../../components/common/alertDialog/alertDialog';
import AppointmentEventTypeModel from '../../../../components/models/calendar/appointmentEventTypeModel';
import { setAlert } from '../../../../redux/commonReducers/commonReducers';
import { deleteEventType, getAllEventTypeList } from '../../../../service/calendar/calendarAppointmentEventType/calendarAppointmentEventTypeService';
import { handleConvertUTCDateToLocalDate } from '../../../../service/common/commonService';
import { Tooltip } from '@mui/material';
import Components from '../../../../components/muiComponents/components';

const CalendarAppointmentEventType = ({ setAlert }) => {
    const [eventTypes, setEventTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");

    // Modal state
    const [modelOpen, setModelOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    // Delete alert state
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const fetchEventTypes = async () => {
        setLoading(true);
        try {
            const res = await getAllEventTypeList();
            if (res?.status === 200) {
                setEventTypes(res?.result || []);
            } else {
                setAlert({
                    open: true,
                    message: res?.message || "Failed to fetch event types",
                    type: "error"
                });
            }
        } catch (error) {
            console.error("Error fetching event types:", error);
            setAlert({
                open: true,
                message: "Error fetching event types list",
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEventTypes();
    }, []);

    const handleOpenAddModal = () => {
        setSelectedId(null);
        setModelOpen(true);
    };

    const handleOpenEditModal = (id) => {
        setSelectedId(id);
        setModelOpen(true);
    };

    const handleOpenDeleteAlert = (id) => {
        setDeleteId(id);
        setDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        setDeleteLoading(true);
        try {
            const res = await deleteEventType(deleteId);
            if (res?.status === 200 || res?.status === 204) {
                setAlert({
                    open: true,
                    message: "Event type deleted successfully",
                    type: "success"
                });
                fetchEventTypes();
                setDeleteOpen(false);
            } else {
                setAlert({
                    open: true,
                    message: res?.message || "Failed to delete event type",
                    type: "error"
                });
            }
        } catch (error) {
            console.error("Error deleting event type:", error);
            setAlert({
                open: true,
                message: "Error deleting event type",
                type: "error"
            });
        } finally {
            setDeleteLoading(false);
        }
    };

    const columns = [
        {
            field: 'title',
            headerName: 'Event Type Title',
            flex: 1.5,
            minWidth: 220,
        },
        {
            field: 'duration',
            headerName: 'Duration',
            flex: 1,
            minWidth: 150,
            renderCell: (params) => {
                const durationMinutes = params.row.durationMinutes;
                const durationHours = params.row.durationHours;
                return `${durationHours}:${durationMinutes} Hour`;
            }
        },
        {
            field: 'createdDate',
            headerName: 'Created Time',
            flex: 1.2,
            minWidth: 180,
            renderCell: (params) => {
                const dateVal = params.row.createdDate;
                const localDate = handleConvertUTCDateToLocalDate(dateVal);
                if (!localDate) return '';
                const datePart = localDate.toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric'
                });
                const timePart = localDate.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                });
                return `${datePart} ${timePart}`;
            }
        },
        {
            field: 'actions',
            headerName: 'Actions',
            sortable: false,
            width: 100,
            renderCell: (params) => {
                return (
                    <div className='flex items-center gap-2 justify-center h-full'>
                        <Tooltip title="Edit" arrow>
                            <div className='bg-green-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                <Components.IconButton onClick={() => handleOpenEditModal(params.row.id)}>
                                    <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-white h-4 w-4' />
                                </Components.IconButton>
                            </div>
                        </Tooltip>
                        <Tooltip title="Delete" arrow>
                            <div className='bg-red-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                <Components.IconButton onClick={() => handleOpenDeleteAlert(params.row.id)}>
                                    <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer text-white h-4 w-4' />
                                </Components.IconButton>
                            </div>
                        </Tooltip>
                    </div>
                );
            }
        }
    ];

    return (
        <div>
            {/* Header Title & Plus Icon */}
            <div className="flex items-center gap-3 mb-6">
                <h2 className="text-xl font-bold text-gray-800">Appointment Event Type</h2>
                <button
                    onClick={handleOpenAddModal}
                    className="p-1 hover:bg-gray-100 rounded transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center"
                    title="Add Event Type"
                >
                    <CustomIcons
                        iconName="fa-solid fa-square-plus"
                        css="text-2xl text-[#44288E]"
                    />
                </button>
            </div>

            {/* Table displaying lists */}
            <DataTable
                rows={eventTypes}
                columns={columns}
                getRowId={(row) => row.id}
                // showSearch={true}
                // searchValue={searchText}
                // onChangeSearch={(e) => setSearchText(e.target.value)}
                // searchPlaceholder="Search Event Types..."
                height={400}
            // hideFooter={eventTypes?.length <= 10}
            />

            {/* Popup Dialog Model */}
            <AppointmentEventTypeModel
                open={modelOpen}
                handleClose={() => setModelOpen(false)}
                eventTypeId={selectedId}
                handleGetAllEventTypes={fetchEventTypes}
            />

            {/* Delete Alert Dialog */}
            <AlertDialog
                open={deleteOpen}
                handleClose={() => setDeleteOpen(false)}
                title="Delete Appointment Event Type"
                message="Are you sure you want to delete this event type? This action cannot be undone."
                handleAction={handleConfirmDelete}
                actionButtonText="Delete"
                loading={deleteLoading}
            />
        </div>
    );
};

export default connect(null, { setAlert })(CalendarAppointmentEventType);