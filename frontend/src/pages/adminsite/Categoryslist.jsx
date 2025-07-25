import React, { useEffect, useState } from 'react'
import { Plus, Edit2, Eye, EyeOff, Trash2, Search, Folder, AlertTriangle, X } from 'lucide-react'
import apiClient from '../../slices/api/apiIntercepters'
import AdminSidebar from '../../components/admincompo/AdminSidebar'
import EmptyState from '../../components/admincompo/EmptyState'
import { CategoryCard } from '../../components/admincompo/categoryCom/CategoryCard'
import { CategoryForm } from '../../components/admincompo/categoryCom/CategoryForm'
import { SearchBar } from '../../components/admincompo/categoryCom/SearchBar'
import { Modal } from '../../components/admincompo/categoryCom/Modal'
import LoadingSpinner from '../../components/admincompo/LoadingSpinner'
import { ConfirmationModal } from '../../components/admincompo/serviceCom/ConfirmationModal'


export function Categoryslist() {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [categoryToDelete, setCategoryToDelete] = useState(null)
    const [editingCategory, setEditingCategory] = useState(null)
    const [formData, setFormData] = useState({ name: '', image: null })

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await apiClient.get('/adminsite/categories/')
            setData(Array.isArray(response.data) ? response.data : [])
        } catch (error) {
            console.error('Error fetching categories:', error)
            
            if (error.response?.status === 404) {
                setData([])
                setError(null)
            } else {
                setError('Failed to fetch categories. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const trimmedName = formData.name.trim();
        if (!editingCategory) {
            if (!trimmedName || !formData.image) {
                setError('Both name and image are required to create a new category');
                return;
            }
        }

        if (editingCategory && !trimmedName && !formData.image) {
            setError('Please update either the name or image');
            return;
        }

        try {
            const formDataToSend = new FormData();
            if (trimmedName) {
                formDataToSend.append('name', trimmedName);
            }
            if (formData.image) {
                formDataToSend.append('image', formData.image);
            }

            if (editingCategory) {
                await apiClient.put(`/adminsite/categories/${editingCategory.id}/`, formDataToSend);
            } else {
                await apiClient.post('/adminsite/categories/', formDataToSend);
            }

            await fetchCategories();
            closeModal();
            setError(null);
        } catch (error) {
            console.error('Error saving category:', error);
            setError('Failed to save category. Please try again.');
        }
    };


    const toggleBlock = async (category) => {
        try {
            await apiClient.patch(`/adminsite/categories/${category.id}/`, {
                is_blocked: !category.is_blocked
            })
            await fetchCategories()
        } catch (error) {
            console.error('Error toggling category status:', error)
            setError('Failed to update category status')
        }
    }

    const deleteCategory = async (category) => {
        setCategoryToDelete(category)
        setShowDeleteModal(true)
    }

    const confirmDelete = async () => {
        if (!categoryToDelete) return
        
        try {
            await apiClient.delete(`/adminsite/categories/${categoryToDelete.id}/`)
            await fetchCategories()
            setShowDeleteModal(false)
            setCategoryToDelete(null)
        } catch (error) {
            console.error('Error deleting category:', error)
            setError('Failed to delete category')
        }
    }

    const cancelDelete = () => {
        setShowDeleteModal(false)
        setCategoryToDelete(null)
    }

    const openEditModal = (category) => {
        setEditingCategory(category)
        setFormData({ name: category.name, image: null })
        setShowModal(true)
        setError(null)
    }

    const openAddModal = () => {
        setEditingCategory(null)
        setFormData({ name: '', image: null })
        setShowModal(true)
        setError(null)
    }

    const closeModal = () => {
        setShowModal(false)
        setEditingCategory(null)
        setFormData({ name: '', image: null })
        setError(null)
    }

    const filteredCategories = data.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex">
                <AdminSidebar />
                <div className="flex-1 p-6">
                    <LoadingSpinner />
                </div>
            </div>
        )
    }

    return (
        <div className="flex">
            <AdminSidebar />
            <div className="flex-1 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Category Management</h1>
                    <button
                        onClick={openAddModal}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <Plus size={20} />
                        Add Category
                    </button>
                </div>


                {data.length > 0 && (
                    <SearchBar 
                        searchTerm={searchTerm} 
                        onSearchChange={setSearchTerm}
                        placeholder="Search categories..."
                    />
                )}

                {filteredCategories.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCategories.map((category) => (
                            <CategoryCard
                                key={category.id}
                                category={category}
                                onEdit={openEditModal}
                                onToggleBlock={toggleBlock}
                                onDelete={deleteCategory}
                            />
                        ))}
                    </div>
                )}

                {data.length === 0 && !loading && !error && (
                    <EmptyState
                        icon={
                            <div className="flex justify-center">
                                <Folder size={48} className="text-yellow-400" />
                            </div>
                        }
                        title="No Categories Found"
                        description={
                            <div className="space-y-4 text-center">
                                <p>Get started by creating your first category</p>
                                <button
                                    onClick={openAddModal}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                >
                                    Create First Category
                                </button>
                            </div>
                        }
                    />
                )}


                {data.length > 0 && filteredCategories.length === 0 && searchTerm && (
                    <EmptyState
                        icon={<Search size={48} className="text-gray-400" />}
                        title="No Results Found"
                        description={
                            <div className="space-y-2">
                                <p>No categories match your search "{searchTerm}"</p>
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="text-blue-600 hover:text-blue-700 underline"
                                >
                                    Clear search
                                </button>
                            </div>
                        }
                    />
                )}

                <Modal 
                    isOpen={showModal} 
                    onClose={closeModal}
                    title={editingCategory ? 'Edit Category' : 'Add New Category'}
                >
                    <CategoryForm
                        formData={formData}
                        onFormChange={setFormData}
                        onSubmit={handleSubmit}
                        onCancel={closeModal}
                        isEditing={!!editingCategory}
                        error={error}
                    />
                </Modal>

                <ConfirmationModal
                    isOpen={showDeleteModal}
                    onClose={cancelDelete}
                    onConfirm={confirmDelete}
                    title="Delete Category"
                    message={`Are you sure you want to delete the category "${categoryToDelete?.name}"? This action cannot be undone.`}
                    confirmText="Delete"
                    cancelText="Cancel"
                    confirmColor="bg-red-600 hover:bg-red-700"
                />

            </div>
        </div>
    )
}

export default Categoryslist