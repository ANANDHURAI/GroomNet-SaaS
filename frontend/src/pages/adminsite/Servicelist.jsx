import React, { useEffect, useState } from 'react'
import { Plus, Search, Filter } from 'lucide-react'
import apiClient from '../../slices/api/apiIntercepters'
import AdminSidebar from '../../components/admincompo/AdminSidebar'
import { Modal } from '../../components/admincompo/categoryCom/Modal'
import LoadingSpinner from '../../components/admincompo/LoadingSpinner'
import { ErrorMessage } from '../../components/admincompo/categoryCom/ErrorMessage'
import { ServiceCard } from '../../components/admincompo/serviceCom/ServiceCard'
import { ServiceForm } from '../../components/admincompo/serviceCom/ServiceForm'
import { ConfirmationModal } from '../../components/admincompo/serviceCom/ConfirmationModal'




export function Servicelist() {
    const [data, setData] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [filterCategory, setFilterCategory] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [serviceToDelete, setServiceToDelete] = useState(null)
    const [editingService, setEditingService] = useState(null)
    const [formErrors, setFormErrors] = useState({})
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        description: '',
        price: '',
        duration_minutes: '',
        image: null
    })

    useEffect(() => {
        fetchCategories()
        fetchServices()
    }, [])

    const fetchServices = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await apiClient.get('/adminsite/services/')
            setData(response.data || [])
        } catch (error) {
            console.error('Error fetching services:', error)
            if (error.response?.status === 404) {
                setData([])
            } else {
                setError('Failed to fetch services')
            }
        } finally {
            setLoading(false)
        }
    }

    const fetchCategories = async () => {
        try {
            const response = await apiClient.get('/adminsite/categories/')
            setCategories(response.data?.filter(cat => !cat.is_blocked) || [])
        } catch (error) {
            console.error('Error fetching categories:', error)
            setCategories([])
        }
    }

    const validateForm = () => {
        const errors = {}
        
        if (!formData.name.trim()) errors.name = 'Service name is required'
        if (!formData.category) errors.category = 'Category is required'
        if (!formData.price || parseFloat(formData.price) <= 0) errors.price = 'Valid price is required'
        if (!formData.duration_minutes || parseInt(formData.duration_minutes) <= 0) errors.duration_minutes = 'Valid duration is required'
      
        if (!editingService && !formData.image) {
            errors.image = 'Image must be uploaded'
        }
        
        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!validateForm()) return

        try {
            const formDataToSend = new FormData()
            
            formDataToSend.append('name', formData.name);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('duration_minutes', formData.duration_minutes);

            if (formData.image instanceof File) {
                formDataToSend.append('image', formData.image)
            }

            if (editingService) {
                await apiClient.put(`/adminsite/services/${editingService.id}/`, formDataToSend)
            } else {
                await apiClient.post('/adminsite/services/', formDataToSend)
            }
            
            fetchServices()
            setShowModal(false)
            setEditingService(null)
            resetForm()
        } catch (error) {
            console.error('Error saving service:', error);

            if (error.response && error.response.status === 400) {
                if (error.response.data.name) {
                
                    setFormErrors({ ...formErrors, global: error.response.data.name[0] }); 
                } else {
                    setFormErrors({ ...formErrors, global: 'Invalid input. Please check your data.' });
                }
            } else {
                setFormErrors({ ...formErrors, global: 'Failed to save service. Please try again.' });
            }
        }
    }

    const toggleBlock = async (service) => {
        try {
            await apiClient.patch(`/adminsite/services/${service.id}/`, {
                is_blocked: !service.is_blocked
            })
            fetchServices()
        } catch (error) {
            console.error('Error toggling service status:', error)
            setError('Failed to update service status')
        }
    }

    const handleDeleteClick = (service) => {
        setServiceToDelete(service)
        setShowDeleteModal(true)
    }

    const confirmDelete = async () => {
        if (!serviceToDelete) return
        
        try {
            await apiClient.delete(`/adminsite/services/${serviceToDelete.id}/`)
            fetchServices()
            setShowDeleteModal(false)
            setServiceToDelete(null)
        } catch (error) {
            console.error('Error deleting service:', error)
            setError('Failed to delete service')
        }
    }

    const openEditModal = (service) => {
        setEditingService(service)
        setFormData({
            name: service.name,
            category: service.category?.id || service.category,
            description: service.description || '',
            price: service.price,
            duration_minutes: service.duration_minutes,
            image: service.image 
        })
        setFormErrors({})
        setShowModal(true)
    }

    const openAddModal = () => {
        setEditingService(null)
        resetForm()
        setFormErrors({})
        setShowModal(true)
    }

    const resetForm = () => {
        setFormData({
            name: '',
            category: '',
            description: '',
            price: '',
            duration_minutes: '',
            image: null
        })
    }

    const filteredServices = data.filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = filterCategory === '' || 
            (service.category?.id && service.category.id.toString() === filterCategory) ||
            (service.category && service.category.toString() === filterCategory)
        
        let matchesStatus = true
        if (filterStatus === 'blocked') {
            matchesStatus = service.is_blocked
        } else if (filterStatus === 'unblocked') {
            matchesStatus = !service.is_blocked
        }
        
        return matchesSearch && matchesCategory && matchesStatus
    })

    if (loading) {
        return (
            <div className="flex">
                <AdminSidebar />
                <div className="flex-1 p-6">
                    <LoadingSpinner/>
                </div>
            </div>
        )
    }

    return (
        <div className="flex">
            <div className="w-72">
                <AdminSidebar />
            </div>
            <div className="flex-1 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Service Management</h1>
                    <button
                        onClick={openAddModal}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <Plus size={20} />
                        Add Service
                    </button>
                </div>

                {error && <ErrorMessage error={error} onRetry={fetchServices} />}

                <div className="mb-6 flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search services..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[150px]"
                        >
                            <option value="all">All Services</option>
                            <option value="unblocked">Active Services</option>
                            <option value="blocked">Blocked Services</option>
                        </select>
                    </div>
                    
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[150px]"
                        >
                            <option value="">All Categories</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {filteredServices.length === 0 && !loading ? (
                    <div className="text-center py-12">
                        <div className="text-gray-500 text-lg mb-4">
                            {data.length === 0 ? 'No services found' : 'No services match your filters'}
                        </div>
                        <button
                            onClick={openAddModal}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
                        >
                            <Plus size={20} />
                            {data.length === 0 ? 'Create First Service' : 'Add Service'}
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredServices.map(service => (
                            <ServiceCard
                                key={service.id}
                                service={service}
                                onEdit={openEditModal}
                                onToggleBlock={toggleBlock}
                                onDelete={handleDeleteClick}
                            />
                        ))}
                    </div>
                )}

                <Modal 
                    isOpen={showModal} 
                    onClose={() => setShowModal(false)}
                    title={editingService ? 'Edit Service' : 'Add New Service'}
                >
                    <ServiceForm
                        formData={formData}
                        onFormChange={setFormData}
                        onSubmit={handleSubmit}
                        onCancel={() => setShowModal(false)}
                        isEditing={!!editingService}
                        categories={categories}
                        errors={formErrors}
                    />
                </Modal>

                <ConfirmationModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={confirmDelete}
                    title="Delete Service"
                    message={`Are you sure you want to delete "${serviceToDelete?.name}"? This action cannot be undone.`}
                    confirmText="Delete"
                    cancelText="Cancel"
                />
            </div>
        </div>
    )
}

export default Servicelist