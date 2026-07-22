import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { Controller, useForm } from 'react-hook-form';
import { connect } from 'react-redux';

import { Editor } from 'react-draft-wysiwyg';
import { EditorState, ContentState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import '../../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

import { DatePicker, LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import ModalRepeat from './modalRepeat';
import Components from '../../../components/muiComponents/components';
import Button from '../../../components/common/buttons/button';
import Input from '../../../components/common/input/input';
import { setAlert } from '../../../redux/commonReducers/commonReducers';
import CustomIcons from '../../../components/common/icons/CustomIcons';
import { getTimeZones } from '../../../service/timeZones/timeZoneService';
import Checkbox from '../../common/checkBox/checkbox';
import Select from '../../common/select/select';
import { convertAsiaKolkata, dateTimeFormatDB, handleRequestClose, userTimeZone } from '../../../service/common/commonService';
import { getEventById, saveEvents } from '../../../service/calendar/calendarService';
import DeleteEventAlert from './deleteEventAlert';
import { useLocation, useParams } from 'react-router-dom';
import { getAllOpportunitiesContact } from '../../../service/opportunities/opportunitiesContactService';
import SelectMultiple from '../../common/select/selectMultiple';
import { Autocomplete, Chip, TextField } from '@mui/material';
import { getUserDetails } from '../../../utils/getUserDetails';
import { getCustomer } from '../../../service/customers/customersService';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': { padding: theme.spacing(2) },
    '& .MuiDialogActions-root': { padding: theme.spacing(1) },
}));

const toolbarProperties = {
    options: ['inline', 'list', 'link', 'history'],
    inline: { options: ['bold', 'italic', 'underline', 'strikethrough'] },
    list: { options: ['unordered', 'ordered'] },
};

const repeatList = [
    { id: 1, title: "Don't repeat", value: 'donotrepeat' },
    { id: 2, title: 'Daily', value: 'day' },
    { id: 3, title: 'Weekly', value: 'week' },
    { id: 4, title: 'Monthly', value: 'month' },
    { id: 5, title: 'Yearly', value: 'year' },
    { id: 6, title: "Custom", value: "custom" }
];

// ---------- helpers for repeat JSON text ----------
const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December',
];

const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const ordinalWord = (n) => {
    if (n === 1) return 'first';
    if (n === 2) return 'second';
    if (n === 3) return 'third';
    if (n === 4) return 'fourth';
    if (n === 5) return 'fifth';
    return `${n}th`;
};

const getWeekNoInMonthForDate = (d) => {
    // nth occurrence of weekday in that month
    const date = dayjs(d);
    const weekday = date.day(); // 0..6
    let count = 0;
    const firstDay = date.startOf('month');
    const lastDay = date.endOf('month');
    let cursor = firstDay;

    while (cursor.isBefore(lastDay) || cursor.isSame(lastDay, 'day')) {
        if (cursor.day() === weekday) {
            count += 1;
            if (cursor.isSame(date, 'day')) return count;
        }
        cursor = cursor.add(1, 'day');
    }
    return 1;
};

const buildOccursText = ({ unit, every, startDate, selectedDays }) => {
    const d = dayjs(startDate);
    const m = monthNames[d.month()];
    const dayNum = d.date();

    if (unit === 'day') {
        return every > 1 ? `Occurs every ${every} days` : 'Occurs every day';
    }
    if (unit === 'week') {
        if (selectedDays?.length) {
            const names = selectedDays
                .map((id) => weekDays[(id - 1) % 7])
                .join(', ');
            return every > 1 ? `Occurs every ${every} weeks on ${names}` : `Occurs every week on ${names}`;
        }
        return every > 1 ? `Occurs every ${every} weeks` : 'Occurs every week';
    }
    if (unit === 'month') {
        return `Occurs every month on ${dayNum}`;
    }
    if (unit === 'year') {
        return `Occurs every ${m} ${dayNum}`;
    }
    return '';
};

const isToday = (d) => d && dayjs(d).isSame(dayjs(), 'day');
const isSameDay = (a, b) => a && b && dayjs(a).isSame(dayjs(b), 'day');

