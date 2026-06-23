import React, { useEffect, useState } from 'react'
import { deletProducts, getAllProducts } from '../../../service/products/productService'
import DataTable from '../../../components/common/table/table'
import Button from '../../../components/common/buttons/button'
import CustomIcons from '../../../components/common/icons/CustomIcons'
import PermissionWrapper from '../../../components/common/permissionWrapper/PermissionWrapper'
import AddProductModel from '../../../components/models/products/addProductModel'
import AlertDialog from '../../../components/common/alertDialog/alertDialog'
// import Components from '../../../components/muiComponents/components'
import { connect } from 'react-redux'
import { setAlert } from '../../../redux/commonReducers/commonReducers'

const Products = ({ setAlert }) => {
  const [products, setProducts] = useState([])
  const [open, setOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });

  const handleOpen = (todoId = null) => {
    setSelectedProductId(todoId);
    setOpen(true);
  }

  const handleClose = () => {
    setSelectedProductId(null);
    setOpen(false);
  }

  // const handleOpenDeleteDialog = (id) => {
  //   setSelectedProductId(id);
  //   setDialog({ open: true, title: 'Delete Product', message: 'Are you sure! Do you want to delete this product?', actionButtonText: 'yes' });
  // }

  const handleCloseDeleteDialog = () => {
    setSelectedProductId(null);
    setDialog({ open: false, title: '', message: '', actionButtonText: '' });
  }

  const handleDeleteProduct = async () => {
    const res = await deletProducts(selectedProductId);
    if (res.data.status === 200) {
      handleGetAllProducts();
      handleCloseDeleteDialog();
    } else {
      setAlert({
        open: true,
        message: res?.data?.message || "Failed to delete product",
        type: "error"
      });
    }
  }

  const handleGetAllProducts = async () => {
    const res = await getAllProducts();
    if (res.data?.status === 200) {
      const data = res?.data?.result?.map((item, index) => {
        return {
          ...item,
          rowId: index + 1,
          description: item.description || "-"
        }
      })
      setProducts(data)
    }
  }

  useEffect(() => {
    document.title = "Products & Service - 360Pipe"
    handleGetAllProducts()
  }, [])

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
      field: 'name',
      headerName: 'Product Name',
      headerClassName: 'uppercase',
      flex: 1,
      minWidth: 100,
      sortable: false,
    },
    {
      field: 'code',
      headerName: 'Code',
      headerClassName: 'uppercase',
      flex: 1,
      minWidth: 150
    },
    {
      field: 'price',
      headerName: 'Price',
      headerClassName: 'uppercase',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => {
        return (
          <span>{params.value ? `$${params.value.toLocaleString()}` : ''}</span>
        )
      }
    },
    {
      field: 'description',
      headerName: 'Description',
      headerClassName: 'uppercase',
      flex: 1,
      minWidth: 150
    },
    // {
    //   field: 'isActive',
    //   headerName: 'Active',
    //   headerClassName: 'uppercase',
    //   flex: 1,
    //   minWidth: 500,
    //   sortable: false,
    //   renderCell: (params) => {
    //     return (
    //       <div className='flex items-center gap-2 h-full'>
    //         <div className={`${params.value === true ? "bg-green-500" : "bg-red-500"} flex justify-center items-center p-1 h-8 w-8 rounded-full`}>
    //           <CustomIcons iconName={params.value === true ? "fa-solid fa-check" : "fa-solid fa-xmark"} css='cursor-pointer text-white text-xl' />
    //         </div>
    //       </div>
    //     );
    //   },
    // },
    // {
    //   field: 'action',
    //   headerName: 'action',
    //   headerClassName: 'uppercase',
    //   sortable: false,
    //   minWidth: 150,
    //   renderCell: (params) => {
    //     return (
    //       <div className='flex items-center gap-2 justify-center h-full'>
    //         <PermissionWrapper
    //           functionalityName="Todo"
    //           moduleName="Todo"
    //           actionId={2}
    //           component={
    //             <div className='bg-[#44288E] h-8 w-8 flex justify-center items-center rounded-full text-white'>
    //               <Components.IconButton onClick={() => handleOpen(params.row.id)}>
    //                 <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-white h-4 w-4' />
    //               </Components.IconButton>
    //             </div>
    //           }
    //         />
    //         <PermissionWrapper
    //           functionalityName="Todo"
    //           moduleName="Todo"
    //           actionId={3}
    //           component={
    //             <div className='bg-red-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
    //               <Components.IconButton onClick={() => handleOpenDeleteDialog(params.row.id)}>
    //                 <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer text-white h-4 w-4' />
    //               </Components.IconButton>
    //             </div>
    //           }
    //         />
    //       </div>
    //     );
    //   },
    // },
  ];

  const getRowId = (row) => {
    return row.rowId;
  }

  const actionButtons = () => {
    return (
      <PermissionWrapper
        functionalityName="Todo"
        moduleName="Todo"
        actionId={1}
        component={
          <div>
            <Button type={`button`} text={'Add Products'} onClick={() => handleOpen()} startIcon={<CustomIcons iconName="fa-solid fa-plus" css="h-5 w-5" />} />
          </div>
        }
      />
    )
  }
  return (
    <>
      <div className='border rounded-lg bg-white w-full lg:w-full '>
        <DataTable
          columns={columns}
          rows={products}
          getRowId={getRowId}
          showButtons={false}
          buttons={actionButtons}
          height={550}
          hideFooter={true}
        />
        <AddProductModel open={open} handleClose={handleClose} id={selectedProductId} handleGetAllProducts={handleGetAllProducts} />
        <AlertDialog
          open={dialog.open}
          title={dialog.title}
          message={dialog.message}
          actionButtonText={dialog.actionButtonText}
          handleAction={() => handleDeleteProduct()}
          handleClose={() => handleCloseDeleteDialog()}
        />
      </div>
    </>
  )
}

const mapDispatchToProps = {
  setAlert,
};

export default connect(null, mapDispatchToProps)(Products)