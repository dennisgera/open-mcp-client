"use client"

import { Server, Plus, Settings } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import type { MCPConfig } from "@/app/types/agent"

interface DashboardSidebarProps {
  servers: MCPConfig
  selectedServer: string | null
  setSelectedServer: (server: string | null) => void
}

export function DashboardSidebar({ servers, selectedServer, setSelectedServer }: DashboardSidebarProps) {
  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Server className="h-5 w-5" />
          <span>MCP Dashboard</span>
        </div>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            <span>Servers</span>
          </SidebarGroupLabel>
          <SidebarMenu>
            {Object.keys(servers).map((serverName) => (
              <SidebarMenuItem key={serverName}>
                <SidebarMenuButton
                  isActive={selectedServer === serverName}
                  onClick={() => setSelectedServer(serverName)}
                  tooltip={serverName}
                >
                  <Server className="h-4 w-4" />
                  <span>{serverName}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setSelectedServer("new")} tooltip="Add Server">
                <Plus className="h-4 w-4" />
                <span>Add Server</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

