import React, { useEffect, useMemo, useRef, useState } from "react";
import { Tooltip } from "@mui/material";

import Components from "../../../components/muiComponents/components";
import CustomIcons from "../../../components/common/icons/CustomIcons";

import {
    getOpportunitiesCurrentEnvironmentByOppId,
    addOpportunitiesCurrentEnvironment,
    updateOpportunitiesCurrentEnvironment,
    deleteOpportunitiesCurrentEnvironment,
} from "../../../service/opportunitiesCurrentEnvironment/opportunitiesCurrentEnvironmentService"; // ✅ adjust path if needed
import { connect } from "react-redux";
import { setAlert } from "../../../redux/commonReducers/commonReducers";

// -------------------- Helpers (vendors JSON string <-> array) --------------------
const parseVendorsJson = (vendorsStr) => {
    if (!vendorsStr) return [];
    try {
        const arr = JSON.parse(vendorsStr);
        if (!Array.isArray(arr)) return [];
        return arr
            .map((x) => ({
                isChecked: !!x?.isChecked,
                value: (x?.value ?? "").toString(),
            }))
            .filter((x) => x.value.trim() !== "");
    } catch {
        return [];
    }
};

const stringifyVendorsJson = (vendorsArr) => {
    const safe = (vendorsArr || [])
        .map((x) => ({
            isChecked: !!x?.isChecked,
            value: (x?.value ?? "").toString().trim(),
        }))
        .filter((x) => x.value !== "");
    return JSON.stringify(safe);
};

const sortCompetitorsLast = (rows) => {
    return [...rows].sort((a, b) => {
        if (a.solution === "Competitors") return 1;
        if (b.solution === "Competitors") return -1;
        return 0;
    });
};

