import { createClient, getAuthUser} from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Users, Clock, Send, User, Phone } from "lucide-react";
import Link from "next/link";

export default async function CMSChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is an admin
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userData?.role !== "admin") {
    redirect("/");
  }

  // Mock chat data (in a real app, this would come from a chat service)
  const chatStats = {
    activeChats: 5,
    waitingUsers: 12,
    resolvedToday: 47,
    averageResponseTime: "2.3 min",
  };

  const activeChats = [
    {
      id: "1",
      userName: "Alice Johnson",
      userEmail: "alice@example.com",
      lastMessage: "Hi, I need help with my property listing",
      lastMessageTime: "2024-01-15T14:30:00Z",
      status: "active",
      unreadCount: 2,
      messages: [
        { id: "1", sender: "user", message: "Hi, I need help with my property listing", timestamp: "2024-01-15T14:25:00Z" },
        { id: "2", sender: "admin", message: "Hello Alice! I'd be happy to help. What's the issue with your listing?", timestamp: "2024-01-15T14:26:00Z" },
        { id: "3", sender: "user", message: "It's not showing up in search results", timestamp: "2024-01-15T14:28:00Z" },
        { id: "4", sender: "user", message: "Can you check what's wrong?", timestamp: "2024-01-15T14:30:00Z" },
      ],
    },
    {
      id: "2",
      userName: "Bob Smith",
      userEmail: "bob@example.com",
      lastMessage: "Thanks for the quick response!",
      lastMessageTime: "2024-01-15T14:15:00Z",
      status: "active",
      unreadCount: 0,
      messages: [
        { id: "1", sender: "user", message: "My payment didn't go through", timestamp: "2024-01-15T14:10:00Z" },
        { id: "2", sender: "admin", message: "I'm checking your payment status now. Can you provide the transaction ID?", timestamp: "2024-01-15T14:12:00Z" },
        { id: "3", sender: "user", message: "Thanks for the quick response!", timestamp: "2024-01-15T14:15:00Z" },
      ],
    },
  ];

  return (
    <>
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link
            href="/admin/cms"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            ← Back to CMS Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Live Chat Support</h1>
          <p className="text-muted-foreground">
            Manage real-time customer support conversations
          </p>
        </div>

        {/* Chat Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <MessageSquare className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{chatStats.activeChats}</p>
                  <p className="text-sm text-muted-foreground">Active Chats</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Users className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{chatStats.waitingUsers}</p>
                  <p className="text-sm text-muted-foreground">Waiting</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Clock className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{chatStats.averageResponseTime}</p>
                  <p className="text-sm text-muted-foreground">Avg Response</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <MessageSquare className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{chatStats.resolvedToday}</p>
                  <p className="text-sm text-muted-foreground">Resolved Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Chats List */}
          <div className="lg:col-span-1">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle>Active Conversations</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2 p-4">
                    {activeChats.map((chat) => (
                      <div
                        key={chat.id}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>
                                {chat.userName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{chat.userName}</p>
                              <p className="text-xs text-muted-foreground">{chat.userEmail}</p>
                            </div>
                            {chat.unreadCount > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {chat.unreadCount}
                              </Badge>
                            )}
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {chat.lastMessage}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(chat.lastMessageTime).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[600px]">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {activeChats[0]?.userName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{activeChats[0]?.userName}</p>
                      <p className="text-sm text-muted-foreground">{activeChats[0]?.userEmail}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      Transfer
                    </Button>
                    <Button size="sm" variant="outline">
                      End Chat
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex flex-col h-[500px]">
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {activeChats[0]?.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            message.sender === 'user'
                              ? 'bg-muted'
                              : 'bg-primary text-primary-foreground'
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      className="flex-1"
                    />
                    <Button>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline">
                      Quick Reply
                    </Button>
                    <Button size="sm" variant="outline">
                      Send File
                    </Button>
                    <Button size="sm" variant="outline">
                      Canned Response
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex gap-4">
          <Button variant="outline">
            View Chat History
          </Button>
          <Button variant="outline">
            Export Conversations
          </Button>
          <Button variant="outline">
            Chat Settings
          </Button>
        </div>
      </div>
  </>
  );
}
