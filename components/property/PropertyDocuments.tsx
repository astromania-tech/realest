import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Clock, FileText } from "lucide-react"

interface Document {
  id: string
  document_type: string
  file_name: string
  verification_status: string
  verified_at: string
}

interface PropertyDocumentsProps {
  documents: Document[]
}

export default function PropertyDocuments({ documents }: PropertyDocumentsProps) {
  const getDocumentIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "rejected":
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-600">Verified</Badge>
      case "rejected":
        return <Badge className="bg-red-600">Rejected</Badge>
      default:
        return <Badge className="bg-yellow-600">Pending</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents (Verified)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{doc.document_type.replace("_", " ").toUpperCase()}</p>
                  <p className="text-sm text-muted-foreground">{doc.file_name}</p>
                </div>
              </div>
              {getStatusBadge(doc.verification_status)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
