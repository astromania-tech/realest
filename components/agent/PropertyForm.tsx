"use client"

import { useEffect, useState, ChangeEvent } from "react"
import { createPortal } from "react-dom"
import { AlertCircle, X } from "lucide-react"
import { Card } from "@heroui/react"
import { Button as BrandButton } from "@/components/ui/button"
import { listingFormError, listingFormErrorTitle } from "@/lib/listings/form-error"
import { Textarea, Input, Checkbox } from "../ui"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export type PropertyFormValues = {
  id?: string
  title: string
  description: string
  address: string
  state: string
  city: string
  property_type: string
  listing_type: string
  price: number
  price_frequency: string
  bedrooms?: number
  bathrooms?: number
  square_feet?: number
  year_built?: number
  parking_spaces?: number
  has_pool?: boolean
  has_garage?: boolean
  has_garden?: boolean
}

const LISTING_TYPE_OPTIONS = [
  { value: "for_sale", label: "For Sale" },
  { value: "for_rent", label: "For Rent" },
  { value: "for_lease", label: "For Lease" },
]

const PROPERTY_TYPES = [
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "bq", label: "BQ" },
  { value: "self_contained", label: "Self Contained" },
  { value: "land", label: "Land" },
  { value: "commercial", label: "Commercial" },
  { value: "warehouse", label: "Warehouse" },
  { value: "hotel", label: "Hotel" },
  { value: "short_let", label: "Short Let" },
  { value: "event_center", label: "Event Center" },
]

const PRICE_FREQ = [
  { value: "sale", label: "Outright Sale" },
  { value: "annual", label: "Per Year" },
  { value: "monthly", label: "Per Month" },
  { value: "nightly", label: "Per Night" },
]

/** Signup input tokens, with a soft edge so the box reads as a field. */
const fieldClass =
  "border border-foreground/15 bg-transparent text-foreground placeholder:text-muted-foreground shadow-xs " +
  "dark:border-foreground/25 dark:bg-input/30 " +
  "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"

const selectClass = `${fieldClass} h-9 w-full min-w-0 rounded-md px-3 py-1 text-base md:text-sm`

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", 
  "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", 
  "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", 
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
]

