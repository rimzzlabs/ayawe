import {
  CaretRightIcon,
  FolderIcon,
  FolderPlusIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react"
import { useState } from "react"
import { PageHeading } from "@/components/page-heading"
import { Button } from "@/components/ui/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Spinner } from "@/components/ui/spinner"
import type { FolderSummary } from "@/lib/api"
import { DeleteFolderDialog } from "@/vault/delete-folder-button"
import { FolderNameDialog } from "@/vault/folder-name-dialog"

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" })

interface FolderListProps {
  folders: FolderSummary[]
  openingId: string | null
  onOpen: (folder: FolderSummary) => void
  onCreate: (name: string) => Promise<string | undefined>
  onRename: (folder: FolderSummary, name: string) => Promise<string | undefined>
  onDeleted: (id: string) => void
}

type MenuAction = { kind: "rename" | "delete"; folder: FolderSummary } | null

export function FolderList(props: FolderListProps) {
  // The action stays set after its dialog closes, so the dialog can animate out.
  // Each open gets a new session key, so the dialog starts with fresh state.
  const [action, setAction] = useState<MenuAction>(null)
  const [actionOpen, setActionOpen] = useState(false)
  const [actionSession, setActionSession] = useState(0)

  function openAction(next: NonNullable<MenuAction>) {
    setAction(next)
    setActionOpen(true)
    setActionSession((current) => current + 1)
  }

  function closeAction(open: boolean) {
    if (!open) setActionOpen(false)
  }
  const createDialog = (
    <FolderNameDialog
      title="New folder"
      description="A folder holds the secrets of one project, or one stage of a project."
      submitLabel="Create"
      onSubmit={props.onCreate}
      trigger={
        <Button size={props.folders.length === 0 ? "default" : "sm"}>
          <FolderPlusIcon data-icon="inline-start" />
          New folder
        </Button>
      }
    />
  )

  const heading = (
    <div className="flex items-center justify-between gap-4">
      <PageHeading>Folders</PageHeading>
      {props.folders.length > 0 && createDialog}
    </div>
  )

  if (props.folders.length === 0) {
    return (
      <section className="flex flex-col gap-4">
        {heading}
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderIcon />
            </EmptyMedia>
            <EmptyTitle>Make your first folder</EmptyTitle>
            <EmptyDescription>
              Use one folder for each project. Then paste its .env file into the folder.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>{createDialog}</EmptyContent>
        </Empty>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-4">
      {heading}
      <ul className="flex flex-col gap-2">
        {props.folders.map((folder) => (
          <li key={folder.id}>
            {/* Right-click, Shift+F10, or the Menu key opens the folder actions. */}
            <ContextMenu>
              <ContextMenuTrigger>
                <Item
                  variant="outline"
                  size="sm"
                  className="w-full text-left"
                  render={
                    <button
                      type="button"
                      aria-busy={props.openingId === folder.id || undefined}
                      onClick={() => {
                        if (props.openingId === null) props.onOpen(folder)
                      }}
                    />
                  }
                >
                  <ItemMedia variant="icon">
                    <FolderIcon />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{folder.name}</ItemTitle>
                    <ItemDescription>
                      Updated {dateFormat.format(new Date(folder.updatedAt))}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    {props.openingId === folder.id ? <Spinner /> : <CaretRightIcon />}
                  </ItemActions>
                </Item>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuGroup>
                  <ContextMenuItem onClick={() => openAction({ kind: "rename", folder })}>
                    <PencilSimpleIcon />
                    Rename
                  </ContextMenuItem>
                  <ContextMenuItem
                    variant="destructive"
                    onClick={() => openAction({ kind: "delete", folder })}
                  >
                    <TrashIcon />
                    Delete
                  </ContextMenuItem>
                </ContextMenuGroup>
              </ContextMenuContent>
            </ContextMenu>
          </li>
        ))}
      </ul>

      {action?.kind === "rename" && (
        <FolderNameDialog
          key={actionSession}
          open={actionOpen}
          onOpenChange={closeAction}
          title="Rename folder"
          description="The name is visible to the server. Keep secrets out of it."
          submitLabel="Rename"
          defaultName={action.folder.name}
          onSubmit={(name) => props.onRename(action.folder, name)}
        />
      )}
      {action?.kind === "delete" && (
        <DeleteFolderDialog
          key={actionSession}
          folder={action.folder}
          open={actionOpen}
          onOpenChange={closeAction}
          onDeleted={props.onDeleted}
        />
      )}
    </section>
  )
}
