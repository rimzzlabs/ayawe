import { LockIcon, SignOutIcon } from "@phosphor-icons/react"
import { useState } from "react"
import { AppHeader } from "@/components/app-header"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/toast"
import { UserMenu } from "@/components/user-menu"
import { createFolder, type FolderSummary, fetchFolder, renameFolder } from "@/lib/api"
import type { Entry } from "@/lib/dotenv"
import type { Session } from "@/lib/screen"
import { openEntries } from "@/lib/secrets"
import { UnsavedChangesProvider, useConfirmLeave } from "@/lib/unsaved-changes"
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
  return (
    <UnsavedChangesProvider>
      <VaultContent {...props} />
    </UnsavedChangesProvider>
  )
}

function VaultContent(props: VaultScreenProps) {
  const confirmLeave = useConfirmLeave()
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

  async function handleRename(folder: FolderSummary, name: string) {
    const renamed = await renameFolder(folder.id, name)
    if (!renamed.ok) return renamed.error.message
    handleChanged(renamed.value)
    return undefined
  }

  function handleDeleted(id: string) {
    setFolders((current) => current.filter((item) => item.id !== id))
    setView({ kind: "list" })
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-3xl flex-col gap-10 p-4 sm:p-8">
      <AppHeader>
        <UserMenu me={props.session.me}>
          <DropdownMenuItem onClick={() => confirmLeave(props.onLock)}>
            <LockIcon />
            Lock vault
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => confirmLeave(props.onSignOut)}>
            <SignOutIcon />
            Sign out
          </DropdownMenuItem>
        </UserMenu>
      </AppHeader>
      <main>
        {view.kind === "list" ? (
          <FolderList
            folders={folders}
            openingId={openingId}
            onOpen={handleOpen}
            onCreate={handleCreate}
            onRename={handleRename}
            onDeleted={handleDeleted}
          />
        ) : (
          <FolderScreen
            key={view.folder.id}
            session={props.session}
            folder={view.folder}
            entries={view.entries}
            onChanged={handleChanged}
            onDeleted={handleDeleted}
            onBack={() => confirmLeave(() => setView({ kind: "list" }))}
          />
        )}
      </main>
    </div>
  )
}
