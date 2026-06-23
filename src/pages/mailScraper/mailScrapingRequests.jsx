import React, { useEffect, useState } from 'react'
import { changeStatusToActive, getAllScrapingRequests } from '../../service/emailScrapingRequest/emailScrapingRequest';
import DataTable from '../../components/common/table/table';
import CustomIcons from '../../components/common/icons/CustomIcons';
import Button from '../../components/common/buttons/button';
import { connect } from 'react-redux';
import { setAlert } from '../../redux/commonReducers/commonReducers';
import AlertDialog from '../../components/common/alertDialog/alertDialog';
import MailScrapingRequestsModel from '../../components/models/mailScrapingRequest/mailScrapingRequestsModel';

const StatusIcon = ({ value }) => {
    if (value === 1) {
        // waiting
        return (

            <span title="Completed" className="pop-in">
                <CustomIcons iconName="fa-solid fa-circle-check" css="text-green-500 text-xl" />
            </span>
        );
    }
    if (value === 2) {
        // processing
        return (
            <span title="Processing" className="pulse-glow">
                {/* use FA built-in spin or Tailwind animate-spin (pick one). Using FA here: */}
                <CustomIcons iconName="fa-solid fa-spinner fa-spin" css="text-blue-500 text-xl" />
            </span>
        );
    }
    // done
    return (
        <span title="Pending" className="pulse-glow">
            <CustomIcons iconName="fa-solid fa-hourglass-start" css="text-yellow-500 text-xl" />
        </span>
    );
};

const MailScrapingRequests = ({ setAlert, setSelectedTab }) => {
    const [mails, setMails] = useState([]);
    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [open, setOpen] = useState(false);
    const [selectedMailId, setSelectedMailId] = useState(null);

    const handleOpen = (id) => {
        setSelectedMailId(id);
        setOpen(true);
    };

    const handleClose = () => {
        setSelectedMailId(null);
        setOpen(false);
    };

    const handleOpenDialog = (row) => {
        const email = row.email;
        setSelectedEmail(row.id);
        setDialog({ open: true, title: 'Start Scraping', message: `Are you sure! Do you want to start scraping for this email: ${email}?`, actionButtonText: 'yes' });
    }

    const handleCloseDialog = () => {
        setSelectedEmail(null);
        setDialog({ open: false, title: '', message: '', actionButtonText: '' });
    }

    const handleChangeStatus = async () => {
        const res = await changeStatusToActive(selectedEmail);
        if (res?.status !== 200) {
            // Handle unsuccessful status change
            setAlert({
                open: true,
                type: 'error',
                message: res?.message || 'Failed to change status to active.',
            })
        } else {
            handleCloseDialog();
            handleGetAllMails();
        }
    }

    const handleGetAllMails = async () => {
        const res = await getAllScrapingRequests();
        if (res?.status === 200) {
            const mailsWithId = res.result.map((mail, index) => ({
                id: mail.id,
                rowId: index + 1,
                email: mail.email || "-",
                maxMessages: mail.maxMessages || "-",
                status: mail.status || "-",
            }));
            setMails(mailsWithId);
        }
    }

    useEffect(() => {
        // initial fetch
        handleGetAllMails();
        // poll every 1 minute
        const interval = setInterval(() => {
            handleGetAllMails();
        }, 60000); // 60,000 ms = 1 minute

        return () => clearInterval(interval);
    }, [])

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
            field: 'email',
            headerName: 'Sender Email',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 180,
            sortable: false,
        },
        {
            field: 'maxMessages',
            headerName: 'Max Messages',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 150
        },
        {
            field: 'status',
            headerName: 'Status',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 150,
            sortable: false,
            headerAlign: "center",
            renderCell: (params) => (
                <div className="flex justify-center items-center w-full">
                    <StatusIcon value={params.value === 0 ? 0 : params.value} />
                </div>
            ),
        },
        {
            field: 'action',
            headerName: 'action',
            headerClassName: 'uppercase',
            sortable: false,
            minWidth: 380,
            headerAlign: "center",
            renderCell: (params) => {
                return (
                    <div className='flex items-center gap-2 justify-center h-full'>
                        <Button disabled={params.row.status !== 1 || params.row.status === 2} text={"Edit"} onClick={() => handleOpen(params.row?.id)} />
                        <Button disabled={params.row.status !== 1 || params.row.status === 2} text={"Show Mails"} onClick={() => setSelectedTab(3)} useFor='success' />
                        <Button disabled={params.row.status !== 1 || params.row.status === 2} text={"Re-Scrap"} onClick={() => handleOpenDialog(params.row)} useFor='error' />
                    </div>
                );
            },
        },
    ];

    const getRowId = (row) => {
        return row.rowId;
    }

    return (
        <>
            <div className='border rounded-lg bg-white mt-4'>
                <DataTable columns={columns} rows={mails} getRowId={getRowId} height={500} hideFooter={true} />
            </div>
            <AlertDialog
                open={dialog.open}
                title={dialog.title}
                message={dialog.message}
                actionButtonText={dialog.actionButtonText}
                handleAction={() => handleChangeStatus()}
                handleClose={() => handleCloseDialog()}
            />
            <MailScrapingRequestsModel open={open} handleClose={handleClose} id={selectedMailId} handleGetAllRecords={handleGetAllMails} />
        </>
    )
}

const mapDispatchToProps = {
    setAlert,
};

export default connect(null, mapDispatchToProps)(MailScrapingRequests)