function EnvTable({ setAlert, opportunityId, handleGetOpportunitiesCurrentEnvironmentByOppId }) {
    const [loading, setLoading] = useState(false);

    // ✅ rows from API (state shape)
    // { id: number|null, solution: string, vendors: [{isChecked:boolean,value:string}] }
    const [currentEnvRows, setcurrentEnvRow] = useState([]);

    // Solution editing
    const [editingSolutionRow, setEditingSolutionRow] = useState(null);
    const [solutionDraft, setSolutionDraft] = useState("");

    // Vendor value editing (single vendor at a time)
    const [editingVendor, setEditingVendor] = useState({
        rowIndex: null,
        vendorIndex: null,
    });

    const [vendorDraft, setVendorDraft] = useState("");

    // New vendor input boxes per row
    const [newVendorInputs, setNewVendorInputs] = useState({}); // { [rowIndex]: string[] }

    // prevent blur-save when clicking delete etc.
    const suppressBlurSaveRef = useRef(false);

    // prevent overlapping save calls
    const savingRef = useRef(false);

    const hasOppId = useMemo(
        () => opportunityId !== undefined && opportunityId !== null && opportunityId !== "",
        [opportunityId]
    );

    // ------------------ API: LOAD ------------------
    // useEffect(() => {
    //     if (!hasOppId) return;

    //     const load = async () => {
    //         setLoading(true);
    //         try {
    //             const res = await getOpportunitiesCurrentEnvironmentByOppId(opportunityId);
    //             const rows = res?.result ?? [];
    //             setcurrentEnvRow(
    //                 rows.map((r) => ({
    //                     id: r?.id ?? null,
    //                     solution: r?.solution ?? "",
    //                     vendors: parseVendorsJson(r?.vendors),
    //                 }))
    //             );
    //         } catch (e) {
    //             console.error("Failed to load current environment:", e);
    //             // setcurrentEnvRow([{ id: null, solution: "", vendors: [] }]);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     load();
    // }, [hasOppId, opportunityId]);
    const load = async () => {
        setLoading(true);
        try {
            const res = await getOpportunitiesCurrentEnvironmentByOppId(opportunityId);
            const rows = res?.result ?? [];
            const mappedRows = rows.map((r) => ({
                id: r?.id ?? null,
                solution: r?.solution ?? "",
                vendors: parseVendorsJson(r?.vendors),
            }));

            // ✅ Apply the sort here
            setcurrentEnvRow(sortCompetitorsLast(mappedRows));
        } catch (e) {
            console.error("Failed to load current environment:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!hasOppId) return;
        load();
    }, [hasOppId, opportunityId]);

    // ------------------ API: UPSERT (ADD/UPDATE) ------------------
    const upsertRowToApi = async (rowIndex, overrides = {}) => {
        if (!hasOppId) return;
        if (savingRef.current) return;
        savingRef.current = true;

        try {
            const row = currentEnvRows[rowIndex];
            if (!row) return;

            // ✅ always use latest values (overrides > state)
            const finalSolution = overrides.solution ?? row.solution ?? "";
            const finalVendorsArr = overrides.vendors ?? row.vendors ?? [];
            if (finalSolution.trim() === "" && finalVendorsArr.length === 0) {
                return handleDeleteRow(rowIndex);
            }
            const payload = {
                id: row.id ?? null,
                oppId: parseInt(opportunityId),
                solution: finalSolution,
                vendors: stringifyVendorsJson(finalVendorsArr), // ✅ JSON string for API
            };
            // ADD
            if (!row.id) {
                const created = await addOpportunitiesCurrentEnvironment(payload);
                if (created?.status === 201) {
                    const newId = created?.result?.id ?? null;
                    if (newId) {
                        load()
                        handleGetOpportunitiesCurrentEnvironmentByOppId()
                        setcurrentEnvRow((prev) =>
                            prev.map((r, i) => (i === rowIndex ? { ...r, id: newId } : r))
                        );
                    }
                    return;
                } else {
                    setAlert({
                        open: true,
                        type: "error",
                        message: created.message
                    })
                }
            }

            // UPDATE
            const res = await updateOpportunitiesCurrentEnvironment(row.id, payload);
            if (res.status !== 200) {
                setAlert({
                    open: true,
                    type: "error",
                    message: res.message
                })
            } else {
                load()
                handleGetOpportunitiesCurrentEnvironmentByOppId()
            }
        } catch (e) {
            console.error("Failed to save row:", e);
        } finally {
            savingRef.current = false;
        }
    };

    // ------------------ ROW (SOLUTION) ------------------
    const handleAddRow = () => {
        setcurrentEnvRow((prev) => [...prev, { id: null, solution: "", vendors: [] }]);
        const newIndex = currentEnvRows.length;
        setEditingSolutionRow(newIndex);
        setSolutionDraft("");
    };

    const handleEditSolution = (rowIndex) => {
        const row = currentEnvRows[rowIndex];
        // ✅ Block editing if the solution is "Competitors"
        if (row?.solution === "Competitors") return;

        setEditingSolutionRow(rowIndex);
        setSolutionDraft(row?.solution || "");
    };

    const handleSaveSolution = async (rowIndex) => {
        const val = solutionDraft.trim();

        setcurrentEnvRow((prev) => {
            const updated = prev.map((r, i) => (i === rowIndex ? { ...r, solution: val } : r));
            return sortCompetitorsLast(updated); // ✅ Re-sort after edit
        });

        setEditingSolutionRow(null);
        setSolutionDraft("");

        await upsertRowToApi(rowIndex, { solution: val });
    };

    const handleDeleteRow = async (rowIndex) => {
        const row = currentEnvRows[rowIndex];

        // ✅ Prevent deletion of Competitors row
        if (row?.solution === "Competitors") {
            setAlert({
                open: true,
                type: "warning",
                message: "The Competitors row cannot be deleted."
            });
            return;
        }
        // optimistic UI
        setcurrentEnvRow((prev) => prev.filter((_, i) => i !== rowIndex));

        // clean edit states
        if (editingSolutionRow === rowIndex) {
            setEditingSolutionRow(null);
            setSolutionDraft("");
        }
        if (editingVendor.rowIndex === rowIndex) {
            setEditingVendor({ rowIndex: null, vendorIndex: null });
            setVendorDraft("");
        }

        // ✅ API delete (only if row has id)
        if (row?.id) {
            try {
                const res = await deleteOpportunitiesCurrentEnvironment(row.id);
                if (res?.status === 200) {
                    handleGetOpportunitiesCurrentEnvironmentByOppId()
                } else {
                    setAlert({
                        open: true,
                        type: "error",
                        message: res.message
                    })
                }
            } catch (e) {
                console.error("Failed to delete row:", e);
            }
        }
    };

    // ------------------ VENDORS ------------------
    const handleAddVendorInput = (rowIndex) => {
        setNewVendorInputs((prev) => {
            const arr = prev[rowIndex] ? [...prev[rowIndex]] : [];
            arr.push("");
            return { ...prev, [rowIndex]: arr };
        });
    };

    const handleVendorInputChange = (rowIndex, inputIndex, value) => {
        setNewVendorInputs((prev) => {
            const arr = [...(prev[rowIndex] || [])];
            arr[inputIndex] = value;
            return { ...prev, [rowIndex]: arr };
        });
    };

    const handleRemoveNewVendorInput = (rowIndex, inputIndex) => {
        setNewVendorInputs((prev) => {
            const arr = [...(prev[rowIndex] || [])];
            arr.splice(inputIndex, 1);
            return { ...prev, [rowIndex]: arr };
        });
    };

    const handleSaveNewVendor = async (rowIndex, inputIndex) => {
        const val = (newVendorInputs[rowIndex]?.[inputIndex] || "").trim();
        if (!val) return;

        const updatedVendors = [
            ...(currentEnvRows[rowIndex]?.vendors || []),
            { isChecked: false, value: val },
        ];

        // UI
        setcurrentEnvRow((prev) =>
            prev.map((r, i) => (i === rowIndex ? { ...r, vendors: updatedVendors } : r))
        );

        // remove input
        setNewVendorInputs((prev) => {
            const arr = [...(prev[rowIndex] || [])];
            arr.splice(inputIndex, 1);
            return { ...prev, [rowIndex]: arr };
        });

        // ✅ API save latest vendors
        await upsertRowToApi(rowIndex, { vendors: updatedVendors });
    };

    const handleToggleVendorChecked = async (rowIndex, vendorIndex) => {
        const updatedVendors = (currentEnvRows[rowIndex]?.vendors || []).map((v, i) =>
            i === vendorIndex ? { ...v, isChecked: !v.isChecked } : v
        );

        setcurrentEnvRow((prev) =>
            prev.map((r, i) => (i === rowIndex ? { ...r, vendors: updatedVendors } : r))
        );

        await upsertRowToApi(rowIndex, { vendors: updatedVendors });
    };

    const handleDeleteVendor = async (rowIndex, vendorIndex) => {
        const updatedVendors = [...(currentEnvRows[rowIndex]?.vendors || [])];
        updatedVendors.splice(vendorIndex, 1);

        setcurrentEnvRow((prev) =>
            prev.map((r, i) => (i === rowIndex ? { ...r, vendors: updatedVendors } : r))
        );

        // close edit if deleting edited vendor
        if (
            editingVendor.rowIndex === rowIndex &&
            editingVendor.vendorIndex === vendorIndex
        ) {
            setEditingVendor({ rowIndex: null, vendorIndex: null });
            setVendorDraft("");
        }

        await upsertRowToApi(rowIndex, { vendors: updatedVendors });
    };

    const handleEditVendor = (rowIndex, vendorIndex) => {
        setEditingVendor({ rowIndex, vendorIndex });
        setVendorDraft(currentEnvRows[rowIndex]?.vendors?.[vendorIndex]?.value || "");
    };

    const handleSaveVendorEdit = async () => {
        const { rowIndex, vendorIndex } = editingVendor;
        if (rowIndex === null || vendorIndex === null) return;

        const val = vendorDraft.trim();

        const updatedVendors = (currentEnvRows[rowIndex]?.vendors || []).map((v, i) =>
            i === vendorIndex ? { ...v, value: val } : v
        );

        setcurrentEnvRow((prev) =>
            prev.map((r, i) => (i === rowIndex ? { ...r, vendors: updatedVendors } : r))
        );

        setEditingVendor({ rowIndex: null, vendorIndex: null });
        setVendorDraft("");

        await upsertRowToApi(rowIndex, { vendors: updatedVendors });
    };

    if (!hasOppId) {
        return <div className="text-sm text-gray-500">opportunityId is missing.</div>;
    }

    return (
        <div className="absolute -top-32 lg:-right-96 z-10 rounded-md bg-white shadow-xl border-4 border-[#9E9E9E] overflow-hidden">
            <div className="w-[30rem] overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-[#D9D9D9] text-black text-base font-bold">
                            <th className="border-4 border-[#9E9E9E] px-4 py-2 text-left w-52">
                                <div className="flex items-center gap-3">
                                    <span className="grow">Solution</span>
                                    <Tooltip title="Add Row" arrow>
                                        <div className="bg-blue-600 h-6 w-6 flex justify-center items-center rounded-full text-white">
                                            <Components.IconButton onClick={handleAddRow}>
                                                <CustomIcons
                                                    iconName="fa-solid fa-plus"
                                                    css="cursor-pointer text-white h-3 w-3"
                                                />
                                            </Components.IconButton>
                                        </div>
                                    </Tooltip>
                                </div>
                            </th>
                            <th className="border-4 border-[#9E9E9E] px-4 py-2 text-left">
                                Vendor(s)
                            </th>
                        </tr>
                    </thead>

                    <tbody className="text-base">
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={2}
                                    className="border-4 border-[#9E9E9E] px-4 py-6 text-center text-gray-500"
                                >
                                    Loading...
                                </td>
                            </tr>
                        ) : (currentEnvRows || []).length === 0 ? (
                            <tr>
                                <td
                                    colSpan={2}
                                    className="border-4 border-[#9E9E9E] px-4 py-6 text-center text-gray-500"
                                >
                                    No records found.
                                </td>
                            </tr>
                        ) : (
                            currentEnvRows.map((row, rowIndex) => (
                                <tr key={row.id ?? rowIndex}>
                                    {/* Solution */}
                                    <td className="border-4 border-[#9E9E9E] px-4 py-3 font-semibold align-top">
                                        {editingSolutionRow === rowIndex ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    className="border border-gray-300 rounded px-2 py-1 w-full"
                                                    value={solutionDraft}
                                                    autoFocus
                                                    onChange={(e) => setSolutionDraft(e.target.value)}
                                                    onBlur={() => {
                                                        if (suppressBlurSaveRef.current) {
                                                            suppressBlurSaveRef.current = false;
                                                            return;
                                                        }
                                                        handleSaveSolution(rowIndex);
                                                    }}
                                                    placeholder="Enter solution..."
                                                />

                                                {/* Delete row */}
                                                <Tooltip title="Delete row" arrow>
                                                    <div className="bg-red-600 h-6 w-6 flex justify-center items-center rounded-full text-white">
                                                        <Components.IconButton
                                                            onMouseDown={() => {
                                                                suppressBlurSaveRef.current = true;
                                                            }}
                                                            onClick={() => handleDeleteRow(rowIndex)}
                                                        >
                                                            <CustomIcons
                                                                iconName="fa-solid fa-trash"
                                                                css="cursor-pointer text-white h-3 w-3"
                                                            />
                                                        </Components.IconButton>
                                                    </div>
                                                </Tooltip>
                                            </div>
                                        ) : (
                                            <div className="flex items-start justify-between gap-2">
                                                <span
                                                    // ✅ Add conditional cursor and logic
                                                    className={row.solution === "Competitors" ? "cursor-default" : "cursor-pointer"}
                                                    onClick={() => row.solution !== "Competitors" && handleEditSolution(rowIndex)}
                                                    title={row.solution === "Competitors" ? "" : "Click to edit"}
                                                >
                                                    {row.solution ? (
                                                        row.solution
                                                    ) : (
                                                        <span className="text-gray-400">Click to add</span>
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                    </td>

                                    {/* Vendors */}
                                    <td className="border-4 border-[#9E9E9E] px-4 py-3 relative">
                                        <div className="absolute top-2 right-2">
                                            <Tooltip title="Add Vendor" arrow>
                                                <div className="bg-blue-600 h-6 w-6 flex justify-center items-center rounded-full text-white">
                                                    <Components.IconButton
                                                        onClick={() => handleAddVendorInput(rowIndex)}
                                                    >
                                                        <CustomIcons
                                                            iconName="fa-solid fa-plus"
                                                            css="cursor-pointer text-white h-3 w-3"
                                                        />
                                                    </Components.IconButton>
                                                </div>
                                            </Tooltip>
                                        </div>

                                        {/* New vendor inputs */}
                                        {(newVendorInputs[rowIndex] || []).length > 0 && (
                                            <div className="flex flex-col gap-2 mb-3 pr-8">
                                                {(newVendorInputs[rowIndex] || []).map((val, inputIndex) => (
                                                    <div key={inputIndex} className="flex items-center gap-2">
                                                        <input
                                                            className="border border-gray-300 rounded px-2 py-1 w-44"
                                                            value={val}
                                                            onChange={(e) =>
                                                                handleVendorInputChange(
                                                                    rowIndex,
                                                                    inputIndex,
                                                                    e.target.value
                                                                )
                                                            }
                                                            onBlur={() => {
                                                                if (suppressBlurSaveRef.current) {
                                                                    suppressBlurSaveRef.current = false;
                                                                    return;
                                                                }
                                                                handleSaveNewVendor(rowIndex, inputIndex);
                                                            }}
                                                            placeholder="Enter vendor..."
                                                        />

                                                        {/* remove input */}
                                                        <Tooltip title="Remove" arrow>
                                                            <div className="bg-red-600 h-6 w-6 flex justify-center items-center rounded-full text-white">
                                                                <Components.IconButton
                                                                    onMouseDown={() => {
                                                                        suppressBlurSaveRef.current = true;
                                                                    }}
                                                                    onClick={() =>
                                                                        handleRemoveNewVendorInput(rowIndex, inputIndex)
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
                                                ))}
                                            </div>
                                        )}

                                        {/* Saved vendors */}
                                        <div className="flex flex-col gap-2 pr-8">
                                            {(row.vendors || []).length === 0 ? (
                                                <div className="text-gray-400 text-sm">
                                                    No vendors
                                                </div>
                                            ) : (
                                                (row.vendors || []).map((item, vendorIndex) => (
                                                    <div key={vendorIndex} className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={!!item.isChecked}
                                                            onChange={() =>
                                                                handleToggleVendorChecked(rowIndex, vendorIndex)
                                                            }
                                                        />

                                                        {editingVendor.rowIndex === rowIndex &&
                                                            editingVendor.vendorIndex === vendorIndex ? (
                                                            <div className="flex items-center gap-2 w-full">
                                                                <input
                                                                    className="border border-gray-300 rounded px-2 py-1 w-40"
                                                                    value={vendorDraft}
                                                                    onChange={(e) => setVendorDraft(e.target.value)}
                                                                    autoFocus
                                                                    onBlur={() => {
                                                                        if (suppressBlurSaveRef.current) {
                                                                            suppressBlurSaveRef.current = false;
                                                                            return;
                                                                        }
                                                                        handleSaveVendorEdit();
                                                                    }}
                                                                />

                                                                <Tooltip title="Delete" arrow>
                                                                    <div className="bg-red-600 h-6 w-6 flex justify-center items-center rounded-full text-white">
                                                                        <Components.IconButton
                                                                            onMouseDown={() => {
                                                                                suppressBlurSaveRef.current = true;
                                                                            }}
                                                                            onClick={() =>
                                                                                handleDeleteVendor(rowIndex, vendorIndex)
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
                                                        ) : (
                                                            <>
                                                                <span
                                                                    className="cursor-pointer"
                                                                    onClick={() => handleEditVendor(rowIndex, vendorIndex)}
                                                                    title="Click to edit"
                                                                >
                                                                    {item.value}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const mapDispatchToProps = {
    setAlert,
};

export default connect(null, mapDispatchToProps)(EnvTable);