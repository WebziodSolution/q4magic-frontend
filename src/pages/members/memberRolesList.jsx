import React, { useEffect, useState } from 'react'
import Components from '../../components/muiComponents/components';
import { deleteSubUserType, getAllSubUserTypes } from '../../service/subUserType/subUserTypeService';
import { useNavigate } from 'react-router-dom';
import CustomIcons from '../../components/common/icons/CustomIcons';
import DataTable from '../../components/common/table/table';
import Button from '../../components/common/buttons/button';
import { connect } from 'react-redux';
import { setAlert } from '../../redux/commonReducers/commonReducers';
import AlertDialog from '../../components/common/alertDialog/alertDialog';
import PermissionWrapper from '../../components/common/permissionWrapper/PermissionWrapper';

const MemberRolesList = ({ setAlert }) => {
    const navigate = useNavigate();

    const [subUserTypes, setSubUserTypes] = useState([]);
    const [selectedUserTypeId, setSelectedUserTypeId] = useState(null);
    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });

    const handleOpenDeleteDialog = (id) => {
        setSelectedUserTypeId(id);
        setDialog({ open: true, title: 'Delete Member Role', message: 'Are you sure! Do you want to delete this member role?', actionButtonText: 'yes' });
    }

    const handleCloseDeleteDialog = () => {
        setSelectedUserTypeId(null);
        setDialog({ open: false, title: '', message: '', actionButtonText: '' });
    }

    const handleDeleteSubUserType = async () => {
        const res = await deleteSubUserType(selectedUserTypeId);
        if (res.status === 200) {
            handleGetAllSubUserTypes();
            handleCloseDeleteDialog();
        } else {
            setAlert({
                open: true,
                message: res?.message || "Failed to delete member role",
                type: "error"
            });
        }
    }

    const handleGetAllSubUserTypes = async () => {
        const res = await getAllSubUserTypes();
        if (res.status === 200) {
            const formattedSubUserTypes = res?.data?.result?.map((subUserType, index) => ({
                ...subUserType,
                rowId: index + 1
            }));
            setSubUserTypes(formattedSubUserTypes);
        }
    }


    useEffect(() => {
        handleGetAllSubUserTypes();
    }, []);

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
            field: 'name',
            headerName: 'Member Role',
            headerClassName: 'uppercase',
            flex: 1,
            // maxWidth: 800,
            sortable: false,
        },
        {
            field: 'action',
            headerName: 'action',
            headerAlign: 'center',
            headerClassName: 'uppercase',
            sortable: false,
            flex: 1,
            maxWidth: 140,
            renderCell: (params) => {
                return (
                    <div className='flex items-center gap-2 justify-center h-full'>
                        <PermissionWrapper
                            functionalityName="Account"
                            moduleName="Account"
                            actionId={2}
                            component={
                                <div className='bg-green-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                    <Components.IconButton onClick={() => navigate(`/dashboard/members/edit/${params.row.id}`)}>
                                        <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-white h-4 w-4' />
                                    </Components.IconButton>
                                </div>
                            }
                        />
                        <PermissionWrapper
                            functionalityName="Account"
                            moduleName="Account"
                            actionId={3}
                            component={
                                <div className='bg-red-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                    <Components.IconButton onClick={() => handleOpenDeleteDialog(params.row.id)}>
                                        <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer text-white h-4 w-4' />
                                    </Components.IconButton>
                                </div>
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
                functionalityName="Account"
                moduleName="Account"
                actionId={1}
                component={
                    <div>
                        <Button type={`button`} text={'Add Member Role'} onClick={() => navigate("/dashboard/members/add")} startIcon={<CustomIcons iconName="fa-solid fa-plus" css="h-5 w-5" />} />
                    </div>
                }
            />
        )
    }

    return (
        <>
            <div className='border rounded-lg bg-white w-full lg:w-full '>
                <DataTable columns={columns} rows={subUserTypes} getRowId={getRowId} showButtons={true} buttons={actionButtons} height={450} hideFooter={true} />
            </div>
            <AlertDialog
                open={dialog.open}
                title={dialog.title}
                message={dialog.message}
                actionButtonText={dialog.actionButtonText}
                handleAction={() => handleDeleteSubUserType()}
                handleClose={() => handleCloseDeleteDialog()}
            />
        </>
    )
}

const mapDispatchToProps = {
    setAlert,
};

export default connect(null, mapDispatchToProps)(MemberRolesList)
