"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { ServiceConnection } from "@/app/types/agent"

interface ServerFormModalProps {
  mode: "create" | "edit"
  isOpen: boolean
  initialName?: string
  initialConfig?: ServiceConnection
  onSubmit: (name: string, config: ServiceConnection) => void
  onDelete?: () => void
  onClose: () => void
}

const serverNameSchema = z.string().min(1, "Server name is required").max(50)

const stdioSchema = z.object({
  transport: z.literal("stdio"),
  command: z.string().min(1, "Command is required"),
  args: z.array(z.string()),
})

const sseSchema = z.object({
  transport: z.literal("sse"),
  url: z.string().url("Please enter a valid URL"),
})

const serverConfigSchema = z.discriminatedUnion("transport", [stdioSchema, sseSchema])

export function ServerFormModal({
  mode,
  isOpen,
  initialName = "",
  initialConfig,
  onSubmit,
  onDelete,
  onClose,
}: ServerFormModalProps) {
  const [serverName, setServerName] = useState(initialName)
  const [transportType, setTransportType] = useState<"stdio" | "sse">(initialConfig?.transport || "stdio")
  const [argsInput, setArgsInput] = useState("")

  const stdioForm = useForm<z.infer<typeof stdioSchema>>({
    resolver: zodResolver(stdioSchema),
    defaultValues: {
      transport: "stdio",
      command: initialConfig?.transport === "stdio" ? initialConfig.command : "",
      args: initialConfig?.transport === "stdio" ? initialConfig.args : [],
    },
  })

  const sseForm = useForm<z.infer<typeof sseSchema>>({
    resolver: zodResolver(sseSchema),
    defaultValues: {
      transport: "sse",
      url: initialConfig?.transport === "sse" ? initialConfig.url : "",
    },
  })

  // Reset form when modal opens with new data
  useEffect(() => {
    if (isOpen) {
      setServerName(initialName || "")
      setTransportType(initialConfig?.transport || "stdio")

      if (initialConfig?.transport === "stdio") {
        setArgsInput(initialConfig.args.join(" "))
        stdioForm.reset({
          transport: "stdio",
          command: initialConfig.command,
          args: initialConfig.args,
        })
      } else if (initialConfig?.transport === "sse") {
        sseForm.reset({
          transport: "sse",
          url: initialConfig.url,
        })
      } else {
        stdioForm.reset({
          transport: "stdio",
          command: "",
          args: [],
        })
        sseForm.reset({
          transport: "sse",
          url: "",
        })
        setArgsInput("")
      }
    }
  }, [isOpen, initialName, initialConfig])

  const handleSubmit = () => {
    if (!serverNameSchema.safeParse(serverName).success) {
      return
    }

    if (transportType === "stdio") {
      const isValid = stdioForm.trigger()
      if (!isValid) return

      const values = stdioForm.getValues()
      onSubmit(serverName, {
        transport: "stdio",
        command: values.command,
        args: values.args,
      })
    } else {
      const isValid = sseForm.trigger()
      if (!isValid) return

      const values = sseForm.getValues()
      onSubmit(serverName, {
        transport: "sse",
        url: values.url,
      })
    }
  }

  const updateArgs = (value: string) => {
    setArgsInput(value)
    const args = value
      .split(" ")
      .map((arg) => arg.trim())
      .filter((arg) => arg !== "")
    stdioForm.setValue("args", args)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add New Server" : "Edit Server"}</DialogTitle>
          <DialogDescription>Configure your MPC server connection details</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="server-name">Server Name</Label>
            <Input
              id="server-name"
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              placeholder="Enter server name"
            />
            {!serverNameSchema.safeParse(serverName).success && serverName !== "" && (
              <p className="text-sm text-destructive">Server name is required and must be less than 50 characters</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Transport Type</Label>
            <RadioGroup
              value={transportType}
              onValueChange={(value) => setTransportType(value as "stdio" | "sse")}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="stdio" id="stdio" />
                <Label htmlFor="stdio">Standard I/O</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sse" id="sse" />
                <Label htmlFor="sse">Server-Sent Events</Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {transportType === "stdio" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="command">Command</Label>
                <Input
                  id="command"
                  placeholder="node"
                  value={stdioForm.watch("command")}
                  onChange={(e) => stdioForm.setValue("command", e.target.value)}
                />
                {stdioForm.formState.errors.command && (
                  <p className="text-sm text-destructive">{stdioForm.formState.errors.command.message}</p>
                )}
                <p className="text-sm text-muted-foreground">The command to execute (e.g., node, python)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="args">Arguments</Label>
                <Input
                  id="args"
                  placeholder="server.js --port 3000"
                  value={argsInput}
                  onChange={(e) => updateArgs(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">Space-separated list of arguments</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                placeholder="https://example.com/events"
                value={sseForm.watch("url")}
                onChange={(e) => sseForm.setValue("url", e.target.value)}
              />
              {sseForm.formState.errors.url && (
                <p className="text-sm text-destructive">{sseForm.formState.errors.url.message}</p>
              )}
              <p className="text-sm text-muted-foreground">The URL for the Server-Sent Events endpoint</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {mode === "edit" && onDelete && (
              <Button variant="destructive" onClick={onDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              <Save className="mr-2 h-4 w-4" />
              {mode === "create" ? "Add Server" : "Save Changes"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

