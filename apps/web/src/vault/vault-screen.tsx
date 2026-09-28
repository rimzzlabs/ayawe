import { open } from "@ayawe/crypto/seal"
import { LockIcon } from "@phosphor-icons/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { Wordmark } from "@/components/wordmark"
import { fetchEnv } from "@/lib/api"
import type { Session } from "@/lib/screen"
import { EnvEditor } from "@/vault/env-editor"
import { VaultList } from "@/vault/vault-list"

type View = { kind: "list" } | { kind: "edit"; name: string | null; content: string }

interface VaultScreenProps {
  session: Session
  onLock: () => void
}

export function VaultScreen(props: VaultScreenProps) {
  const [names, setNames] = useState(props.session.names)
  const [view, setView] = useState<View>({ kind: "list" })
  const [openingName, setOpeningName] = useState<string | null>(null)

  async function handleOpen(name: string) {
    setOpeningName(name)
    const sealed = await fetchEnv(props.session.token, name)
    const opened = sealed.ok ? await open(props.session.dataKey, sealed.value) : sealed
    setOpeningName(null)

    if (!opened.ok) {
      toast.add({ title: opened.error.message, type: "error" })
      return
    }
    setView({ kind: "edit", name, content: opened.value })
  }

  function handleSaved(name: string, content: string) {
    setNames((current) =>
      current.includes(name) ? current : [...current, name].toSorted((a, b) => a.localeCompare(b)),
    )
    setView({ kind: "edit", name, content })
  }

  function handleDeleted(name: string) {
    setNames((current) => current.filter((item) => item !== name))
    setView({ kind: "list" })
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-2xl flex-col gap-10 p-4 sm:p-8">
      <header className="flex items-center justify-between gap-4">
        <Wordmark />
        <Button variant="ghost" size="sm" onClick={props.onLock}>
          <LockIcon data-icon="inline-start" />
          Lock
        </Button>
      </header>
      <main>
        {view.kind === "list" ? (
          <VaultList
            names={names}
            openingName={openingName}
            onOpen={handleOpen}
            onNew={() => setView({ kind: "edit", name: null, content: "" })}
          />
        ) : (
          <EnvEditor
            key={view.name ?? "new"}
            session={props.session}
            name={view.name}
            existingNames={names}
            initialContent={view.content}
            onSaved={handleSaved}
            onDeleted={handleDeleted}
            onClose={() => setView({ kind: "list" })}
          />
        )}
      </main>
    </div>
  )
}
