'use client';

import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxFiles?: number;
}

export default function ImageUploader({ images, onChange, maxFiles = 10 }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (images.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} images allowed`);
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      for (const file of Array.from(files)) {
        fd.append('files', file);
      }
      const res = await adminApi.post('/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const uploaded = res.data.data as Array<{ url: string; filename: string }>;
      onChange([...images, ...uploaded.map(u => u.url)]);
    } catch {
      alert('Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <label className="text-sm text-gray-600 block mb-1">Product Images</label>

      <div className="flex gap-2 flex-wrap">
        {images.map((url, i) => (
          <div key={i} className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border group">
            <img src={url} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {images.length < maxFiles && (
          <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors text-gray-400 hover:text-primary">
            {uploading ? (
              <span className="text-xs animate-pulse">Uploading...</span>
            ) : (
              <>
                <Upload size={20} />
                <span className="text-[10px] mt-0.5">Upload</span>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
              disabled={uploading}
            />
          </label>
        )}
      </div>

      <p className="text-[11px] text-gray-400">Upload up to {maxFiles} images (max 5MB each, JPEG/PNG/GIF/WebP/SVG)</p>
    </div>
  );
}
