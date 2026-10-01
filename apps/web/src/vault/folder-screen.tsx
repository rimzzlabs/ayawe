import {
  ArrowLeftIcon,
  CopyIcon,
  KeyIcon,
  LockSimpleIcon,
  MagnifyingGlassIcon,
  PencilSimpleIcon,
  PlusIcon,
} from "@phosphor-icons/react"
import { useState } from "react"
import { PageHeading } from "@/components/page-heading"
import { Button } from "@/components/ui/button"
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
import { DeleteFolderButton } from "@/vault/delete-folder-button"
import { FolderNameDialog } from "@/vault/folder-name-dialog"
import { AddVariablesSheet } from "@/vault/variables/add-variables-sheet"
import { DeleteVariableDialog } from "@/vault/variables/delete-variable-dialog"
import { EditVariableSheet } from "@/vault/variables/edit-variable-sheet"
import { VariableCardList } from "@/vault/variables/variable-card-list"
import { VariableTable } from "@/vault/variables/variable-table"

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" })

type Panel = { kind: "add" } | { kind: "edit"; entry: Entry } | { kind: "delete"; entry: Entry }

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
          <FolderNameDialog
            title="Rename folder"
            description="The name is visible to the server. Keep secrets out of it."
            submitLabel="Rename"
            defaultName={props.folder.name}
            onSubmit={handleRename}
            trigger={
              <Button variant="ghost" size="icon-sm" aria-label="Rename folder">
                <PencilSimpleIcon />
              </Button>
            }
          />
          <DeleteFolderButton folder={props.folder} onDeleted={props.onDeleted} />
        </div>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 pl-11 text-muted-foreground text-xs">
          <span>{countLabel(entries.length)}</span>
          <span aria-hidden="true">·</span>
          <span>Updated {dateFormat.format(new Date(props.folder.updatedAt))}</span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <LockSimpleIcon aria-hidden="true" />
            End-to-end encrypted
          </span>
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
