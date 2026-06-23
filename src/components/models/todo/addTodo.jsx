import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { styled, useTheme } from '@mui/material/styles';
import { Controller, useForm } from 'react-hook-form';

import Components from '../../../components/muiComponents/components';
import Button from '../../../components/common/buttons/button';
import Input from '../../../components/common/input/input';
import { setAlert, setSyncingPushStatus } from '../../../redux/commonReducers/commonReducers';
import CustomIcons from '../../../components/common/icons/CustomIcons';
import Select from '../../../components/common/select/select';

import { createTodo, getTodo, updateTodo } from '../../../service/todo/todoService';
import DatePickerComponent from '../../common/datePickerComponent/datePickerComponent';
import dayjs from 'dayjs';
import { getAllSubUsers } from '../../../service/customers/customersService';
import { getAllTeamAndMembers, getAllTeams } from '../../../service/teamDetails/teamDetailsService';
import { createTodoAssign, getTodoAssignByTodoId } from '../../../service/todoAssign/todoAssignService';
import { getUserDetails } from '../../../utils/getUserDetails';
import TeamMemberSelect from './teamMemberSelect';
import { getAllTeamMembers } from '../../../service/teamMembers/teamMembersService';
import CheckBoxSelect from '../../common/select/checkBoxSelect';

// Uploader component
import MultipleFileUpload from '../../fileInputBox/multipleFileUpload';
import { handleRequestClose, uploadFiles } from "../../../service/common/commonService";
import { deleteTodoAttachment } from '../../../service/todoAttachments/todoAttachmentsService';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': { padding: theme.spacing(2) },
    '& .MuiDialogActions-root': { padding: theme.spacing(1) },
}));

const priority = [
    { id: 1, title: "Normal" },
    { id: 2, title: "Important" },
    { id: 3, title: "Urgent" },
];

const assignedType = [
    { id: 1, title: "Me" },
    { id: 2, title: "Team" },
    { id: 3, title: "Individual" },
];

// Helper: unique ID for new rows (client side only)
const safeId = () => `${Date.now()}_${Math.random().toString(16).slice(2)}`;

