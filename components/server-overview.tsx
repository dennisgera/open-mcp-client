"use client"

import { ExternalLink, Terminal, Edit, Plus, Server } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { MCPConfig } from "@/app/types/agent"

interface ServerOverviewProps {
  servers: MCPConfig
  selectedServer: string | null
  onEdit: () => void
  onSelectServer: (serverName: string) => void
  onAddServer: () => void
}

export function ServerOverview({ servers, selectedServer, onEdit, onSelectServer, onAddServer }: ServerOverviewProps) {
  const serverCount = Object.keys(servers).length
  const stdioCount = Object.values(servers).filter((config) => config.transport === "stdio").length
  const sseCount = Object.values(servers).filter((config) => config.transport === "sse").length

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Server className="h-8 w-8" />
            <h1 className="text-4xl font-bold tracking-tight">chat-mpc-langgraph</h1>
          </div>
          <p className="text-muted-foreground text-lg">Manage and configure your MPC servers</p>
        </div>
        <Button onClick={onAddServer}>
          <Plus className="h-4 w-4 mr-2" />
          Add Server
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Servers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{serverCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Stdio Servers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stdioCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">SSE Servers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sseCount}</div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mt-8 mb-4">Server List</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(servers).map(([name, config]) => (
          <Card key={name} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">{name}</CardTitle>
                <Badge variant={config.transport === "stdio" ? "outline" : "secondary"}>{config.transport}</Badge>
              </div>
              <CardDescription>
                {config.transport === "stdio"
                  ? `Command: ${config.command}`
                  : `URL: ${config.url.substring(0, 30)}${config.url.length > 30 ? "..." : ""}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground pb-2">
              {config.transport === "stdio" && (
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  <span>Args: {config.args.join(" ")}</span>
                </div>
              )}
              {config.transport === "sse" && (
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  <span>Server-Sent Events</span>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0">
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto"
                onClick={(e) => {
                  e.stopPropagation()
                  onSelectServer(name)
                }}
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit server</span>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/40 mt-10">
        <CardContent className="py-4 text-center">
          <p className="text-muted-foreground">
            More MPC servers available on the web, e.g.{" "}
            <a
              href="https://mcp.composio.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center"
            >
              composio.dev
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

