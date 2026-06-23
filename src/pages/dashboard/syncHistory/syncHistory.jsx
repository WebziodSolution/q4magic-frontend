import React, { useEffect, useState } from 'react'
import { getSyncHistory } from '../../../service/syncRecords/syncRecordsService';
import DataTable from '../../../components/common/table/table';

const SyncHistory = () => {
    const [syncHistory, setSyncHistory] = useState([])

    const handleGetSyncHistory = async () => {
        try {
            const history = await getSyncHistory();
            if (history?.status === 200) {
                const reversedHistory = history?.result?.reverse() || [];

                // Group by the four keys and count
                const recordMap = new Map();

                reversedHistory.forEach((record, index) => {
                    const key = `${record.subject}_${record.operationType}_${record.syncType}_${record.error ? "Failed" : "Success"}`;

                    if (recordMap.has(key)) {
                        // Increment count for existing record
                        const existing = recordMap.get(key);
                        existing.count += 1;
                    } else {
                        // Create new record with count
                        recordMap.set(key, {
                            ...record,
                            rowId: recordMap.size + 1,
                            status: record.error ? "Failed" : "Success",
                            date: new Date(record.date).toLocaleDateString("en-US", {
                                month: "2-digit",
                                day: "2-digit",
                                year: "numeric"
                            }),
                            syncType: record.syncType === "PULL" ? "Download" : "Upload",
                            count: 1
                        });
                    }
                });

                const data = Array.from(recordMap.values());
                setSyncHistory(data);
            }
        } catch (error) {
            console.error("Error fetching sync history:", error);
        }
    }
    useEffect(() => {
        document.title = "Sync History - 360Pipe"
        handleGetSyncHistory();
    }, []);

    const columns = [
        // {
        //     field: 'rowId',
        //     headerName: '#',
        //     headerClassName: 'uppercase',
        //     flex: 1,
        //     maxWidth: 70,
        //     sortable: false,
        // },
        {
            field: 'date',
            headerName: 'Date',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 180,
        },

        {
            field: 'subject',
            headerName: 'Record Type',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 200
        },
        {
            field: 'count',
            headerName: 'Count',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 180,
            sortable: false,
        },
        {
            field: 'syncType',
            headerName: 'Direction',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 160
        },
        {
            field: 'status',
            headerName: 'Status',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 160
        },
        {
            field: 'error',
            headerName: 'Error',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 200,
            sortable: false,
        },
    ];

    const getRowId = (row) => {
        return row.rowId;
    }

    return (
        <>
            <div className='border rounded-lg bg-white mt-4'>
                <DataTable columns={columns} rows={syncHistory} getRowId={getRowId} height={550} hideFooter={true} />
            </div>
        </>
    )
}

export default SyncHistory