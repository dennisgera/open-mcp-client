"use client"

import { useState } from "react"
import { ServerOverview } from "@/components/server-overview"
import { ServerFormModal } from "@/components/server-form-modal"
import type { MCPConfig, ServiceConnection } from "@/app/types/agent"

export function ChatMPCLangGraph() {
  const [servers, setServers] = useState<MCPConfig>({
    "api-service": {
      command: "node",
      args: ["api.js"],
      transport: "stdio",
    },
    "data-processor": {
      url: "https://data-processor.example.com/events",
      transport: "sse",
    },
    "auth-service": {
      command: "python",
      args: ["-m", "auth_service"],
      transport: "stdio",
    },
  })

  const [selectedServer, setSelectedServer] = useState<string | null>(null)
  const [isAddingServer, setIsAddingServer] = useState(false)
  const [isEditingServer, setIsEditingServer] = useState(false)

  const addServer = (name: string, config: ServiceConnection) => {
    setServers((prev) => ({
      ...prev,
      [name]: config,
    }))
    setIsAddingServer(false)
  }

  const updateServer = (name: string, config: ServiceConnection) => {
    setServers((prev) => {
      const newServers = { ...prev }
      if (selectedServer && name !== selectedServer) {
        delete newServers[selectedServer]
      }
      return {
        ...newServers,
        [name]: config,
      }
    })
    setIsEditingServer(false)
    setSelectedServer(null) // Clear selected server after editing
  }

  const deleteServer = (name: string) => {
    setServers((prev) => {
      const newServers = { ...prev }
      delete newServers[name]
      return newServers
    })
    setSelectedServer(null)
    setIsEditingServer(false)
  }

  const handleEditServer = (serverName: string) => {
    setSelectedServer(serverName)
    setIsEditingServer(true)
  }

  const handleCloseEditModal = () => {
    setIsEditingServer(false)
    setSelectedServer(null) // Clear selected server when closing the edit modal
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <main className="flex-1 overflow-auto p-6 pt-10 flex justify-center">
        <div className="w-full max-w-6xl">
          <ServerOverview
            servers={servers}
            selectedServer={null} // Always pass null to show the full list
            onEdit={() => setIsEditingServer(true)}
            onSelectServer={handleEditServer}
            onAddServer={() => setIsAddingServer(true)}
          />
        </div>
      </main>

      {/* Add Server Modal */}
      <ServerFormModal
        mode="create"
        isOpen={isAddingServer}
        onClose={() => setIsAddingServer(false)}
        onSubmit={addServer}
      />

      {/* Edit Server Modal */}
      {selectedServer && (
        <ServerFormModal
          mode="edit"
          isOpen={isEditingServer}
          initialName={selectedServer}
          initialConfig={servers[selectedServer]}
          onClose={handleCloseEditModal}
          onSubmit={updateServer}
          onDelete={() => deleteServer(selectedServer)}
        />
      )}
    </div>
  )
}

