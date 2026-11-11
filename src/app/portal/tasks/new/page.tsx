"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTaskContext } from "@/context/TaskContext";
import { createClient } from "@/lib/supabase/client";
import { submitNewTaskRequest, recordTaskAttachment } from "@/app/actions/portal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Sparkles,
  ArrowLeft,
  UploadCloud,
  X,
  FileText,
  Link2,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Layers,
  Flag,
  Monitor,
  Maximize2,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DESIGN_CATEGORIES = [
  "Branding & Identity",
  "UI/UX Design",
  "3D & Motion",
  "Social Media Kit",
  "Pitch Deck & Presentation",
  "Packaging Design",
];

const PLATFORMS = [
  "Instagram",
  "LinkedIn",
  "Website & Web App",
  "Mobile App (iOS / Android)",
  "Print & Collateral",
  "YouTube & Video",
  "TikTok",
  "General / Multi-Platform",
];

const COMMON_DIMENSIONS = [
  "1080 x 1080 px (1:1 Square)",
  "1080 x 1350 px (4:5 Portrait)",
  "1080 x 1920 px (9:16 Story / Reel)",
  "1920 x 1080 px (16:9 Landscape)",
  "1200 x 630 px (Social Share)",
  "A4 Print (210 x 297 mm)",
  "Custom / Responsive Vector",
];

interface FileUploadItem {
  id: string;
  file: File;
  previewUrl: string;
  isPdf: boolean;
  sizeFormatted: string;
}

