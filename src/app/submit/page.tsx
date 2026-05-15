"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { DEPARTMENTS, STATES, PRIORITY_LEVELS, type Attachment, ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "@/lib/data";
import {
  MapPin, User, Mail, Phone, Building2, AlertTriangle,
  CheckCircle, Loader2, ChevronRight, ExternalLink, Info,
  Upload, X, FileText, Image as ImageIcon, Video, Paperclip
} from "lucide-react";

interface RepInfo {
  found: boolean;
  mp: string;
  mla: string;
  localBody: string;
  constituency: string;
  note?: string;
}

function SubmitFeedbackInner() {
  const searchParams = useSearchParams();
  const initialDept = searchParams.get("dept") || "";

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    pincode: "", state: "", district: "",
    department: initialDept, subject: "", description: "", priority: "medium",
  });
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [rep, setRep] = useState<RepInfo | null>(null);
  const [repLoading, setRepLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{ ticketId: string; attachments: Attachment[] } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (form.pincode.length === 6) {
      setRepLoading(true);
      fetch(`/api/representatives?pincode=${form.pincode}`)
        .then((r) => r.json())
        .then((data) => { setRep(data); setRepLoading(false); })
        .catch(() => setRepLoading(false));
    } else {
      setRep(null);
    }
  }, [form.pincode]);

  const update = (field: string, val: string) => {
    setForm((f) => ({ ...f, [field]: val }));
    setErrors((e) => { const copy = { ...e }; delete copy[field]; return copy; });
  };

  const validateStep = (s: number) => {
    const errs: Record<string, string> = {};
    if (s === 1) {
      if (!form.pincode || form.pincode.length !== 6) errs.pincode = "Valid 6-digit pincode required";
      if (!form.state) errs.state = "State is required";
    }
    if (s === 2) {
      if (!form.name.trim()) errs.name = "Name is required";
      if (!form.email.includes("@")) errs.email = "Valid email required";
    }
    if (s === 3) {
      if (!form.department) errs.department = "Please select a department";
      if (!form.subject.trim() || form.subject.length < 10) errs.subject = "Subject must be at least 10 characters";
      if (!form.description.trim() || form.description.length < 30) errs.description = "Please provide at least 30 characters";
      if (!form.priority) errs.priority = "Priority is required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep((s) => s + 1);
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    const newAttachments: Attachment[] = [];
    
    for (const file of Array.from(files)) {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        setErrors(prev => ({ ...prev, attachments: `File ${file.name} is too large. Max size is 10MB.` }));
        continue;
      }
      
      // Check file type
      const isImage = ALLOWED_FILE_TYPES.images.includes(file.type);
      const isDocument = ALLOWED_FILE_TYPES.documents.includes(file.type);
      const isVideo = ALLOWED_FILE_TYPES.videos.includes(file.type);
      const isAudio = ALLOWED_FILE_TYPES.audio.includes(file.type);
      
      if (!isImage && !isDocument && !isVideo && !isAudio) {
        setErrors(prev => ({ ...prev, attachments: `File type not allowed: ${file.name}` }));
        continue;
      }
      
      // For demo, we'll create a data URL for images, otherwise just store metadata
      // In production, this would upload to S3/Cloudinary
      let url = "";
      if (isImage && file.size < 5 * 1024 * 1024) {
        try {
          const reader = new FileReader();
          url = await new Promise((resolve) => {
            reader.onload = (e) => resolve(e.target?.result as string || "");
            reader.readAsDataURL(file);
          });
        } catch {
          url = URL.createObjectURL(file);
        }
      } else {
        url = URL.createObjectURL(file);
      }
      
      const type: Attachment["type"] = isImage ? "image" : isVideo ? "video" : isAudio ? "audio" : "document";
      
      newAttachments.push({
        id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type,
        url,
        size: file.size,
        mimeType: file.type,
      });
    }
    
    setAttachments(prev => [...prev, ...newAttachments]);
    setUploading(false);
  };
  
  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, ...(rep || {}), attachments }),
      });
      const data = await res.json();
      if (data.success) setSubmitted({ ticketId: data.ticketId, attachments: data.attachments || [] });
    } catch {
      alert("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDept = DEPARTMENTS.find((d) => d.id === form.department);

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="bg-white rounded-3xl shadow-lg p-12 border border-slate-100">
            <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800 mb-3">Feedback Submitted!</h1>
            <p className="text-slate-500 mb-6 text-lg">Your complaint has been registered and forwarded to your representatives.</p>
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
              <div className="text-sm text-blue-600 font-medium mb-1">Your Ticket ID</div>
              <div className="text-2xl font-black text-blue-800">{submitted.ticketId}</div>
              <div className="text-xs text-blue-500 mt-2">Save this ID to track your complaint status</div>
            </div>
            {rep && (
              <div className="bg-slate-50 rounded-2xl p-5 text-left mb-8 space-y-2">
                <div className="font-semibold text-slate-700 mb-3">Notified Representatives:</div>
                <div className="flex items-center gap-2 text-sm"><span className="text-slate-500 w-20">MP:</span><span className="font-medium text-slate-800">{rep.mp}</span></div>
                <div className="flex items-center gap-2 text-sm"><span className="text-slate-500 w-20">MLA:</span><span className="font-medium text-slate-800">{rep.mla}</span></div>
                <div className="flex items-center gap-2 text-sm"><span className="text-slate-500 w-20">Local:</span><span className="font-medium text-slate-800">{rep.localBody}</span></div>
              </div>
            )}
            {submitted.attachments.length > 0 && (
              <div className="bg-slate-50 rounded-2xl p-5 text-left mb-8">
                <div className="font-semibold text-slate-700 mb-3">Attachments Submitted ({submitted.attachments.length}):</div>
                <div className="flex flex-wrap gap-2">
                  {submitted.attachments.map((att) => (
                    <div key={att.id} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm">
                      {att.type === "image" ? <ImageIcon size={16} className="text-blue-500" /> :
                       att.type === "video" ? <Video size={16} className="text-purple-500" /> :
                       <Paperclip size={16} className="text-slate-500" />}
                      <span className="text-slate-700">{att.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <a href={`/track?id=${submitted.ticketId}`} className="flex-1 py-3 px-6 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-center">
                Track Status
              </a>
              <a href="/" className="flex-1 py-3 px-6 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors text-center">
                Back to Home
              </a>
            </div>
            <div className="mt-6 text-xs text-slate-400">
              Also forward to CPGRAM:{" "}
              <a href="https://cpgrams.gov.in" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline inline-flex items-center gap-1">
                cpgrams.gov.in <ExternalLink size={10} />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Submit Your Feedback</h1>
          <p className="text-slate-500">Your complaint reaches your MLA, MP and the concerned department directly.</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[
            { num: 1, label: "Location" },
            { num: 2, label: "Your Details" },
            { num: 3, label: "Issue Details" },
            { num: 4, label: "Review" },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all
                  ${step > s.num ? "bg-green-500 text-white" : step === s.num ? "bg-blue-600 text-white ring-4 ring-blue-100" : "bg-slate-200 text-slate-500"}`}>
                  {step > s.num ? <CheckCircle size={18} /> : s.num}
                </div>
                <span className={`text-xs mt-1 font-medium ${step === s.num ? "text-blue-600" : "text-slate-400"}`}>{s.label}</span>
              </div>
              {i < 3 && <div className={`w-16 h-1 mx-2 rounded-full mb-4 ${step > s.num ? "bg-green-400" : "bg-slate-200"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          {/* Step 1: Location */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <MapPin size={20} className="text-blue-600" /> Your Location
              </h2>
              <p className="text-slate-500 text-sm">We use your pincode to identify your MLA, MP and local authorities.</p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Pincode *</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 110001"
                    value={form.pincode}
                    onChange={(e) => update("pincode", e.target.value.replace(/\D/g, ""))}
                    className={`w-full border rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-mono ${errors.pincode ? "border-red-400 bg-red-50" : "border-slate-200"}`}
                  />
                  {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">State *</label>
                  <select
                    value={form.state}
                    onChange={(e) => update("state", e.target.value)}
                    className={`w-full border rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.state ? "border-red-400" : "border-slate-200"}`}
                  >
                    <option value="">Select State</option>
                    {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">District</label>
                  <input
                    type="text"
                    placeholder="e.g. Central Delhi"
                    value={form.district}
                    onChange={(e) => update("district", e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Representative Lookup */}
              {repLoading && (
                <div className="bg-blue-50 rounded-2xl p-4 flex items-center gap-3">
                  <Loader2 size={20} className="text-blue-600 animate-spin" />
                  <span className="text-blue-700 text-sm">Looking up your representatives...</span>
                </div>
              )}
              {rep && !repLoading && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle size={18} className="text-green-600" />
                    <span className="font-semibold text-green-800">Representatives Found for {form.pincode}</span>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-3 border border-green-100">
                      <div className="text-xs text-slate-500 mb-1">Member of Parliament</div>
                      <div className="font-bold text-slate-800">{rep.mp}</div>
                      <div className="text-xs text-slate-500 mt-1">{rep.constituency}</div>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-green-100">
                      <div className="text-xs text-slate-500 mb-1">Member of Legislative Assembly</div>
                      <div className="font-bold text-slate-800">{rep.mla}</div>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-green-100">
                      <div className="text-xs text-slate-500 mb-1">Local Body</div>
                      <div className="font-bold text-slate-800">{rep.localBody}</div>
                    </div>
                  </div>
                  {rep.note && (
                    <div className="mt-3 flex items-start gap-2 text-xs text-slate-500">
                      <Info size={12} className="mt-0.5 shrink-0" />
                      {rep.note}{" "}
                      <a href="https://electoralsearch.eci.gov.in" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline inline-flex items-center gap-0.5">
                        Verify here <ExternalLink size={10} />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Personal Details */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <User size={20} className="text-blue-600" /> Your Details
              </h2>
              <p className="text-slate-500 text-sm">Your details help authorities contact you. Email is used to send your ticket ID.</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className={`w-full border rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? "border-red-400 bg-red-50" : "border-slate-200"}`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className={`w-full border rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? "border-red-400 bg-red-50" : "border-slate-200"}`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 flex items-start gap-2">
                <Info size={16} className="shrink-0 mt-0.5" />
                Your personal details are kept private and only shared with government officials handling your complaint.
              </div>
            </div>
          )}

          {/* Step 3: Issue Details */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <AlertTriangle size={20} className="text-blue-600" /> Issue Details
              </h2>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Select Department *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {DEPARTMENTS.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => update("department", d.id)}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium text-left ${
                        form.department === d.id
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700"
                      }`}
                    >
                      <span className="text-xl">{d.icon}</span>
                      <span className="leading-tight">{d.name}</span>
                    </button>
                  ))}
                </div>
                {errors.department && <p className="text-red-500 text-xs mt-2">{errors.department}</p>}
              </div>

              {selectedDept && (
                <div className="bg-slate-50 rounded-xl p-3 text-sm flex items-center gap-2">
                  <span>Official portal:</span>
                  <a href={selectedDept.govUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 font-medium">
                    {selectedDept.govUrl} <ExternalLink size={12} />
                  </a>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Subject / Title *</label>
                <input
                  type="text"
                  placeholder="Brief title of your complaint (e.g. Pothole on Main Road)"
                  value={form.subject}
                  onChange={(e) => update("subject", e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.subject ? "border-red-400 bg-red-50" : "border-slate-200"}`}
                />
                {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Describe the Issue * <span className="font-normal text-slate-400">({form.description.length} chars)</span>
                </label>
                <textarea
                  rows={5}
                  placeholder="Describe the problem clearly. Include location details, how long it has been happening, and its impact on citizens."
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${errors.description ? "border-red-400 bg-red-50" : "border-slate-200"}`}
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Priority Level *</label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {PRIORITY_LEVELS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => update("priority", p.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-sm text-left ${
                        form.priority === p.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-blue-200"
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${p.color.split(" ")[0].replace("bg-", "bg-").replace("100", "400")}`} />
                      <span className={`font-medium ${form.priority === p.id ? "text-blue-700" : "text-slate-700"}`}>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Attachments (Optional)
                  <span className="font-normal text-slate-400 ml-1">- Photos, videos, or documents</span>
                </label>
                
                {/* Upload Area */}
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt,video/*,audio/*"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                    id="file-upload"
                    disabled={uploading}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer block">
                    <Upload size={32} className="mx-auto mb-2 text-slate-400" />
                    <p className="text-sm text-slate-600 font-medium">
                      {uploading ? "Uploading..." : "Click to upload files"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Images, PDFs, Documents, Videos up to 10MB each
                    </p>
                  </label>
                </div>
                {errors.attachments && <p className="text-red-500 text-xs mt-2">{errors.attachments}</p>}
                
                {/* Attachment List */}
                {attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-slate-700">Uploaded files ({attachments.length}):</p>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {attachments.map((att) => (
                        <div key={att.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                          {att.type === "image" ? <ImageIcon size={16} className="text-blue-500" /> :
                           att.type === "video" ? <Video size={16} className="text-purple-500" /> :
                           <FileText size={16} className="text-slate-500" />}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-700 truncate">{att.name}</p>
                            <p className="text-xs text-slate-400">{formatFileSize(att.size)}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(att.id)}
                            className="p-1 hover:bg-red-100 rounded text-red-500"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-slate-800">Review & Submit</h2>
              <p className="text-slate-500 text-sm">Please review your feedback before submitting.</p>

              <div className="space-y-4">
                <div className="bg-slate-50 rounded-2xl p-5">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Location</div>
                  <div className="grid sm:grid-cols-2 gap-2 text-sm">
                    <div><span className="text-slate-500">Pincode:</span> <span className="font-medium text-slate-800">{form.pincode}</span></div>
                    <div><span className="text-slate-500">State:</span> <span className="font-medium text-slate-800">{form.state}</span></div>
                    {form.district && <div><span className="text-slate-500">District:</span> <span className="font-medium text-slate-800">{form.district}</span></div>}
                  </div>
                </div>

                {rep && (
                  <div className="bg-blue-50 rounded-2xl p-5">
                    <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3">Will be forwarded to</div>
                    <div className="grid sm:grid-cols-3 gap-2 text-sm">
                      <div><span className="text-slate-500">MP:</span> <span className="font-bold text-slate-800">{rep.mp}</span></div>
                      <div><span className="text-slate-500">MLA:</span> <span className="font-bold text-slate-800">{rep.mla}</span></div>
                      <div><span className="text-slate-500">Local:</span> <span className="font-bold text-slate-800">{rep.localBody}</span></div>
                    </div>
                  </div>
                )}

                <div className="bg-slate-50 rounded-2xl p-5">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Your Details</div>
                  <div className="grid sm:grid-cols-2 gap-2 text-sm">
                    <div><span className="text-slate-500">Name:</span> <span className="font-medium text-slate-800">{form.name}</span></div>
                    <div><span className="text-slate-500">Email:</span> <span className="font-medium text-slate-800">{form.email}</span></div>
                    {form.phone && <div><span className="text-slate-500">Phone:</span> <span className="font-medium text-slate-800">{form.phone}</span></div>}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Issue</div>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-slate-500">Department:</span> <span className="font-medium text-slate-800">{selectedDept?.name}</span></div>
                    <div><span className="text-slate-500">Subject:</span> <span className="font-medium text-slate-800">{form.subject}</span></div>
                    <div><span className="text-slate-500">Priority:</span> <span className="font-medium text-slate-800 capitalize">{form.priority}</span></div>
                    <div><span className="text-slate-500">Description:</span></div>
                    <div className="bg-white rounded-xl p-3 border border-slate-200 text-slate-700 leading-relaxed">{form.description}</div>
                  </div>
                </div>

                {attachments.length > 0 && (
                  <div className="bg-slate-50 rounded-2xl p-5">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Attachments ({attachments.length})</div>
                    <div className="flex flex-wrap gap-2">
                      {attachments.map((att) => (
                        <div key={att.id} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm">
                          {att.type === "image" ? <ImageIcon size={16} className="text-blue-500" /> :
                           att.type === "video" ? <Video size={16} className="text-purple-500" /> :
                           <Paperclip size={16} className="text-slate-500" />}
                          <span className="text-slate-700">{att.name}</span>
                          <span className="text-xs text-slate-400">({formatFileSize(att.size)})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800 flex items-start gap-2">
                <CheckCircle size={16} className="shrink-0 mt-0.5" />
                Your feedback will also be auto-forwarded to{" "}
                <a href="https://pgportal.gov.in" target="_blank" rel="noopener noreferrer" className="underline font-medium">PG Portal</a>{" "}
                for official government tracking.
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 py-3 px-6 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Back
              </button>
            )}
            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex-1 py-3 px-6 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                Continue <ChevronRight size={18} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-3 px-6 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? <><Loader2 size={18} className="animate-spin" /> Submitting...</> : <><CheckCircle size={18} /> Submit Feedback</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubmitFeedback() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>}>
      <SubmitFeedbackInner />
    </Suspense>
  );
}
