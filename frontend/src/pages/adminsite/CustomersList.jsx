import React, { useEffect, useState } from 'react'
import apiClient from '../../slices/api/apiIntercepters';
import TableList from '../../components/admincompo/TableList';
import AdminSidebar from '../../components/admincompo/AdminSidebar';

function CustomersList() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get('/adminsite/customers-list/')
            .then(response => {
                setData(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('customers list load error:', error);
                setLoading(false);
            });
    }, []);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            {loading ? (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <div className="text-gray-700 text-lg">Loading customers...</div>
                    </div>
                </div>
            ) : (
                <TableList 
                    listname={'Customers List'} 
                    data={data} 
                    setData={setData}
                />
            )}
        </div>
    )
}

export default CustomersList;