export function PropertyForm({ initial, mode, role = "agent" }: { initial?: Partial<PropertyFormValues>, mode: "create" | "edit", role?: "agent" | "owner" }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [stage, setStage] = useState(1)
  const [propertyId, setPropertyId] = useState<string | null>(initial?.id ?? null)
  
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [docFile, setDocFile] = useState<File | null>(null)
  const [docType, setDocType] = useState("title_deed")

  const [values, setValues] = useState<PropertyFormValues>({
    id: initial?.id ?? undefined,
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    address: initial?.address ?? "",
    state: initial?.state ?? "Lagos",
    city: initial?.city ?? "",
    property_type: initial?.property_type ?? "house",
    price: initial?.price ?? 0,
    price_frequency: (initial?.price_frequency as string) ?? "annual",
    listing_type: (initial?.listing_type as string) ?? "for_rent",
    bedrooms: initial?.bedrooms,
    bathrooms: initial?.bathrooms,
    square_feet: initial?.square_feet,
    year_built: initial?.year_built,
    parking_spaces: initial?.parking_spaces,
    has_pool: initial?.has_pool ?? false,
    has_garage: initial?.has_garage ?? false,
    has_garden: initial?.has_garden ?? false,
  })

  useEffect(() => {
    if (initial) {
      setValues((v) => ({ ...v, ...initial }))
    }
  }, [initial])

  const isLand = values.property_type === "land"
  const isCommercial = ["commercial", "warehouse", "event_center"].includes(values.property_type)

  const handleTextChange = (field: keyof PropertyFormValues) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues({ ...values, [field]: e.target.value })
  }

  const handleSelectChange = (field: keyof PropertyFormValues) => (e: ChangeEvent<HTMLSelectElement>) => {
    setValues({ ...values, [field]: e.target.value })
  }

  const handleNumberChange = (field: keyof PropertyFormValues) => (e: ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [field]: Number(e.target.value) })
  }

  function showFormError(message: string) {
    setFormError(message)
  }

  async function responseError(res: Response, fallback: string): Promise<string | null> {
    let body: unknown = null
    try {
      body = await res.json()
    } catch {
      body = null
    }
    return listingFormError(res.ok, body, fallback)
  }

  async function handleStage1() {
    setLoading(true)
    setFormError(null)
    try {
      const endpoint = mode === "create" && !propertyId ? "/api/dashboard/listings" : `/api/dashboard/listings/${propertyId || values.id}`
      const method = mode === "create" && !propertyId ? "POST" : "PUT"
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      })
      let body: unknown = null
      try {
        body = await res.json()
      } catch {
        body = null
      }
      const message = listingFormError(res.ok, body, "Failed to save property")
      if (message) {
        showFormError(message)
        return
      }
      const saved = body as { data?: { id?: string } }
      if (!propertyId) {
        if (!saved.data?.id) {
          showFormError("The listing did not return an id.")
          return
        }
        setPropertyId(saved.data.id)
      }
      setStage(2)
    } catch (err) {
      showFormError(err instanceof Error ? err.message : "Failed to save property")
    } finally {
      setLoading(false)
    }
  }

  async function handleStage2() {
    if (mediaFiles.length === 0) {
      setStage(3)
      return
    }
    setLoading(true)
    try {
      for (const file of mediaFiles) {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("media_type", "image")
        const res = await fetch(`/api/dashboard/listings/${propertyId}/media`, {
          method: "POST",
          body: formData,
        })
        const message = await responseError(res, "Failed to upload image")
        if (message) {
          showFormError(message)
          return
        }
      }
      setStage(3)
    } catch (err) {
      showFormError(err instanceof Error ? err.message : "Failed to upload image")
    } finally {
      setLoading(false)
    }
  }

  async function handleStage3() {
    if (!docFile) {
      if (!confirm("No documents uploaded. Your property may be rejected. Submit anyway?")) {
        return
      }
    } else {
      setLoading(true)
      try {
        const formData = new FormData()
        formData.append("file", docFile)
        formData.append("document_type", docType)
        const res = await fetch(`/api/dashboard/listings/${propertyId}/documents`, {
          method: "POST",
          body: formData,
        })
        const message = await responseError(res, "Failed to upload document")
        if (message) {
          showFormError(message)
          setLoading(false)
          return
        }
      } catch (err) {
        showFormError(err instanceof Error ? err.message : "Failed to upload document")
        setLoading(false)
        return
      }
    }

    try {
      setLoading(true)
      const res = await fetch(`/api/dashboard/listings/${propertyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "pending_ml_validation" })
      })
      const message = await responseError(res, "Failed to submit property")
      if (message) {
        showFormError(message)
        return
      }
      router.push(`/${role}/properties`)
    } catch (err) {
      showFormError(err instanceof Error ? err.message : "Failed to submit property")
    } finally {
      setLoading(false)
    }
  }

  const errorDialog = (
    <ListingErrorDialog message={formError} onClose={() => setFormError(null)} />
  )

  if (stage === 2) {
    return (
      <>
      <Card className="p-6 space-y-6">
        <h2 className="text-xl font-bold">Stage 2: Upload Property Media</h2>
        <p className="text-sm text-default-500">Add photos of your property.</p>
        
        <div>
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            onChange={(e) => {
              if (e.target.files) {
                setMediaFiles(Array.from(e.target.files))
              }
            }} 
            className={`${fieldClass} h-9 w-full rounded-md px-3 py-1 text-sm file:mr-4 file:inline-flex file:h-7 file:rounded-md file:border-0 file:bg-transparent file:px-3 file:text-sm file:font-medium file:text-foreground`}
          />
          {mediaFiles.length > 0 && (
            <p className="text-sm mt-2">{mediaFiles.length} files selected.</p>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <BrandButton variant="outline" onClick={() => setStage(1)} disabled={loading}>Back</BrandButton>
          <BrandButton variant="neon" onClick={handleStage2} disabled={loading}>
            {mediaFiles.length > 0 ? "Upload & Continue" : "Skip"}
          </BrandButton>
        </div>
      </Card>
      {errorDialog}
      </>
    )
  }

  if (stage === 3) {
    return (
      <>
      <Card className="p-6 space-y-6">
        <h2 className="text-xl font-bold">Stage 3: Upload Documents</h2>
        <p className="text-sm text-default-500">Upload a verification document to help us approve your property.</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Document Type</label>
            <select
              className={selectClass}
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
            >
              <option value="title_deed">Title Deed</option>
              <option value="survey_plan">Survey Plan</option>
              <option value="c_of_o">C of O</option>
              <option value="receipt">Receipt</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Select File</label>
            <input 
              type="file" 
              accept=".pdf,image/jpeg,image/png" 
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setDocFile(e.target.files[0])
                }
              }} 
              className={`${fieldClass} h-9 w-full rounded-md px-3 py-1 text-sm file:mr-4 file:inline-flex file:h-7 file:rounded-md file:border-0 file:bg-transparent file:px-3 file:text-sm file:font-medium file:text-foreground`}
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <BrandButton variant="outline" onClick={() => setStage(2)} disabled={loading}>Back</BrandButton>
          <BrandButton variant="neon" onClick={handleStage3} disabled={loading}>
            Submit for Review
          </BrandButton>
        </div>
      </Card>
      {errorDialog}
      </>
    )
  }

  return (
    <>
    <Card className="p-6 space-y-6">
      <h2 className="text-xl font-bold">Stage 1: Property Details</h2>

      <Input
        className={fieldClass}
        placeholder="e.g., 3 Bedroom Flat in Lekki"
        value={values.title}
        onChange={handleTextChange("title")}
        required
      />

      <Textarea
        className={fieldClass}
        placeholder="Describe your property..."
        value={values.description}
        onChange={handleTextChange("description")}
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          className={fieldClass}
          placeholder="Address"
          value={values.address}
          onChange={handleTextChange("address")}
          required
        />
        <div>
          <label className="block text-sm font-medium mb-1">State</label>
          <select
            className={selectClass}
            value={values.state}
            onChange={handleSelectChange("state")}
          >
            {NIGERIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <Input
          className={fieldClass}
          placeholder="City"
          value={values.city}
          onChange={handleTextChange("city")}
          required
        />
        <div>
          <label className="block text-sm font-medium mb-1">Property Type</label>
          <select
            className={selectClass}
            value={values.property_type}
            onChange={handleSelectChange("property_type")}
          >
            {PROPERTY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Listing Type</label>
          <select
            className={selectClass}
            value={values.listing_type}
            onChange={handleSelectChange("listing_type")}
          >
            {LISTING_TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <Input
          className={fieldClass}
          type="number"
          placeholder="Price (₦)"
          value={String(values.price)}
          onChange={handleNumberChange("price")}
          required
        />
        <div>
          <label className="block text-sm font-medium mb-1">Price Frequency</label>
          <select
            className={selectClass}
            value={values.price_frequency}
            onChange={handleSelectChange("price_frequency")}
          >
            {PRICE_FREQ.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {!isLand && !isCommercial && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 border-default-100">
          <Input
            className={fieldClass}
            type="number"
            placeholder="Bedrooms"
            value={values.bedrooms ? String(values.bedrooms) : ""}
            onChange={handleNumberChange("bedrooms")}
          />
          <Input
            className={fieldClass}
            type="number"
            placeholder="Bathrooms"
            value={values.bathrooms ? String(values.bathrooms) : ""}
            onChange={handleNumberChange("bathrooms")}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 border-default-100">
        <Input
          className={fieldClass}
          type="number"
          placeholder="Square Feet"
          value={values.square_feet ? String(values.square_feet) : ""}
          onChange={handleNumberChange("square_feet")}
        />
        <Input
          className={fieldClass}
          type="number"
          placeholder="Year Built"
          value={values.year_built ? String(values.year_built) : ""}
          onChange={handleNumberChange("year_built")}
        />
        <Input
          className={fieldClass}
          type="number"
          placeholder="Parking Spaces"
          value={values.parking_spaces ? String(values.parking_spaces) : ""}
          onChange={handleNumberChange("parking_spaces")}
        />
      </div>

      <div className="flex gap-4 border-t pt-4 border-default-100">
        <Checkbox checked={values.has_pool} onCheckedChange={(val) => setValues({ ...values, has_pool: val === true })}>Has Pool</Checkbox>
        <Checkbox checked={values.has_garage} onCheckedChange={(val) => setValues({ ...values, has_garage: val === true })}>Has Garage</Checkbox>
        <Checkbox checked={values.has_garden} onCheckedChange={(val) => setValues({ ...values, has_garden: val === true })}>Has Garden</Checkbox>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        {mode === "edit" && propertyId && (
          <BrandButton
            variant="outline"
            onClick={async () => {
              if (!confirm("Delete this property?")) return
              setLoading(true)
              try {
                const { error } = await supabase.from("properties").delete().eq("id", propertyId)
                if (error) {
                  showFormError(error.message)
                  return
                }
                router.push(`/${role}/properties`)
              } catch (err) {
                showFormError(err instanceof Error ? err.message : "Failed to delete property")
              } finally {
                setLoading(false)
              }
            }}
          >
            Delete
          </BrandButton>
        )}
        <BrandButton variant="neon" size="lg" onClick={handleStage1} disabled={loading} className="min-w-40">
          {loading ? "Saving..." : "Save & Continue"}
        </BrandButton>
      </div>
    </Card>
    {errorDialog}
    </>
  )
}

function ListingErrorDialog({ message, onClose }: { message: string | null; onClose: () => void }) {
  if (!message || typeof document === "undefined") return null
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-background/20 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-primary/10 to-secondary/20" />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-40 right-20 w-32 h-32 bg-secondary/10 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-primary/5 rounded-full blur-xl animate-pulse delay-500" />
      </div>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="listing-error-title"
        className="relative w-full max-w-md backdrop-blur-3xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 bg-background"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-surface/80 hover:bg-surface border border-border/30 flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="p-6 sm:p-8">
          <div className="text-center space-y-3 pt-2">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-linear-to-tl from-primary/20 to-accent/20 rounded-md">
              <AlertCircle className="w-7 h-7 text-accent/80" />
            </div>
            <h2 id="listing-error-title" className="text-2xl font-bold bg-linear-to-l from-primary to-accent bg-clip-text text-transparent">
              {listingFormErrorTitle(message)}
            </h2>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
          <BrandButton variant="neon" size="lg" onClick={onClose} className="mt-6 w-full">
            Close
          </BrandButton>
        </div>
      </div>
    </div>,
    document.body,
  )
}
