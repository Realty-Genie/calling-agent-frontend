import { useState } from 'react';
import { X, User, Mail, Phone, Plus, Trash2, Zap, FileSpreadsheet, Image as ImageIcon, Upload, Loader2, FileText, Save, Download, CheckSquare, Square } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

const BatchCallModal = ({ isOpen, onClose }) => {
    const [leads, setLeads] = useState([]);
    const [currentLead, setCurrentLead] = useState({ name: "", email: "", phoneNumber: "" });
    const [triggerTimestamp, setTriggerTimestamp] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [activeTab, setActiveTab] = useState("manual"); // manual, csv, image
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedLeads, setSelectedLeads] = useState(new Set());
    const [allSavedLeadsLoaded, setAllSavedLeadsLoaded] = useState(false);

    if (!isOpen) return null;

    // Toggle selection of a single lead
    const toggleSelectLead = (index) => {
        const newSelected = new Set(selectedLeads);
        if (newSelected.has(index)) {
            newSelected.delete(index);
        } else {
            newSelected.add(index);
        }
        setSelectedLeads(newSelected);
    };

    // Toggle select all
    const toggleSelectAll = () => {
        if (selectedLeads.size === leads.length) {
            setSelectedLeads(new Set());
        } else {
            const newSelected = new Set(leads.map((_, i) => i));
            setSelectedLeads(newSelected);
        }
    };

    // Auto-select new leads when added
    const autoSelectNewLeads = (newLeadsCount, startIndex) => {
        const newSelected = new Set(selectedLeads);
        for (let i = 0; i < newLeadsCount; i++) {
            newSelected.add(startIndex + i);
        }
        setSelectedLeads(newSelected);
    };

    const handleLeadChange = (e) => {
        setCurrentLead({ ...currentLead, [e.target.name]: e.target.value });
    };

    const addLead = (e) => {
        e.preventDefault();
        if (currentLead.phoneNumber) {
            const newLeads = [...leads, currentLead];
            setLeads(newLeads);
            // Auto select the new lead
            const newSelected = new Set(selectedLeads);
            newSelected.add(newLeads.length - 1);
            setSelectedLeads(newSelected);

            setCurrentLead({ name: "", email: "", phoneNumber: "" });
        }
    };

    const removeLead = async (index) => {
        const leadToRemove = leads[index];
        if (!leadToRemove) return;

        if (!window.confirm(`Are you sure you want to delete ${leadToRemove.name || "this lead"}? This will remove them from the database as well.`)) {
            return;
        }

        // Optimistically remove from UI or wait? User asked to remove from DB.
        // Let's try to remove from DB first.
        try {
            const res = await fetch(`http://localhost:5000/leads/${encodeURIComponent(leadToRemove.phoneNumber)}`, {
                method: "DELETE",
            });

            // Even if 404 (not in DB), we should remove from UI
            if (!res.ok && res.status !== 404) {
                const data = await res.json();
                throw new Error(data.message || "Failed to delete lead");
            }

            const newLeads = leads.filter((_, i) => i !== index);
            setLeads(newLeads);
            setAllSavedLeadsLoaded(false);

            // Re-calculate selection indices
            const newSelected = new Set();
            Array.from(selectedLeads).forEach(selectedIdx => {
                if (selectedIdx < index) {
                    newSelected.add(selectedIdx);
                } else if (selectedIdx > index) {
                    newSelected.add(selectedIdx - 1);
                }
            });
            setSelectedLeads(newSelected);
            setMessage("Lead deleted successfully.");

        } catch (err) {
            setMessage(`Error: ${err.message}`);
        }
    };

    const isAddDisabled = !currentLead.phoneNumber;

    const normalizePhoneNumber = (phone) => {
        if (!phone) return "";
        let str = phone.toString().trim();
        // Remove all characters that are not digits or '+'
        // This handles (555) 123-4567 -> 5551234567
        str = str.replace(/[^0-9+]/g, '');

        // Ensure it starts with +
        if (!str.startsWith('+')) {
            str = '+' + str;
        }
        return str;
    };

    const handleCsvUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const processData = (data) => {
            const newLeads = [];
            const errors = [];

            data.forEach((row, index) => {
                // Normalize keys to lowercase and remove non-alphanumeric characters
                const normalizedRow = {};
                Object.keys(row).forEach(key => {
                    // Remove non-alphanumeric characters to handle cases like "phoneNumber," or "Phone Number"
                    const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
                    normalizedRow[cleanKey] = row[key];
                });

                // Look for phone number (mandatory)
                const phone = normalizedRow['phno'] || normalizedRow['phone'] || normalizedRow['phonenumber'] || normalizedRow['mobile'];

                if (phone) {
                    newLeads.push({
                        name: normalizedRow['name'] || "",
                        email: normalizedRow['email'] || "",
                        phoneNumber: normalizePhoneNumber(phone)
                    });
                } else {
                    // Only track error if row is not completely empty
                    if (Object.values(row).some(val => val)) {
                        errors.push(index + 2); // +2 because 1-based and header row
                    }
                }
            });

            if (newLeads.length > 0) {
                const startIndex = leads.length;
                setLeads([...leads, ...newLeads]);
                autoSelectNewLeads(newLeads.length, startIndex);
                setMessage(`Added ${newLeads.length} leads successfully.`);
                setAllSavedLeadsLoaded(false); // New leads added, so not all saved leads are necessarily loaded
            } else {
                setMessage("Error: No valid leads found. Please check the file format.");
            }

            if (errors.length > 0) {
                console.warn("Rows missing phone numbers:", errors);
            }
        };

        if (file.name.endsWith('.csv')) {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => processData(results.data),
                error: (err) => setMessage(`Error: CSV Error: ${err.message}`)
            });
        } else {
            const reader = new FileReader();
            reader.onload = (evt) => {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);
                processData(data);
            };
            reader.readAsBinaryString(file);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsProcessing(true);
        setMessage("");

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/extract-leads", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to extract leads");
            }

            if (data.leads && Array.isArray(data.leads)) {
                const normalizedLeads = data.leads.map(lead => ({
                    ...lead,
                    phoneNumber: normalizePhoneNumber(lead.phoneNumber)
                }));
                const startIndex = leads.length;
                setLeads([...leads, ...normalizedLeads]);
                autoSelectNewLeads(normalizedLeads.length, startIndex);
                setMessage(`Extracted ${normalizedLeads.length} leads from image.`);
                setAllSavedLeadsLoaded(false); // New leads added, so not all saved leads are necessarily loaded
            } else {
                setMessage("Error: No leads found in the image.");
            }
        } catch (err) {
            setMessage(`Error: ${err.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSaveLeads = async () => {
        if (leads.length === 0) return;

        // Save only selected leads if any are selected, otherwise save all? 
        // User asked to "save lead", usually implies saving the list. 
        // Let's save ALL leads currently in the list to be safe, or just selected.
        // Let's save ALL leads in the list so they are available later.

        setLoading(true);
        try {
            const res = await fetch("http://localhost:5000/leads/bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ leads }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage(`Saved ${leads.length} leads to database.`);
                setAllSavedLeadsLoaded(true); // We are now in sync with DB (at least for these leads)
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            setMessage(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadLeads = async () => {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:5000/leads");
            const data = await res.json();
            if (res.ok && data.data) {
                // Map backend leads to frontend format
                const loadedLeads = data.data.map(l => ({
                    name: l.name,
                    email: l.email,
                    phoneNumber: l.phoneNumber
                }));

                // Append to current list, avoiding duplicates by phone number
                const currentPhones = new Set(leads.map(l => l.phoneNumber));
                const newLeads = loadedLeads.filter(l => !currentPhones.has(l.phoneNumber));

                if (newLeads.length > 0) {
                    const startIndex = leads.length;
                    setLeads([...leads, ...newLeads]);
                    // Optional: Select newly loaded leads? Or let user select.
                    // Let's NOT auto-select loaded leads to avoid accidental calls.
                    setMessage(`Loaded ${newLeads.length} new leads from database.`);
                } else {
                    setMessage("All saved leads are already in the list.");
                }
                setAllSavedLeadsLoaded(true);
            }
        } catch (err) {
            setMessage(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (selectedLeads.size === 0) {
            setMessage("Error: Please select at least one lead to call.");
            return;
        }

        const leadsToCall = leads.filter((_, i) => selectedLeads.has(i));

        setLoading(true);
        setMessage("");

        try {
            const payload = {
                leads: leadsToCall,
                trigger_timestamp: triggerTimestamp ? parseInt(triggerTimestamp) : undefined
            };

            const res = await fetch("http://localhost:5000/create-batch-call", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Something went wrong");
            }

            setMessage("Batch call created successfully!");
            setLeads([]);
            setTriggerTimestamp("");
            setTimeout(onClose, 2000);
        } catch (err) {
            setMessage(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Zap className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#0F172A]">Create Batch Call</h2>
                </div>

                <div className="space-y-8">
                    {/* Tabs */}
                    <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-6">
                        <button
                            onClick={() => setActiveTab("manual")}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${activeTab === "manual" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            <User className="w-4 h-4" /> Manual
                        </button>
                        <button
                            onClick={() => setActiveTab("csv")}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${activeTab === "csv" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            <FileSpreadsheet className="w-4 h-4" /> CSV / Excel
                        </button>
                        <button
                            onClick={() => setActiveTab("image")}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${activeTab === "image" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            <ImageIcon className="w-4 h-4" /> Image
                        </button>
                    </div>

                    {/* Manual Entry Form */}
                    {activeTab === "manual" && (
                        <form onSubmit={addLead} className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <h3 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Add New Lead
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={currentLead.name}
                                        onChange={handleLeadChange}
                                        placeholder="Name"
                                        className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900 text-sm"
                                    />
                                </div>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={currentLead.email}
                                        onChange={handleLeadChange}
                                        placeholder="Email (Optional)"
                                        className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900 text-sm"
                                    />
                                </div>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        name="phoneNumber"
                                        value={currentLead.phoneNumber}
                                        onChange={handleLeadChange}
                                        placeholder="Phone (+1...)"
                                        className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900 text-sm"
                                    />
                                </div>
                            </div>
                            <div className="mt-4">
                                <button
                                    type="submit"
                                    disabled={isAddDisabled}
                                    className="w-full bg-white border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-white hover:border-indigo-200 hover:text-indigo-600 transition-all disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:text-gray-700 flex items-center justify-center gap-2 text-sm shadow-sm"
                                >
                                    <Plus className="w-4 h-4" /> Add to List
                                </button>
                                {isAddDisabled && (
                                    <p className="text-xs text-center text-amber-600 mt-2 font-medium">
                                        * Phone number is required to add a lead
                                    </p>
                                )}
                            </div>
                        </form>
                    )}

                    {/* CSV/Excel Upload */}
                    {activeTab === "csv" && (
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center">
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-indigo-400 transition-colors bg-white">
                                <input
                                    type="file"
                                    accept=".csv, .xlsx, .xls"
                                    onChange={handleCsvUpload}
                                    className="hidden"
                                    id="csv-upload"
                                />
                                <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <FileSpreadsheet className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">Click to upload CSV or Excel</p>
                                        <p className="text-xs text-gray-500 mt-1">Supported formats: .csv, .xlsx, .xls</p>
                                    </div>
                                </label>
                            </div>
                            <div className="mt-4 text-left bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <FileText className="w-3 h-3" /> File Requirements
                                </h4>
                                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                                    <li>Must contain a header row.</li>
                                    <li><strong>Mandatory Column:</strong> <code>phNo</code> (or phone, phoneNumber, mobile)</li>
                                    <li>Optional Columns: <code>name</code>, <code>email</code></li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Image Upload */}
                    {activeTab === "image" && (
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center">
                            {isProcessing ? (
                                <div className="py-12 flex flex-col items-center gap-4">
                                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                                    <p className="text-sm font-medium text-gray-600">Analyzing image and extracting leads...</p>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-indigo-400 transition-colors bg-white">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        id="image-upload"
                                    />
                                    <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                            <ImageIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">Click to upload Image</p>
                                            <p className="text-xs text-gray-500 mt-1">Upload a photo of a handwritten or printed list</p>
                                        </div>
                                    </label>
                                </div>
                            )}
                            <div className="mt-4 text-left bg-purple-50 p-4 rounded-xl border border-purple-100">
                                <h4 className="text-xs font-bold text-purple-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <Zap className="w-3 h-3" /> AI Extraction
                                </h4>
                                <p className="text-xs text-purple-700">
                                    We use advanced AI to read names, emails, and phone numbers from your images. Please ensure the handwriting is legible.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Leads List */}
                    <div>
                        {/* Lead Management Actions */}
                        <div className="mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2.5 bg-white rounded-xl border border-gray-200 text-indigo-600 shadow-sm">
                                    <Save className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900">Manage Leads</h4>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                        Save your current list to the database for future use,<br className="hidden sm:block" /> or load previously saved leads to add them here.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleLoadLeads}
                                    disabled={allSavedLeadsLoaded || loading}
                                    className="px-5 py-2.5 bg-white text-indigo-600 text-xs font-bold rounded-xl border border-indigo-100 hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                                >
                                    {allSavedLeadsLoaded ? (
                                        <>
                                            <CheckSquare className="w-4 h-4" /> All Loaded
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-4 h-4" /> Load Saved
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleSaveLeads}
                                    disabled={leads.length === 0 || loading}
                                    className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 hover:shadow-indigo-200 transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                                >
                                    <Save className="w-4 h-4" /> Save List
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-between items-end mb-3">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Leads to Call</h3>
                            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                                {selectedLeads.size} / {leads.length} selected
                            </span>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden max-h-48 overflow-y-auto shadow-sm">
                            {leads.length === 0 ? (
                                <div className="p-8 text-center flex flex-col items-center justify-center text-gray-400 gap-2">
                                    <User className="w-8 h-8 opacity-20" />
                                    <p className="text-sm">No leads added yet.</p>
                                </div>
                            ) : (
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                                        <tr>
                                            <th className="px-4 py-3 w-10">
                                                <button onClick={toggleSelectAll} className="text-gray-400 hover:text-indigo-600">
                                                    {selectedLeads.size === leads.length && leads.length > 0 ? (
                                                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                                                    ) : (
                                                        <Square className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </th>
                                            <th className="px-4 py-3">Name</th>
                                            <th className="px-4 py-3">Email</th>
                                            <th className="px-4 py-3">Phone</th>
                                            <th className="px-4 py-3 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {leads.map((lead, index) => (
                                            <tr key={index} className={`hover:bg-gray-50/50 transition-colors ${selectedLeads.has(index) ? 'bg-indigo-50/30' : ''}`}>
                                                <td className="px-4 py-3">
                                                    <button onClick={() => toggleSelectLead(index)} className="text-gray-400 hover:text-indigo-600">
                                                        {selectedLeads.has(index) ? (
                                                            <CheckSquare className="w-4 h-4 text-indigo-600" />
                                                        ) : (
                                                            <Square className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3 font-medium text-gray-900">{lead.name}</td>
                                                <td className="px-4 py-3 text-gray-500">{lead.email}</td>
                                                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{lead.phoneNumber}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        onClick={() => removeLead(index)}
                                                        className="text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded-lg"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Trigger Timestamp (Optional)</label>
                        <input
                            type="number"
                            value={triggerTimestamp}
                            onChange={(e) => setTriggerTimestamp(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900 text-sm"
                            placeholder="Unix Timestamp"
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading || selectedLeads.size === 0}
                        className="w-full bg-[#0F172A] text-white rounded-xl py-3.5 font-semibold hover:bg-gray-800 transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                    >
                        {loading ? (
                            <>Processing...</>
                        ) : (
                            <>
                                <Zap className="w-4 h-4" /> Call {selectedLeads.size} Selected Leads
                            </>
                        )}
                    </button>

                    {message && (
                        <p className={`text-center text-sm font-medium ${message.toLowerCase().includes('error') ? 'text-red-500' : 'text-emerald-600'}`}>
                            {message}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BatchCallModal;
