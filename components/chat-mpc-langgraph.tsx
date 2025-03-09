"use client"

import { useState } from "react"
import { MainChat } from "@/components/main-chat"
import { ServerList } from "@/components/server-list"
import { ServerForm } from "@/components/server-form"
import { AgentState, ServiceConnection, MCPConfig } from '@/app/types/agent';
import { useCoAgent } from '@copilotkit/react-core';

export function ChatMPCLangGraph() {

  const { state: servers, setState: setServers } = useCoAgent<AgentState>({
    name: 'sample_agent',
  });



  const [editingServer, setEditingServer] = useState<string | null>(null)
  const [isAddingServer, setIsAddingServer] = useState(false)

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
      if (editingServer && name !== editingServer) {
        delete newServers[editingServer]
      }
      return {
        ...newServers,
        [name]: config,
      }
    })
    setEditingServer(null)
  }

  const deleteServer = (name: string) => {
    setServers((prev) => {
      const newServers = { ...prev }
      delete newServers[name]
      return newServers
    })
    setEditingServer(null)
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="border-b border-border bg-card py-3 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-lg font-semibold">Chat-MPC-LangGraph</h1>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main chat area */}
        {!isAddingServer && !editingServer && <MainChat servers={servers} />}

        {/* Server form for adding/editing */}
        {(isAddingServer || editingServer) && (
          <div className="flex-1 overflow-auto p-6">
            <ServerForm
              mode={isAddingServer ? "create" : "edit"}
              initialName={editingServer || ""}
              initialConfig={editingServer ? servers[editingServer] : undefined}
              onSubmit={isAddingServer ? addServer : updateServer}
              onDelete={editingServer ? () => deleteServer(editingServer) : undefined}
              onCancel={() => {
                setIsAddingServer(false)
                setEditingServer(null)
              }}
            />
          </div>
        )}

        {/* Server list sidebar */}
        <ServerList
          servers={servers}
          onAddServer={() => setIsAddingServer(true)}
          onEditServer={(name) => setEditingServer(name)}
        />
      </div>
    </div>
  )
}

