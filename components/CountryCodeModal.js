"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Check } from "lucide-react";
import { COUNTRIES } from "../lib/countries";

const CountryCodeModal = ({ isOpen, onClose, selectedIso, onSelect }) => {
    const [query, setQuery] = useState("");
    const inputRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        const t = setTimeout(() => inputRef.current?.focus(), 50);
        return () => {
            window.removeEventListener("keydown", handleEsc);
            clearTimeout(t);
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen) setQuery("");
    }, [isOpen]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return COUNTRIES;
        return COUNTRIES.filter(
            (c) =>
                c.name.toLowerCase().includes(q) ||
                c.iso.toLowerCase().includes(q) ||
                c.dial.includes(q.replace(/^\+/, ""))
        );
    }, [query]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 12 }}
                        transition={{ type: "spring", damping: 24, stiffness: 280 }}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Select country code"
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-[61] overflow-hidden flex flex-col max-h-[80vh]"
                    >
                        <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <h3 className="text-base font-semibold text-gray-900">Select country code</h3>
                            <button
                                type="button"
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                aria-label="Close"
                            >
                                <X size={18} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="px-5 pt-4 pb-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search country or dial code"
                                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="overflow-y-auto px-2 pb-3" role="listbox">
                            {filtered.length === 0 ? (
                                <p className="px-5 py-8 text-center text-sm text-gray-400">No matches</p>
                            ) : (
                                filtered.map((c) => {
                                    const active = c.iso === selectedIso;
                                    return (
                                        <button
                                            type="button"
                                            key={c.iso}
                                            role="option"
                                            aria-selected={active}
                                            onClick={() => {
                                                onSelect(c);
                                                onClose();
                                            }}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                                                active
                                                    ? "bg-indigo-50 text-indigo-900"
                                                    : "hover:bg-gray-50 text-gray-800"
                                            }`}
                                        >
                                            <span className="text-xl leading-none" aria-hidden>
                                                {c.flag}
                                            </span>
                                            <span className="flex-1 text-sm font-medium truncate">{c.name}</span>
                                            <span className="text-sm text-gray-500 tabular-nums">+{c.dial}</span>
                                            {active && <Check size={16} className="text-indigo-600" />}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CountryCodeModal;
