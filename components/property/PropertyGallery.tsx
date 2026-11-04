"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PropertyMedia {
  id: string
  media_url: string
  file_name: string
  is_featured: boolean
}

interface PropertyGalleryProps {
  media: PropertyMedia[]
  title: string
}

export default function PropertyGallery({ media, title }: PropertyGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1))
  }

  if (media.length === 0) {
    return (
      <div className="w-full h-96 bg-gradient-to-br from-slate-400 to-slate-600 rounded-lg flex items-center justify-center">
        <p className="text-white text-lg">No images available</p>
      </div>
    )
  }

  const currentImage = media[currentIndex]

  return (
    <div className="space-y-4">
      <div className="relative w-full h-96 bg-muted rounded-lg overflow-hidden group">
        <img
          src={currentImage.media_url || "/placeholder.svg"}
          alt={currentImage.file_name}
          className="w-full h-full object-cover"
        />

        {media.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={goToPrevious}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={goToNext}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </>
        )}

        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
          {currentIndex + 1} / {media.length}
        </div>
      </div>

      {media.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {media.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex ? "border-primary" : "border-transparent"
              }`}
            >
              <img
                src={item.media_url || "/placeholder.svg"}
                alt={item.file_name}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
