import { Phone, User } from 'lucide-react';

const AgentCard = ({ agent }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-indigo-50 rounded-lg">
                    <User className="w-6 h-6 text-indigo-600" />
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    Active
                </span>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">{agent.name || 'Unnamed Agent'}</h3>

            <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {agent.phoneNumber}
                </div>
                <div className="text-xs text-gray-400 font-mono">
                    ID: {agent.retellAgentId}
                </div>
            </div>
        </div>
    );
};

export default AgentCard;
