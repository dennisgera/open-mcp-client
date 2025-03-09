"use client"
import { ServerForm } from "@/components/server-form"
import { ServerOverview } from "@/components/server-overview"
import type { MCPConfig, ServiceConnection } from "@/app/types/agent"
import { SidebarInset } from "@/components/ui/sidebar"

interface DashboardContentProps {
  servers: MCPConfig
  selectedServer: string | null
  addServer: (name: string, config: ServiceConnection) => void
  updateServer: (name: string, config: ServiceConnection) => void
  deleteServer: (name: string) => void
}

export function DashboardContent({
  servers,
  selectedServer,
  addServer,
  updateServer,
  deleteServer,
}: DashboardContentProps) {
  return (
    <SidebarInset>
      <div className="container mx-auto p-6">
        {selectedServer === "new" ? (
          <ServerForm
            mode="create"
            onSubmit={(name, config) => {
              addServer(name, config)
            }}
          />
        ) : selectedServer ? (
          <ServerForm
            mode="edit"
            initialName={selectedServer}
            initialConfig={servers[selectedServer]}
            onSubmit={(name, config) => {
              if (name !== selectedServer) {
                deleteServer(selectedServer)
              }
              updateServer(name, config)
            }}
            onDelete={() => deleteServer(selectedServer)}
          />
        ) : (
          <ServerOverview servers={servers} />
        )}
      </div>
    </SidebarInset>
  )
}

