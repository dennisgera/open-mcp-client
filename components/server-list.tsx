"use client"

import { Plus, Server, ExternalLink, Terminal, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { MCPConfig } from "@/app/types/agent"

interface ServerListProps {
  servers: MCPConfig
  onAddServer: () => void
  onEditServer: (serverName: string) => void
}

export function ServerList({ servers, onAddServer, onEditServer }: ServerListProps) {
  return (
    <div className="w-80 border-l border-border bg-card flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold">Servers</h2>
        <Button size="sm" onClick={onAddServer}>
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {Object.entries(servers).map(([name, config]) => (
            <Card key={name} className="overflow-hidden">
              <CardHeader className="p-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{name}</CardTitle>
                  <Badge variant={config.transport === "stdio" ? "outline" : "secondary"} className="text-xs">
                    {config.transport}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0 text-xs text-muted-foreground">
                {config.transport === "stdio" ? (
                  <div className="flex items-center gap-2">
                    <Terminal className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">
                      {config.command} {config.args.join(" ")}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{config.url}</span>
                  </div>
                )}
                <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => onEditServer(name)}>
                  <Edit className="h-3 w-3 mr-2" />
                  Edit
                </Button>
              </CardContent>
            </Card>
          ))}

          {Object.keys(servers).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Server className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No servers configured</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={onAddServer}>
                <Plus className="h-4 w-4 mr-2" />
                Add Server
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

