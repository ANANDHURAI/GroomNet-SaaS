import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Award, CheckCircle, AlertCircle } from 'lucide-react';
import apiClient from '../../slices/api/apiIntercepters';
import FileUpload from '../../components/basics/FileUpload';

function DocumentUpload() {
    const [files, setFiles] = useState({
        licence: null,
        certificate: null,
        profile_image: null
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    const navigate = useNavigate();

    const handleFileChange = (type) => (file) => {
        setFiles(prev => ({ ...prev, [type]: file }));

        if (errors[type]) {
            setErrors(prev => ({ ...prev, [type]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setSuccessMessage('');

        if (!files.licence || !files.certificate || !files.profile_image) {
            setErrors({ general: 'Please upload all required documents.' });
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('licence', files.licence);
        formData.append('certificate', files.certificate);
        formData.append('profile_image', files.profile_image);

        try {
            const response = await apiClient.post('barber-reg/upload-documents/', formData);

            setSuccessMessage('Documents uploaded successfully! Your application is under review.');
            
            setTimeout(() => {
                navigate('/barber-status');
            }, 1000);

        } catch (error) {
            console.error('Upload failed:', error);
            if (error.response?.data) {
                setErrors(error.response.data);
            } else {
                setErrors({ general: 'Upload failed. Please try again.' });
            }
        } finally {
            setLoading(false);
        }
    };

    const allFilesSelected = files.licence && files.certificate && files.profile_image;

    const fileConfigs = [
        {
            id: 'licence-upload',
            type: 'licence',
            icon: FileText,
            title: 'Professional Licence',
            description: 'Upload your barber licence (PDF, JPG, PNG)',
            accept: '.pdf,.jpg,.jpeg,.png',
            showPreview: false
        },
        {
            id: 'certificate-upload',
            type: 'certificate',
            icon: Award,
            title: 'Professional Certificate',
            description: 'Upload your barber certificate (PDF, JPG, PNG)',
            accept: '.pdf,.jpg,.jpeg,.png',  
            showPreview: false
        },
        {
            id: 'profile-upload',
            type: 'profile_image',
            icon: Upload,
            title: 'Profile Image',
            description: 'Upload your profile photo (JPG, PNG)',
            accept: '.jpg,.jpeg,.png',
            showPreview: true
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Upload className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Upload Documents</h2>
                        <p className="text-gray-600">Please upload your professional credentials</p>
                    </div>

                    {successMessage && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                            <p className="text-green-600 text-sm">{successMessage}</p>
                        </div>
                    )}

                    {errors.general && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
                            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                            <p className="text-red-600 text-sm">{errors.general}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        
                        {fileConfigs.map((config) => (
                            <FileUpload
                                key={config.id}
                                id={config.id}
                                file={files[config.type]}
                                onChange={handleFileChange(config.type)}
                                accept={config.accept}
                                icon={config.icon}
                                title={config.title}
                                description={config.description}
                                error={errors[config.type]}
                                showPreview={config.showPreview}
                            />
                        ))}

                        {!allFilesSelected && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <p className="text-yellow-600 text-sm">Please upload all required documents to continue.</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !allFilesSelected}
                            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-purple-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                                    Uploading Documents...
                                </div>
                            ) : (
                                'Submit for Approval'
                            )}
                        </button>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-blue-800 text-sm">
                                <strong>Note:</strong> Your documents will be reviewed by our admin team. You'll receive a notification once the review is complete.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default DocumentUpload;