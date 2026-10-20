"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function FieldCheckIn({ propertyId, address }: { propertyId: string; address: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [sawBuilding, setSawBuilding] = useState(false);
  const [addressMatches, setAddressMatches] = useState(false);
  const [documentMatches, setDocumentMatches] = useState(false);
  const [photo, setPhoto] = useState("");

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    const bytes = new Uint8Array(await file.arrayBuffer());
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    setPhoto(btoa(binary));
  }

  function submit() {
    if (!navigator.geolocation) {
      setError("This phone has no GPS. Check-in stays closed.");
      return;
    }
    setPending(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const response = await fetch(`/api/admin/validation/vetting/${propertyId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "check_in",
            notes: note,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy_meters: position.coords.accuracy,
            location_source: "device",
            photo_base64: photo,
            saw_building: sawBuilding,
            address_matches: addressMatches,
            document_matches: documentMatches,
          }),
        });
        const body = await response.json().catch(() => ({}));
        setPending(false);
        if (!response.ok) {
          setError(body.error || "The check-in was refused.");
          return;
        }
        router.push("/admin/validation/vetting");
        router.refresh();
      },
      () => {
        setPending(false);
        setError("The phone did not share its GPS. Typed coordinates are refused.");
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-4 px-4 py-8">
      <h1 className="font-heading text-2xl text-[#07402F]">Check in at the pin</h1>
      <p className="text-sm text-muted-foreground">{address}</p>
      <p className="text-sm">Use this phone's GPS. There is no place to type a coordinate.</p>
      <Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="What you see at the gate, including the address." className="min-h-28" />
      <input className="text-sm" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={(event) => void onPhoto(event.target.files?.[0])} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={sawBuilding} onChange={(event) => setSawBuilding(event.target.checked)} />
        I see the building
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={addressMatches} onChange={(event) => setAddressMatches(event.target.checked)} />
        The address matches the listing
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={documentMatches} onChange={(event) => setDocumentMatches(event.target.checked)} />
        The document matches this place
      </label>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button className="h-12 bg-brand-accent text-[#07402F] hover:bg-brand-accent/90" disabled={pending || !photo || !note.trim()} onClick={submit}>
        Save this step
      </Button>
    </div>
  );
}
