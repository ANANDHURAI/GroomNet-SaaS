import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserToggleButton from '../basics/UserToggleButton';
import apiClient from '../../slices/api/apiIntercepters';

function TableList({ listname, data, setData }) {
    const navigate = useNavigate();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filter and search logic
    useEffect(() => {
        let filtered = [...data];

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (user.phone && user.phone.includes(searchTerm)) ||
                user.id.toString().includes(searchTerm)
            );
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            switch (statusFilter) {
                case 'active':
                    filtered = filtered.filter(user => user.is_active && !user.is_blocked);
                    break;
                case 'inactive':
                    filtered = filtered.filter(user => !user.is_active);
                    break;
                case 'blocked':
                    filtered = filtered.filter(user => user.is_blocked);
                    break;
                default:
                    break;
            }
        }

        setFilteredData(filtered);
    }, [data, searchTerm, statusFilter]);

    const handleView = (id) => {
        const userType = listname.toLowerCase().includes('barbers') ? 'barbers' : 'customer';
        navigate(`/${userType}-details/${id}`);
    };

    const handleUserUpdate = (updatedUser) => {
        try {
            if (!data || !Array.isArray(data)) {
                console.error('Data is not an array:', data);
                return;
            }
            
            if (!setData || typeof setData !== 'function') {
                console.error('setData is not a function:', setData);
                return;
            }

            const updatedUsers = data.map((u) =>
                u.id === updatedUser.id ? updatedUser : u
            );
            setData(updatedUsers);
        } catch (error) {
            console.error('Error in handleUserUpdate:', error);
        }
    };


    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
    };

    return (
        <div className="flex-1 min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">

                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">{listname}</h1>
                    <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded"></div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-blue-100">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 01-3 0m3 0H9m1.5-2.25a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 11-3 0m3 0H1.5"></path>
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Total Users</p>
                                <p className="text-2xl font-bold text-gray-800">{data?.length || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-green-100">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Active Users</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {data?.filter(user => user.is_active && !user.is_blocked).length || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-red-100">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"></path>
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Blocked Users</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {data?.filter(user => user.is_blocked).length || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-yellow-100">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">New This Month</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {data?.filter(user => {
                                        const userDate = new Date(user.created_at);
                                        const now = new Date();
                                        return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear();
                                    }).length || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        <div className="flex flex-col sm:flex-row gap-4 flex-1">
                            {/* Search Input */}
                            <div className="relative flex-1 max-w-md">
                                <input
                                    type="text"
                                    placeholder="Search by name, email, phone or ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 pl-10 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                            </div>

                            {/* Status Filter */}
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700">Status:</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="blocked">Blocked</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {/* Clear Filters */}
                            {(searchTerm || statusFilter !== 'all') && (
                                <button
                                    onClick={clearFilters}
                                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                                >
                                    Clear Filters
                                </button>
                            )}

        
                        </div>
                    </div>

                    {(searchTerm || statusFilter !== 'all') && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            <span className="text-sm text-gray-600">Filters applied:</span>
                            {searchTerm && (
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                    Search: "{searchTerm}"
                                </span>
                            )}
                            {statusFilter !== 'all' && (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                    Status: {statusFilter}
                                </span>
                            )}
                            <span className="text-sm text-gray-600">
                                ({filteredData.length} of {data.length} results)
                            </span>
                        </div>
                    )}
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-800">
                                {listname.includes('Customer') ? 'Customer Directory' : 'Barber Directory'}
                            </h2>
                            <div className="text-sm text-gray-600">
                                Showing {filteredData.length} of {data.length} entries
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                        {listname.includes('Customer') ? 'Customer' : 'Barber'}
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Joined</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredData && filteredData.length > 0 ? (
                                    filteredData.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    {user.profileimage_url ? (
                                                        <img
                                                            src={user.profileimage_url}
                                                            alt={user.name}
                                                            className="h-10 w-10 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium shadow-sm">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                        <div className="text-sm text-gray-500">ID: #{user.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{user.email}</div>
                                                <div className="text-sm text-gray-500">{user.phone || 'No phone'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col space-y-1">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        user.is_active 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        {user.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                    {user.is_blocked && (
                                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                                            Blocked
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <button
                                                        onClick={() => handleView(user.id)}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                                                    >
                                                        View
                                                    </button>
                                                    <UserToggleButton 
                                                        user={user} 
                                                        onUserUpdate={handleUserUpdate}
                                                        size="sm"
                                                        showText={false}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                                                </svg>
                                                <p className="text-gray-500 text-lg mb-2">
                                                    {searchTerm || statusFilter !== 'all' 
                                                        ? 'No results found' 
                                                        : `No ${listname.toLowerCase()} found`
                                                    }
                                                </p>
                                                {(searchTerm || statusFilter !== 'all') && (
                                                    <button
                                                        onClick={clearFilters}
                                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                                    >
                                                        Clear filters to see all results
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TableList;