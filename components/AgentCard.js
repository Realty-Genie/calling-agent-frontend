import { Phone, User, Bot, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const AgentCard = ({ agent }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all cursor-pointer group"
        >
            <div className="flex items-start justify-between mb-5">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Bot className="w-7 h-7 text-white" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    Active
                </span>
            </div>

            <h3 className="text-xl font-bold text-[#0F172A] mb-3 group-hover:text-indigo-600 transition-colors">
                {agent.name || 'Unnamed Agent'}
            </h3>

            <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-xl">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium">{agent.phoneNumber}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="font-mono bg-gray-50 px-2 py-1 rounded">
                        {agent.retellAgentId?.slice(0, 12)}...
                    </span>
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500" />
                </div>
            </div>
        </motion.div>
    );
};

export default AgentCard;
