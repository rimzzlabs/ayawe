import {
  ArrowLeftIcon,
  CopyIcon,
  DotsThreeIcon,
  KeyIcon,
  MagnifyingGlassIcon,
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react"
import { useState } from "react"
import { PageHeading } from "@/components/page-heading"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { toast } from "@/components/ui/toast"
import { useIsDesktop } from "@/hooks/use-is-desktop"
import { type FolderSummary, renameFolder, saveSecrets } from "@/lib/api"
import { copyText } from "@/lib/clipboard"
import { type Entry, serializeDotenv } from "@/lib/dotenv"
import type { Session } from "@/lib/screen"
import { sealEntries } from "@/lib/secrets"
import { DeleteFolderDialog } from "@/vault/delete-folder-dialog"
import { FolderNameDialog } from "@/vault/folder-name-dialog"
import { AddVariablesSheet } from "@/vault/variables/add-variables-sheet"
import { DeleteVariableDialog } from "@/vault/variables/delete-variable-dialog"
import { EditVariableSheet } from "@/vault/variables/edit-variable-sheet"
import { VariableCardList } from "@/vault/variables/variable-card-list"
import { VariableTable } from "@/vault/variables/variable-table"

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" })

type Panel =
  | { kind: "rename-folder" }
  | { kind: "delete-folder" }
  | { kind: "add" }
  | { kind: "edit"; entry: Entry }
  | { kind: "delete"; entry: Entry }

interface FolderScreenProps {
  session: Session
  folder: FolderSummary
  entries: Entry[]
  onChanged: (folder: FolderSummary) => void
  onDeleted: (id: string) => void
  onBack: () => void
}

function countLabel(count: number) {
  return `${count} ${count === 1 ? "variable" : "variables"}`
}

export function FolderScreen(props: FolderScreenProps) {
  const isDesktop = useIsDesktop()
  const [entries, setEntries] = useState(props.entries)
  const [query, setQuery] = useState("")
  // The panel stays set after it closes, so its content stays visible while it animates out.
  // Each open gets a new session key, so the panel starts with fresh form state.
  const [panel, setPanel] = useState<Panel | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [panelSession, setPanelSession] = useState(0)

  function openPanel(next: Panel) {
    setPanel(next)
    setPanelOpen(true)
    setPanelSession((current) => current + 1)
  }

  async function saveEntries(next: Entry[], successTitle: string) {
    const sealed = await sealEntries(props.session.dataKey, next)
    const saved = await saveSecrets(props.folder.id, sealed)
    if (!saved.ok) {
      toast.add({ title: saved.error.message, type: "error" })
      return false
    }
    setEntries(next)
    props.onChanged({ ...props.folder, updatedAt: saved.value.updatedAt })
    toast.add({ title: successTitle, type: "success" })
    return true
  }

  async function handleRename(name: string) {
    const renamed = await renameFolder(props.folder.id, name)
    if (!renamed.ok) return renamed.error.message
    props.onChanged(renamed.value)
    return undefined
  }

  async function handleCopyAll() {
    const copied = await copyText(serializeDotenv(entries))
    toast.add(
      copied.ok
        ? { title: `Copied ${countLabel(entries.length)} as .env`, type: "success" }
        : { title: copied.error.message, type: "error" },
    )
  }

  const search = query.trim().toLowerCase()
  const visibleEntries =
    search === "" ? entries : entries.filter((entry) => entry.key.toLowerCase().includes(search))
  const keys = entries.map((entry) => entry.key)
  const updatedLabel = dateFormat.format(new Date(props.folder.updatedAt))
  const openAdd = () => openPanel({ kind: "add" })
  const openEdit = (entry: Entry) => openPanel({ kind: "edit", entry })
  const openDelete = (entry: Entry) => openPanel({ kind: "delete", entry })

  return (
    <section className="flex flex-col gap-6 pb-24 lg:gap-8 lg:pb-0">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Back to folders"
            onClick={props.onBack}
          >
            <ArrowLeftIcon />
          </Button>
          <PageHeading className="min-w-0 flex-1 truncate font-heading text-2xl outline-none">
            {props.folder.name}
          </PageHeading>
          {/* Phones get one menu, so the actions stay close to the title. */}
          <div className="hidden items-center gap-1 sm:flex">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Rename folder"
              onClick={() => openPanel({ kind: "rename-folder" })}
            >
              <PencilSimpleIcon />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Delete folder"
              onClick={() => openPanel({ kind: "delete-folder" })}
            >
              <TrashIcon />
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="sm:hidden"
                  aria-label="Folder actions"
                />
              }
            >
              <DotsThreeIcon weight="bold" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-auto min-w-40">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => openPanel({ kind: "rename-folder" })}>
                  <PencilSimpleIcon />
                  Rename
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => openPanel({ kind: "delete-folder" })}
                >
                  <TrashIcon />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* Phones get a two-cell strip. Wider screens get one line of text. */}
        <dl className="mt-3 grid grid-cols-2 divide-x border sm:hidden">
          <div className="flex min-w-0 flex-col gap-1 px-3 py-2.5">
            <dt>
              <Badge variant="secondary">Variables</Badge>
            </dt>
            <dd className="font-medium text-sm">{entries.length}</dd>
          </div>
          <div className="flex min-w-0 flex-col gap-1 px-3 py-2.5">
            <dt>
              <Badge variant="secondary">Updated</Badge>
            </dt>
            <dd className="truncate font-medium text-sm">{updatedLabel}</dd>
          </div>
        </dl>
        <p className="hidden items-center gap-2 pl-11 text-muted-foreground text-xs sm:flex">
          <span>{countLabel(entries.length)}</span>
          <span aria-hidden="true">·</span>
          <span>Updated {updatedLabel}</span>
        </p>
      </header>

      {entries.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <KeyIcon />
            </EmptyMedia>
            <EmptyTitle>No variables yet</EmptyTitle>
            <EmptyDescription>
              Add variables one at a time, or paste a whole .env file into a key field.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={openAdd}>
              <PlusIcon data-icon="inline-start" />
              Add variables
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <InputGroup className="flex-1">
              <InputGroupAddon>
                <MagnifyingGlassIcon />
              </InputGroupAddon>
              <InputGroupInput
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search keys"
                aria-label="Search keys"
                autoComplete="off"
                spellCheck={false}
              />
            </InputGroup>
            {isDesktop ? (
              <>
                <Button variant="outline" size="sm" onClick={handleCopyAll}>
                  <CopyIcon data-icon="inline-start" />
                  Copy .env
                </Button>
                <Button size="sm" onClick={openAdd}>
                  <PlusIcon data-icon="inline-start" />
                  Add variables
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Copy .env"
                onClick={handleCopyAll}
              >
                <CopyIcon />
              </Button>
            )}
          </div>

          {visibleEntries.length === 0 ? (
            <p className="border border-dashed p-8 text-center text-muted-foreground text-sm">
              No keys match “{query.trim()}”.
            </p>
          ) : isDesktop ? (
            <VariableTable entries={visibleEntries} onEdit={openEdit} onDelete={openDelete} />
          ) : (
            <VariableCardList entries={visibleEntries} onEdit={openEdit} onDelete={openDelete} />
          )}
        </div>
      )}

      {!isDesktop && entries.length > 0 && (
        <Button
          size="icon-lg"
          className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] z-40 size-14 shadow-foreground/20 shadow-lg"
          aria-label="Add variables"
          onClick={openAdd}
        >
          <PlusIcon className="size-5" />
        </Button>
      )}

      {panel?.kind === "rename-folder" && (
        <FolderNameDialog
          key={panelSession}
          open={panelOpen}
          onOpenChange={setPanelOpen}
          title="Rename folder"
          description="The name is visible to the server. Keep secrets out of it."
          submitLabel="Rename"
          defaultName={props.folder.name}
          onSubmit={handleRename}
        />
      )}
      {panel?.kind === "delete-folder" && (
        <DeleteFolderDialog
          key={panelSession}
          folder={props.folder}
          open={panelOpen}
          onOpenChange={setPanelOpen}
          onDeleted={props.onDeleted}
        />
      )}
      {panel?.kind === "add" && (
        <AddVariablesSheet
          key={panelSession}
          open={panelOpen}
          onOpenChange={setPanelOpen}
          existingKeys={keys}
          onSubmit={(added) =>
            saveEntries([...entries, ...added], `Added ${countLabel(added.length)}`)
          }
        />
      )}
      {panel?.kind === "edit" && (
        <EditVariableSheet
          key={panelSession}
          entry={panel.entry}
          otherKeys={keys.filter((key) => key !== panel.entry.key)}
          open={panelOpen}
          onOpenChange={setPanelOpen}
          onSubmit={(edited) =>
            saveEntries(
              entries.map((entry) => (entry.key === panel.entry.key ? edited : entry)),
              `Saved ${edited.key}`,
            )
          }
        />
      )}
      {panel?.kind === "delete" && (
        <DeleteVariableDialog
          key={panelSession}
          entry={panel.entry}
          open={panelOpen}
          onOpenChange={setPanelOpen}
          onConfirm={() =>
            saveEntries(
              entries.filter((entry) => entry.key !== panel.entry.key),
              `Deleted ${panel.entry.key}`,
            )
          }
        />
      )}
    </section>
  )
}
