import React, { useEffect, useMemo, useState } from "react";
import MultipleFileUpload from "../../../components/fileInputBox/multipleFileUpload";
import { Tooltip } from "@mui/material";
import Components from "../../../components/muiComponents/components";
import CustomIcons from "../../../components/common/icons/CustomIcons";

import {
    deleteCategory,
    getCategoryByOppId,
    saveCategory,
    updateCategory,
} from "../../../service/docsCategory/docsCategoryService";

import {
    findByDocsCategory,
    saveAttachments,
    updateAttachments,
    deleteAttachments,
} from "../../../service/docsAttachments/docsAttachmentsService";

// ✅ import your uploadFiles service (adjust path if needed)
import { uploadFiles } from "../../../service/common/commonService";
import Button from "../../../components/common/buttons/button";
import Input from "../../../components/common/input/input";
import AlertDialog from "../../../components/common/alertDialog/alertDialog";
import { setAlert } from "../../../redux/commonReducers/commonReducers";
import { connect } from "react-redux";

const uid = () => crypto?.randomUUID?.() || String(Date.now() + Math.random());


const fileBaseName = (name = "") => name.replace(/\.[^/.]+$/, "");

// Convert backend attachment -> UI resource
const mapAttachmentToResource = (a) => {
    const type = (a?.type || "").toLowerCase() === "link" ? "link" : "file";
    return {
        id: a?.id, // ✅ backend id
        type, // "file" | "link"
        name: type === "link" ? (a?.linkName || "Untitled Link") : (a?.fileName || "Untitled File"),
        url: a?.link || "",
        fileUrl: a?.fileUrl || "",
        imageName: a?.imageName || "",
        raw: a,
    };
};

// Upload single file -> returns fileUrl (imageURL from API)
const uploadSingleFileToApi = async ({ file, folderName, userdata }) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folderName", "docsAttachments");  // ✅ must match backend tempFolderName
    formData.append("userId", userdata?.userId || "");


    const res = await uploadFiles(formData);
    // ✅ based on your statement: uploadFiles returns imageURL
    // but response shape could be {data:{imageURL:""}} or {data:""}
    const { imageURL } = res?.data?.result?.[0] || {};
    return imageURL;
};

