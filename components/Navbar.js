import { motion } from 'framer-motion';
import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from '@clerk/nextjs';

const Navbar = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: 'make-calls', label: 'Make Calls' },
        { id: 'call-analysis', label: 'Call Analysis' },
    ];

    return (
        <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full relative z-50"
        >
            <div className="text-2xl font-bold tracking-tighter text-gray-900 flex items-center gap-2">
                <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">CallGenie</span>
            </div>

            <div className="hidden md:flex items-center bg-gray-100/50 backdrop-blur-md p-1.5 rounded-full border border-gray-200/50">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`relative px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-[#0F172A] rounded-full shadow-lg"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10">{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-4">
                <SignedOut>
                    <SignInButton mode="modal">
                        <button className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                            Sign In
                        </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                        <button className="bg-[#0F172A] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-all shadow-sm">
                            Sign Up
                        </button>
                    </SignUpButton>
                </SignedOut>
                <SignedIn>
                    <UserButton afterSignOutUrl="/" />
                </SignedIn>
            </div>
        </motion.nav>
    );
};

export default Navbar;
