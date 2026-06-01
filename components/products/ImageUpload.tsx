'use client'
import { useState, useCallback } from 'react'
import Image from 'next/image'
import { Upload, X, Star, Loader2, ImagePlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'

interface UploadedImage {
  id?: string
  url: string
  alt_text: string
  is_primary: boolean
  file?: File
  uploading?: boolean
}

interface ImageUploadProps {
  productId?: string
  images: UploadedImage[]
  onChange: (images: UploadedImage[]) => void
}

export function ImageUpload({ productId, images, onChange }: ImageUploadProps) {
  const [dragging, setDragging] = useState(false)
  const supabase = createClient()

  const uploadFile = async (file: File): Promise<string | null> => {
    const ext = file.name.split('.').pop()
    const path = `products/${productId ?? 'temp'}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { data, error } = await supabase.storage.from('product-images').upload(path, file, { upsert: false })
    if (error) { toast.error(`Upload failed: ${error.message}`); return null }
    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(data.path)
    return publicUrl
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return
    const newImages: UploadedImage[] = []
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) { toast.error(`${file.name} is not an image`); continue }
      if (file.size > 10 * 1024 * 1024) { toast.error(`${file.name} exceeds 10MB`); continue }
      // Preview immediately
      const preview = URL.createObjectURL(file)
      newImages.push({ url: preview, alt_text: file.name.replace(/\.[^.]+$/, ''), is_primary: images.length === 0 && newImages.length === 0, file, uploading: true })
    }
    const updated = [...images, ...newImages]
    onChange(updated)

    // Upload in background
    for (let i = 0; i < newImages.length; i++) {
      const idx = images.length + i
      const file = newImages[i].file!
      const url = await uploadFile(file)
      if (url) {
        updated[idx] = { ...updated[idx], url, uploading: false, file: undefined }
        onChange([...updated])
        toast.success('Image uploaded')
      } else {
        updated.splice(idx, 1)
        onChange([...updated])
      }
    }
  }

  const remove = (i: number) => {
    const updated = images.filter((_, idx) => idx !== i)
    if (images[i].is_primary && updated.length > 0) updated[0].is_primary = true
    onChange(updated)
  }

  const setPrimary = (i: number) => {
    onChange(images.map((img, idx) => ({ ...img, is_primary: idx === i })))
  }

  const setAlt = (i: number, alt: string) => {
    onChange(images.map((img, idx) => idx === i ? { ...img, alt_text: alt } : img))
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [images])

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-none p-8 text-center transition-all cursor-pointer ${
          dragging ? 'border-[#C9A84C] bg-[rgba(201,168,76,0.05)]' : 'border-[rgba(42,36,32,0.15)] hover:border-[#C9A84C] hover:bg-[rgba(201,168,76,0.02)]'
        }`}
        onClick={() => document.getElementById('image-upload-input')?.click()}
      >
        <input id="image-upload-input" type="file" multiple accept="image/*" className="hidden"
          onChange={e => handleFiles(e.target.files)} />
        <ImagePlus size={32} className="mx-auto mb-3 text-[#C9A84C] opacity-60" />
        <p className="text-[12px] text-[#6B5E4A] font-medium">Drop images here or click to browse</p>
        <p className="text-[10px] text-[#9A8A7A] mt-1">JPG, PNG, WebP up to 10MB each</p>
      </div>

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {images.map((img, i) => (
            <div key={i} className={`relative group border-2 transition-all ${img.is_primary ? 'border-[#C9A84C]' : 'border-[rgba(42,36,32,0.1)] hover:border-[rgba(201,168,76,0.4)]'}`}>
              {/* Image */}
              <div className="aspect-square bg-[#F5F2EE] overflow-hidden">
                {img.uploading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 size={20} className="animate-spin text-[#C9A84C]" />
                  </div>
                ) : (
                  <img src={img.url} alt={img.alt_text} className="w-full h-full object-cover" />
                )}
              </div>

              {/* Primary badge */}
              {img.is_primary && (
                <div className="absolute top-1 left-1 bg-[#C9A84C] text-white text-[7px] tracking-[1px] uppercase px-1.5 py-0.5 font-bold">
                  Primary
                </div>
              )}

              {/* Actions overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!img.is_primary && (
                  <button type="button" onClick={() => setPrimary(i)} title="Set as primary"
                    className="w-7 h-7 bg-[#C9A84C] text-white rounded-full flex items-center justify-center hover:bg-[#9A7A35] transition-colors">
                    <Star size={12} />
                  </button>
                )}
                <button type="button" onClick={() => remove(i)} title="Remove"
                  className="w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                  <X size={12} />
                </button>
              </div>

              {/* Alt text */}
              <input value={img.alt_text} onChange={e => setAlt(i, e.target.value)}
                placeholder="Alt text"
                className="w-full text-[9px] px-2 py-1 border-t border-[rgba(42,36,32,0.1)] bg-white outline-none focus:bg-[rgba(201,168,76,0.04)] text-[#6B5E4A]" />
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <p className="text-[9px] text-[#9A8A7A]">
          ★ Hover and click star to set primary image · Click × to remove
        </p>
      )}
    </div>
  )
}
