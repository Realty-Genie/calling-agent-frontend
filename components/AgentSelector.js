import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

const AgentSelector = ({ agents, selectedAgentId, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Find selected agent object
    const selectedAgent = agents.find(a => (a._id || a.id) === selectedAgentId);

    return (
        <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Agent
            </label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
                <span className="block truncate">
                    {selectedAgent ? selectedAgent.name : "Select an agent..."}
                </span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <ChevronsUpDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
                </span>
            </button>

            {isOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                    {agents.map((agent) => (
                        <div
                            key={agent._id || agent.id}
                            className={`${(agent._id || agent.id) === selectedAgentId ? 'text-white bg-indigo-600' : 'text-gray-900'
                                } cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50 hover:text-indigo-900`}
                            onClick={() => {
                                onSelect(agent._id || agent.id);
                                setIsOpen(false);
                            }}
                        >
                            <span className={`block truncate ${(agent._id || agent.id) === selectedAgentId ? 'font-semibold' : 'font-normal'
                                }`}>
                                {agent.name}
                            </span>
                            {(agent._id || agent.id) === selectedAgentId && (
                                <span className={`absolute inset-y-0 right-0 flex items-center pr-4 ${(agent._id || agent.id) === selectedAgentId ? 'text-white' : 'text-indigo-600'
                                    }`}>
                                    <Check className="h-5 w-5" aria-hidden="true" />
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AgentSelector;
