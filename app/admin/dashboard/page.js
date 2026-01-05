"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';

export default function AdminDashboard() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('agents'); // 'agents' or 'users'

    // Agent Form State
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [retellAgentId, setRetellAgentId] = useState('');

    // Data State
    const [users, setUsers] = useState([]);
    const [agents, setAgents] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [fetching, setFetching] = useState(false);
    const [creditInputs, setCreditInputs] = useState({}); // { userId: value }

    useEffect(() => {
        if (!loading && (!user || user.role !== 'superadmin')) {
            router.push('/admin/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user && user.role === 'superadmin') {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        setFetching(true);
        try {
            const [usersRes, agentsRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/agents')
            ]);
            setUsers(usersRes.data.data);
            setAgents(agentsRes.data.data);
        } catch (err) {
            console.error("Failed to fetch data", err);
        } finally {
            setFetching(false);
        }
    };

    const handleAddAgent = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            await api.post('/admin/agent', { name, phoneNumber, retellAgentId });
            setMessage('Agent added successfully');
            setName('');
            setPhoneNumber('');
            setRetellAgentId('');
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add agent');
        }
    };

    const handleAssignAgent = async (userEmail, agentId) => {
        try {
            await api.post('/admin/assign-agent', { userEmail, agentId });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to assign agent');
        }
    };

    const handleRemoveAgent = async (userId, agentId) => {
        try {
            await api.post('/admin/remove-agent', { userId, agentId });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to remove agent');
        }
    };

    const handleUpdateCredits = async (userId, currentCredits, amount) => {
        const val = parseInt(amount);
        if (isNaN(val) || val === 0) return;

        const newCredits = Math.max(0, parseInt(currentCredits) + val);
        try {
            await api.post('/admin/update-credits', { userId, credits: newCredits });
            setCreditInputs(prev => ({ ...prev, [userId]: '' }));
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update credits');
        }
    };

    if (loading || !user || user.role !== 'superadmin') {
        return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
                        <p className="text-gray-400 mt-1">Manage agents, users, and credits</p>
                    </div>
                    <button
                        onClick={logout}
                        className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition-colors"
                    >
                        Logout
                    </button>
                </div>

                <div className="flex space-x-4 mb-8">
                    <button
                        onClick={() => setActiveTab('agents')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'agents' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                    >
                        Manage Agents
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                    >
                        Manage Users
                    </button>
                </div>

                {activeTab === 'agents' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1">
                            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 sticky top-8">
                                <h2 className="text-xl font-semibold mb-4">Add New Agent</h2>
                                <form onSubmit={handleAddAgent} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Agent Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-indigo-500 text-white"
                                            placeholder="e.g. Sales Agent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Phone Number</label>
                                        <input
                                            type="text"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-indigo-500 text-white"
                                            placeholder="+1234567890"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Retell Agent ID</label>
                                        <input
                                            type="text"
                                            value={retellAgentId}
                                            onChange={(e) => setRetellAgentId(e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-indigo-500 text-white"
                                            placeholder="agent_..."
                                            required
                                        />
                                    </div>

                                    {message && <div className="text-green-500 text-sm">{message}</div>}
                                    {error && <div className="text-red-500 text-sm">{error}</div>}

                                    <button
                                        type="submit"
                                        className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded font-medium transition-colors"
                                    >
                                        Add Agent
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
                                <div className="p-6 border-b border-gray-700">
                                    <h2 className="text-xl font-semibold">Existing Agents</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-gray-900/50 text-gray-400 text-sm">
                                                <th className="px-6 py-4 font-medium">Name</th>
                                                <th className="px-6 py-4 font-medium">Phone Number</th>
                                                <th className="px-6 py-4 font-medium">Retell ID</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-700">
                                            {agents.map((agent) => (
                                                <tr key={agent._id} className="hover:bg-gray-700/30 transition-colors">
                                                    <td className="px-6 py-4">{agent.name}</td>
                                                    <td className="px-6 py-4 text-gray-400">{agent.phoneNumber}</td>
                                                    <td className="px-6 py-4 font-mono text-xs text-indigo-400">{agent.retellAgentId}</td>
                                                </tr>
                                            ))}
                                            {agents.length === 0 && (
                                                <tr>
                                                    <td colSpan="3" className="px-6 py-8 text-center text-gray-500">No agents found</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
                            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                                <h2 className="text-xl font-semibold">User Management</h2>
                                {fetching && <span className="text-xs text-indigo-400 animate-pulse">Refreshing...</span>}
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-900/50 text-gray-400 text-sm">
                                            <th className="px-6 py-4 font-medium">User</th>
                                            <th className="px-6 py-4 font-medium">Credits</th>
                                            <th className="px-6 py-4 font-medium">Assigned Agents</th>
                                            <th className="px-6 py-4 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {users.map((u) => (
                                            <tr key={u._id} className="hover:bg-gray-700/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium">{u.name}</div>
                                                    <div className="text-xs text-gray-400">{u.email}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col space-y-2">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-indigo-400 font-bold text-lg">{u.credits || 0}</span>
                                                            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Available</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <input
                                                                type="number"
                                                                value={creditInputs[u._id] || ''}
                                                                onChange={(e) => setCreditInputs(prev => ({ ...prev, [u._id]: e.target.value }))}
                                                                placeholder="Amount"
                                                                className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs focus:outline-none focus:border-indigo-500"
                                                            />
                                                            <button
                                                                onClick={() => handleUpdateCredits(u._id, u.credits || 0, creditInputs[u._id])}
                                                                className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-[10px] font-bold transition-colors"
                                                            >
                                                                ADD
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateCredits(u._id, u.credits || 0, -creditInputs[u._id])}
                                                                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-[10px] font-bold transition-colors"
                                                            >
                                                                REDEEM
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        {u.agents?.map(a => (
                                                            <span key={a._id} className="inline-flex items-center px-2 py-1 bg-gray-700 text-xs rounded-md border border-gray-600">
                                                                {a.name}
                                                                <button
                                                                    onClick={() => handleRemoveAgent(u._id, a._id)}
                                                                    className="ml-2 text-gray-500 hover:text-red-400"
                                                                >
                                                                    ×
                                                                </button>
                                                            </span>
                                                        ))}
                                                        {(!u.agents || u.agents.length === 0) && <span className="text-gray-500 text-xs italic">No agents</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <select
                                                        onChange={(e) => {
                                                            if (e.target.value) {
                                                                handleAssignAgent(u.email, e.target.value);
                                                                e.target.value = "";
                                                            }
                                                        }}
                                                        className="bg-gray-700 border border-gray-600 text-xs rounded px-2 py-1 focus:outline-none focus:border-indigo-500"
                                                    >
                                                        <option value="">Assign Agent...</option>
                                                        {agents.filter(a => !u.agents?.some(ua => ua._id === a._id)).map(a => (
                                                            <option key={a._id} value={a._id}>{a.name}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                        {users.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No users found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
