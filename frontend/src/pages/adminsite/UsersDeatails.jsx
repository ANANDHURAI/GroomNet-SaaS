import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../../slices/api/apiIntercepters';
import DetailComponent from '../../components/admincompo/DetailComponent';
import AdminSidebar from '../../components/admincompo/AdminSidebar';

function UsersDetails() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get(`/adminsite/customers-details/${id}/`)
            .then(response => {
                setData(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.log('Customer detail load error:', error);
                setLoading(false);
            });
    }, [id]);

    return (
        <div className="flex min-h-screen">
            <div className="w-72">
                <AdminSidebar />
            </div>
            {loading ? (
                <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
                    <div className="text-white text-xl">Loading...</div>
                </div>
            ) : data ? (
                <DetailComponent user={data} />
            ) : (
                <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
                    <div className="text-white text-xl">No Users</div>
                </div>
            )}
        </div>
    );
}

export default UsersDetails;