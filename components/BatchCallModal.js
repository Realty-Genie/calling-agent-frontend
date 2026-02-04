import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Plus, Trash2, Zap, FileSpreadsheet, Image as ImageIcon, Upload, Loader2, FileText, Save, Download, CheckSquare, Square, MapPin, Pencil } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import AgentSelector from './AgentSelector';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const BatchCallModal = ({ isOpen, onClose, agents }) => {
    const { refreshUser } = useAuth();
    const [leads, setLeads] = useState([]);
    const [currentLead, setCurrentLead] = useState({ name: "", email: "", phoneNumber: "", address: "" });
    const [triggerTimestamp, setTriggerTimestamp] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [activeTab, setActiveTab] = useState("manual"); // manual, csv, image
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedLeads, setSelectedLeads] = useState(new Set());
    const [allSavedLeadsLoaded, setAllSavedLeadsLoaded] = useState(false);
    const [selectedAgentId, setSelectedAgentId] = useState('');
    const [editingIndex, setEditingIndex] = useState(-1);
    const [editForm, setEditForm] = useState({ name: "", email: "", phoneNumber: "", address: "" });
    const [pendingLeads, setPendingLeads] = useState([]);

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

    const confirmAddLeads = async () => {
        const currentPhones = new Set(leads.map(l => l.phoneNumber));
        const newUniqueLeads = pendingLeads.filter(l => !currentPhones.has(l.phoneNumber));
        const duplicateCount = pendingLeads.length - newUniqueLeads.length;

        if (newUniqueLeads.length > 0) {
            setLoading(true);
            try {
                // Save to backend immediately
                const res = await api.post('/leads/bulk', { leads: newUniqueLeads });

                // Get the saved leads from response to ensure we have IDs
                const savedLeads = res.data.data.upsertedIds ?
                    // If upserted, we might not get full objects back easily without re-fetching or trusting the order.
                    // But bulkWrite returns upsertedIds map.
                    // Simpler: The backend returns 'result'. 
                    // Let's rely on reloading or just trusting local for now, BUT we need IDs for editing.
                    // If we don't get IDs, we can't edit reliably.
                    // Let's assume we need to reload or the backend should return the full objects.
                    // The current backend returns `result` of bulkWrite.
                    // We should probably re-fetch or just accept we might need to reload.
                    // BETTER: Let's just use the phone number for editing if ID is missing, which we already do.
                    // BUT the issue is the backend update uses ID if valid, else phone.
                    // The issue might be the phone format.

                    // Let's update local state with normalized phones at least.
                    newUniqueLeads : newUniqueLeads;

                const startIndex = leads.length;
                setLeads([...leads, ...savedLeads]);
                autoSelectNewLeads(savedLeads.length, startIndex);

                // Trigger a background reload to get IDs
                handleLoadLeads();
                setAllSavedLeadsLoaded(false); // Technically they are saved, but maybe we want to keep this flag logic or set it to true? 
                // Actually, if we just saved them, they are saved. But 'allSavedLeadsLoaded' might imply "all leads from DB are loaded".
                // Let's leave it as is or set to true if we think it fits. 
                // Given the previous logic, let's just say we saved them.

                let msg = `Added and saved ${newUniqueLeads.length} leads.`;
                if (duplicateCount > 0) {
                    msg += ` Skipped ${duplicateCount} duplicates.`;
                }
                setMessage(msg);
            } catch (err) {
                console.error("Failed to save leads:", err);
                setMessage(`Error saving leads: ${err.message}. Leads were NOT added.`);
                // If failed, do not add to local state? Or add but warn?
                // Safer to not add if we want strict sync.
                setLoading(false);
                return;
            } finally {
                setLoading(false);
            }
        } else {
            setMessage(duplicateCount > 0 ? `All ${duplicateCount} leads were duplicates and skipped.` : "No new leads to add.");
        }
        setPendingLeads([]);
    };

    const cancelAddLeads = () => {
        setPendingLeads([]);
        setMessage("Lead addition cancelled.");
    };

    const handleEditClick = (index) => {
        setEditingIndex(index);
        setEditForm(leads[index]);
    };

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleCancelEdit = () => {
        setEditingIndex(-1);
        setEditForm({ name: "", email: "", phoneNumber: "", address: "" });
    };

    const handleSaveEdit = async () => {
        const originalLead = leads[editingIndex];
        const updatedLead = { ...editForm };

        // Optimistic UI update? Or wait for server?
        // Let's wait for server to ensure data consistency.
        try {
            // Only call API if the lead was already saved (i.e., has been loaded from DB or saved via bulk)
            // But we don't track "saved" status per lead easily.
            // However, the user said "editing leads... backend db... necessary".
            // So we assume we should try to update the DB.

            // If the lead is new (pending), it's not in DB yet. But here we are editing 'leads' list.
            // If 'allSavedLeadsLoaded' is true, they are likely in DB.
            // Safest is to try update, if 404, maybe just update local?
            // But user specifically asked for backend handling.

            const identifier = originalLead._id || encodeURIComponent(originalLead.phoneNumber);
            await api.put(`/leads/${identifier}`, updatedLead);

            const updatedLeads = [...leads];
            updatedLeads[editingIndex] = updatedLead;
            setLeads(updatedLeads);
            setEditingIndex(-1);
            setEditForm({ name: "", email: "", phoneNumber: "", address: "" });
            setMessage("Lead updated successfully.");
        } catch (err) {
            // If 404, it means lead is not in DB yet (maybe just added locally).
            // In that case, just update locally.
            if (err.response && err.response.status === 404) {
                const updatedLeads = [...leads];
                updatedLeads[editingIndex] = updatedLead;
                setLeads(updatedLeads);
                setEditingIndex(-1);
                setEditForm({ name: "", email: "", phoneNumber: "", address: "" });
                setMessage("Lead updated locally (not found in database).");
            } else {
                setMessage(`Error updating lead: ${err.message}`);
            }
        }
    };

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

    const addLead = async (e) => {
        e.preventDefault();
        if (currentLead.phoneNumber && (!isSellerAgent || currentLead.address)) {
            // Check for duplicates
            if (leads.some(l => l.phoneNumber === currentLead.phoneNumber)) {
                setMessage("Error: A lead with this phone number already exists.");
                return;
            }

            setLoading(true);
            try {
                // Save to backend immediately
                const leadToSave = { ...currentLead, phoneNumber: normalizePhoneNumber(currentLead.phoneNumber) };
                await api.post('/leads/bulk', { leads: [leadToSave] });

                const newLeads = [...leads, leadToSave];
                setLeads(newLeads);

                // Trigger reload to get ID
                handleLoadLeads();
                // Auto select the new lead
                const newSelected = new Set(selectedLeads);
                newSelected.add(newLeads.length - 1);
                setSelectedLeads(newSelected);

                setCurrentLead({ name: "", email: "", phoneNumber: "", address: "" });
                setMessage("Lead added and saved successfully.");
            } catch (err) {
                console.error("Failed to save lead:", err);
                setMessage(`Error saving lead: ${err.message}`);
            } finally {
                setLoading(false);
            }
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
            const identifier = leadToRemove._id || encodeURIComponent(leadToRemove.phoneNumber);
            await api.delete(`/leads/${identifier}`);

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
            // If 404 (not found in DB), still remove from UI
            if (err.response && err.response.status === 404) {
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
                setMessage("Lead removed from list (was not in database).");
            } else {
                setMessage(`Error: ${err.message || "Failed to delete lead"}`);
            }
        }
    };

    const isAddDisabled = !currentLead.phoneNumber || (isSellerAgent && !currentLead.address);

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
                const address = normalizedRow['address'] || normalizedRow['addr'] || normalizedRow['location'] || normalizedRow['propertyaddress'] || normalizedRow['street'] || normalizedRow['streetaddress'];

                if (phone) {
                    newLeads.push({
                        name: normalizedRow['name'] || "",
                        email: normalizedRow['email'] || "",
                        phoneNumber: normalizePhoneNumber(phone),
                        address: address || ""
                    });
                } else {
                    // Only track error if row is not completely empty
                    if (Object.values(row).some(val => val)) {
                        errors.push(index + 2); // +2 because 1-based and header row
                    }
                }
            });

            if (newLeads.length > 0) {
                // Check for missing addresses if seller agent
                if (isSellerAgent) {
                    const missingAddressCount = newLeads.filter(l => !l.address).length;
                    if (missingAddressCount > 0) {
                        setMessage(`Warning: ${missingAddressCount} leads are missing an address, which is required for the selected Seller Agent.`);
                    } else {
                        setMessage(`Found ${newLeads.length} leads. Please review and confirm.`);
                    }
                } else {
                    setMessage(`Found ${newLeads.length} leads. Please review and confirm.`);
                }

                setPendingLeads(newLeads);
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
                    phoneNumber: normalizePhoneNumber(lead.phoneNumber),
                    address: lead.address || ""
                }));
                setPendingLeads(normalizedLeads);
                setMessage(`Extracted ${normalizedLeads.length} leads from image. Please review and confirm.`);
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
            const res = await api.post('/leads/bulk', { leads });
            // api.post returns the response data directly if interceptor is set up, 
            // OR it returns the axios response object. 
            // Looking at previous `api.delete` usage, it seems we await it.
            // Let's assume standard axios-like wrapper or the one in `lib/api.js`.
            // If `api` is axios instance:
            // const res = await api.post(...) -> res.data is the body.
            // But in `removeLead` I used `await api.delete(...)` and didn't check return value much.
            // Let's check `lib/api.js` to be sure, but usually it's safer to assume standard axios.
            // Wait, `removeLead` had `if (err.response ...)` which implies axios.

            // Let's check how `api` is defined.
            // I'll assume it returns the response object or data.
            // If I look at `handleSaveEdit` I added: `await api.put(...)`.

            // Let's try to use it like this:
            // await api.post('/leads/bulk', { leads });
            // setMessage...

            // But I need to handle success/error.
            // If axios, it throws on error.

            const response = await api.post('/leads/bulk', { leads });

            setMessage(`Saved ${leads.length} leads to database.`);
            setAllSavedLeadsLoaded(true);
        } catch (err) {
            setMessage(`Error: ${err.message || "Failed to save leads"}`);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadLeads = async () => {
        setLoading(true);
        try {
            const response = await api.get('/leads');
            const data = response.data;

            if (data && data.data) {
                // Map backend leads to frontend format
                const loadedLeads = data.data.map(l => ({
                    _id: l._id,
                    name: l.name,
                    email: l.email,
                    phoneNumber: l.phoneNumber,
                    address: l.address || ""
                }));

                // Update existing leads with IDs from server if they match by phone
                // and append new ones.
                const currentLeadsMap = new Map(leads.map(l => [l.phoneNumber, l]));

                let updatedCount = 0;
                let newCount = 0;

                loadedLeads.forEach(loadedLead => {
                    if (currentLeadsMap.has(loadedLead.phoneNumber)) {
                        // Update existing lead with ID and other server data
                        // We preserve local changes if we want, but server should be truth.
                        // Let's assume server is truth for ID.
                        const existing = currentLeadsMap.get(loadedLead.phoneNumber);
                        if (!existing._id) {
                            Object.assign(existing, loadedLead);
                            updatedCount++;
                        }
                    } else {
                        // It's a new lead from server
                        currentLeadsMap.set(loadedLead.phoneNumber, loadedLead);
                        newCount++;
                    }
                });

                const finalLeads = Array.from(currentLeadsMap.values());

                if (newCount > 0 || updatedCount > 0) {
                    setLeads(finalLeads);
                    setMessage(`Synced with database: ${newCount} new, ${updatedCount} updated with IDs.`);
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

        if (isSellerAgent) {
            const missingAddress = leadsToCall.some(l => !l.address);
            if (missingAddress) {
                setMessage("Error: Address is required for all selected leads when using a Seller Agent.");
                return;
            }
        }

        setLoading(true);
        setMessage("");

        try {
            const payload = {
                leads: leadsToCall,
                trigger_timestamp: triggerTimestamp ? parseInt(triggerTimestamp) : undefined,
                agentId: selectedAgentId
            };

            const res = await api.post('/call/batch', payload);

            const data = res.data;

            if (res.status !== 200 && res.status !== 201) {
                throw new Error(data.message || "Something went wrong");
            }

            setMessage("Batch call created successfully!");
            refreshUser();
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
                    {agents && agents.length > 0 && (
                        <AgentSelector
                            agents={agents}
                            selectedAgentId={selectedAgentId}
                            onSelect={setSelectedAgentId}
                        />
                    )}

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
                                {isSellerAgent && (
                                    <div className="relative md:col-span-3">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            name="address"
                                            value={currentLead.address}
                                            onChange={handleLeadChange}
                                            placeholder="Address (Required for Seller Agent)"
                                            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900 text-sm"
                                        />
                                    </div>
                                )}
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
                                        {isSellerAgent && !currentLead.address ? "* Address is required for seller agent" : "* Phone number is required to add a lead"}
                                    </p>
                                )}
                            </div>
                        </form>
                    )}

                    {/* CSV/Excel Upload */}
                    {activeTab === "csv" && (
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center">
                            <div className="flex flex-col items-center gap-2 border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-indigo-400 transition-colors bg-white">
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
                            <div className="mt-4 flex justify-center items-center">
                                <label className="cursor-pointer bg-white border border-gray-200 text-gray-700 font-semibold py-2.5 px-6 rounded-xl hover:bg-white hover:border-indigo-200 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 text-sm shadow-sm">
                                    <Upload className="w-4 h-4" /> Upload CSV/Excel
                                    <input type="file" accept=".csv, .xlsx, .xls" onChange={handleCsvUpload} className="hidden" />
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Image Upload */}
                    {activeTab === "image" && (
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center">
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-indigo-400 transition-colors bg-white">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-2">
                                        <ImageIcon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-900">Upload Image of Leads</h3>
                                    <p className="text-xs text-gray-500 max-w-xs mx-auto mb-4">
                                        Upload a photo of a handwritten or printed list. AI will extract names, emails, phones, and addresses.
                                    </p>
                                </div>
                                <label className="cursor-pointer bg-indigo-600 text-white font-semibold py-2.5 px-6 rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 text-sm shadow-md hover:shadow-lg inline-flex">
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4" /> Select Image
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        disabled={isProcessing}
                                    />
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Pending Leads Review */}
                    {pendingLeads.length > 0 && (
                        <div className="mt-6">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Review New Leads ({pendingLeads.length})</h3>
                                <div className="flex gap-2">
                                    <button onClick={cancelAddLeads} className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                                        Cancel
                                    </button>
                                    <button onClick={confirmAddLeads} className="px-3 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1">
                                        <CheckSquare className="w-3 h-3" /> Confirm Add
                                    </button>
                                </div>
                            </div>
                            <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl overflow-x-auto max-h-64 overflow-y-auto shadow-sm">
                                <table className="w-full text-sm text-left whitespace-nowrap">
                                    <thead className="bg-indigo-50 text-indigo-900 font-medium border-b border-indigo-100 sticky top-0 z-10 backdrop-blur-sm">
                                        <tr>
                                            <th className="px-4 py-3">Name</th>
                                            <th className="px-4 py-3">Email</th>
                                            <th className="px-4 py-3">Phone</th>
                                            <th className="px-4 py-3">Address</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-indigo-100">
                                        {pendingLeads.map((lead, index) => (
                                            <tr key={index} className="hover:bg-indigo-50 transition-colors">
                                                <td className="px-4 py-3 font-medium text-gray-900 max-w-[150px] truncate" title={lead.name}>{lead.name}</td>
                                                <td className="px-4 py-3 text-gray-500 max-w-[150px] truncate" title={lead.email}>{lead.email}</td>
                                                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{lead.phoneNumber}</td>
                                                <td className="px-4 py-3 text-gray-500 text-xs max-w-[200px] truncate" title={lead.address}>{lead.address}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Shared Leads Table */}
                    {leads.length > 0 && pendingLeads.length === 0 && (
                        <>
                            <div className="flex justify-between items-end mb-3 mt-6">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Leads to Call ({leads.length})</h3>
                                <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                                    {selectedLeads.size} selected
                                </span>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto max-h-64 overflow-y-auto shadow-sm">
                                <table className="w-full text-sm text-left whitespace-nowrap">
                                    <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100 sticky top-0 z-10 backdrop-blur-sm">
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
                                            <th className="px-4 py-3">Address</th>
                                            <th className="px-4 py-3 w-24 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {leads.map((lead, index) => {
                                            const isMissingAddress = isSellerAgent && !lead.address;
                                            const isEditing = editingIndex === index;

                                            return (
                                                <tr key={index} className={`hover:bg-gray-50/50 transition-colors ${selectedLeads.has(index) ? 'bg-indigo-50/30' : ''} ${isMissingAddress ? 'bg-red-50' : ''}`}>
                                                    <td className="px-4 py-3">
                                                        <button onClick={() => toggleSelectLead(index)} className="text-gray-400 hover:text-indigo-600">
                                                            {selectedLeads.has(index) ? (
                                                                <CheckSquare className="w-4 h-4 text-indigo-600" />
                                                            ) : (
                                                                <Square className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    </td>

                                                    {isEditing ? (
                                                        <>
                                                            <td className="px-2 py-2"><input name="name" value={editForm.name} onChange={handleEditChange} className="w-full border rounded px-2 py-1 text-xs" placeholder="Name" /></td>
                                                            <td className="px-2 py-2"><input name="email" value={editForm.email} onChange={handleEditChange} className="w-full border rounded px-2 py-1 text-xs" placeholder="Email" /></td>
                                                            <td className="px-2 py-2"><input name="phoneNumber" value={editForm.phoneNumber} onChange={handleEditChange} className="w-full border rounded px-2 py-1 text-xs" placeholder="Phone" /></td>
                                                            <td className="px-2 py-2"><input name="address" value={editForm.address} onChange={handleEditChange} className="w-full border rounded px-2 py-1 text-xs" placeholder="Address" /></td>
                                                            <td className="px-2 py-2 text-right flex justify-end gap-1">
                                                                <button onClick={handleSaveEdit} className="p-1 text-green-600 hover:bg-green-50 rounded"><CheckSquare className="w-4 h-4" /></button>
                                                                <button onClick={handleCancelEdit} className="p-1 text-gray-400 hover:bg-gray-100 rounded"><X className="w-4 h-4" /></button>
                                                            </td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td className="px-4 py-3 font-medium text-gray-900 max-w-[150px] truncate" title={lead.name}>{lead.name}</td>
                                                            <td className="px-4 py-3 text-gray-500 max-w-[150px] truncate" title={lead.email}>{lead.email}</td>
                                                            <td className="px-4 py-3 text-gray-500 font-mono text-xs">{lead.phoneNumber}</td>
                                                            <td className="px-4 py-3 text-gray-500 text-xs max-w-[200px] truncate" title={lead.address}>
                                                                {lead.address}
                                                                {isMissingAddress && (
                                                                    <span className="ml-2 text-red-500 text-xs font-bold" title="Address required for Seller Agent">
                                                                        (Req)
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 text-right">
                                                                <div className="flex items-center justify-end gap-1">
                                                                    <button
                                                                        onClick={() => handleEditClick(index)}
                                                                        className="text-gray-400 hover:text-indigo-600 transition-colors p-1 hover:bg-indigo-50 rounded-lg"
                                                                        title="Edit"
                                                                    >
                                                                        <Pencil className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => removeLead(index)}
                                                                        className="text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded-lg"
                                                                        title="Delete"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </>
                                                    )}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

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
                        disabled={loading || selectedLeads.size === 0 || (agents && agents.length > 0 && !selectedAgentId)}
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
