import { LockIcon, SignOutIcon } from "@phosphor-icons/react"
import { useState } from "react"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { UserBadge } from "@/components/user-badge"
import { createFolder, type FolderSummary, fetchFolder } from "@/lib/api"
import type { Entry } from "@/lib/dotenv"
import type { Session } from "@/lib/screen"
import { openEntries } from "@/lib/secrets"
import { FolderList } from "@/vault/folder-list"
import { FolderScreen } from "@/vault/folder-screen"

type View = { kind: "list" } | { kind: "folder"; folder: FolderSummary; entries: Entry[] }

interface VaultScreenProps {
  session: Session
  folders: FolderSummary[]
  onLock: () => void
  onSignOut: () => void
}

function sortFolders(folders: FolderSummary[]) {
  return folders.toSorted((a, b) => a.name.localeCompare(b.name))
}

export function VaultScreen(props: VaultScreenProps) {
  const [folders, setFolders] = useState(props.folders)
  const [view, setView] = useState<View>({ kind: "list" })
  const [openingId, setOpeningId] = useState<string | null>(null)

  async function handleOpen(summary: FolderSummary) {
    setOpeningId(summary.id)
    const folder = await fetchFolder(summary.id)
    const entries = folder.ok
      ? await openEntries(props.session.dataKey, folder.value.secrets)
      : folder
    setOpeningId(null)

    if (!entries.ok) {
      toast.add({ title: entries.error.message, type: "error" })
      return
    }
    setView({ kind: "folder", folder: summary, entries: entries.value })
  }

  async function handleCreate(name: string) {
    const created = await createFolder(name)
    if (!created.ok) return created.error.message

    setFolders((current) => sortFolders([...current, created.value]))
    setView({ kind: "folder", folder: created.value, entries: [] })
    return undefined
  }

  function handleChanged(folder: FolderSummary) {
    setFolders((current) =>
      sortFolders(current.map((item) => (item.id === folder.id ? folder : item))),
    )
    setView((current) => (current.kind === "folder" ? { ...current, folder } : current))
  }

  function handleDeleted(id: string) {
    setFolders((current) => current.filter((item) => item.id !== id))
    setView({ kind: "list" })
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-3xl flex-col gap-10 p-4 sm:p-8">
      <AppHeader>
        <UserBadge me={props.session.me} />
        <Button variant="ghost" size="icon-sm" aria-label="Lock vault" onClick={props.onLock}>
          <LockIcon />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Sign out" onClick={props.onSignOut}>
          <SignOutIcon />
        </Button>
      </AppHeader>
      <main>
        {view.kind === "list" ? (
          <FolderList
            folders={folders}
            openingId={openingId}
            onOpen={handleOpen}
            onCreate={handleCreate}
          />
        ) : (
          <FolderScreen
            key={view.folder.id}
            session={props.session}
            folder={view.folder}
            entries={view.entries}
            onChanged={handleChanged}
            onDeleted={handleDeleted}
            onBack={() => setView({ kind: "list" })}
          />
        )}
      </main>
    </div>
  )
}
