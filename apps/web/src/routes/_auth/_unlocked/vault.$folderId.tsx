import { FolderIcon } from "@phosphor-icons/react"
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { fetchFolder } from "@/lib/api"
import { openEntries } from "@/lib/secrets"
import { FolderScreen } from "@/vault/folder-screen"

export const Route = createFileRoute("/_auth/_unlocked/vault/$folderId")({
  loader: async ({ params, context }) => {
    const folder = await fetchFolder(params.folderId)
    if (!folder.ok) throw folder.error
    if (!folder.value) throw notFound()
    const entries = await openEntries(context.session.dataKey, folder.value.secrets)
    if (!entries.ok) throw entries.error
    return { folder: folder.value, entries: entries.value }
  },
  component: FolderRoute,
  notFoundComponent: FolderNotFound,
})

function FolderRoute() {
  const data = Route.useLoaderData()
  const context = Route.useRouteContext()
  const navigate = useNavigate()

  return (
    <FolderScreen
      // A new key per folder, so moving between folders starts with fresh state.
      key={data.folder.id}
      session={context.session}
      folder={data.folder}
      entries={data.entries}
      onDeleted={() => navigate({ to: "/vault" })}
    />
  )
}

function FolderNotFound() {
  return (
    <Empty className="border">
      <title>Folder not found · ayawe</title>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderIcon />
        </EmptyMedia>
        <EmptyTitle>Folder not found</EmptyTitle>
        <EmptyDescription>
          This folder does not exist. Somebody deleted it, or the link is wrong.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button nativeButton={false} render={<Link to="/vault" />}>
          Back to folders
        </Button>
      </EmptyContent>
    </Empty>
  )
}
