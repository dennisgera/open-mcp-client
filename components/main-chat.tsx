"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, AlertCircle, Terminal, Loader2, Server } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { MCPConfig } from "@/app/types/agent"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Message {
  id: string
  content: string
  serverName: string | "user"
  timestamp: Date
}

interface ServerConnection {
  name: string
  isConnected: boolean
  isConnecting: boolean
  error: string | null
}

interface MainChatProps {
  servers: MCPConfig
}

export function MainChat({ servers }: MainChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [serverConnections, setServerConnections] = useState<Record<string, ServerConnection>>({})
  const [activeTab, setActiveTab] = useState<"all" | string>("all")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize server connections
  useEffect(() => {
    const newConnections: Record<string, ServerConnection> = {}

    // Add new servers
    Object.keys(servers).forEach((serverName) => {
      if (!serverConnections[serverName]) {
        newConnections[serverName] = {
          name: serverName,
          isConnected: false,
          isConnecting: false,
          error: null,
        }
      } else {
        newConnections[serverName] = serverConnections[serverName]
      }
    })

    setServerConnections(newConnections)
  }, [servers])

  // Connect to all servers
  useEffect(() => {
    const connectToServers = async () => {
      for (const serverName of Object.keys(servers)) {
        if (!serverConnections[serverName]?.isConnected && !serverConnections[serverName]?.isConnecting) {
          connectToServer(serverName)
        }
      }
    }

    connectToServers()
  }, [serverConnections, servers])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const connectToServer = async (serverName: string) => {
    // Update connection state to connecting
    setServerConnections((prev) => ({
      ...prev,
      [serverName]: {
        ...prev[serverName],
        isConnecting: true,
        error: null,
      },
    }))

    try {
      // Simulate connection delay
      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000))

      // Update connection state to connected
      setServerConnections((prev) => ({
        ...prev,
        [serverName]: {
          ...prev[serverName],
          isConnected: true,
          isConnecting: false,
        },
      }))

      // Add a welcome message
      const welcomeMessage: Message = {
        id: Date.now().toString() + serverName,
        content: `Connected to ${serverName}`,
        serverName: serverName,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, welcomeMessage])
    } catch (err) {
      // Update connection state to error
      setServerConnections((prev) => ({
        ...prev,
        [serverName]: {
          ...prev[serverName],
          isConnecting: false,
          error: "Failed to connect",
        },
      }))
    }
  }

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      serverName: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInputValue("")

    // Get connected servers
    const connectedServers = Object.entries(serverConnections)
      .filter(([_, connection]) => connection.isConnected)
      .map(([name]) => name)

    // If a specific server is selected, only send to that server
    const targetServers = activeTab !== "all" ? connectedServers.filter((name) => name === activeTab) : connectedServers

    // Send message to each connected server with a slight delay between responses
    targetServers.forEach((serverName, index) => {
      setTimeout(
        () => {
          const serverResponse: Message = {
            id: (Date.now() + index + 1).toString(),
            content: generateServerResponse(inputValue, serverName, servers[serverName]),
            serverName: serverName,
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, serverResponse])
        },
        500 + index * 300,
      ) // Stagger responses
    })
  }

  const generateServerResponse = (message: string, serverName: string, config: MCPConfig[string]): string => {
    // This is a simple simulation - in a real app, this would be the actual server response
    if (config.transport === "stdio") {
      if (message.toLowerCase().includes("help")) {
        return `Available commands:\n- status: Check server status\n- version: Get server version\n- restart: Restart the server`
      } else if (message.toLowerCase().includes("status")) {
        return `${serverName} is running normally. CPU: ${Math.floor(Math.random() * 20)}%, Memory: ${Math.floor(Math.random() * 500)}MB used`
      } else if (message.toLowerCase().includes("version")) {
        return `${config.command} version: 1.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 20)}`
      } else {
        return `Command processed: "${message}"\nExecution completed successfully.`
      }
    } else {
      // SSE responses
      if (message.toLowerCase().includes("subscribe")) {
        return "Subscribed to event stream. You will now receive real-time updates."
      } else if (message.toLowerCase().includes("events")) {
        return "Last 3 events:\n- user.login (2 min ago)\n- data.update (5 min ago)\n- system.restart (1 hour ago)"
      } else {
        return `Message sent to SSE endpoint: "${message}"\nAcknowledged.`
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Filter messages based on active tab
  const filteredMessages =
    activeTab === "all" ? messages : messages.filter((msg) => msg.serverName === activeTab || msg.serverName === "user")

  const connectedServerCount = Object.values(serverConnections).filter((s) => s.isConnected).length

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Chat Console</h2>
          <Badge variant="outline">
            {connectedServerCount}/{Object.keys(servers).length} Servers Connected
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              All Servers
            </TabsTrigger>
            {Object.entries(serverConnections).map(([name, connection]) => (
              <TabsTrigger key={name} value={name} className="flex items-center gap-2">
                {connection.isConnected ? (
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                ) : connection.isConnecting ? (
                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                )}
                {name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-hidden">
        <Card className="h-full flex flex-col rounded-none border-x-0 border-t-0">
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full p-4">
              {filteredMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <Terminal className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No messages yet</h3>
                  <p className="text-muted-foreground mt-2">
                    Start chatting with your servers by sending a message below.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.serverName === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className="flex items-start gap-3 max-w-[80%]">
                        {message.serverName !== "user" && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {message.serverName.substring(0, 1).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`rounded-lg px-4 py-2 text-sm ${
                            message.serverName === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}
                        >
                          {message.serverName !== "user" && (
                            <div className="font-medium text-xs mb-1">{message.serverName}</div>
                          )}
                          <div className="whitespace-pre-wrap">{message.content}</div>
                          <div
                            className={`text-xs mt-1 ${
                              message.serverName === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                            }`}
                          >
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                        {message.serverName === "user" && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-secondary">U</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>
          </CardContent>

          <div className="p-4 border-t">
            <div className="flex w-full items-center space-x-2">
              <Input
                placeholder="Type your message to all servers..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!inputValue.trim() || connectedServerCount === 0}>
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
            {connectedServerCount === 0 && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No servers connected</AlertTitle>
                <AlertDescription>
                  Please wait for servers to connect or check your server configurations.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

