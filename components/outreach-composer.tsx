"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Mail, Phone, Send, Eye, Clock } from "lucide-react"

interface OutreachComposerProps {
  candidate: {
    id: string
    name: string
    email: string
    phone?: string
    skills: string[]
  }
  job: {
    id: string
    title: string
    company: string
  }
  onSend: (channel: string, message: string, templateId?: string) => void
}

const EMAIL_TEMPLATES = [
  {
    id: "professional",
    name: "Professional Introduction",
    subject: "Exciting {{jobTitle}} Opportunity at {{company}}",
    content: `Hi {{candidateName}},

I hope this message finds you well. I came across your profile and was impressed by your background in {{skills}}.

We have an exciting {{jobTitle}} position at {{company}} that I believe would be a perfect match for your experience. 

Would you be interested in learning more about this opportunity? I'd love to schedule a brief call to discuss the details.

Best regards,
{{recruiterName}}
{{company}}`,
  },
  {
    id: "casual",
    name: "Casual Approach",
    subject: "Quick question about your career goals",
    content: `Hey {{candidateName}},

Quick question - are you open to new opportunities in {{skills}}?

I have a {{jobTitle}} role at {{company}} that caught my eye when I saw your profile. No pressure, just thought it might be interesting for you.

Let me know if you'd like to hear more!

{{recruiterName}}`,
  },
]

const WHATSAPP_TEMPLATES = [
  {
    id: "intro",
    name: "Introduction",
    content: `Hi {{candidateName}}! 👋

I'm {{recruiterName}} from {{company}}. I found your profile and think you'd be perfect for our {{jobTitle}} position.

Are you open to new opportunities? Would love to chat!`,
  },
]

export function OutreachComposer({ candidate, job, onSend }: OutreachComposerProps) {
  const [activeChannel, setActiveChannel] = useState("email")
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [customMessage, setCustomMessage] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [sending, setSending] = useState(false)

  const replaceVariables = (template: string) => {
    return template
      .replace(/\{\{candidateName\}\}/g, candidate.name)
      .replace(/\{\{jobTitle\}\}/g, job.title)
      .replace(/\{\{company\}\}/g, job.company)
      .replace(/\{\{skills\}\}/g, candidate.skills.slice(0, 3).join(", "))
      .replace(/\{\{recruiterName\}\}/g, "Your Name") // This would come from recruiter profile
  }

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)

    if (activeChannel === "email") {
      const template = EMAIL_TEMPLATES.find((t) => t.id === templateId)
      if (template) {
        setEmailSubject(replaceVariables(template.subject))
        setCustomMessage(replaceVariables(template.content))
      }
    } else if (activeChannel === "whatsapp") {
      const template = WHATSAPP_TEMPLATES.find((t) => t.id === templateId)
      if (template) {
        setCustomMessage(replaceVariables(template.content))
      }
    }
  }

  const handleSend = async () => {
    setSending(true)
    try {
      await onSend(activeChannel, customMessage, selectedTemplate)
      setCustomMessage("")
      setEmailSubject("")
      setSelectedTemplate("")
    } finally {
      setSending(false)
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "email":
        return <Mail className="h-4 w-4" />
      case "whatsapp":
        return <MessageSquare className="h-4 w-4" />
      case "sms":
        return <Phone className="h-4 w-4" />
      default:
        return <Mail className="h-4 w-4" />
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Outreach Composer
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>To: {candidate.name}</span>
          <Badge variant="outline">{candidate.skills.slice(0, 2).join(", ")}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeChannel} onValueChange={setActiveChannel}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              WhatsApp
            </TabsTrigger>
            <TabsTrigger value="sms" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              SMS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4">
            <div className="space-y-2">
              <Label>Template</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template or write custom message" />
                </SelectTrigger>
                <SelectContent>
                  {EMAIL_TEMPLATES.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Email subject line"
              />
            </div>

            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Write your message here..."
                rows={8}
              />
            </div>
          </TabsContent>

          <TabsContent value="whatsapp" className="space-y-4">
            <div className="space-y-2">
              <Label>Template</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template or write custom message" />
                </SelectTrigger>
                <SelectContent>
                  {WHATSAPP_TEMPLATES.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Write your WhatsApp message here..."
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                Keep it concise - WhatsApp works best with shorter messages
              </p>
            </div>
          </TabsContent>

          <TabsContent value="sms" className="space-y-4">
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Write your SMS message here..."
                rows={4}
                maxLength={160}
              />
              <p className="text-xs text-muted-foreground">{160 - customMessage.length} characters remaining</p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Best time to send: 9-11 AM or 2-4 PM</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleSend} disabled={!customMessage.trim() || sending} size="sm">
              <Send className="h-4 w-4 mr-2" />
              {sending ? "Sending..." : "Send"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
