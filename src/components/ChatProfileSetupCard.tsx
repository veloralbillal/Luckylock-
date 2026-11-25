import {
  AtSign,
  Calendar,
  Camera,
  CheckCircle2,
  Mail,
  Phone,
  User as UserIcon,
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
    <div className="min-h-[calc(100vh-3.5rem)] w-full bg-gradient-to-b from-[#040B1F] via-[#071330] to-[#040B1F] text-white px-3.5 sm:px-6 py-6 sm:py-10 pb-28 md:pb-12">
      <div className="max-w-2xl mx-auto w-full rounded-[22px] border border-amber-400/40 bg-gradient-to-b from-[#111E44] via-[#0B1634] to-[#081026] overflow-hidden shadow-[0_16px_42px_rgba(0,0,0,0.55)]">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#1B2763] via-[#0E1A4A] to-[#081232] text-white px-5 sm:px-7 py-5 sm:py-6 border-b border-amber-400/25">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                {isFirstTime ? "First-Time Chat Setup" : "Chat Profile Settings"}
              </p>
              <h1 className="mt-1 text-xl sm:text-2xl font-extrabold text-white">
                {isFirstTime ? "Complete Your Chat Profile" : "Update Your Chat Profile"}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-blue-100/80">
                Set your profile photo, @username, name, date of birth, mobile number, and Gmail to
                search users &amp; agents, follow, and send friend requests.
              </p>
            </div>
            {!isFirstTime && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="min-h-[38px] px-3 py-1.5 rounded-xl border border-white/20 bg-white/10 text-xs font-semibold text-slate-100 hover:bg-white/15 cursor-pointer shrink-0"
              >
                Close
              </button>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-5">
          {/* Profile Photo Picker */}
          <div className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-blue-400/25 bg-[#071028]/90 p-4">
            <UserAvatar
              src={avatarUrl}
              name={fullName || username || "User"}
              size="xl"
              className="border-2 border-amber-400/80"
            />
            <div className="flex-1 text-center sm:text-left space-y-2 w-full">
              <div>
                <p className="text-sm font-bold text-white">Profile Photo</p>
                <p className="text-xs text-slate-300">
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
                  className="min-h-[40px] inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/45 text-amber-300 text-xs font-bold cursor-pointer transition-colors"
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
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 mb-1.5">
                <AtSign className="w-3.5 h-3.5 text-amber-400" />
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
                className="w-full min-h-[44px] rounded-xl border border-blue-400/30 bg-[#060E24] px-3.5 py-2 text-sm font-mono text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400"
              />
            </div>

            {/* Full Name */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 mb-1.5">
                <UserIcon className="w-3.5 h-3.5 text-amber-400" />
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
                className="w-full min-h-[44px] rounded-xl border border-blue-400/30 bg-[#060E24] px-3.5 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Date of Birth
              </label>
              <input
                type="date"
                required
                max={new Date().toISOString().slice(0, 10)}
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-blue-400/30 bg-[#060E24] px-3.5 py-2 text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 mb-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                Mobile Number
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full min-h-[44px] rounded-xl border border-blue-400/30 bg-[#060E24] px-3.5 py-2 text-sm font-mono text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400"
              />
            </div>
          </div>

          {/* Gmail */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 mb-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              Gmail / Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="yourname@gmail.com"
              className="w-full min-h-[44px] rounded-xl border border-blue-400/30 bg-[#060E24] px-3.5 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FDE047] via-[#FACC15] to-[#EAB308] hover:brightness-105 py-3 text-sm font-extrabold text-[#071128] shadow-[0_10px_26px_rgba(250,204,21,0.3)] transition-all cursor-pointer disabled:opacity-60"
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
