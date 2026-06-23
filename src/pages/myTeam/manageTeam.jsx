import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { setAlert } from '../../redux/commonReducers/commonReducers'
import Components from '../../components/muiComponents/components'
import CustomIcons from '../../components/common/icons/CustomIcons'
import { deleteTeam, getAllTeams } from '../../service/teamDetails/teamDetailsService'
import { useNavigate } from 'react-router-dom'
import DataTable from '../../components/common/table/table'
import Button from '../../components/common/buttons/button'
import AlertDialog from '../../components/common/alertDialog/alertDialog'
import AssignTeamOpportunities from '../../components/models/teamMember/assignTeamOpportunities'
import OpenDisplayOpportunities from '../../components/models/teamMember/displayOpportunities'
import { Tooltip } from '@mui/material'

const ManageTeam = ({ setAlert }) => {
    const navigate = useNavigate()

    const [teams, setTeams] = useState([])
    const [selectedTeamId, setSelectedTeamId] = useState(null)
    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [openAssignOpportunities, setOpenAssignOpportunities] = useState(false);
    const [openDisplayOpportunities, setOpenDisplayOpportunities] = useState(false);
    const [selectedOpportunity, setSelectedOpportunity] = useState(null)

    const handleOpenModelDisplayOpportunities = (data = null) => {
        setSelectedOpportunity({ opportunities: data?.assignedOpportunities });
        setOpenDisplayOpportunities(true);
    }

    const handleCloseModelDisplayOpportunities = () => {
        setSelectedOpportunity(null);
        setOpenDisplayOpportunities(false);
    }

    const handleOpenAssignOpportunities = (id = null) => {
        setSelectedTeamId(id);
        setOpenAssignOpportunities(true);
    }

    const handleCloseAssignOpportunities = () => {
        setSelectedTeamId(null);
        setOpenAssignOpportunities(false);
    }

    const handleOpenDeleteDialog = (teamId) => {
        setSelectedTeamId(teamId);
        setDialog({ open: true, title: 'Delete Team', message: 'Are you sure! Do you want to delete this team?', actionButtonText: 'yes' });
    }

    const handleCloseDeleteDialog = () => {
        setSelectedTeamId(null);
        setDialog({ open: false, title: '', message: '', actionButtonText: '' });
    }

    const handleDeleteTeam = async () => {
        const res = await deleteTeam(selectedTeamId);
        if (res.status === 200) {
            setAlert({
                open: true,
                message: "Team deleted successfully",
                type: "success"
            });
            handleGetAllTeams();
            handleCloseDeleteDialog();
        } else {
            setAlert({
                open: true,
                message: res?.message || "Failed to delete team",
                type: "error"
            });
        }
    }

    const handleGetAllTeams = async () => {
        const res = await getAllTeams();
        if (res.status === 200) {
            const formattedTeams = res.result?.reverse()?.map((team, index) => ({
                ...team,
                rowId: index + 1,
                teamMembers: team.teamMembers?.length || 0
            }));
            setTeams(formattedTeams);
        }
    }

    useEffect(() => {
        document.title = "My Team - 360Pipe"
        handleGetAllTeams();
    }, [])

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
            headerName: 'Name',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 300,
        },
        {
            field: 'createdByName',
            headerName: 'Created By',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 200
        },
        {
            field: 'assignMemberName',
            headerName: 'Assign Team Lead',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 350,
        },
        {
            field: 'teamMembers',
            headerName: 'Team Members',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 50,
            sortable: false,
        },
        {
            field: 'action',
            headerName: 'action',
            headerClassName: 'uppercase',
            sortable: false,
            flex: 1,
            headerAlign: "center",
            maxWidth: 200,
            renderCell: (params) => {
                return (
                    <div className='flex items-center gap-2 justify-center h-full'>
                        <Tooltip title="Opportunities List" arrow>
                            <div className='bg-gray-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                <Components.IconButton onClick={() => handleOpenModelDisplayOpportunities(params.row)}>
                                    <CustomIcons iconName={'fa-solid fa-list-ul'} css='cursor-pointer text-white h-4 w-4' />
                                </Components.IconButton>
                            </div>
                        </Tooltip>
                        <Tooltip title="Assign Opportunities" arrow>
                            <div className='bg-[#44288E] h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                <Components.IconButton onClick={() => handleOpenAssignOpportunities(params.row.id)}>
                                    <CustomIcons iconName={'fa-solid fa-user-plus'} css='cursor-pointer text-white h-4 w-4' />
                                </Components.IconButton>
                            </div>
                        </Tooltip>
                        <Tooltip title="Edit" arrow>
                            <div className='bg-green-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                <Components.IconButton onClick={() => navigate(`/dashboard/myTeam/edit/${params.row.id}`)}>
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
            // <PermissionWrapper
            //     functionalityName="Contacts"
            //     moduleName="Contacts"
            //     actionId={1}
            //     component={
            <div>
                <Button type={`button`} text={'Create Team'} onClick={() => navigate("/dashboard/myTeam/create")} startIcon={<CustomIcons iconName="fa-solid fa-plus" css="h-5 w-5" />} />
            </div>
            //     }
            // />
        )
    }

    return (
        <div>
            <div className='border rounded-lg bg-white w-full lg:w-full '>
                <DataTable columns={columns} rows={teams} getRowId={getRowId} showButtons={true} buttons={actionButtons} height={450} hideFooter={true} />
            </div>
            <AlertDialog
                open={dialog.open}
                title={dialog.title}
                message={dialog.message}
                actionButtonText={dialog.actionButtonText}
                handleAction={() => handleDeleteTeam()}
                handleClose={() => handleCloseDeleteDialog()}
            />
            <AssignTeamOpportunities open={openAssignOpportunities} handleClose={handleCloseAssignOpportunities} teamId={selectedTeamId} />
            <OpenDisplayOpportunities open={openDisplayOpportunities} handleClose={handleCloseModelDisplayOpportunities} selectedMember={selectedOpportunity} type={"Team"} />

        </div>
    )
}

const mapDispatchToProps = {
    setAlert,
};

export default connect(null, mapDispatchToProps)(ManageTeam)