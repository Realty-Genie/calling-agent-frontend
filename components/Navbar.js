import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { LogOut, User, Coins } from 'lucide-react';

const Navbar = ({ activeTab, onTabChange }) => {
    const { user, logout } = useAuth();

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
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const content = (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange && onTabChange(tab.id)}
                            className={`relative px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${isActive ? 'text-white' : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-[#0F172A] rounded-full shadow-lg"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10">{tab.label}</span>
                        </button>
                    );

                    return onTabChange ? (
                        <div key={tab.id}>{content}</div>
                    ) : (
                        <Link key={tab.id} href={`/?tab=${tab.id}`}>
                            {content}
                        </Link>
                    );
                })}
                <Link href="/agents">
                    <button
                        className={`relative px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === 'agents' ? 'text-white' : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        {activeTab === 'agents' && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-[#0F172A] rounded-full shadow-lg"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10">Agents</span>
                    </button>
                </Link>
            </div>

            <div className="flex items-center gap-4">
                {!user ? (
                    <>
                        <Link href="/login">
                            <button className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                                Sign In
                            </button>
                        </Link>
                        <Link href="/register">
                            <button className="bg-[#0F172A] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-all shadow-sm">
                                Sign Up
                            </button>
                        </Link>
                    </>
                ) : (
                    <div className="flex items-center gap-4">
                        {user.role !== 'superadmin' && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 shadow-sm">
                                <Coins size={14} className="text-indigo-500" />
                                <span className="text-xs font-bold tracking-tight">{user.credits || 0}</span>
                                <span className="text-[10px] font-medium uppercase opacity-70">Credits</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                                <User size={16} className="text-gray-600" />
                            </div>
                            <span className="hidden sm:inline">{user.name || user.email}</span>
                        </div>
                        <button
                            onClick={logout}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Logout"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                )}
            </div>
        </motion.nav>
    );
};

export default Navbar;
