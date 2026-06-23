import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { Controller, useForm } from 'react-hook-form';

import Components from '../../muiComponents/components';
import Button from '../../common/buttons/button';
import CustomIcons from '../../common/icons/CustomIcons';
import Select from '../../common/select/select';
import { getAllSubUsers } from '../../../service/customers/customersService';
import { getAllOpportunities } from '../../../service/opportunities/opportunitiesService';
import CheckBoxSelect from '../../common/select/checkBoxSelect';
import { handleRequestClose } from '../../../service/common/commonService';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

function AddTeamMemberModel({ open, handleClose, selectedMember, members, append, update }) {
    const theme = useTheme()

    const [customers, setCustomers] = useState([]);
    const [opportunities, setOpportunities] = useState([]);

    const {
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            teamMemberId: null,
            memberId: null,
            memberName: null,
            opportunities: null,
            role: null,
            assignMemberName: null,
        },
    });

    const onClose = () => {
        reset({
            teamMemberId: null,
            memberId: null,
            memberName: null,
            opportunities: null,
            role: null,
            assignMemberName: null,
        });
        handleClose();
    };

    const handleGetAllCustomers = async () => {
        if (open) {
            const res = await getAllSubUsers()
            const data = res?.data?.result?.map((item) => {
                return {
                    id: item.id,
                    title: item.username || item.name,
                    role: item.subUserTypeDto?.name || ''
                }
            })
            setCustomers(data)
        }
    }

    const handleGetAllOpportunities = async () => {
        if (open) {
            const res = await getAllOpportunities()
            const data = res?.result?.map((item) => {
                return {
                    id: item.id,
                    title: item.opportunity
                }
            })
            setOpportunities(data)
        }
    }

    useEffect(() => {
        handleGetAllCustomers();
        handleGetAllOpportunities();
    }, [open])

    useEffect(() => {
        if (selectedMember && open) {
            setValue("teamMemberId", selectedMember.teamMemberId || null);
            setValue("memberId", selectedMember.memberId || null);
            setValue("memberName", selectedMember.memberName || null);
            setValue("role", selectedMember.role || null);
            setValue("opportunities", selectedMember.opportunities || []);
            setValue("assignMemberName", selectedMember.assignMemberName || null);
        }
    }, [selectedMember])

    const submit = async (data) => {
        if (selectedMember) {
            // Update existing member - find the index and update
            const index = members.findIndex(field =>
                field.teamMemberId === selectedMember.teamMemberId
            );

            if (index !== -1 && update) {
                update(index, {
                    teamMemberId: selectedMember.teamMemberId,
                    memberId: data.memberId,
                    memberName: data.memberName,
                    role: data.role,
                    opportunities: data.opportunities
                });
            }
        } else {
            append({
                memberId: data.memberId,
                memberName: data.memberName,
                opportunities: data.opportunities,
                role: data.role
            });
        }
        onClose();
    }

    return (
        <React.Fragment>
            <BootstrapDialog
                onClose={(event, reason) => handleRequestClose(event, reason, onClose)}
                open={open}
                aria-labelledby="customized-dialog-title"
                fullWidth
                maxWidth='md'
            >
                <Components.DialogTitle sx={{ m: 0, p: 2, color: theme.palette.text.primary }} id="customized-dialog-title">
                    {selectedMember ? "Update" : "Add"} Member
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
                    <CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer text-black w-5 h-5' />
                </Components.IconButton>

                <form noValidate onSubmit={handleSubmit(submit)}>
                    <Components.DialogContent dividers>
                        <div className='px-[30px]'>
                            <div className='grid gap-[30px]'>
                                <div>
                                    <Controller
                                        name="memberId"
                                        control={control}
                                        rules={{
                                            required: "Member is required"
                                        }}
                                        render={({ field }) => (
                                            <Select
                                                options={customers}
                                                label={"Member"}
                                                placeholder="Select member"
                                                requiredFiledLabel={true}
                                                value={parseInt(watch("memberId")) || null}
                                                onChange={(_, newValue) => {
                                                    if (newValue?.id) {
                                                        field.onChange(newValue.id);
                                                        setValue("memberName", newValue.title);
                                                        setValue("role", newValue.role);
                                                    } else {
                                                        setValue("memberId", null);
                                                        setValue("memberName", '');
                                                        setValue("role", '');
                                                    }
                                                }}
                                                error={errors?.memberId}
                                            />
                                        )}
                                    />
                                </div>
                                <div>
                                    <Controller
                                        name="opportunities"
                                        control={control}
                                        render={({ field }) => {
                                            const selectedOptions = opportunities.filter((opp) =>
                                                (field.value || []).includes(opp.id)
                                            );
                                            return (
                                                <CheckBoxSelect
                                                    options={opportunities}
                                                    label="Opportunities"
                                                    value={selectedOptions}
                                                    placeholder="Select opportunities"
                                                    onChange={(event, newValue) => {
                                                        const newIds = newValue.map((opt) => opt.id);
                                                        field.onChange(newIds);
                                                    }}
                                                    checkAll={true}
                                                />
                                            );
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </Components.DialogContent>

                    <Components.DialogActions>
                        <div className='flex justify-end items-center gap-4'>
                            <Button type={`submit`} text={selectedMember ? "Update" : "Submit"} endIcon={<CustomIcons iconName={'fa-solid fa-floppy-disk'} css='cursor-pointer' />} />
                            <Button type="button" text={"Cancel"} useFor='disabled' onClick={() => onClose()} startIcon={<CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer mr-2' />} />
                        </div>
                    </Components.DialogActions>
                </form>
            </BootstrapDialog>
        </React.Fragment>
    );
}

export default AddTeamMemberModel;