const formatEnd = (end) => {
    if (!end) return null;
    // Subtract one day, set time to 08:30, and return as dayjs
    return dayjs(end).subtract(1, 'day').hour(8).minute(30).second(0);
};
const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(/^[^\s@]+@([^\s@]+\.)+[^\s@]+$/);
};
function AddEventModel({ setAlert, open, handleClose, slotInfo, handleGetAllEvents, thirdPartyCalendar, currentView }) {
    const theme = useTheme();
    const userDetails = getUserDetails()
    const location = useLocation()
    const { opportunityId } = useParams()
    const [contacts, setContacts] = useState([]);
    const [contactsIds, setContactsIds] = useState([]);
    const [emailInputValue, setEmailInputValue] = useState('');

    const [openRepeat, setOpenRepeat] = useState(false);
    const [editAll, setEditAll] = useState(false);

    const [loading, setLoading] = useState(false);
    const [timeZones, setTimeZones] = useState([]);
    const [editorState, setEditorState] = useState(EditorState.createEmpty());
    const [openDeleteAlert, setOpenDeleteAlert] = useState(false);
    const [deleteAll, setDeleteAll] = useState(null)

    const {
        handleSubmit,
        control,
        reset,
        setValue,
        watch,
        getValues,
        formState: { errors },
    } = useForm({
        defaultValues: {
            id: null,
            meetingId: null,
            customerId: null,
            title: null,
            description: null,
            start: null,
            end: null,
            allDay: false,
            calTimeZone: null,
            calAttendees: null,
            slotMember: null,
            calAetId: null,

            slotTimeMinus: null,
            contactList: null,

            displayStart: null,
            displayEnd: null,

            calType: null,
            currentDateYN: null,
            memTimeZone: null,

            calEventReminder: null,
            calReminderSubject: null,
            calReminderType: null,
            calMyPageId: null,
            calSmsSstId: null,
            calScheduleDateTime: null,

            calParentId: 0,
            calRepeatEvery: null,
            calRepeatType: 1, // stores repeatList.id
            calRepeatEveryType: null, // day|week|month|year
            calRepeatDayName: null, // "1,3,5"
            calRepeatEndDate: null, // dayjs
            calRepeatDate: null, // datetime string for month/year
            calRepeatSelectedOption: 1,

            // extra keys you want in JSON
            weekNo: null,
            calRepeatSelectedOptionTextOne: null,
            calRepeatSelectedOptionTextTwo: null,
            calRepeatSelectedOptionTextThree: null,
            occours: null,
            outOccours: null,

            editAll: null,
        },
    });

    const onClose = () => {
        setTimeZones([]);
        setEditAll(false);
        setLoading(false);
        reset();
        handleClose();
        setEditorState(EditorState.createEmpty())
    };

    const handleOpenDeleteAlert = (value) => {
        setDeleteAll(value);
        setOpenDeleteAlert(true);
    }

    const handleCloseDeleteAlert = () => {
        setOpenDeleteAlert(false)
        onClose()
    };

    const handleCloseRepeatModel = () => {
        setValue("calRepeatType", 1)
        setOpenRepeat(false);
    }

    const handleCloseRepeatModelOnSave = () => setOpenRepeat(false);

    const handleGetAllTimeZones = async () => {
        const res = await getTimeZones();
        if (res.result) {
            const data = res?.result?.map((item) => ({
                id: item.tmzId,
                title: item.tmzTitle,
                value: item.tmzValue,
            }));
            setTimeZones(data);
            if (slotInfo?.id) {
                setValue('calTimeZone', data?.find((row) => row.value === convertAsiaKolkata(watch("calTimeZone")))?.id || null);
            } else {
                if (userDetails?.userId) {
                    const res = await getCustomer(userDetails?.userId)
                    if (res?.data?.result) {
                        if (res?.data?.result?.webConference) {
                            const contentBlock = htmlToDraft(res?.data?.result?.webConference);
                            const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
                            setEditorState(EditorState.createWithContent(contentState));
                            setValue("description", res?.data?.result?.webConference)
                        } else {
                            setEditorState(EditorState.createEmpty());
                            setValue("description", "")
                        }
                        if (res?.data?.result?.timeZone) {
                            setValue('calTimeZone', data?.find((row) => row.value === convertAsiaKolkata(res?.data?.result?.timeZone))?.id || null);
                        } else {
                            setValue('calTimeZone', data?.find((row) => row.value === convertAsiaKolkata(userTimeZone))?.id || null);
                        }
                    }
                }
            }
        }
    };

    const findRepeatTypeIdFromApi = (apiVal) => {
        if (!apiVal) return 1;
        const v = String(apiVal).toLowerCase();
        const byValue = repeatList.find((r) => String(r.value).toLowerCase() === v);
        if (byValue) return byValue.id;
        const byTitle = repeatList.find((r) => String(r.title).toLowerCase() === v);
        if (byTitle) return byTitle.id;
        return 1;
    };

    const handleGetEvent = async () => {
        if (open && slotInfo?.id) {
            const res = await getEventById(userTimeZone, slotInfo.id);

            if (res?.status === 200 && res?.result?.event) {
                const event = res.result.event;
                setEditAll(true);

                const start = event.start ? dayjs(event.start, 'MM/DD/YYYY HH:mm:ss') : null;
                const end = event.end ? dayjs(event.end, 'MM/DD/YYYY HH:mm:ss') : null;

                // console.log("event.calTimeZone",event.calTimeZone)
                setContactsIds((event?.contactIds !== null || event?.contactIds !== "") ? JSON.parse(event?.contactIds) : [])
                setValue('id', event.id);
                setValue('meetingId', event.meetingId);

                setValue('title', event.title);
                setValue('allDay', !!event.allDay);
                setValue('start', start);
                setValue('end', end);
                setValue("calTimeZone", convertAsiaKolkata(event.calTimeZone))
                let attendeesArray = [];
                if (event.calAttendees) {
                    try {
                        const parsed = JSON.parse(event.calAttendees);
                        // If it's an object with an 'attendees' property (like your old format), extract it
                        attendeesArray = Array.isArray(parsed) ? parsed : parsed?.attendees || [];
                    } catch {
                        attendeesArray = [];
                    }
                }
                setValue('calAttendees', attendeesArray);
                setValue('calAetId', event.calAetId ?? null);

                setValue('calParentId', event.calParentId ?? 0);
                setValue('calRepeatEvery', event.calRepeatEvery ?? null);

                // API may return "Yearly" or "year"
                setValue('calRepeatType', findRepeatTypeIdFromApi(event.calRepeatType));

                setValue('calRepeatEveryType', event.calRepeatEveryType ?? null);
                setValue('calRepeatDayName', event.calRepeatDayName ?? null);

                setValue('calRepeatEndDate', event.calRepeatEndDate ? dayjs(event.calRepeatEndDate, 'MM/DD/YYYY HH:mm:ss') : null);

                setValue('calRepeatDate', event.calRepeatDate ?? null);
                setValue('calRepeatSelectedOption', event.calRepeatSelectedOption ?? 1);

                // description (HTML → EditorState)
                if (event.description) {
                    const contentBlock = htmlToDraft(event.description);
                    const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
                    setEditorState(EditorState.createWithContent(contentState));
                } else {
                    setEditorState(EditorState.createEmpty());
                }
            } else {
                if (currentView === "month") {
                    setValue('start', dayjs(slotInfo?.start).hour(8).minute(0).second(0));
                    setValue('end', formatEnd(slotInfo?.end));
                } else {
                    setValue('start', dayjs(slotInfo?.start));
                    setValue('end', dayjs(slotInfo?.end));
                }
            }
        } else {
            if (currentView === "month") {
                setValue('start', dayjs(slotInfo?.start).hour(8).minute(0).second(0));
                setValue('end', formatEnd(slotInfo?.end));
            } else {
                setValue('start', dayjs(slotInfo?.start));
                setValue('end', dayjs(slotInfo?.end));
            }

        }
    };

    const handleGetAllOpportunitiesContact = async () => {
        if (open && opportunityId) {
            const res = await getAllOpportunitiesContact(opportunityId);
            const data = res?.result?.map((item) => ({
                id: item.contactId,
                title: item.contactName,
                role: item.role,
                contactTitle: item.role,
            })) || [];
            setContacts(data);
        }
    }

    useEffect(() => {
        if (open) {
            handleGetEvent();
            handleGetAllTimeZones();
            handleGetAllOpportunitiesContact()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, slotInfo]);

    // When calRepeatType changes (Daily/Weekly/Monthly/Yearly), initialize repeat json defaults
    const applyRepeatDefaults = (repeatId) => {
        const r = repeatList.find((x) => x.id === repeatId);
        if (!r || r.id === 1) return;

        // defaults
        setValue('calRepeatEvery', watch('calRepeatEvery') || 1);
        setValue('calRepeatEveryType', r.value === 'custom' ? watch('calRepeatEveryType') : r.value); // day|week|month|year
        setValue('calRepeatSelectedOption', watch('calRepeatSelectedOption') || 1);

        // weekly default selected day from start date
        if (r.value === 'week') {
            const st = watch('start') ? dayjs(watch('start')) : dayjs();
            const dow = st.day(); // 0..6
            setValue('calRepeatDayName', `${dow + 1}`); // 1..7
        } else {
            setValue('calRepeatDayName', null);
        }

        // default repeat end date: +2 years (like your sample)
        const st = watch('start') ? dayjs(watch('start')) : dayjs();
        const end2y = st.add(2, 'year');
        if (!watch('calRepeatEndDate')) setValue('calRepeatEndDate', end2y);

        if (r.value === 'month' || r.value === 'year') {
            setValue('calRepeatDate', dateTimeFormatDB(st));
        } else {
            setValue('calRepeatDate', null);
        }
    };

    const computeRepeatExtraTexts = () => {
        const unit = watch('calRepeatEveryType'); // day|week|month|year
        const every = Number(watch('calRepeatEvery') || 1);
        const st = watch('start') ? dayjs(watch('start')) : null;
        if (!st) return;

        const mName = monthNames[st.month()];
        const dayNum = st.date();
        const weekdayName = weekDays[st.day()];
        const weekNo = getWeekNoInMonthForDate(st);

        setValue('weekNo', weekNo);

        // Texts (mainly meaningful for month/year like your example)
        setValue('calRepeatSelectedOptionTextOne', `On ${mName} ${dayNum}`);
        setValue('calRepeatSelectedOptionTextTwo', `On the ${ordinalWord(weekNo)} ${weekdayName} of ${mName}`);
        setValue('calRepeatSelectedOptionTextThree', `On the last ${weekdayName} of ${mName}`);

        const occ = buildOccursText({
            unit,
            every,
            startDate: st,
            selectedDays: watch('calRepeatDayName')
                ? String(watch('calRepeatDayName'))
                    .split(',')
                    .map((x) => parseInt(x, 10))
                    .filter((x) => !Number.isNaN(x))
                : [],
        });
        setValue('occours', occ);
        setValue('outOccours', occ);
    };

    // keep extra texts updated
    useEffect(() => {
        if (!open) return;
        computeRepeatExtraTexts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, watch('calRepeatEveryType'), watch('calRepeatEvery'), watch('calRepeatDayName'), watch('start')]);

    const submit = async () => {
        const allValues = getValues();

        const startStr = watch('start') ? dayjs(watch('start')).format('MM/DD/YYYY HH:mm:ss') : null;
        const endStr = watch('end') ? dayjs(watch('end')).format('MM/DD/YYYY HH:mm:ss') : null;

        const selectedRepeat = repeatList.find((r) => r.id === Number(watch('calRepeatType') || 1)) || repeatList[0];
        // slots (ISO)
        const slotIso = watch('start') ? dayjs(watch('start')).toDate().toISOString() : null;

        const attendeesStr =
            allValues?.calAttendees == null
                ? JSON.stringify({ attendees: [] })
                : typeof allValues.calAttendees === 'string'
                    ? allValues.calAttendees
                    : JSON.stringify(allValues.calAttendees);

        const payload = {
            ...allValues,

            oppId: (location?.pathname !== "/dashboard/calendar" && opportunityId) ? opportunityId : null,
            contactIds: contactsIds?.length > 0 ? JSON.stringify(contactsIds) : null,
            slots: slotIso ? [slotIso] : [],
            action: slotInfo?.action || 'click',

            contactList: Array.isArray(allValues?.contactList) ? allValues.contactList : [],
            calAttendees: attendeesStr,

            description: draftToHtml(convertToRaw(editorState.getCurrentContent())),

            start: startStr,
            end: endStr,

            calTimeZone: timeZones?.find((row) => row.id === parseInt(watch('calTimeZone')))?.value || null,

            // IMPORTANT: make calRepeatType like "Yearly" (your sample), not "year"
            calRepeatType: selectedRepeat?.value || null,

            // keep everyType like "year" (your sample)
            calRepeatEveryType: watch('calRepeatEveryType') || null,
            calRepeatEvery: watch('calRepeatEvery') ? Number(watch('calRepeatEvery')) : null,

            calRepeatDate: watch('calRepeatDate') || null,
            calRepeatSelectedOption: watch('calRepeatSelectedOption') || 1,

            calRepeatEndDate: watch('calRepeatEndDate') ? dayjs(watch('calRepeatEndDate')).format('MM/DD/YYYY HH:mm:ss') : null,

            // computed text keys
            weekNo: allValues.weekNo || null,
            calRepeatSelectedOptionTextOne: allValues.calRepeatSelectedOptionTextOne || null,
            calRepeatSelectedOptionTextTwo: allValues.calRepeatSelectedOptionTextTwo || null,
            calRepeatSelectedOptionTextThree: allValues.calRepeatSelectedOptionTextThree || null,
            occours: allValues.occours || null,
            outOccours: allValues.outOccours || null,

            // original editAll logic
            editAll: editAll && selectedRepeat?.id !== 1 ? 'Y' : 'N',
        };
        const res = await saveEvents(payload);
        if (res.status === 200) {
            setAlert({ open: true, message: res?.message, type: 'success' });
            handleGetAllEvents();
            onClose();
        } else {
            setAlert({ open: true, message: res?.message, type: 'error' });
        }
    };

    return (
        <React.Fragment>
            <BootstrapDialog onClose={(event, reason) => handleRequestClose(event, reason, onClose)} open={open} aria-labelledby="customized-dialog-title" fullWidth maxWidth="md">
                <Components.DialogTitle sx={{ m: 0, p: 2, color: theme.palette.text.primary }} id="customized-dialog-title">
                    {
                        location?.pathname === "/dashboard/calendar" ? (
                            watch('id') ? 'Update Meeting' : 'Add Meeting'
                        ) : (
                            watch('id') ? 'Update Meeting' : 'Add Meeting'
                        )
                    }
                </Components.DialogTitle>

                <Components.IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={() => ({
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
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <Controller
                                    name="title"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => <Input {...field} label="Title" type="text" error={errors.title} />}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Start Date"
                                        value={watch('start')}
                                        format="MM/DD/YYYY"
                                        onChange={(date) => setValue('start', date)}
                                        slotProps={{
                                            textField: {
                                                variant: 'outlined',
                                                size: 'small',
                                                fullWidth: true,
                                                sx: {
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '4px',
                                                        transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                                                        '& fieldset': { borderColor: theme.palette.secondary?.main },
                                                        '&:hover fieldset': { borderColor: theme.palette.secondary?.main },
                                                        '&.Mui-focused fieldset': { borderColor: theme.palette.secondary?.main },
                                                    },
                                                    '& .MuiInputLabel-root': { color: theme.palette.text.primary, textTransform: 'capitalize' },
                                                    '& .MuiInputLabel-root.Mui-focused': { color: theme.palette.text.primary },
                                                    '& .MuiInputBase-input': { color: theme.palette.text.primary },
                                                    '& .Mui-disabled': { color: theme.palette.text.primary },
                                                    '& .MuiFormHelperText-root': {
                                                        color: theme.palette.error.main,
                                                        fontSize: '14px',
                                                        fontWeight: '500',
                                                        marginX: 0.5,
                                                    },
                                                    fontFamily: '"Inter", sans-serif',
                                                },
                                            },
                                        }}
                                        minDate={dayjs()}
                                    />
                                </LocalizationProvider>

                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="End Date"
                                        value={watch('end')}
                                        format="MM/DD/YYYY"
                                        onChange={(date) => setValue('end', date)}
                                        slotProps={{
                                            textField: {
                                                variant: 'outlined',
                                                size: 'small',
                                                fullWidth: true,
                                                sx: {
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '4px',
                                                        transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                                                        '& fieldset': { borderColor: theme.palette.secondary?.main },
                                                        '&:hover fieldset': { borderColor: theme.palette.secondary?.main },
                                                        '&.Mui-focused fieldset': { borderColor: theme.palette.secondary?.main },
                                                    },
                                                    '& .MuiInputLabel-root': { color: theme.palette.text.primary, textTransform: 'capitalize' },
                                                    '& .MuiInputLabel-root.Mui-focused': { color: theme.palette.text.primary },
                                                    '& .MuiInputBase-input': { color: theme.palette.text.primary },
                                                    '& .Mui-disabled': { color: theme.palette.text.primary },
                                                    '& .MuiFormHelperText-root': {
                                                        color: theme.palette.error.main,
                                                        fontSize: '14px',
                                                        fontWeight: '500',
                                                        marginX: 0.5,
                                                    },
                                                    fontFamily: '"Inter", sans-serif',
                                                },
                                            },
                                        }}
                                        minDate={watch('start') || dayjs()}
                                    />
                                </LocalizationProvider>
                            </div>

                            <div className="w-24">
                                <Controller
                                    name="allDay"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox text={'All Day'} checked={!!field.value} onChange={(e) => setValue('allDay', e.target.checked)} />
                                    )}
                                />
                            </div>

                            {!watch('allDay') && (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Controller
                                            name="start"
                                            control={control}
                                            rules={{ required: true }}
                                            render={() => (
                                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                    <TimePicker
                                                        label="Start Time"
                                                        value={watch('start')}
                                                        onChange={(time) => setValue('start', time)}
                                                        minTime={isToday(watch('start')) ? dayjs() : undefined}
                                                        slotProps={{
                                                            textField: {
                                                                variant: 'outlined',
                                                                size: 'small',
                                                                fullWidth: true,
                                                                sx: {
                                                                    '& .MuiOutlinedInput-root': {
                                                                        borderRadius: '4px',
                                                                        transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                                                                        '& fieldset': { borderColor: theme.palette.secondary?.main },
                                                                        '&:hover fieldset': { borderColor: theme.palette.secondary?.main },
                                                                        '&.Mui-focused fieldset': { borderColor: theme.palette.secondary?.main },
                                                                    },
                                                                    '& .MuiInputLabel-root': { color: theme.palette.text.primary, textTransform: 'capitalize' },
                                                                    '& .MuiInputLabel-root.Mui-focused': { color: theme.palette.text.primary },
                                                                    '& .MuiInputBase-input': { color: theme.palette.text.primary },
                                                                    '& .Mui-disabled': { color: theme.palette.text.primary },
                                                                    '& .MuiFormHelperText-root': {
                                                                        color: theme.palette.error.main,
                                                                        fontSize: '14px',
                                                                        fontWeight: '500',
                                                                        marginX: 0.5,
                                                                    },
                                                                    fontFamily: '"Inter", sans-serif',
                                                                },
                                                            },
                                                        }}
                                                    />
                                                </LocalizationProvider>
                                            )}
                                        />

                                        <Controller
                                            name="end"
                                            control={control}
                                            rules={{ required: true }}
                                            render={() => (
                                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                    <TimePicker
                                                        label="End Time"
                                                        value={watch('end')}
                                                        onChange={(time) => setValue('end', time)}
                                                        minTime={
                                                            isSameDay(watch('start'), watch('end'))
                                                                ? watch('start')
                                                                : undefined
                                                        }
                                                        slotProps={{
                                                            textField: {
                                                                variant: 'outlined',
                                                                size: 'small',
                                                                fullWidth: true,
                                                                sx: {
                                                                    '& .MuiOutlinedInput-root': {
                                                                        borderRadius: '4px',
                                                                        transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                                                                        '& fieldset': { borderColor: theme.palette.secondary?.main },
                                                                        '&:hover fieldset': { borderColor: theme.palette.secondary?.main },
                                                                        '&.Mui-focused fieldset': { borderColor: theme.palette.secondary?.main },
                                                                    },
                                                                    '& .MuiInputLabel-root': { color: theme.palette.text.primary, textTransform: 'capitalize' },
                                                                    '& .MuiInputLabel-root.Mui-focused': { color: theme.palette.text.primary },
                                                                    '& .MuiInputBase-input': { color: theme.palette.text.primary },
                                                                    '& .Mui-disabled': { color: theme.palette.text.primary },
                                                                    '& .MuiFormHelperText-root': {
                                                                        color: theme.palette.error.main,
                                                                        fontSize: '14px',
                                                                        fontWeight: '500',
                                                                        marginX: 0.5,
                                                                    },
                                                                    fontFamily: '"Inter", sans-serif',
                                                                },
                                                            },
                                                        }}
                                                    />
                                                </LocalizationProvider>
                                            )}
                                        />
                                    </div>

                                    <Controller
                                        name="calTimeZone"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Select
                                                options={timeZones}
                                                label={'Time Zone'}
                                                placeholder="Select timezone"
                                                value={watch('calTimeZone') ? parseInt(watch('calTimeZone')) : null}
                                                onChange={(_, newValue) => {
                                                    if (newValue) {
                                                        field.onChange(newValue.id);
                                                    }
                                                }}
                                                error={errors?.calTimeZone}
                                            />
                                        )}
                                    />
                                </>
                            )}

                            <div>
                                <Controller
                                    name="calRepeatType"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <Select
                                            options={repeatList}
                                            label={'Repeat Type'}
                                            placeholder="Select repeat type"
                                            value={watch('calRepeatType') ? parseInt(watch('calRepeatType')) : null}
                                            onChange={(_, newValue) => {
                                                if (newValue?.id) {
                                                    field.onChange(newValue.id);

                                                    if (newValue.id === 1) {
                                                        // Don't repeat → clear
                                                        setValue('calRepeatEvery', null);
                                                        setValue('calRepeatEveryType', null);
                                                        setValue('calRepeatDayName', null);
                                                        setValue('calRepeatEndDate', null);
                                                        setValue('calRepeatDate', null);
                                                        setValue('calRepeatSelectedOption', 1);

                                                        setValue('weekNo', null);
                                                        setValue('calRepeatSelectedOptionTextOne', null);
                                                        setValue('calRepeatSelectedOptionTextTwo', null);
                                                        setValue('calRepeatSelectedOptionTextThree', null);
                                                        setValue('occours', null);
                                                        setValue('outOccours', null);
                                                    } else {
                                                        applyRepeatDefaults(newValue.id);
                                                        setOpenRepeat(true);
                                                    }
                                                } else {
                                                    setValue('calRepeatType', null);
                                                }
                                            }}
                                            onClick={(_, newValue) => {
                                                if (newValue.id !== 1) {
                                                    setOpenRepeat(true);
                                                }
                                            }}
                                            error={errors?.calRepeatType}
                                        />
                                    )}
                                />
                            </div>

                            {
                                opportunityId && (
                                    <div>
                                        <SelectMultiple
                                            placeholder="Select contacts"
                                            label="Guest List"
                                            options={contacts}
                                            value={contactsIds}
                                            onChange={setContactsIds}
                                        />
                                    </div>
                                )
                            }

                            <div className="editor-container-integrated">
                                <Editor
                                    editorState={editorState}
                                    wrapperClassName="editor-wrapper-custom"
                                    editorClassName="editor-main-custom"
                                    toolbarClassName="editor-toolbar-custom"
                                    onEditorStateChange={(state) => setEditorState(state)}
                                    toolbar={toolbarProperties}
                                />
                            </div>

                            {/* Guest Email(s) – multiple freeSolo emails */}
                            <div>
                                <p className="mb-2 text-black text-left">Guest Email(s)</p>
                                <Autocomplete
                                    multiple
                                    freeSolo
                                    options={[]}
                                    value={watch('calAttendees') || []}
                                    inputValue={emailInputValue}
                                    onInputChange={(_, newValue) => setEmailInputValue(newValue)}
                                    onChange={(_, newValue) => {
                                        setValue('calAttendees', newValue);
                                    }}
                                    renderTags={(value, getTagProps) =>
                                        value.map((option, index) => (
                                            <Chip
                                                label={option}
                                                {...getTagProps({ index })}
                                                onDelete={() => {
                                                    const newEmails = [...value];
                                                    newEmails.splice(index, 1);
                                                    setValue('calAttendees', newEmails);
                                                }}
                                            />
                                        ))
                                    }
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            variant="outlined"
                                            size="small"
                                            placeholder="Type email and press Enter"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    const currentInput = emailInputValue.trim();
                                                    if (currentInput && !validateEmail(currentInput)) {
                                                        e.preventDefault();  // prevent form submission
                                                        setAlert({ open: true, message: 'Invalid email address', type: 'error' });
                                                    } else if (currentInput && validateEmail(currentInput)) {
                                                        // email is valid – will be added by Autocomplete itself
                                                        setEmailInputValue('');
                                                    }
                                                }
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '4px',
                                                    '& fieldset': { borderColor: theme.palette.secondary.main },
                                                    '&:hover fieldset': { borderColor: theme.palette.secondary.main },
                                                    '&.Mui-focused fieldset': { borderColor: theme.palette.secondary.main },
                                                },
                                                '& .MuiInputBase-input': { color: theme.palette.text.primary },
                                                fontFamily: '"Inter", sans-serif',
                                            }}
                                        />
                                    )}
                                    componentsProps={{
                                        paper: {
                                            sx: {
                                                '& .MuiAutocomplete-option': {
                                                    padding: '0.5rem 1rem',
                                                    '&:hover': {
                                                        backgroundColor: `${theme.palette.custom.default2} !important`,
                                                    },
                                                },
                                            },
                                        },
                                    }}
                                />
                            </div>
                        </div>
                    </Components.DialogContent>

                    <Components.DialogActions>
                        <div className="flex justify-end items-center gap-4">
                            {
                                slotInfo?.id && (
                                    <Button
                                        type="button"
                                        text={'Delete'}
                                        isLoading={loading}
                                        onClick={() => handleOpenDeleteAlert("N")}
                                        endIcon={<CustomIcons iconName={'fa-solid fa-trash'} css="cursor-pointer" />}
                                    />
                                )
                            }
                            {editAll && Number(watch('calRepeatType') || 1) !== 1 && (
                                <Button
                                    type="button"
                                    text={'Delete All'}
                                    isLoading={loading}
                                    onClick={() => handleOpenDeleteAlert("Y")}
                                    endIcon={<CustomIcons iconName={'fa-solid fa-trash'} css="cursor-pointer" />}
                                />
                            )}
                            <Button
                                type="submit"
                                text={'Save'}
                                isLoading={loading}
                                endIcon={<CustomIcons iconName={'fa-solid fa-floppy-disk'} css="cursor-pointer" />}
                            />
                            {editAll && Number(watch('calRepeatType') || 1) !== 1 && (
                                <Button
                                    type="submit"
                                    text={'Save All'}
                                    isLoading={loading}
                                    endIcon={<CustomIcons iconName={'fa-solid fa-floppy-disk'} css="cursor-pointer" />}
                                />
                            )}
                            <Button
                                type="button"
                                text={'Cancel'}
                                disabled={loading}
                                useFor="disabled"
                                onClick={onClose}
                                startIcon={<CustomIcons iconName={'fa-solid fa-xmark'} css="cursor-pointer mr-2" />}
                            />
                        </div>
                    </Components.DialogActions>
                </form>
            </BootstrapDialog>
            <DeleteEventAlert open={openDeleteAlert} handleClose={handleCloseDeleteAlert} thirdPartyCalendar={thirdPartyCalendar} calParentId={watch("calParentId")} deleteAll={deleteAll} id={watch("id")} handleGetAllEvents={handleGetAllEvents} />
            <ModalRepeat open={openRepeat} handleClose={handleCloseRepeatModel} values={getValues()} setValues={setValue} handleCloseRepeatModelOnSave={handleCloseRepeatModelOnSave} />
        </React.Fragment>
    );
}

const mapDispatchToProps = { setAlert };

export default connect(null, mapDispatchToProps)(AddEventModel);