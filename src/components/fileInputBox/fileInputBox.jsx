import React, { useRef } from 'react';
import CustomIcons from '../common/icons/CustomIcons';
import { connect } from 'react-redux';
import { setAlert } from '../../redux/commonReducers/commonReducers';

function FileInputBox({
    setAlert,
    onFileSelect,
    value,
    onRemove,
    text,
    type = null,
    disabled = false
}) {

    const fileInputRef = useRef(null);

    const handleClick = () => {
        fileInputRef.current.click();
    };

    // 🔥 Resize image for OppLogo (100x100, proportional, no quality loss)
    const resizeOppLogo = (file) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const reader = new FileReader();

            reader.onload = (e) => {
                img.src = e.target.result;
            };

            img.onload = () => {
                const MAX_SIZE = 100;

                let { width, height } = img;

                // scale DOWN only (never upscale)
                const scale = Math.min(
                    MAX_SIZE / width,
                    MAX_SIZE / height,
                    1
                );

                const targetWidth = Math.round(width * scale);
                const targetHeight = Math.round(height * scale);

                const canvas = document.createElement('canvas');
                canvas.width = targetWidth;
                canvas.height = targetHeight;

                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Image processing failed'));
                            return;
                        }

                        const optimizedFile = new File(
                            [blob],
                            file.name,
                            {
                                type: file.type,
                                lastModified: Date.now(),
                            }
                        );

                        resolve(optimizedFile);
                    },
                    file.type,
                    1 // 👈 highest quality
                );
            };

            img.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setAlert({
                open: true,
                type: 'warning',
                message: 'Only image files are allowed',
            });
            return;
        }

        try {
            if (type === 'OppLogo') {
                const processedFile = await resizeOppLogo(file);
                onFileSelect && onFileSelect(processedFile);
            } else {
                onFileSelect && onFileSelect(file);
            }
        } catch (err) {
            setAlert({
                open: true,
                type: 'error',
                message: 'Failed to process image',
            });
        } finally {
            fileInputRef.current.value = null;
        }
    };

    return (
        <div className="w-full h-full">
            {value ? (
                <div className="relative w-full h-full border border-dashed border-gray-400 rounded-full overflow-hidden">
                    <a href={value} target="_blank" rel="noreferrer">
                        <img
                            src={value}
                            alt="Uploaded preview"
                            className="w-full h-full object-contain"
                        />
                    </a>

                    <div className="z-50 absolute top-3 right-7 h-6 w-6 flex justify-center items-center rounded-full border border-red-500 bg-red-500">
                        <button type="button" onClick={onRemove}>
                            <CustomIcons
                                iconName="fa-solid fa-xmark"
                                css="cursor-pointer text-white"
                            />
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    className="w-full h-full border border-dashed border-gray-400 rounded-full bg-white p-10 cursor-pointer hover:border-blue-400 transition"
                    onClick={handleClick}
                >
                    <div className="flex flex-col items-center justify-center text-gray-500">
                        <CustomIcons
                            iconName="fa-solid fa-image"
                            css="mb-3 w-6 h-6"
                        />
                        <p className="text-center text-xs">
                            {text || 'Click to upload image'}
                        </p>
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={handleFileChange}
                        disabled={disabled}
                    />
                </div>
            )}
        </div>
    );
}

const mapDispatchToProps = {
    setAlert,
};

export default connect(null, mapDispatchToProps)(FileInputBox);



// import React, { useRef } from 'react';
// import CustomIcons from '../common/icons/CustomIcons';
// import { connect } from 'react-redux';
// import { setAlert } from '../../redux/commonReducers/commonReducers';

// function FileInputBox({ setAlert, onFileSelect, value, onRemove, text, size = null, disabled = false }) {

//     const fileInputRef = useRef(null);
//     const handleClick = () => {
//         fileInputRef.current.click();
//     };

//     const handleFileChange = (e) => {
//         const file = e.target.files[0];
//         if (!file) return;

//         // If size is null or empty → allow all images
//         if (!size) {
//             onFileSelect && onFileSelect(file);
//             return;
//         }

//         const [width, height] = size.split("x").map(Number);

//         const img = new Image();
//         img.onload = () => {
//             // Check image dimensions only when size is given
//             if (img.width === width && img.height === height) {
//                 onFileSelect && onFileSelect(file);
//             } else {
//                 setAlert({
//                     open: true,
//                     type: "warning",
//                     message: `Only images with dimensions ${width}x${height}px are allowed.`
//                 });
//                 fileInputRef.current.value = null;
//             }
//         };
//         img.src = URL.createObjectURL(file);
//     };


//     return (
//         <div className="w-full h-full">
//             {value ? (
//                 <div className="relative w-full h-full border border-dashed border-gray-400 rounded-full overflow-hidden">
//                     <a href={value} target='_blank'>
//                         <img
//                             src={value}
//                             alt="Uploaded preview"
//                             className="w-full h-full object-contain"
//                         />
//                     </a>
//                     <div className='absolute top-5 right-7 h-6 w-6 flex justify-center items-center rounded-full border border-red-500 bg-red-500'>
//                         <button type='button' onClick={onRemove}>
//                             <CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer text-white' />
//                         </button>
//                     </div>
//                 </div>
//             ) : (
//                 <div
//                     className="w-full h-full border border-dashed border-gray-400 rounded-full bg-white p-10 cursor-pointer hover:border-blue-400 transition"
//                     onClick={handleClick}
//                 >
//                     <div className="flex flex-col items-center justify-center text-gray-500">
//                         <CustomIcons iconName="fa-solid fa-image" css={"mb-3 w-6 h-6"}/>
//                         <p className="text-center text-xs">
//                             {text ? text : 'Click in this area to upload a files'}
//                         </p>
//                     </div>
//                     <input
//                         type="file"
//                         ref={fileInputRef}
//                         className="hidden"
//                         accept="image/JPG, image/PNG, image/JPEG"
//                         onChange={handleFileChange}
//                         disabled={disabled}
//                     />
//                 </div>
//             )}
//         </div>
//     );
// }

// const mapDispatchToProps = {
//     setAlert,
// };

// export default connect(null, mapDispatchToProps)(FileInputBox)
