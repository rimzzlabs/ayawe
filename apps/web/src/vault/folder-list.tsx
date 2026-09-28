import { CaretRightIcon, FolderIcon, FolderPlusIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
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
import { FolderNameDialog } from "@/vault/folder-name-dialog"

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" })

interface FolderListProps {
  folders: FolderSummary[]
  openingId: string | null
  onOpen: (folder: FolderSummary) => void
  onCreate: (name: string) => Promise<string | undefined>
}

export function FolderList(props: FolderListProps) {
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

  if (props.folders.length === 0) {
    return (
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
    )
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-2xl">Folders</h1>
        {createDialog}
      </div>
      <ul className="flex flex-col gap-2">
        {props.folders.map((folder) => (
          <li key={folder.id}>
            <Item
              variant="outline"
              size="sm"
              className="w-full text-left"
              render={
                <button
                  type="button"
                  disabled={props.openingId !== null}
                  onClick={() => props.onOpen(folder)}
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
          </li>
        ))}
      </ul>
    </section>
  )
}
