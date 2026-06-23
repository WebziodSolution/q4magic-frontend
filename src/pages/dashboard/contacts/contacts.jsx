import React, { useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux';
import { setAlert, setSyncingPushStatus } from '../../../redux/commonReducers/commonReducers';

import DataTable from '../../../components/common/table/table';
import Button from '../../../components/common/buttons/button';
import CustomIcons from '../../../components/common/icons/CustomIcons';
import AlertDialog from '../../../components/common/alertDialog/alertDialog';
import Components from '../../../components/muiComponents/components';
import { deleteContact, getAllContacts, searchContact } from '../../../service/contact/contactService';
import ContactModel from '../../../components/models/contact/contactModel';
import { useLocation } from 'react-router-dom';
import PermissionWrapper from '../../../components/common/permissionWrapper/PermissionWrapper';
import ContactReportHierarch from '../../../components/models/contact/contactReportHierarch';
import { Tooltip } from '@mui/material';

const Contacts = ({ setAlert, setSyncingPushStatus, syncingPullStatus }) => {
    const location = useLocation();

    const controllerRef = useRef(null);
    const debounceRef = useRef(null);

    const [contacts, setContacts] = useState([]);
    const [open, setOpen] = useState(false);
    const [openHierarchy, setOpenHierarchy] = useState(false);
    const [selectedContactId, setSelectedContactId] = useState(null);
    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [search, setSearch] = useState("")

    const handleGetContacts = async () => {
        try {
            const contacts = await getAllContacts();
            const formattedContacts = contacts?.result?.map((contact, index) => ({
                rowId: index + 1,
                id: contact.id || null,
                companyName: contact.companyName || "-",
                phone: contact.phone || "-",
                opportunityId: contact.opportunityId || "-",
                salesforceContactId: contact.salesforceContactId || "-",
                firstName: contact.firstName || "-",
                middleName: contact.middleName || "-",
                lastName: contact.lastName || "-",
                linkedinProfile: contact.linkedinProfile || "-",
                title: contact.title || "-",
                emailAddress: contact.emailAddress || "-",
                role: contact.role || "-",
                notes: contact.notes || "-",
                keyContact: contact.keyContact || "-",
                recordStatus: contact.recordStatus || "-",
            }));
            setContacts(formattedContacts);
        } catch (error) {
            console.error("Error fetching contacts:", error);
        }
    }

    const handleOpenHierarchy = (contactId) => {
        setSelectedContactId(contactId);
        setOpenHierarchy(true);
    }

    const handleCloseHierarchy = () => {
        setSelectedContactId(null);
        setOpenHierarchy(false);
    }

    const handleOpen = (contactId = null) => {
        setSelectedContactId(contactId);
        setOpen(true);
    }

    const handleClose = () => {
        setSelectedContactId(null);
        setOpen(false);
    }

    const handleOpenDeleteDialog = (contactId) => {
        setSelectedContactId(contactId);
        setDialog({ open: true, title: 'Delete Contact', message: 'Are you sure! Do you want to delete this contact?', actionButtonText: 'yes' });
    }

    const handleCloseDeleteDialog = () => {
        setSelectedContactId(null);
        setDialog({ open: false, title: '', message: '', actionButtonText: '' });
    }

    const handleDeleteContact = async () => {
        const res = await deleteContact(selectedContactId);
        if (res.status === 200) {
            setSyncingPushStatus(true);
            setAlert({
                open: true,
                message: "Contact deleted successfully",
                type: "success"
            });
            handleGetContacts();
            handleCloseDeleteDialog();
        } else {
            setAlert({
                open: true,
                message: res?.message || "Failed to delete contact",
                type: "error"
            });
        }
    }

    const handleSearch = (event) => {
        const value = event.target.value;
        setSearch(value);

        // ✅ Clear old debounce timer
        if (debounceRef.current) clearTimeout(debounceRef.current);

        // ✅ Debounce API call
        debounceRef.current = setTimeout(async () => {
            // ✅ Abort previous in-flight request
            if (controllerRef.current) {
                controllerRef.current.abort();
            }

            // ✅ Create new controller for this request
            const controller = new AbortController();
            controllerRef.current = controller;

            // (Optional) if input empty, clear list and stop
            if (!value?.trim()) {
                handleGetContacts()
                return;
            }

            const res = await searchContact(`query=${encodeURIComponent(value)}`, controller.signal);

            // ✅ If aborted, res will be null (from service)
            if (!res) return;

            if (res.status === 200) {
                const formattedContacts = res?.result?.map((contact, index) => ({
                    rowId: index + 1,
                    id: contact.id || null,
                    companyName: contact.companyName || "-",
                    phone: contact.phone || "-",
                    opportunityId: contact.opportunityId || "-",
                    salesforceContactId: contact.salesforceContactId || "-",
                    firstName: contact.firstName || "-",
                    middleName: contact.middleName || "-",
                    lastName: contact.lastName || "-",
                    linkedinProfile: contact.linkedinProfile || "-",
                    title: contact.title || "-",
                    emailAddress: contact.emailAddress || "-",
                    role: contact.role || "-",
                    notes: contact.notes || "-",
                    keyContact: contact.keyContact || "-",
                    recordStatus: contact.recordStatus || "-",
                }));

                setContacts(formattedContacts);
            }
        }, 300);
    };

    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            if (controllerRef.current) controllerRef.current.abort();
        };
    }, []);

    useEffect(() => {
        document.title = "Contacts - 360Pipe"
        handleGetContacts();
    }, []);

    useEffect(() => {
        if (syncingPullStatus && location.pathname === '/dashboard/contacts') {
            handleGetContacts();
        }
    }, [syncingPullStatus]);

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
            field: 'companyName',
            headerName: 'Company Name',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 300,
        },
        {
            field: 'firstName',
            headerName: 'First Name',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 300,
        },
        {
            field: 'lastName',
            headerName: 'Last Name',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 200
        },
        {
            field: 'title',
            headerName: 'Title',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 200,
        },
        {
            field: 'emailAddress',
            headerName: 'Email',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 200
        },
        {
            field: 'phone',
            headerName: 'Phone',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 300,
        },
        {
            field: 'action',
            headerName: 'action',
            headerClassName: 'uppercase',
            sortable: false,
            flex: 1,
            maxWidth: 150,
            headerAlign: "center",
            renderCell: (params) => {
                return (
                    <div className='flex items-center gap-2 justify-center h-full'>
                        <Tooltip title="Report-Hierarchy" arrow>
                            <div className='bg-gray-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                <Components.IconButton onClick={() => handleOpenHierarchy(params.row.id)}>
                                    <CustomIcons iconName={'fa-solid fa-sitemap'} css='cursor-pointer text-white h-4 w-4' />
                                </Components.IconButton>
                            </div>
                        </Tooltip>
                        <PermissionWrapper
                            functionalityName="Contacts"
                            moduleName="Contacts"
                            actionId={2}
                            component={
                                <Tooltip title="Edit" arrow>
                                    <div className='bg-green-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                        <Components.IconButton onClick={() => handleOpen(params.row.id)}>
                                            <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-white h-4 w-4' />
                                        </Components.IconButton>
                                    </div>
                                </Tooltip>
                            }
                        />
                        <PermissionWrapper
                            functionalityName="Contacts"
                            moduleName="Contacts"
                            actionId={3}
                            component={
                                <Tooltip title="Delete" arrow>
                                    <div className='bg-red-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                        <Components.IconButton onClick={() => handleOpenDeleteDialog(params.row.id)}>
                                            <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer text-white h-4 w-4' />
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

    const getRowId = (row) => {
        return row.rowId;
    }

    const actionButtons = () => {
        return (
            <PermissionWrapper
                functionalityName="Contacts"
                moduleName="Contacts"
                actionId={1}
                component={
                    <div>
                        <Button type={`button`} text={'Add Contact'} onClick={() => handleOpen()} startIcon={<CustomIcons iconName="fa-solid fa-plus" css="h-5 w-5" />} />
                    </div>
                }
            />
        )
    }

    return (
        <>
            <div className='border rounded-lg bg-white w-full lg:w-full '>
                <DataTable columns={columns} rows={contacts} getRowId={getRowId} hideFooter={true} height={480} showButtons={true} showSearch={true} buttons={actionButtons} onChangeSearch={handleSearch} searchValue={search} searchPlaceholder="Search contacts by name..." />
            </div>
            <ContactModel open={open} handleClose={handleClose} contactId={selectedContactId} handleGetAllContacts={handleGetContacts} />
            <ContactReportHierarch open={openHierarchy} handleClose={handleCloseHierarchy} contactId={selectedContactId} />

            <AlertDialog
                open={dialog.open}
                title={dialog.title}
                message={dialog.message}
                actionButtonText={dialog.actionButtonText}
                handleAction={() => handleDeleteContact()}
                handleClose={() => handleCloseDeleteDialog()}
            />
        </>
    );
}

const mapStateToProps = (state) => ({
    syncingPullStatus: state.common.syncingPullStatus,
});

const mapDispatchToProps = {
    setAlert,
    setSyncingPushStatus
};

export default connect(mapStateToProps, mapDispatchToProps)(Contacts)