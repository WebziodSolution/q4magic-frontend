import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { connect } from "react-redux";
import { setAlert, setSyncingPushStatus } from "../../../redux/commonReducers/commonReducers";

import { Editor } from "react-draft-wysiwyg";
import {
    EditorState,
    ContentState,
    convertToRaw
} from "draft-js";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
import '../../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

import { Tooltip } from "@mui/material";

import Components from "../../../components/muiComponents/components";
import CustomIcons from "../../../components/common/icons/CustomIcons";
import Input from "../../../components/common/input/input";
import Checkbox from "../../../components/common/checkBox/checkbox";
import PermissionWrapper from "../../../components/common/permissionWrapper/PermissionWrapper";
import OpportunityContactModel from "../../../components/models/opportunities/opportunityContactModel";
import AlertDialog from "../../../components/common/alertDialog/alertDialog";

import AddSalesProcessModel from "../../../components/models/opportunities/salesProcess/addSalesProcessModel";
import {
    deleteSalesProcess,
    getAllBySalesOpportunity
} from "../../../service/salesProcess/salesProcessService";

import {
    getAllOpportunitiesContact,
    updateOpportunitiesContact,
    deleteOpportunitiesContact,
} from "../../../service/opportunities/opportunitiesContactService";
import {
    getOpportunityDetails,
    updateOpportunity,
} from "../../../service/opportunities/opportunitiesService";
import { Tabs } from "../../../components/common/tabs/tabs";


const toolbarProperties = {
    options: ["inline", "list", "link", "history"],
    inline: {
        options: ["bold", "italic", "underline", "strikethrough"],
    },
    list: {
        options: ["unordered", "ordered"],
    },
};

const MeddicRow = ({ letter, children }) => (
    <div className="flex border-b-[7px] border-[#ECECEC] last:border-b-0">
        <div className="w-16 bg-[#0478DC] flex items-center justify-center">
            <span className="text-white text-2xl font-bold">{letter}</span>
        </div>
        <div className="flex-1 p-4 bg-white">{children}</div>
    </div>
);

