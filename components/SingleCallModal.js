import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Loader2, MapPin, ChevronDown } from 'lucide-react';
import api from '../lib/api';
import AgentSelector from './AgentSelector';
import CountryCodeModal from './CountryCodeModal';
import { DEFAULT_COUNTRY } from '../lib/countries';
import { useAuth } from '../context/AuthContext';

const SingleCallModal = ({ isOpen, onClose, agents }) => {
    const { refreshUser } = useAuth();
    const [name, setName] = useState('');
    const [country, setCountry] = useState(DEFAULT_COUNTRY);
    const [localNumber, setLocalNumber] = useState('');
    const [isCountryPickerOpen, setIsCountryPickerOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [selectedAgentId, setSelectedAgentId] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); // 'success' | 'error' | null

    const selectedAgent = agents?.find(a => (a._id || a.id) === selectedAgentId);
    const isSellerAgent = selectedAgent?.name?.toLowerCase().includes('seller');

    // Handle ESC key to close modal
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        const sanitized = localNumber.replace(/[^\d]/g, '');
        const fullPhone = `+${country.dial}${sanitized}`;

        try {
            await api.post('/call/lead', {
                name,
                email,
                phoneNumber: fullPhone,
                address: isSellerAgent ? address : undefined,
                agentId: selectedAgentId
            });
            setStatus('success');

            // Refresh user to update credits
            refreshUser();

            setTimeout(() => {
                onClose();
                setStatus(null);
                setName('');
                setLocalNumber('');
                setCountry(DEFAULT_COUNTRY);
                setEmail('');
                setAddress('');
                setSelectedAgentId('');
            }, 2000);
        } catch (error) {
            console.error('Call failed:', error);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-xl z-50 p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Make a Call</h2>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {agents && agents.length > 0 && (
                                <AgentSelector
                                    agents={agents}
                                    selectedAgentId={selectedAgentId}
                                    onSelect={setSelectedAgentId}
                                />
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <div className="flex items-stretch gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsCountryPickerOpen(true)}
                                        aria-label={`Country code: ${country.name}, +${country.dial}. Click to change.`}
                                        className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shrink-0"
                                    >
                                        <span className="text-lg leading-none" aria-hidden>{country.flag}</span>
                                        <span className="text-sm font-medium text-gray-700 tabular-nums">+{country.dial}</span>
                                        <ChevronDown size={14} className="text-gray-400" />
                                    </button>
                                    <input
                                        type="tel"
                                        required
                                        inputMode="numeric"
                                        autoComplete="tel-national"
                                        value={localNumber}
                                        onChange={(e) => setLocalNumber(e.target.value)}
                                        className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        placeholder="9876543210"
                                    />
                                </div>
                            </div>

                            {isSellerAgent && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address (Required for Seller Agent)</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            required
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                            placeholder="123 Main St, City, State"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="john@example.com"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || (agents && agents.length > 0 && !selectedAgentId)}
                                className="w-full bg-[#0F172A] text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <Phone size={18} />
                                        Initiate Call
                                    </>
                                )}
                            </button>

                            {status === 'success' && (
                                <p className="text-green-600 text-sm text-center">Call initiated successfully!</p>
                            )}
                            {status === 'error' && (
                                <p className="text-red-600 text-sm text-center">Failed to initiate call. Please try again.</p>
                            )}
                        </form>

                        <CountryCodeModal
                            isOpen={isCountryPickerOpen}
                            onClose={() => setIsCountryPickerOpen(false)}
                            selectedIso={country.iso}
                            onSelect={setCountry}
                        />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SingleCallModal;
