import React, { useState, useEffect } from 'react';
import Input from '../input/input';
import { useTheme } from '@mui/material';
import { ReactSortable } from 'react-sortablejs';
import PropTypes from 'prop-types';
import { DataGrid } from '@mui/x-data-grid';
import CustomIcons from '../icons/CustomIcons';
import { getUserDetails } from '../../../utils/getUserDetails';

const paginationModel = { page: 0, pageSize: 10 };

const AscIcon = () => (
    <CustomIcons
        iconName="fa-solid fa-sort-up"
        css="text-[#5B21B6] text-sm ml-2"
    />
);

const DescIcon = () => (
    <CustomIcons
        iconName="fa-solid fa-sort-down"
        css="text-[#5B21B6] text-sm ml-2"
    />
);

const UnsortedIcon = () => (
    <CustomIcons
        iconName="fa-solid fa-sort"
        css="text-[#5B21B6] text-sm ml-2"
    />
);

export default function DataTable({
    getRowClassName,
    checkboxSelection = false,
    showSearch = false,
    onChangeSearch,
    searchValue = "",
    searchPlaceholder = "Search...",
    showButtons = false,
    showFilters = false,
    filtersComponent = null,
    rows,
    columns,
    getRowId,
    height,
    buttons,
    allowSorting = false,
    setRowSelectionModel,
    rowSelectionModel,
    processRowUpdate,
    hideFooter = false,
    onRowClick
}) {
    const userInfo = getUserDetails();
    const theme = useTheme();
    const [priority, setPriority] = useState(false);
    const [priorityData, setPriorityData] = useState([]);
    const [sortedRows, setSortedRows] = useState([]);

    useEffect(() => {
        // keep original ids, just rewrite the display index (use your field name)
        const resequenced = (rows || []).filter(Boolean).map((r, i) => ({
            ...r,
            rowId: i + 1,            // <-- or slNo if that’s your column key
        }));
        setSortedRows(resequenced);
    }, [rows]);


    // const handleChangeTodoPriority = async () => {
    //     if (priority) {
    //         const res = await changeTodoPriority(priorityData)
    //         if (res && res.status === 200) {
    //             setPriority(false)
    //             setPriorityData([])
    //         }
    //     }
    // }

    // useEffect(() => {
    //     handleChangeTodoPriority()
    // }, [priority]);

    const renderSortableTable = (sortedRows, setSortedRows) => {
        const handleChangeValue = (newList) => {
            const filteredList = (newList || []).filter(Boolean);

            // resequence the display index after reorder
            const resequenced = filteredList.map((row, idx) => ({
                ...row,
                rowId: idx + 1,          // <-- match your index column's field name
            }));

            setSortedRows(resequenced);

            // keep using the true ids for your server payload — unchanged
            const logArr = resequenced?.map((row, idx) => ({
                id: row.priorityId || null,
                todoId: row.id,
                priority: idx,
                userId: userInfo.userId
            }));
            setPriorityData(logArr);
        };

        return (
            <div className="overflow-x-auto" style={{ height: height || "full", width: '100%' }}>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead style={{ background: '#EDE9FE', color: '#5B21B6' }}>
                        <tr className='sticky top-0 bg-[#EDE9FE] text-[#5B21B6] z-30 '>
                            <th className="w-6"></th>
                            {columns.map(col => (
                                <th
                                    key={col.field}
                                    className="px-2 py-4 font-semibold uppercase border-b text-left text-[0.875rem] leading-[1.25rem]"
                                    style={{
                                        maxWidth: col.maxWidth,
                                        minWidth: col.minWidth,
                                        textAlign: col.headerAlign || 'left'
                                    }}
                                >
                                    {col.headerName}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <ReactSortable
                        tag="tbody"
                        list={sortedRows}
                        setList={handleChangeValue}
                        onEnd={(evt) => {
                            setTimeout(() => {
                                if (priorityData && priorityData?.length > 0 && !priority) {
                                    setPriority(true)
                                }
                            }, 1000);
                        }}
                        animation={150} fallbackOnBody={true} swapThreshold={0.65} ghostClass={"ghost"} group={"shared"} forceFallback={true}
                    >
                        {sortedRows?.length > 0 ? sortedRows?.map((row, idx) => (
                            <tr
                                key={String(getRowId(row))}
                                className={`${getRowClassName ? getRowClassName({ row }) : ''} border-b hover:bg-[#F5F3FF]`}
                                data-id={String(getRowId(row))}
                            >
                                <td className="sortable-handle cursor-move px-2 py-4 align-middle">
                                    {/* Removed the grip-lines icon */}
                                </td>
                                {columns.map(col => (
                                    <td
                                        key={col.field}
                                        className="px-2 py-4 align-middle text-sm"
                                        style={{
                                            maxWidth: col.maxWidth,
                                            minWidth: col.minWidth,
                                            textAlign: col.align || 'left'
                                        }}
                                    >
                                        {col.renderCell ? col.renderCell({ row, value: row[col.field] }) : row[col.field]}
                                    </td>
                                ))}
                            </tr>
                        )) :
                            <tr>
                                <td colSpan={10} className="text-center h-96 font-bold text-lg">
                                    There is no task for today.
                                </td>
                            </tr>
                        }
                    </ReactSortable>
                </table>
            </div>
        )
    }

    if (allowSorting) {
        return (
            <div>
                {(showSearch || showButtons || showFilters) && (
                    <div className="border border-1 py-4 px-5 rounded-lg rounded-b-none grid md:grid-cols-2">
                        {/* <div className="w-full md:w-60 mb-3 md:mb-0 md:max-w-xs">
                            {showSearch && (
                                <Input name="search" label="Search" endIcon={<CustomIcons iconName={'fa-solid fa-magnifying-glass'} css='mr-3' />} />
                            )}
                        </div> */}
                        <div>
                            {
                                showFilters && filtersComponent && (filtersComponent())
                            }
                        </div>
                        <div className="w-full flex justify-end md:justify-end items-center gap-3">
                            {showButtons && buttons && buttons()}
                        </div>
                    </div>
                )}
                {renderSortableTable(sortedRows, setSortedRows)}
            </div>
        );
    }

    // Only render DataGrid if allowSorting is false
    return (
        <>
            {(showSearch || showButtons || showFilters) && (
                <div className="border border-1 py-4 px-5 rounded-lg rounded-b-none flex justify-between items-center gap-4">
                    <div className='grow'>
                        {showSearch && (
                            <div className="w-full md:w-80 mb-3 md:mb-0 md:max-w-xs">
                                <Input value={searchValue} onChange={onChangeSearch} placeholder={searchPlaceholder} name="search" startIcon={<CustomIcons iconName={'fa-solid fa-magnifying-glass'} css='mr-3' />} />
                            </div>
                        )}
                        <div>
                            {
                                showFilters && filtersComponent && (filtersComponent())
                            }
                        </div>
                    </div>
                    <div>
                        {showButtons && buttons && buttons()}
                    </div>
                </div>
            )}
            {/* Only render DataGrid if allowSorting is false */}
            {!allowSorting && (
                <div style={{ height: height || "full", width: '100%' }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        initialState={{ pagination: { paginationModel } }}
                        pageSizeOptions={[10, 25, 50]}
                        disableRowSelectionOnClick
                        hideFooterSelectedRowCount
                        hideFooter={hideFooter}
                        onRowClick={(params) => {
                            if (onRowClick) {
                                onRowClick(params.row);
                            }
                        }}
                        getRowClassName={getRowClassName}
                        getRowId={getRowId}
                        checkboxSelection={checkboxSelection}
                        onRowSelectionModelChange={(newRowSelectionModel) => {
                            setRowSelectionModel(newRowSelectionModel);
                        }}
                        rowSelectionModel={rowSelectionModel}
                        processRowUpdate={processRowUpdate}
                        slots={{
                            columnSortedAscendingIcon: AscIcon,
                            columnSortedDescendingIcon: DescIcon,
                            columnUnsortedIcon: UnsortedIcon,
                        }}
                        disableColumnMenu
                        slotProps={{
                            toolbar: {
                                showQuickFilter: true,          // ✅ adds a search box
                                quickFilterProps: { debounceMs: 500 },
                            },
                        }}
                        sx={{
                            color: theme.palette.text.primary,
                            overflow: 'auto',
                            '& .MuiDataGrid-editInputCell': {
                                // border: 1,
                                // borderColor:"blue",
                                boxShadow: 5
                            },
                            '& .MuiDataGrid-columnHeaders': {
                                position: 'sticky',
                                top: 0,
                                zIndex: 2,
                                backgroundColor: '#EDE9FE',
                                color: '#5B21B6',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                lineHeight: '1.25rem',
                            },
                            '& .MuiDataGrid-footerContainer': {
                                position: 'sticky',
                                bottom: 0,
                                zIndex: 2,
                                backgroundColor: theme.palette.background.paper,
                            },
                            '& .MuiDataGrid-container--top [role="row"]': {
                                backgroundColor: '#EDE9FE',
                            },
                            '& .MuiDataGrid-container--bottom [role="row"]': {
                                backgroundColor: theme.palette.background.paper,
                            },
                            '& .MuiDataGrid-row:hover': {
                                backgroundColor: '#F5F3FF',
                            },
                            '& .MuiDataGrid-overlay': {
                                backgroundColor: theme.palette.background.paper,
                            },

                            "& .MuiCheckbox-root": {
                                color: theme.palette.secondary.main,
                            },
                            "& .MuiCheckbox-root.Mui-checked": {
                                color: `${theme.palette.secondary.main} !important`,
                            },

                            "& .MuiDataGrid-row.Mui-selected": {
                                backgroundColor: "rgba(4,120,220,0.08) !important",
                            },
                            "& .MuiDataGrid-row.Mui-selected:hover": {
                                backgroundColor: "rgba(4,120,220,0.12) !important",
                            },
                            "& .MuiDataGrid-toolbarContainer": {
                                p: 1.5,
                                backgroundColor: "#f7f9fb",
                                borderBottom: "1px solid #e0e0e0",
                            },
                        }}
                    />
                </div>
            )}
        </>
    );
}

DataTable.propTypes = {
    getRowClassName: PropTypes.func,
    checkboxSelection: PropTypes.bool,
    showSearch: PropTypes.bool,
    showButtons: PropTypes.bool,
    rows: PropTypes.array.isRequired,
    columns: PropTypes.array.isRequired,
    getRowId: PropTypes.func.isRequired,
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    buttons: PropTypes.func,
    allowSorting: PropTypes.bool,
    userId: PropTypes.string,
};