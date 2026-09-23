"use client";

import React, { useState, useRef } from "react";
import Button from "./Button";
import { UploadCloud, File, FileText, Image as ImageIcon, X, Check } from "lucide-react";

export default function FileUpload({ onSubmit, loading }) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const supportedTypes = [".pdf", ".txt", ".png", ".jpg", ".jpeg"];

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (file) {
      onSubmit(file);
    }
  };

  const renderFileIcon = () => {
    if (!file) return <UploadCloud className="w-7 h-7 text-[#111111]" />;
    const ext = file.name?.split(".").pop().toLowerCase();
    if (["png", "jpg", "jpeg"].includes(ext)) {
      return <ImageIcon className="w-7 h-7 text-[#111111]" />;
    }
    if (["pdf", "txt"].includes(ext)) {
      return <FileText className="w-7 h-7 text-[#111111]" />;
    }
    return <File className="w-7 h-7 text-[#111111]" />;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border-2 border-[#111111] bg-white shadow-hard p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#111111]/20">
          <span className="font-mono-tech text-xs uppercase font-bold text-[#111111]">
            DOCUMENT OR SCREENSHOT EVIDENCE
          </span>
          <span className="font-mono-tech text-[10px] text-[#111111]/60">
            PDF • TXT • PNG • JPG • JPEG
          </span>
        </div>

        {/* Drag & Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !file && fileInputRef.current?.click()}
          className={`border-2 border-dashed p-8 sm:p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
            dragActive
              ? "border-[#111111] bg-[#B7FF3C]/30 scale-[0.99]"
              : file
              ? "border-[#111111] bg-[#F5F1E8]"
              : "border-[#111111]/60 bg-[#F5F1E8]/50 hover:bg-[#F5F1E8] hover:border-[#111111]"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            className="hidden"
            disabled={loading}
          />

          {file ? (
            <div className="space-y-3 flex flex-col items-center">
              <div className="w-14 h-14 bg-[#B7FF3C] border-2 border-[#111111] shadow-hard-xs flex items-center justify-center">
                {renderFileIcon()}
              </div>
              <div>
                <p className="font-display text-sm font-bold text-[#111111] max-w-xs truncate">
                  {file.name}
                </p>
                <p className="font-mono-tech text-xs text-[#111111]/70">
                  {(file.size / 1024).toFixed(1)} KB • READY FOR EXTRACTION
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="inline-flex items-center gap-1 font-mono-tech text-[11px] text-[#FF4D4D] hover:underline uppercase font-bold"
              >
                <X className="w-3.5 h-3.5" /> REMOVE FILE
              </button>
            </div>
          ) : (
            <div className="space-y-3 flex flex-col items-center">
              <div className="w-14 h-14 bg-white border-2 border-[#111111] shadow-hard-xs flex items-center justify-center">
                <UploadCloud className="w-7 h-7 text-[#111111]" />
              </div>
              <div className="space-y-1">
                <p className="font-display text-base font-bold text-[#111111] uppercase">
                  DROP EVIDENCE FILE HERE
                </p>
                <p className="font-mono-tech text-xs text-[#111111]/70">
                  Or click to browse from local workstation
                </p>
              </div>
              <div className="pt-1">
                <span className="inline-block px-3 py-1 bg-white border border-[#111111] font-mono-tech text-[11px] font-bold">
                  CHOOSE FILE
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="pt-3 border-t-2 border-[#111111] flex items-center justify-between">
          <div className="font-mono-tech text-[10px] text-[#111111]/60">
            AUTO OCR PARSING INCLUDED
          </div>
          <Button
            type="submit"
            variant="accent"
            size="md"
            loading={loading}
            disabled={!file}
            icon={UploadCloud}
          >
            ANALYZE FILE
          </Button>
        </div>
      </div>
    </form>
  );
}
