import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux';
import { setAlert } from '../../redux/commonReducers/commonReducers';

import { useNavigate, useParams } from 'react-router-dom';
import { Controller, useFieldArray, useForm } from 'react-hook-form';

import Input from '../../components/common/input/input';
import { deleteTeamMembers } from '../../service/teamMembers/teamMembersService';
import DataTable from '../../components/common/table/table';
import Button from '../../components/common/buttons/button';
import Components from '../../components/muiComponents/components';
import CustomIcons from '../../components/common/icons/CustomIcons';
import AddTeamMemberModel from '../../components/models/teamMember/addTeamMemberModel';
import AlertDialog from '../../components/common/alertDialog/alertDialog';
import { createTeam, getTeamDetails, updateTeam } from '../../service/teamDetails/teamDetailsService';
import { getAllSubUsers } from '../../service/customers/customersService';
import Select from '../../components/common/select/select';
import OpenDisplayOpportunities from '../../components/models/teamMember/displayOpportunities';
import OpenAssignOpportunities from '../../components/models/teamMember/openAssignOpportunities';
import { Tooltip } from '@mui/material';

const AddTeamMembers = ({ setAlert }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [selectedMember, setSelectedMember] = useState(null)
    const [customers, setCustomers] = useState([]);
    const [openDisplayOpportunities, setOpenDisplayOpportunities] = useState(false);
    const [openAssignOpportunities, setOpenAssignOpportunities] = useState(false);

    const handleOpen = (data = null) => {
        setSelectedMember(data);
        setOpen(true);
    }

    const handleClose = () => {
        setSelectedMember(null);
        setOpen(false);
    }

    const handleOpenModelDisplayOpportunities = (data = null) => {
        setSelectedMember(data);
        setOpenDisplayOpportunities(true);
    }

    const handleCloseModelDisplayOpportunities = () => {
        setSelectedMember(null);
        setOpenDisplayOpportunities(false);
    }

    const handleOpenAssignOpportunities = (data = null) => {
        setSelectedMember(data);
        setOpenAssignOpportunities(true);
    }

    const handleCloseAssignOpportunities = () => {
        setSelectedMember(null);
        setOpenAssignOpportunities(false);
    }

    const handleOpenDeleteDialog = (data) => {
        setSelectedMember(data);
        setDialog({ open: true, title: 'Delete Team', message: 'Are you sure! Do you want to delete this team?', actionButtonText: 'yes' });
    }

    const handleCloseDeleteDialog = () => {
        setSelectedMember(null);
        setDialog({ open: false, title: '', message: '', actionButtonText: '' });
    }

    const {
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            id: null,
            name: null,
            assignMember: null,
            teamMembers: [],
            assignMemberName: null,
            assignedOpportunities: null
        },
    });

    const { fields, append, remove, update } = useFieldArray({
        control,
        name: 'teamMembers',
    });

    const handleDeleteTeam = async () => {
        remove(selectedMember?.id);
        handleCloseDeleteDialog();
        const res = await deleteTeamMembers(selectedMember?.teamMemberId);
        if (res.status === 200) {
            setAlert({
                open: true,
                message: "Team member deleted successfully",
                type: "success"
            });
            handleCloseDeleteDialog();
        } else {
            setAlert({
                open: true,
                message: res?.message || "Failed to delete team",
                type: "error"
            });
        }
    }

    const handleSave = async (data) => {
        const newData = {
            ...data,
            assignedOpportunities: watch("assignedOpportunities"),
            teamMembers: data.teamMembers?.map((item) => {
                delete item.rowId;
                return {
                    ...item,
                    id: item.teamMemberId,
                    opportunities: item.opportunities ? JSON.stringify(item.opportunities) : null,
                }
            })
        }
        if (id) {
            const res = await updateTeam(id, newData)
            if (res.status === 200) {
                navigate("/dashboard/myteam")
            } else {
                setAlert({
                    open: true,
                    message: res?.message || "Failed to update team",
                    type: "error"
                });
            }
        } else {
            const res = await createTeam(newData)
            if (res.status === 201) {
                navigate("/dashboard/myteam")
            } else {
                setAlert({
                    open: true,
                    message: res?.message || "Failed to create team",
                    type: "error"
                });
            }
        }
    }

    const handleGetTeamDetails = async () => {
        if (id) {
            const res = await getTeamDetails(id)
            const teamMembersData = res?.result?.teamMembers?.map((item, index) => {
                return {
                    ...item,
                    teamMemberId: item.id,
                    opportunities: item.opportunities ? JSON.parse(item.opportunities) : [],
                    title: item?.title || '-',
                    assignMemberName: res?.result?.assignMemberName || '-',
                }
            })
            reset({
                id: res?.result?.id || null,
                name: res?.result?.name || null,
                teamMembers: teamMembersData || [],
                assignMember: res?.result?.assignMember || null,
                assignMemberName: res?.result?.assignMemberName || null,
                assignedOpportunities: res?.result?.assignedOpportunities ? res?.result?.assignedOpportunities : null
            });
        }
    }

    const handleGetAllCustomers = async () => {
        const res = await getAllSubUsers()
        const data = res?.data?.result?.map((item) => {
            return {
                id: item.id,
                title: item.name,
                role: item.subUserTypeDto?.name || ''
            }
        })
        setCustomers(data)
    }

    useEffect(() => {
        handleGetAllCustomers();
    }, [])

    useEffect(() => {
        handleGetAllCustomers();
        handleGetTeamDetails();
    }, [id])

    const columns = [
        {
            field: 'memberName',
            headerName: 'Member Name',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 200,
            sortable: false,
        },
        {
            field: 'title',
            headerName: 'Title',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 100,
            sortable: false,
        },
        {
            field: 'assignMemberName',
            headerName: 'Reports To',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 200,
            renderCell: (params) => {
                return (
                    <div>
                        {watch("assignMemberName") || '-'}
                    </div>
                )
            }
        },
        {
            field: 'role',
            headerName: 'Role',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 100,
        },
        {
            field: 'totalOpportunities',
            headerName: 'Total Opportunities',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 150,
            renderCell: (params) => {
                return (
                    <div>
                        {params.row?.opportunities?.length || 0}
                    </div>
                )
            }
        },
        {
            field: 'action',
            headerName: 'action',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 150,
            sortable: false,
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
                                <Components.IconButton onClick={() => handleOpenAssignOpportunities(params.row)}>
                                    <CustomIcons iconName={'fa-solid fa-user-plus'} css='cursor-pointer text-white h-4 w-4' />
                                </Components.IconButton>
                            </div>
                        </Tooltip>
                        <Tooltip title="Edit" arrow>
                            <div className='bg-green-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                <Components.IconButton onClick={() => handleOpen(params.row)}>
                                    <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-white h-4 w-4' />
                                </Components.IconButton>
                            </div>
                        </Tooltip>
                        <Tooltip title="Delete" arrow>
                            <div className='bg-red-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                <Components.IconButton onClick={() => handleOpenDeleteDialog(params.row)}>
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
        return row.rowId || row.id;
    }

    const actionButtons = () => {
        return (
            // <PermissionWrapper
            //     functionalityName="Contacts"
            //     moduleName="Contacts"
            //     actionId={1}
            //     component={
            <div>
                <Button type={`button`} text={'Add Member'} onClick={() => handleOpen()} startIcon={<CustomIcons iconName="fa-solid fa-plus" css="h-5 w-5" />} />
            </div>
            //     }
            // />
        )
    }

    return (
        <div>
            <form onSubmit={handleSubmit(handleSave)}>
                <div className='mb-3 md:w-[500px] flex justify-start items-center gap-5'>
                    <div className='w-full'>
                        <Controller
                            name="name"
                            control={control}
                            rules={{
                                required: "Team Name is required",
                            }}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    label="Team Name"
                                    type={`text`}
                                    error={errors.name}
                                />
                            )}
                        />
                    </div>
                    <div className='w-full'>
                        <Controller
                            name="assignMember"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    options={customers}
                                    label={"Assign Team Lead"}
                                    placeholder="Select member"
                                    value={parseInt(watch("assignMember")) || null}
                                    onChange={(_, newValue) => {
                                        if (newValue?.id) {
                                            field.onChange(newValue.id);
                                            setValue("assignMemberName", newValue.title);
                                        } else {
                                            setValue("assignMember", null);
                                        }
                                    }}
                                    error={errors?.assignMember}
                                />
                            )}
                        />
                    </div>
                </div>
                <div className='border rounded-lg bg-white w-full lg:w-full '>
                    <DataTable columns={columns} rows={fields} getRowId={getRowId} hideFooter={true} height={350} showButtons={true} buttons={actionButtons} />
                </div>
                <div className='flex justify-end my-5 gap-3'>
                    <div>
                        <Button type="submit" text={id ? "Update" : "Submit"} endIcon={<CustomIcons iconName={'fa-solid fa-floppy-disk'} css='cursor-pointer' />} />
                    </div>
                    <div>
                        <Button type="button" text={"Cancel"} variant="contained" useFor='disabled' onClick={() => navigate("/dashboard/myteam")} startIcon={<CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer mr-2' />} />
                    </div>
                </div>
            </form>
            <AlertDialog
                open={dialog.open}
                title={dialog.title}
                message={dialog.message}
                actionButtonText={dialog.actionButtonText}
                handleAction={() => handleDeleteTeam()}
                handleClose={() => handleCloseDeleteDialog()}
            />
            <AddTeamMemberModel open={open} handleClose={handleClose} selectedMember={selectedMember} members={fields} append={append} update={update} />
            <OpenDisplayOpportunities open={openDisplayOpportunities} handleClose={handleCloseModelDisplayOpportunities} selectedMember={selectedMember} />
            <OpenAssignOpportunities open={openAssignOpportunities} handleClose={handleCloseAssignOpportunities} selectedMember={selectedMember} members={fields} append={append} update={update} />
        </div>
    )
}

const mapDispatchToProps = {
    setAlert,
};

export default connect(null, mapDispatchToProps)(AddTeamMembers)