import { StepConnector, styled } from '@mui/material';
import CustomIcons from '../icons/CustomIcons';
import Components from '../../muiComponents/components';

export default function Stapper({ steps, activeStep, orientation = "vertical", labelFontSize, width = null }) {

  const CustomStepIconRoot = styled('div')(({ theme, ownerState }) => ({
    backgroundColor: ownerState.completed ? theme.palette.secondary.main : '',
    zIndex: 1,
    color: '#fff',
    width: 24,
    height: 24,
    display: 'flex',
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: ownerState.active ? 6 : 4,
    borderColor: ownerState.completed ? theme.palette.secondary.main : ownerState.active ? theme.palette.secondary.main : '#E0E7FF',
  }));

  function CustomStepIcon(props) {
    const { active, completed, icon, className } = props;

    return (
      <CustomStepIconRoot ownerState={{ completed, active }} className={className}>
        {completed ? (
          <CustomIcons iconName="fa-solid fa-check" css="cursor-pointer text-xs" />
        ) : active ? (
          <div className="w-2 h-2 bg-white rounded-full" />
        ) : (
          <span style={{ fontSize: 12, color: "#000000", fontWeight: 800 }}>{icon}</span>
        )}
      </CustomStepIconRoot>
    );
  }


  const CustomConnector = styled(StepConnector)(({ theme }) => ({
    [`&.MuiStepConnector-root`]: {
      marginLeft: orientation !== "horizontal" ? 11 : 0,
    },
    [`& .MuiStepConnector-line`]: {
      borderWidth: orientation !== "horizontal" ? 0 : 1,
      borderLeftWidth: orientation !== "horizontal" ? 3 : 0,
      minHeight: orientation !== "horizontal" ? 1 : 1,
      transition: 'border-color 0.3s ease',
      borderColor: '#E0E7FF',
    },
    // When the step is active
    [`&.Mui-active .MuiStepConnector-line`]: {
      borderColor: theme.palette.secondary.main,
    },
    // When the step is completed
    [`&.Mui-completed .MuiStepConnector-line`]: {
      borderColor: theme.palette.secondary.main,
    },
  }));

  return (
    <Components.Box sx={{ width: { sm: width !== null ? width : '100%' } }}>
      <Components.Stepper
        activeStep={activeStep}
        orientation="horizontal"
        alternativeLabel
        connector={<CustomConnector />}
      >
        {steps?.map((label, index) => (
          <Components.Step key={index}>
            <Components.StepLabel
              StepIconComponent={CustomStepIcon}
              sx={{
                '& .MuiStepLabel-label': {
                  whiteSpace: 'normal',
                  textAlign: 'center',
                  lineHeight: 1.3,
                  fontSize: labelFontSize || '14px',
                  fontFamily: '"Inter", sans-serif',
                  // color & weight by state
                  color: (theme) =>
                    activeStep >= index ? theme.palette.text.primary : theme.palette.text.disabled,
                  fontWeight: activeStep === index ? 700 : (activeStep > index ? 700 : 500),
                },
                // optional: add a bit of space below the icon like in your image
                // '& .MuiStepLabel-iconContainer': { marginBottom: 8 },
              }}
            >
              {label}
            </Components.StepLabel>

          </Components.Step>
        ))}
      </Components.Stepper>
    </Components.Box >
  );
}
