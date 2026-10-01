import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router"
import { useState } from "react"
import { createFolder, type FolderSummary, listFolders, renameFolder } from "@/lib/api"
import { FolderList } from "@/vault/folder-list"

export const Route = createFileRoute("/_auth/_unlocked/vault/")({
  loader: async () => {
    const folders = await listFolders()
    if (!folders.ok) throw folders.error
    return folders.value.toSorted((a, b) => a.name.localeCompare(b.name))
  },
  component: FolderListRoute,
})

function FolderListRoute() {
  const folders = Route.useLoaderData()
  const router = useRouter()
  const navigate = useNavigate()
  const [openingId, setOpeningId] = useState<string | null>(null)

  async function handleOpen(folder: FolderSummary) {
    setOpeningId(folder.id)
    await navigate({ to: "/vault/$folderId", params: { folderId: folder.id } })
    setOpeningId(null)
  }

  async function handleCreate(name: string) {
    const created = await createFolder(name)
    if (!created.ok) return created.error.message
    await navigate({ to: "/vault/$folderId", params: { folderId: created.value.id } })
    return undefined
  }

  async function handleRename(folder: FolderSummary, name: string) {
    const renamed = await renameFolder(folder.id, name)
    if (!renamed.ok) return renamed.error.message
    await router.invalidate()
    return undefined
  }

  return (
    <FolderList
      folders={folders}
      openingId={openingId}
      onOpen={handleOpen}
      onCreate={handleCreate}
      onRename={handleRename}
      onDeleted={() => router.invalidate()}
    />
  )
}
