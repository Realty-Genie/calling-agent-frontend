import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Loader2, ChevronDown, Mail, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
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

const TryNowModal = ({ isOpen, onClose }) => {
    // Step 1: Call details
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [countryCode, setCountryCode] = useState('+1');
    const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
    const [selectedAgentId, setSelectedAgentId] = useState('');

    // Step management: 'details' | 'email' | 'otp'
    const [step, setStep] = useState('details');

    // Step 2: Email verification
    const [email, setEmail] = useState('');
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailError, setEmailError] = useState(null);

    // Step 2b: OTP verification
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState(null);
    const [resending, setResending] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const otpInputRefs = useRef([]);

    // Call status
    const [callLoading, setCallLoading] = useState(false);
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
            setIsCountryDropdownOpen(false);
            setStep('details');
            setEmail('');
            setEmailError(null);
            setEmailLoading(false);
            setOtp(['', '', '', '', '', '']);
            setOtpError(null);
            setOtpLoading(false);
            setResendSuccess(false);
            setCallLoading(false);
            setStatus(null);
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

    // Focus first OTP input when entering OTP step
    useEffect(() => {
        if (step === 'otp') {
            setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
        }
    }, [step]);

    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        setPhoneNumber(value);
    };

    const selectedCountry = COUNTRY_CODES.find(
        (c) => c.code === countryCode && c.country === (COUNTRY_CODES.find(cc => cc.code === countryCode)?.country)
    ) || COUNTRY_CODES[0];

    // Step 1 → Step 2: "Call Now" advances to email step
    const handleCallNowClick = (e) => {
        e.preventDefault();
        setStep('email');
    };

    // Step 2a: Send email verification code
    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setEmailLoading(true);
        setEmailError(null);

        try {
            await api.post('/demo/verifyEmail', { email });
            setStep('otp');
        } catch (err) {
            console.error('Email verification failed:', err);
            setEmailError(err.response?.data?.message || 'Failed to send verification code. Please try again.');
        } finally {
            setEmailLoading(false);
        }
    };

    // OTP handlers
    const handleOtpChange = (index, value) => {
        if (value && !/^\d$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();
        if (/^\d{6}$/.test(pastedData)) {
            const digits = pastedData.split('');
            setOtp(digits);
            otpInputRefs.current[5]?.focus();
        }
    };

    const handleResend = async () => {
        setResending(true);
        setOtpError(null);
        setResendSuccess(false);
        try {
            await api.post('/demo/verifyEmail', { email });
            setResendSuccess(true);
            setTimeout(() => setResendSuccess(false), 3000);
        } catch (err) {
            console.error('Resend failed:', err);
            setOtpError('Failed to resend code. Please try again.');
        } finally {
            setResending(false);
        }
    };

    // Step 2b: Verify OTP → place call
    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        const otpString = otp.join('');
        if (otpString.length !== 6) return;

        setOtpLoading(true);
        setOtpError(null);

        try {
            // Verify OTP first
            const verifyResponse = await api.post('/demo/verifyOtp', {
                email,
                otp: Number(otpString)
            });
            const token = verifyResponse.data.token;

            // OTP verified — now place the call
            setCallLoading(true);
            setOtpLoading(false);

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
            }, 2000);
        } catch (err) {
            console.error('Verification / call failed:', err);
            if (err.response?.data?.message) {
                setOtpError(err.response.data.message);
            } else if (callLoading) {
                setStatus('error');
            } else {
                setOtpError('Invalid verification code. Please try again.');
            }
        } finally {
            setOtpLoading(false);
            setCallLoading(false);
        }
    };

    const isOtpComplete = otp.every((digit) => digit !== '');

    // Step indicator
    const stepNumber = step === 'details' ? 1 : 2;

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
                        {/* Header */}
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-xl font-semibold text-gray-900">Try Callgenie</h2>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Step indicator */}
                        <div className="flex items-center gap-2 mb-5">
                            <div className={`h-1 flex-1 rounded-full transition-colors ${stepNumber >= 1 ? 'bg-[#0F172A]' : 'bg-gray-200'}`} />
                            <div className={`h-1 flex-1 rounded-full transition-colors ${stepNumber >= 2 ? 'bg-[#0F172A]' : 'bg-gray-200'}`} />
                        </div>

                        <AnimatePresence mode="wait">
                            {/* ============ STEP 1: Call Details ============ */}
                            {step === 'details' && (
                                <motion.form
                                    key="details"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    onSubmit={handleCallNowClick}
                                    className="space-y-4"
                                >
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

                                    {/* Name */}
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
                                        disabled={!selectedAgentId}
                                        className="w-full bg-[#0F172A] text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Phone size={18} />
                                        Call Now
                                        <ArrowRight size={16} />
                                    </button>
                                </motion.form>
                            )}

                            {/* ============ STEP 2a: Email Verification ============ */}
                            {step === 'email' && (
                                <motion.div
                                    key="email"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => setStep('details')}
                                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
                                    >
                                        <ArrowLeft size={16} />
                                        Back
                                    </button>

                                    <p className="text-sm text-gray-500 mb-4">
                                        Enter your email to receive a verification code. Once verified, your call will be placed automatically.
                                    </p>

                                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                            <div className="relative">
                                                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="email"
                                                    required
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                                    placeholder="you@example.com"
                                                    autoFocus
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={emailLoading || !email}
                                            className="w-full bg-[#0F172A] text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {emailLoading ? (
                                                <Loader2 className="animate-spin" size={20} />
                                            ) : (
                                                <>
                                                    Send Verification Code
                                                    <ArrowRight size={18} />
                                                </>
                                            )}
                                        </button>

                                        {emailError && (
                                            <p className="text-red-600 text-sm text-center">{emailError}</p>
                                        )}
                                    </form>
                                </motion.div>
                            )}

                            {/* ============ STEP 2b: OTP Verification ============ */}
                            {step === 'otp' && (
                                <motion.div
                                    key="otp"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setStep('email');
                                            setOtp(['', '', '', '', '', '']);
                                            setOtpError(null);
                                        }}
                                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
                                    >
                                        <ArrowLeft size={16} />
                                        Back
                                    </button>

                                    <div className="flex items-center gap-3 mb-5 p-3 bg-gray-50 rounded-lg">
                                        <ShieldCheck size={20} className="text-indigo-500 flex-shrink-0" />
                                        <p className="text-sm text-gray-600">
                                            We&apos;ve sent a 6-digit code to <span className="font-medium text-gray-900">{email}</span>
                                        </p>
                                    </div>

                                    <form onSubmit={handleOtpSubmit} className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">Verification Code</label>
                                            <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                                                {otp.map((digit, index) => (
                                                    <input
                                                        key={index}
                                                        ref={(el) => (otpInputRefs.current[index] = el)}
                                                        type="text"
                                                        inputMode="numeric"
                                                        maxLength={1}
                                                        value={digit}
                                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                        className="w-12 h-14 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={otpLoading || callLoading || !isOtpComplete}
                                            className="w-full bg-[#0F172A] text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {otpLoading || callLoading ? (
                                                <Loader2 className="animate-spin" size={20} />
                                            ) : (
                                                <>
                                                    <Phone size={18} />
                                                    Verify & Call
                                                </>
                                            )}
                                        </button>

                                        {otpError && (
                                            <p className="text-red-600 text-sm text-center">{otpError}</p>
                                        )}

                                        {status === 'success' && (
                                            <p className="text-green-600 text-sm text-center">Call initiated successfully!</p>
                                        )}
                                        {status === 'error' && (
                                            <p className="text-red-600 text-sm text-center">Failed to initiate call. Please try again.</p>
                                        )}

                                        {resendSuccess && (
                                            <p className="text-green-600 text-sm text-center">Verification code resent!</p>
                                        )}

                                        <div className="text-center">
                                            <button
                                                type="button"
                                                onClick={handleResend}
                                                disabled={resending}
                                                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors disabled:opacity-50"
                                            >
                                                {resending ? 'Resending...' : "Didn't receive the code? Resend"}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default TryNowModal;
