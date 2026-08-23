'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Cropper, { type Area, type Point } from 'react-easy-crop'
import { Avatar } from '@heroui/react'
import {
  Camera,
  Check,
  Expand,
  ImagePlus,
  Move,
  RefreshCcw,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUser } from '@/lib/hooks/useUser'
import { RealEstButton } from '@/components/heroui/RealEstButton'

interface ProfileUploadProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  imageUrl?: string | null
  onUploadSuccess?: (avatarUrl: string) => void
  onUploadError?: (error: string) => void
}

const sizeClasses = {
  sm: 'size-8',
  md: 'size-12',
  lg: 'size-16',
  xl: 'size-24',
}

const iconSizes = {
  sm: 'size-3',
  md: 'size-4',
  lg: 'size-5',
  xl: 'size-6',
}

const CROPPER_SIZE = 360
const OUTPUT_SIZE = 1024
const MAX_UPLOAD_SIZE = 10 * 1024 * 1024
const MIN_ZOOM = 1
const MAX_ZOOM = 3
const ZOOM_STEP = 0.01

type CropSession = {
  src: string
  fileName: string
  fileType: string
}

function createImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

async function getCroppedFile(
  imageSrc: string,
  croppedAreaPixels: Area,
  fileName: string,
  fileType: string,
): Promise<File | null> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  canvas.width = OUTPUT_SIZE
  canvas.height = OUTPUT_SIZE

  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    OUTPUT_SIZE,
    OUTPUT_SIZE,
  )

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((result) => resolve(result), 'image/png', 0.98)
  })

  if (!blob) return null

  const baseName = fileName.replace(/\.[^.]+$/, '') || 'avatar'
  return new File([blob], `${baseName}-cropped.png`, { type: 'image/png' })
}

