"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { FileText, AlertCircle, CheckCircle } from "lucide-react"

interface Document {
  id: string
  document_type: string
  file_name: string
  verification_status: string
  created_at: string
  properties: { title: string; owner_id: string }
}

interface AdminDocumentVerificationProps {
  documents: Document[]
}

export default function AdminDocumentVerification({ documents }: AdminDocumentVerificationProps) {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleVerify = async (documentId: string, status: "verified" | "rejected") => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("property_documents")
        .update({
          verification_status: status,
          verified_at: new Date().toISOString(),
          notes: notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", documentId)

      if (error) throw error

      // Reset form
      setSelectedDocument(null)
      setNotes("")
      alert(`Document ${status} successfully!`)
    } catch (error) {
      alert("Error updating document verification status")
    } finally {
      setIsLoading(false)
    }
  }

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <p className="text-muted-foreground">All documents have been verified!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Documents List */}
      <div className="lg:col-span-2 space-y-4">
        {documents.map((document) => (
          <Card
            key={document.id}
            className={`cursor-pointer transition-all ${selectedDocument?.id === document.id ? "ring-2 ring-primary" : ""}`}
            onClick={() => setSelectedDocument(document)}
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <FileText className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">{document.document_type.replace("_", " ").toUpperCase()}</h3>
                    <p className="text-sm text-muted-foreground mb-1">{document.file_name}</p>
                    <p className="text-sm text-muted-foreground">Property: {document.properties.title}</p>
                  </div>
                </div>
                <Badge className="bg-yellow-600 flex-shrink-0">PENDING</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Verification Panel */}
      <div>
        {selectedDocument ? (
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-lg">Verify Document</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">{selectedDocument.document_type.replace("_", " ").toUpperCase()}</h4>
                <p className="text-sm text-muted-foreground mb-2">{selectedDocument.file_name}</p>
                <p className="text-sm text-muted-foreground">Property: {selectedDocument.properties.title}</p>
              </div>

              <div>
                <label className="text-sm font-medium">Verification Notes</label>
                <Textarea
                  placeholder="Add notes about this document..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-2 min-h-24"
                />
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 gap-2"
                  onClick={() => handleVerify(selectedDocument.id, "verified")}
                  disabled={isLoading}
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  className="w-full gap-2"
                  onClick={() => handleVerify(selectedDocument.id, "rejected")}
                  disabled={isLoading}
                >
                  <AlertCircle className="w-4 h-4" />
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Select a document to verify</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
