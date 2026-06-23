import React, { useEffect } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { Controller, useForm } from 'react-hook-form';

import Components from '../../muiComponents/components';
import Button from '../../common/buttons/button';
import CustomIcons from '../../common/icons/CustomIcons';
import Select from '../../common/select/select';
import { createQuota, getQuota, updateQuota } from '../../../service/customerQuota/customerQuotaService';
import Input from '../../common/input/input';
import { setAlert } from '../../../redux/commonReducers/commonReducers';
import { connect } from 'react-redux';
import { handleRequestClose } from '../../../service/common/commonService';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': { padding: theme.spacing(2) },
  '& .MuiDialogActions-root': { padding: theme.spacing(1) },
}));

const terms = [
  { id: 1, title: 'Annual (4 quarters)', kind: 'quarterly' },
  { id: 2, title: 'Semi-Annual (2 quarters)', kind: 'semi' },
  { id: 3, title: 'Monthly', kind: 'monthly' },
];

const TERM_COUNTS = {
  monthly: 12,
  quarterly: 4,
  semi: 2,
  annual: 1,
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function parseStartMonthIndex(startEvalPeriod) {
  try {
    if (!startEvalPeriod) return 0;
    const datePart = String(startEvalPeriod).split(',')[0]?.trim();
    const mm = parseInt((datePart || '').split('/')[0], 10);
    if (Number.isFinite(mm) && mm >= 1 && mm <= 12) return mm - 1;
    return 0;
  } catch {
    return 0;
  }
}

function monthName(idx) { return MONTHS[(idx + 12) % 12]; }

function monthSpanLabel(startIdx, len) {
  const s = monthName(startIdx);
  const e = monthName(startIdx + len - 1);
  return `${s}–${e}`;
}

function buildLabelsForKind(kind, startMonthIndex) {
  switch (kind) {
    case 'monthly':
      return Array.from({ length: 12 }, (_, i) => monthName(startMonthIndex + i));
    case 'quarterly': {
      const starts = [0, 3, 6, 9].map(o => (startMonthIndex + o) % 12);
      return starts.map((s, i) => `Q${i + 1} (${monthSpanLabel(s, 3)})`);
    }
    case 'semi': {
      const h1 = monthSpanLabel(startMonthIndex, 6);
      const h2 = monthSpanLabel(startMonthIndex + 6, 6);
      return [`(${h1})`, `(${h2})`];
    }
    case 'annual': {
      const full = monthSpanLabel(startMonthIndex, 12);
      return [`Annual (${full})`];
    }
    default:
      return [];
  }
}

function AddQuotaModel({ setAlert, open, handleClose, customerId, id, handleGetAllQuota, startEvalPeriod, endEvalPeriod }) {
  const theme = useTheme();

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
      quota: '',
      term: '',
      amount1: '',
      amount2: '',
      amount3: '',
      amount4: '',
      amount5: '',
      amount6: '',
      amount7: '',
      amount8: '',
      amount9: '',
      amount10: '',
      amount11: '',
      amount12: '',
    },
  });

  const onClose = () => {
    reset({
      id: null,
      quota: '',
      term: '',
      amount1: '',
      amount2: '',
      amount3: '',
      amount4: '',
      amount5: '',
      amount6: '',
      amount7: '',
      amount8: '',
      amount9: '',
      amount10: '',
      amount11: '',
      amount12: '',
    });
    handleClose();
  };

  // =========================
  // ✅ INTEGER ONLY HELPERS
  // =========================

  // keep only digits
  const sanitizeInt = (val) => {
    if (val === null || val === undefined) return '';
    return String(val).replace(/\D/g, '');
  };

  // format digits with commas
  const formatIntWithCommas = (val) => {
    const digits = sanitizeInt(val);
    if (!digits) return '';
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // parse as integer
  const parseIntSafe = (val) => {
    const digits = sanitizeInt(String(val ?? '').replace(/,/g, ''));
    return digits ? parseInt(digits, 10) : 0;
  };

  // shared onChange for integer-only money fields with caret support
  const handleIntegerInputChange = (field, e) => {
    const target = e.target;
    const rawInput = target.value;
    const caretPos = target.selectionStart ?? rawInput.length;

    // digits count before caret (ignoring commas/non-digits)
    const digitsBeforeCaret = sanitizeInt(rawInput.slice(0, caretPos)).length;

    // cleaned + formatted full value
    const cleanedFull = sanitizeInt(rawInput);
    const formattedFull = formatIntWithCommas(cleanedFull);

    field.onChange(formattedFull);

    requestAnimationFrame(() => {
      try {
        // place caret after same digit count
        let pos = 0;
        let seen = 0;
        while (pos < formattedFull.length && seen < digitsBeforeCaret) {
          if (/\d/.test(formattedFull[pos])) seen++;
          pos++;
        }
        target.setSelectionRange(pos, pos);
      } catch (err) { }
    });
  };

  const handleGetQuotaLocal = async () => {
    if (open && id) {
      const response = await getQuota(id);
      if (response?.result) {
        const r = response.result;

        setValue('quotaId', r?.id || '');

        const termData = terms.find(item => item.title === r?.term);
        setValue('term', termData?.id || '');

        // ✅ show integer only (round if API sends float)
        setValue('quota', r?.quota != null ? formatIntWithCommas(Math.round(Number(r.quota))) : '');

        for (let i = 1; i <= 12; i++) {
          const key = `amount${i}`;
          const rawAmount = r?.[key];
          setValue(key, rawAmount != null ? formatIntWithCommas(Math.round(Number(rawAmount))) : '');
        }
      }
    }
  };

  useEffect(() => {
    handleGetQuotaLocal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ✅ AUTO-CALCULATE AMOUNTS based on Quota & Period
  useEffect(() => {
    const termId = parseInt(watch('term'));
    const quotaVal = parseIntSafe(watch('quota'));

    if (termId && quotaVal > 0) {
      const selectedTermData = terms.find(t => t.id === termId);
      if (selectedTermData) {
        const kind = selectedTermData.kind;
        const count = TERM_COUNTS[kind] || 0;
        if (count > 0) {
          const distributedAmount = Math.floor(quotaVal / count);
          const formattedAmount = formatIntWithCommas(distributedAmount);

          for (let i = 1; i <= 12; i++) {
            const fieldName = `amount${i}`;
            if (i <= count) {
              setValue(fieldName, formattedAmount, { shouldDirty: true });
            } else {
              setValue(fieldName, '', { shouldDirty: true });
            }
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch('term'), watch('quota')]);

  const submit = async () => {
    const selectedTerm = terms.find(t => t.id === parseInt(watch('term')));
    if (!selectedTerm || !watch("quota")) return;

    const getInt = (name) => parseIntSafe(watch(name)); // ✅ integer only

    const quotaData = {
      id: id,
      quota: getInt("quota"),
      term: selectedTerm.title,
      amount1: getInt("amount1"),
      amount2: getInt("amount2"),
      amount3: getInt("amount3"),
      amount4: getInt("amount4"),
      amount5: getInt("amount5"),
      amount6: getInt("amount6"),
      amount7: getInt("amount7"),
      amount8: getInt("amount8"),
      amount9: getInt("amount9"),
      amount10: getInt("amount10"),
      amount11: getInt("amount11"),
      amount12: getInt("amount12"),
      customerId: customerId,
    };

    if (id) {
      const response = await updateQuota(id, quotaData);
      if (response?.status === 200) {
        handleGetAllQuota();
        onClose();
      } else {
        setAlert({
          open: true,
          type: "error",
          message: response?.data?.message || "An error occurred",
        });
      }
    } else {
      const response = await createQuota(quotaData);
      if (response?.status === 201) {
        handleGetAllQuota();
        onClose();
      } else {
        setAlert({
          open: true,
          type: "error",
          message: response?.data?.message || "An error occurred",
        });
      }
    }
  };

  const selectedTerm = terms?.find(t => t.id === parseInt(watch('term')));

  const currentQuota = parseIntSafe(watch('quota'));
  const count = selectedTerm ? TERM_COUNTS[selectedTerm.kind] : 0;

  let totalAllocated = 0;
  for (let i = 1; i <= count; i++) {
    totalAllocated += parseIntSafe(watch(`amount${i}`));
  }
  const isMismatch = currentQuota > 0 && count > 0 && totalAllocated !== currentQuota;

  return (
    <React.Fragment>
      <BootstrapDialog onClose={(event, reason) => handleRequestClose(event, reason, onClose)} open={open} aria-labelledby="customized-dialog-title" fullWidth maxWidth="md">
        <Components.DialogTitle sx={{ m: 0, p: 2, color: theme.palette.text.primary }} id="customized-dialog-title">
          {id ? 'Update' : 'Add'} Quota
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
          <CustomIcons iconName={'fa-solid fa-xmark'} css="cursor-pointer text-black w-5 h-5" />
        </Components.IconButton>

        <form noValidate onSubmit={handleSubmit(submit)}>
          <Components.DialogContent dividers>
            <div className='px-[30px]'>
              <div className="grid gap-[30px]">

                <div>
                  <Controller
                    name="term"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select
                        options={terms}
                        label="Period"
                        requiredFiledLabel={true}
                        placeholder="Select period"
                        value={parseInt(watch('term')) || null}
                        onChange={(_, newValue) => {
                          for (let i = 1; i <= 12; i++) setValue(`amount${i}`, null, { shouldDirty: true });
                          field.onChange(newValue?.id || null);
                        }}
                        error={errors.term}
                      />
                    )}
                  />
                </div>

                <div>
                  <Controller
                    name="quota"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Quota"
                        type="text"
                        requiredFiledLabel={true}
                        inputMode="numeric"
                        onChange={(e) => handleIntegerInputChange(field, e)}
                        error={errors?.quota}
                        startIcon={
                          <CustomIcons
                            iconName={"fa-solid fa-dollar-sign"}
                            css={"text-lg text-black mr-2"}
                          />
                        }
                      />
                    )}
                  />
                </div>

                <div className='grid md:grid-cols-2 gap-4'>
                  {(() => {
                    if (!selectedTerm) return null;
                    const startMonthIndex = parseStartMonthIndex(startEvalPeriod);
                    const kind = terms.find(t => t.id === parseInt(watch('term')))?.kind;
                    const count = TERM_COUNTS[kind] || 0;
                    const labels = buildLabelsForKind(kind, startMonthIndex).slice(0, count);

                    return (
                      <>
                        {Array.from({ length: count }, (_, i) => {
                          const n = i + 1;
                          const fieldName = `amount${n}`;
                          const labelText = `${labels[i]} Amount` || `Amount ${n}`;

                          return (
                            <div key={fieldName}>
                              <Controller
                                name={fieldName}
                                control={control}
                                rules={{ required: watch('term') ? `${labelText} is required` : false }}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    label={`${labelText}`}
                                    type="text"
                                    requiredFiledLabel={watch('term') ? true : false}
                                    inputMode="numeric"
                                    onChange={(e) => handleIntegerInputChange(field, e)}
                                    error={errors?.[fieldName]}
                                    startIcon={
                                      <CustomIcons
                                        iconName={"fa-solid fa-dollar-sign"}
                                        css={"text-lg text-black mr-2"}
                                      />
                                    }
                                  />
                                )}
                              />
                            </div>
                          );
                        })}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </Components.DialogContent>

          <Components.DialogActions>
            <div className={`flex w-full ${isMismatch ? 'justify-between' : 'justify-end'} items-center gap-4 px-[30px]`}>
              {
                isMismatch && (
                  <div className="flex items-center gap-2 text-red-500">
                    <CustomIcons iconName="fa-solid fa-triangle-exclamation" css="text-red-500" />
                    <span className="text-sm font-semibold">
                      The sum of period amounts (${formatIntWithCommas(totalAllocated)}) does not match the total quota (${watch('quota') || '0'}). Please adjust manually.
                    </span>
                  </div>
                )
              }

              <div className="flex items-center gap-4">
                <Button type="submit" disabled={isMismatch} text={id ? 'Update' : 'Submit'} endIcon={<CustomIcons iconName={'fa-solid fa-floppy-disk'} css='cursor-pointer' />} />
                <Button type="button" text={'Cancel'} useFor="disabled" onClick={onClose} startIcon={<CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer mr-2' />} />
              </div>
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

export default connect(null, mapDispatchToProps)(AddQuotaModel);