
import React, { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { getCroppedImg } from '../../utils/cropImage' 
import { Upload, X, Check, ZoomIn } from 'lucide-react'

export const ImageCropper = ({ currentImage, onImageCropped, aspect = 4 / 3, label = "Upload Image" }) => {
    const [imageSrc, setImageSrc] = useState(null)
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
    const [isCropping, setIsCropping] = useState(false)
    const [previewUrl, setPreviewUrl] = useState(currentImage || null)

    const onFileChange = async (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]
            const imageDataUrl = await readFile(file)
            setImageSrc(imageDataUrl)
            setIsCropping(true)
        }
    }

    const readFile = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader()
            reader.addEventListener('load', () => resolve(reader.result), false)
            reader.readAsDataURL(file)
        })
    }

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const showCroppedImage = useCallback(async () => {
        try {
            const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels)
            const croppedUrl = URL.createObjectURL(croppedImageBlob)
            const file = new File([croppedImageBlob], "cropped_image.jpg", { type: "image/jpeg" })
            
            setPreviewUrl(croppedUrl)
            setIsCropping(false)
            onImageCropped(file)
        } catch (e) {
            console.error(e)
        }
    }, [imageSrc, croppedAreaPixels, onImageCropped])

    const cancelCrop = () => {
        setIsCropping(false)
        setImageSrc(null)
      
        document.getElementById('fileInput').value = ""
    }

    return (
        <div className="space-y-4">
            <label className="block mb-1 font-medium text-sm text-gray-700">{label}</label>
          
            {isCropping && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex flex-col items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-4 w-full max-w-lg h-[500px] flex flex-col relative">
                        <div className="relative flex-1 bg-gray-900 rounded-md overflow-hidden">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={aspect}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        </div>
                        
                        <div className="mt-4 flex items-center gap-4">
                            <ZoomIn size={20} className="text-gray-500" />
                            <input
                                type="range"
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                aria-labelledby="Zoom"
                                onChange={(e) => setZoom(e.target.value)}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        <div className="mt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={cancelCrop}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 flex items-center gap-2"
                            >
                                <X size={18} /> Cancel
                            </button>
                            <button
                                type="button"
                                onClick={showCroppedImage}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                            >
                                <Check size={18} /> Crop & Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                {previewUrl ? (
                    <div className="relative mb-4">
                        <img 
                            src={previewUrl} 
                            alt="Preview" 
                            className="h-40 w-auto object-cover rounded-md shadow-sm"
                        />
                        <button 
                            type="button"
                            onClick={() => document.getElementById('fileInput').click()}
                            className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-50 text-gray-700"
                            title="Change Image"
                        >
                            <Edit2 size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="text-center p-6" onClick={() => document.getElementById('fileInput').click()}>
                        <div className="mx-auto h-12 w-12 text-gray-400">
                            <Upload size={48} />
                        </div>
                        <p className="mt-1 text-sm text-gray-500">Click to upload image</p>
                    </div>
                )}
                
                <input
                    id="fileInput"
                    type="file"
                    accept="image/jpeg, image/png"
                    onChange={onFileChange}
                    className="hidden"
                />
            </div>
        </div>
    )
}

import { Edit2 } from 'lucide-react';