const DecisionMapTimeline = ({ items = [], onEdit, onDelete }) => {
    if (!items || items.length === 0) {
        return (
            <div className="h-full flex items-center justify-center">
                <p className="text-sm text-gray-400 italic">
                    No decision map added yet.
                </p>
            </div>
        );
    }

    const formatStepDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'numeric',
            day: 'numeric'
        });
    };

    // Filter only items that have a goLive date
    const goLiveItems = items.filter(step => step.goLive);

    // Find the item with the latest goLive date
    const lastGoLiveItem = goLiveItems.length
        ? goLiveItems.reduce((latest, current) => {
            const latestDate = new Date(latest.goLive);
            const currentDate = new Date(current.goLive);
            return currentDate > latestDate ? current : latest;
        })
        : null;

    // Format goLive date
    const goLiveText = lastGoLiveItem
        ? new Date(lastGoLiveItem.goLive).toLocaleDateString('en-US', {
            month: 'numeric',
            day: 'numeric'
        })
        : null;
    // Extract reason
    const reasonText = lastGoLiveItem?.reason || null;



    return (
        <div className="w-full h-full flex flex-col justify-between">
            {/* Timeline Container with Scroll */}
            <div className="mt-4 mb-4 overflow-x-auto w-full pb-2 no-scrollbar">
                <div className="flex items-center min-w-max px-2">
                    {items.map((step, index) => (
                        <React.Fragment key={step.id ?? index}>
                            {/* STEP COLUMN */}
                            <div className="flex flex-col items-center min-w-[70px] flex-shrink-0">
                                <Tooltip title={step.notes} arrow>
                                    <span className="font-semibold text-sm text-gray-800 text-center leading-tight break-words px-1 cursor-pointer">
                                        {step.process}
                                    </span>
                                </Tooltip>
                                <span className="w-px h-3 bg-black my-1" />
                                <span className="text-sm text-gray-600">
                                    {formatStepDate(step.processDate)}
                                </span>
                                <div className='flex items-center gap-2 mt-2'>
                                    <Tooltip title="Edit" arrow>
                                        <div className='bg-blue-600 h-5 w-5 flex justify-center items-center rounded-full text-white'>
                                            <Components.IconButton onClick={() => onEdit(step.id)}>
                                                <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-white h-2.5 w-2.5' />
                                            </Components.IconButton>
                                        </div>
                                    </Tooltip>
                                    <Tooltip title="Delete" arrow>
                                        <div className='bg-red-600 h-5 w-5 flex justify-center items-center rounded-full text-white'>
                                            <Components.IconButton onClick={() => onDelete(step.id)}>
                                                <CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer text-white h-2.5 w-2.5' />
                                            </Components.IconButton>
                                        </div>
                                    </Tooltip>
                                </div>
                            </div>

                            {/* HORIZONTAL LINE COLUMN (between steps) */}
                            {index < items.length - 1 && (
                                <div className="flex items-center flex-1 min-w-[60px] flex-shrink-0">
                                    <div className="h-px bg-gray-400 w-full mx-1" />
                                    {index === items.length - 2 && (
                                        <span className="text-gray-400">
                                            <CustomIcons iconName="fa-solid fa-angle-right" />
                                        </span>
                                    )}
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Footer Info (Fixed at bottom, does not scroll) */}
            {(goLiveText || reasonText) && (
                <div className="flex justify-between items-center text-xs text-gray-700 gap-1 border-t border-gray-100 pt-2">

                    {goLiveText && (
                        <span>
                            <span className="font-semibold">Go Live: </span>
                            {goLiveText}
                        </span>
                    )}

                    {reasonText && (
                        <span className="truncate max-w-[50%] text-right" title={reasonText}>
                            <span className="font-semibold">Reason: </span>
                            {reasonText}
                        </span>
                    )}
                </div>
            )}

        </div>
    );
};

const tableData = [
    { label: 'Opp360' },
    { label: 'MEDDIC' },
]

const OpportunitiesInfo = ({ isOpen, opportunityId, handleClose, setAlert, setSyncingPushStatus }) => {
    const [selectedTab, setSelectedTab] = useState(0);

    const [activeEditorHint, setActiveEditorHint] = useState(null);

    const [opportunitiesKeyContact, setOpportunitiesKeyContacts] = useState([]);
    const [opportunitiesContacts, setOpportunitiesContacts] = useState([]);
    const [economicBuyerContacts, setEconomicBuyerContacts] = useState([]);
    const [selectedType, setSelectedType] = useState("Opp360");

    const [whyDoAnythingState, setWhyDoAnythingState] = useState(
        EditorState.createEmpty()
    );
    const [currentEnvironmentState, setCurrentEnvironmentState] = useState(
        EditorState.createEmpty()
    );
    const [businessValueState, setBusinessValueState] = useState(
        EditorState.createEmpty()
    );

    const [whyDoAnythingHTML, setWhyDoAnythingHTML] = useState("");
    const [currentEnvironmentHTML, setCurrentEnvironmentHTML] = useState("");
    const [businessValueHTML, setBusinessValueHTML] = useState("");
    const [nextStepsValue, setNextStepsValue] = useState("");
    
    // Store original values for comparison
    const [originalWhyDoAnythingHTML, setOriginalWhyDoAnythingHTML] = useState("");
    const [originalCurrentEnvironmentHTML, setOriginalCurrentEnvironmentHTML] = useState("");
    const [originalBusinessValueHTML, setOriginalBusinessValueHTML] = useState("");
    const [originalNextStepsValue, setOriginalNextStepsValue] = useState("");
    const [originalKeyContacts, setOriginalKeyContacts] = useState([]);

    const [isEditingWhy, setIsEditingWhy] = useState(false);
    const [isEditingCurrentEnv, setIsEditingCurrentEnv] = useState(false);
    const [isEditingValue, setIsEditingValue] = useState(false);
    const [isEditingContacts, setIsEditingContacts] = useState(false);
    const [isEditingNextSteps, setIsEditingNextSteps] = useState(false);

    // MEDDIC inline edits
    // M => Value
    const [isEditingMValue, setIsEditingMValue] = useState(false);
    // I => Why Do Anything
    const [isEditingIWhy, setIsEditingIWhy] = useState(false);
    // E => Economic Buyer contacts
    const [isEditingEContacts, setIsEditingEContacts] = useState(false);
    // C => Champion (all contacts)
    const [isEditingCContacts, setIsEditingCContacts] = useState(false);

    // Track which field is currently being edited
    const [currentlyEditingField, setCurrentlyEditingField] = useState(null);

    const isAnyOpp360Editing =
        isEditingWhy ||
        isEditingCurrentEnv ||
        isEditingValue ||
        isEditingContacts ||   // Opp360 Key Contacts
        isEditingNextSteps;

    // MEDDIC: all types of editing
    const isAnyMeddicEditing =
        isEditingMValue ||
        isEditingIWhy ||
        isEditingEContacts ||
        isEditingCContacts;

    // MEDDIC: header SAVE should only appear for text edits (M & I)
    const isAnyMeddicEditingHeader =
        isEditingMValue ||
        isEditingIWhy;

    // Key contacts edit tracking
    const [initialIsKey, setInitialIsKey] = useState({});
    const [editedContacts, setEditedContacts] = useState([]);

    // Contact modal + delete dialog
    const [saveButton, setSaveButton] = useState(true);
    const [contactModalOpen, setContactModalOpen] = useState(false);
    const [selectedContactId, setSelectedContactId] = useState(null);
    const [dialogContact, setDialogContact] = useState({
        open: false,
        title: "",
        message: "",
        actionButtonText: "",
    });

    // Decision Map (Sales Process)
    const [salesProcess, setSalesProcess] = useState([]);
    const [openDecisionMapModel, setOpenDecisionMapModel] = useState(false);
    const [salesProcessId, setSalesProcessId] = useState(null);
    const [dialogDeleteDecisionMap, setDialogDeleteDecisionMap] = useState({
        open: false,
        title: "",
        message: "",
        actionButtonText: "",
    });

    // Unsaved changes dialog
    const [unsavedChangesDialog, setUnsavedChangesDialog] = useState({
        open: false,
        title: "Unsaved Changes",
        message: "You have unsaved changes. Do you want to save?",
        actionButtonText: "Save",
        cancelButtonText: "Don't Save",
        pendingAction: null, // 'close', 'cancel', or 'switchField'
        targetField: null, // Field to switch to after save/discard
    });

    const hasUnsavedChanges = () => {
        // Check text editor changes
        const hasTextChanges = 
            whyDoAnythingState.getCurrentContent().getPlainText() !== 
                ContentState.createFromText(originalWhyDoAnythingHTML).getPlainText() ||
            currentEnvironmentState.getCurrentContent().getPlainText() !== 
                ContentState.createFromText(originalCurrentEnvironmentHTML).getPlainText() ||
            businessValueState.getCurrentContent().getPlainText() !== 
                ContentState.createFromText(originalBusinessValueHTML).getPlainText() ||
            nextStepsValue !== originalNextStepsValue;
        
        // Check contact changes
        const hasContactChanges = editedContacts.length > 0;
        
        return hasTextChanges || hasContactChanges;
    };

    // Check if a specific field has unsaved changes
    const hasUnsavedChangesInField = (field) => {
        switch (field) {
            case "WhyDoAnything":
            case "MeddicI":
                return whyDoAnythingState.getCurrentContent().getPlainText() !== 
                    ContentState.createFromText(originalWhyDoAnythingHTML).getPlainText();
            case "CurrentEnvironment":
                return currentEnvironmentState.getCurrentContent().getPlainText() !== 
                    ContentState.createFromText(originalCurrentEnvironmentHTML).getPlainText();
            case "BusinessValue":
            case "MeddicM":
                return businessValueState.getCurrentContent().getPlainText() !== 
                    ContentState.createFromText(originalBusinessValueHTML).getPlainText();
            case "NextSteps":
                return nextStepsValue !== originalNextStepsValue;
            case "KeyContacts":
            case "MeddicE":
            case "MeddicC":
                return editedContacts.length > 0;
            default:
                return false;
        }
    };

    // Check if any field is currently being edited
   const isAnyFieldEditing = () => {
    return currentlyEditingField !== null;
};

    // Get the currently editing field name
    const getCurrentEditingField = () => {
        if (isEditingWhy || isEditingIWhy) return "WhyDoAnything";
        if (isEditingCurrentEnv) return "CurrentEnvironment";
        if (isEditingValue || isEditingMValue) return "BusinessValue";
        if (isEditingNextSteps) return "NextSteps";
        if (isEditingContacts || isEditingEContacts || isEditingCContacts) return "KeyContacts";
        return null;
    };

  const handleChangeTab = (value) => {
    if (hasUnsavedChanges() && isAnyFieldEditing()) {
        setUnsavedChangesDialog({
            ...unsavedChangesDialog,
            open: true,
            pendingAction: 'tabChange',
            newTabValue: value,
        });
    } else {
        setSelectedType(value === 0 ? "Opp360" : "MEDDIC");
        setSelectedTab(value);
    }
}

    const {
        reset,
        watch,
        getValues
    } = useForm({
        defaultValues: {
            id: null,
            accountName: null,
            logo: null,
            nextSteps: null,
            whyDoAnything: null,
            businessValue: null,
            currentEnvironment: null,
            decisionMap: null,
            decisionCriteria: null,
        },
    });


    const initEditorFromHtml = (html) => {
        const safeHtml = (html || "").trim();
        if (!safeHtml) {
            return EditorState.createEmpty();
        }
        const blocksFromHtml = htmlToDraft(safeHtml);
        const { contentBlocks, entityMap } = blocksFromHtml;
        const contentState = ContentState.createFromBlockArray(
            contentBlocks,
            entityMap
        );
        return EditorState.createWithContent(contentState);
    };

    const handleGetOpportunityDetails = async () => {
        if (!opportunityId || !isOpen) return;
        const res = await getOpportunityDetails(opportunityId);
        if (res?.status === 200) {
            const result = res.result || {};
            reset(result);

            const whyHtml = result.whyDoAnything || "";
            const curEnvHtml = result.currentEnvironment || "";
            const valHtml = result.businessValue || "";

            // Store original values
            setOriginalWhyDoAnythingHTML(whyHtml);
            setOriginalCurrentEnvironmentHTML(curEnvHtml);
            setOriginalBusinessValueHTML(valHtml);
            setOriginalNextStepsValue(result.nextSteps || "");

            // Set current values
            setWhyDoAnythingHTML(whyHtml);
            setCurrentEnvironmentHTML(curEnvHtml);
            setBusinessValueHTML(valHtml);
            setNextStepsValue(result.nextSteps || "");

            setWhyDoAnythingState(initEditorFromHtml(whyHtml));
            setCurrentEnvironmentState(initEditorFromHtml(curEnvHtml));
            setBusinessValueState(initEditorFromHtml(valHtml));
        }
    };

    const handleGetOppContacts = async () => {
        if (!isOpen || !opportunityId) return;
        const res = await getAllOpportunitiesContact(opportunityId);
        const list = Array.isArray(res?.result) ? res.result : [];

        setEconomicBuyerContacts(
            list.filter(
                (row) => row.role && row.role.toLowerCase() === "economic buyer"
            )
        );
        setOpportunitiesKeyContacts(list.filter((row) => row.isKey === true));
        setOpportunitiesContacts(list);

        // Store original key contacts
        setOriginalKeyContacts(list.map(c => ({ id: c.id, isKey: c.isKey })));

        const map = {};
        list.forEach((c) => {
            if (c?.id != null) map[c.id] = !!c.isKey;
        });
        setInitialIsKey(map);
        setEditedContacts([]);
    };

    const handleGetAllSalesProcess = async () => {
        if (!opportunityId || !isOpen) return;
        const res = await getAllBySalesOpportunity(opportunityId);
        if (res?.status === 200) {
            setSalesProcess(Array.isArray(res.result) ? res.result : []);
        }
    };

useEffect(() => {
    if (isOpen && opportunityId) {
        handleGetOpportunityDetails();
        handleGetOppContacts();
        handleGetAllSalesProcess();
        setCurrentlyEditingField(null);
    }

    if (!isOpen) {
        setIsEditingWhy(false);
        setIsEditingCurrentEnv(false);
        setIsEditingValue(false);
        setIsEditingContacts(false);
        setIsEditingNextSteps(false);

        setIsEditingMValue(false);
        setIsEditingIWhy(false);
        setIsEditingEContacts(false);
        setIsEditingCContacts(false);
        setCurrentlyEditingField(null);
    }

    // Update currentlyEditingField whenever edit states change
    const currentField = getCurrentEditingField();
    setCurrentlyEditingField(currentField);

    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [isOpen, opportunityId, isEditingWhy, isEditingCurrentEnv, isEditingValue, 
    isEditingContacts, isEditingNextSteps, isEditingMValue, isEditingIWhy, 
    isEditingEContacts, isEditingCContacts]);

    // --- Unsaved Changes Dialog Handlers ---
    const handleCloseWithUnsavedCheck = () => {
        if (hasUnsavedChanges() && isAnyFieldEditing()) {
            setUnsavedChangesDialog({
                ...unsavedChangesDialog,
                open: true,
                pendingAction: 'close',
            });
        } else {
            handleClose();
        }
    };

    const handleCancelWithUnsavedCheck = () => {
        if (hasUnsavedChanges() && isAnyFieldEditing()) {
            setUnsavedChangesDialog({
                ...unsavedChangesDialog,
                open: true,
                pendingAction: 'cancel',
            });
        } else {
            handleCancelOpp360();
        }
    };

    const handleUnsavedDialogAction = async () => {
        // Save changes
        if (unsavedChangesDialog.pendingAction === 'close') {
            await handleSaveAllOpp360();
            handleClose();
        } else if (unsavedChangesDialog.pendingAction === 'cancel') {
            await handleSaveAllOpp360();
            handleCancelOpp360();
        } else if (unsavedChangesDialog.pendingAction === 'tabChange') {
            await handleSaveAllOpp360();
            setSelectedType(unsavedChangesDialog.newTabValue === 0 ? "Opp360" : "MEDDIC");
            setSelectedTab(unsavedChangesDialog.newTabValue);
        } else if (unsavedChangesDialog.pendingAction === 'switchField') {
            await handleSaveAllOpp360();
            // Now switch to the target field
            startEditFieldDirectly(unsavedChangesDialog.targetField);
        }
        
        setUnsavedChangesDialog({
            ...unsavedChangesDialog,
            open: false,
            pendingAction: null,
            targetField: null,
        });
    };

    const handleUnsavedDialogClose = () => {
        if (unsavedChangesDialog.pendingAction === 'close') {
            handleClose();
        } else if (unsavedChangesDialog.pendingAction === 'cancel') {
            handleCancelOpp360();
        } else if (unsavedChangesDialog.pendingAction === 'tabChange') {
            setSelectedType(unsavedChangesDialog.newTabValue === 0 ? "Opp360" : "MEDDIC");
            setSelectedTab(unsavedChangesDialog.newTabValue);
        } else if (unsavedChangesDialog.pendingAction === 'switchField') {
            // Discard changes and switch to target field
            handleCancelOpp360();
            startEditFieldDirectly(unsavedChangesDialog.targetField);
        }
        
        setUnsavedChangesDialog({
            ...unsavedChangesDialog,
            open: false,
            pendingAction: null,
            targetField: null,
        });
    };

    // --- Opp360 editing ---

    const startEditFieldDirectly = (field) => {
        // Reset all edit states first
        setIsEditingWhy(false);
        setIsEditingCurrentEnv(false);
        setIsEditingValue(false);
        setIsEditingContacts(false);
        setIsEditingNextSteps(false);
        setIsEditingMValue(false);
        setIsEditingIWhy(false);
        setIsEditingEContacts(false);
        setIsEditingCContacts(false);

        // Set the new edit state based on field
        switch (field) {
            case "WhyDoAnything":
                setIsEditingWhy(true);
                setCurrentlyEditingField("WhyDoAnything");
                break;
            case "CurrentEnvironment":
                setIsEditingCurrentEnv(true);
                setCurrentlyEditingField("CurrentEnvironment");
                break;
            case "BusinessValue":
                setIsEditingValue(true);
                setCurrentlyEditingField("BusinessValue");
                break;
            case "KeyContacts": // Opp360 Key Contacts
                setSaveButton(false);
                setIsEditingContacts(true);
                setIsEditingEContacts(false);
                setIsEditingCContacts(false);
                setCurrentlyEditingField("KeyContacts");
                break;
            case "NextSteps":
                setIsEditingNextSteps(true);
                setCurrentlyEditingField("NextSteps");
                break;

            // MEDDIC
            case "MeddicM": // M = Value
                setIsEditingMValue(true);
                setCurrentlyEditingField("MeddicM");
                break;
            case "MeddicI": // I = Why Do Anything
                setIsEditingIWhy(true);
                setCurrentlyEditingField("MeddicI");
                break;
            case "MeddicE": // E = Economic Buyer contacts
                setIsEditingEContacts(true);
                setIsEditingCContacts(false);
                setIsEditingContacts(false);
                setCurrentlyEditingField("MeddicE");
                break;
            case "MeddicC": // C = Champion (all contacts)
                setIsEditingCContacts(true);
                setIsEditingEContacts(false);
                setIsEditingContacts(false);
                setCurrentlyEditingField("MeddicC");
                break;
            default:
                setCurrentlyEditingField(null);
                break;
        }
    };

    const startEditField = (field) => {
        // If no field is currently being edited, start editing directly
        if (!isAnyFieldEditing()) {
            startEditFieldDirectly(field);
            return;
        }

        // If trying to edit the same field, do nothing
        if (currentlyEditingField === field) {
            return;
        }

        // If trying to edit a different field while one is already being edited
        // Check if current field has unsaved changes
        if (hasUnsavedChangesInField(currentlyEditingField)) {
            // Show unsaved changes dialog
            setUnsavedChangesDialog({
                ...unsavedChangesDialog,
                open: true,
                title: "Unsaved Changes",
                message: `You have unsaved changes in "${getFieldDisplayName(currentlyEditingField)}". Do you want to save before editing another field?`,
                actionButtonText: "Save",
                cancelButtonText: "Don't Save",
                pendingAction: 'switchField',
                targetField: field,
            });
        } else {
            // No unsaved changes in current field, switch directly
            handleCancelOpp360(); // This will reset current field
            startEditFieldDirectly(field);
        }
    };

    const getFieldDisplayName = (field) => {
        switch (field) {
            case "WhyDoAnything":
            case "MeddicI":
                return "Why Do Anything";
            case "CurrentEnvironment":
                return "Current Environment";
            case "BusinessValue":
            case "MeddicM":
                return "Value";
            case "NextSteps":
                return "Next Steps";
            case "KeyContacts":
            case "MeddicE":
            case "MeddicC":
                return "Key Contacts";
            default:
                return "this field";
        }
    };

    const handleCancelOpp360 = () => {
        // Reset editor states from original values
        setWhyDoAnythingState(initEditorFromHtml(originalWhyDoAnythingHTML));
        setCurrentEnvironmentState(initEditorFromHtml(originalCurrentEnvironmentHTML));
        setBusinessValueState(initEditorFromHtml(originalBusinessValueHTML));
        setNextStepsValue(originalNextStepsValue);

        // Reset contact changes
        setEditedContacts([]);

        // Reset all edit states
        setIsEditingWhy(false);
        setIsEditingCurrentEnv(false);
        setIsEditingValue(false);
        setIsEditingContacts(false);
        setIsEditingNextSteps(false);

        // MEDDIC flags
        setIsEditingMValue(false);
        setIsEditingIWhy(false);
        setIsEditingEContacts(false);
        setIsEditingCContacts(false);

     setCurrentlyEditingField(null);  // This should set it to null
    setSaveButton(true);
    };

    const handleSaveKeyContacts = async () => {
        if (!editedContacts.length) return;
        try {
            const payload = editedContacts.map((item) => ({
                id: item.id,
                isKey: item.isKey,
            }));
            const res = await updateOpportunitiesContact(payload);
            if (res?.status === 200) {
                setEditedContacts([]);
                await handleGetOppContacts();
                // Update original contacts after save
                const updatedList = await getAllOpportunitiesContact(opportunityId);
                if (updatedList?.result) {
                    setOriginalKeyContacts(updatedList.result.map(c => ({ id: c.id, isKey: c.isKey })));
                }
            }
        } catch (err) {
            console.error("Error updating key contacts", err);
        }
    };

    const handleSaveOpp360 = async () => {
        try {
            const currentValues = getValues();

            const whyHtml = draftToHtml(
                convertToRaw(whyDoAnythingState.getCurrentContent())
            );
            const curEnvHtml = draftToHtml(
                convertToRaw(currentEnvironmentState.getCurrentContent())
            );
            const valHtml = draftToHtml(
                convertToRaw(businessValueState.getCurrentContent())
            );

            let payload = {
                ...currentValues,
                whyDoAnything: whyHtml,
                businessValue: valHtml,
                currentEnvironment: curEnvHtml,
                nextSteps: nextStepsValue
            };

            const res = await updateOpportunity(opportunityId, payload);
            if (res?.status === 200) {
                setSyncingPushStatus(true);
                setWhyDoAnythingHTML(whyHtml || "");
                setCurrentEnvironmentHTML(curEnvHtml || "");
                setBusinessValueHTML(valHtml || "");
                
                // Update original values after save
                setOriginalWhyDoAnythingHTML(whyHtml || "");
                setOriginalCurrentEnvironmentHTML(curEnvHtml || "");
                setOriginalBusinessValueHTML(valHtml || "");
                setOriginalNextStepsValue(nextStepsValue);

                await handleGetOpportunityDetails();
                setIsEditingWhy(false);
                setIsEditingCurrentEnv(false);
                setIsEditingValue(false);
                setIsEditingNextSteps(false);

                // MEDDIC flags
                setIsEditingMValue(false);
                setIsEditingIWhy(false);
                setIsEditingEContacts(false);
                setIsEditingCContacts(false);

                setCurrentlyEditingField(null);
            } else {
                console.error("Failed to update opportunity Opp360 fields");
            }
        } catch (err) {
            console.error("Error updating Opp360 fields", err);
        }
    };

    const handleSaveAllOpp360 = async () => {
        await handleSaveOpp360();
        await handleSaveKeyContacts();
        setIsEditingContacts(false);
        setCurrentlyEditingField(null);
    };

    // --- Key Contacts helpers ---

    const handleToggleKeyContact = (id, isKey) => {
        setEditedContacts((prev) => {
            const next = [...prev];
            const idx = next.findIndex((e) => e.id === id);

            if (idx >= 0) {
                next[idx] = { id, isKey };
            } else {
                next.push({ id, isKey });
            }

            const original = initialIsKey[id] ?? false;
            const afterIdx = next.findIndex((e) => e.id === id);
            if (afterIdx >= 0 && next[afterIdx].isKey === original) {
                next.splice(afterIdx, 1);
            }
            return next;
        });
    };

    const handleAddContact = () => {
        setSelectedContactId(null);
        setContactModalOpen(true);
    };

    const handleCloseContactModel = () => {
        setSelectedContactId(null);
        setContactModalOpen(false);
    };

    const handleOpenDeleteContactDialog = (id) => {
        setSelectedContactId(id);
        setDialogContact({
            open: true,
            title: "Delete Contact",
            message: "Are you sure! Do you want to delete this contact?",
            actionButtonText: "yes",
        });
    };

    const handleCloseDeleteContactDialog = () => {
        setSelectedContactId(null);
        setDialogContact({
            open: false,
            title: "",
            message: "",
            actionButtonText: "",
        });
    };

    const handleDeleteContact = async () => {
        try {
            const res = await deleteOpportunitiesContact(selectedContactId);
            if (res?.status === 200) {
                setSyncingPushStatus(true);
                handleCloseDeleteContactDialog();
                await handleGetOppContacts();
            }
        } catch (err) {
            console.error("Error deleting contact", err);
        }
    };

    // For Opp360 "Key Contacts" card: only key contacts
    const keyContactsWithEdits = opportunitiesKeyContact.map((c) => {
        const edit = editedContacts.find((e) => e.id === c.id);
        return { ...c, isKey: edit ? edit.isKey : c.isKey };
    });

    // For MEDDIC & key-count logic: ALL contacts with edits applied
    const allContactsWithEdits = opportunitiesContacts.map((c) => {
        const edit = editedContacts.find((e) => e.id === c.id);
        return { ...c, isKey: edit ? edit.isKey : c.isKey };
    });

    // Always compute key count from all contacts
    const currentKeyContactsCount = allContactsWithEdits.filter(
        (c) => c.isKey
    ).length;

    // --- Decision Map (Sales Process) ---

    const handleOpenDecisionMapModel = (id = null) => {
        setSalesProcessId(id);
        setOpenDecisionMapModel(true);
    };

    const handleCloseDecisionMapModel = () => {
        setSalesProcessId(null);
        setOpenDecisionMapModel(false);
    };

    const handleOpenDecisionMapDelete = (id) => {
        setSalesProcessId(id);
        setDialogDeleteDecisionMap({
            open: true,
            title: "Delete Decision Map",
            message: "Are you sure! Do you want to delete decision map ?",
            actionButtonText: "yes",
        });
    };

    const handleCloseDecisionMapDelete = () => {
        setSalesProcessId(null);
        setDialogDeleteDecisionMap({
            open: false,
            title: "",
            message: "",
            actionButtonText: "",
        });
    };

    const handleDeteleDecisionMap = async () => {
        if (!salesProcessId) return;
        try {
            const res = await deleteSalesProcess(salesProcessId);
            if (res?.status === 200) {
                await handleGetAllSalesProcess();
                handleCloseDecisionMapDelete();
            }
        } catch (err) {
            console.error("Error deleting decision map", err);
        }
    };

    return (
        <>
            {/* BACKDROP */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 lg:bg-black/20"
                    onClick={handleCloseWithUnsavedCheck}
                />
            )}

            {/* SLIDE PANEL */}
            <div
                className={`
                    fixed top-0 right-0 z-50 mt-16 lg:mt-0
                    bg-[rgb(224,239,251)] text-gray-900 h-screen
                    border-l border-gray-300 w-3/5
                    flex flex-col
                    transform transition-transform duration-300 ease-in-out
                    shadow-xl
                    ${isOpen ? "translate-x-0" : "translate-x-full"}
                `}
            >
                {/* HEADER */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-300">
                    <div className="flex justify-start items-center gap-3">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center overflow-hidden bg-white">
                            {watch("logo") ? (
                                <a
                                    href={watch("logo")}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <img
                                        src={watch("logo")}
                                        alt="Opp Logo"
                                        className="w-full h-full object-cover"
                                    />
                                </a>
                            ) : (
                                <h2 className="text-lg font-bold text-gray-800 capitalize">
                                    {watch("accountName")
                                        ?.trim()
                                        ?.charAt(0) || ""}
                                </h2>
                            )}
                        </div>

                        {/* Account name + type switch */}
                        <h2 className="text-lg font-bold text-gray-800">
                            {watch("accountName")}
                        </h2>

                        <div className="flex justify-start items-center gap-2">
                            <Tabs tabsData={tableData} selectedTab={selectedTab} handleChange={handleChangeTab}/>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Header SAVE / CANCEL */}
                        {(
                            (selectedType === "Opp360" && isAnyOpp360Editing) ||
                            (selectedType === "MEDDIC" && isAnyMeddicEditing)
                        ) && (
                                <>
                                    {saveButton && (
                                        ((selectedType === "Opp360" && isAnyOpp360Editing) ||
                                            (selectedType === "MEDDIC" && isAnyMeddicEditingHeader)) && (
                                            <Tooltip title="Save" arrow>
                                                <div className="bg-green-600 h-7 w-7 flex justify-center items-center rounded-full text-white">
                                                    <Components.IconButton
                                                        onClick={handleSaveAllOpp360}
                                                    >
                                                        <CustomIcons
                                                            iconName="fa-solid fa-floppy-disk"
                                                            css="cursor-pointer text-white h-3 w-3"
                                                        />
                                                    </Components.IconButton>
                                                </div>
                                            </Tooltip>
                                        )
                                    )}

                                    {/* CANCEL: always show when *anything* is in edit mode */}
                                    <Tooltip title="Cancel" arrow>
                                        <div className="bg-black h-7 w-7 flex justify-center items-center rounded-full text-white">
                                            <Components.IconButton
                                                onClick={handleCancelWithUnsavedCheck}
                                            >
                                                <CustomIcons
                                                    iconName="fa-solid fa-xmark"
                                                    css="cursor-pointer text-white h-3 w-3"
                                                />
                                            </Components.IconButton>
                                        </div>
                                    </Tooltip>
                                </>
                            )}

                        <Components.IconButton onClick={handleCloseWithUnsavedCheck}>
                            <CustomIcons
                                iconName={"fa-solid fa-close"}
                                css="cursor-pointer h-6 w-6 text-black"
                            />
                        </Components.IconButton>
                    </div>
                </div>

                {/* BODY */}
                {selectedTab === 0 && (
                    <div className="flex-1 px-4 py-3 overflow-y-auto overflow-x-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-[360px]">
                            {/* WHY DO ANYTHING */}
                            <div
                                className={`bg-white rounded-2xl shadow-sm border ${currentlyEditingField === "WhyDoAnything" ? "border-blue-500 border-2" : "border-gray-200"} px-5 py-4 flex flex-col cursor-pointer relative`}
                                onClick={() =>
                                    startEditField("WhyDoAnything")
                                }
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-base font-semibold text-gray-800">
                                        Why Do Anything
                                    </h3>                                  
                                </div>
                                {isEditingWhy ? (
                                    <div className="h-52 overflow-y-auto">
                                        <Editor
                                            editorState={whyDoAnythingState}
                                            onEditorStateChange={(state) =>
                                                setWhyDoAnythingState(state)
                                            }
                                            toolbar={toolbarProperties}
                                            wrapperClassName="editor-wrapper-custom border border-gray-300 rounded-md"
                                            editorClassName="editor-class p-2 h-40 overflow-y-auto"
                                            toolbarClassName="toolbar-class border-b border-gray-300"
                                            onFocus={() => setActiveEditorHint("WhyDoAnything")}
                                            onBlur={() => { setActiveEditorHint(null) }}
                                        />
                                        {activeEditorHint === "WhyDoAnything" && (
                                            <div className="absolute top-1/2 -translate-y-1/2 right-[-216px] bg-white border border-gray-200 rounded-md shadow-lg z-50 p-2
                        before:content-[''] before:absolute before:top-1/2 before:-translate-y-1/2 before:left-[-8px] 
                        before:w-4 before:h-4 before:bg-white before:border-l before:border-b before:border-gray-200 before:rotate-45">
                                                <img
                                                    src="/images/WhyDoAnything2.png"
                                                    alt="WhyDoAnything"
                                                    className="max-w-xs max-h-48 object-contain relative z-10"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div
                                        className="text-sm text-gray-700 leading-relaxed space-y-1"
                                        dangerouslySetInnerHTML={{
                                            __html:
                                                whyDoAnythingHTML ||
                                                "<span class='text-gray-400 italic'>No information added yet.</span>",
                                        }}
                                    />
                                )}
                            </div>

                            {/* CURRENT ENVIRONMENT */}
                            <div
                                className={`bg-white rounded-2xl shadow-sm border ${currentlyEditingField === "CurrentEnvironment" ? "border-blue-500 border-2" : "border-gray-200"} px-5 py-4 flex flex-col cursor-pointer`}
                                onClick={() =>
                                    startEditField("CurrentEnvironment")
                                }
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-base font-semibold text-gray-800">
                                        Current Environment
                                    </h3>                                   
                                </div>
                                {isEditingCurrentEnv ? (
                                    <div className="h-52 overflow-y-auto">
                                        <Editor
                                            editorState={currentEnvironmentState}
                                            onEditorStateChange={(state) =>
                                                setCurrentEnvironmentState(
                                                    state
                                                )
                                            }
                                            toolbar={toolbarProperties}
                                            wrapperClassName="editor-wrapper-custom border border-gray-300 rounded-md"
                                            editorClassName="editor-class p-2 h-40 overflow-y-auto"
                                            toolbarClassName="toolbar-class border-b border-gray-300"
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className="text-sm text-gray-700 leading-relaxed space-y-1"
                                        dangerouslySetInnerHTML={{
                                            __html:
                                                currentEnvironmentHTML ||
                                                "<span class='text-gray-400 italic'>No information added yet.</span>",
                                        }}
                                    />
                                )}
                            </div>

                            {/* VALUE */}
                            <div
                                className={`bg-white rounded-2xl shadow-sm border ${currentlyEditingField === "BusinessValue" ? "border-blue-500 border-2" : "border-gray-200"} px-5 py-4 flex flex-col cursor-pointer relative`}
                                onClick={() => startEditField("BusinessValue")}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-base font-semibold text-gray-800">
                                        Value
                                    </h3>                                
                                </div>
                                {isEditingValue ? (
                                    <div className="h-52 overflow-y-auto">
                                        <Editor
                                            editorState={businessValueState}
                                            onEditorStateChange={(state) =>
                                                setBusinessValueState(state)
                                            }
                                            toolbar={toolbarProperties}
                                            wrapperClassName="editor-wrapper-custom border border-gray-300 rounded-md"
                                            editorClassName="editor-class p-2 h-40 overflow-y-auto"
                                            toolbarClassName="toolbar-class border-b border-gray-300"
                                            onFocus={() => setActiveEditorHint("BusinessValue")}
                                            onBlur={() => { setActiveEditorHint(null) }}
                                        />
                                        {activeEditorHint === "BusinessValue" && (
                                            <div className="absolute top-1/2 -translate-y-1/2 right-[-216px] bg-white border border-gray-200 rounded-md shadow-lg z-50 p-2
                        before:content-[''] before:absolute before:top-1/2 before:-translate-y-1/2 before:left-[-8px] 
                        before:w-4 before:h-4 before:bg-white before:border-l before:border-b before:border-gray-200 before:rotate-45">
                                                <img
                                                    src="/images/BusinessValue2.png"
                                                    alt="Business value guidance"
                                                    className="max-w-xs max-h-48 object-contain relative z-10"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div
                                        className="text-sm text-gray-700 leading-relaxed space-y-1"
                                        dangerouslySetInnerHTML={{
                                            __html:
                                                businessValueHTML ||
                                                "<span class='text-gray-400 italic'>No value summary added yet.</span>",
                                        }}
                                    />
                                )}
                            </div>

                            {/* KEY CONTACTS */}
                            <div
                                className={`bg-white rounded-2xl shadow-sm border ${currentlyEditingField === "KeyContacts" ? "border-blue-500 border-2" : "border-gray-200"} px-5 py-4 flex flex-col cursor-pointer`}
                                onClick={() => startEditField("KeyContacts")}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-base font-semibold text-gray-800">
                                        Key Contacts
                                    </h3>
                                    <div className="flex items-center gap-2">                                       
                                        {isEditingContacts && (
                                            <div className="flex items-center gap-2">
                                                {editedContacts.length > 0 && (
                                                    <Tooltip
                                                        title="Save key contacts only"
                                                        arrow
                                                    >
                                                        <div className="bg-blue-600 h-6 w-6 flex justify-center items-center rounded-full text-white">
                                                            <Components.IconButton
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleSaveKeyContacts();
                                                                }}
                                                            >
                                                                <CustomIcons
                                                                    iconName="fa-solid fa-floppy-disk"
                                                                    css="cursor-pointer text-white h-3 w-3"
                                                                />
                                                            </Components.IconButton>
                                                        </div>
                                                    </Tooltip>
                                                )}
                                                <PermissionWrapper
                                                    functionalityName="Opportunities"
                                                    moduleName="Opportunities"
                                                    actionId={2}
                                                    component={
                                                        <Tooltip
                                                            title="Add contact"
                                                            arrow
                                                        >
                                                            <div className="bg-green-600 h-6 w-6 flex justify-center items-center rounded-full text-white">
                                                                <Components.IconButton
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleAddContact();
                                                                    }}
                                                                >
                                                                    <CustomIcons
                                                                        iconName="fa-solid fa-plus"
                                                                        css="cursor-pointer text-white h-3 w-3"
                                                                    />
                                                                </Components.IconButton>
                                                            </div>
                                                        </Tooltip>
                                                    }
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {!isEditingContacts ? (
                                    opportunitiesKeyContact &&
                                        opportunitiesKeyContact.length > 0 ? (
                                        <ul className="space-y-1 text-sm">
                                            {opportunitiesKeyContact.map(
                                                (c) => (
                                                    <li key={c.id}>
                                                        <span className="font-medium text-indigo-600">
                                                            {c.contactName}
                                                        </span>
                                                        {c.role && (
                                                            <>
                                                                <span className="mx-1 text-gray-500">
                                                                    –
                                                                </span>
                                                                <span>
                                                                    {c.role}
                                                                </span>
                                                            </>
                                                        )}
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">
                                            No contacts linked to this
                                            opportunity.
                                        </p>
                                    )
                                ) : (
                                    <div className="space-y-2 max-h-44 overflow-y-auto">
                                        {keyContactsWithEdits.length > 0 ? (
                                            keyContactsWithEdits.map((c) => (
                                                <div
                                                    key={c.id}
                                                    className={`flex items-center justify-between rounded-md px-2 py-1 border text-sm ${c.isKey
                                                        ? "border-blue-500 bg-blue-50"
                                                        : "border-gray-200"
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <PermissionWrapper
                                                            functionalityName="Opportunities"
                                                            moduleName="Opportunities"
                                                            actionId={2}
                                                            component={
                                                                <Checkbox
                                                                    checked={
                                                                        !!c.isKey
                                                                    }
                                                                    disabled={
                                                                        currentKeyContactsCount >=
                                                                        4 &&
                                                                        !c.isKey
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        handleToggleKeyContact(
                                                                            c.id,
                                                                            !c.isKey
                                                                        );
                                                                    }}
                                                                />
                                                            }
                                                        />
                                                        <div>
                                                            <p className="font-semibold text-gray-800">
                                                                {
                                                                    c.contactName
                                                                }
                                                            </p>
                                                            {c.role && (
                                                                <p className="text-xs text-gray-500">
                                                                    {c.role}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <PermissionWrapper
                                                        functionalityName="Opportunities"
                                                        moduleName="Opportunities"
                                                        actionId={2}
                                                        component={
                                                            <Tooltip
                                                                title="Delete contact"
                                                                arrow
                                                            >
                                                                <div className="bg-red-600 h-6 w-6 flex justify-center items-center rounded-full text-white">
                                                                    <Components.IconButton
                                                                        onClick={(
                                                                            e
                                                                        ) => {
                                                                            e.stopPropagation();
                                                                            handleOpenDeleteContactDialog(
                                                                                c.id
                                                                            );
                                                                        }}
                                                                    >
                                                                        <CustomIcons
                                                                            iconName="fa-solid fa-trash"
                                                                            css="cursor-pointer text-white h-3 w-3"
                                                                        />
                                                                    </Components.IconButton>
                                                                </div>
                                                            </Tooltip>
                                                        }
                                                    />
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-400 italic">
                                                No contacts linked to this
                                                opportunity.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* DECISION MAP (TIMELINE) */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-5 py-4 flex flex-col">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-base font-semibold text-gray-800">
                                        Decision Map
                                    </h3>
                                    <PermissionWrapper
                                        functionalityName="Opportunities"
                                        moduleName="Opportunities"
                                        actionId={2}
                                        component={
                                            <Tooltip title="Add step" arrow>
                                                <div className="bg-green-600 h-6 w-6 flex justify-center items-center rounded-full text-white">
                                                    <Components.IconButton
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOpenDecisionMapModel();
                                                        }}
                                                    >
                                                        <CustomIcons
                                                            iconName="fa-solid fa-plus"
                                                            css="cursor-pointer text-white h-3 w-3"
                                                        />
                                                    </Components.IconButton>
                                                </div>
                                            </Tooltip>
                                        }
                                    />
                                </div>
                                <div className="h-52 w-full">
                                    <DecisionMapTimeline
                                        items={salesProcess}
                                        onAdd={() =>
                                            handleOpenDecisionMapModel()
                                        }
                                        onEdit={(id) =>
                                            handleOpenDecisionMapModel(id)
                                        }
                                        onDelete={(id) =>
                                            handleOpenDecisionMapDelete(id)
                                        }
                                    />
                                </div>
                            </div>

                            {/* NEXT STEPS */}
                            <div
                                className={`bg-white rounded-2xl shadow-sm border ${currentlyEditingField === "NextSteps" ? "border-blue-500 border-2" : "border-gray-200"} px-5 py-4 flex flex-col cursor-pointer`}
                                onClick={() => startEditField("NextSteps")}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-base font-semibold text-gray-800">
                                        Next Steps
                                    </h3>                                  
                                </div>
                                {isEditingNextSteps ? (
                                    <Input
                                        multiline
                                        rows={4}
                                        value={nextStepsValue}
                                        onChange={(e) =>
                                            setNextStepsValue(e.target.value)
                                        }
                                    />
                                ) : watch("nextSteps") ? (
                                    <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                        {watch("nextSteps")}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">
                                        No next steps defined.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* MEDDIC VIEW */}
                {selectedTab === 1 && (
                    <div className="flex-1 overflow-y-auto p-4 bg-[rgb(224,239,251)]">
                        <div className="mx-auto border-[7px] border-[#ECECEC] bg-[rgb(224,239,251)]">
                            {/* M - Metrics (Value) */}
                            <MeddicRow letter="M">
                                <div
                                    className={`text-sm text-gray-700 leading-relaxed space-y-1 cursor-pointer ${currentlyEditingField === "MeddicM" ? "border border-blue-500 rounded p-2" : ""}`}
                                    onClick={() => startEditField("MeddicM")}
                                >                                    
                                    {isEditingMValue ? (
                                        <div className="h-40 overflow-y-auto">
                                            <Editor
                                                editorState={businessValueState}
                                                onEditorStateChange={(state) => setBusinessValueState(state)}
                                                toolbar={toolbarProperties}
                                                wrapperClassName="editor-wrapper-custom border border-gray-300 rounded-md"
                                                editorClassName="editor-class p-2 h-32 overflow-y-auto"
                                                toolbarClassName="toolbar-class border-b border-gray-300"
                                            />
                                        </div>
                                    ) : (
                                        <div
                                            className="space-y-1"
                                            dangerouslySetInnerHTML={{
                                                __html:
                                                    businessValueHTML ||
                                                    "<span class='text-gray-400 italic'>-</span>",
                                            }}
                                        />
                                    )}
                                </div>
                            </MeddicRow>

                            {/* E - Economic Buyer (editable like Key Contacts, filtered) */}
                            <MeddicRow letter="E">
                                <div
                                    className={`text-sm text-gray-700 leading-relaxed space-y-1 cursor-pointer ${currentlyEditingField === "MeddicE" ? "border border-blue-500 rounded p-2" : ""}`}
                                    onClick={() => startEditField("MeddicE")}
                                >                                   
                                    {!isEditingEContacts ? (
                                        economicBuyerContacts?.length > 0 ? (
                                            <ul className="space-y-1 text-sm">
                                                {economicBuyerContacts.map((c) => (
                                                    <li key={c.id}>
                                                        <span className="font-medium text-indigo-600">
                                                            {c.contactName}
                                                        </span>
                                                        {c.role && (
                                                            <>
                                                                <span className="mx-1 text-gray-500">–</span>
                                                                <span>{c.role}</span>
                                                            </>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-gray-400 italic">-</p>
                                        )
                                    ) : (
                                        <>
                                            {/* Small save + add, same as Key Contacts behavior */}
                                            <div className="flex items-center justify-end gap-2 mb-2">
                                                {editedContacts.length > 0 && (
                                                    <Tooltip title="Save key contacts only" arrow>
                                                        <div className="bg-blue-600 h-6 w-6 flex justify-center items-center rounded-full text-white">
                                                            <Components.IconButton
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleSaveKeyContacts();
                                                                }}
                                                            >
                                                                <CustomIcons
                                                                    iconName="fa-solid fa-floppy-disk"
                                                                    css="cursor-pointer text-white h-3 w-3"
                                                                />
                                                            </Components.IconButton>
                                                        </div>
                                                    </Tooltip>
                                                )}
                                                <PermissionWrapper
                                                    functionalityName="Opportunities"
                                                    moduleName="Opportunities"
                                                    actionId={2}
                                                    component={
                                                        <Tooltip title="Add contact" arrow>
                                                            <div className="bg-green-600 h-6 w-6 flex justify-center items-center rounded-full text-white">
                                                                <Components.IconButton
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleAddContact();
                                                                    }}
                                                                >
                                                                    <CustomIcons
                                                                        iconName="fa-solid fa-plus"
                                                                        css="cursor-pointer text-white h-3 w-3"
                                                                    />
                                                                </Components.IconButton>
                                                            </div>
                                                        </Tooltip>
                                                    }
                                                />
                                            </div>

                                            <div className="space-y-2 max-h-44 overflow-y-auto">
                                                {allContactsWithEdits.filter(
                                                    (c) =>
                                                        c.role &&
                                                        c.role.toLowerCase() === "economic buyer"
                                                ).length > 0 ? (
                                                    allContactsWithEdits
                                                        .filter(
                                                            (c) =>
                                                                c.role &&
                                                                c.role.toLowerCase() === "economic buyer"
                                                        )
                                                        .map((c) => (
                                                            <div
                                                                key={c.id}
                                                                className={`flex items-center justify-between rounded-md px-2 py-1 border text-sm ${c.isKey ? "border-blue-500 bg-blue-50" : "border-gray-200"
                                                                    }`}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <PermissionWrapper
                                                                        functionalityName="Opportunities"
                                                                        moduleName="Opportunities"
                                                                        actionId={2}
                                                                        component={
                                                                            <Checkbox
                                                                                checked={!!c.isKey}
                                                                                disabled={
                                                                                    currentKeyContactsCount >= 4 && !c.isKey
                                                                                }
                                                                                onChange={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleToggleKeyContact(
                                                                                        c.id,
                                                                                        !c.isKey
                                                                                    );
                                                                                }}
                                                                            />
                                                                        }
                                                                    />
                                                                    <div>
                                                                        <p className="font-semibold text-gray-800">
                                                                            {c.contactName}
                                                                        </p>
                                                                        {c.role && (
                                                                            <p className="text-xs text-gray-500">
                                                                                {c.role}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <PermissionWrapper
                                                                    functionalityName="Opportunities"
                                                                    moduleName="Opportunities"
                                                                    actionId={2}
                                                                    component={
                                                                        <Tooltip
                                                                            title="Delete contact"
                                                                            arrow
                                                                        >
                                                                            <div className="bg-red-600 h-6 w-6 flex justify-center items-center rounded-full text-white">
                                                                                <Components.IconButton
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        handleOpenDeleteContactDialog(
                                                                                            c.id
                                                                                        );
                                                                                    }}
                                                                                >
                                                                                    <CustomIcons
                                                                                        iconName="fa-solid fa-trash"
                                                                                        css="cursor-pointer text-white h-3 w-3"
                                                                                    />
                                                                                </Components.IconButton>
                                                                            </div>
                                                                        </Tooltip>
                                                                    }
                                                                />
                                                            </div>
                                                        ))
                                                ) : (
                                                    <p className="text-sm text-gray-400 italic">
                                                        No economic buyer contacts.
                                                    </p>
                                                )}

                                            </div>
                                        </>
                                    )}
                                </div>
                            </MeddicRow>


                            {/* D - Decision Criteria (not mapped) */}
                            <MeddicRow letter="D">
                                <p className="text-sm text-gray-900 italic">
                                    N/A
                                </p>
                            </MeddicRow>

                            {/* D - Decision Process (Decision Map timeline summary) */}

                            {/* D - Decision Process (Decision Map summary list) */}
                            <MeddicRow letter="D">
                                {salesProcess && salesProcess.length > 0 ? (
                                    <div className="space-y-1 text-sm">
                                        {salesProcess.map((step) => {
                                            const dateLabel = step.processDate
                                                ? new Date(step.processDate).toLocaleDateString("en-US", {
                                                    month: "numeric",
                                                    day: "numeric",
                                                })
                                                : "-";

                                            return (
                                                <div
                                                    key={step.id}
                                                    className="flex items-center justify-between gap-2"
                                                >
                                                    {/* Left: Process - MM/DD */}
                                                    <div className="flex">
                                                        <span className="font-medium text-gray-800">
                                                            {step.process || "-"}
                                                        </span>
                                                        <span className="mx-1 text-gray-500">-</span>
                                                        <span className="text-gray-700">{dateLabel}</span>
                                                    </div>

                                                    {/* Right: action icons */}
                                                    <div className="flex items-center gap-2">
                                                        <Tooltip title="Edit" arrow>
                                                            <div className="bg-blue-600 h-6 w-6 flex justify-center items-center rounded-full text-white">
                                                                <Components.IconButton
                                                                    onClick={() =>
                                                                        handleOpenDecisionMapModel(step.id)
                                                                    }
                                                                >
                                                                    <CustomIcons
                                                                        iconName="fa-solid fa-pen-to-square"
                                                                        css="cursor-pointer text-white h-3 w-3"
                                                                    />
                                                                </Components.IconButton>
                                                            </div>
                                                        </Tooltip>

                                                        <Tooltip title="Delete" arrow>
                                                            <div className="bg-red-600 h-6 w-6 flex justify-center items-center rounded-full text-white">
                                                                <Components.IconButton
                                                                    onClick={() =>
                                                                        handleOpenDecisionMapDelete(step.id)
                                                                    }
                                                                >
                                                                    <CustomIcons
                                                                        iconName="fa-solid fa-trash"
                                                                        css="cursor-pointer text-white h-3 w-3"
                                                                    />
                                                                </Components.IconButton>
                                                            </div>
                                                        </Tooltip>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">No decision steps added.</p>
                                )}
                            </MeddicRow>

                            {/* I - Implicate the Pain (Why Do Anything) */}
                            <MeddicRow letter="I">
                                <div
                                    className={`text-sm text-gray-700 leading-relaxed space-y-1 cursor-pointer ${currentlyEditingField === "MeddicI" ? "border border-blue-500 rounded p-2" : ""}`}
                                    onClick={() => startEditField("MeddicI")}
                                >                                    
                                    {isEditingIWhy ? (
                                        <div className="h-40 overflow-y-auto">
                                            <Editor
                                                editorState={whyDoAnythingState}
                                                onEditorStateChange={(state) => setWhyDoAnythingState(state)}
                                                toolbar={toolbarProperties}
                                                wrapperClassName="editor-wrapper-custom border border-gray-300 rounded-md"
                                                editorClassName="editor-class p-2 h-32 overflow-y-auto"
                                                toolbarClassName="toolbar-class border-b border-gray-300"
                                            />
                                        </div>
                                    ) : (
                                        <div
                                            className="space-y-1"
                                            dangerouslySetInnerHTML={{
                                                __html:
                                                    whyDoAnythingHTML ||
                                                    "<span class='text-gray-400 italic'>-</span>",
                                            }}
                                        />
                                    )}
                                </div>
                            </MeddicRow>

                            {/* C - Champion (all contacts, editable like Key Contacts) */}
                            <MeddicRow letter="C">
                                <div
                                    className={`text-sm text-gray-700 leading-relaxed space-y-1 cursor-pointer ${currentlyEditingField === "MeddicC" ? "border border-blue-500 rounded p-2" : ""}`}
                                    onClick={() => startEditField("MeddicC")}
                                >                                    
                                    {!isEditingCContacts ? (
                                        opportunitiesContacts?.length > 0 ? (
                                            <ul className="space-y-1 text-sm">
                                                {opportunitiesContacts.map((c) => (
                                                    <li key={c.id}>
                                                        <span className={`font-medium ${c.isKey ? "text-indigo-600" : "text-black"}`}>
                                                            {c.contactName}
                                                        </span>
                                                        {c.role && (
                                                            <>
                                                                <span className="mx-1 text-gray-500">–</span>
                                                                <span>{c.role}</span>
                                                            </>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-gray-400 italic">-</p>
                                        )
                                    ) : (
                                        <>
                                            {/* Same mini save/add as E row */}
                                            <div className="flex items-center justify-end gap-2 mb-2">
                                                {opportunitiesContacts.length > 0 && (
                                                    <Tooltip title="Save" arrow>
                                                        <div className="bg-blue-600 h-6 w-6 flex justify-center items-center rounded-full text-white">
                                                            <Components.IconButton
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleSaveKeyContacts();
                                                                }}
                                                            >
                                                                <CustomIcons
                                                                    iconName="fa-solid fa-floppy-disk"
                                                                    css="cursor-pointer text-white h-3 w-3"
                                                                />
                                                            </Components.IconButton>
                                                        </div>
                                                    </Tooltip>
                                                )}
                                                <PermissionWrapper
                                                    functionalityName="Opportunities"
                                                    moduleName="Opportunities"
                                                    actionId={2}
                                                    component={
                                                        <Tooltip title="Add contact" arrow>
                                                            <div className="bg-green-600 h-6 w-6 flex justify-center items-center rounded-full text-white">
                                                                <Components.IconButton
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleAddContact();
                                                                    }}
                                                                >
                                                                    <CustomIcons
                                                                        iconName="fa-solid fa-plus"
                                                                        css="cursor-pointer text-white h-3 w-3"
                                                                    />
                                                                </Components.IconButton>
                                                            </div>
                                                        </Tooltip>
                                                    }
                                                />
                                            </div>

                                            <div className="space-y-2 max-h-44 overflow-y-auto">
                                                {allContactsWithEdits.length > 0 ? (
                                                    allContactsWithEdits.map((c) => (
                                                        <div
                                                            key={c.id}
                                                            className={`flex items-center justify-between rounded-md px-2 py-1 border text-sm ${c.isKey ? "border-blue-500 bg-blue-50" : "border-gray-200"
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <PermissionWrapper
                                                                    functionalityName="Opportunities"
                                                                    moduleName="Opportunities"
                                                                    actionId={2}
                                                                    component={
                                                                        <Checkbox
                                                                            checked={!!c.isKey}
                                                                            disabled={
                                                                                currentKeyContactsCount >= 4 && !c.isKey
                                                                            }
                                                                            onChange={(e) => {
                                                                                e.stopPropagation();
                                                                                handleToggleKeyContact(
                                                                                    c.id,
                                                                                    !c.isKey
                                                                                );
                                                                            }}
                                                                        />
                                                                    }
                                                                />
                                                                <div>
                                                                    <p className="font-semibold text-gray-800">
                                                                        {c.contactName}
                                                                    </p>
                                                                    {c.role && (
                                                                        <p className="text-xs text-gray-500">
                                                                            {c.role}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <PermissionWrapper
                                                                functionalityName="Opportunities"
                                                                moduleName="Opportunities"
                                                                actionId={2}
                                                                component={
                                                                    <Tooltip title="Delete contact" arrow>
                                                                        <div className="bg-red-600 h-6 w-6 flex justify-center items-center rounded-full text-white">
                                                                            <Components.IconButton
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleOpenDeleteContactDialog(c.id);
                                                                                }}
                                                                            >
                                                                                <CustomIcons
                                                                                    iconName="fa-solid fa-trash"
                                                                                    css="cursor-pointer text-white h-3 w-3"
                                                                                />
                                                                            </Components.IconButton>
                                                                        </div>
                                                                    </Tooltip>
                                                                }
                                                            />
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-gray-400 italic">
                                                        No contacts linked to this opportunity.
                                                    </p>
                                                )}

                                            </div>
                                        </>
                                    )}
                                </div>
                            </MeddicRow>

                        </div>
                    </div>
                )}

                {/* CONTACT MODAL + CONTACT DELETE DIALOG */}
                <OpportunityContactModel
                    open={contactModalOpen}
                    handleClose={handleCloseContactModel}
                    opportunityId={opportunityId}
                    handleGetAllOppContact={handleGetOppContacts}
                />
                <AlertDialog
                    open={dialogContact.open}
                    title={dialogContact.title}
                    message={dialogContact.message}
                    actionButtonText={dialogContact.actionButtonText}
                    handleAction={handleDeleteContact}
                    handleClose={handleCloseDeleteContactDialog}
                />

                {/* DECISION MAP DELETE DIALOG + ADD/EDIT MODAL */}
                <AlertDialog
                    open={dialogDeleteDecisionMap.open}
                    title={dialogDeleteDecisionMap.title}
                    message={dialogDeleteDecisionMap.message}
                    actionButtonText={dialogDeleteDecisionMap.actionButtonText}
                    handleAction={handleDeteleDecisionMap}
                    handleClose={handleCloseDecisionMapDelete}
                />
                <AddSalesProcessModel
                    open={openDecisionMapModel}
                    handleClose={handleCloseDecisionMapModel}
                    id={salesProcessId}
                    oppId={opportunityId}
                    handleGetAllSalesProcess={handleGetAllSalesProcess}
                />
                
                {/* UNSAVED CHANGES DIALOG */}
                <AlertDialog
                    open={unsavedChangesDialog.open}
                    title={unsavedChangesDialog.title}
                    message={unsavedChangesDialog.message}
                    actionButtonText={unsavedChangesDialog.actionButtonText}
                    cancelButtonText={unsavedChangesDialog.cancelButtonText}
                    handleAction={handleUnsavedDialogAction}
                    handleClose={handleUnsavedDialogClose}
                />
            </div>
        </>
    );
};

const mapDispatchToProps = {
    setAlert,
    setSyncingPushStatus
};

export default connect(null, mapDispatchToProps)(OpportunitiesInfo);

// import React, { useEffect, useState } from "react";
// import { useForm } from "react-hook-form";
// import { connect } from "react-redux";
// import { setAlert, setSyncingPushStatus } from "../../../redux/commonReducers/commonReducers";

// import { Editor } from "react-draft-wysiwyg";
// import {
//     EditorState,
//     ContentState,
//     convertToRaw
// } from "draft-js";
// import draftToHtml from "draftjs-to-html";
// import htmlToDraft from "html-to-draftjs";
// import '../../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

// import { Tooltip } from "@mui/material";

// import Components from "../../../components/muiComponents/components";
// import CustomIcons from "../../../components/common/icons/CustomIcons";
// import Dropdown from "../../../components/common/dropdown/dropdown";
// import Input from "../../../components/common/input/input";
// import Checkbox from "../../../components/common/checkBox/checkbox";
// import PermissionWrapper from "../../../components/common/permissionWrapper/PermissionWrapper";
// import OpportunityContactModel from "../../../components/models/opportunities/opportunityContactModel";
// import AlertDialog from "../../../components/common/alertDialog/alertDialog";

// import AddSalesProcessModel from "../../../components/models/opportunities/salesProcess/addSalesProcessModel";
// import {
//     deleteSalesProcess,
//     getAllBySalesOpportunity
// } from "../../../service/salesProcess/salesProcessService";

// import {
//     getAllOpportunitiesContact,
//     updateOpportunitiesContact,
//     deleteOpportunitiesContact,
// } from "../../../service/opportunities/opportunitiesContactService";
// import {
//     getOpportunityDetails,
//     updateOpportunity,
// } from "../../../service/opportunities/opportunitiesService";
// import { Tabs } from "../../../components/common/tabs/tabs";


// const toolbarProperties = {
//     options: ["inline", "list", "link", "history"],
//     inline: {
//         options: ["bold", "italic", "underline", "strikethrough"],
//     },
//     list: {
//         options: ["unordered", "ordered"],
//     },
// };

// const MeddicRow = ({ letter, children }) => (
//     <div className="flex border-b-[7px] border-[#ECECEC] last:border-b-0">
//         <div className="w-16 bg-[#0478DC] flex items-center justify-center">
//             <span className="text-white text-2xl font-bold">{letter}</span>
//         </div>
//         <div className="flex-1 p-4 bg-white">{children}</div>
//     </div>
// );

// const DecisionMapTimeline = ({ items = [], onEdit, onDelete }) => {
//     if (!items || items.length === 0) {
//         return (
//             <div className="h-full flex items-center justify-center">
//                 <p className="text-sm text-gray-400 italic">
//                     No decision map added yet.
//                 </p>
//             </div>
//         );
//     }

//     const formatStepDate = (dateString) => {
//         if (!dateString) return '';
//         return new Date(dateString).toLocaleDateString('en-US', {
//             month: 'numeric',
//             day: 'numeric'
//         });
//     };

//     // Filter only items that have a goLive date
//     const goLiveItems = items.filter(step => step.goLive);

//     // Find the item with the latest goLive date
//     const lastGoLiveItem = goLiveItems.length
//         ? goLiveItems.reduce((latest, current) => {
//             const latestDate = new Date(latest.goLive);
//             const currentDate = new Date(current.goLive);
//             return currentDate > latestDate ? current : latest;
//         })
//         : null;

//     // Format goLive date
//     const goLiveText = lastGoLiveItem
//         ? new Date(lastGoLiveItem.goLive).toLocaleDateString('en-US', {
//             month: 'numeric',
//             day: 'numeric'
//         })
//         : null;
//     // Extract reason
//     const reasonText = lastGoLiveItem?.reason || null;



//     return (
//         <div className="w-full h-full flex flex-col justify-between">
//             {/* Timeline Container with Scroll */}
//             <div className="mt-4 mb-4 overflow-x-auto w-full pb-2 no-scrollbar">
//                 <div className="flex items-center min-w-max px-2">
//                     {items.map((step, index) => (
//                         <React.Fragment key={step.id ?? index}>
//                             {/* STEP COLUMN */}
//                             <div className="flex flex-col items-center min-w-[70px] flex-shrink-0">
//                                 <Tooltip title={step.notes} arrow>
//                                     <span className="font-semibold text-sm text-gray-800 text-center leading-tight break-words px-1 cursor-pointer">
//                                         {step.process}
//                                     </span>
//                                 </Tooltip>
//                                 <span className="w-px h-3 bg-black my-1" />
//                                 <span className="text-sm text-gray-600">
//                                     {formatStepDate(step.processDate)}
//                                 </span>
//                                 <div className='flex items-center gap-2 mt-2'>
//                                     <Tooltip title="Edit" arrow>
//                                         <div className='bg-blue-600 h-5 w-5 flex justify-center items-center rounded-full text-white'>
//                                             <Components.IconButton onClick={() => onEdit(step.id)}>
//                                                 <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-white h-2.5 w-2.5' />
//                                             </Components.IconButton>
//                                         </div>
//                                     </Tooltip>
//                                     <Tooltip title="Delete" arrow>
//                                         <div className='bg-red-600 h-5 w-5 flex justify-center items-center rounded-full text-white'>
//                                             <Components.IconButton onClick={() => onDelete(step.id)}>
//                                                 <CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer text-white h-2.5 w-2.5' />
//                                             </Components.IconButton>
//                                         </div>
//                                     </Tooltip>
//                                 </div>
//                             </div>

//                             {/* HORIZONTAL LINE COLUMN (between steps) */}
//                             {index < items.length - 1 && (
//                                 <div className="flex items-center flex-1 min-w-[60px] flex-shrink-0">
//                                     <div className="h-px bg-gray-400 w-full mx-1" />
//                                     {index === items.length - 2 && (
//                                         <span className="text-gray-400">
//                                             <CustomIcons iconName="fa-solid fa-angle-right" />
//                                         </span>
//                                     )}
//                                 </div>
//                             )}
//                         </React.Fragment>
//                     ))}
//                 </div>
//             </div>

//             {/* Footer Info (Fixed at bottom, does not scroll) */}
//             {(goLiveText || reasonText) && (
//                 <div className="flex justify-between items-center text-xs text-gray-700 gap-1 border-t border-gray-100 pt-2">

//                     {goLiveText && (
//                         <span>
//                             <span className="font-semibold">Go Live: </span>
//                             {goLiveText}
//                         </span>
//                     )}

//                     {reasonText && (
//                         <span className="truncate max-w-[50%] text-right" title={reasonText}>
//                             <span className="font-semibold">Reason: </span>
//                             {reasonText}
//                         </span>
//                     )}
//                 </div>
//             )}

//         </div>
//     );
// };

// const tableData = [
//     { label: 'Opp360' },
//     { label: 'MEDDIC' },
// ]

// const OpportunitiesInfo = ({ isOpen, opportunityId, handleClose, setAlert, setSyncingPushStatus }) => {
//     const [selectedTab, setSelectedTab] = useState(0);

//     const [activeEditorHint, setActiveEditorHint] = useState(null);

//     const [opportunitiesKeyContact, setOpportunitiesKeyContacts] = useState([]);
//     const [opportunitiesContacts, setOpportunitiesContacts] = useState([]);
//     const [economicBuyerContacts, setEconomicBuyerContacts] = useState([]);
//     const [selectedType, setSelectedType] = useState("Opp360");

//     const [whyDoAnythingState, setWhyDoAnythingState] = useState(
//         EditorState.createEmpty()
//     );
//     const [currentEnvironmentState, setCurrentEnvironmentState] = useState(
//         EditorState.createEmpty()
//     );
//     const [businessValueState, setBusinessValueState] = useState(
//         EditorState.createEmpty()
//     );

//     const [whyDoAnythingHTML, setWhyDoAnythingHTML] = useState("");
//     const [currentEnvironmentHTML, setCurrentEnvironmentHTML] = useState("");
//     const [businessValueHTML, setBusinessValueHTML] = useState("");
//     const [nextStepsValue, setNextStepsValue] = useState("");
    
//     // Store original values for comparison
//     const [originalWhyDoAnythingHTML, setOriginalWhyDoAnythingHTML] = useState("");
//     const [originalCurrentEnvironmentHTML, setOriginalCurrentEnvironmentHTML] = useState("");
//     const [originalBusinessValueHTML, setOriginalBusinessValueHTML] = useState("");
//     const [originalNextStepsValue, setOriginalNextStepsValue] = useState("");
//     const [originalKeyContacts, setOriginalKeyContacts] = useState([]);

//     const [isEditingWhy, setIsEditingWhy] = useState(false);
//     const [isEditingCurrentEnv, setIsEditingCurrentEnv] = useState(false);
//     const [isEditingValue, setIsEditingValue] = useState(false);
//     const [isEditingContacts, setIsEditingContacts] = useState(false);
//     const [isEditingNextSteps, setIsEditingNextSteps] = useState(false);

//     // MEDDIC inline edits
//     // M => Value
//     const [isEditingMValue, setIsEditingMValue] = useState(false);
//     // I => Why Do Anything
//     const [isEditingIWhy, setIsEditingIWhy] = useState(false);
//     // E => Economic Buyer contacts
//     const [isEditingEContacts, setIsEditingEContacts] = useState(false);
//     // C => Champion (all contacts)
//     const [isEditingCContacts, setIsEditingCContacts] = useState(false);

//     const isAnyOpp360Editing =
//         isEditingWhy ||
//         isEditingCurrentEnv ||
//         isEditingValue ||
//         isEditingContacts ||   // Opp360 Key Contacts
//         isEditingNextSteps;

//     // MEDDIC: all types of editing
//     const isAnyMeddicEditing =
//         isEditingMValue ||
//         isEditingIWhy ||
//         isEditingEContacts ||
//         isEditingCContacts;

//     // MEDDIC: header SAVE should only appear for text edits (M & I)
//     const isAnyMeddicEditingHeader =
//         isEditingMValue ||
//         isEditingIWhy;

//     // Key contacts edit tracking
//     const [initialIsKey, setInitialIsKey] = useState({});
//     const [editedContacts, setEditedContacts] = useState([]);

//     // Contact modal + delete dialog
//     const [saveButton, setSaveButton] = useState(true);
//     const [contactModalOpen, setContactModalOpen] = useState(false);
//     const [selectedContactId, setSelectedContactId] = useState(null);
//     const [dialogContact, setDialogContact] = useState({
//         open: false,
//         title: "",
//         message: "",
//         actionButtonText: "",
//     });

//     // Decision Map (Sales Process)
//     const [salesProcess, setSalesProcess] = useState([]);
//     const [openDecisionMapModel, setOpenDecisionMapModel] = useState(false);
//     const [salesProcessId, setSalesProcessId] = useState(null);
//     const [dialogDeleteDecisionMap, setDialogDeleteDecisionMap] = useState({
//         open: false,
//         title: "",
//         message: "",
//         actionButtonText: "",
//     });

//     // Unsaved changes dialog
//     const [unsavedChangesDialog, setUnsavedChangesDialog] = useState({
//         open: false,
//         title: "Unsaved Changes",
//         message: "You have unsaved changes. Do you want to save before closing?",
//         actionButtonText: "Save",
//         cancelButtonText: "Don't Save",
//         pendingAction: null, // 'close' or 'cancel'
//     });

//     const hasUnsavedChanges = () => {
//         // Check text editor changes
//         const hasTextChanges = 
//             whyDoAnythingState.getCurrentContent().getPlainText() !== 
//                 ContentState.createFromText(originalWhyDoAnythingHTML).getPlainText() ||
//             currentEnvironmentState.getCurrentContent().getPlainText() !== 
//                 ContentState.createFromText(originalCurrentEnvironmentHTML).getPlainText() ||
//             businessValueState.getCurrentContent().getPlainText() !== 
//                 ContentState.createFromText(originalBusinessValueHTML).getPlainText() ||
//             nextStepsValue !== originalNextStepsValue;
        
//         // Check contact changes
//         const hasContactChanges = editedContacts.length > 0;
        
//         return hasTextChanges || hasContactChanges;
//     };

//     const handleChangeTab = (value) => {
//         if (hasUnsavedChanges()) {
//             setUnsavedChangesDialog({
//                 ...unsavedChangesDialog,
//                 open: true,
//                 pendingAction: 'tabChange',
//                 newTabValue: value,
//             });
//         } else {
//             setSelectedType(value === 0 ? "Opp360" : "MEDDIC");
//             setSelectedTab(value);
//         }
//     }

//     const {
//         reset,
//         watch,
//         getValues
//     } = useForm({
//         defaultValues: {
//             id: null,
//             accountName: null,
//             logo: null,
//             nextSteps: null,
//             whyDoAnything: null,
//             businessValue: null,
//             currentEnvironment: null,
//             decisionMap: null,
//             decisionCriteria: null,
//         },
//     });


//     const initEditorFromHtml = (html) => {
//         const safeHtml = (html || "").trim();
//         if (!safeHtml) {
//             return EditorState.createEmpty();
//         }
//         const blocksFromHtml = htmlToDraft(safeHtml);
//         const { contentBlocks, entityMap } = blocksFromHtml;
//         const contentState = ContentState.createFromBlockArray(
//             contentBlocks,
//             entityMap
//         );
//         return EditorState.createWithContent(contentState);
//     };

//     const handleGetOpportunityDetails = async () => {
//         if (!opportunityId || !isOpen) return;
//         const res = await getOpportunityDetails(opportunityId);
//         if (res?.status === 200) {
//             const result = res.result || {};
//             reset(result);

//             const whyHtml = result.whyDoAnything || "";
//             const curEnvHtml = result.currentEnvironment || "";
//             const valHtml = result.businessValue || "";

//             // Store original values
//             setOriginalWhyDoAnythingHTML(whyHtml);
//             setOriginalCurrentEnvironmentHTML(curEnvHtml);
//             setOriginalBusinessValueHTML(valHtml);
//             setOriginalNextStepsValue(result.nextSteps || "");

//             // Set current values
//             setWhyDoAnythingHTML(whyHtml);
//             setCurrentEnvironmentHTML(curEnvHtml);
//             setBusinessValueHTML(valHtml);
//             setNextStepsValue(result.nextSteps || "");

//             setWhyDoAnythingState(initEditorFromHtml(whyHtml));
//             setCurrentEnvironmentState(initEditorFromHtml(curEnvHtml));
//             setBusinessValueState(initEditorFromHtml(valHtml));
//         }
//     };

//     const handleGetOppContacts = async () => {
//         if (!isOpen || !opportunityId) return;
//         const res = await getAllOpportunitiesContact(opportunityId);
//         const list = Array.isArray(res?.result) ? res.result : [];

//         setEconomicBuyerContacts(
//             list.filter(
//                 (row) => row.role && row.role.toLowerCase() === "economic buyer"
//             )
//         );
//         setOpportunitiesKeyContacts(list.filter((row) => row.isKey === true));
//         setOpportunitiesContacts(list);

//         // Store original key contacts
//         setOriginalKeyContacts(list.map(c => ({ id: c.id, isKey: c.isKey })));

//         const map = {};
//         list.forEach((c) => {
//             if (c?.id != null) map[c.id] = !!c.isKey;
//         });
//         setInitialIsKey(map);
//         setEditedContacts([]);
//     };

//     const handleGetAllSalesProcess = async () => {
//         if (!opportunityId || !isOpen) return;
//         const res = await getAllBySalesOpportunity(opportunityId);
//         if (res?.status === 200) {
//             setSalesProcess(Array.isArray(res.result) ? res.result : []);
//         }
//     };

//     useEffect(() => {
//         if (isOpen && opportunityId) {
//             handleGetOpportunityDetails();
//             handleGetOppContacts();
//             handleGetAllSalesProcess();
//         }

//         if (!isOpen) {
//             setIsEditingWhy(false);
//             setIsEditingCurrentEnv(false);
//             setIsEditingValue(false);
//             setIsEditingContacts(false);
//             setIsEditingNextSteps(false);

//             setIsEditingMValue(false);
//             setIsEditingIWhy(false);
//             setIsEditingEContacts(false);
//             setIsEditingCContacts(false);
//         }

//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [isOpen, opportunityId]);

//     // --- Unsaved Changes Dialog Handlers ---
//     const handleCloseWithUnsavedCheck = () => {
//         if (hasUnsavedChanges() && (isAnyOpp360Editing || isAnyMeddicEditing)) {
//             setUnsavedChangesDialog({
//                 ...unsavedChangesDialog,
//                 open: true,
//                 pendingAction: 'close',
//             });
//         } else {
//             handleClose();
//         }
//     };

//     const handleCancelWithUnsavedCheck = () => {
//         if (hasUnsavedChanges() && (isAnyOpp360Editing || isAnyMeddicEditing)) {
//             setUnsavedChangesDialog({
//                 ...unsavedChangesDialog,
//                 open: true,
//                 pendingAction: 'cancel',
//             });
//         } else {
//             handleCancelOpp360();
//         }
//     };

//     const handleUnsavedDialogAction = async () => {
//         // Save changes
//         if (unsavedChangesDialog.pendingAction === 'close') {
//             await handleSaveAllOpp360();
//             handleClose();
//         } else if (unsavedChangesDialog.pendingAction === 'cancel') {
//             await handleSaveAllOpp360();
//             handleCancelOpp360();
//         } else if (unsavedChangesDialog.pendingAction === 'tabChange') {
//             await handleSaveAllOpp360();
//             setSelectedType(unsavedChangesDialog.newTabValue === 0 ? "Opp360" : "MEDDIC");
//             setSelectedTab(unsavedChangesDialog.newTabValue);
//         }
        
//         setUnsavedChangesDialog({
//             ...unsavedChangesDialog,
//             open: false,
//             pendingAction: null,
//         });
//     };

//     const handleUnsavedDialogClose = () => {
//         if (unsavedChangesDialog.pendingAction === 'close') {
//             handleClose();
//         } else if (unsavedChangesDialog.pendingAction === 'cancel') {
//             handleCancelOpp360();
//         } else if (unsavedChangesDialog.pendingAction === 'tabChange') {
//             setSelectedType(unsavedChangesDialog.newTabValue === 0 ? "Opp360" : "MEDDIC");
//             setSelectedTab(unsavedChangesDialog.newTabValue);
//         }
        
//         setUnsavedChangesDialog({
//             ...unsavedChangesDialog,
//             open: false,
//             pendingAction: null,
//         });
//     };

//     // --- Opp360 editing ---

//     const startEditField = (field) => {
//         switch (field) {
//             case "WhyDoAnything":
//                 setIsEditingWhy(true);
//                 break;
//             case "CurrentEnvironment":
//                 setIsEditingCurrentEnv(true);
//                 break;
//             case "BusinessValue":
//                 setIsEditingValue(true);
//                 break;
//             case "KeyContacts": // Opp360 Key Contacts
//                 setSaveButton(false);      // hide header save
//                 setIsEditingContacts(true);
//                 // Make sure MEDDIC contact edits are off
//                 setIsEditingEContacts(false);
//                 setIsEditingCContacts(false);
//                 break;
//             case "NextSteps":
//                 setIsEditingNextSteps(true);
//                 break;

//             // MEDDIC
//             case "MeddicM": // M = Value
//                 setIsEditingMValue(true);
//                 break;
//             case "MeddicI": // I = Why Do Anything
//                 setIsEditingIWhy(true);
//                 break;
//             case "MeddicE": // E = Economic Buyer contacts
//                 setIsEditingEContacts(true);
//                 setIsEditingCContacts(false);
//                 setIsEditingContacts(false); // Opp360 key contacts off
//                 break;
//             case "MeddicC": // C = Champion (all contacts)
//                 setIsEditingCContacts(true);
//                 setIsEditingEContacts(false);
//                 setIsEditingContacts(false); // Opp360 key contacts off
//                 break;
//             default:
//                 break;
//         }
//     };

//     const handleCancelOpp360 = () => {
//         // Reset editor states from original values
//         setWhyDoAnythingState(initEditorFromHtml(originalWhyDoAnythingHTML));
//         setCurrentEnvironmentState(initEditorFromHtml(originalCurrentEnvironmentHTML));
//         setBusinessValueState(initEditorFromHtml(originalBusinessValueHTML));
//         setNextStepsValue(originalNextStepsValue);

//         // Reset contact changes
//         setEditedContacts([]);

//         // Reset all edit states
//         setIsEditingWhy(false);
//         setIsEditingCurrentEnv(false);
//         setIsEditingValue(false);
//         setIsEditingContacts(false);
//         setIsEditingNextSteps(false);

//         // MEDDIC flags
//         setIsEditingMValue(false);
//         setIsEditingIWhy(false);
//         setIsEditingEContacts(false);
//         setIsEditingCContacts(false);

//         setSaveButton(true);
//     };

//     const handleSaveKeyContacts = async () => {
//         if (!editedContacts.length) return;
//         try {
//             const payload = editedContacts.map((item) => ({
//                 id: item.id,
//                 isKey: item.isKey,
//             }));
//             const res = await updateOpportunitiesContact(payload);
//             if (res?.status === 200) {
//                 setEditedContacts([]);
//                 await handleGetOppContacts();
//             }
//         } catch (err) {
//             console.error("Error updating key contacts", err);
//         }
//     };

//     const handleSaveOpp360 = async () => {
//         try {
//             const currentValues = getValues();

//             const whyHtml = draftToHtml(
//                 convertToRaw(whyDoAnythingState.getCurrentContent())
//             );
//             const curEnvHtml = draftToHtml(
//                 convertToRaw(currentEnvironmentState.getCurrentContent())
//             );
//             const valHtml = draftToHtml(
//                 convertToRaw(businessValueState.getCurrentContent())
//             );

//             let payload = {
//                 ...currentValues,
//                 whyDoAnything: whyHtml,
//                 businessValue: valHtml,
//                 currentEnvironment: curEnvHtml,
//                 nextSteps: nextStepsValue
//             };

//             const res = await updateOpportunity(opportunityId, payload);
//             if (res?.status === 200) {
//                 setSyncingPushStatus(true);
//                 setWhyDoAnythingHTML(whyHtml || "");
//                 setCurrentEnvironmentHTML(curEnvHtml || "");
//                 setBusinessValueHTML(valHtml || "");
                
//                 // Update original values after save
//                 setOriginalWhyDoAnythingHTML(whyHtml || "");
//                 setOriginalCurrentEnvironmentHTML(curEnvHtml || "");
//                 setOriginalBusinessValueHTML(valHtml || "");
//                 setOriginalNextStepsValue(nextStepsValue);

//                 await handleGetOpportunityDetails();
//                 setIsEditingWhy(false);
//                 setIsEditingCurrentEnv(false);
//                 setIsEditingValue(false);
//                 setIsEditingNextSteps(false);

//                 // MEDDIC flags
//                 setIsEditingMValue(false);
//                 setIsEditingIWhy(false);
//                 setIsEditingEContacts(false);
//                 setIsEditingCContacts(false);
//             } else {
//                 console.error("Failed to update opportunity Opp360 fields");
//             }
//         } catch (err) {
//             console.error("Error updating Opp360 fields", err);
//         }
//     };

//     const handleSaveAllOpp360 = async () => {
//         await handleSaveOpp360();
//         await handleSaveKeyContacts();
//         setIsEditingContacts(false);
//     };

//     // --- Key Contacts helpers ---

//     const handleToggleKeyContact = (id, isKey) => {
//         setEditedContacts((prev) => {
//             const next = [...prev];
//             const idx = next.findIndex((e) => e.id === id);

//             if (idx >= 0) {
//                 next[idx] = { id, isKey };
//             } else {
//                 next.push({ id, isKey });
//             }

//             const original = initialIsKey[id] ?? false;
//             const afterIdx = next.findIndex((e) => e.id === id);
//             if (afterIdx >= 0 && next[afterIdx].isKey === original) {
//                 next.splice(afterIdx, 1);
//             }
//             return next;
//         });
//     };

//     const handleAddContact = () => {
//         setSelectedContactId(null);
//         setContactModalOpen(true);
//     };

//     const handleCloseContactModel = () => {
//         setSelectedContactId(null);
//         setContactModalOpen(false);
//     };

//     const handleOpenDeleteContactDialog = (id) => {
//         setSelectedContactId(id);
//         setDialogContact({
//             open: true,
//             title: "Delete Contact",
//             message: "Are you sure! Do you want to delete this contact?",
//             actionButtonText: "yes",
//         });
//     };

//     const handleCloseDeleteContactDialog = () => {
//         setSelectedContactId(null);
//         setDialogContact({
//             open: false,
//             title: "",
//             message: "",
//             actionButtonText: "",
//         });
//     };

//     const handleDeleteContact = async () => {
//         try {
//             const res = await deleteOpportunitiesContact(selectedContactId);
//             if (res?.status === 200) {
//                 setSyncingPushStatus(true);
//                 handleCloseDeleteContactDialog();
//                 await handleGetOppContacts();
//             }
//         } catch (err) {
//             console.error("Error deleting contact", err);
//         }
//     };

//     // For Opp360 "Key Contacts" card: only key contacts
//     const keyContactsWithEdits = opportunitiesKeyContact.map((c) => {
//         const edit = editedContacts.find((e) => e.id === c.id);
//         return { ...c, isKey: edit ? edit.isKey : c.isKey };
//     });

//     // For MEDDIC & key-count logic: ALL contacts with edits applied
//     const allContactsWithEdits = opportunitiesContacts.map((c) => {
//         const edit = editedContacts.find((e) => e.id === c.id);
//         return { ...c, isKey: edit ? edit.isKey : c.isKey };
//     });

//     // Always compute key count from all contacts
//     const currentKeyContactsCount = allContactsWithEdits.filter(
//         (c) => c.isKey
//     ).length;

//     // --- Decision Map (Sales Process) ---

//     const handleOpenDecisionMapModel = (id = null) => {
//         setSalesProcessId(id);
//         setOpenDecisionMapModel(true);
//     };

//     const handleCloseDecisionMapModel = () => {
//         setSalesProcessId(null);
//         setOpenDecisionMapModel(false);
//     };

//     const handleOpenDecisionMapDelete = (id) => {
//         setSalesProcessId(id);
//         setDialogDeleteDecisionMap({
//             open: true,
//             title: "Delete Decision Map",
//             message: "Are you sure! Do you want to delete decision map ?",
//             actionButtonText: "yes",
//         });
//     };

//     const handleCloseDecisionMapDelete = () => {
//         setSalesProcessId(null);
//         setDialogDeleteDecisionMap({
//             open: false,
//             title: "",
//             message: "",
//             actionButtonText: "",
//         });
//     };

//     const handleDeteleDecisionMap = async () => {
//         if (!salesProcessId) return;
//         try {
//             const res = await deleteSalesProcess(salesProcessId);
//             if (res?.status === 200) {
//                 await handleGetAllSalesProcess();
//                 handleCloseDecisionMapDelete();
//             }
//         } catch (err) {
//             console.error("Error deleting decision map", err);
//         }
//     };

//     return (
//         <>
//             {/* BACKDROP */}
//             {isOpen && (
//                 <div
//                     className="fixed inset-0 z-40 bg-black/30 lg:bg-black/20"
//                     onClick={handleCloseWithUnsavedCheck}
//                 />
//             )}

//             {/* SLIDE PANEL */}
//             <div
//                 className={`
//                     fixed top-0 right-0 z-50 mt-16 lg:mt-0
//                     bg-[rgb(224,239,251)] text-gray-900 h-screen
//                     border-l border-gray-300 w-3/5
//                     flex flex-col
//                     transform transition-transform duration-300 ease-in-out
//                     shadow-xl
//                     ${isOpen ? "translate-x-0" : "translate-x-full"}
//                 `}
//             >
//                 {/* HEADER */}
//                 <div className="flex items-center justify-between px-4 py-3 border-b border-gray-300">
//                     <div className="flex justify-start items-center gap-3">
//                         {/* Avatar */}
//                         <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center overflow-hidden bg-white">
//                             {watch("logo") ? (
//                                 <a
//                                     href={watch("logo")}
//                                     target="_blank"
//                                     rel="noreferrer"
//                                 >
//                                     <img
//                                         src={watch("logo")}
//                                         alt="Opp Logo"
//                                         className="w-full h-full object-cover"
//                                     />
//                                 </a>
//                             ) : (
//                                 <h2 className="text-lg font-bold text-gray-800 capitalize">
//                                     {watch("accountName")
//                                         ?.trim()
//                                         ?.charAt(0) || ""}
//                                 </h2>
//                             )}
//                         </div>

//                         {/* Account name + type switch */}
//                         <h2 className="text-lg font-bold text-gray-800">
//                             {watch("accountName")}
//                         </h2>

//                         <div className="flex justify-start items-center gap-2">
//                             <Tabs tabsData={tableData} selectedTab={selectedTab} handleChange={handleChangeTab}/>
//                         </div>
//                     </div>

//                     <div className="flex items-center gap-3">
//                         {/* Header SAVE / CANCEL */}
//                         {(
//                             (selectedType === "Opp360" && isAnyOpp360Editing) ||
//                             (selectedType === "MEDDIC" && isAnyMeddicEditing)
//                         ) && (
//                                 <>
//                                     {saveButton && (
//                                         ((selectedType === "Opp360" && isAnyOpp360Editing) ||
//                                             (selectedType === "MEDDIC" && isAnyMeddicEditingHeader)) && (
//                                             <Tooltip title="Save" arrow>
//                                                 <div className="bg-green-600 h-7 w-7 flex justify-center items-center rounded-full text-white">
//                                                     <Components.IconButton
//                                                         onClick={handleSaveAllOpp360}
//                                                     >
//                                                         <CustomIcons
//                                                             iconName="fa-solid fa-floppy-disk"
//                                                             css="cursor-pointer text-white h-3 w-3"
//                                                         />
//                                                     </Components.IconButton>
//                                                 </div>
//                                             </Tooltip>
//                                         )
//                                     )}

//                                     {/* CANCEL: always show when *anything* is in edit mode */}
//                                     <Tooltip title="Cancel" arrow>
//                                         <div className="bg-black h-7 w-7 flex justify-center items-center rounded-full text-white">
//                                             <Components.IconButton
//                                                 onClick={handleCancelWithUnsavedCheck}
//                                             >
//                                                 <CustomIcons
//                                                     iconName="fa-solid fa-xmark"
//                                                     css="cursor-pointer text-white h-3 w-3"
//                                                 />
//                                             </Components.IconButton>
//                                         </div>
//                                     </Tooltip>
//                                 </>
//                             )}

//                         <Components.IconButton onClick={handleCloseWithUnsavedCheck}>
//                             <CustomIcons
//                                 iconName={"fa-solid fa-close"}
//                                 css="cursor-pointer h-6 w-6 text-black"
//                             />
//                         </Components.IconButton>
//                     </div>
//                 </div>

//                 {/* BODY */}
//                 {selectedTab === 0 && (
//                     <div className="flex-1 px-4 py-3 overflow-y-auto overflow-x-auto">
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-[360px]">
//                             {/* WHY DO ANYTHING */}
//                             <div
//                                 className="bg-white rounded-2xl shadow-sm border border-gray-200 px-5 py-4 flex flex-col cursor-pointer relative"
//                                 onClick={() =>
//                                     startEditField("WhyDoAnything")
//                                 }
//                             >
//                                 <h3 className="text-base font-semibold text-gray-800 mb-2">
//                                     Why Do Anything
//                                 </h3>
//                                 {isEditingWhy ? (
//                                     <div className="h-52 overflow-y-auto">
//                                         <Editor
//                                             editorState={whyDoAnythingState}
//                                             onEditorStateChange={(state) =>
//                                                 setWhyDoAnythingState(state)
//                                             }
//                                             toolbar={toolbarProperties}
//                                             wrapperClassName="editor-wrapper-custom border border-gray-300 rounded-md"
//                                             editorClassName="editor-class p-2 h-40 overflow-y-auto"
//                                             toolbarClassName="toolbar-class border-b border-gray-300"
//                                             onFocus={() => setActiveEditorHint("WhyDoAnything")}
//                                             onBlur={() => { setActiveEditorHint(null) }}
//                                         />
//                                         {activeEditorHint === "WhyDoAnything" && (
//                                             <div className="absolute top-1/2 -translate-y-1/2 right-[-216px] bg-white border border-gray-200 rounded-md shadow-lg z-50 p-2
//                         before:content-[''] before:absolute before:top-1/2 before:-translate-y-1/2 before:left-[-8px] 
//                         before:w-4 before:h-4 before:bg-white before:border-l before:border-b before:border-gray-200 before:rotate-45">
//                                                 <img
//                                                     src="/images/WhyDoAnything2.png"
//                                                     alt="WhyDoAnything"
//                                                     className="max-w-xs max-h-48 object-contain relative z-10"
//                                                 />
//                                             </div>
//                                         )}
//                                     </div>
//                                 ) : (
//                                     <div
//                                         className="text-sm text-gray-700 leading-relaxed space-y-1"
//                                         dangerouslySetInnerHTML={{
//                                             __html:
//                                                 whyDoAnythingHTML ||
//                                                 "<span class='text-gray-400 italic'>No information added yet.</span>",
//                                         }}
//                                     />
//                                 )}
//                             </div>

//                             {/* CURRENT ENVIRONMENT */}
//                             <div
//                                 className="bg-white rounded-2xl shadow-sm border border-gray-200 px-5 py-4 flex flex-col cursor-pointer"
//                                 onClick={() =>
//                                     startEditField("CurrentEnvironment")
//                                 }
//                             >
//                                 <h3 className="text-base font-semibold text-gray-800 mb-2">
//                                     Current Environment
//                                 </h3>
//                                 {isEditingCurrentEnv ? (
//                                     <div className="h-52 overflow-y-auto">
//                                         <Editor
//                                             editorState={currentEnvironmentState}
//                                             onEditorStateChange={(state) =>
//                                                 setCurrentEnvironmentState(
//                                                     state
//                                                 )
//                                             }
//                                             toolbar={toolbarProperties}
//                                             wrapperClassName="editor-wrapper-custom border border-gray-300 rounded-md"
//                                             editorClassName="editor-class p-2 h-40 overflow-y-auto"
//                                             toolbarClassName="toolbar-class border-b border-gray-300"
//                                         />
//                                     </div>
//                                 ) : (
//                                     <div
//                                         className="text-sm text-gray-700 leading-relaxed space-y-1"
//                                         dangerouslySetInnerHTML={{
//                                             __html:
//                                                 currentEnvironmentHTML ||
//                                                 "<span class='text-gray-400 italic'>No information added yet.</span>",
//                                         }}
//                                     />
//                                 )}
//                             </div>

//                             {/* VALUE */}
//                             <div
//                                 className="bg-white rounded-2xl shadow-sm border border-gray-200 px-5 py-4 flex flex-col cursor-pointer relative"
//                                 onClick={() => startEditField("BusinessValue")}
//                             >
//                                 <h3 className="text-base font-semibold text-gray-800 mb-2">
//                                     Value
//                                 </h3>
//                                 {isEditingValue ? (
//                                     <div className="h-52 overflow-y-auto">
//                                         <Editor
//                                             editorState={businessValueState}
//                                             onEditorStateChange={(state) =>
//                                                 setBusinessValueState(state)
//                                             }
//                                             toolbar={toolbarProperties}
//                                             wrapperClassName="editor-wrapper-custom border border-gray-300 rounded-md"
//                                             editorClassName="editor-class p-2 h-40 overflow-y-auto"
//                                             toolbarClassName="toolbar-class border-b border-gray-300"
//                                             onFocus={() => setActiveEditorHint("BusinessValue")}
//                                             onBlur={() => { setActiveEditorHint(null) }}
//                                         />
//                                         {activeEditorHint === "BusinessValue" && (
//                                             <div className="absolute top-1/2 -translate-y-1/2 right-[-216px] bg-white border border-gray-200 rounded-md shadow-lg z-50 p-2
//                         before:content-[''] before:absolute before:top-1/2 before:-translate-y-1/2 before:left-[-8px] 
//                         before:w-4 before:h-4 before:bg-white before:border-l before:border-b before:border-gray-200 before:rotate-45">
//                                                 <img
//                                                     src="/images/BusinessValue2.png"
//                                                     alt="Business value guidance"
//                                                     className="max-w-xs max-h-48 object-contain relative z-10"
//                                                 />
//                                             </div>
//                                         )}
//                                     </div>
//                                 ) : (
//                                     <div
//                                         className="text-sm text-gray-700 leading-relaxed space-y-1"
//                                         dangerouslySetInnerHTML={{
//                                             __html:
//                                                 businessValueHTML ||
//                                                 "<span class='text-gray-400 italic'>No value summary added yet.</span>",
//                                         }}
//                                     />
//                                 )}
//                             </div>

//                             {/* KEY CONTACTS */}
//                             <div
//                                 className="bg-white rounded-2xl shadow-sm border border-gray-200 px-5 py-4 flex flex-col cursor-pointer"
//                                 onClick={() => startEditField("KeyContacts")}
//                             >
//                                 <div className="flex justify-between items-center mb-2">
//                                     <h3 className="text-base font-semibold text-gray-800">
//                                         Key Contacts
//                                     </h3>

//                                     {isEditingContacts && (
//                                         <div className="flex items-center gap-2">
//                                             {editedContacts.length > 0 && (
//                                                 <Tooltip
//                                                     title="Save key contacts only"
//                                                     arrow
//                                                 >
//                                                     <div className="bg-blue-600 h-6 w-6 flex justify-center items-center rounded-full text-white">
//                                                         <Components.IconButton
//                                                             onClick={(e) => {
//                                                                 e.stopPropagation();
//                                                                 handleSaveKeyContacts();
//                                                             }}
//                                                         >
//                                                             <CustomIcons
//                                                                 iconName="fa-solid fa-floppy-disk"
//                                                                 css="cursor-pointer text-white h-3 w-3"
//                                                             />
//                                                         </Components.IconButton>
//                                                     </div>
//                                                 </Tooltip>
//                                             )}
//                                             <PermissionWrapper
//                                                 functionalityName="Opportunities"
//                                                 moduleName="Opportunities"
//                                                 actionId={2}
//                                                 component={
//                                                     <Tooltip
//                                                         title="Add contact"
//                                                         arrow
//                                                     >
//                                                         <div className="bg-green-600 h-6 w-6 flex justify-center items-center rounded-full text-white">
//                                                             <Components.IconButton
//                                                                 onClick={(e) => {
//                                                                     e.stopPropagation();
//                                                                     handleAddContact();
//                                                                 }}
//                                                             >
//                                                                 <CustomIcons
//                                                                     iconName="fa-solid fa-plus"
//                                                                     css="cursor-pointer text-white h-3 w-3"
//                                                                 />
//                                                             </Components.IconButton>
//                                                         </div>
//                                                     </Tooltip>
//                                                 }
//                                             />
//                                         </div>
//                                     )}
//                                 </div>

//                                 {!isEditingContacts ? (
//                                     opportunitiesKeyContact &&
//                                         opportunitiesKeyContact.length > 0 ? (
//                                         <ul className="space-y-1 text-sm">
//                                             {opportunitiesKeyContact.map(
//                                                 (c) => (
//                                                     <li key={c.id}>
//                                                         <span className="font-medium text-indigo-600">
//                                                             {c.contactName}
//                                                         </span>
//                                                         {c.role && (
//                                                             <>
//                                                                 <span className="mx-1 text-gray-500">
//                                                                     –
//                                                                 </span>
//                                                                 <span>
//                                                                     {c.role}
//                                                                 </span>
//                                                             </>
//                                                         )}
//                                                     </li>
//                                                 )
//                                             )}
//                                         </ul>
//                                     ) : (
//                                         <p className="text-sm text-gray-400 italic">
//                                             No contacts linked to this
//                                             opportunity.
//                                         </p>
//                                     )
//                                 ) : (
//                                     <div className="space-y-2 max-h-44 overflow-y-auto">
//                                         {keyContactsWithEdits.length > 0 ? (
//                                             keyContactsWithEdits.map((c) => (
//                                                 <div
//                                                     key={c.id}
//                                                     className={`flex items-center justify-between rounded-md px-2 py-1 border text-sm ${c.isKey
//                                                         ? "border-blue-500 bg-blue-50"
//                                                         : "border-gray-200"
//                                                         }`}
//                                                 >
//                                                     <div className="flex items-center gap-2">
//                                                         <PermissionWrapper
//                                                             functionalityName="Opportunities"
//                                                             moduleName="Opportunities"
//                                                             actionId={2}
//                                                             component={
//                                                                 <Checkbox
//                                                                     checked={
//                                                                         !!c.isKey
//                                                                     }
//                                                                     disabled={
//                                                                         currentKeyContactsCount >=
//                                                                         4 &&
//                                                                         !c.isKey
//                                                                     }
//                                                                     onChange={(
//                                                                         e
//                                                                     ) => {
//                                                                         e.stopPropagation();
//                                                                         handleToggleKeyContact(
//                                                                             c.id,
//                                                                             !c.isKey
//                                                                         );
//                                                                     }}
//                                                                 />
//                                                             }
//                                                         />
//                                                         <div>
//                                                             <p className="font-semibold text-gray-800">
//                                                                 {
//                                                                     c.contactName
//                                                                 }
//                                                             </p>
//                                                             {c.role && (
//                                                                 <p className="text-xs text-gray-500">
//                                                                     {c.role}
//                                                                 </p>
//                                                             )}
//                                                         </div>
//                                                     </div>
//                                                     <PermissionWrapper
//                                                         functionalityName="Opportunities"
//                                                         moduleName="Opportunities"
//                                                         actionId={2}
//                                                         component={
//                                                             <Tooltip
//                                                                 title="Delete contact"
//                                                                 arrow
//                                                             >
//                                                                 <div className="bg-red-600 h-6 w-6 flex justify-center items-center rounded-full text-white">
//                                                                     <Components.IconButton
//                                                                         onClick={(
//                                                                             e
//                                                                         ) => {
//                                                                             e.stopPropagation();
//                                                                             handleOpenDeleteContactDialog(
//                                                                                 c.id
//                                                                             );
//                                                                         }}
//                                                                     >
//                                                                         <CustomIcons
//                                                                             iconName="fa-solid fa-trash"
//                                                                             css="cursor-pointer text-white h-3 w-3"
//                                                                         />
//                                                                     </Components.IconButton>
//                                                                 </div>
//                                                             </Tooltip>
//                                                         }
//                                                     />
//                                                 </div>
//                                             ))
//                                         ) : (
//                                             <p className="text-sm text-gray-400 italic">
//                                                 No contacts linked to this
//                                                 opportunity.
//                                             </p>
//                                         )}
//                                     </div>
//                                 )}
//                             </div>

//                             {/* DECISION MAP (TIMELINE) */}
//                             <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-5 py-4 flex flex-col">
//                                 <div className="flex justify-between items-center mb-2">
//                                     <h3 className="text-base font-semibold text-gray-800">
//                                         Decision Map
//                                     </h3>
//                                     <PermissionWrapper
//                                         functionalityName="Opportunities"
//                                         moduleName="Opportunities"
//                                         actionId={2}
//                                         component={
//                                             <Tooltip title="Add step" arrow>
//                                                 <div className="bg-green-600 h-6 w-6 flex justify-center items-center rounded-full text-white">
//                                                     <Components.IconButton
//                                                         onClick={(e) => {
//                                                             e.stopPropagation();
//                                                             handleOpenDecisionMapModel();
//                                                         }}
//                                                     >
//                                                         <CustomIcons
//                                                             iconName="fa-solid fa-plus"
//                                                             css="cursor-pointer text-white h-3 w-3"
//                                                         />
//                                                     </Components.IconButton>
//                                                 </div>
//                                             </Tooltip>
//                                         }
//                                     />
//                                 </div>
//                                 <div className="h-52 w-full">
//                                     <DecisionMapTimeline
//                                         items={salesProcess}
//                                         onAdd={() =>
//                                             handleOpenDecisionMapModel()
//                                         }
//                                         onEdit={(id) =>
//                                             handleOpenDecisionMapModel(id)
//                                         }
//                                         onDelete={(id) =>
//                                             handleOpenDecisionMapDelete(id)
//                                         }
//                                     />
//                                 </div>
//                             </div>

//                             {/* NEXT STEPS */}
//                             <div
//                                 className="bg-white rounded-2xl shadow-sm border border-gray-200 px-5 py-4 flex flex-col cursor-pointer"
//                                 onClick={() => startEditField("NextSteps")}
//                             >
//                                 <h3 className="text-base font-semibold text-gray-800 mb-2">
//                                     Next Steps
//                                 </h3>
//                                 {isEditingNextSteps ? (
//                                     <Input
//                                         multiline
//                                         rows={4}
//                                         value={nextStepsValue}
//                                         onChange={(e) =>
//                                             setNextStepsValue(e.target.value)
//                                         }
//                                     />
//                                 ) : watch("nextSteps") ? (
//                                     <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
//                                         {watch("nextSteps")}
//                                     </div>
//                                 ) : (
//                                     <p className="text-sm text-gray-400 italic">
//                                         No next steps defined.
//                                     </p>
//                                 )}
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {/* MEDDIC VIEW */}
//                 {selectedTab === 1 && (
//                     <div className="flex-1 overflow-y-auto p-4 bg-[rgb(224,239,251)]">
//                         <div className="mx-auto border-[7px] border-[#ECECEC] bg-[rgb(224,239,251)]">
//                             {/* M - Metrics (Value) */}
//                             <MeddicRow letter="M">
//                                 <div
//                                     className="text-sm text-gray-700 leading-relaxed space-y-1 cursor-pointer"
//                                     onClick={() => startEditField("MeddicM")}
//                                 >
//                                     {isEditingMValue ? (
//                                         <div className="h-40 overflow-y-auto">
//                                             <Editor
//                                                 editorState={businessValueState}
//                                                 onEditorStateChange={(state) => setBusinessValueState(state)}
//                                                 toolbar={toolbarProperties}
//                                                 wrapperClassName="editor-wrapper-custom border border-gray-300 rounded-md"
//                                                 editorClassName="editor-class p-2 h-32 overflow-y-auto"
//                                                 toolbarClassName="toolbar-class border-b border-gray-300"
//                                             />
//                                         </div>
//                                     ) : (
//                                         <div
//                                             className="space-y-1"
//                                             dangerouslySetInnerHTML={{
//                                                 __html:
//                                                     businessValueHTML ||
//                                                     "<span class='text-gray-400 italic'>-</span>",
//                                             }}
//                                         />
//                                     )}
//                                 </div>
//                             </MeddicRow>

//                             {/* E - Economic Buyer (editable like Key Contacts, filtered) */}
//                             <MeddicRow letter="E">
//                                 <div
//                                     className="text-sm text-gray-700 leading-relaxed space-y-1 cursor-pointer"
//                                     onClick={() => startEditField("MeddicE")}
//                                 >
//                                     {!isEditingEContacts ? (
//                                         economicBuyerContacts?.length > 0 ? (
//                                             <ul className="space-y-1 text-sm">
//                                                 {economicBuyerContacts.map((c) => (
//                                                     <li key={c.id}>
//                                                         <span className="font-medium text-indigo-600">
//                                                             {c.contactName}
//                                                         </span>
//                                                         {c.role && (
//                                                             <>
//                                                                 <span className="mx-1 text-gray-500">–</span>
//                                                                 <span>{c.role}</span>
//                                                             </>
//                                                         )}
//                                                     </li>
//                                                 ))}
//                                             </ul>
//                                         ) : (
//                                             <p className="text-sm text-gray-400 italic">-</p>
//                                         )
//                                     ) : (
//                                         <>
//                                             {/* Small save + add, same as Key Contacts behavior */}
//                                             <div className="flex items-center justify-end gap-2 mb-2">
//                                                 {editedContacts.length > 0 && (
//                                                     <Tooltip title="Save key contacts only" arrow>
//                                                         <div className="bg-blue-600 h-6 w-6 flex justify-center items-center rounded-full text-white">
//                                                             <Components.IconButton
//                                                                 onClick={(e) => {
//                                                                     e.stopPropagation();
//                                                                     handleSaveKeyContacts();
//                                                                 }}
//                                                             >
//                                                                 <CustomIcons
//                                                                     iconName="fa-solid fa-floppy-disk"
//                                                                     css="cursor-pointer text-white h-3 w-3"
//                                                                 />
//                                                             </Components.IconButton>
//                                                         </div>
//                                                     </Tooltip>
//                                                 )}
//                                                 <PermissionWrapper
//                                                     functionalityName="Opportunities"
//                                                     moduleName="Opportunities"
//                                                     actionId={2}
//                                                     component={
//                                                         <Tooltip title="Add contact" arrow>
//                                                             <div className="bg-green-600 h-6 w-6 flex justify-center items-center rounded-full text-white">
//                                                                 <Components.IconButton
//                                                                     onClick={(e) => {
//                                                                         e.stopPropagation();
//                                                                         handleAddContact();
//                                                                     }}
//                                                                 >
//                                                                     <CustomIcons
//                                                                         iconName="fa-solid fa-plus"
//                                                                         css="cursor-pointer text-white h-3 w-3"
//                                                                     />
//                                                                 </Components.IconButton>
//                                                             </div>
//                                                         </Tooltip>
//                                                     }
//                                                 />
//                                             </div>

//                                             <div className="space-y-2 max-h-44 overflow-y-auto">
//                                                 {allContactsWithEdits.filter(
//                                                     (c) =>
//                                                         c.role &&
//                                                         c.role.toLowerCase() === "economic buyer"
//                                                 ).length > 0 ? (
//                                                     allContactsWithEdits
//                                                         .filter(
//                                                             (c) =>
//                                                                 c.role &&
//                                                                 c.role.toLowerCase() === "economic buyer"
//                                                         )
//                                                         .map((c) => (
//                                                             <div
//                                                                 key={c.id}
//                                                                 className={`flex items-center justify-between rounded-md px-2 py-1 border text-sm ${c.isKey ? "border-blue-500 bg-blue-50" : "border-gray-200"
//                                                                     }`}
//                                                             >
//                                                                 <div className="flex items-center gap-2">
//                                                                     <PermissionWrapper
//                                                                         functionalityName="Opportunities"
//                                                                         moduleName="Opportunities"
//                                                                         actionId={2}
//                                                                         component={
//                                                                             <Checkbox
//                                                                                 checked={!!c.isKey}
//                                                                                 disabled={
//                                                                                     currentKeyContactsCount >= 4 && !c.isKey
//                                                                                 }
//                                                                                 onChange={(e) => {
//                                                                                     e.stopPropagation();
//                                                                                     handleToggleKeyContact(
//                                                                                         c.id,
//                                                                                         !c.isKey
//                                                                                     );
//                                                                                 }}
//                                                                             />
//                                                                         }
//                                                                     />
//                                                                     <div>
//                                                                         <p className="font-semibold text-gray-800">
//                                                                             {c.contactName}
//                                                                         </p>
//                                                                         {c.role && (
//                                                                             <p className="text-xs text-gray-500">
//                                                                                 {c.role}
//                                                                             </p>
//                                                                         )}
//                                                                     </div>
//                                                                 </div>
//                                                                 <PermissionWrapper
//                                                                     functionalityName="Opportunities"
//                                                                     moduleName="Opportunities"
//                                                                     actionId={2}
//                                                                     component={
//                                                                         <Tooltip
//                                                                             title="Delete contact"
//                                                                             arrow
//                                                                         >
//                                                                             <div className="bg-red-600 h-6 w-6 flex justify-center items-center rounded-full text-white">
//                                                                                 <Components.IconButton
//                                                                                     onClick={(e) => {
//                                                                                         e.stopPropagation();
//                                                                                         handleOpenDeleteContactDialog(
//                                                                                             c.id
//                                                                                         );
//                                                                                     }}
//                                                                                 >
//                                                                                     <CustomIcons
//                                                                                         iconName="fa-solid fa-trash"
//                                                                                         css="cursor-pointer text-white h-3 w-3"
//                                                                                     />
//                                                                                 </Components.IconButton>
//                                                                             </div>
//                                                                         </Tooltip>
//                                                                     }
//                                                                 />
//                                                             </div>
//                                                         ))
//                                                 ) : (
//                                                     <p className="text-sm text-gray-400 italic">
//                                                         No economic buyer contacts.
//                                                     </p>
//                                                 )}

//                                             </div>
//                                         </>
//                                     )}
//                                 </div>
//                             </MeddicRow>


//                             {/* D - Decision Criteria (not mapped) */}
//                             <MeddicRow letter="D">
//                                 <p className="text-sm text-gray-900 italic">
//                                     N/A
//                                 </p>
//                             </MeddicRow>

//                             {/* D - Decision Process (Decision Map timeline summary) */}

//                             {/* D - Decision Process (Decision Map summary list) */}
//                             <MeddicRow letter="D">
//                                 {salesProcess && salesProcess.length > 0 ? (
//                                     <div className="space-y-1 text-sm">
//                                         {salesProcess.map((step) => {
//                                             const dateLabel = step.processDate
//                                                 ? new Date(step.processDate).toLocaleDateString("en-US", {
//                                                     month: "numeric",
//                                                     day: "numeric",
//                                                 })
//                                                 : "-";

//                                             return (
//                                                 <div
//                                                     key={step.id}
//                                                     className="flex items-center justify-between gap-2"
//                                                 >
//                                                     {/* Left: Process - MM/DD */}
//                                                     <div className="flex">
//                                                         <span className="font-medium text-gray-800">
//                                                             {step.process || "-"}
//                                                         </span>
//                                                         <span className="mx-1 text-gray-500">-</span>
//                                                         <span className="text-gray-700">{dateLabel}</span>
//                                                     </div>

//                                                     {/* Right: action icons */}
//                                                     <div className="flex items-center gap-2">
//                                                         <Tooltip title="Edit" arrow>
//                                                             <div className="bg-blue-600 h-6 w-6 flex justify-center items-center rounded-full text-white">
//                                                                 <Components.IconButton
//                                                                     onClick={() =>
//                                                                         handleOpenDecisionMapModel(step.id)
//                                                                     }
//                                                                 >
//                                                                     <CustomIcons
//                                                                         iconName="fa-solid fa-pen-to-square"
//                                                                         css="cursor-pointer text-white h-3 w-3"
//                                                                     />
//                                                                 </Components.IconButton>
//                                                             </div>
//                                                         </Tooltip>

//                                                         <Tooltip title="Delete" arrow>
//                                                             <div className="bg-red-600 h-6 w-6 flex justify-center items-center rounded-full text-white">
//                                                                 <Components.IconButton
//                                                                     onClick={() =>
//                                                                         handleOpenDecisionMapDelete(step.id)
//                                                                     }
//                                                                 >
//                                                                     <CustomIcons
//                                                                         iconName="fa-solid fa-trash"
//                                                                         css="cursor-pointer text-white h-3 w-3"
//                                                                     />
//                                                                 </Components.IconButton>
//                                                             </div>
//                                                         </Tooltip>
//                                                     </div>
//                                                 </div>
//                                             );
//                                         })}
//                                     </div>
//                                 ) : (
//                                     <p className="text-sm text-gray-400 italic">No decision steps added.</p>
//                                 )}
//                             </MeddicRow>

//                             {/* I - Implicate the Pain (Why Do Anything) */}
//                             <MeddicRow letter="I">
//                                 <div
//                                     className="text-sm text-gray-700 leading-relaxed space-y-1 cursor-pointer"
//                                     onClick={() => startEditField("MeddicI")}
//                                 >
//                                     {isEditingIWhy ? (
//                                         <div className="h-40 overflow-y-auto">
//                                             <Editor
//                                                 editorState={whyDoAnythingState}
//                                                 onEditorStateChange={(state) => setWhyDoAnythingState(state)}
//                                                 toolbar={toolbarProperties}
//                                                 wrapperClassName="editor-wrapper-custom border border-gray-300 rounded-md"
//                                                 editorClassName="editor-class p-2 h-32 overflow-y-auto"
//                                                 toolbarClassName="toolbar-class border-b border-gray-300"
//                                             />
//                                         </div>
//                                     ) : (
//                                         <div
//                                             className="space-y-1"
//                                             dangerouslySetInnerHTML={{
//                                                 __html:
//                                                     whyDoAnythingHTML ||
//                                                     "<span class='text-gray-400 italic'>-</span>",
//                                             }}
//                                         />
//                                     )}
//                                 </div>
//                             </MeddicRow>

//                             {/* C - Champion (all contacts, editable like Key Contacts) */}
//                             <MeddicRow letter="C">
//                                 <div
//                                     className="text-sm text-gray-700 leading-relaxed space-y-1 cursor-pointer"
//                                     onClick={() => startEditField("MeddicC")}
//                                 >
//                                     {!isEditingCContacts ? (
//                                         opportunitiesContacts?.length > 0 ? (
//                                             <ul className="space-y-1 text-sm">
//                                                 {opportunitiesContacts.map((c) => (
//                                                     <li key={c.id}>
//                                                         <span className={`font-medium ${c.isKey ? "text-indigo-600" : "text-black"}`}>
//                                                             {c.contactName}
//                                                         </span>
//                                                         {c.role && (
//                                                             <>
//                                                                 <span className="mx-1 text-gray-500">–</span>
//                                                                 <span>{c.role}</span>
//                                                             </>
//                                                         )}
//                                                     </li>
//                                                 ))}
//                                             </ul>
//                                         ) : (
//                                             <p className="text-sm text-gray-400 italic">-</p>
//                                         )
//                                     ) : (
//                                         <>
//                                             {/* Same mini save/add as E row */}
//                                             <div className="flex items-center justify-end gap-2 mb-2">
//                                                 {opportunitiesContacts.length > 0 && (
//                                                     <Tooltip title="Save" arrow>
//                                                         <div className="bg-blue-600 h-6 w-6 flex justify-center items-center rounded-full text-white">
//                                                             <Components.IconButton
//                                                                 onClick={(e) => {
//                                                                     e.stopPropagation();
//                                                                     handleSaveKeyContacts();
//                                                                 }}
//                                                             >
//                                                                 <CustomIcons
//                                                                     iconName="fa-solid fa-floppy-disk"
//                                                                     css="cursor-pointer text-white h-3 w-3"
//                                                                 />
//                                                             </Components.IconButton>
//                                                         </div>
//                                                     </Tooltip>
//                                                 )}
//                                                 <PermissionWrapper
//                                                     functionalityName="Opportunities"
//                                                     moduleName="Opportunities"
//                                                     actionId={2}
//                                                     component={
//                                                         <Tooltip title="Add contact" arrow>
//                                                             <div className="bg-green-600 h-6 w-6 flex justify-center items-center rounded-full text-white">
//                                                                 <Components.IconButton
//                                                                     onClick={(e) => {
//                                                                         e.stopPropagation();
//                                                                         handleAddContact();
//                                                                     }}
//                                                                 >
//                                                                     <CustomIcons
//                                                                         iconName="fa-solid fa-plus"
//                                                                         css="cursor-pointer text-white h-3 w-3"
//                                                                     />
//                                                                 </Components.IconButton>
//                                                             </div>
//                                                         </Tooltip>
//                                                     }
//                                                 />
//                                             </div>

//                                             <div className="space-y-2 max-h-44 overflow-y-auto">
//                                                 {allContactsWithEdits.length > 0 ? (
//                                                     allContactsWithEdits.map((c) => (
//                                                         <div
//                                                             key={c.id}
//                                                             className={`flex items-center justify-between rounded-md px-2 py-1 border text-sm ${c.isKey ? "border-blue-500 bg-blue-50" : "border-gray-200"
//                                                                 }`}
//                                                         >
//                                                             <div className="flex items-center gap-2">
//                                                                 <PermissionWrapper
//                                                                     functionalityName="Opportunities"
//                                                                     moduleName="Opportunities"
//                                                                     actionId={2}
//                                                                     component={
//                                                                         <Checkbox
//                                                                             checked={!!c.isKey}
//                                                                             disabled={
//                                                                                 currentKeyContactsCount >= 4 && !c.isKey
//                                                                             }
//                                                                             onChange={(e) => {
//                                                                                 e.stopPropagation();
//                                                                                 handleToggleKeyContact(
//                                                                                     c.id,
//                                                                                     !c.isKey
//                                                                                 );
//                                                                             }}
//                                                                         />
//                                                                     }
//                                                                 />
//                                                                 <div>
//                                                                     <p className="font-semibold text-gray-800">
//                                                                         {c.contactName}
//                                                                     </p>
//                                                                     {c.role && (
//                                                                         <p className="text-xs text-gray-500">
//                                                                             {c.role}
//                                                                         </p>
//                                                                     )}
//                                                                 </div>
//                                                             </div>
//                                                             <PermissionWrapper
//                                                                 functionalityName="Opportunities"
//                                                                 moduleName="Opportunities"
//                                                                 actionId={2}
//                                                                 component={
//                                                                     <Tooltip title="Delete contact" arrow>
//                                                                         <div className="bg-red-600 h-6 w-6 flex justify-center items-center rounded-full text-white">
//                                                                             <Components.IconButton
//                                                                                 onClick={(e) => {
//                                                                                     e.stopPropagation();
//                                                                                     handleOpenDeleteContactDialog(c.id);
//                                                                                 }}
//                                                                             >
//                                                                                 <CustomIcons
//                                                                                     iconName="fa-solid fa-trash"
//                                                                                     css="cursor-pointer text-white h-3 w-3"
//                                                                                 />
//                                                                             </Components.IconButton>
//                                                                         </div>
//                                                                     </Tooltip>
//                                                                 }
//                                                             />
//                                                         </div>
//                                                     ))
//                                                 ) : (
//                                                     <p className="text-sm text-gray-400 italic">
//                                                         No contacts linked to this opportunity.
//                                                     </p>
//                                                 )}

//                                             </div>
//                                         </>
//                                     )}
//                                 </div>
//                             </MeddicRow>

//                         </div>
//                     </div>
//                 )}

//                 {/* CONTACT MODAL + CONTACT DELETE DIALOG */}
//                 <OpportunityContactModel
//                     open={contactModalOpen}
//                     handleClose={handleCloseContactModel}
//                     opportunityId={opportunityId}
//                     handleGetAllOppContact={handleGetOppContacts}
//                 />
//                 <AlertDialog
//                     open={dialogContact.open}
//                     title={dialogContact.title}
//                     message={dialogContact.message}
//                     actionButtonText={dialogContact.actionButtonText}
//                     handleAction={handleDeleteContact}
//                     handleClose={handleCloseDeleteContactDialog}
//                 />

//                 {/* DECISION MAP DELETE DIALOG + ADD/EDIT MODAL */}
//                 <AlertDialog
//                     open={dialogDeleteDecisionMap.open}
//                     title={dialogDeleteDecisionMap.title}
//                     message={dialogDeleteDecisionMap.message}
//                     actionButtonText={dialogDeleteDecisionMap.actionButtonText}
//                     handleAction={handleDeteleDecisionMap}
//                     handleClose={handleCloseDecisionMapDelete}
//                 />
//                 <AddSalesProcessModel
//                     open={openDecisionMapModel}
//                     handleClose={handleCloseDecisionMapModel}
//                     id={salesProcessId}
//                     oppId={opportunityId}
//                     handleGetAllSalesProcess={handleGetAllSalesProcess}
//                 />
                
//                 {/* UNSAVED CHANGES DIALOG */}
//                 <AlertDialog
//                     open={unsavedChangesDialog.open}
//                     title={unsavedChangesDialog.title}
//                     message={unsavedChangesDialog.message}
//                     actionButtonText={unsavedChangesDialog.actionButtonText}
//                     cancelButtonText={unsavedChangesDialog.cancelButtonText}
//                     handleAction={handleUnsavedDialogAction}
//                     handleClose={handleUnsavedDialogClose}
//                 />
//             </div>
//         </>
//     );
// };

// const mapDispatchToProps = {
//     setAlert,
//     setSyncingPushStatus
// };

// export default connect(null, mapDispatchToProps)(OpportunitiesInfo);