const DealDocs = ({ setAlert, opportunityId, userdata }) => {
    const [loading, setLoading] = useState(false);

    // ✅ delete confirm dialog (category/resource)
    const [dialogDelete, setDialogDelete] = useState({
        open: false,
        title: "",
        message: "",
        actionButtonText: "",
    });
    const [deleteTarget, setDeleteTarget] = useState({
        type: "", // "category" | "resource"
        categoryId: null,
        resourceId: null,
    });

    // Categories from API: [{id, name, resources:[]}]
    const [categories, setCategories] = useState([]);

    // category edit
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [categoryDraft, setCategoryDraft] = useState("");
    const [originalCategoryName, setOriginalCategoryName] = useState("");

    // modal add/edit
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
    const [modalType, setModalType] = useState("file"); // "file" | "link"
    const [activeCategoryId, setActiveCategoryId] = useState(null);
    const [editingResourceId, setEditingResourceId] = useState(null);

    // FILE EDIT mode fields
    const [resourceName, setResourceName] = useState("");
    const [modalFiles, setModalFiles] = useState([]);
    // const [existingImages, setExistingImages] = useState([]);

    // FILE ADD mode rows
    const [fileRows, setFileRows] = useState([]); // [{id, fileName, files:[], existingImages:[]}]

    // LINK ADD mode rows
    const [linkRows, setLinkRows] = useState([]); // [{id, name, url}]

    // LINK EDIT mode fields
    const [linkName, setLinkName] = useState("");
    const [linkUrl, setLinkUrl] = useState("");

    const [resourceMenuAnchor, setResourceMenuAnchor] = useState(null);
    const [resourceMenuCatId, setResourceMenuCatId] = useState(null);

    const activeCategory = useMemo(
        () => categories.find((c) => c.id === activeCategoryId),
        [categories, activeCategoryId]
    );

    // ---------------- Load Categories + Resources ----------------
    const loadAll = async () => {
        if (!opportunityId) return;
        setLoading(true);
        try {
            const catRes2 = await getCategoryByOppId(opportunityId);
            const cats2 = catRes2?.result || [];

            // For each category, load attachments
            const catsWithResources = await Promise.all(
                (cats2 || []).map(async (cat) => {
                    const categoryId = cat?.id;
                    let attachments = [];
                    try {
                        const attRes = await findByDocsCategory(categoryId);
                        attachments = attRes?.result || [];
                    } catch (e) {
                        attachments = [];
                    }

                    return {
                        id: categoryId,
                        name: cat?.categoryName || cat?.name || "Untitled Category",
                        resources: (attachments || []).map(mapAttachmentToResource),
                        raw: cat,
                    };
                })
            );

            setCategories(catsWithResources);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [opportunityId]);

    // ---------------- Category helpers ----------------
    const addCategoryRow = () => {
        const tempId = uid(); // use your uid() helper

        const draft = {
            id: null,          // DB id (null until created)
            tempId,            // local row id
            name: "",          // start empty for input
            resources: [],
            isNew: true,
        };

        setCategories((prev) => [draft, ...(prev || [])]); // add on top
        setEditingCategoryId(tempId);                      // edit mode uses tempId
        setCategoryDraft("");
        setOriginalCategoryName("");
    };

    const startEditCategory = (cat) => {
        const editKey = cat.id ?? cat.tempId;
        setEditingCategoryId(editKey);
        setCategoryDraft(cat.name || "");
        setOriginalCategoryName(cat.name || "");
    };

    // ---------------- Menu helpers ----------------
    const openResourceMenu = (e, catId) => {
        e.stopPropagation();
        setResourceMenuAnchor(e.currentTarget);
        setResourceMenuCatId(catId);
    };

    const closeResourceMenu = () => {
        setResourceMenuAnchor(null);
        setResourceMenuCatId(null);
    };

    // ---------------- Modal open/close ----------------
    const resetModalState = () => {
        setModalMode("add");
        setModalType("file");
        setActiveCategoryId(null);
        setEditingResourceId(null);

        setResourceName("");
        setModalFiles([]);
        setFileRows([]);

        setLinkRows([]);
        setLinkName("");
        setLinkUrl("");
    };

    const closeModal = (loadData = false) => {
        if (loadData) {
            loadAll()
        }
        setIsModalOpen(false);
        resetModalState();
    };

    // ---------------- FILE: add mode ----------------
    const openAddAttachmentModal = (catId) => {
        closeResourceMenu();

        setModalMode("add");
        setModalType("file");
        setActiveCategoryId(catId);
        setEditingResourceId(null);

        setResourceName("");
        setModalFiles([]);

        setFileRows([
            { id: uid(), fileName: "", files: [], existingImages: [] },
        ]);

        setLinkRows([]);
        setIsModalOpen(true);
    };

    const addFileRow = () => {
        setFileRows((prev) => [
            ...(prev || []),
            { id: uid(), fileName: "", files: [], existingImages: [] },
        ]);
    };

    const deleteFileRow = (rowId) => {
        setFileRows((prev) => (prev || []).filter((r) => r.id !== rowId));
    };

    const updateRowName = (rowId, value) => {
        setFileRows((prev) =>
            (prev || []).map((r) => (r.id === rowId ? { ...r, fileName: value } : r))
        );
    };

    const setRowFiles = (rowId, valueOrUpdater) => {
        setFileRows((prev) =>
            (prev || []).map((r) => {
                if (r.id !== rowId) return r;

                const prevFiles = Array.isArray(r.files) ? r.files : [];
                const nextFiles =
                    typeof valueOrUpdater === "function" ? valueOrUpdater(prevFiles) : valueOrUpdater;

                const safe = Array.isArray(nextFiles) ? nextFiles : [];
                const one = safe.length ? [safe[safe.length - 1]] : [];
                return { ...r, files: one };
            })
        );
    };

    const setRowExistingImages = (rowId, valueOrUpdater) => {
        setFileRows((prev) =>
            (prev || []).map((r) => {
                if (r.id !== rowId) return r;

                const prevEx = Array.isArray(r.existingImages) ? r.existingImages : [];
                const nextEx =
                    typeof valueOrUpdater === "function" ? valueOrUpdater(prevEx) : valueOrUpdater;

                return { ...r, existingImages: Array.isArray(nextEx) ? nextEx : [] };
            })
        );
    };

    // ---------------- LINK: add mode ----------------
    const openAddLinksModal = (catId) => {
        closeResourceMenu();

        setModalMode("add");
        setModalType("link");
        setActiveCategoryId(catId);
        setEditingResourceId(null);

        setLinkRows([{ id: uid(), name: "", url: "" }]);

        setFileRows([]);
        setResourceName("");
        setModalFiles([]);

        setIsModalOpen(true);
    };

    const addLinkRow = () => {
        setLinkRows((prev) => [...(prev || []), { id: uid(), name: "", url: "" }]);
    };

    const deleteLinkRow = (rowId) => {
        setLinkRows((prev) => (prev || []).filter((r) => r.id !== rowId));
    };

    const updateLinkRow = (rowId, key, value) => {
        setLinkRows((prev) =>
            (prev || []).map((r) => (r.id === rowId ? { ...r, [key]: value } : r))
        );
    };

    // ---------------- EDIT: file/link ----------------
    const openEditResourceModal = (catId, resId) => {
        const cat = categories.find((c) => c.id === catId);
        const res = cat?.resources?.find((r) => r.id === resId);
        if (!res) return;

        setModalMode("edit");
        setActiveCategoryId(catId);
        setEditingResourceId(resId);

        setFileRows([]);
        setLinkRows([]);

        if (res.type === "link") {
            setModalType("link");
            setLinkName(res.name || "");
            setLinkUrl(res.url || "");
            setIsModalOpen(true);
            return;
        }

        setModalType("file");
        setResourceName(res.name || "");
        setModalFiles([]);
        // Keep existing preview (if you want to show it inside MultipleFileUpload)      
        setIsModalOpen(true);
    };

    // ---------------- Save / Update (API) ----------------
    const handleSaveOrUpdate = async () => {
        if (!activeCategoryId) return;

        // ===== ADD MODE =====
        if (modalMode === "add") {
            // ---- ADD FILES
            if (modalType === "file") {
                const rowsWithFiles = (fileRows || []).filter((r) => r?.files?.length);
                if (!rowsWithFiles.length) return;

                setLoading(true);
                try {
                    const payload = [];

                    for (const row of rowsWithFiles) {
                        const f = row.files[0];
                        const nextName = (row.fileName || "").trim() || fileBaseName(f?.name) || "Untitled";

                        const fileUrl = await uploadSingleFileToApi({
                            file: f,
                            folderName: "oppLogo",
                            userdata,
                        });

                        payload.push({
                            id: null,
                            categoryId: activeCategoryId,
                            type: "File",
                            linkName: "",
                            link: "",
                            fileName: nextName,
                            imageName: f?.name || "",
                            fileUrl: fileUrl || "",
                        });
                    }

                    await saveAttachments(payload);

                    await loadAll();
                    closeModal();
                } catch (e) {
                    console.log(e);
                } finally {
                    setLoading(false);
                }
                return;
            }

            // ---- ADD LINKS
            if (modalType === "link") {
                const validLinks = (linkRows || []).filter(
                    (r) => (r?.name || "").trim() && (r?.url || "").trim()
                );
                if (!validLinks.length) return;

                setLoading(true);
                try {
                    const payload = validLinks.map((r) => ({
                        id: null,
                        categoryId: activeCategoryId,
                        type: "Link",
                        linkName: (r.name || "").trim(),
                        link: (r.url || "").trim(),
                        fileName: "",
                        imageName: "",
                        fileUrl: "",
                    }));

                    await saveAttachments(payload);

                    await loadAll();
                    closeModal();
                } catch (e) {
                    console.log(e);
                } finally {
                    setLoading(false);
                }
                return;
            }
        }

        // ===== EDIT MODE =====
        if (modalMode === "edit") {
            if (!editingResourceId) return;

            // ---- UPDATE LINK (one at a time)
            if (modalType === "link") {
                const n = linkName.trim();
                const u = linkUrl.trim();
                if (!n || !u) return;

                setLoading(true);
                try {
                    await updateAttachments(editingResourceId, {
                        id: editingResourceId,
                        categoryId: activeCategoryId,
                        type: "Link",
                        linkName: n,
                        link: u,
                        fileName: "",
                        imageName: "",
                        fileUrl: "",
                    });

                    await loadAll();
                    closeModal();
                } catch (e) {
                    console.log(e);
                } finally {
                    setLoading(false);
                }
                return;
            }

            // ---- UPDATE FILE (one at a time)
            if (modalType === "file") {
                const nextName = resourceName.trim() || "Untitled";

                setLoading(true);
                try {
                    let fileUrl = "";
                    let imageName = "";

                    // if user uploaded new file -> upload + update fileUrl
                    if (modalFiles?.length) {
                        const f = modalFiles[0];
                        imageName = f?.name || "";
                        fileUrl = await uploadSingleFileToApi({
                            file: f,
                            folderName: "oppLogo",
                            userdata,
                        });
                    } else {
                        // keep old fileUrl if not uploading a new one
                        const cat = categories.find((c) => c.id === activeCategoryId);
                        const res = cat?.resources?.find((r) => r.id === editingResourceId);
                        fileUrl = res?.fileUrl || "";
                        imageName = res?.imageName || "";
                    }

                    await updateAttachments(editingResourceId, {
                        id: editingResourceId,
                        categoryId: activeCategoryId,
                        type: "File",
                        linkName: "",
                        link: "",
                        fileName: nextName,
                        imageName: imageName,
                        fileUrl: fileUrl,
                    });

                    await loadAll();
                    closeModal();
                } catch (e) {
                    console.log(e);
                } finally {
                    setLoading(false);
                }
            }
        }
    };

    // ---------------- Delete (with confirm dialog) ----------------
    const handleOpenDeleteDialog = ({ type, categoryId = null, resourceId = null }) => {
        setDeleteTarget({ type, categoryId, resourceId });

        const isCategory = type === "category";
        setDialogDelete({
            open: true,
            title: isCategory ? "Delete Category" : "Delete Resource",
            message: isCategory
                ? "Are you sure you want to delete this category? This will also remove its resources."
                : "Are you sure you want to delete this resource?",
            actionButtonText: "Yes",
        });
    };

    const handleCloseDeleteDialog = () => {
        setDialogDelete((p) => ({ ...p, open: false }));
        setDeleteTarget({ type: "", categoryId: null, resourceId: null });
    };

    const handleDelete = async () => {
        const { type, categoryId, resourceId } = deleteTarget || {};
        if (!type) return;

        setLoading(true);
        try {
            if (type === "resource" && resourceId) {
                const res = await deleteAttachments(resourceId);
                if (res.status === 200) {
                    await loadAll();
                    handleCloseDeleteDialog();
                } else {
                    setAlert({ open: true, message: "Failed to delete resource", type: "error" });
                }
            }
            if (type === "category" && categoryId) {
                const response = await deleteCategory(categoryId);
                if (response.status === 200) {
                    await loadAll();
                    handleCloseDeleteDialog();
                } else {
                    setAlert({ open: true, message: "Failed to delete category", type: "error" });
                }
            }
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    };

    const isSaveDisabled = useMemo(() => {
        if (modalMode === "add") {
            if (modalType === "file") return !(fileRows || []).some((r) => r?.files?.length);
            if (modalType === "link")
                return !(linkRows || []).some((r) => (r?.name || "").trim() && (r?.url || "").trim());
        } else {
            if (modalType === "file") return false;
            if (modalType === "link") return !(linkName.trim() && linkUrl.trim());
        }
        return false;
    }, [modalMode, modalType, fileRows, linkRows, linkName, linkUrl]);

    const renderResourceIcon = (res) => {
        if (res?.type === "link") {
            return <CustomIcons iconName="fa-solid fa-link" css="text-indigo-600 h-4 w-4" />;
        }
        return <CustomIcons iconName="fa-solid fa-paperclip" css="text-indigo-600 h-4 w-4" />;
    };

    return (
        <div className="w-full py-5">
            <div className="border border-gray-400 bg-white overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-[1.1fr_2fr]">
                    <div className="border-r border-gray-400 px-4 py-3 font-semibold text-center">
                        <div className="flex items-center justify-center gap-3">
                            <span className="text-black">Category</span>
                            <Tooltip title="Add Category" arrow>
                                <div className="bg-blue-600 h-6 w-6 flex justify-center items-center rounded-full text-white">
                                    <Components.IconButton onClick={addCategoryRow} disabled={loading}>
                                        <CustomIcons iconName="fa-solid fa-plus" css="cursor-pointer text-white h-3 w-3" />
                                    </Components.IconButton>
                                </div>
                            </Tooltip>
                        </div>
                    </div>
                    <div className="px-4 py-3 font-semibold text-center text-black">
                        Resource
                    </div>
                </div>

                {/* Rows */}
                {(categories || []).map((cat) => {
                    const catKey = cat.id ?? cat.tempId;

                    return (
                        <div key={catKey} className="grid grid-cols-[1.1fr_2fr] border-t border-gray-400">
                            {/* Category cell */}
                            <div className="border-r border-gray-400 px-4 py-3">
                                <div className="flex items-start justify-between gap-3">
                                    {editingCategoryId === catKey ? (
                                        <input
                                            value={categoryDraft}
                                            autoFocus
                                            onChange={(e) => setCategoryDraft(e.target.value)}
                                            onBlur={async () => {
                                                const name = (categoryDraft || "").trim();

                                                // Empty -> remove temp row
                                                if (!name) {
                                                    setCategories((prev) => (prev || []).filter((c) => (c.id ?? c.tempId) !== catKey));
                                                    setEditingCategoryId(null);
                                                    return;
                                                }

                                                // update UI immediately
                                                setCategories((prev) =>
                                                    (prev || []).map((c) => ((c.id ?? c.tempId) === catKey ? { ...c, name } : c))
                                                );

                                                setEditingCategoryId(null);

                                                try {
                                                    // Create if new
                                                    if (!cat.id) {
                                                        const res = await saveCategory({
                                                            id: null,
                                                            oppId: opportunityId,
                                                            name,
                                                            categoryName: name,
                                                        });

                                                        const newId = res?.data?.id;

                                                        if (newId) {
                                                            setCategories((prev) =>
                                                                (prev || []).map((c) =>
                                                                    (c.id ?? c.tempId) === catKey ? { ...c, id: newId, isNew: false } : c
                                                                )
                                                            );
                                                        } else {
                                                            await loadAll();
                                                        }
                                                    } else {
                                                        // Update existing
                                                        await updateCategory(cat.id, {
                                                            id: cat.id,
                                                            oppId: opportunityId,
                                                            name,
                                                            categoryName: name,
                                                        });
                                                    }
                                                } catch (err) {
                                                    console.log(err);
                                                    await loadAll();
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") e.currentTarget.blur();
                                                if (e.key === "Escape") {
                                                    if (!cat.id) {
                                                        setCategories((prev) => (prev || []).filter((c) => (c.id ?? c.tempId) !== catKey));
                                                        setEditingCategoryId(null);
                                                        return;
                                                    }
                                                    setCategories((prev) =>
                                                        (prev || []).map((c) => (c.id === cat.id ? { ...c, name: originalCategoryName } : c))
                                                    );
                                                    setEditingCategoryId(null);
                                                }
                                            }}
                                            className="w-full border border-blue-400 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                                            placeholder="Category name"
                                        />
                                    ) : (
                                        <div className="w-full flex items-start">
                                            <div className="grow">
                                                <button
                                                    type="button"
                                                    onClick={() => startEditCategory(cat)}
                                                    className="text-left font-medium hover:underline"
                                                    title="Click to edit category"
                                                >
                                                    {cat.name}
                                                </button>
                                            </div>
                                            <Tooltip title="Delete Category" arrow>
                                                <span>
                                                    <Components.IconButton
                                                        onClick={() => {
                                                            // if new/temp category -> remove locally without confirm
                                                            if (!cat?.id) {
                                                                setCategories((prev) =>
                                                                    (prev || []).filter((c) => (c.id ?? c.tempId) !== catKey)
                                                                );
                                                                setEditingCategoryId(null);
                                                                return;
                                                            }

                                                            handleOpenDeleteDialog({
                                                                type: "category",
                                                                categoryId: cat.id,
                                                            });
                                                        }}
                                                        disabled={loading}
                                                    >
                                                        <CustomIcons
                                                            iconName="fa-solid fa-trash"
                                                            css="cursor-pointer text-red-600 h-4 w-4"
                                                        />
                                                    </Components.IconButton>
                                                </span>
                                            </Tooltip>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Resources cell */}
                            <div className="px-4 py-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        {cat.resources?.length ? (
                                            <div className="flex flex-col gap-2">
                                                {cat.resources.map((res) => (
                                                    <div key={res.id} className="flex items-center justify-between gap-3">
                                                        <button
                                                            type="button"
                                                            className="flex items-center gap-2 text-left min-w-0"
                                                            onClick={() => openEditResourceModal(cat.id, res.id)}
                                                            title="Click to update"
                                                        >
                                                            <span className="shrink-0">{renderResourceIcon(res)}</span>
                                                            <span className="text-blue-600 underline hover:text-blue-700 truncate">
                                                                {res.name}
                                                            </span>
                                                        </button>

                                                        <Tooltip title="Delete Resource" arrow>
                                                            <span>
                                                                <Components.IconButton
                                                                    onClick={() =>
                                                                        handleOpenDeleteDialog({
                                                                            type: "resource",
                                                                            categoryId: cat.id,
                                                                            resourceId: res.id,
                                                                        })
                                                                    }
                                                                    disabled={loading}
                                                                >
                                                                    <CustomIcons
                                                                        iconName="fa-solid fa-trash"
                                                                        css="cursor-pointer text-red-600 h-4 w-4"
                                                                    />
                                                                </Components.IconButton>
                                                            </span>
                                                        </Tooltip>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-gray-400 italic">No resources</div>
                                        )}
                                    </div>

                                    {/* Add resource button */}
                                    <Tooltip title="Add resource" arrow>
                                        <div className="bg-blue-600 h-7 w-7 flex justify-center items-center rounded-full text-white shrink-0">
                                            <Components.IconButton
                                                onClick={(e) => openResourceMenu(e, cat.id)}
                                                disabled={loading || !cat.id} // disable for temp category until saved
                                            >
                                                <CustomIcons iconName="fa-solid fa-plus" css="cursor-pointer text-white h-3.5 w-3.5" />
                                            </Components.IconButton>
                                        </div>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* ✅ One single portal menu (NOT inside row) */}
                <Components.Menu
                    anchorEl={resourceMenuAnchor}
                    open={Boolean(resourceMenuAnchor)}
                    onClose={closeResourceMenu}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                    PaperProps={{
                        sx: {
                            borderRadius: 2,
                            mt: 1,
                            minWidth: 220,
                            boxShadow: "0px 10px 30px rgba(0,0,0,0.15)",
                        },
                    }}
                >
                    <Components.MenuItem
                        onClick={() => openAddAttachmentModal(resourceMenuCatId)}
                        disabled={!resourceMenuCatId}
                    >
                        <Components.ListItemIcon>
                            <CustomIcons iconName="fa-solid fa-paperclip" css="text-gray-700 h-4 w-4" />
                        </Components.ListItemIcon>
                        <Components.ListItemText primary="Add Attachment" />
                    </Components.MenuItem>

                    <Components.MenuItem
                        onClick={() => openAddLinksModal(resourceMenuCatId)}
                        disabled={!resourceMenuCatId}
                    >
                        <Components.ListItemIcon>
                            <CustomIcons iconName="fa-solid fa-link" css="text-gray-700 h-4 w-4" />
                        </Components.ListItemIcon>
                        <Components.ListItemText primary="Add Links" />
                    </Components.MenuItem>
                </Components.Menu>

            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40" onClick={closeModal} />

                    <div
                        className="relative w-[92%] max-w-5xl rounded-xl bg-white shadow-2xl border border-gray-200 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b">
                            <div>
                                <div className="text-lg font-semibold">
                                    {modalMode === "edit"
                                        ? modalType === "link"
                                            ? "Update Link"
                                            : "Update Attachment"
                                        : modalType === "link"
                                            ? "Add Links"
                                            : "Add Attachment"}
                                </div>
                                <div className="text-sm text-gray-500">
                                    Category: <span className="font-medium">{activeCategory?.name}</span>
                                </div>
                            </div>
                            <Tooltip title="Close" arrow>
                                <Components.IconButton onClick={closeModal}>
                                    <CustomIcons iconName="fa-solid fa-xmark" css="cursor-pointer text-black h-6 w-6" />
                                </Components.IconButton>
                            </Tooltip>
                        </div>

                        {/* body */}
                        <div className="px-5 py-2">
                            {/* ADD LINKS */}
                            {modalMode === "add" && modalType === "link" && (
                                <>
                                    <div className="flex items-center justify-end mb-3">
                                        <Tooltip title="Add link row" arrow>
                                            <div className="bg-blue-600 h-8 w-8 flex justify-center items-center rounded-full text-white">
                                                <Components.IconButton onClick={addLinkRow}>
                                                    <CustomIcons iconName="fa-solid fa-plus" css="cursor-pointer text-white h-4 w-4" />
                                                </Components.IconButton>
                                            </div>
                                        </Tooltip>
                                    </div>

                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        <div className="w-full overflow-x-auto">
                                            <table className="w-full border-collapse">
                                                <thead>
                                                    <tr className="text-left text-sm font-semibold text-gray-700 bg-white">
                                                        <th className="px-4 py-3 border-b w-[260px]">Link name</th>
                                                        <th className="px-4 py-3 border-b">Link</th>
                                                        <th className="px-4 py-3 border-b w-[90px] text-center">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(linkRows || []).map((row) => (
                                                        <tr key={row.id} className="align-top">
                                                            <td className="px-4 py-4 border-b">
                                                                <Input
                                                                    value={row.name}
                                                                    onChange={(e) => updateLinkRow(row.id, "name", e.target.value)}
                                                                    placeholder="Enter link name"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-4 border-b">
                                                                <Input
                                                                    value={row.url}
                                                                    onChange={(e) => updateLinkRow(row.id, "url", e.target.value)}
                                                                    placeholder="https://example.com"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-4 border-b text-center">
                                                                <Tooltip title="Delete row" arrow>
                                                                    <span>
                                                                        <Components.IconButton onClick={() => deleteLinkRow(row.id)}>
                                                                            <CustomIcons iconName="fa-solid fa-trash" css="cursor-pointer text-red-600 h-5 w-5" />
                                                                        </Components.IconButton>
                                                                    </span>
                                                                </Tooltip>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* EDIT LINK */}
                            {modalMode === "edit" && modalType === "link" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Input
                                            value={linkName}
                                            onChange={(e) => setLinkName(e.target.value)}
                                            placeholder="Enter link name"
                                            label="Link name"
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            value={linkUrl}
                                            onChange={(e) => setLinkUrl(e.target.value)}
                                            placeholder="https://example.com"
                                            label="Link"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* ADD FILES */}
                            {modalMode === "add" && modalType === "file" && (
                                <>
                                    <div className="flex items-center justify-end mb-3">
                                        <Tooltip title="Add file row" arrow>
                                            <div className="bg-blue-600 h-8 w-8 flex justify-center items-center rounded-full text-white">
                                                <Components.IconButton onClick={addFileRow}>
                                                    <CustomIcons iconName="fa-solid fa-plus" css="cursor-pointer text-white h-4 w-4" />
                                                </Components.IconButton>
                                            </div>
                                        </Tooltip>
                                    </div>

                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        <div className="w-full overflow-x-auto">
                                            <table className="w-full border-collapse">
                                                <thead>
                                                    <tr className="text-left text-sm font-semibold text-gray-700 bg-white">
                                                        <th className="px-4 py-3 border-b w-[260px]">File name</th>
                                                        <th className="px-4 py-3 border-b w-[560px]">File</th>
                                                        <th className="px-4 py-3 border-b text-right">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(fileRows || []).map((row) => (
                                                        <tr key={row.id} className="align-top">
                                                            <td className="px-4 py-4 border-b">
                                                                <Input
                                                                    value={row.fileName}
                                                                    onChange={(e) => updateRowName(row.id, e.target.value)}
                                                                    placeholder="Enter file name"
                                                                />
                                                            </td>
                                                            <td className="px-4 border-b">
                                                                <MultipleFileUpload
                                                                    files={row.files}
                                                                    setFiles={(v) => setRowFiles(row.id, v)}
                                                                    existingImages={row.existingImages}
                                                                    setExistingImages={(v) => setRowExistingImages(row.id, v)}
                                                                    placeHolder="Drag & drop files here, or click to select files"
                                                                    isFileUpload={true}
                                                                    removableExistingAttachments={false}
                                                                    flexView={true}
                                                                    type={"docsAttachments"}
                                                                    preview={false}
                                                                    multiple={false}
                                                                />
                                                            </td>
                                                            <td className="px-4 py-4 border-b text-right">
                                                                <Tooltip title="Delete row" arrow>
                                                                    <span>
                                                                        <Components.IconButton onClick={() => deleteFileRow(row.id)}>
                                                                            <CustomIcons iconName="fa-solid fa-trash" css="cursor-pointer text-red-600 h-4 w-4" />
                                                                        </Components.IconButton>
                                                                    </span>
                                                                </Tooltip>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* EDIT FILE */}
                            {modalMode === "edit" && modalType === "file" && (
                                <>
                                    <div className="px-4 py-4">
                                        <Input
                                            value={resourceName}
                                            onChange={(e) => setResourceName(e.target.value)}
                                            label="File name"
                                        />
                                    </div>
                                </>
                                // <div className="border border-gray-200 rounded-lg overflow-hidden">
                                //     <div className="w-full overflow-x-auto">
                                //         <table className="w-full border-collapse">
                                //             <thead>
                                //                 <tr className="text-left text-sm font-semibold text-gray-700 bg-white">
                                //                     <th className="px-4 py-3 border-b w-[260px]">File name</th>
                                //                     <th className="px-4 py-3 border-b w-[560px]">File</th>                                                    
                                //                 </tr>
                                //             </thead>
                                //             <tbody>
                                //                 <tr className="align-top">
                                //                     <td className="px-4 py-4 border-b">
                                //                         <input
                                //                             value={resourceName}
                                //                             onChange={(e) => setResourceName(e.target.value)}
                                //                             className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                                //                             placeholder="Enter file name"
                                //                         />
                                //                     </td>
                                //                     <td className="px-4 border-b">
                                //                         <MultipleFileUpload
                                //                             files={modalFiles}
                                //                             setFiles={setModalFiles}
                                //                             existingImages={existingImages}
                                //                             setExistingImages={setExistingImages}
                                //                             placeHolder="Drag & drop files here, or click to select files"
                                //                             isFileUpload={true}
                                //                             removableExistingAttachments={true}
                                //                             flexView={true}
                                //                             type={"docsAttachments"}
                                //                             preview={false}
                                //                             fallbackFunction={(loadData) => closeModal(loadData)}
                                //                             multiple={false}
                                //                         />
                                //                     </td>
                                //                 </tr>
                                //             </tbody>
                                //         </table>
                                //     </div>
                                // </div>
                            )}
                        </div>

                        {/* footer */}
                        <div className="px-5 py-4 border-t flex items-center justify-end gap-2">
                            <Button
                                type="button"
                                text={modalMode === "edit" ? "Update" : "Save"}
                                onClick={handleSaveOrUpdate}
                                disabled={isSaveDisabled || loading}
                                endIcon={<CustomIcons iconName={'fa-solid fa-floppy-disk'} css="cursor-pointer" />}
                            />
                            <Button
                                type="button"
                                text={'Cancel'}
                                useFor="disabled"
                                onClick={closeModal}
                                startIcon={<CustomIcons iconName={'fa-solid fa-xmark'} css="cursor-pointer mr-2" />}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Delete confirm dialog */}
            <AlertDialog
                open={dialogDelete.open}
                title={dialogDelete.title}
                message={dialogDelete.message}
                actionButtonText={dialogDelete.actionButtonText}
                handleAction={handleDelete}
                handleClose={handleCloseDeleteDialog}
            />
        </div>
    );
};

const mapDispatchToProps = { setAlert };
export default connect(null, mapDispatchToProps)(DealDocs);
// import React, { useEffect, useMemo, useState } from "react";
// import MultipleFileUpload from "../../../components/fileInputBox/multipleFileUpload";
// import { Tooltip } from "@mui/material";
// import Components from "../../../components/muiComponents/components";
// import CustomIcons from "../../../components/common/icons/CustomIcons";

// import {
//     deleteCategory,
//     getCategoryByOppId,
//     saveCategory,
//     updateCategory,
// } from "../../../service/docsCategory/docsCategoryService";

// import {
//     findByDocsCategory,
//     saveAttachments,
//     updateAttachments,
//     deleteAttachments,
// } from "../../../service/docsAttachments/docsAttachmentsService";

// // ✅ import your uploadFiles service (adjust path if needed)
// import { uploadFiles } from "../../../service/common/commonService";
// import Button from "../../../components/common/buttons/button";
// import Input from "../../../components/common/input/input";

// const uid = () => crypto?.randomUUID?.() || String(Date.now() + Math.random());


// const fileBaseName = (name = "") => name.replace(/\.[^/.]+$/, "");

// // Convert backend attachment -> UI resource
// const mapAttachmentToResource = (a) => {
//     const type = (a?.type || "").toLowerCase() === "link" ? "link" : "file";
//     return {
//         id: a?.id, // ✅ backend id
//         type, // "file" | "link"
//         name: type === "link" ? (a?.linkName || "Untitled Link") : (a?.fileName || "Untitled File"),
//         url: a?.link || "",
//         fileUrl: a?.fileUrl || "",
//         imageName: a?.imageName || "",
//         raw: a,
//     };
// };

// // Upload single file -> returns fileUrl (imageURL from API)
// const uploadSingleFileToApi = async ({ file, folderName, userdata }) => {
//     const formData = new FormData();
//     formData.append("file", file);
//     formData.append("folderName", "docsAttachments");  // ✅ must match backend tempFolderName
//     formData.append("userId", userdata?.userId || "");


//     const res = await uploadFiles(formData);
//     // ✅ based on your statement: uploadFiles returns imageURL
//     // but response shape could be {data:{imageURL:""}} or {data:""}
//     const { imageURL } = res?.data?.result?.[0] || {};
//     return imageURL;
// };

// const DealDocs = ({ opportunityId, userdata }) => {
//     const [loading, setLoading] = useState(false);

//     // Categories from API: [{id, name, resources:[]}]
//     const [categories, setCategories] = useState([]);

//     // category edit
//     const [editingCategoryId, setEditingCategoryId] = useState(null);
//     const [categoryDraft, setCategoryDraft] = useState("");
//     const [originalCategoryName, setOriginalCategoryName] = useState("");

//     // modal add/edit
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
//     const [modalType, setModalType] = useState("file"); // "file" | "link"
//     const [activeCategoryId, setActiveCategoryId] = useState(null);
//     const [editingResourceId, setEditingResourceId] = useState(null);

//     // FILE EDIT mode fields
//     const [resourceName, setResourceName] = useState("");
//     const [modalFiles, setModalFiles] = useState([]);
//     const [existingImages, setExistingImages] = useState([]);

//     // FILE ADD mode rows
//     const [fileRows, setFileRows] = useState([]); // [{id, fileName, files:[], existingImages:[]}]

//     // LINK ADD mode rows
//     const [linkRows, setLinkRows] = useState([]); // [{id, name, url}]

//     // LINK EDIT mode fields
//     const [linkName, setLinkName] = useState("");
//     const [linkUrl, setLinkUrl] = useState("");

//     const [resourceMenuAnchor, setResourceMenuAnchor] = useState(null);
//     const [resourceMenuCatId, setResourceMenuCatId] = useState(null);

//     const activeCategory = useMemo(
//         () => categories.find((c) => c.id === activeCategoryId),
//         [categories, activeCategoryId]
//     );

//     // ---------------- Load Categories + Resources ----------------
//     const loadAll = async () => {
//         if (!opportunityId) return;
//         setLoading(true);
//         try {
//             const catRes2 = await getCategoryByOppId(opportunityId);
//             const cats2 = catRes2?.result || [];

//             // For each category, load attachments
//             const catsWithResources = await Promise.all(
//                 (cats2 || []).map(async (cat) => {
//                     const categoryId = cat?.id;
//                     let attachments = [];
//                     try {
//                         const attRes = await findByDocsCategory(categoryId);
//                         attachments = attRes?.result || [];
//                     } catch (e) {
//                         attachments = [];
//                     }

//                     return {
//                         id: categoryId,
//                         name: cat?.categoryName || cat?.name || "Untitled Category",
//                         resources: (attachments || []).map(mapAttachmentToResource),
//                         raw: cat,
//                     };
//                 })
//             );

//             setCategories(catsWithResources);
//         } catch (error) {
//             console.log(error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         loadAll();
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [opportunityId]);

//     // ---------------- Category helpers ----------------
//     const addCategoryRow = () => {
//         const tempId = uid(); // use your uid() helper

//         const draft = {
//             id: null,          // DB id (null until created)
//             tempId,            // local row id
//             name: "",          // start empty for input
//             resources: [],
//             isNew: true,
//         };

//         setCategories((prev) => [draft, ...(prev || [])]); // add on top
//         setEditingCategoryId(tempId);                      // edit mode uses tempId
//         setCategoryDraft("");
//         setOriginalCategoryName("");
//     };

//     const startEditCategory = (cat) => {
//         const editKey = cat.id ?? cat.tempId;
//         setEditingCategoryId(editKey);
//         setCategoryDraft(cat.name || "");
//         setOriginalCategoryName(cat.name || "");
//     };

//     // ---------------- Menu helpers ----------------
//     const openResourceMenu = (e, catId) => {
//         e.stopPropagation();
//         setResourceMenuAnchor(e.currentTarget);
//         setResourceMenuCatId(catId);
//     };

//     const closeResourceMenu = () => {
//         setResourceMenuAnchor(null);
//         setResourceMenuCatId(null);
//     };

//     // ---------------- Modal open/close ----------------
//     const resetModalState = () => {
//         setModalMode("add");
//         setModalType("file");
//         setActiveCategoryId(null);
//         setEditingResourceId(null);

//         setResourceName("");
//         setModalFiles([]);
//         setExistingImages([]);
//         setFileRows([]);

//         setLinkRows([]);
//         setLinkName("");
//         setLinkUrl("");
//     };

//     const closeModal = (loadData = false) => {
//         if (loadData) {
//             loadAll()
//         }
//         setIsModalOpen(false);
//         resetModalState();
//     };

//     // ---------------- FILE: add mode ----------------
//     const openAddAttachmentModal = (catId) => {
//         closeResourceMenu();

//         setModalMode("add");
//         setModalType("file");
//         setActiveCategoryId(catId);
//         setEditingResourceId(null);

//         setResourceName("");
//         setModalFiles([]);
//         setExistingImages([]);

//         setFileRows([
//             { id: uid(), fileName: "", files: [], existingImages: [] },
//         ]);

//         setLinkRows([]);
//         setIsModalOpen(true);
//     };

//     const addFileRow = () => {
//         setFileRows((prev) => [
//             ...(prev || []),
//             { id: uid(), fileName: "", files: [], existingImages: [] },
//         ]);
//     };

//     const deleteFileRow = (rowId) => {
//         setFileRows((prev) => (prev || []).filter((r) => r.id !== rowId));
//     };

//     const updateRowName = (rowId, value) => {
//         setFileRows((prev) =>
//             (prev || []).map((r) => (r.id === rowId ? { ...r, fileName: value } : r))
//         );
//     };

//     const setRowFiles = (rowId, valueOrUpdater) => {
//         setFileRows((prev) =>
//             (prev || []).map((r) => {
//                 if (r.id !== rowId) return r;

//                 const prevFiles = Array.isArray(r.files) ? r.files : [];
//                 const nextFiles =
//                     typeof valueOrUpdater === "function" ? valueOrUpdater(prevFiles) : valueOrUpdater;

//                 const safe = Array.isArray(nextFiles) ? nextFiles : [];
//                 const one = safe.length ? [safe[safe.length - 1]] : [];
//                 return { ...r, files: one };
//             })
//         );
//     };

//     const setRowExistingImages = (rowId, valueOrUpdater) => {
//         setFileRows((prev) =>
//             (prev || []).map((r) => {
//                 if (r.id !== rowId) return r;

//                 const prevEx = Array.isArray(r.existingImages) ? r.existingImages : [];
//                 const nextEx =
//                     typeof valueOrUpdater === "function" ? valueOrUpdater(prevEx) : valueOrUpdater;

//                 return { ...r, existingImages: Array.isArray(nextEx) ? nextEx : [] };
//             })
//         );
//     };

//     // ---------------- LINK: add mode ----------------
//     const openAddLinksModal = (catId) => {
//         closeResourceMenu();

//         setModalMode("add");
//         setModalType("link");
//         setActiveCategoryId(catId);
//         setEditingResourceId(null);

//         setLinkRows([{ id: uid(), name: "", url: "" }]);

//         setFileRows([]);
//         setResourceName("");
//         setModalFiles([]);
//         setExistingImages([]);

//         setIsModalOpen(true);
//     };

//     const addLinkRow = () => {
//         setLinkRows((prev) => [...(prev || []), { id: uid(), name: "", url: "" }]);
//     };

//     const deleteLinkRow = (rowId) => {
//         setLinkRows((prev) => (prev || []).filter((r) => r.id !== rowId));
//     };

//     const updateLinkRow = (rowId, key, value) => {
//         setLinkRows((prev) =>
//             (prev || []).map((r) => (r.id === rowId ? { ...r, [key]: value } : r))
//         );
//     };

//     // ---------------- EDIT: file/link ----------------
//     const openEditResourceModal = (catId, resId) => {
//         const cat = categories.find((c) => c.id === catId);
//         const res = cat?.resources?.find((r) => r.id === resId);
//         if (!res) return;

//         setModalMode("edit");
//         setActiveCategoryId(catId);
//         setEditingResourceId(resId);

//         setFileRows([]);
//         setLinkRows([]);

//         if (res.type === "link") {
//             setModalType("link");
//             setLinkName(res.name || "");
//             setLinkUrl(res.url || "");
//             setIsModalOpen(true);
//             return;
//         }

//         setModalType("file");
//         setResourceName(res.name || "");
//         setModalFiles([]);
//         // Keep existing preview (if you want to show it inside MultipleFileUpload)
//         setExistingImages(
//             res.fileUrl
//                 ? [
//                     {
//                         imageId: res.id,
//                         imageURL: res.fileUrl,
//                         imageName: res.imageName || res.name,
//                     },
//                 ]
//                 : []
//         );
//         setIsModalOpen(true);
//     };

//     // ---------------- Save / Update (API) ----------------
//     const handleSaveOrUpdate = async () => {
//         if (!activeCategoryId) return;

//         // ===== ADD MODE =====
//         if (modalMode === "add") {
//             // ---- ADD FILES
//             if (modalType === "file") {
//                 const rowsWithFiles = (fileRows || []).filter((r) => r?.files?.length);
//                 if (!rowsWithFiles.length) return;

//                 setLoading(true);
//                 try {
//                     const payload = [];

//                     for (const row of rowsWithFiles) {
//                         const f = row.files[0];
//                         const nextName = (row.fileName || "").trim() || fileBaseName(f?.name) || "Untitled";

//                         const fileUrl = await uploadSingleFileToApi({
//                             file: f,
//                             folderName: "oppLogo",
//                             userdata,
//                         });

//                         payload.push({
//                             id: null,
//                             categoryId: activeCategoryId,
//                             type: "File",
//                             linkName: "",
//                             link: "",
//                             fileName: nextName,
//                             imageName: f?.name || "",
//                             fileUrl: fileUrl || "",
//                         });
//                     }

//                     await saveAttachments(payload);

//                     await loadAll();
//                     closeModal();
//                 } catch (e) {
//                     console.log(e);
//                 } finally {
//                     setLoading(false);
//                 }
//                 return;
//             }

//             // ---- ADD LINKS
//             if (modalType === "link") {
//                 const validLinks = (linkRows || []).filter(
//                     (r) => (r?.name || "").trim() && (r?.url || "").trim()
//                 );
//                 if (!validLinks.length) return;

//                 setLoading(true);
//                 try {
//                     const payload = validLinks.map((r) => ({
//                         id: null,
//                         categoryId: activeCategoryId,
//                         type: "Link",
//                         linkName: (r.name || "").trim(),
//                         link: (r.url || "").trim(),
//                         fileName: "",
//                         imageName: "",
//                         fileUrl: "",
//                     }));

//                     await saveAttachments(payload);

//                     await loadAll();
//                     closeModal();
//                 } catch (e) {
//                     console.log(e);
//                 } finally {
//                     setLoading(false);
//                 }
//                 return;
//             }
//         }

//         // ===== EDIT MODE =====
//         if (modalMode === "edit") {
//             if (!editingResourceId) return;

//             // ---- UPDATE LINK (one at a time)
//             if (modalType === "link") {
//                 const n = linkName.trim();
//                 const u = linkUrl.trim();
//                 if (!n || !u) return;

//                 setLoading(true);
//                 try {
//                     await updateAttachments(editingResourceId, {
//                         id: editingResourceId,
//                         categoryId: activeCategoryId,
//                         type: "Link",
//                         linkName: n,
//                         link: u,
//                         fileName: "",
//                         imageName: "",
//                         fileUrl: "",
//                     });

//                     await loadAll();
//                     closeModal();
//                 } catch (e) {
//                     console.log(e);
//                 } finally {
//                     setLoading(false);
//                 }
//                 return;
//             }

//             // ---- UPDATE FILE (one at a time)
//             if (modalType === "file") {
//                 const nextName = resourceName.trim() || "Untitled";

//                 setLoading(true);
//                 try {
//                     let fileUrl = "";
//                     let imageName = "";

//                     // if user uploaded new file -> upload + update fileUrl
//                     if (modalFiles?.length) {
//                         const f = modalFiles[0];
//                         imageName = f?.name || "";
//                         fileUrl = await uploadSingleFileToApi({
//                             file: f,
//                             folderName: "oppLogo",
//                             userdata,
//                         });
//                     } else {
//                         // keep old fileUrl if not uploading a new one
//                         const cat = categories.find((c) => c.id === activeCategoryId);
//                         const res = cat?.resources?.find((r) => r.id === editingResourceId);
//                         fileUrl = res?.fileUrl || "";
//                         imageName = res?.imageName || "";
//                     }

//                     await updateAttachments(editingResourceId, {
//                         id: editingResourceId,
//                         categoryId: activeCategoryId,
//                         type: "File",
//                         linkName: "",
//                         link: "",
//                         fileName: nextName,
//                         imageName: imageName,
//                         fileUrl: fileUrl,
//                     });

//                     await loadAll();
//                     closeModal();
//                 } catch (e) {
//                     console.log(e);
//                 } finally {
//                     setLoading(false);
//                 }
//             }
//         }
//     };

//     const handleDeleteResource = async (catId, resId) => {
//         setLoading(true);
//         try {
//             await deleteAttachments(resId);
//             await loadAll();
//         } catch (e) {
//             console.log(e);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleDeleteCategory = async (catId) => {
//         setLoading(true);
//         try {
//             await deleteCategory(catId);
//             await loadAll();
//         } catch (e) {
//             console.log(e);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const isSaveDisabled = useMemo(() => {
//         if (modalMode === "add") {
//             if (modalType === "file") return !(fileRows || []).some((r) => r?.files?.length);
//             if (modalType === "link")
//                 return !(linkRows || []).some((r) => (r?.name || "").trim() && (r?.url || "").trim());
//         } else {
//             if (modalType === "file") return false;
//             if (modalType === "link") return !(linkName.trim() && linkUrl.trim());
//         }
//         return false;
//     }, [modalMode, modalType, fileRows, linkRows, linkName, linkUrl]);

//     const renderResourceIcon = (res) => {
//         if (res?.type === "link") {
//             return <CustomIcons iconName="fa-solid fa-link" css="text-indigo-600 h-4 w-4" />;
//         }
//         return <CustomIcons iconName="fa-solid fa-paperclip" css="text-indigo-600 h-4 w-4" />;
//     };

//     return (
//         <div className="w-full">
//             <div className="border border-gray-400 bg-white overflow-hidden">
//                 {/* Header */}
//                 <div className="grid grid-cols-[1.1fr_2fr]">
//                     <div className="border-r border-gray-400 px-4 py-3 font-semibold text-center">
//                         <div className="flex items-center justify-center gap-3">
//                             <span className="text-black">Category</span>
//                             <Tooltip title="Add Category" arrow>
//                                 <div className="bg-blue-600 h-6 w-6 flex justify-center items-center rounded-full text-white">
//                                     <Components.IconButton onClick={addCategoryRow} disabled={loading}>
//                                         <CustomIcons iconName="fa-solid fa-plus" css="cursor-pointer text-white h-3 w-3" />
//                                     </Components.IconButton>
//                                 </div>
//                             </Tooltip>
//                         </div>
//                     </div>
//                     <div className="px-4 py-3 font-semibold text-center text-black">
//                         Resource
//                     </div>
//                 </div>

//                 {/* Rows */}
//                 {(categories || []).map((cat) => {
//                     const catKey = cat.id ?? cat.tempId;

//                     return (
//                         <div key={catKey} className="grid grid-cols-[1.1fr_2fr] border-t border-gray-400">
//                             {/* Category cell */}
//                             <div className="border-r border-gray-400 px-4 py-3">
//                                 <div className="flex items-start justify-between gap-3">
//                                     {editingCategoryId === catKey ? (
//                                         <input
//                                             value={categoryDraft}
//                                             autoFocus
//                                             onChange={(e) => setCategoryDraft(e.target.value)}
//                                             onBlur={async () => {
//                                                 const name = (categoryDraft || "").trim();

//                                                 // Empty -> remove temp row
//                                                 if (!name) {
//                                                     setCategories((prev) => (prev || []).filter((c) => (c.id ?? c.tempId) !== catKey));
//                                                     setEditingCategoryId(null);
//                                                     return;
//                                                 }

//                                                 // update UI immediately
//                                                 setCategories((prev) =>
//                                                     (prev || []).map((c) => ((c.id ?? c.tempId) === catKey ? { ...c, name } : c))
//                                                 );

//                                                 setEditingCategoryId(null);

//                                                 try {
//                                                     // Create if new
//                                                     if (!cat.id) {
//                                                         const res = await saveCategory({
//                                                             id: null,
//                                                             oppId: opportunityId,
//                                                             name,
//                                                             categoryName: name,
//                                                         });

//                                                         const newId = res?.data?.id;

//                                                         if (newId) {
//                                                             setCategories((prev) =>
//                                                                 (prev || []).map((c) =>
//                                                                     (c.id ?? c.tempId) === catKey ? { ...c, id: newId, isNew: false } : c
//                                                                 )
//                                                             );
//                                                         } else {
//                                                             await loadAll();
//                                                         }
//                                                     } else {
//                                                         // Update existing
//                                                         await updateCategory(cat.id, {
//                                                             id: cat.id,
//                                                             oppId: opportunityId,
//                                                             name,
//                                                             categoryName: name,
//                                                         });
//                                                     }
//                                                 } catch (err) {
//                                                     console.log(err);
//                                                     await loadAll();
//                                                 }
//                                             }}
//                                             onKeyDown={(e) => {
//                                                 if (e.key === "Enter") e.currentTarget.blur();
//                                                 if (e.key === "Escape") {
//                                                     if (!cat.id) {
//                                                         setCategories((prev) => (prev || []).filter((c) => (c.id ?? c.tempId) !== catKey));
//                                                         setEditingCategoryId(null);
//                                                         return;
//                                                     }
//                                                     setCategories((prev) =>
//                                                         (prev || []).map((c) => (c.id === cat.id ? { ...c, name: originalCategoryName } : c))
//                                                     );
//                                                     setEditingCategoryId(null);
//                                                 }
//                                             }}
//                                             className="w-full border border-blue-400 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
//                                             placeholder="Category name"
//                                         />
//                                     ) : (
//                                         <div className="w-full flex items-start">
//                                             <div className="grow">
//                                                 <button
//                                                     type="button"
//                                                     onClick={() => startEditCategory(cat)}
//                                                     className="text-left font-medium hover:underline"
//                                                     title="Click to edit category"
//                                                 >
//                                                     {cat.name}
//                                                 </button>
//                                             </div>
//                                             <Tooltip title="Delete Category" arrow>
//                                                 <span>
//                                                     <Components.IconButton
//                                                         onClick={() => handleDeleteResource(cat.id, res.id)}
//                                                         disabled={loading}
//                                                     >
//                                                         <CustomIcons
//                                                             iconName="fa-solid fa-trash"
//                                                             css="cursor-pointer text-red-600 h-4 w-4"
//                                                         />
//                                                     </Components.IconButton>
//                                                 </span>
//                                             </Tooltip>
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>

//                             {/* Resources cell */}
//                             <div className="px-4 py-3">
//                                 <div className="flex items-start justify-between gap-3">
//                                     <div className="min-w-0 flex-1">
//                                         {cat.resources?.length ? (
//                                             <div className="flex flex-col gap-2">
//                                                 {cat.resources.map((res) => (
//                                                     <div key={res.id} className="flex items-center justify-between gap-3">
//                                                         <button
//                                                             type="button"
//                                                             className="flex items-center gap-2 text-left min-w-0"
//                                                             onClick={() => openEditResourceModal(cat.id, res.id)}
//                                                             title="Click to update"
//                                                         >
//                                                             <span className="shrink-0">{renderResourceIcon(res)}</span>
//                                                             <span className="text-blue-600 underline hover:text-blue-700 truncate">
//                                                                 {res.name}
//                                                             </span>
//                                                         </button>

//                                                         <Tooltip title="Delete Resource" arrow>
//                                                             <span>
//                                                                 <Components.IconButton
//                                                                     onClick={() => handleDeleteResource(cat.id, res.id)}
//                                                                     disabled={loading}
//                                                                 >
//                                                                     <CustomIcons
//                                                                         iconName="fa-solid fa-trash"
//                                                                         css="cursor-pointer text-red-600 h-4 w-4"
//                                                                     />
//                                                                 </Components.IconButton>
//                                                             </span>
//                                                         </Tooltip>
//                                                     </div>
//                                                 ))}
//                                             </div>
//                                         ) : (
//                                             <div className="text-gray-400 italic">No resources</div>
//                                         )}
//                                     </div>

//                                     {/* Add resource button */}
//                                     <Tooltip title="Add resource" arrow>
//                                         <div className="bg-blue-600 h-7 w-7 flex justify-center items-center rounded-full text-white shrink-0">
//                                             <Components.IconButton
//                                                 onClick={(e) => openResourceMenu(e, cat.id)}
//                                                 disabled={loading || !cat.id} // disable for temp category until saved
//                                             >
//                                                 <CustomIcons iconName="fa-solid fa-plus" css="cursor-pointer text-white h-3.5 w-3.5" />
//                                             </Components.IconButton>
//                                         </div>
//                                     </Tooltip>
//                                 </div>
//                             </div>
//                         </div>
//                     );
//                 })}

//                 {/* ✅ One single portal menu (NOT inside row) */}
//                 <Components.Menu
//                     anchorEl={resourceMenuAnchor}
//                     open={Boolean(resourceMenuAnchor)}
//                     onClose={closeResourceMenu}
//                     anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
//                     transformOrigin={{ vertical: "top", horizontal: "right" }}
//                     PaperProps={{
//                         sx: {
//                             borderRadius: 2,
//                             mt: 1,
//                             minWidth: 220,
//                             boxShadow: "0px 10px 30px rgba(0,0,0,0.15)",
//                         },
//                     }}
//                 >
//                     <Components.MenuItem
//                         onClick={() => openAddAttachmentModal(resourceMenuCatId)}
//                         disabled={!resourceMenuCatId}
//                     >
//                         <Components.ListItemIcon>
//                             <CustomIcons iconName="fa-solid fa-paperclip" css="text-gray-700 h-4 w-4" />
//                         </Components.ListItemIcon>
//                         <Components.ListItemText primary="Add Attachment" />
//                     </Components.MenuItem>

//                     <Components.MenuItem
//                         onClick={() => openAddLinksModal(resourceMenuCatId)}
//                         disabled={!resourceMenuCatId}
//                     >
//                         <Components.ListItemIcon>
//                             <CustomIcons iconName="fa-solid fa-link" css="text-gray-700 h-4 w-4" />
//                         </Components.ListItemIcon>
//                         <Components.ListItemText primary="Add Links" />
//                     </Components.MenuItem>
//                 </Components.Menu>

//             </div>

//             {/* Modal */}
//             {isModalOpen && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center">
//                     <div className="absolute inset-0 bg-black/40" onClick={closeModal} />

//                     <div
//                         className="relative w-[92%] max-w-5xl rounded-xl bg-white shadow-2xl border border-gray-200 overflow-hidden"
//                         onClick={(e) => e.stopPropagation()}
//                     >
//                         {/* header */}
//                         <div className="flex items-center justify-between px-5 py-4 border-b">
//                             <div>
//                                 <div className="text-lg font-semibold">
//                                     {modalMode === "edit"
//                                         ? modalType === "link"
//                                             ? "Update Link"
//                                             : "Update Attachment"
//                                         : modalType === "link"
//                                             ? "Add Links"
//                                             : "Add Attachment"}
//                                 </div>
//                                 <div className="text-sm text-gray-500">
//                                     Category: <span className="font-medium">{activeCategory?.name}</span>
//                                 </div>
//                             </div>
//                             <Tooltip title="Close" arrow>
//                                 <Components.IconButton onClick={closeModal}>
//                                     <CustomIcons iconName="fa-solid fa-xmark" css="cursor-pointer text-black h-6 w-6" />
//                                 </Components.IconButton>
//                             </Tooltip>
//                         </div>

//                         {/* body */}
//                         <div className="px-5 py-2">
//                             {/* ADD LINKS */}
//                             {modalMode === "add" && modalType === "link" && (
//                                 <>
//                                     <div className="flex items-center justify-end mb-3">
//                                         <Tooltip title="Add link row" arrow>
//                                             <div className="bg-blue-600 h-8 w-8 flex justify-center items-center rounded-full text-white">
//                                                 <Components.IconButton onClick={addLinkRow}>
//                                                     <CustomIcons iconName="fa-solid fa-plus" css="cursor-pointer text-white h-4 w-4" />
//                                                 </Components.IconButton>
//                                             </div>
//                                         </Tooltip>
//                                     </div>

//                                     <div className="border border-gray-200 rounded-lg overflow-hidden">
//                                         <div className="w-full overflow-x-auto">
//                                             <table className="w-full border-collapse">
//                                                 <thead>
//                                                     <tr className="text-left text-sm font-semibold text-gray-700 bg-white">
//                                                         <th className="px-4 py-3 border-b w-[260px]">Link name</th>
//                                                         <th className="px-4 py-3 border-b">Link</th>
//                                                         <th className="px-4 py-3 border-b w-[90px] text-center">Action</th>
//                                                     </tr>
//                                                 </thead>
//                                                 <tbody>
//                                                     {(linkRows || []).map((row) => (
//                                                         <tr key={row.id} className="align-top">
//                                                             <td className="px-4 py-4 border-b">
//                                                                 <Input
//                                                                     value={row.name}
//                                                                     onChange={(e) => updateLinkRow(row.id, "name", e.target.value)}
//                                                                     placeholder="Enter link name"
//                                                                 />
//                                                             </td>
//                                                             <td className="px-4 py-4 border-b">
//                                                                 <Input
//                                                                     value={row.url}
//                                                                     onChange={(e) => updateLinkRow(row.id, "url", e.target.value)}
//                                                                     placeholder="https://example.com"
//                                                                 />
//                                                             </td>
//                                                             <td className="px-4 py-4 border-b text-center">
//                                                                 <Tooltip title="Delete row" arrow>
//                                                                     <span>
//                                                                         <Components.IconButton onClick={() => deleteLinkRow(row.id)}>
//                                                                             <CustomIcons iconName="fa-solid fa-trash" css="cursor-pointer text-red-600 h-5 w-5" />
//                                                                         </Components.IconButton>
//                                                                     </span>
//                                                                 </Tooltip>
//                                                             </td>
//                                                         </tr>
//                                                     ))}
//                                                 </tbody>
//                                             </table>
//                                         </div>
//                                     </div>
//                                 </>
//                             )}

//                             {/* EDIT LINK */}
//                             {modalMode === "edit" && modalType === "link" && (
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                     <div>
//                                         <Input
//                                             value={linkName}
//                                             onChange={(e) => setLinkName(e.target.value)}
//                                             placeholder="Enter link name"
//                                             label="Link name"
//                                         />
//                                     </div>
//                                     <div>
//                                         <Input
//                                             value={linkUrl}
//                                             onChange={(e) => setLinkUrl(e.target.value)}
//                                             placeholder="https://example.com"
//                                             label="Link"
//                                         />
//                                     </div>
//                                 </div>
//                             )}

//                             {/* ADD FILES */}
//                             {modalMode === "add" && modalType === "file" && (
//                                 <>
//                                     <div className="flex items-center justify-end mb-3">
//                                         <Tooltip title="Add file row" arrow>
//                                             <div className="bg-blue-600 h-8 w-8 flex justify-center items-center rounded-full text-white">
//                                                 <Components.IconButton onClick={addFileRow}>
//                                                     <CustomIcons iconName="fa-solid fa-plus" css="cursor-pointer text-white h-4 w-4" />
//                                                 </Components.IconButton>
//                                             </div>
//                                         </Tooltip>
//                                     </div>

//                                     <div className="border border-gray-200 rounded-lg overflow-hidden">
//                                         <div className="w-full overflow-x-auto">
//                                             <table className="w-full border-collapse">
//                                                 <thead>
//                                                     <tr className="text-left text-sm font-semibold text-gray-700 bg-white">
//                                                         <th className="px-4 py-3 border-b w-[260px]">File name</th>
//                                                         <th className="px-4 py-3 border-b w-[560px]">File</th>
//                                                         <th className="px-4 py-3 border-b text-right">Action</th>
//                                                     </tr>
//                                                 </thead>
//                                                 <tbody>
//                                                     {(fileRows || []).map((row) => (
//                                                         <tr key={row.id} className="align-top">
//                                                             <td className="px-4 py-4 border-b">
//                                                                 <Input
//                                                                     value={row.fileName}
//                                                                     onChange={(e) => updateRowName(row.id, e.target.value)}
//                                                                     placeholder="Enter file name"
//                                                                 />
//                                                             </td>
//                                                             <td className="px-4 border-b">
//                                                                 <MultipleFileUpload
//                                                                     files={row.files}
//                                                                     setFiles={(v) => setRowFiles(row.id, v)}
//                                                                     existingImages={row.existingImages}
//                                                                     setExistingImages={(v) => setRowExistingImages(row.id, v)}
//                                                                     placeHolder="Drag & drop files here, or click to select files"
//                                                                     isFileUpload={true}
//                                                                     removableExistingAttachments={false}
//                                                                     flexView={true}
//                                                                     type={"docsAttachments"}
//                                                                     preview={false}
//                                                                     multiple={false}
//                                                                 />
//                                                             </td>
//                                                             <td className="px-4 py-4 border-b text-right">
//                                                                 <Tooltip title="Delete row" arrow>
//                                                                     <span>
//                                                                         <Components.IconButton onClick={() => deleteFileRow(row.id)}>
//                                                                             <CustomIcons iconName="fa-solid fa-trash" css="cursor-pointer text-red-600 h-4 w-4" />
//                                                                         </Components.IconButton>
//                                                                     </span>
//                                                                 </Tooltip>
//                                                             </td>
//                                                         </tr>
//                                                     ))}
//                                                 </tbody>
//                                             </table>
//                                         </div>
//                                     </div>
//                                 </>
//                             )}

//                             {/* EDIT FILE */}
//                             {modalMode === "edit" && modalType === "file" && (
//                                 <>
//                                     <div className="px-4 py-4">
//                                         <Input
//                                             value={resourceName}
//                                             onChange={(e) => setResourceName(e.target.value)}
//                                             label="File name"
//                                         />
//                                     </div>
//                                 </>
//                                 // <div className="border border-gray-200 rounded-lg overflow-hidden">
//                                 //     <div className="w-full overflow-x-auto">
//                                 //         <table className="w-full border-collapse">
//                                 //             <thead>
//                                 //                 <tr className="text-left text-sm font-semibold text-gray-700 bg-white">
//                                 //                     <th className="px-4 py-3 border-b w-[260px]">File name</th>
//                                 //                     <th className="px-4 py-3 border-b w-[560px]">File</th>
//                                 //                 </tr>
//                                 //             </thead>
//                                 //             <tbody>
//                                 //                 <tr className="align-top">
//                                 //                     <td className="px-4 py-4 border-b">
//                                 //                         <input
//                                 //                             value={resourceName}
//                                 //                             onChange={(e) => setResourceName(e.target.value)}
//                                 //                             className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
//                                 //                             placeholder="Enter file name"
//                                 //                         />
//                                 //                     </td>
//                                 //                     <td className="px-4 border-b">
//                                 //                         <MultipleFileUpload
//                                 //                             files={modalFiles}
//                                 //                             setFiles={setModalFiles}
//                                 //                             existingImages={existingImages}
//                                 //                             setExistingImages={setExistingImages}
//                                 //                             placeHolder="Drag & drop files here, or click to select files"
//                                 //                             isFileUpload={true}
//                                 //                             removableExistingAttachments={true}
//                                 //                             flexView={true}
//                                 //                             type={"docsAttachments"}
//                                 //                             preview={false}
//                                 //                             fallbackFunction={(loadData) => closeModal(loadData)}
//                                 //                             multiple={false}
//                                 //                         />
//                                 //                     </td>
//                                 //                 </tr>
//                                 //             </tbody>
//                                 //         </table>
//                                 //     </div>
//                                 // </div>
//                             )}
//                         </div>

//                         {/* footer */}
//                         <div className="px-5 py-4 border-t flex items-center justify-end gap-2">
//                             <Button
//                                 type="button"
//                                 text={modalMode === "edit" ? "Update" : "Save"}
//                                 onClick={handleSaveOrUpdate}
//                                 disabled={isSaveDisabled || loading}
//                                 endIcon={<CustomIcons iconName={'fa-solid fa-floppy-disk'} css="cursor-pointer" />}
//                             />
//                             <Button
//                                 type="button"
//                                 text={'Cancel'}
//                                 useFor="disabled"
//                                 onClick={closeModal}
//                                 startIcon={<CustomIcons iconName={'fa-solid fa-xmark'} css="cursor-pointer mr-2" />}
//                             />
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default DealDocs;