import { useState, useCallback } from 'react';

export interface UploadedFile {
  file: File;
  url: string;
  publicUrl: string;
  isUploading: boolean;
  error?: string;
  progress?: number;
}

export interface UseFileUploadOptions {
  bucket: 'property-media' | 'property-documents' | 'avatars';
  propertyId?: string;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  allowedTypes?: string[];
}

export interface UseFileUploadReturn {
  files: UploadedFile[];
  uploadFiles: (fileList: FileList | File[]) => Promise<void>;
  removeFile: (index: number) => void;
  isUploading: boolean;
  uploadProgress: number;
  errors: string[];
  clearErrors: () => void;
}

export function useFileUpload({
  bucket,
  propertyId,
  maxFiles = 20,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'doc/*', 'application/pdf'],
}: UseFileUploadOptions): UseFileUploadReturn {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const uploadFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const filesToUpload = Array.from(fileList);

      // Validation
      if (files.length + filesToUpload.length > maxFiles) {
        setErrors((prev) => [
          ...prev,
          `Maximum ${maxFiles} files allowed. You're trying to upload ${files.length + filesToUpload.length} files.`,
        ]);
        return;
      }

      const validationErrors: string[] = [];
      const validFiles: File[] = [];

      filesToUpload.forEach((file) => {
        if (file.size > maxFileSize) {
          validationErrors.push(
            `${file.name} exceeds ${maxFileSize / (1024 * 1024)}MB limit`
          );
        } else if (!allowedTypes.includes(file.type)) {
          validationErrors.push(
            `${file.name} is not an allowed file type. Allowed: ${allowedTypes.join(', ')}`
          );
        } else {
          validFiles.push(file);
        }
      });

      if (validationErrors.length > 0) {
        setErrors((prev) => [...prev, ...validationErrors]);
        return;
      }

      setIsUploading(true);
      setErrors([]);

      try {
        const uploadPromises = validFiles.map(async (file) => {
          // Add file to state with uploading status
          const tempFile: UploadedFile = {
            file,
            url: '',
            publicUrl: '',
            isUploading: true,
          };

          setFiles((prev) => [...prev, tempFile]);

          try {
            // Step 1: Get signed URL
            const signedUrlResponse = await fetch('/api/upload/signed-url', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                file_name: file.name,
                file_type: file.type,
                file_size: file.size,
                bucket,
                property_id: propertyId,
              }),
            });

            if (!signedUrlResponse.ok) {
              const errorData = await signedUrlResponse.json();
              throw new Error(errorData.error || 'Failed to get upload URL');
            }

            const { signed_url, public_url, file_path } =
              await signedUrlResponse.json();

            // Step 2: Upload file to signed URL
            const uploadResponse = await fetch(signed_url, {
              method: 'PUT',
              body: file,
              headers: {
                'Content-Type': file.type,
              },
            });

            if (!uploadResponse.ok) {
              throw new Error('Failed to upload file');
            }

            // Update file with success
            setFiles((prev) =>
              prev.map((f) =>
                f.file === file
                  ? {
                      ...f,
                      url: file_path,
                      publicUrl: public_url,
                      isUploading: false,
                    }
                  : f
              )
            );

            return public_url;
          } catch (error) {
            // Update file with error
            setFiles((prev) =>
              prev.map((f) =>
                f.file === file
                  ? {
                      ...f,
                      isUploading: false,
                      error:
                        error instanceof Error
                          ? error.message
                          : 'Upload failed',
                    }
                  : f
              )
            );

            throw error;
          }
        });

        await Promise.all(uploadPromises);
      } catch (error) {
        console.error('Upload error:', error);
        setErrors((prev) => [
          ...prev,
          error instanceof Error ? error.message : 'Upload failed',
        ]);
      } finally {
        setIsUploading(false);
      }
    },
    [files, bucket, propertyId, maxFiles, maxFileSize, allowedTypes]
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const uploadProgress = files.length > 0
    ? (files.filter((f) => !f.isUploading).length / files.length) * 100
    : 0;

  return {
    files,
    uploadFiles,
    removeFile,
    isUploading,
    uploadProgress,
    errors,
    clearErrors,
  };
}
