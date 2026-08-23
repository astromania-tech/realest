"use client"

import { useEffect, useState, ChangeEvent } from "react"
import { Button, Card, Select } from "@heroui/react"
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

  async function handleStage1() {
    setLoading(true)
    try {
      const endpoint = mode === "create" && !propertyId ? "/api/dashboard/listings" : `/api/dashboard/listings/${propertyId || values.id}`
      const method = mode === "create" && !propertyId ? "POST" : "PUT"
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Failed to save property")
      
      if (!propertyId) setPropertyId(result.data.id)
      setStage(2)
    } catch (err) {
      console.error(err)
      alert((err as Error).message)
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
        if (!res.ok) throw new Error("Failed to upload image")
      }
      setStage(3)
    } catch (err) {
      console.error(err)
      alert((err as Error).message)
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
        if (!res.ok) throw new Error("Failed to upload document")
      } catch (err) {
        console.error(err)
        alert((err as Error).message)
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
      if (!res.ok) throw new Error("Failed to submit property")
      router.push(`/${role}/properties`)
    } catch (err) {
      console.error(err)
      alert((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (stage === 2) {
    return (
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
            className="w-full text-sm text-default-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-600"
          />
          {mediaFiles.length > 0 && (
            <p className="text-sm mt-2">{mediaFiles.length} files selected.</p>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onPress={() => setStage(1)} isDisabled={loading}>Back</Button>
          <Button variant="primary" onPress={handleStage2} isDisabled={loading !== null}>
            {mediaFiles.length > 0 ? "Upload & Continue" : "Skip"}
          </Button>
        </div>
      </Card>
    )
  }

  if (stage === 3) {
    return (
      <Card className="p-6 space-y-6">
        <h2 className="text-xl font-bold">Stage 3: Upload Documents</h2>
        <p className="text-sm text-default-500">Upload a verification document to help us approve your property.</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Document Type</label>
            <select
              className="w-full rounded-md border border-default-200 bg-background px-3 py-2"
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
              className="w-full text-sm text-default-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-600"
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onPress={() => setStage(2)} isDisabled={loading}>Back</Button>
          <Button variant="primary" onPress={handleStage3} isDisabled={loading !== null}>
            Submit for Review
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 space-y-6">
      <h2 className="text-xl font-bold">Stage 1: Property Details</h2>

      <Input
        // label="Title"
        placeholder="e.g., 3 Bedroom Flat in Lekki"
        value={values.title}
        onChange={handleTextChange("title")}
        required
      />

      <Textarea
        // label="Description"
        placeholder="Describe your property..."
        value={values.description}
        onChange={handleTextChange("description")}
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          placeholder="Address"
          value={values.address}
          onChange={handleTextChange("address")}
          required
        />
        <div>
          <label className="block text-sm font-medium mb-1">State</label>
          <select
            className="w-full rounded-md border border-default-200 bg-background px-3 py-2"
            value={values.state}
            onChange={handleSelectChange("state")}
          >
            {NIGERIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <Input
          placeholder="City"
          value={values.city}
          onChange={handleTextChange("city")}
          required
        />
        <div>
          <label className="block text-sm font-medium mb-1">Property Type</label>
          <select
            className="w-full rounded-md border border-default-200 bg-background px-3 py-2"
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
            className="w-full rounded-md border border-default-200 bg-background px-3 py-2"
            value={values.listing_type}
            onChange={handleSelectChange("listing_type")}
          >
            {LISTING_TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <Input
          type="number"
          placeholder="Price (₦)"
          value={String(values.price)}
          onChange={handleNumberChange("price")}
          required
        />
        <div>
          <label className="block text-sm font-medium mb-1">Price Frequency</label>
          <select
            className="w-full rounded-md border border-default-200 bg-background px-3 py-2"
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
            type="number"
            placeholder="Bedrooms"
            value={values.bedrooms ? String(values.bedrooms) : ""}
            onChange={handleNumberChange("bedrooms")}
          />
          <Input
            type="number"
            placeholder="Bathrooms"
            value={values.bathrooms ? String(values.bathrooms) : ""}
            onChange={handleNumberChange("bathrooms")}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 border-default-100">
        <Input
          type="number"
          placeholder="Square Feet"
          value={values.square_feet ? String(values.square_feet) : ""}
          onChange={handleNumberChange("square_feet")}
        />
        <Input
          type="number"
          placeholder="Year Built"
          value={values.year_built ? String(values.year_built) : ""}
          onChange={handleNumberChange("year_built")}
        />
        <Input
          type="number"
          placeholder="Parking Spaces"
          value={values.parking_spaces ? String(values.parking_spaces) : ""}
          onChange={handleNumberChange("parking_spaces")}
        />
      </div>

      <div className="flex gap-4 border-t pt-4 border-default-100">
        <Checkbox checked={values.has_pool} onCheckedChange={(val) => setValues({ ...values, has_pool: val })}>Has Pool</Checkbox>
        <Checkbox checked={values.has_garage} onCheckedChange={(val) => setValues({ ...values, has_garage: val })}>Has Garage</Checkbox>
        <Checkbox checked={values.has_garden} onCheckedChange={(val) => setValues({ ...values, has_garden: val })}>Has Garden</Checkbox>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        {mode === "edit" && propertyId && (
          <Button
            variant="outline"
            onPress={async () => {
              if (!confirm("Delete this property?")) return
              setLoading(true)
              try {
                const { error } = await supabase.from("properties").delete().eq("id", propertyId)
                if (error) throw error
                router.push(`/${role}/properties`)
              } catch (err) {
                alert((err as Error).message)
              } finally {
                setLoading(false)
              }
            }}
          >
            Delete
          </Button>
        )}
        <Button variant="primary" onPress={handleStage1} isLoading={loading}>
          Save & Continue
        </Button>
      </div>
    </Card>
  )
}