export function ProfileUpload({
  size = 'md',
  className,
  imageUrl,
  onUploadSuccess,
  onUploadError,
}: ProfileUploadProps) {
  const { user, profile } = useUser()
  const [isUploading, setIsUploading] = useState(false)
  const [displayUrl, setDisplayUrl] = useState<string | null>(imageUrl || profile?.avatar_url || null)
  const [cropSession, setCropSession] = useState<CropSession | null>(null)
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isCropperOpen, setIsCropperOpen] = useState(false)
  const [isProcessingCrop, setIsProcessingCrop] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const objectUrlRef = useRef<string | null>(null)

  useEffect(() => {
    if (imageUrl) {
      setDisplayUrl(imageUrl)
      return
    }

    if (profile?.avatar_url) {
      setDisplayUrl(profile.avatar_url)
    }
  }, [imageUrl, profile?.avatar_url])

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
      }
    }
  }, [])

  const avatarUrl = displayUrl || profile?.avatar_url
  const getAvatarFallback = () =>
    profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'

  const closeCropper = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }

    setCropSession(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
    setIsCropperOpen(false)
    setIsProcessingCrop(false)
  }

  const openCropper = (file: File) => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
    }

    const src = URL.createObjectURL(file)
    objectUrlRef.current = src
    setCropSession({
      src,
      fileName: file.name,
      fileType: file.type,
    })
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
    setIsCropperOpen(true)
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      onUploadError?.('Please select an image file')
      return
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      onUploadError?.('File size must be 10MB or less')
      return
    }

    openCropper(file)
  }

  const uploadAvatar = async (file: File, previewUrl?: string | null) => {
    if (!user?.id) {
      onUploadError?.('User not authenticated')
      return
    }

    setIsUploading(true)

    const tempPreviewUrl = previewUrl || null

    try {
      const response = await fetch('/api/upload/signed-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bucket: 'avatars',
          file_name: `${user.id}-${Date.now()}.${file.name.split('.').pop()}`,
          file_type: file.type,
          file_size: file.size,
          user_id: user.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate upload URL')
      }

      const { signed_url, public_url } = await response.json()

      const uploadResponse = await fetch(signed_url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload avatar')
      }

      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const now = new Date().toISOString()

      const { error: profileSeedError } = await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email || '',
        avatar_url: public_url,
        updated_at: now,
      })

      if (profileSeedError) {
        throw new Error('Failed to initialize profile')
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: public_url, updated_at: now })
        .eq('id', user.id)

      if (updateError) {
        throw new Error('Failed to update profile')
      }

      if (tempPreviewUrl && tempPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(tempPreviewUrl)
      }

      setDisplayUrl(public_url)
      onUploadSuccess?.(public_url)
    } catch (error) {
      console.error('Avatar upload error:', error)
      onUploadError?.(error instanceof Error ? error.message : 'Upload failed')
      if (tempPreviewUrl && tempPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(tempPreviewUrl)
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleCropComplete = (_croppedArea: Area, croppedAreaPixelsValue: Area) => {
    setCroppedAreaPixels(croppedAreaPixelsValue)
  }

  const handleCropConfirm = async () => {
    if (!cropSession || !croppedAreaPixels) {
      onUploadError?.('Position the image before applying the crop')
      return
    }

    setIsProcessingCrop(true)

    try {
      const croppedFile = await getCroppedFile(
        cropSession.src,
        croppedAreaPixels,
        cropSession.fileName,
        cropSession.fileType,
      )

      if (!croppedFile) {
        throw new Error('Failed to crop image')
      }

      const localPreviewUrl = URL.createObjectURL(croppedFile)
      setDisplayUrl(localPreviewUrl)
      closeCropper()
      await uploadAvatar(croppedFile, localPreviewUrl)
    } catch (error) {
      console.error('Crop error:', error)
      onUploadError?.(error instanceof Error ? error.message : 'Crop failed')
      closeCropper()
    } finally {
      setIsProcessingCrop(false)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemovePreview = () => {
    setDisplayUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const resetCrop = () => {
    setCrop({ x: 0, y: 0 })
    setZoom(1)
  }

  const avatarShellClasses = useMemo(
    () =>
      cn(
        'relative rounded-full border-2 border-border/50 overflow-hidden cursor-pointer group',
        'transition-all duration-300 hover:border-brand-accent/50 hover:shadow-lg',
        sizeClasses[size],
      ),
    [size],
  )

  return (
    <div className={cn('relative inline-block', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className={avatarShellClasses} onClick={handleClick}>
        <Avatar className={cn('w-full h-full', sizeClasses[size])}>
          {avatarUrl && (
            <Avatar.Image
              alt={profile?.full_name || 'User'}
              className="rounded-full object-cover"
              src={avatarUrl}
            />
          )}
          <Avatar.Fallback delayMs={600}>
            <div className="flex h-full w-full items-center justify-center rounded-full border bg-muted-foreground/10">
              {getAvatarFallback()}
            </div>
          </Avatar.Fallback>
        </Avatar>

        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100',
            isUploading && 'opacity-100',
          )}
        >
          {isUploading ? (
            <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Camera className={cn('text-white', iconSizes[size])} />
          )}
        </div>

        {displayUrl && !isUploading && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleRemovePreview()
            }}
            className={cn(
              'absolute -right-1 -top-1 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm transition-colors hover:bg-destructive/90',
              size === 'sm' ? 'size-4' : size === 'md' ? 'size-5' : 'size-6',
            )}
          >
            <X className={size === 'sm' ? 'size-2.5' : 'size-3'} />
          </button>
        )}
      </div>

      {size === 'xl' && (
        <div className="mt-2 text-center">
          <RealEstButton
            variant="ghost"
            size="sm"
            onClick={handleClick}
            disabled={isUploading}
            className="text-xs"
          >
            <Upload className="mr-1 size-3" />
            {isUploading ? 'Uploading...' : 'Change Photo'}
          </RealEstButton>
        </div>
      )}

      {isCropperOpen && cropSession && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-background shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-border/50 bg-linear-to-r from-primary/5 via-background to-accent/5 px-5 py-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <ImagePlus className="size-4" />
                  Avatar editor
                </div>
                <h3 className="mt-1 text-xl font-semibold text-foreground">Crop your profile photo</h3>
                <p className="text-sm text-muted-foreground">
                  Square crop, smooth zoom, consistent output for every source image.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCropper}
                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="grid gap-0 lg:grid-cols-[1.6fr_0.9fr]">
              <div className="relative bg-black px-4 py-4 sm:px-6 sm:py-6">
                <div
                  className="relative mx-auto overflow-hidden rounded-[1.5rem] border border-white/10 bg-black shadow-inner"
                  style={{ width: '100%', maxWidth: CROPPER_SIZE * 1.15, aspectRatio: '1 / 1' }}
                >
                  <Cropper
                    image={cropSession.src}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="rect"
                    showGrid={false}
                    objectFit="cover"
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={handleCropComplete}
                    minZoom={MIN_ZOOM}
                    maxZoom={MAX_ZOOM}
                    restrictPosition={false}
                    classes={{
                      containerClassName: 'rounded-[1.5rem]',
                      mediaClassName: 'select-none',
                      cropAreaClassName:
                        'border border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.18)]',
                    }}
                  />

                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0,transparent_42%,rgba(0,0,0,0.18)_100%)]" />
                  <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1 text-xs text-white/90 backdrop-blur-sm">
                    Drag to reposition
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Move className="size-4" />
                    Use the slider to zoom and drag the photo into place.
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={resetCrop}
                      className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      <RefreshCcw className="size-4" />
                      Reset
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2 rounded-2xl border border-border/50 bg-surface/60 p-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-2 font-medium text-foreground">
                      <ZoomOut className="size-4" />
                      Zoom out
                    </span>
                    <span className="flex items-center gap-2 font-medium text-foreground">
                      Zoom in
                      <ZoomIn className="size-4" />
                    </span>
                  </div>
                  <input
                    type="range"
                    min={MIN_ZOOM}
                    max={MAX_ZOOM}
                    step={ZOOM_STEP}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary"
                  />
                </div>
              </div>

              <div className="border-t border-border/50 bg-background p-5 lg:border-l lg:border-t-0">
                <div className="rounded-2xl border border-border/50 bg-linear-to-br from-primary/5 to-accent/5 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Expand className="size-4 text-primary" />
                    Live preview
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="relative size-40 overflow-hidden rounded-full border-4 border-background shadow-xl">
                      <img
                        src={cropSession.src}
                        alt="Crop preview"
                        className="h-full w-full object-cover"
                        style={{
                          transform: `translate(${crop.x * 2}px, ${crop.y * 2}px) scale(${zoom})`,
                        }}
                      />
                      <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/20" />
                    </div>
                  </div>
                  <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">
                    This preview matches the final avatar output so you know exactly how it will look.
                  </p>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl border border-border/50 bg-muted/30 p-4 text-sm text-muted-foreground">
                    Use the crop box to frame your face or logo. We export a square avatar at high resolution so it stays sharp everywhere.
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <RealEstButton variant="ghost" onClick={closeCropper} type="button" className="sm:min-w-28">
                      Cancel
                    </RealEstButton>
                    <RealEstButton
                      variant="default"
                      onClick={handleCropConfirm}
                      type="button"
                      disabled={isProcessingCrop || isUploading}
                      className="sm:min-w-36"
                    >
                      <Check className="mr-2 size-4" />
                      {isProcessingCrop || isUploading ? 'Processing...' : 'Apply crop'}
                    </RealEstButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function ProfileAvatarUpload(props: Omit<ProfileUploadProps, 'size'>) {
  return <ProfileUpload size='xl' {...props} />
}

export function ProfileAvatarSmall(props: Omit<ProfileUploadProps, 'size'>) {
  return <ProfileUpload size='sm' {...props} />
}
