import React, { useEffect, useState } from 'react'
import DataTable from '../../components/common/table/table';

import { deleteAllMailsInbox, deleteMail, getAllTempMails } from '../../service/tempMail/tempMail';
import MailScraper from './mailScraper';
import { Tabs } from '../../components/common/tabs/tabs';
import MailScrapingRequests from './mailScrapingRequests';
import { createAllContact } from '../../service/contact/contactService';
import { connect } from 'react-redux';
import { setAlert } from '../../redux/commonReducers/commonReducers';
import Button from '../../components/common/buttons/button';
import CustomIcons from '../../components/common/icons/CustomIcons';
import TempMailModel from '../../components/models/tempMail/tempMailModel';
import AlertDialog from '../../components/common/alertDialog/alertDialog';
import Components from '../../components/muiComponents/components';
import Summary from './summary';
import { Tooltip } from '@mui/material';

const tableData = [
    { label: 'E-Mail Scraper' },
    { label: 'E-Mail Scraping Requests' },
    { label: 'E-Mails' },
    { label: 'Summary' },
]

const ManageMails = ({ setAlert }) => {
    const [mails, setMails] = useState([]);
    const [selectedTab, setSelectedTab] = useState(0);
    const [rowSelectionModel, setRowSelectionModel] = useState([]); // <-- array of IDs only
    const [open, setOpen] = useState(false);
    const [selectedMailId, setSelectedMailId] = useState(null);
    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [dialogAddContacts, setDialogAddContacts] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [dialogDeleteMailInbox, setDialogDeleteMailInbox] = useState({ open: false, title: '', message: '', actionButtonText: '' });

    const handleOpen = (id) => {
        setSelectedMailId(id);
        setOpen(true);
    };

    const handleClose = () => {
        setSelectedMailId(null);
        setOpen(false);
    };

    const handleOpenDeleteInboxDialog = () => {
        setDialogDeleteMailInbox({ open: true, title: 'Delete Mail', message: 'Are you sure! Do you want to delete this mails from Inbox?', actionButtonText: 'yes' });
    }

    const handleCloseDeletInboxeDialog = () => {
        setDialogDeleteMailInbox({ open: false, title: '', message: '', actionButtonText: '' });
    }

    const handleOpenDeleteDialog = (mailId) => {
        setSelectedMailId(mailId);
        setDialog({ open: true, title: 'Delete Mail', message: 'Are you sure! Do you want to delete this mail?', actionButtonText: 'yes' });
    }

    const handleCloseDeleteDialog = () => {
        setSelectedMailId(null);
        setDialog({ open: false, title: '', message: '', actionButtonText: '' });
    }

    const handleOpenAddContactsDialog = () => {
        setDialogAddContacts({ open: true, title: 'Add To Contacts', message: 'Are you sure! Do you want to add all selected mails into contacts?', actionButtonText: 'yes' });
    }

    const handleCloseContactsDialog = () => {
        setDialogAddContacts({ open: false, title: '', message: '', actionButtonText: '' });
    }

    const handleDeleteMail = async () => {
        const res = await deleteMail(selectedMailId);
        if (res.status === 200) {
            setAlert({
                open: true,
                message: "Mail deleted successfully",
                type: "success"
            });
            handleGetAllMails();
            handleCloseDeleteDialog();
        } else {
            setAlert({
                open: true,
                message: res?.message || "Failed to delete mail",
                type: "error"
            });
        }
    }

    const handleChangeRowSelectionModel = (newModel) => {
        setRowSelectionModel(newModel);
    }

    const handleChangeTab = (value) => {
        setSelectedTab(value);
        setRowSelectionModel([]); // Clear selection when changing tabs
    }

    const handleGetAllMails = async () => {
        if (selectedTab === 2) {
            const res = await getAllTempMails();
            if (res?.status === 200) {
                const mailsWithId = res.result.map((mail, index) => ({
                    id: mail.id || null,
                    rowId: index + 1,
                    email: mail.email || "-",
                    companyName: mail.companyName || "-",
                    jobTitle: mail.jobTitle || "-",
                    website: mail.website || "-",
                    phone: mail.phone || "-",
                    firstName: mail.firstName || "-",
                    lastName: mail.lastName || "-",
                }));
                setMails(mailsWithId);
            }
        }
    }

    const handleCreateAllContacts = async () => {
        // rowSelectionModel contains DataGrid rowIds (row.rowId). Convert to mail.id values expected by the API.
        const selectedMailIds = rowSelectionModel
            .map(rid => {
                const mail = mails.find(m => m.rowId === rid);
                return mail ? mail.id : null;
            })
            .filter(Boolean);

        const res = await createAllContact(selectedMailIds);
        if (res?.status !== 201) {
            setAlert({
                open: true,
                type: 'error',
                message: res?.message || 'Failed to add in contacts.',
            })
            handleCloseContactsDialog()
        } else {
            handleCloseContactsDialog()
            handleGetAllMails();
            setRowSelectionModel([]);
        }
    }

    const handleDeleteAllInbox = async () => {
        // rowSelectionModel contains DataGrid rowIds (row.rowId). Convert to mail.id values expected by the API.
        const selectedMailIds = rowSelectionModel
            .map(rid => {
                const mail = mails.find(m => m.rowId === rid);
                return mail ? mail.id : null;
            })
            .filter(Boolean);

        const res = await deleteAllMailsInbox(selectedMailIds);
        if (res?.status !== 200) {
            setAlert({
                open: true,
                type: 'error',
                message: res?.message || 'Failed to delete mails from inbox.',
            })
            handleCloseDeletInboxeDialog()
        } else {
            handleCloseDeletInboxeDialog()
            handleGetAllMails();
            setRowSelectionModel([]);
        }
    }

    useEffect(() => {
        document.title = "Email Scraper - 360Pipe"
        handleGetAllMails();
    }, [selectedTab])

    const columns = [
        // {
        //     field: 'rowId',
        //     headerName: '#',
        //     headerClassName: 'uppercase',
        //     flex: 1,
        //     maxWidth: 70,
        //     sortable: false,
        // },
        {
            field: 'firstName',
            headerName: 'First Name',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 150
        },
        {
            field: 'lastName',
            headerName: 'Last Name',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 150
        },
        {
            field: 'email',
            headerName: 'Sender Email',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 230,
        },
        {
            field: 'companyName',
            headerName: 'Company Name',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 200
        },
        {
            field: 'phone',
            headerName: 'Phone',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 150,
            sortable: false,
        },
        {
            field: 'jobTitle',
            headerName: 'Job Title',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 120,
            sortable: false,
        },
        {
            field: 'website',
            headerName: 'Website',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 130,
            sortable: false,
        },
        {
            field: 'action',
            headerName: 'action',
            headerClassName: 'uppercase',
            sortable: false,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                return (
                    <div className='flex items-center gap-2 justify-center h-full'>
                        <Tooltip title="Edit" arrow>
                            <div className='bg-green-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                <Components.IconButton onClick={() => handleOpen(params.row.id)}>
                                    <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-white h-4 w-4' />
                                </Components.IconButton>
                            </div>
                        </Tooltip>
                        <Tooltip title="Delete" arrow>
                            <div className='bg-red-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                <Components.IconButton onClick={() => handleOpenDeleteDialog(params.row.id)}>
                                    <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer text-white h-4 w-4' />
                                </Components.IconButton>
                            </div>
                        </Tooltip>
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
            <div className='flex justify-end items-center gap-4 w-[400px]'>
                <Button type={`button`} text={'Add to Contacts'} onClick={() => handleOpenAddContactsDialog()} />
                <Button useFor='error' type={`button`} text={'Delete From Inbox'} onClick={() => handleOpenDeleteInboxDialog()} />
            </div>
        )
    }
    return (
        <>
            <div>
                <Tabs tabsData={tableData} selectedTab={selectedTab} handleChange={handleChangeTab} fontSize={"16px"} />
            </div>
            {
                selectedTab === 0 && <MailScraper />
            }
            {
                selectedTab === 2 &&
                (
                    <div className='border rounded-lg bg-white mt-4'>
                        <DataTable columns={columns} rows={mails} getRowId={getRowId} height={rowSelectionModel?.length > 0 ? 450 : 500} checkboxSelection={true} setRowSelectionModel={handleChangeRowSelectionModel} rowSelectionModel={rowSelectionModel} showButtons={rowSelectionModel?.length > 0} buttons={actionButtons} hideFooter={true} />
                    </div>
                )
            }
            {
                selectedTab === 1 && <MailScrapingRequests setSelectedTab={setSelectedTab} />
            }
            {
                selectedTab === 3 && <Summary />
            }
            <TempMailModel open={open} handleClose={handleClose} id={selectedMailId} handleGetAllMails={handleGetAllMails} />
            <AlertDialog
                open={dialog.open}
                title={dialog.title}
                message={dialog.message}
                actionButtonText={dialog.actionButtonText}
                handleAction={() => handleDeleteMail()}
                handleClose={() => handleCloseDeleteDialog()}
            />

            <AlertDialog
                open={dialogAddContacts.open}
                title={dialogAddContacts.title}
                message={dialogAddContacts.message}
                actionButtonText={dialogAddContacts.actionButtonText}
                handleAction={() => handleCreateAllContacts()}
                handleClose={() => handleCloseContactsDialog()}
            />

            <AlertDialog
                open={dialogDeleteMailInbox.open}
                title={dialogDeleteMailInbox.title}
                message={dialogDeleteMailInbox.message}
                actionButtonText={dialogDeleteMailInbox.actionButtonText}
                handleAction={() => handleDeleteAllInbox()}
                handleClose={() => handleCloseDeletInboxeDialog()}
            />
        </>
    )
}

const mapDispatchToProps = {
    setAlert,
};

export default connect(null, mapDispatchToProps)(ManageMails)
