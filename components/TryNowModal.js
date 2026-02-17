import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Loader2, ChevronDown } from 'lucide-react';
import api from '../lib/api';

// Hardcoded agents with their Retell Agent IDs
const DEMO_AGENTS = [
    {
        id: 'agent_fbefa26c2b8ace5ec48eeeb86f',
        name: 'Preconstruction Sales Agent',
        description: 'For Burnaby'
    },
    {
        id: 'agent_a0d7128c88633e1afeb6b57eae',
        name: 'Residential Property Listing Outreach Agent',
        description: 'Residential property outreach'
    },
    {
        id: 'agent_38aaed3015d8e37ed7d6fb6ca1',
        name: 'About RealtyGenie Agent',
        description: 'General information about RealtyGenie'
    }
];

const COUNTRY_CODES = [
    { code: '+1', country: 'US', flag: '🇺🇸', label: 'United States' },
    { code: '+1', country: 'CA', flag: '🇨🇦', label: 'Canada' },
    { code: '+91', country: 'IN', flag: '🇮🇳', label: 'India' },
    { code: '+44', country: 'GB', flag: '🇬🇧', label: 'United Kingdom' },
    { code: '+61', country: 'AU', flag: '🇦🇺', label: 'Australia' },
    { code: '+971', country: 'AE', flag: '🇦🇪', label: 'UAE' },
    { code: '+65', country: 'SG', flag: '🇸🇬', label: 'Singapore' },
    { code: '+49', country: 'DE', flag: '🇩🇪', label: 'Germany' },
    { code: '+33', country: 'FR', flag: '🇫🇷', label: 'France' },
    { code: '+81', country: 'JP', flag: '🇯🇵', label: 'Japan' },
    { code: '+86', country: 'CN', flag: '🇨🇳', label: 'China' },
    { code: '+55', country: 'BR', flag: '🇧🇷', label: 'Brazil' },
    { code: '+52', country: 'MX', flag: '🇲🇽', label: 'Mexico' },
    { code: '+234', country: 'NG', flag: '🇳🇬', label: 'Nigeria' },
    { code: '+27', country: 'ZA', flag: '🇿🇦', label: 'South Africa' },
];

const TryNowModal = ({ isOpen, onClose, email, token }) => {
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [countryCode, setCountryCode] = useState('+1');
    const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
    const [selectedAgentId, setSelectedAgentId] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); // 'success' | 'error' | null

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

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setName('');
            setPhoneNumber('');
            setCountryCode('+1');
            setSelectedAgentId('');
            setStatus(null);
            setLoading(false);
            setIsCountryDropdownOpen(false);
        }
    }, [isOpen]);

    // Close country dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isCountryDropdownOpen && !e.target.closest('.country-code-selector')) {
                setIsCountryDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isCountryDropdownOpen]);

    const handlePhoneChange = (e) => {
        // Only allow digits
        const value = e.target.value.replace(/\D/g, '');
        setPhoneNumber(value);
    };

    const selectedCountry = COUNTRY_CODES.find(
        (c) => c.code === countryCode && c.country === (COUNTRY_CODES.find(cc => cc.code === countryCode)?.country)
    ) || COUNTRY_CODES[0];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            await api.post('/demo/createCall', {
                retellAgentId: selectedAgentId,
                name,
                email,
                toNumber: `${countryCode}${phoneNumber}`,
                fromNumber: process.env.NEXT_PUBLIC_FROM_NUMBER || '+17787190711',
                token
            });
            setStatus('success');

            setTimeout(() => {
                onClose();
                setStatus(null);
                setName('');
                setPhoneNumber('');
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
                            <h2 className="text-xl font-semibold text-gray-900">Try Callgenie</h2>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        {email && (
                            <p className="text-sm text-gray-500 mb-4">
                                Verified as <span className="font-medium text-gray-800">{email}</span>
                            </p>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Agent Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Agent</label>
                                <select
                                    required
                                    value={selectedAgentId}
                                    onChange={(e) => setSelectedAgentId(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
                                >
                                    <option value="">Choose an agent...</option>
                                    {DEMO_AGENTS.map((agent) => (
                                        <option key={agent.id} value={agent.id}>
                                            {agent.name} - {agent.description}
                                        </option>
                                    ))}
                                </select>
                            </div>

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

                            {/* Phone Number with Country Code Selector */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <div className="flex gap-2">
                                    {/* Country Code Dropdown */}
                                    <div className="relative country-code-selector">
                                        <button
                                            type="button"
                                            onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                                            className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors min-w-[100px] bg-white"
                                        >
                                            <span className="text-lg">{selectedCountry.flag}</span>
                                            <span className="text-sm text-gray-700">{countryCode}</span>
                                            <ChevronDown size={14} className="text-gray-400 ml-auto" />
                                        </button>

    
                                        {isCountryDropdownOpen && (
                                            <div className="absolute top-full left-0 mt-1 w-64 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-60">
                                                {COUNTRY_CODES.map((country) => (
                                                    <button
                                                        key={`${country.country}-${country.code}`}
                                                        type="button"
                                                        onClick={() => {
                                                            setCountryCode(country.code);
                                                            setIsCountryDropdownOpen(false);
                                                        }}
                                                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
                                                    >
                                                        <span className="text-lg">{country.flag}</span>
                                                        <span className="text-sm text-gray-700">{country.label}</span>
                                                        <span className="text-sm text-gray-400 ml-auto">{country.code}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Phone Number Input */}
                                    <input
                                        type="tel"
                                        required
                                        value={phoneNumber}
                                        onChange={handlePhoneChange}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        placeholder="1234567890"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !selectedAgentId}
                                className="w-full bg-[#0F172A] text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <Phone size={18} />
                                        Call Now
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
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default TryNowModal;
