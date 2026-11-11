"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useTaskContext } from "@/context/TaskContext";
import { createClient } from "@/lib/supabase/client";
import { addMemberComment, getSignedFileUrl, recordTaskAttachment } from "@/app/actions/portal";
import { Button } from "@/components/ui/Button";
import { PriorityBadge } from "@/components/tasks/PriorityBadge";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Sparkles,
  MessageSquare,
  FileText,
  Download,
  ExternalLink,
  Paperclip,
  Send,
  AlertTriangle,
  CheckCircle2,
  UploadCloud,
  X,
  History,
  ShieldCheck,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AttachmentItem {
  id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  is_deliverable: boolean;
  created_at: string;
}

interface LinkItem {
  id: string;
  title: string;
  url: string;
  created_at: string;
}

interface CommentItem {
  id: string;
  content: string;
  is_revision_note: boolean;
  created_at: string;
  user_id: string;
  author?: {
    full_name: string;
    avatar_url: string | null;
    role: string;
  };
}

interface ActivityItem {
  id: string;
  action: string;
  details: any;
  created_at: string;
}

interface TaskDetail {
  id: string;
  task_number: number;
  title: string;
  description: string | null;
  design_category: string;
  platform: string | null;
  dimensions: string | null;
  main_content: string | null;
  instructions: string | null;
  priority: "low" | "medium" | "high" | "urgent";
  status: "NEW" | "ACCEPTED" | "IN_PROGRESS" | "IN_REVIEW" | "REVISION" | "COMPLETED" | "REJECTED";
  deadline: string | null;
  scheduled_time: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  rejection_reason: string | null;
  deliverable_preview: string | null;
}

