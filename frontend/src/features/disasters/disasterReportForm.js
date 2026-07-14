// ReportForm.js
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar2 from '../../components/Navbar/Navbar2';

const ReportForm = () => {
    const { id: disasterId } = useParams();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false); // UI state optimize karne ke liye

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            
            // Fix: Token ko Bearer standard ke sath format kiya taaki verifyJWT crash na ho
            const response = await axios.post(`http://localhost:5000/${disasterId}/report`, {
                title,
                description
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token ? `Bearer ${token}` : ""
                }
            });

            if (response.status === 200) {
                navigate(`/dash/disasters/${disasterId}`);
            } else {
                console.log("Error making report");
            }
        } catch (error) {
            console.error("Error making report: ", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar2 />
            <h2 className="text-center text-blue-800 mt-6 text-2xl font-semibold">Make a Report</h2>
            <div className="max-w-4xl mx-auto p-6">
                <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-6">
                    <div className="form-group">
                        <label htmlFor="title" className="block text-lg font-medium text-gray-700 mb-2">Title</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="form-control w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
    
                    <div className="form-group">
                        <label htmlFor="description" className="block text-lg font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            className="form-control w-full h-32 p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Give a description about this disaster"
                        />
                    </div>
    
                    <div className="flex space-x-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`${loading ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'} text-white px-4 py-2 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400`}
                        >
                            {loading ? "Submitting..." : "Submit Report"}
                        </button>
                        <button
                            type="button"
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
                            onClick={() => navigate(`/dash/disasters/${disasterId}`)}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default ReportForm;