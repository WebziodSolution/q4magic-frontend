import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { Controller, useForm } from 'react-hook-form';

import Components from '../../muiComponents/components';
import Button from '../../common/buttons/button';
import CustomIcons from '../../common/icons/CustomIcons';
import { getAllOpportunities } from '../../../service/opportunities/opportunitiesService';
import CheckBoxSelect from '../../common/select/checkBoxSelect';
import { getTeamDetails } from '../../../service/teamDetails/teamDetailsService';
import { assignOpportunitiesToTeamMember } from '../../../service/teamMembers/teamMembersService';
import { connect } from 'react-redux';
import { setAlert } from '../../../redux/commonReducers/commonReducers';
import { handleRequestClose } from '../../../service/common/commonService';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

function AssignTeamOpportunities({ setAlert, open, handleClose, teamId }) {
  const theme = useTheme()

  const [opportunities, setOpportunities] = useState([]);

  const {
    handleSubmit,
    control,
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      opportunities: null,
    },
  });

  const onClose = () => {
    reset({
      opportunities: null,
    });
    handleClose();
  };

  const handleGetDetails = async () => {
    if (teamId && open) {
      const res = await getTeamDetails(teamId);
      if (res?.status === 200) {
        setValue("opportunities", res.result.assignedOpportunities ? JSON.parse(res.result.assignedOpportunities) : []);
      }
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
    handleGetAllOpportunities();
    handleGetDetails();
  }, [open])

  const submit = async (data) => {
    const res = await assignOpportunitiesToTeamMember(teamId, data.opportunities);
    if (res.status === 200) {
      setOpportunities([]);
      onClose();
    } else {
      setAlert({
        open: true,
        message: res?.message || "Failed to assign opportunities",
        type: "error"
      })
    }

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
          Assign Opportunities To Team
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
              <div className='grid grid-cols-1 gap-[30px]'>
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
                          placeholder="Select opportunities"
                          value={selectedOptions}
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
              <Button type={`submit`} text={"Assign"} endIcon={<CustomIcons iconName={'fa-solid fa-floppy-disk'} css='cursor-pointer' />} />
              <Button type="button" text={"Cancel"} useFor='disabled' onClick={() => onClose()} startIcon={<CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer mr-2' />} />
            </div>
          </Components.DialogActions>
        </form>
      </BootstrapDialog>
    </React.Fragment>
  );
}

const mapDispatchToProps = {
  setAlert,
};

export default connect(null, mapDispatchToProps)(AssignTeamOpportunities);