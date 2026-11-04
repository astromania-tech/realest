"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MessageSquare } from "lucide-react"

interface Inquiry {
  id: string
  message: string
  status: string
  created_at: string
  properties: { id: string; title: string }
  profiles: { full_name: string; email: string; phone: string }
}

interface OwnerInquiriesPageProps {
  inquiries: Inquiry[]
}

export default function OwnerInquiriesPage({ inquiries }: OwnerInquiriesPageProps) {
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [replyMessage, setReplyMessage] = useState("")

  const handleReply = async () => {
    if (!selectedInquiry || !replyMessage.trim()) return

    // In a real app, this would send an email or create a message record
    alert(`Reply sent to ${selectedInquiry.profiles.full_name}`)
    setReplyMessage("")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-600"
      case "viewed":
        return "bg-yellow-600"
      case "responded":
        return "bg-green-600"
      default:
        return "bg-gray-600"
    }
  }

  return (
    <main className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Inquiries</h1>
        <p className="text-muted-foreground">Manage inquiries from interested users</p>
      </div>

      {inquiries.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No inquiries yet</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inquiries List */}
          <div className="lg:col-span-2 space-y-4">
            {inquiries.map((inquiry) => (
              <Card
                key={inquiry.id}
                className={`cursor-pointer transition-all ${selectedInquiry?.id === inquiry.id ? "ring-2 ring-primary" : ""}`}
                onClick={() => setSelectedInquiry(inquiry)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="font-semibold">{inquiry.properties.title}</h3>
                      <p className="text-sm text-muted-foreground">From: {inquiry.profiles.full_name}</p>
                    </div>
                    <Badge className={getStatusColor(inquiry.status)}>{inquiry.status.toUpperCase()}</Badge>
                  </div>
                  <p className="text-sm text-foreground line-clamp-2 mb-3">{inquiry.message}</p>
                  <p className="text-xs text-muted-foreground">{new Date(inquiry.created_at).toLocaleDateString()}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Reply Panel */}
          <div>
            {selectedInquiry ? (
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="text-lg">Reply to Inquiry</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-1">{selectedInquiry.profiles.full_name}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{selectedInquiry.properties.title}</p>

                    <div className="space-y-2 mb-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">Message:</p>
                      <p className="text-sm">{selectedInquiry.message}</p>
                    </div>

                    <div className="space-y-2">
                      {selectedInquiry.profiles.email && (
                        <a
                          href={`mailto:${selectedInquiry.profiles.email}`}
                          className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                        >
                          <Mail className="w-4 h-4" />
                          {selectedInquiry.profiles.email}
                        </a>
                      )}
                      {selectedInquiry.profiles.phone && (
                        <a
                          href={`tel:${selectedInquiry.profiles.phone}`}
                          className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                        >
                          <Phone className="w-4 h-4" />
                          {selectedInquiry.profiles.phone}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <label className="text-sm font-medium">Your Reply</label>
                    <Textarea
                      placeholder="Type your reply..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      className="mt-2 min-h-24"
                    />
                  </div>

                  <Button className="w-full" onClick={handleReply} disabled={!replyMessage.trim()}>
                    Send Reply
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">Select an inquiry to reply</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
