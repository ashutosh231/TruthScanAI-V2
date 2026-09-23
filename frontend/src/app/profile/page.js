"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import ErrorState from "@/components/ErrorState";
import { uploadAvatar, updateProfile } from "@/lib/api";
import {
  User,
  Camera,
  Mail,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  LogOut,
  Upload,
} from "lucide-react";

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [editingName, setEditingName] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handlePhotoSelect = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadingPhoto(true);
      setError(null);
      setMessage(null);

      try {
        const res = await uploadAvatar(file);
        if (res.data?.avatar) {
          updateUser({ avatar: res.data.avatar });
          setMessage("Profile photo uploaded to Cloudinary successfully.");
          setTimeout(() => setMessage(null), 3500);
        }
      } catch (err) {
        setError(err.message || "Failed to upload profile photo to Cloudinary.");
      } finally {
        setUploadingPhoto(false);
      }
    }
  };

  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSavingName(true);
    setError(null);
    try {
      const res = await updateProfile({ name: name.trim() });
      if (res.data?.name) {
        updateUser({ name: res.data.name });
        setEditingName(false);
        setMessage("Name updated successfully.");
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      setError(err.message || "Failed to update profile name.");
    } finally {
      setSavingName(false);
    }
  };

  return (
    <AuthGuard fallbackMessage="Please sign in to access your investigator profile and customize your clearance photo.">
      <div className="max-w-3xl mx-auto space-y-8 pb-16">
        {/* Header */}
        <div className="border-b-2 border-[#111111] pb-6 space-y-2">
          <div className="inline-flex items-center gap-2 font-mono-tech text-xs uppercase font-bold text-[#111111]">
            <ShieldCheck className="w-4 h-4 text-[#111111]" />
            <span>INVESTIGATOR CREDENTIALS</span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl uppercase tracking-tighter text-[#111111]">
            MY PROFILE
          </h1>
          <p className="font-mono-tech text-xs sm:text-sm text-[#111111]/80 max-w-xl">
            Manage your authenticated clearance identity, Cloudinary profile avatar, and active detection tier.
          </p>
        </div>

        {message && (
          <div className="p-3 bg-[#B7FF3C] border-2 border-[#111111] shadow-hard-xs font-mono-tech text-xs font-bold text-[#111111] flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <ErrorState
            title="PROFILE ACTION ERROR"
            message={error}
            onRetry={() => setError(null)}
          />
        )}

        {/* Profile Card */}
        <div className="border-3 border-[#111111] bg-white shadow-hard-lg p-6 sm:p-8 space-y-8">
          {/* Avatar & Identity Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b-2 border-[#111111]">
            {/* Avatar Preview with Camera Overlay */}
            <div className="relative group shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-none border-3 border-[#111111] bg-[#F5F1E8] shadow-hard overflow-hidden flex items-center justify-center">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || "Investigator"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#E8E2D5] text-[#111111]">
                    <User className="w-12 h-12 stroke-[1.5]" />
                    <span className="font-mono-tech text-[10px] uppercase font-bold mt-1">
                      NO AVATAR
                    </span>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
                disabled={uploadingPhoto}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute -bottom-2 -right-2 p-2 bg-[#B7FF3C] text-[#111111] border-2 border-[#111111] shadow-hard-xs hover:bg-[#a6eb29] cursor-pointer transition-colors"
                title="Upload photo to Cloudinary"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* User Meta */}
            <div className="space-y-3 text-center sm:text-left flex-1">
              <div className="space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h2 className="font-display text-2xl sm:text-3xl uppercase tracking-tight text-[#111111]">
                    {user?.name || "INVESTIGATOR"}
                  </h2>
                  <Badge
                    variant={user?.isPremium ? "lime" : "default"}
                    size="sm"
                  >
                    {user?.isPremium ? "PREMIUM CLEARANCE" : "FREE CLEARANCE"}
                  </Badge>
                </div>
                <p className="font-mono-tech text-xs text-[#111111]/70 flex items-center justify-center sm:justify-start gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#111111]" />
                  <span>{user?.email}</span>
                </p>
              </div>

              {/* Photo Upload Hint */}
              <div className="pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  loading={uploadingPhoto}
                  icon={Upload}
                >
                  {uploadingPhoto ? "UPLOADING TO CLOUDINARY..." : "CHANGE PHOTO (CLOUDINARY)"}
                </Button>
              </div>
            </div>
          </div>

          {/* Edit Name Form */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono-tech text-xs uppercase font-bold text-[#111111]">
                OFFICIAL CODENAME / DISPLAY NAME
              </span>
              {!editingName && (
                <button
                  type="button"
                  onClick={() => {
                    setName(user?.name || "");
                    setEditingName(true);
                  }}
                  className="font-mono-tech text-xs font-bold underline text-[#111111] cursor-pointer"
                >
                  EDIT NAME
                </button>
              )}
            </div>

            {editingName ? (
              <form onSubmit={handleSaveName} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 p-2 font-mono-tech text-sm bg-[#F5F1E8] border-2 border-[#111111] focus:outline-none"
                />
                <Button
                  type="submit"
                  variant="accent"
                  size="sm"
                  loading={savingName}
                >
                  SAVE
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingName(false)}
                >
                  CANCEL
                </Button>
              </form>
            ) : (
              <div className="p-3 bg-[#F5F1E8] border-2 border-[#111111] font-mono-tech text-sm text-[#111111] font-bold">
                {user?.name || "Not specified"}
              </div>
            )}
          </div>

          {/* Account Details Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 border-2 border-[#111111] bg-[#F5F1E8] space-y-1">
              <span className="font-mono-tech text-[10px] text-[#111111]/60 uppercase font-bold">
                MEMBERSHIP TIER
              </span>
              <div className="flex items-center justify-between">
                <span className="font-display text-lg uppercase text-[#111111]">
                  {user?.isPremium ? "PREMIUM (₹200/MO)" : "FREE (5 CHECKS/DAY)"}
                </span>
                {!user?.isPremium && (
                  <Link href="/plans">
                    <Button variant="accent" size="sm" icon={Sparkles}>
                      UPGRADE
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            <div className="p-4 border-2 border-[#111111] bg-[#F5F1E8] space-y-1">
              <span className="font-mono-tech text-[10px] text-[#111111]/60 uppercase font-bold">
                CLEARANCE VERIFICATION
              </span>
              <div className="flex items-center gap-2 pt-1 font-mono-tech text-xs font-bold text-[#111111]">
                <CheckCircle2 className="w-4 h-4 text-[#75D66A]" />
                <span>EMAIL OTP CONFIRMED</span>
              </div>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="pt-4 border-t-2 border-[#111111] flex flex-wrap items-center justify-between gap-4">
            <Link href="/dashboard">
              <Button variant="primary" size="md" icon={ArrowRight}>
                MY TELEMETRY DASHBOARD
              </Button>
            </Link>
            <Button
              variant="danger"
              size="md"
              onClick={logout}
              icon={LogOut}
            >
              LOGOUT SESSION
            </Button>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
