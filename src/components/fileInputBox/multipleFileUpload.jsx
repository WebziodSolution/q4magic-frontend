import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { NavLink } from "react-router-dom";
import { connect } from "react-redux";
import { setAlert } from "../../redux/commonReducers/commonReducers";
import CustomIcons from "../common/icons/CustomIcons";
import { deleteImagesById } from "../../service/todo/todoService";
import Components from "../muiComponents/components";
import { deleteOpportunitiesDocs, updateOpportunitiesDocs } from "../../service/opportunities/opportunitiesService";
import PermissionWrapper from "../common/permissionWrapper/PermissionWrapper";
import AlertDialog from "../common/alertDialog/alertDialog";
import { deleteAttachments, deleteAttachmentsFiles } from "../../service/docsAttachments/docsAttachmentsService";

function MultipleFileUpload({
  files,
  setFiles,
  setAlert,
  setValue,
  existingImages,
  setExistingImages,
  type,
  multiple = true,
  placeHolder,
  uploadedFiles,
  setDeleteLogo,
  isFileUpload = true,
  removableExistingAttachments = true,
  flexView = false,
  // ✅ When false, show compact list rows (icon + name + delete) instead of tiles
  preview = true,
  fallbackFunction = () => { }
}) {
  const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [imagePreviewModal, setImagePreviewModal] = useState({ open: false, url: '', name: '' });

  const getExt = (name = "", fallbackMime = "") => {
    const qless = name.split("?")[0];
    const idx = qless.lastIndexOf(".");
    if (idx !== -1) return qless.slice(idx + 1).toLowerCase();
    if (fallbackMime && fallbackMime.includes("/")) {
      const sub = fallbackMime.split("/")[1];
      if (sub.includes("pdf")) return "pdf";
      if (sub.includes("word")) return "docx";
      if (sub === "msword") return "doc";
      if (sub.includes("excel") || sub.includes("sheet"))
        return sub.includes("sheet") ? "xlsx" : "xls";
      if (sub.includes("jpeg")) return "jpeg";
      if (sub.includes("png")) return "png";
      if (sub.includes("html")) return "html";
    }
    return "";
  };

  const isImageExt = (ext) => ["png", "jpg", "jpeg"].includes(ext);

  const iconForExt = (ext) => {
    switch (ext) {
      case "pdf":
        return { icon: "fa-regular fa-file-pdf", badge: "PDF", color: "bg-red-500" };
      case "doc":
      case "docx":
        return { icon: "fa-regular fa-file-word", badge: "DOC", color: "bg-blue-500" };
      case "xls":
      case "xlsx":
        return { icon: "fa-regular fa-file-excel", badge: "XLS", color: "bg-green-500" };
      case "html":
        return { icon: "fa-regular fa-file-code", badge: "HTML", color: "bg-orange-500" };
      default:
        return {
          icon: "fa-regular fa-file",
          badge: ext ? ext.toUpperCase() : "FILE",
          color: "bg-gray-500"
        };
    }
  };

  const TileFrame = ({ children }) => (
    <div className={`relative flex flex-col justify-start items-center w-28 border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-200 ${type === "docsAttachments" ? "mx-2" : "m-2"}`}>
      {children}
    </div>
  );

  const RemoveButton = ({ onClick }) => (
    <div className="bg-red-500 hover:bg-red-600 h-6 w-6 flex justify-center items-center rounded-full text-white absolute top-1 right-1 transition-colors duration-200">
      <Components.IconButton onClick={onClick} className="p-0">
        <CustomIcons iconName={"fa-solid fa-trash"} css="cursor-pointer text-white h-3 w-3" />
      </Components.IconButton>
    </div>
  );

  const InternalCheckbox = ({ checked, onChange }) => (
    <div className="flex items-center bg-white/90 rounded-md px-1 py-0.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-3 w-3 text-blue-600 rounded focus:ring-blue-500"
      />
      <label className="ml-1 text-[10px] text-gray-700 whitespace-nowrap cursor-pointer">
        Internal
      </label>
    </div>
  );

  // ✅ Toggle internal flag for either "files" or "existingImages"
  const handleCheckboxChange = async (imageId, source, index, isChecked) => {
    if (source === "files") {
      // keep File instances intact
      setFiles((prev) => {
        const updated = [...prev];
        const file = updated[index];
        if (file) {
          file.isInternal = isChecked;
        }
        return updated;
      });
    }

    if (source === "existing") {
      const res = await updateOpportunitiesDocs(imageId);
      if (res.status === 200) {
        setExistingImages?.((prev) =>
          prev?.map((img, i) =>
            i === index ? { ...img, isInternal: isChecked } : img
          )
        );
        setAlert({
          open: true,
          message: "Document updated successfully.",
          type: "success"
        })
      } else {
        setAlert({
          open: true,
          message: "Fail to update document",
          type: "error"
        })
      }
    }
  };

  // Open image preview modal
  const handleImagePreview = (url, name) => {
    setImagePreviewModal({ open: true, url, name });
  };

  // Close image preview modal
  const handleCloseImagePreview = () => {
    setImagePreviewModal({ open: false, url: '', name: '' });
  };

  const renderFileTile = ({
    url,
    name,
    ext,
    removable,
    onRemove,
    isInternal = false,
    onCheckboxChange
  }) => {
    const isImg = isImageExt(ext);
    const fileInfo = iconForExt(ext);

    return (
      <TileFrame key={name}>
        <div className="relative w-full h-20 flex justify-center items-center">
          {isImg ? (
            // For images: Open modal on click
            <div
              className="w-full h-full flex justify-center items-center cursor-pointer"
              onClick={() => handleImagePreview(url, name)}
            >
              <img src={url} alt={name} className="object-cover w-full h-full" />
            </div>
          ) : (
            // For non-images: Use NavLink to open in new tab
            <NavLink
              target="_blank"
              to={url}
              className="w-full h-full flex justify-center items-center"
            >
              <div className="w-full h-full flex flex-col justify-center items-center gap-1 px-1 text-center">
                <CustomIcons iconName={fileInfo.icon} css="text-gray-700 text-2xl" />
              </div>
            </NavLink>
          )}

          <PermissionWrapper
            functionalityName="Opportunities"
            moduleName="Opportunities"
            actionId={2}
            component={
              <>
                {removable && <RemoveButton onClick={onRemove} />}
              </>
            }
          />
        </div>

        <div className="w-full px-1 py-1 bg-gray-50 border-t border-gray-200">
          <div className="text-[10px] leading-tight line-clamp-2 break-all text-center text-gray-700">
            {name}
          </div>
        </div>
        {type === "oppDocs" && typeof onCheckboxChange === "function" && (
          <InternalCheckbox checked={isInternal} onChange={onCheckboxChange} />
        )}
      </TileFrame>
    );
  };

  const renderFileRow = ({
    url,
    name,
    ext,
    removable,
    onRemove,
    isInternal = false,
    onCheckboxChange
  }) => {
    const isImg = isImageExt(ext);
    const fileInfo = iconForExt(ext);

    return (
      <div
        key={`${name}-${url}`}
        className={`w-full max-w-full flex items-center justify-between gap-3  ${flexView ? "ml-3" : ""}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 flex items-center justify-center rounded-md bg-gray-50 border border-gray-200">
            <CustomIcons iconName={fileInfo.icon} css="text-gray-700 text-lg" />
          </div>

          {isImg ? (
            <button
              type="button"
              onClick={() => handleImagePreview(url, name)}
              className="text-left min-w-0"
              title={name}
            >
              <div className="text-xs text-gray-800 w-32">{name}</div>
            </button>
          ) : (
            <NavLink
              target="_blank"
              to={url}
              className="min-w-0"
              title={name}
            >
              <div className="text-xs text-gray-800 w-32">{name}</div>
            </NavLink>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {type === "oppDocs" && typeof onCheckboxChange === "function" && (
            <InternalCheckbox checked={isInternal} onChange={onCheckboxChange} />
          )}

          <PermissionWrapper
            functionalityName="Opportunities"
            moduleName="Opportunities"
            actionId={2}
            component={
              <>
                {removable && (
                  <Components.IconButton onClick={onRemove} className="p-0">
                    <CustomIcons iconName={"fa-solid fa-trash"} css="cursor-pointer text-red-600 text-sm" />
                  </Components.IconButton>
                )}
              </>
            }
          />
        </div>
      </div>
    );
  };

  const renderFile = preview ? renderFileTile : renderFileRow;

  // --- Dropzone ---
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [],
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "text/html": [".html"]
    },
    multiple: multiple,
    onDrop: (acceptedFiles) => {
      const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/html"
      ];

      const approved = [];
      const rejected = [];

      acceptedFiles.forEach((file) => {
        if (allowedTypes.includes(file.type)) {
          approved.push(file);
        } else {
          rejected.push(file);
        }
      });

      if (rejected.length) {
        const bad = rejected.map((f) => f.name).join(", ");
        setAlert({
          open: true,
          message: `Some files are not allowed: ${bad}. Only images (png, jpg, jpeg), PDF, Word, Excel, HTML.`,
          type: "error"
        });
      }

      if (approved.length) {
        setFiles((prev) => {
          const newFiles = approved.filter(
            (newFile) => !prev.some((p) => p.name === newFile.name)
          );
          return [
            ...prev,
            ...newFiles.map((file) =>
              Object.assign(file, {
                preview: URL.createObjectURL(file),
                isInternal: false
              })
            )
          ];
        });
      }
    }
  });

  // --- Actions ---
  const removeFile = (fileName) => {
    setFiles((prevFiles) => {
      const remaining = [];
      prevFiles.forEach((file) => {
        if (file.name === fileName) {
          if (file.preview) {
            URL.revokeObjectURL(file.preview);
          }
        } else {
          remaining.push(file);
        }
      });
      return remaining;
    });
  };

  const handleRemoveImages = async () => {
    if (type === "todo") {
      const response = await deleteImagesById(selectedImageId);
      if (response?.status === 200) {
        const data = existingImages?.filter((row) => row.imageId !== selectedImageId);
        setExistingImages(data);
        handleCloseDeleteDialog()
      } else {
        setAlert({ open: true, message: response.message, type: "error" });
      }
    }
    if (type === "oppDocs") {
      const response = await deleteOpportunitiesDocs(selectedImageId);
      if (response?.status === 200) {
        const data = existingImages?.filter((row) => row.imageId !== selectedImageId);
        setExistingImages(data);
        handleCloseDeleteDialog()
      } else {
        setAlert({ open: true, message: response.message, type: "error" });
      }
    }
    if (type === "docsAttachments") {
      const response = await deleteAttachments(selectedImageId);
      if (response?.status === 200) {
        const data = existingImages?.filter((row) => row.imageId !== selectedImageId);
        setExistingImages(data);
        fallbackFunction(true);
        handleCloseDeleteDialog();
      } else {
        setAlert({ open: true, message: response.message, type: "error" });
      }
    }
  };

  const handleOpenDeleteDialog = (id = null) => {
    setSelectedImageId(id)
    setDialog({ open: true, title: 'Delete Image Or Document', message: 'Are you sure! Do you want to delete this document?', actionButtonText: 'yes' });
  }

  const handleCloseDeleteDialog = () => {
    setSelectedImageId(null)
    setDialog({ open: false, title: '', message: '', actionButtonText: '' });
  }

  return (
    <div className="py-4 relative">
      <div className={`${flexView ? "flex items-start " : ""}`}>
        {isFileUpload && (
          <div
            {...getRootProps({
              className:
                "flex justify-center items-center w-full h-20 px-[20px] border-2 border-dashed border-blue-400 rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
            })}
          >
            <input {...getInputProps()} />
            <p className="text-gray-700 text-center text-sm">
              {placeHolder
                ? placeHolder
                : "Drag & drop files here, or click to select files (png, jpg, jpeg, pdf, doc, docx, xls, xlsx, html)"}
            </p>
          </div>
        )}

        <aside
          className={
            preview
              ? `flex flex-wrap ${flexView ? "mt-0" : "mt-4"} justify-start`
              : `flex flex-col ${flexView ? "mt-0" : "mt-4"} w-full gap-2`
          }
        >
          {existingImages?.map((item, idx) => {
            const ext = getExt(item.imageName || item.imageURL || "");
            const url = item.imageURL;
            const name = item.imageName || `file-${idx}.${ext || "bin"}`;

            return (
              <div key={`existing-${idx}`} className={preview ? "relative" : "w-full"}>
                {renderFile({
                  url,
                  name,
                  ext,
                  removable: removableExistingAttachments,
                  onRemove: () => {
                    if (item.__local) {
                      setExistingImages((prev) => prev.filter((_, i) => i !== idx));
                      return;
                    }
                    handleOpenDeleteDialog(item.imageId);
                  },
                  isInternal: !!item.isInternal,
                  onCheckboxChange: (checked) =>
                    handleCheckboxChange(item.imageId, "existing", idx, checked),
                })}
              </div>
            );
          })}

          {/* Newly added (client) files */}
          {files?.map((file, index) => {
            const ext = getExt(file.name, file.type);
            const url = file.preview;
            const name = file.name;
            return renderFile({
              url,
              name,
              ext,
              removable: true,
              onRemove: () => removeFile(file.name),
              isInternal: !!file.isInternal,
              onCheckboxChange: (checked) =>
                handleCheckboxChange(null, "files", index, checked)
            });
          })}

          {/* Previously uploadedFiles (fallback list, read-only) */}
          {!files?.length &&
            uploadedFiles?.map((item, idx) => {
              const ext = getExt(item.imageName || item.imageURL || "");
              const url = item.imageURL;
              const name = item.imageName || `file-${idx}.${ext || "bin"}`;
              return renderFile({
                url,
                name,
                ext,
                removable: false,
                isInternal: !!item.isInternal
              });
            })}
        </aside>
      </div>

      {/* Simple Image Preview Modal */}
      {imagePreviewModal.open && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50 p-4"
          onClick={handleCloseImagePreview}
        >
          <div
            className="relative bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {imagePreviewModal.name}
              </h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={handleCloseImagePreview}
              >
                <CustomIcons iconName="fa-solid fa-times" css="text-xl" />
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-100px)] ">
              <img
                src={imagePreviewModal.url}
                alt={imagePreviewModal.name}
                className="max-w-full max-h-full object-contain mx-auto"
              />
            </div>
          </div>
        </div>
      )}

      <AlertDialog
        open={dialog.open}
        title={dialog.title}
        message={dialog.message}
        actionButtonText={dialog.actionButtonText}
        handleAction={() => handleRemoveImages()}
        handleClose={() => handleCloseDeleteDialog()}
      />
    </div>
  );
}

const mapDispatchToProps = {
  setAlert
};

export default connect(null, mapDispatchToProps)(MultipleFileUpload);


// import React, { useState } from "react";
// import { useDropzone } from "react-dropzone";
// import { NavLink } from "react-router-dom";
// import { connect } from "react-redux";
// import { setAlert } from "../../redux/commonReducers/commonReducers";
// import CustomIcons from "../common/icons/CustomIcons";
// import { deleteImagesById } from "../../service/todo/todoService";
// import Components from "../muiComponents/components";
// import { deleteOpportunitiesDocs, updateOpportunitiesDocs } from "../../service/opportunities/opportunitiesService";
// import PermissionWrapper from "../common/permissionWrapper/PermissionWrapper";
// import AlertDialog from "../common/alertDialog/alertDialog";
// import { deleteAttachments, deleteAttachmentsFiles } from "../../service/docsAttachments/docsAttachmentsService";

// function MultipleFileUpload({
//   files,
//   setFiles,
//   setAlert,
//   setValue,
//   existingImages,
//   setExistingImages,
//   type,
//   multiple = true,
//   placeHolder,
//   uploadedFiles,
//   setDeleteLogo,
//   isFileUpload = true,
//   removableExistingAttachments = true,
//   flexView = false,
//   fallbackFunction = () => {}
// }) {
//   const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });
//   const [selectedImageId, setSelectedImageId] = useState(null);
//   const [imagePreviewModal, setImagePreviewModal] = useState({ open: false, url: '', name: '' });

//   const getExt = (name = "", fallbackMime = "") => {
//     const qless = name.split("?")[0];
//     const idx = qless.lastIndexOf(".");
//     if (idx !== -1) return qless.slice(idx + 1).toLowerCase();
//     if (fallbackMime && fallbackMime.includes("/")) {
//       const sub = fallbackMime.split("/")[1];
//       if (sub.includes("pdf")) return "pdf";
//       if (sub.includes("word")) return "docx";
//       if (sub === "msword") return "doc";
//       if (sub.includes("excel") || sub.includes("sheet"))
//         return sub.includes("sheet") ? "xlsx" : "xls";
//       if (sub.includes("jpeg")) return "jpeg";
//       if (sub.includes("png")) return "png";
//       if (sub.includes("html")) return "html";
//     }
//     return "";
//   };

//   const isImageExt = (ext) => ["png", "jpg", "jpeg"].includes(ext);

//   const iconForExt = (ext) => {
//     switch (ext) {
//       case "pdf":
//         return { icon: "fa-regular fa-file-pdf", badge: "PDF", color: "bg-red-500" };
//       case "doc":
//       case "docx":
//         return { icon: "fa-regular fa-file-word", badge: "DOC", color: "bg-blue-500" };
//       case "xls":
//       case "xlsx":
//         return { icon: "fa-regular fa-file-excel", badge: "XLS", color: "bg-green-500" };
//       case "html":
//         return { icon: "fa-regular fa-file-code", badge: "HTML", color: "bg-orange-500" };
//       default:
//         return {
//           icon: "fa-regular fa-file",
//           badge: ext ? ext.toUpperCase() : "FILE",
//           color: "bg-gray-500"
//         };
//     }
//   };

//   const TileFrame = ({ children }) => (
//     <div className={`relative flex flex-col justify-start items-center w-28 border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-200 ${type === "docsAttachments" ? "mx-2" : "m-2"}`}>
//       {children}
//     </div>
//   );

//   const RemoveButton = ({ onClick }) => (
//     <div className="bg-red-500 hover:bg-red-600 h-6 w-6 flex justify-center items-center rounded-full text-white absolute top-1 right-1 transition-colors duration-200">
//       <Components.IconButton onClick={onClick} className="p-0">
//         <CustomIcons iconName={"fa-solid fa-trash"} css="cursor-pointer text-white h-3 w-3" />
//       </Components.IconButton>
//     </div>
//   );

//   const InternalCheckbox = ({ checked, onChange }) => (
//     <div className="flex items-center bg-white/90 rounded-md px-1 py-0.5">
//       <input
//         type="checkbox"
//         checked={checked}
//         onChange={(e) => onChange(e.target.checked)}
//         className="h-3 w-3 text-blue-600 rounded focus:ring-blue-500"
//       />
//       <label className="ml-1 text-[10px] text-gray-700 whitespace-nowrap cursor-pointer">
//         Internal
//       </label>
//     </div>
//   );

//   // ✅ Toggle internal flag for either "files" or "existingImages"
//   const handleCheckboxChange = async (imageId, source, index, isChecked) => {
//     if (source === "files") {
//       // keep File instances intact
//       setFiles((prev) => {
//         const updated = [...prev];
//         const file = updated[index];
//         if (file) {
//           file.isInternal = isChecked;
//         }
//         return updated;
//       });
//     }

//     if (source === "existing") {
//       const res = await updateOpportunitiesDocs(imageId);
//       if (res.status === 200) {
//         setExistingImages?.((prev) =>
//           prev?.map((img, i) =>
//             i === index ? { ...img, isInternal: isChecked } : img
//           )
//         );
//         setAlert({
//           open: true,
//           message: "Document updated successfully.",
//           type: "success"
//         })
//       } else {
//         setAlert({
//           open: true,
//           message: "Fail to update document",
//           type: "error"
//         })
//       }
//     }
//   };

//   // Open image preview modal
//   const handleImagePreview = (url, name) => {
//     setImagePreviewModal({ open: true, url, name });
//   };

//   // Close image preview modal
//   const handleCloseImagePreview = () => {
//     setImagePreviewModal({ open: false, url: '', name: '' });
//   };

//   const renderFileTile = ({
//     url,
//     name,
//     ext,
//     removable,
//     onRemove,
//     isInternal = false,
//     onCheckboxChange
//   }) => {
//     const isImg = isImageExt(ext);
//     const fileInfo = iconForExt(ext);

//     return (
//       <TileFrame key={name}>
//         <div className="relative w-full h-20 flex justify-center items-center">
//           {isImg ? (
//             // For images: Open modal on click
//             <div
//               className="w-full h-full flex justify-center items-center cursor-pointer"
//               onClick={() => handleImagePreview(url, name)}
//             >
//               <img src={url} alt={name} className="object-cover w-full h-full" />
//             </div>
//           ) : (
//             // For non-images: Use NavLink to open in new tab
//             <NavLink
//               target="_blank"
//               to={url}
//               className="w-full h-full flex justify-center items-center"
//             >
//               <div className="w-full h-full flex flex-col justify-center items-center gap-1 px-1 text-center">
//                 <CustomIcons iconName={fileInfo.icon} css="text-gray-700 text-2xl" />
//               </div>
//             </NavLink>
//           )}

//           {/* only show checkbox when handler is provided */}
//           <PermissionWrapper
//             functionalityName="Opportunities"
//             moduleName="Opportunities"
//             actionId={2}
//             component={
//               <>
//                 {removable && <RemoveButton onClick={onRemove} />}
//               </>
//             }
//           />
//         </div>

//         <div className="w-full px-1 py-1 bg-gray-50 border-t border-gray-200">
//           <div className="text-[10px] leading-tight line-clamp-2 break-all text-center text-gray-700">
//             {name}
//           </div>
//         </div>
//         {type === "oppDocs" && typeof onCheckboxChange === "function" && (
//           <InternalCheckbox checked={isInternal} onChange={onCheckboxChange} />
//         )}
//       </TileFrame>
//     );
//   };

//   // --- Dropzone ---
//   const { getRootProps, getInputProps } = useDropzone({
//     accept: {
//       "image/*": [],
//       "application/pdf": [".pdf"],
//       "application/msword": [".doc"],
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
//       "application/vnd.ms-excel": [".xls"],
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
//       "text/html": [".html"]
//     },
//     multiple: multiple,
//     onDrop: (acceptedFiles) => {
//       const allowedTypes = [
//         "image/png",
//         "image/jpeg",
//         "image/jpg",
//         "application/pdf",
//         "application/msword",
//         "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//         "application/vnd.ms-excel",
//         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//         "text/html"
//       ];

//       const approved = [];
//       const rejected = [];

//       acceptedFiles.forEach((file) => {
//         if (allowedTypes.includes(file.type)) {
//           approved.push(file);
//         } else {
//           rejected.push(file);
//         }
//       });

//       if (rejected.length) {
//         const bad = rejected.map((f) => f.name).join(", ");
//         setAlert({
//           open: true,
//           message: `Some files are not allowed: ${bad}. Only images (png, jpg, jpeg), PDF, Word, Excel, HTML.`,
//           type: "error"
//         });
//       }

//       if (approved.length) {
//         setFiles((prev) => {
//           const newFiles = approved.filter(
//             (newFile) => !prev.some((p) => p.name === newFile.name)
//           );
//           return [
//             ...prev,
//             ...newFiles.map((file) =>
//               Object.assign(file, {
//                 preview: URL.createObjectURL(file),
//                 isInternal: false
//               })
//             )
//           ];
//         });
//       }
//     }
//   });

//   // --- Actions ---
//   const removeFile = (fileName) => {
//     setFiles((prevFiles) => {
//       const remaining = [];
//       prevFiles.forEach((file) => {
//         if (file.name === fileName) {
//           if (file.preview) {
//             URL.revokeObjectURL(file.preview);
//           }
//         } else {
//           remaining.push(file);
//         }
//       });
//       return remaining;
//     });
//   };

//   const handleRemoveImages = async () => {
//     if (type === "todo") {
//       const response = await deleteImagesById(selectedImageId);
//       if (response?.status === 200) {
//         const data = existingImages?.filter((row) => row.imageId !== selectedImageId);
//         setExistingImages(data);
//         handleCloseDeleteDialog()
//       } else {
//         setAlert({ open: true, message: response.message, type: "error" });
//       }
//     }
//     if (type === "oppDocs") {
//       const response = await deleteOpportunitiesDocs(selectedImageId);
//       if (response?.status === 200) {
//         const data = existingImages?.filter((row) => row.imageId !== selectedImageId);
//         setExistingImages(data);
//         handleCloseDeleteDialog()
//       } else {
//         setAlert({ open: true, message: response.message, type: "error" });
//       }
//     }
//     if (type === "docsAttachments") {
//       const response = await deleteAttachments(selectedImageId);
//       if (response?.status === 200) {
//         const data = existingImages?.filter((row) => row.imageId !== selectedImageId);
//         setExistingImages(data);
//         fallbackFunction();
//         handleCloseDeleteDialog();
//       } else {
//         setAlert({ open: true, message: response.message, type: "error" });
//       }
//     }
//   };

//   const handleOpenDeleteDialog = (id = null) => {
//     setSelectedImageId(id)
//     setDialog({ open: true, title: 'Delete Image Or Document', message: 'Are you sure! Do you want to delete this document?', actionButtonText: 'yes' });
//   }

//   const handleCloseDeleteDialog = () => {
//     setSelectedImageId(null)
//     setDialog({ open: false, title: '', message: '', actionButtonText: '' });
//   }

//   return (
//     <div className="py-4 relative">
//       <div className={`${flexView ? "flex items-start " : ""}`}>
//         {
//           isFileUpload && (
//             <div
//               {...getRootProps({
//                 className:
//                   "flex justify-center items-center w-full h-20 px-[20px] border-2 border-dashed border-blue-400 rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
//               })}
//             >
//               <input {...getInputProps()} />
//               <p className="text-gray-700 text-center text-sm">
//                 {placeHolder
//                   ? placeHolder
//                   : "Drag & drop files here, or click to select files (png, jpg, jpeg, pdf, doc, docx, xls, xlsx, html)"}
//               </p>
//             </div>
//           )
//         }

//         <aside className={`flex flex-wrap ${flexView ? "mt-0" : "mt-4"} justify-start`}>
//           {/* Existing (server) files */}
//           {/* {existingImages?.map((item, idx) => {
//           const ext = getExt(item.imageName || item.imageURL || "");
//           const url = item.imageURL;
//           const name = item.imageName || `file-${idx}.${ext || "bin"}`;
//           return (
//             <div key={`existing-${idx}`} className="relative">
//               {renderFileTile({
//                 url,
//                 name,
//                 ext,
//                 removable: removableExistingAttachments,
//                 // onRemove: () => handleOpenDeleteDialog(item.imageId),
//                 isInternal: !!item.isInternal,
//                 onCheckboxChange: (checked) =>
//                   handleCheckboxChange(item.imageId, "existing", idx, checked)
//               })}
//             </div>
//           );
//         })} */}
//           {existingImages?.map((item, idx) => {
//             const ext = getExt(item.imageName || item.imageURL || "");
//             const url = item.imageURL; // already preview blob
//             const name = item.imageName || `file-${idx}.${ext || "bin"}`;

//             return (
//               <div key={`existing-${idx}`} className="relative">
//                 {renderFileTile({
//                   url,
//                   name,
//                   ext,
//                   removable: removableExistingAttachments,
//                   onRemove: () => {
//                     if (item.__local) {
//                       setExistingImages((prev) => prev.filter((_, i) => i !== idx));
//                       return;
//                     }
//                     handleOpenDeleteDialog(item.imageId);
//                   },
//                   isInternal: !!item.isInternal,
//                   onCheckboxChange: (checked) =>
//                     handleCheckboxChange(item.imageId, "existing", idx, checked),
//                 })}
//               </div>
//             );
//           })}


//           {/* Newly added (client) files */}
//           {files?.map((file, index) => {
//             const ext = getExt(file.name, file.type);
//             const url = file.preview;
//             const name = file.name;
//             return renderFileTile({
//               url,
//               name,
//               ext,
//               removable: true,
//               onRemove: () => removeFile(file.name),
//               isInternal: !!file.isInternal,
//               onCheckboxChange: (checked) =>
//                 handleCheckboxChange(null, "files", index, checked)
//             });
//           })}

//           {/* Previously uploadedFiles (fallback list, read-only) */}
//           {!files?.length &&
//             uploadedFiles?.map((item, idx) => {
//               const ext = getExt(item.imageName || item.imageURL || "");
//               const url = item.imageURL;
//               const name = item.imageName || `file-${idx}.${ext || "bin"}`;
//               return renderFileTile({
//                 url,
//                 name,
//                 ext,
//                 removable: false,
//                 isInternal: !!item.isInternal
//               });
//             })}
//         </aside>

//       </div>

//       {/* Simple Image Preview Modal */}
//       {imagePreviewModal.open && (
//         <div
//           className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50 p-4"
//           onClick={handleCloseImagePreview}
//         >
//           <div
//             className="relative bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh]"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="flex justify-between items-center p-4 border-b">
//               <h3 className="text-lg font-semibold text-gray-900">
//                 {imagePreviewModal.name}
//               </h3>
//               <button
//                 className="text-gray-500 hover:text-gray-700"
//                 onClick={handleCloseImagePreview}
//               >
//                 <CustomIcons iconName="fa-solid fa-times" css="text-xl" />
//               </button>
//             </div>
//             <div className="p-4 overflow-auto max-h-[calc(90vh-100px)] ">
//               <img
//                 src={imagePreviewModal.url}
//                 alt={imagePreviewModal.name}
//                 className="max-w-full max-h-full object-contain mx-auto"
//               />
//             </div>
//           </div>
//         </div>
//       )}

//       <AlertDialog
//         open={dialog.open}
//         title={dialog.title}
//         message={dialog.message}
//         actionButtonText={dialog.actionButtonText}
//         handleAction={() => handleRemoveImages()}
//         handleClose={() => handleCloseDeleteDialog()}
//       />
//     </div>
//   );
// }

// const mapDispatchToProps = {
//   setAlert
// };

// export default connect(null, mapDispatchToProps)(MultipleFileUpload); 