export default function NewTaskRequestPage() {
  const router = useRouter();
  const { showToast, isSidebarCollapsed } = useTaskContext();

  // SECTION A: Basic Details
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [designCategory, setDesignCategory] = useState(DESIGN_CATEGORIES[0]);
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [dimensions, setDimensions] = useState(COMMON_DIMENSIONS[0]);
  const [customDimensions, setCustomDimensions] = useState("");
  const [requestedDeadline, setRequestedDeadline] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");

  // SECTION B: Design Content
  const [mainHeading, setMainHeading] = useState("");
  const [supportingText, setSupportingText] = useState("");
  const [callToAction, setCallToAction] = useState("");
  const [brandInfo, setBrandInfo] = useState("");
  const [creativeInstructions, setCreativeInstructions] = useState("");

  // SECTION C: Reference Links
  const [referenceLinks, setReferenceLinks] = useState<{ title: string; url: string }[]>([
    { title: "Inspiration Reference", url: "" },
  ]);

  // SECTION D: Reference Files
  const [files, setFiles] = useState<FileUploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Link Handlers
  const handleAddLink = () => {
    setReferenceLinks((prev) => [...prev, { title: "", url: "" }]);
  };

  const handleUpdateLink = (index: number, field: "title" | "url", value: string) => {
    setReferenceLinks((prev) =>
      prev.map((l, i) => (i === index ? { ...l, [field]: value } : l))
    );
  };

  const handleRemoveLink = (index: number) => {
    setReferenceLinks((prev) => prev.filter((_, i) => i !== index));
  };

  // File Handlers
  const processFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const validExtensions = ["jpg", "jpeg", "png", "webp", "gif", "pdf"];
    const maxSizeBytes = 10 * 1024 * 1024; // 10 MB

    const newItems: FileUploadItem[] = [];

    Array.from(selectedFiles).forEach((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase() || "";
      if (!validExtensions.includes(ext)) {
        showToast("Invalid File Type", `${f.name} is not a supported file type.`, "error");
        return;
      }

      if (f.size > maxSizeBytes) {
        showToast("File Too Large", `${f.name} exceeds the 10 MB limit.`, "error");
        return;
      }

      const isPdf = ext === "pdf";
      const previewUrl = isPdf ? "" : URL.createObjectURL(f);
      const sizeFormatted = (f.size / (1024 * 1024)).toFixed(2) + " MB";

      newItems.push({
        id: Math.random().toString(36).substring(2, 9),
        file: f,
        previewUrl,
        isPdf,
        sizeFormatted,
      });
    });

    setFiles((prev) => [...prev, ...newItems]);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item && item.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!title.trim()) {
      setErrorMessage("Please enter a deliverable title.");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress("Validating and creating task record...");

    try {
      const resolvedDimensions =
        dimensions === "Custom / Responsive Vector" && customDimensions
          ? customDimensions
          : dimensions;

      // 1. Submit core task record via server action (enforces status = 'NEW')
      const res = await submitNewTaskRequest({
        title,
        description,
        designCategory,
        platform,
        dimensions: resolvedDimensions,
        requestedDeadline: requestedDeadline || undefined,
        priority,
        mainHeading,
        supportingText,
        callToAction,
        brandInfo,
        creativeInstructions,
        referenceLinks,
      });

      if (!res.success || !res.taskId) {
        setErrorMessage(res.error || "Failed to create design request.");
        setIsSubmitting(false);
        setUploadProgress(null);
        return;
      }

      const taskId = res.taskId;

      // 2. Upload reference files directly to Supabase storage task-files bucket
      if (files.length > 0) {
        setUploadProgress(`Uploading 0 of ${files.length} reference files...`);
        const supabase = createClient();

        for (let i = 0; i < files.length; i++) {
          const item = files[i];
          setUploadProgress(`Uploading ${i + 1} of ${files.length}: ${item.file.name}...`);

          const sanitizedName = item.file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
          const uniqueId = Math.random().toString(36).substring(2, 8);
          const storagePath = `${taskId}/references/${uniqueId}-${sanitizedName}`;

          const { error: uploadError } = await supabase.storage
            .from("task-files")
            .upload(storagePath, item.file, {
              cacheControl: "3600",
              upsert: true,
            });

          if (!uploadError) {
            // Save attachment record in database
            await recordTaskAttachment({
              taskId,
              fileName: item.file.name,
              fileSize: item.file.size,
              fileType: item.file.type || "application/octet-stream",
              storagePath,
              isDeliverable: false,
            });
          }
        }
      }

      showToast("Design Request Submitted", `Task #${res.taskNumber || ""} is now queued for studio intake.`, "success");
      router.push(`/portal/tasks/${taskId}`);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during submission.");
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  return (
    <main
      className={cn(
        "transition-all duration-300 px-4 md:px-8 pb-16 pt-2 max-w-5xl mx-auto",
        isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
      )}
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/portal/tasks"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#837C8D] hover:text-[#6F00FF] transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to My Deliverables</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#241A33] tracking-tight">
              Submit New Design Request
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E9B3FB]/30 text-[#3B0270] border border-[#E9B3FB]">
              Step 1 of 1
            </span>
          </div>
          <p className="text-xs text-[#837C8D] mt-1">
            Provide design specs, copy, reference files, and delivery milestones. Status will initialize as <strong>NEW</strong>.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-[#D84B66]/10 border border-[#D84B66]/20 text-xs text-[#D84B66] flex items-start gap-2.5 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION A: BASIC DETAILS */}
        <div className="p-6 rounded-3xl bg-white border border-[#F0E6F3] shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F0E6F3]">
            <div className="w-7 h-7 rounded-lg bg-[#6F00FF]/10 text-[#6F00FF] flex items-center justify-center font-bold text-xs">
              A
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#241A33]">Basic Deliverable Specs</h3>
              <p className="text-[11px] text-[#837C8D]">Core project definition and requirements</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#241A33] mb-1.5">
              Deliverable Title *
            </label>
            <Input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q4 Instagram Retargeting Carousel & Story Ads"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#241A33] mb-1.5">
              Design Brief & Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline the creative objective, target audience, and primary message..."
              className="w-full px-3.5 py-2.5 bg-[#FAF7FC] border border-[#F0E6F3] rounded-2xl text-xs text-[#241A33] placeholder:text-[#837C8D] outline-none focus:border-[#6F00FF] focus:bg-white transition-all leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#241A33] mb-1.5">
                Design Category *
              </label>
              <select
                value={designCategory}
                onChange={(e) => setDesignCategory(e.target.value)}
                className="w-full h-10 px-3 bg-[#FAF7FC] border border-[#F0E6F3] rounded-2xl text-xs text-[#241A33] font-semibold outline-none focus:border-[#6F00FF] cursor-pointer"
              >
                {DESIGN_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#241A33] mb-1.5">
                Target Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full h-10 px-3 bg-[#FAF7FC] border border-[#F0E6F3] rounded-2xl text-xs text-[#241A33] font-semibold outline-none focus:border-[#6F00FF] cursor-pointer"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#241A33] mb-1.5">
                Required Dimensions
              </label>
              <select
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                className="w-full h-10 px-3 bg-[#FAF7FC] border border-[#F0E6F3] rounded-2xl text-xs text-[#241A33] font-semibold outline-none focus:border-[#6F00FF] cursor-pointer"
              >
                {COMMON_DIMENSIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              {dimensions === "Custom / Responsive Vector" && (
                <input
                  type="text"
                  value={customDimensions}
                  onChange={(e) => setCustomDimensions(e.target.value)}
                  placeholder="Enter custom dimensions (e.g. 2400 x 3000 mm)"
                  className="mt-2 w-full h-9 px-3 bg-[#FAF7FC] border border-[#F0E6F3] rounded-xl text-xs text-[#241A33] outline-none focus:border-[#6F00FF]"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#241A33] mb-1.5">
                Requested Delivery Date
              </label>
              <Input
                type="date"
                value={requestedDeadline}
                onChange={(e) => setRequestedDeadline(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                icon={<Calendar className="w-4 h-4" />}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#241A33] mb-2">
              Priority Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(["low", "medium", "high", "urgent"] as const).map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setPriority(lvl)}
                  className={cn(
                    "py-2.5 px-3 rounded-2xl border text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5",
                    priority === lvl
                      ? lvl === "urgent"
                        ? "bg-[#D84B66]/10 text-[#D84B66] border-[#D84B66]"
                        : lvl === "high"
                        ? "bg-[#D99516]/10 text-[#D99516] border-[#D99516]"
                        : "bg-[#6F00FF]/10 text-[#6F00FF] border-[#6F00FF]"
                      : "bg-[#FAF7FC] text-[#837C8D] border-[#F0E6F3] hover:border-[#E9B3FB]"
                  )}
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>{lvl}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION B: DESIGN CONTENT */}
        <div className="p-6 rounded-3xl bg-white border border-[#F0E6F3] shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F0E6F3]">
            <div className="w-7 h-7 rounded-lg bg-[#6F00FF]/10 text-[#6F00FF] flex items-center justify-center font-bold text-xs">
              B
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#241A33]">Copy & Brand Details</h3>
              <p className="text-[11px] text-[#837C8D]">Headings, body copy, and brand voice guidelines</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#241A33] mb-1.5">
                Main Heading / Headline
              </label>
              <Input
                type="text"
                value={mainHeading}
                onChange={(e) => setMainHeading(e.target.value)}
                placeholder="e.g. Unleash Your Freelance Superpower"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#241A33] mb-1.5">
                Call-to-Action (CTA)
              </label>
              <Input
                type="text"
                value={callToAction}
                onChange={(e) => setCallToAction(e.target.value)}
                placeholder="e.g. Download Now, Book Consultation"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#241A33] mb-1.5">
              Supporting Text / Body Copy
            </label>
            <textarea
              rows={2}
              value={supportingText}
              onChange={(e) => setSupportingText(e.target.value)}
              placeholder="Secondary paragraph copy or bullet points to feature..."
              className="w-full px-3.5 py-2.5 bg-[#FAF7FC] border border-[#F0E6F3] rounded-2xl text-xs text-[#241A33] placeholder:text-[#837C8D] outline-none focus:border-[#6F00FF] focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#241A33] mb-1.5">
              Brand Assets & Additional Instructions
            </label>
            <textarea
              rows={2}
              value={brandInfo}
              onChange={(e) => setBrandInfo(e.target.value)}
              placeholder="Hex color codes, typography preferences, or tone of voice (e.g. minimalist, futuristic, luxury)..."
              className="w-full px-3.5 py-2.5 bg-[#FAF7FC] border border-[#F0E6F3] rounded-2xl text-xs text-[#241A33] placeholder:text-[#837C8D] outline-none focus:border-[#6F00FF] focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* SECTION C: REFERENCE LINKS */}
        <div className="p-6 rounded-3xl bg-white border border-[#F0E6F3] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0E6F3]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#6F00FF]/10 text-[#6F00FF] flex items-center justify-center font-bold text-xs">
                C
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#241A33]">Reference Links</h3>
                <p className="text-[11px] text-[#837C8D]">
                  Canva, Pinterest, Behance, Google Drive, or competitor URL references
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddLink}
              className="h-8 text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Add Another Link</span>
            </Button>
          </div>

          <div className="space-y-3">
            {referenceLinks.map((link, idx) => (
              <div key={idx} className="flex items-center gap-2.5">
                <div className="w-1/3">
                  <Input
                    type="text"
                    value={link.title}
                    onChange={(e) => handleUpdateLink(idx, "title", e.target.value)}
                    placeholder="Link Title (e.g. Canva Board)"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="url"
                    value={link.url}
                    onChange={(e) => handleUpdateLink(idx, "url", e.target.value)}
                    placeholder="https://..."
                    icon={<Link2 className="w-4 h-4" />}
                  />
                </div>
                {referenceLinks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveLink(idx)}
                    className="p-2.5 text-[#D84B66] hover:bg-[#D84B66]/10 rounded-xl transition-colors shrink-0"
                    title="Remove Link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SECTION D: REFERENCE FILES */}
        <div className="p-6 rounded-3xl bg-white border border-[#F0E6F3] shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F0E6F3]">
            <div className="w-7 h-7 rounded-lg bg-[#6F00FF]/10 text-[#6F00FF] flex items-center justify-center font-bold text-xs">
              D
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#241A33]">Reference Files & Assets</h3>
              <p className="text-[11px] text-[#837C8D]">
                PNG, JPG, WEBP, GIF, or PDF (Up to 10 MB per file). Uploaded to private &apos;task-files&apos; storage.
              </p>
            </div>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "p-8 border-2 border-dashed rounded-3xl text-center cursor-pointer transition-all",
              isDragging
                ? "border-[#6F00FF] bg-[#FAF1FD]"
                : "border-[#F0E6F3] bg-[#FAF7FC] hover:border-[#E9B3FB] hover:bg-white"
            )}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => processFiles(e.target.files)}
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#F0E6F3] flex items-center justify-center text-[#6F00FF] mx-auto shadow-xs mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-xs md:text-sm font-bold text-[#241A33]">
              Drag and drop reference files here, or <span className="text-[#6F00FF]">browse</span>
            </p>
            <p className="text-[11px] text-[#837C8D] mt-1">
              Supports images (PNG, JPG, WEBP, GIF) and documents (PDF) up to 10 MB each.
            </p>
          </div>

          {/* Uploaded File Previews */}
          {files.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
              {files.map((item) => (
                <div
                  key={item.id}
                  className="relative p-2.5 rounded-2xl bg-[#FAF7FC] border border-[#F0E6F3] group flex flex-col justify-between"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(item.id);
                    }}
                    className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-white border border-[#F0E6F3] shadow-md flex items-center justify-center text-[#D84B66] hover:bg-[#D84B66] hover:text-white transition-colors z-10"
                    title="Remove file"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {item.isPdf ? (
                    <div className="h-24 rounded-xl bg-white border border-[#F0E6F3] flex flex-col items-center justify-center text-center p-2">
                      <FileText className="w-8 h-8 text-[#D84B66] mb-1" />
                      <span className="text-[10px] font-bold text-[#241A33] uppercase">PDF Document</span>
                    </div>
                  ) : (
                    <div className="relative h-24 rounded-xl overflow-hidden bg-white border border-[#F0E6F3]">
                      <Image
                        src={item.previewUrl}
                        alt={item.file.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="mt-2 text-left">
                    <p className="text-[11px] font-bold text-[#241A33] truncate" title={item.file.name}>
                      {item.file.name}
                    </p>
                    <span className="text-[10px] text-[#837C8D]">{item.sizeFormatted}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Bar */}
        <div className="p-4 rounded-3xl bg-white border border-[#F0E6F3] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-[#837C8D]">
            {uploadProgress ? (
              <span className="font-semibold text-[#6F00FF] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#6F00FF] animate-ping" />
                {uploadProgress}
              </span>
            ) : (
              <span>Your task will be reviewed by the agency director within 24 hours.</span>
            )}
          </div>

          <div className="flex items-center gap-3 justify-end">
            <Link href="/portal/tasks">
              <Button type="button" variant="ghost" size="md">
                Cancel
              </Button>
            </Link>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className="bg-gradient-to-r from-[#6F00FF] to-[#3B0270] shadow-md shadow-[#6F00FF]/25 px-8"
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              <span>Submit Design Request</span>
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
}