function AddTodo({ setAlert, open, handleClose, todoId, handleGetAllTodos }) {
    const theme = useTheme();
    const userData = getUserDetails();

    const [loading, setLoading] = useState(false);
    const [teams, setTeams] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [teamAndMembers, setTeamAndMembers] = useState({ teams: [], individuals: [] });

    // Row‑based file attachments
    const [tempFileRows, setTempFileRows] = useState([]);       // [{ id, fileName, files, existingImages }]
    const [removedAttachmentIds, setRemovedAttachmentIds] = useState([]); // IDs of images removed inside a row (to be deleted on save)

    // Links state
    const [tempLinks, setTempLinks] = useState([]);             // each link: { uid, id, name, url }
    const [linkInput, setLinkInput] = useState({ name: '', url: '' });
    const [editingLinkId, setEditingLinkId] = useState(null);   // uid of link being edited
    const descriptionRef = useRef(null);

    const adjustTextareaHeight = () => {
        const textarea = descriptionRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        }
    };

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
            relatedTo: null,
            salesforceOpportunityId: null,
            task: null,
            dueDate: null,
            description: null,
            priority: 1,
            complectedWork: 0,

            assignedId: null,
            teamId: null,
            assignedType: 1,
            customerIds: [],
            removeCustomerIds: [],
            removeTeam: null,
        },
    });

    // -------------------------
    // Row helpers
    // -------------------------

    const addFileRow = () => {
        setTempFileRows((prev) => [...prev, { id: safeId(), fileName: '', files: [], existingImages: [] }]);
    };

    const setRowFileName = (rowId, value) => {
        setTempFileRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, fileName: value } : r)));
    };

    const setRowFiles = (rowId, nextFilesOrUpdater) => {
        setTempFileRows((prev) =>
            prev.map((r) => {
                if (r.id !== rowId) return r;
                const nextFiles =
                    typeof nextFilesOrUpdater === 'function' ? nextFilesOrUpdater(r.files) : nextFilesOrUpdater;
                const autoName =
                    !r.fileName && nextFiles?.length
                        ? nextFiles[0].name.split('?')[0].replace(/\.[^/.]+$/, '')
                        : r.fileName;
                return { ...r, files: nextFiles, fileName: autoName };
            })
        );
    };

    const setRowExistingImages = (rowId, updater) => {
        setTempFileRows((prev) =>
            prev.map((r) => {
                if (r.id !== rowId) return r;
                const prevImgs = r.existingImages || [];
                const nextImgs = typeof updater === 'function' ? updater(prevImgs) : updater;

                // Track removed server images (to be deleted on save)
                const prevIds = new Set(prevImgs.map((x) => x?.imageId).filter(Boolean));
                const nextIds = new Set((nextImgs || []).map((x) => x?.imageId).filter(Boolean));
                const removed = [...prevIds].filter((id) => !nextIds.has(id));
                if (removed.length) {
                    setRemovedAttachmentIds((p) => [...new Set([...(p || []), ...removed])]);
                }

                return { ...r, existingImages: nextImgs };
            })
        );
    };

    // -------------------------
    // Link handlers
    // -------------------------
    const handleAddOrUpdateLink = () => {
        const nameTrim = linkInput.name.trim();
        const urlTrim = linkInput.url.trim();
        if (!nameTrim || !urlTrim) return;

        if (editingLinkId !== null) {
            // Update existing link (keep its server id)
            setTempLinks((prev) =>
                prev.map((link) =>
                    link.uid === editingLinkId ? { ...link, name: nameTrim, url: urlTrim } : link
                )
            );
            setEditingLinkId(null);
            setLinkInput({ name: '', url: '' });
        } else {
            // Add new link (client id only)
            setTempLinks((prev) => [
                ...prev,
                { uid: safeId(), id: null, name: nameTrim, url: urlTrim },
            ]);
            setLinkInput({ name: '', url: '' });
        }
    };

    const handleDeleteLink = async (link) => {
        // 1. Delete from server if it has an ID
        if (link.id) {
            try {
                const res = await deleteTodoAttachment(link.id);
                if (res?.status !== 200) {
                    setAlert({ open: true, message: res?.message || 'Failed to delete link', type: 'error' });
                    return;
                }
            } catch (err) {
                setAlert({ open: true, message: err.message, type: 'error' });
                return;
            }
        }

        // 2. Remove from state
        setTempLinks((prev) => prev.filter((l) => l.uid !== link.uid));

        // 3. If this link was being edited, clear editing
        if (editingLinkId === link.uid) {
            setEditingLinkId(null);
            setLinkInput({ name: '', url: '' });
        }

        // 4. Refresh list
        handleGetAllTodos();
    };

    // -------------------------
    // Reset everything on close
    // -------------------------
    const onClose = () => {
        setLoading(false);
        reset({
            id: null,
            relatedTo: null,
            salesforceOpportunityId: null,
            task: null,
            dueDate: null,
            description: null,
            complectedWork: 0,

            assignedId: null,
            teamId: null,
            assignedType: 1,
            customerIds: [],
            removeCustomerIds: [],
            removeTeam: null,
        });

        // Clean up rows
        tempFileRows.forEach((row) => {
            row?.files?.forEach((f) => f?.preview && URL.revokeObjectURL(f.preview));
            row?.existingImages?.forEach(
                (x) => x?.__local && x?.imageURL?.startsWith('blob:') && URL.revokeObjectURL(x.imageURL)
            );
        });
        setTempFileRows([]);
        setRemovedAttachmentIds([]);
        setTempLinks([]);
        setLinkInput({ name: '', url: '' });
        setEditingLinkId(null);

        handleClose();
    };

    // -------------------------
    // Load data on open
    // -------------------------
    const handleGetAllTeamAndMembers = async () => {
        if (open) {
            const res = await getAllTeamAndMembers();
            if (res?.status === 200) setTeamAndMembers(res?.result || { teams: [], individuals: [] });
        }
    };

    const handleGetTodoDetails = async () => {
        if (todoId && open) {
            const res = await getTodo(todoId);
            if (res?.status === 200) {
                reset(res?.result);
                setValue('createdBy', res?.result?.createdBy || null);
                setValue('priority', priority?.find((s) => s.title === res?.result?.priority)?.id);
                setValue("complectedWork", res?.result?.complectedWork || 0);

                // Populate file rows from existing attachments
                const attachments = res?.result?.todoAttachmentsDtos || [];
                const fileAttachments = attachments.filter(
                    (att) => att.type && att.type.toLowerCase() !== 'link'
                );

                const rows = fileAttachments.map((att) => ({
                    id: safeId(), // client‑side id for React key
                    fileName: att.fileName || att.imageName || '',
                    files: [],
                    existingImages: [
                        {
                            __local: false,
                            imageId: att.id,
                            imageName: att.fileName || att.imageName || 'Attachment',
                            imageURL: att.path || '',
                            isInternal: false,
                        },
                    ],
                }));
                setTempFileRows(rows);

                // Populate links (add a unique uid for each)
                const links = attachments.filter((att) => att.type && att.type.toLowerCase() === 'link');
                setTempLinks(
                    links.map((l) => ({
                        uid: safeId(),
                        id: l.id || null,
                        name: l.linkName || '',
                        url: l.link || '',
                    }))
                );

                // Assignment data
                const response = await getTodoAssignByTodoId(todoId);
                if (response?.status === 200) {
                    const assignData = response?.result;
                    setValue('assignedId', assignData?.id);
                    setValue('teamId', assignData?.teamId);

                    if (assignData?.teamId && assignData?.customerIds?.length > 0) {
                        const members = await getAllTeamMembers(assignData?.teamId);
                        const data = members?.result?.map((item) => ({
                            id: item.memberId,
                            title: item.memberName || '',
                        }));
                        setCustomers(data || []);
                        setValue('assignedType', 2);
                    } else if (assignData?.customerIds?.length > 0 && assignData?.teamId === null) {
                        setValue('customerIds', assignData?.customerIds != null ? assignData?.customerIds : []);
                        setValue('assignedType', 3);
                    } else {
                        setValue('customerId', parseInt(assignData?.customerId));
                        setValue('assignedType', 1);
                    }
                }
            }
        }
    };

    const handleGetAllCustomers = async () => {
        if (open) {
            const res = await getAllSubUsers();
            const data = res?.data?.result?.map((item) => ({
                id: item.id,
                title: item.username || item.name,
                role: item.subUserTypeDto?.name || '',
            }));
            setCustomers(data || []);
        }
    };

    const handleGetAllTeams = async () => {
        if (open) {
            const res = await getAllTeams();
            const data = res?.result?.map((item) => ({
                id: item.id,
                title: item.name || '',
                teamMembers: item.teamMembers || [],
            }));
            setCustomers([]);
            setTeams(data || []);
        }
    };


    useEffect(() => {
        handleGetAllTeamAndMembers();
        handleGetAllTeams();
        handleGetTodoDetails();
    }, [open]);

    useEffect(() => {
        adjustTextareaHeight();
    }, [watch('description')]);

    useEffect(() => {
        if (watch('assignedType') === 3) handleGetAllCustomers();
    }, [watch('assignedType')]);

    const assignTodo = async (data) => {
        const res = await createTodoAssign(data);
        if (res?.status === 201) {
            handleGetAllTodos();
            onClose();
        } else {
            setAlert({ open: true, message: res?.message || 'Failed to assign todo', type: 'error' });
        }
        // if (watch('assignedId')) {
        //     const res = await updateTodoAssign(watch('assignedId'), data);
        //     if (res?.status === 200) {
        //         handleGetAllTodos();
        //         onClose();
        //     } else {
        //         setAlert({ open: true, message: res?.message || 'Failed to assign todo', type: 'error' });
        //     }
        // } else {
        //     const res = await createTodoAssign(data);
        //     if (res?.status === 201) {
        //         handleGetAllTodos();
        //         onClose();
        //     } else {
        //         setAlert({ open: true, message: res?.message || 'Failed to assign todo', type: 'error' });
        //     }
        // }
    };

    // -------------------------
    // Upload files from all rows
    // -------------------------
    const uploadAllNewFiles = async () => {
        const uploadedByRowId = new Map();

        for (const row of tempFileRows || []) {
            const rowFiles = row?.files || [];
            if (!rowFiles.length) continue;

            const uploadedList = [];
            for (const file of rowFiles) {
                const formData = new FormData();
                formData.append('files', file);
                formData.append('folderName', 'todo');

                const response = await uploadFiles(formData);
                const data = response?.data ?? response;

                if (data?.status === 200 && Array.isArray(data?.result) && data.result[0]) {
                    uploadedList.push(data.result[0]);
                } else {
                    setAlert({ open: true, message: data?.message || 'File upload failed', type: 'error' });
                    return { ok: false, uploadedByRowId: null };
                }
            }
            uploadedByRowId.set(row.id, uploadedList);
        }

        return { ok: true, uploadedByRowId };
    };

    // -------------------------
    // Delete handlers (immediate API calls)
    // -------------------------
    const handleDeleteFileRow = async (row) => {
        // 1. Delete existing attachments from server
        for (const img of row.existingImages) {
            if (img.imageId) {
                try {
                    const res = await deleteTodoAttachment(img.imageId);
                    if (res?.status !== 200) {
                        setAlert({ open: true, message: res?.message || 'Failed to delete attachment', type: 'error' });
                    }
                } catch (err) {
                    setAlert({ open: true, message: err.message, type: 'error' });
                }
            }
        }

        // 2. Clean up local previews
        row.files?.forEach((f) => f?.preview && URL.revokeObjectURL(f.preview));
        row.existingImages?.forEach(
            (x) => x?.__local && x?.imageURL?.startsWith('blob:') && URL.revokeObjectURL(x.imageURL)
        );

        // 3. Remove row from state
        setTempFileRows((prev) => prev.filter((r) => r.id !== row.id));

        // 4. Refresh list (optional)
        handleGetAllTodos();
    };

    // -------------------------
    // Main submit handler
    // -------------------------
    const submit = async (data) => {
        setLoading(true);

        // 1) Upload newly selected files
        const { ok, uploadedByRowId } = await uploadAllNewFiles();
        if (!ok) {
            setLoading(false);
            return;
        }

        // 2) Delete attachments that were individually removed inside rows
        if (removedAttachmentIds.length > 0) {
            for (const id of removedAttachmentIds) {
                try {
                    await deleteTodoAttachment(id);
                } catch (err) {
                    setAlert({ open: true, message: err.message, type: 'error' });
                    setLoading(false);
                    return;
                }
            }
            setRemovedAttachmentIds([]); // clear after deletion
        }

        const dueDateVal = dayjs(watch('dueDate')).isValid() ? dayjs(watch('dueDate')) : dayjs();

        // 3) Build todoAttachmentsDtos from rows + links
        const fileDtos = [];

        for (const row of tempFileRows || []) {
            const rowName = (row?.fileName || '').trim() || 'Attachment';

            // Existing server attachments
            (row?.existingImages || []).forEach((img) => {
                fileDtos.push({
                    id: img?.imageId ?? null,
                    todoId: todoId ?? null,
                    type: 'File',
                    fileName: rowName,
                    imageName: img?.imageName || null,
                    path: img?.imageURL || null,
                    link: null,
                    linkName: null,
                });
            });

            // Newly uploaded attachments
            const uploadedList = uploadedByRowId?.get(row.id) || [];
            uploadedList.forEach((u) => {
                fileDtos.push({
                    id: null,
                    todoId: todoId ?? null,
                    type: 'File',
                    fileName: rowName,
                    imageName: u?.imageName || null,
                    path: u?.imageURL || null,
                    link: null,
                    linkName: null,
                });
            });
        }

        // Links from tempLinks
        const linkDtos = tempLinks.map((link) => ({
            id: link.id || null,
            todoId: todoId || null,
            type: 'Link',
            fileName: null,
            imageName: null,
            path: null,
            link: link.url,
            linkName: link.name,
        }));

        // Add pending link if not editing and inputs are not empty
        if (editingLinkId === null && linkInput.name.trim() && linkInput.url.trim()) {
            linkDtos.push({
                id: null,
                todoId: todoId || null,
                type: 'Link',
                fileName: null,
                imageName: null,
                path: null,
                link: linkInput.url.trim(),
                linkName: linkInput.name.trim(),
            });
        }

        const todoAttachmentsDtos = [...fileDtos, ...linkDtos];

        // 4) Prepare main todo payload
        const newData = {
            ...data,
            todoAttachmentsDtos,
            complectedWork: parseInt(watch('complectedWork')) || 0,
            dueDate: dueDateVal.format('MM/DD/YYYY'),
            // priority: priority?.find((s) => s.id === parseInt(watch('priority')))?.title || null,
        };

        try {
            if (todoId) {
                const res = await updateTodo(todoId, newData);
                if (res?.status === 200) {
                    if (parseInt(watch('createdBy')) === parseInt(userData?.userId)) {
                        const assignData = {
                            id: watch('assignedId'),
                            teamId: watch('assignedType') === 2 ? watch('teamId') : null,
                            customerId:
                                watch('assignedType') === 1
                                    ? userData?.userId?.toString()
                                    : watch('assignedType') === 2
                                        ? null
                                        : watch('customerId'),
                            customerIds: watch('customerIds') || [],
                            todoId: todoId,
                            removeCustomerIds: watch('removeCustomerIds') || [],
                            removeTeam: watch('removeTeam') || null,
                            dueDate: dueDateVal.format('MM/DD/YYYY'),
                            // complectedWork: parseInt(watch('complectedWork')) || 0,
                            // priority: priority?.find((s) => s.id === parseInt(watch('priority')))?.title || null,
                        };
                        await assignTodo(assignData);
                    }
                    handleGetAllTodos();
                    onClose();
                } else {
                    setAlert({ open: true, message: res?.message || 'Failed to update todo', type: 'error' });
                }
            } else {
                const res = await createTodo(newData);
                if (res?.status === 201) {
                    const assignData = {
                        id: null,
                        teamId: watch('assignedType') === 2 ? watch('teamId') : null,
                        customerId:
                            watch('assignedType') === 1
                                ? userData?.userId?.toString()
                                : watch('assignedType') === 2
                                    ? null
                                    : watch('customerId'),
                        customerIds: watch('customerIds') || [],
                        todoId: res?.result?.id,
                        removeCustomerIds: watch('removeCustomerIds') || [],
                        removeTeam: watch('removeTeam') || null,
                        dueDate: dueDateVal.format('MM/DD/YYYY'),
                        // complectedWork: parseInt(watch('complectedWork')) || 0,
                        // priority: priority?.find((s) => s.id === parseInt(watch('priority')))?.title || null,
                    };
                    await assignTodo(assignData);
                } else {
                    setAlert({ open: true, message: res?.message || 'Failed to create todo', type: 'error' });
                }
            }
        } catch (err) {
            setAlert({ open: true, message: err.message || 'Something went wrong', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // -------------------------
    // Render
    // -------------------------
    return (
        <React.Fragment>
            <BootstrapDialog onClose={(event, reason) => handleRequestClose(event, reason, onClose)} open={open} aria-labelledby="customized-dialog-title" fullWidth maxWidth="md">
                <Components.DialogTitle
                    sx={{ m: 0, p: 2, color: theme.palette.text.primary }}
                    id="customized-dialog-title"
                >
                    {todoId ? 'Update ' : 'New '}Priority
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
                        <div className="px-[30px]">
                            <div className="grid gap-[30px]">
                                <div>
                                    <Controller
                                        name="relatedTo"
                                        control={control}
                                        rules={{ required: 'Related to is required' }}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                label="Related To"
                                                type="text"
                                                requiredFiledLabel={true}
                                                error={errors.relatedTo}
                                            />
                                        )}
                                    />
                                </div>

                                {/* Task */}
                                <div>
                                    <Controller
                                        name="task"
                                        control={control}
                                        rules={{ required: 'Task is required' }}
                                        render={({ field }) => (
                                            <Input
                                                disabled={todoId ? watch('createdBy') !== userData?.userId : false}
                                                {...field}
                                                label="Action"
                                                requiredFiledLabel={true}
                                                type="text"
                                                error={errors.task}
                                            />
                                        )}
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <Controller
                                        name="description"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                ref={descriptionRef}
                                                label="Details"
                                                placeholder="Enter action details"
                                                type="text"
                                                multiline={true}
                                                minRows={1}
                                            />
                                        )}
                                    />
                                </div>
                                
                                <div className='grid grid-cols-2 gap-[30px]'>
                                    <div>
                                        <Controller
                                            name="assignedType"
                                            control={control}
                                            rules={{ required: true }}
                                            render={({ field }) => (
                                                <Select
                                                    disabled={todoId ? watch('createdBy') !== userData?.userId : false}
                                                    options={assignedType}
                                                    label="Owner"
                                                    requiredFiledLabel={true}
                                                    placeholder="Select owner"
                                                    value={parseInt(watch('assignedType')) || null}
                                                    onChange={(_, newValue) => {
                                                        const currentRemoved = watch('customerIds') || [];
                                                        setValue('removeCustomerIds', currentRemoved);
                                                        setValue('removeTeam', watch('teamId') || null);
                                                        if (newValue?.id) {
                                                            setValue('customerId', null);
                                                            setValue('teamId', null);
                                                            field.onChange(newValue.id);
                                                            if (newValue?.id === 1 || newValue?.id === 2) {
                                                                setCustomers([]);
                                                            }
                                                        } else {
                                                            setValue('assignedType', null);
                                                            setValue('customerId', null);
                                                            setValue('teamId', null);
                                                        }
                                                    }}
                                                    error={errors.assignedType}
                                                />
                                            )}
                                        />
                                    </div>

                                    {/* Due Date */}
                                    <div>
                                        <DatePickerComponent
                                            setValue={setValue}
                                            control={control}
                                            name="dueDate"
                                            label="Due Date"
                                            requiredFiledLabel={true}
                                        />
                                    </div>
                                </div>


                                {/* Team selection */}
                                {watch('assignedType') === 2 && (
                                    <div className='grid grid-cols-2 gap-[30px]'>
                                        <div>
                                            <Controller
                                                name="teamId"
                                                control={control}
                                                rules={{ required: true }}
                                                render={({ field }) => (
                                                    <Select
                                                        options={teams}
                                                        label="Team"
                                                        requiredFiledLabel={true}
                                                        placeholder="Select team"
                                                        value={parseInt(watch('teamId')) || null}
                                                        onChange={(_, newValue) => {
                                                            if (newValue?.id) {
                                                                field.onChange(newValue.id);
                                                                const customers = newValue?.teamMembers?.map((item) => ({
                                                                    id: item.memberId,
                                                                    title: item.memberName || '',
                                                                }));
                                                                setCustomers(customers || []);
                                                                const customerIds = customers?.map((cust) => cust.id);
                                                                setValue('customerIds', customerIds || []);
                                                            } else {
                                                                setValue('teamId', null);
                                                                setCustomers([]);
                                                                setValue('customerIds', []);
                                                            }
                                                        }}
                                                        error={errors.teamId}
                                                    />
                                                )}
                                            />
                                        </div>

                                        <div>
                                            <Controller
                                                name="customerIds"
                                                control={control}
                                                render={({ field }) => {
                                                    const selectedOptions = customers.filter((cust) =>
                                                        (field.value || []).includes(cust.id)
                                                    );

                                                    return (
                                                        <CheckBoxSelect
                                                            disabled={
                                                                todoId
                                                                    ? watch('createdBy') !== userData?.userId
                                                                    : customers?.length === 0
                                                            }
                                                            options={customers}
                                                            label="Members"
                                                            requiredFiledLabel={true}
                                                            placeholder="Select members"
                                                            value={selectedOptions}
                                                            onChange={(event, newValue) => {
                                                                const newIds = newValue.map((opt) => opt.id);
                                                                const removedIds = (field.value || []).filter(
                                                                    (id) => !newIds.includes(id)
                                                                );

                                                                field.onChange(newIds);

                                                                if (todoId) {
                                                                    const currentRemoved = watch('removeCustomerIds') || [];
                                                                    setValue('removeCustomerIds', [
                                                                        ...new Set([...currentRemoved, ...removedIds]),
                                                                    ]);
                                                                    setValue('removeTeam', watch('teamId') || null);
                                                                }
                                                            }}
                                                            checkAll={true}
                                                            maxVisibleChips={1}
                                                        />
                                                    );
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Individual selection */}
                                {watch('assignedType') === 3 && (
                                    <div>
                                        <Controller
                                            name="customerIds"  // now an array
                                            control={control}
                                            rules={{ required: true }}
                                            render={({ field, fieldState: { error } }) => (
                                                <TeamMemberSelect
                                                    multiple
                                                    disabled={todoId ? watch('createdBy') !== userData?.userId : false}
                                                    label="Members"
                                                    placeholder="Select members"
                                                    requiredFiledLabel={true}
                                                    options={teamAndMembers}
                                                    value={field.value || []}
                                                    onChange={(selectedIds) => {
                                                        const oldIds = field.value || [];
                                                        const removedIds = oldIds.filter((id) => !selectedIds.includes(id));
                                                        field.onChange(selectedIds);
                                                        if (todoId) {
                                                            const currentRemoved = watch('removeCustomerIds') || [];
                                                            setValue('removeCustomerIds', [...new Set([...currentRemoved, ...removedIds])]);
                                                        }
                                                        if (selectedIds.length > 0) {
                                                            setValue('customerId', null);
                                                        }
                                                        else {
                                                            setValue('customerId', null);
                                                            setValue('teamId', null);
                                                        }
                                                    }}
                                                    error={!!error}
                                                />
                                            )}
                                        />
                                    </div>
                                )}

                                {/* Priority
                                <div>
                                    <Controller
                                        name="priority"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Select
                                                options={priority}
                                                label="Priority"
                                                placeholder="Select priority"
                                                value={parseInt(watch('priority')) || null}
                                                onChange={(_, newValue) => {
                                                    if (newValue?.id) {
                                                        field.onChange(newValue.id);
                                                    } else {
                                                        setValue('priority', null);
                                                    }
                                                }}
                                                error={errors.priority}
                                            />
                                        )}
                                    />
                                </div> */}

                                {/* Completed Work */}
                                {/* <div>
                                    <Controller
                                        name="complectedWork"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                disabled={parseInt(watch("status")) === 1}
                                                label="Completed Work"
                                                type="text"
                                                onChange={(e) => {
                                                    let numericValue = e.target.value.replace(/[^0-9]/g, '');
                                                    if (numericValue === '') {
                                                        field.onChange('');
                                                        return;
                                                    }
                                                    let value = parseInt(numericValue, 10);
                                                    if (Math.abs(value) <= 100) {
                                                        field.onChange(value);
                                                    }
                                                }}
                                                value={field.value ?? ""}
                                                endIcon="%"
                                            />
                                        )}
                                    />
                                </div> */}

                                {/* ---------- NEW: Row‑based File Attachments ---------- */}
                                <div className="bg-white/50 rounded-lg p-4 border border-indigo-100">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="block text-sm font-semibold text-slate-600">
                                            Attachments (optional)
                                        </label>
                                        <button
                                            type="button"
                                            onClick={addFileRow}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition-colors"
                                        >
                                            <CustomIcons iconName="fa-solid fa-plus" css="text-white h-4 w-4" />
                                            Add Files
                                        </button>
                                    </div>

                                    {tempFileRows.length === 0 ? (
                                        <div className="text-sm text-slate-400 text-center py-6 border border-dashed border-slate-200 rounded-lg bg-white">
                                            Drag & Drop files here.
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {tempFileRows.map((row) => (
                                                <div key={row.id} className="bg-white rounded-lg border border-slate-200 p-3">
                                                    <div className="grid grid-cols-12 gap-3 items-start">
                                                        <div className="col-span-4">
                                                            <Input
                                                                value={row.fileName}
                                                                onChange={(e) => setRowFileName(row.id, e.target.value)}
                                                                label="File name"
                                                            />
                                                        </div>

                                                        <div className="col-span-7">
                                                            <MultipleFileUpload
                                                                files={row.files}
                                                                setFiles={(v) => setRowFiles(row.id, v)}
                                                                existingImages={row.existingImages}
                                                                setExistingImages={(v) => setRowExistingImages(row.id, v)}
                                                                placeHolder="Drag & drop files here, or click to select files"
                                                                isFileUpload={true}
                                                                removableExistingAttachments={false}
                                                                flexView={true}
                                                                type="todoAttachments"
                                                                fallbackFunction={() => { }}
                                                                preview={false}
                                                            />
                                                        </div>

                                                        <div className="col-span-1 flex justify-end pt-6">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteFileRow(row)}
                                                                className="p-2 rounded-lg bg-red-50 hover:bg-red-100 transition"
                                                                title="Remove row"
                                                            >
                                                                <CustomIcons
                                                                    iconName="fa-solid fa-trash"
                                                                    css="text-red-600 h-4 w-4"
                                                                />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {/* -------------------------------------------------------- */}

                                {/* ---------- Links UI (with edit support) ---------- */}
                                <div className="bg-white/50 rounded-lg p-4 border border-indigo-100">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="block text-sm font-semibold text-slate-600">
                                            Links (optional)
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-12 gap-3 items-end">
                                        <div className="col-span-4">
                                            <Input
                                                value={linkInput.name}
                                                onChange={(e) => setLinkInput((p) => ({ ...p, name: e.target.value }))}
                                                placeholder="e.g., Documentation"
                                                label="Link name"
                                            />
                                        </div>
                                        <div className="col-span-6">
                                            <Input
                                                value={linkInput.url}
                                                onChange={(e) => setLinkInput((p) => ({ ...p, url: e.target.value }))}
                                                label="URL"
                                                placeholder="https://..."
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <button
                                                type="button"
                                                onClick={handleAddOrUpdateLink}
                                                className="w-full bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors"
                                            >
                                                {editingLinkId ? 'Edit' : 'Add'}
                                            </button>
                                        </div>
                                    </div>

                                    {tempLinks.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            {tempLinks.map((link) => (
                                                <div
                                                    key={link.uid}
                                                    className="flex items-center justify-between gap-3 border border-slate-200 bg-white rounded-lg px-3 py-2"
                                                >
                                                    <div className="min-w-0">
                                                        <div className="text-sm font-medium text-slate-800 truncate">
                                                            {link.name}
                                                        </div>
                                                        <div className="text-xs text-slate-500 truncate">{link.url}</div>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setEditingLinkId(link.uid);
                                                                setLinkInput({ name: link.name, url: link.url });
                                                            }}
                                                            className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition"
                                                            title="Edit"
                                                        >
                                                            <CustomIcons iconName="fa-solid fa-pen" css="text-blue-600 h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteLink(link)}
                                                            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 transition"
                                                            title="Remove"
                                                        >
                                                            <CustomIcons iconName="fa-solid fa-trash" css="text-red-600 h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {/* ------------------------------------------ */}
                            </div>
                        </div>
                    </Components.DialogContent>

                    <Components.DialogActions>
                        <div className="flex justify-end items-center gap-4">
                            <Button
                                type="button"
                                text="Cancel"
                                disabled={loading}
                                useFor="disabled"
                                onClick={() => onClose()}
                                startIcon={<CustomIcons iconName="fa-solid fa-xmark" css="cursor-pointer mr-2" />}
                            />
                            <Button
                                type="submit"
                                text={todoId ? 'Update' : 'Create & Assign'}
                                isLoading={loading}
                                endIcon={<CustomIcons iconName="fa-solid fa-floppy-disk" css="cursor-pointer" />}
                            />
                        </div>
                    </Components.DialogActions>
                </form>
            </BootstrapDialog>
        </React.Fragment>
    );
}

const mapDispatchToProps = {
    setAlert,
    setSyncingPushStatus,
};

export default connect(null, mapDispatchToProps)(AddTodo);