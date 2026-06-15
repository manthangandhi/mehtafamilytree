'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUpload({ value, onChange, label = 'Profile Picture' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const supabase = createClient();

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      onChange(data.publicUrl);
    } catch (error: any) {
      toast.error('Error uploading avatar: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="flex items-center gap-4">
        {value ? (
          <img src={value} alt="Avatar" className="w-16 h-16 rounded-full object-cover border border-border" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center text-xs text-muted">
            No Image
          </div>
        )}
        <div className="flex-1">
          <label className="cursor-pointer btn btn-secondary text-sm inline-flex">
            {uploading ? 'Uploading...' : 'Upload Image'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={uploadAvatar}
              disabled={uploading}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
