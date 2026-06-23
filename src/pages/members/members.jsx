import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { setAlert, setSyncingPushStatus } from '../../redux/commonReducers/commonReducers';

import DataTable from '../../components/common/table/table';
import Button from '../../components/common/buttons/button';
import CustomIcons from '../../components/common/icons/CustomIcons';
import AlertDialog from '../../components/common/alertDialog/alertDialog';
import Components from '../../components/muiComponents/components';

import PermissionWrapper from '../../components/common/permissionWrapper/PermissionWrapper';
import { deleteCustomer, getAllSubUsers, sendRegisterInvitation } from '../../service/customers/customersService';
import SubUserModel from '../../components/models/subUser/subUserModel';
import { Tooltip } from '@mui/material';

const Members = ({ setAlert, setSyncingPushStatus, syncingPullStatus }) => {
  const location = useLocation();
  const [subUsers, setSubUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });
  const [open, setOpen] = useState(false);
  const [invitationData, setInvitationData] = useState(null);
  const [inviteDialog, setInviteDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });


  const handleClickOpen = (id = null) => {
    if (id) {
      setSelectedUserId(id);
    }
    setOpen(true);
  }

  const handleClose = () => {
    setOpen(false);
    setSelectedUserId(null);
  }

  const handleOpenInviteDialog = (data) => {
    const newData = {
      email: data.emailAddress,
      name: data.firstName + " " + data.lastName,
      userId: data.id,
    }
    setInvitationData(newData);
    setInviteDialog({ open: true, title: 'Send Invitation', message: 'Are you sure! Do you want to send an invitation to this account?', actionButtonText: 'Send Invitation' });
  }

  const handleCloseInviteDialog = () => {
    setInvitationData(null);
    setInviteDialog({ open: false, title: '', message: '', actionButtonText: '' });
  }

  const handleOpenDeleteDialog = (id) => {
    setSelectedUserId(id);
    setDialog({ open: true, title: 'Delete Account', message: 'Are you sure! Do you want to delete this account?', actionButtonText: 'yes' });
  }

  const handleCloseDeleteDialog = () => {
    setSelectedUserId(null);
    setDialog({ open: false, title: '', message: '', actionButtonText: '' });
  }

  const handleDeleteAccount = async () => {
    const res = await deleteCustomer(selectedUserId);
    if (res?.data?.status === 200) {
      handleCloseDeleteDialog();
      handleGetAllAccounts();
    } else {
      setAlert({
        open: true,
        message: res?.message || "Failed to delete user",
        type: "error"
      });
    }
  }

  const handleGetAllAccounts = async () => {
    const res = await getAllSubUsers();
    if (res?.data?.status === 200) {
      const formattedSubUsers = res?.data?.result?.map((subUser, index) => ({
        ...subUser,
        rowId: index + 1,
        subUserType: subUser?.subUserTypeDto?.name,
        status: ((subUser?.userName !== "" && subUser?.userName !== null) && (subUser?.password !== '' && subUser?.password !== null)) ? 'Active' : 'Pending'
      }));
      setSubUsers(formattedSubUsers);
    }
  }

  const handleSendInvitation = async () => {
    if (invitationData.email !== "" && invitationData.email != null) {
      const response = await sendRegisterInvitation(invitationData);
      if (response?.data?.status === 200) {
        setAlert({
          open: true,
          type: "success",
          message: response?.data?.message || "Invitation sent successfully.",
        });
        handleCloseInviteDialog();
      } else {
        setAlert({
          open: true,
          type: "error",
          message: response?.data?.message || "An error occurred. Please try again.",
        });
      }
    } else {
      setAlert({
        open: true,
        type: "error",
        message: "Email is required to send invitation.",
      });
    }
  }

  useEffect(() => {
    document.title = "Members - 360Pipe"
    handleGetAllAccounts();
  }, []);

  useEffect(() => {
    if (syncingPullStatus && location.pathname === '/dashboard/accounts') {
      handleGetAllAccounts();
    }
  }, [syncingPullStatus]);

  const columns = [
    // {
    //   field: 'rowId',
    //   headerName: '#',
    //   headerClassName: 'uppercase',
    //   flex: 1,
    //   maxWidth: 50,
    //   sortable: false,
    // },
    {
      field: 'name',
      headerName: 'Member Name',
      headerClassName: 'uppercase',
      flex: 1,
      maxWidth: 800,
      renderCell: (params) => {
        return (
          <div>
            <span>
              {params.row.firstName + " " + params.row.lastName}
            </span>
          </div>
        )
      }
    },
    {
      field: 'emailAddress',
      headerName: 'Email Address',
      headerClassName: 'uppercase',
      flex: 1,
      maxWidth: 700,
      renderCell: (params) => {
        return (
          <div>
            <span>
              {params.value ? params.value : '-'}
            </span>
          </div>
        )
      }
    },

    {
      field: 'subUserType',
      headerName: 'Role',
      headerClassName: 'uppercase',
      flex: 1,
      maxWidth: 400,
    },
    {
      field: 'status',
      headerName: 'Status',
      headerClassName: 'uppercase',
      flex: 1,
      maxWidth: 200,
    },
    {
      field: 'action',
      headerName: 'action',
      headerClassName: 'uppercase',
      sortable: false,
      flex: 1,
      headerAlign: "center",
      maxWidth: 200,
      align: 'center',
      renderCell: (params) => {
        return (
          <div className='h-full flex justify-center'>
            <div className='flex justify-end items-center gap-2 w-[140px] h-full'>
              {
                params?.row?.status === 'Pending' && (
                  <Tooltip title="Send Invitation" arrow>
                    <div className='bg-[#44288E] h-8 w-8 flex justify-center items-center rounded-full text-white'>
                      <Components.IconButton onClick={() => handleOpenInviteDialog(params.row)}>
                        <CustomIcons iconName={'fa-solid fa-share-from-square'} css='cursor-pointer text-white h-4 w-4' />
                      </Components.IconButton>
                    </div>
                  </Tooltip>
                )
              }
              <PermissionWrapper
                functionalityName="Members"
                moduleName="Members"
                actionId={2}
                component={
                  <Tooltip title="Edit" arrow>
                    <div className='bg-green-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                      <Components.IconButton onClick={() => handleClickOpen(params.row.id)}>
                        <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-white h-4 w-4' />
                      </Components.IconButton>
                    </div>
                  </Tooltip>
                }
              />
              <PermissionWrapper
                functionalityName="Members"
                moduleName="Members"
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
        functionalityName="Members"
        moduleName="Members"
        actionId={1}
        component={
          <div>
            <Button type={`button`} text={'Invite Member'} onClick={() => handleClickOpen()} startIcon={<CustomIcons iconName="fa-solid fa-plus" css="h-5 w-5" />} />
          </div>
        }
      />
    )
  }

  return (
    <div className='w-full'>
      <div className='border rounded-lg bg-white'>
        <DataTable columns={columns} rows={subUsers} getRowId={getRowId} showButtons={true} buttons={actionButtons} height={450} hideFooter={true} />
      </div>
      <AlertDialog
        open={dialog.open}
        title={dialog.title}
        message={dialog.message}
        actionButtonText={dialog.actionButtonText}
        handleAction={() => handleDeleteAccount()}
        handleClose={() => handleCloseDeleteDialog()}
      />
      <AlertDialog
        open={inviteDialog.open}
        title={inviteDialog.title}
        message={inviteDialog.message}
        actionButtonText={inviteDialog.actionButtonText}
        handleAction={() => handleSendInvitation()}
        handleClose={() => handleCloseInviteDialog()}
      />
      <SubUserModel open={open} handleClose={handleClose} id={selectedUserId} handleGetAllUsers={handleGetAllAccounts} />
    </div>
  )
}

const mapStateToProps = (state) => ({
  syncingPullStatus: state.common.syncingPullStatus,
});

const mapDispatchToProps = {
  setAlert,
  setSyncingPushStatus,
};

export default connect(mapStateToProps, mapDispatchToProps)(Members)