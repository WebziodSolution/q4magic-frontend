import React, { useEffect, useState } from 'react'

import DataTable from '../../../components/common/table/table';
import { getAllAccounts } from '../../../service/account/accountService';

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);

  const handleGetAccounts = async () => {
    try {
      const accounts = await getAllAccounts();
      const formattedAccounts = accounts?.result?.map((account, index) => ({
        ...account,
        rowId: index + 1
      }));
      setAccounts(formattedAccounts);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  }

  useEffect(() => {
    handleGetAccounts();
  }, []);

  const columns = [
    {
      field: 'rowId',
      headerName: '#',
      headerClassName: 'uppercase',
      flex: 1,
      maxWidth: 50,
      sortable: false,
    },
    {
      field: 'accountName',
      headerName: 'Account Name',
      headerClassName: 'uppercase',
      flex: 1,
      maxWidth: 300,
      sortable: false,
    },
    {
      field: 'phone',
      headerName: 'Phone',
      headerClassName: 'uppercase',
      flex: 1,
      minWidth: 200
    },   
  ];

  const getRowId = (row) => {
    return row.rowId;
  }

  return (
    <div className='w-full'>
      <div className='border rounded-lg bg-white'>
        <DataTable columns={columns} rows={accounts} getRowId={getRowId} height={610}/>
      </div>
    </div>
  )
}

export default Accounts;