export default function MemberTaskDetailPage() {
  const params = useParams();
  const taskId = params.id as string;
  const router = useRouter();
  const { isSidebarCollapsed, showToast } = useTaskContext();

  const [task, setTask] = useState<TaskDetail | null>(null);
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [commentInput, setCommentInput] = useState("");
  const [isSendingComment, setIsSendingComment] = useState(false);
  const [isUploadingRef, setIsUploadingRef] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);

  const refFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadTaskData() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        setCurrentUserId(user.id);

        // Fetch task
        const { data: taskData, error: taskErr } = await supabase
          .from("tasks")
          .select("*")
          .eq("id", taskId)
          .single();

        if (taskErr || !taskData) {
          router.push("/portal/tasks");
          return;
        }

        // Security check: ensure member owns this task
        if (taskData.created_by !== user.id) {
          router.push("/portal/tasks");
          return;
        }

        setTask(taskData as TaskDetail);

        // Fetch attachments
        const { data: attData } = await supabase
          .from("task_attachments")
          .select("*")
          .eq("task_id", taskId)
          .order("created_at", { ascending: false });
        if (attData) setAttachments(attData as AttachmentItem[]);

        // Fetch links
        const { data: linkData } = await supabase
          .from("task_links")
          .select("*")
          .eq("task_id", taskId)
          .order("created_at", { ascending: true });
        if (linkData) setLinks(linkData as LinkItem[]);

        // Fetch comments with author profile
        const { data: commData } = await supabase
          .from("task_comments")
          .select(`
            *,
            author:profiles!task_comments_user_id_fkey(full_name, avatar_url, role)
          `)
          .eq("task_id", taskId)
          .order("created_at", { ascending: true });
        if (commData) setComments(commData as CommentItem[]);

        // Fetch activity
        const { data: actData } = await supabase
          .from("task_activity")
          .select("*")
          .eq("task_id", taskId)
          .order("created_at", { ascending: false });
        if (actData) setActivity(actData as ActivityItem[]);
      } catch (err) {
        console.error("Load task detail error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadTaskData();
  }, [taskId, router]);

  // Handle Comment Submission
  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    setIsSendingComment(true);
    const text = commentInput.trim();
    setCommentInput("");

    const res = await addMemberComment({
      taskId,
      content: text,
      isRevisionNote: task?.status === "REVISION",
    });

    setIsSendingComment(false);

    if (res.success && res.comment) {
      setComments((prev) => [...prev, res.comment as CommentItem]);
      showToast("Message Sent", "Your note has been posted to the studio team.", "success");
    } else {
      showToast("Error", res.error || "Failed to post comment.", "error");
    }
  };

  // Handle Download via Signed URL
  const handleDownload = async (storagePath: string, fileName: string) => {
    showToast("Preparing Download", "Generating secure signed file URL...", "info");
    const res = await getSignedFileUrl(storagePath, 3600);
    if (res.success && res.signedUrl) {
      const a = document.createElement("a");
      a.href = res.signedUrl;
      a.download = fileName;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      showToast("Download Failed", res.error || "Could not retrieve file.", "error");
    }
  };

  // Handle Preview via Signed URL
  const handlePreview = async (storagePath: string) => {
    const res = await getSignedFileUrl(storagePath, 3600);
    if (res.success && res.signedUrl) {
      setPreviewModalUrl(res.signedUrl);
    } else {
      showToast("Preview Error", res.error || "Could not open preview.", "error");
    }
  };

  // Handle Additional Reference Upload
  const handleUploadAdditionalRef = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingRef(true);
    try {
      const supabase = createClient();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const uniqueId = Math.random().toString(36).substring(2, 8);
      const storagePath = `${taskId}/references/${uniqueId}-${sanitizedName}`;

      const { error: uploadError } = await supabase.storage
        .from("task-files")
        .upload(storagePath, file, { cacheControl: "3600", upsert: true });

      if (uploadError) {
        showToast("Upload Failed", uploadError.message, "error");
        return;
      }

      const res = await recordTaskAttachment({
        taskId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || "application/octet-stream",
        storagePath,
        isDeliverable: false,
      });

      if (res.success && res.attachment) {
        setAttachments((prev) => [res.attachment as AttachmentItem, ...prev]);
        showToast("Reference Added", `"${file.name}" uploaded to task files.`, "success");
      }
    } catch (err: any) {
      showToast("Upload Error", err.message, "error");
    } finally {
      setIsUploadingRef(false);
      if (refFileInputRef.current) refFileInputRef.current.value = "";
    }
  };

  if (isLoading || !task) {
    return (
      <main
        className={cn(
          "transition-all duration-300 px-4 md:px-8 pb-16 pt-8 max-w-5xl mx-auto",
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        )}
      >
        <div className="p-12 text-center rounded-3xl bg-white border border-[#F0E6F3] shadow-sm">
          <div className="w-8 h-8 border-2 border-[#6F00FF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#837C8D]">Loading deliverable workspace...</p>
        </div>
      </main>
    );
  }

  // Categorize attachments
  const referenceFiles = attachments.filter((a) => !a.is_deliverable);
  const finalDeliverables = attachments.filter((a) => a.is_deliverable);

  return (
    <main
      className={cn(
        "transition-all duration-300 px-4 md:px-8 pb-16 pt-2 max-w-5xl mx-auto",
        isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
      )}
    >
      {/* Back Navigation */}
      <div className="mb-4">
        <Link
          href="/portal/tasks"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#837C8D] hover:text-[#6F00FF] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Deliverables</span>
        </Link>
      </div>

      {/* Revision Notice Banner */}
      {task.status === "REVISION" && (
        <div className="mb-6 p-4 rounded-3xl bg-[#D99516]/10 border border-[#D99516]/30 text-[#D99516] flex items-start gap-3 animate-fade-in shadow-xs">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-[#241A33]">Revisions Requested by Studio Team</h4>
            <p className="mt-0.5 leading-relaxed text-[#241A33]/90">
              The designers have requested clarifications or alterations. Please review the studio feedback notes below and post your revision instructions in the conversation thread.
            </p>
          </div>
        </div>
      )}

      {/* Task Header Card */}
      <div className="p-6 rounded-3xl bg-white border border-[#F0E6F3] shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#F0E6F3]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold text-[#837C8D]">
              #{task.task_number || "REQ"}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FAF1FD] text-[#3B0270] border border-[#E9B3FB]">
              {task.design_category}
            </span>
            <PriorityBadge priority={task.priority} />
            <span
              className={cn(
                "px-2.5 py-0.5 rounded-full text-xs font-bold uppercase",
                task.status === "NEW" && "bg-[#FAF1FD] text-[#3B0270] border border-[#E9B3FB]",
                task.status === "ACCEPTED" && "bg-[#FAF1FD] text-[#3B0270] border border-[#E9B3FB]",
                task.status === "IN_PROGRESS" && "bg-[#E9B3FB]/25 text-[#6F00FF] border border-[#E9B3FB]",
                task.status === "IN_REVIEW" && "bg-[#FAF1FD] text-[#3B0270] border border-[#E9B3FB]",
                task.status === "REVISION" && "bg-[#D99516]/10 text-[#D99516] border border-[#D99516]/30",
                task.status === "COMPLETED" && "bg-[#16865C]/10 text-[#16865C] border border-[#16865C]/30"
              )}
            >
              {task.status.replace("_", " ")}
            </span>
          </div>

          <div className="text-xs text-[#837C8D] flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#6F00FF]" />
              Submitted {new Date(task.created_at).toLocaleDateString()}
            </span>
            {task.deadline && (
              <span className="flex items-center gap-1 font-semibold text-[#241A33]">
                <Clock className="w-3.5 h-3.5 text-[#6F00FF]" />
                Due {new Date(task.deadline).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-[#241A33] tracking-tight mt-4">
          {task.title}
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
          <div className="p-3 rounded-2xl bg-[#FAF7FC] border border-[#F0E6F3]">
            <span className="text-[10px] text-[#837C8D] font-bold uppercase block">Platform</span>
            <p className="font-semibold text-[#241A33] mt-0.5">{task.platform || "General"}</p>
          </div>
          <div className="p-3 rounded-2xl bg-[#FAF7FC] border border-[#F0E6F3]">
            <span className="text-[10px] text-[#837C8D] font-bold uppercase block">Dimensions</span>
            <p className="font-semibold text-[#241A33] mt-0.5">{task.dimensions || "Standard"}</p>
          </div>
          <div className="p-3 rounded-2xl bg-[#FAF7FC] border border-[#F0E6F3]">
            <span className="text-[10px] text-[#837C8D] font-bold uppercase block">Design Category</span>
            <p className="font-semibold text-[#6F00FF] mt-0.5">{task.design_category}</p>
          </div>
          <div className="p-3 rounded-2xl bg-[#FAF7FC] border border-[#F0E6F3]">
            <span className="text-[10px] text-[#837C8D] font-bold uppercase block">Timezone</span>
            <p className="font-semibold text-[#241A33] mt-0.5">Asia/Kolkata (IST)</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Brief, Links, Files, Deliverables */}
        <div className="lg:col-span-2 space-y-6">
          {/* SECTION 7: FINAL DESIGN DELIVERABLES (PROMINENT WHEN AVAILABLE) */}
          {finalDeliverables.length > 0 && (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-white via-white to-[#F0FFF4] border border-[#16865C]/30 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0E6F3]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#16865C]/15 text-[#16865C] flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#241A33]">Final Design Deliverables</h3>
                    <p className="text-[11px] text-[#16865C] font-semibold">
                      Approved studio deliverables ready for export & use
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#16865C]/15 text-[#16865C]">
                  {finalDeliverables.length} Deliverable(s)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {finalDeliverables.map((deliv) => {
                  const isPdf = deliv.file_type.includes("pdf") || deliv.file_name.endsWith(".pdf");
                  const sizeFormatted = (deliv.file_size / (1024 * 1024)).toFixed(2) + " MB";

                  return (
                    <div
                      key={deliv.id}
                      className="p-3.5 rounded-2xl bg-white border border-[#F0E6F3] shadow-xs flex flex-col justify-between hover:border-[#16865C]/40 transition-all"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-[#FAF7FC] border border-[#F0E6F3] flex items-center justify-center shrink-0">
                          {isPdf ? (
                            <FileText className="w-5 h-5 text-[#D84B66]" />
                          ) : (
                            <Image
                              src="/window.svg"
                              alt="Asset"
                              width={20}
                              height={20}
                              className="opacity-70"
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#241A33] truncate" title={deliv.file_name}>
                            {deliv.file_name}
                          </p>
                          <span className="text-[10px] text-[#837C8D]">
                            {sizeFormatted} • Delivered {new Date(deliv.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-[#F0E6F3]">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handlePreview(deliv.storage_path)}
                          className="flex-1 h-8 text-xs"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1 text-[#6F00FF]" />
                          <span>Preview</span>
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleDownload(deliv.storage_path, deliv.file_name)}
                          className="flex-1 h-8 text-xs bg-[#16865C] hover:bg-[#126b4a]"
                        >
                          <Download className="w-3.5 h-3.5 mr-1" />
                          <span>Download</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Design Brief & Scope */}
          <div className="p-6 rounded-3xl bg-white border border-[#F0E6F3] shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#241A33] uppercase tracking-wider">
              Creative Brief & Description
            </h3>
            <p className="text-xs md:text-sm text-[#241A33]/90 leading-relaxed">
              {task.description || "No specific narrative brief provided."}
            </p>

            {task.main_content && (
              <div className="mt-4 p-4 rounded-2xl bg-[#FAF7FC] border border-[#F0E6F3] text-xs">
                <span className="font-bold text-[#6F00FF] uppercase text-[10px] block mb-1">
                  Design Copy & Brand Context
                </span>
                <p className="whitespace-pre-line text-[#241A33]/90 leading-relaxed font-mono text-[11px]">
                  {task.main_content}
                </p>
              </div>
            )}

            {task.instructions && (
              <div className="mt-3 p-4 rounded-2xl bg-[#FAF1FD] border border-[#E9B3FB]/40 text-xs">
                <span className="font-bold text-[#3B0270] uppercase text-[10px] block mb-1">
                  Creative Instructions
                </span>
                <p className="whitespace-pre-line text-[#3B0270] leading-relaxed">
                  {task.instructions}
                </p>
              </div>
            )}
          </div>

          {/* Reference Links Section */}
          {links.length > 0 && (
            <div className="p-6 rounded-3xl bg-white border border-[#F0E6F3] shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-[#241A33] uppercase tracking-wider flex items-center gap-1.5">
                <ExternalLink className="w-4 h-4 text-[#6F00FF]" />
                Reference Links ({links.length})
              </h3>
              <div className="space-y-2">
                {links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-2xl bg-[#FAF7FC] hover:bg-[#FAF1FD] border border-[#F0E6F3] hover:border-[#E9B3FB] transition-all flex items-center justify-between group"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-[#241A33] group-hover:text-[#6F00FF] transition-colors">
                        {link.title}
                      </p>
                      <p className="text-[11px] text-[#837C8D] truncate">{link.url}</p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-[#837C8D] group-hover:text-[#6F00FF] shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Reference Files Section with Upload Ability */}
          <div className="p-6 rounded-3xl bg-white border border-[#F0E6F3] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0E6F3]">
              <h3 className="text-sm font-bold text-[#241A33] uppercase tracking-wider flex items-center gap-1.5">
                <Paperclip className="w-4 h-4 text-[#6F00FF]" />
                Supporting References ({referenceFiles.length})
              </h3>

              <div>
                <input
                  type="file"
                  ref={refFileInputRef}
                  onChange={handleUploadAdditionalRef}
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={isUploadingRef}
                  onClick={() => refFileInputRef.current?.click()}
                  className="h-8 text-xs"
                >
                  <UploadCloud className="w-3.5 h-3.5 mr-1 text-[#6F00FF]" />
                  <span>{isUploadingRef ? "Uploading..." : "Add Reference"}</span>
                </Button>
              </div>
            </div>

            {referenceFiles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {referenceFiles.map((file) => {
                  const isPdf = file.file_type.includes("pdf") || file.file_name.endsWith(".pdf");
                  const sizeFormatted = (file.file_size / (1024 * 1024)).toFixed(2) + " MB";

                  return (
                    <div
                      key={file.id}
                      className="p-3 rounded-2xl bg-[#FAF7FC] border border-[#F0E6F3] flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isPdf ? (
                          <FileText className="w-6 h-6 text-[#D84B66] shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-white border border-[#F0E6F3] flex items-center justify-center text-[#6F00FF] shrink-0">
                            <Image src="/globe.svg" alt="File" width={16} height={16} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#241A33] truncate" title={file.file_name}>
                            {file.file_name}
                          </p>
                          <span className="text-[10px] text-[#837C8D]">{sizeFormatted}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handlePreview(file.storage_path)}
                          className="p-1.5 rounded-lg text-[#6F00FF] hover:bg-[#6F00FF]/10 transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDownload(file.storage_path, file.file_name)}
                          className="p-1.5 rounded-lg text-[#837C8D] hover:text-[#241A33] hover:bg-white transition-colors"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-[#837C8D] italic">
                No initial reference files uploaded with this request.
              </p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Studio Conversation & Activity History */}
        <div className="space-y-6">
          {/* Conversation Area (Section 6) */}
          <div className="p-5 rounded-3xl bg-white border border-[#F0E6F3] shadow-sm flex flex-col h-[520px]">
            <div className="flex items-center gap-2 pb-3 border-b border-[#F0E6F3]">
              <MessageSquare className="w-4 h-4 text-[#6F00FF]" />
              <h3 className="text-sm font-bold text-[#241A33]">Studio Discussion</h3>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs">
              {comments.length > 0 ? (
                comments.map((c) => {
                  const isMember = c.user_id === currentUserId;
                  const authorName = c.author?.full_name || (isMember ? "You" : "Studio Admin");
                  const isStudio = c.author?.role === "ADMIN" || !isMember;

                  return (
                    <div
                      key={c.id}
                      className={cn(
                        "flex flex-col max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed",
                        isMember
                          ? "ml-auto bg-gradient-to-r from-[#6F00FF] to-[#3B0270] text-white shadow-xs"
                          : "mr-auto bg-[#FAF7FC] border border-[#F0E6F3] text-[#241A33]"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1 text-[10px]">
                        <span
                          className={cn(
                            "font-bold",
                            isMember ? "text-[#E9B3FB]" : "text-[#6F00FF]"
                          )}
                        >
                          {authorName}
                          {isStudio && " (Studio)"}
                        </span>
                        <span className={isMember ? "text-white/70" : "text-[#837C8D]"}>
                          {new Date(c.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <p className="whitespace-pre-line">{c.content}</p>

                      {c.is_revision_note && (
                        <div
                          className={cn(
                            "mt-1.5 pt-1.5 border-t text-[10px] font-semibold flex items-center gap-1",
                            isMember
                              ? "border-white/20 text-[#E9B3FB]"
                              : "border-[#F0E6F3] text-[#D99516]"
                          )}
                        >
                          <AlertTriangle className="w-3 h-3" />
                          <span>Revision Note</span>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-xs text-[#837C8D]">
                  <p>No messages yet. Ask a question or post revision instructions.</p>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendComment} className="pt-3 border-t border-[#F0E6F3] flex gap-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Type message to agency team..."
                className="flex-1 h-10 px-3 bg-[#FAF7FC] border border-[#F0E6F3] rounded-2xl text-xs text-[#241A33] outline-none focus:border-[#6F00FF] focus:bg-white transition-all"
              />
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isSendingComment}
                className="bg-[#6F00FF] h-10 px-3.5"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>

          {/* Activity Timeline (Section 9) */}
          <div className="p-5 rounded-3xl bg-white border border-[#F0E6F3] shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#F0E6F3]">
              <History className="w-4 h-4 text-[#6F00FF]" />
              <h3 className="text-sm font-bold text-[#241A33]">Deliverable History</h3>
            </div>

            <div className="space-y-3 max-h-56 overflow-y-auto text-xs pr-1">
              {activity.map((act) => (
                <div key={act.id} className="flex items-start gap-2.5 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-[#6F00FF] mt-1.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-[#241A33]">
                      {act.action.replace(/_/g, " ")}
                    </p>
                    <span className="text-[10px] text-[#837C8D]">
                      {new Date(act.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Preview */}
      {previewModalUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative max-w-3xl w-full bg-white rounded-3xl p-4 shadow-2xl overflow-hidden">
            <button
              onClick={() => setPreviewModalUrl(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white shadow-md text-[#241A33] hover:text-[#6F00FF] z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative w-full h-[70vh] rounded-2xl overflow-hidden bg-[#FAF7FC]">
              <iframe
                src={previewModalUrl}
                className="w-full h-full border-0"
                title="Deliverable Preview"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
