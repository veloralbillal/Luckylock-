import {
  Calendar,
  Camera,
  CheckCircle2,
  Mail,
  Phone,
  User as UserIcon,
  AtSign,
} from "lucide-react";
import React, { useRef, useState } from "react";
import { apiRequest } from "../lib/api";
import type { PublicUser } from "../types/lottery";
import { useToast } from "./ToastProvider";
import { UserAvatar } from "./UserAvatar";

interface ChatProfileSetupCardProps {
  user: PublicUser;
  isFirstTime: boolean;
  onCompleted: (updatedUser: PublicUser) => void;
  onCancel?: () => void;
}

function resizeImageFileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read selected image."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Unsupported image format."));
      img.onload = () => {
        const maxDim = 240;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not process image."));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  });
}

export function ChatProfileSetupCard({
  user,
  isFirstTime,
  onCompleted,
  onCancel,
}: ChatProfileSetupCardProps) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [username, setUsername] = useState(user.username || "");
  const [fullName, setFullName] = useState(user.fullName || "");
  const [dateOfBirth, setDateOfBirth] = useState(user.dateOfBirth || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [email, setEmail] = useState(user.email || "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file (JPG, PNG, WebP).", "error");
      return;
    }
    setUploadingPhoto(true);
    try {
      const compressed = await resizeImageFileToDataUrl(file);
      setAvatarUrl(compressed);
      showToast("Profile photo ready.", "info");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to load image.", "error");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiRequest<{ message: string; user: PublicUser }>(
        "/api/chat/profile-setup",
        {
          method: "PUT",
          body: {
            username: username.trim().replace(/^@+/, ""),
            fullName: fullName.trim(),
            dateOfBirth,
            phone: phone.trim(),
            email: email.trim(),
            avatarUrl,
          },
        }
      );
      showToast(res.message || "Chat profile saved!", "success");
      onCompleted(res.user);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not save profile.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 pb-24">
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-md">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#060D1E] via-[#0D1A36] to-[#132650] text-white px-5 sm:px-7 py-5 sm:py-6 border-b border-amber-400/25">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-amber-300 font-semibold">
                {isFirstTime ? "First-Time Chat Setup" : "Chat Profile Settings"}
              </p>
              <h1 className="mt-1 text-xl sm:text-2xl font-bold text-white">
                {isFirstTime ? "Complete Your Chat Profile" : "Update Your Chat Profile"}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-300">
                Set your profile photo, @username, name, date of birth, mobile number, and Gmail to search users &amp; agents, follow, and send friend requests.
              </p>
            </div>
            {!isFirstTime && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="min-h-[38px] px-3 py-1.5 rounded-lg border border-white/20 text-xs font-semibold text-slate-200 hover:bg-white/10 cursor-pointer shrink-0"
              >
                Close
              </button>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-5">
          {/* Profile Photo Picker */}
          <div className="flex flex-col sm:flex-row items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <UserAvatar
              src={avatarUrl}
              name={fullName || username || "User"}
              size="xl"
              className="border-2 border-amber-400/70"
            />
            <div className="flex-1 text-center sm:text-left space-y-2 w-full">
              <div>
                <p className="text-sm font-bold text-slate-900">Profile Photo</p>
                <p className="text-xs text-slate-500">
                  Upload a photo from your device or keep your avatar.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0D1A36] hover:bg-slate-900 text-amber-300 text-xs font-bold cursor-pointer transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  {uploadingPhoto ? "Processing..." : "Upload Photo"}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Username */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                <AtSign className="w-3.5 h-3.5 text-amber-600" />
                Username
              </label>
              <input
                type="text"
                required
                minLength={3}
                maxLength={32}
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s+/g, "_"))}
                placeholder="e.g. arif_99"
                className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
              />
            </div>

            {/* Full Name */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                <UserIcon className="w-3.5 h-3.5 text-amber-600" />
                Full Name
              </label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={100}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                Date of Birth
              </label>
              <input
                type="date"
                required
                max={new Date().toISOString().slice(0, 10)}
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-600" />
                Mobile Number
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Gmail */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-600" />
              Gmail / Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="yourname@gmail.com"
              className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 py-3 text-sm font-bold text-white transition-colors cursor-pointer disabled:opacity-60"
          >
            <CheckCircle2 className="w-4 h-4" />
            {submitting
              ? "Saving Chat Profile..."
              : isFirstTime
              ? "Save Profile & Enter Chat"
              : "Save Profile Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
