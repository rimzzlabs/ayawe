import { ArrowLeftIcon, PencilSimpleIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { type FolderSummary, renameFolder } from "@/lib/api"
import type { Entry } from "@/lib/dotenv"
import type { Session } from "@/lib/screen"
import { DeleteFolderButton } from "@/vault/delete-folder-button"
import { FolderNameDialog } from "@/vault/folder-name-dialog"
import { SecretsForm } from "@/vault/secrets-form"

interface FolderScreenProps {
  session: Session
  folder: FolderSummary
  entries: Entry[]
  onChanged: (folder: FolderSummary) => void
  onDeleted: (id: string) => void
  onBack: () => void
}

export function FolderScreen(props: FolderScreenProps) {
  async function handleRename(name: string) {
    const renamed = await renameFolder(props.folder.id, name)
    if (!renamed.ok) return renamed.error.message
    props.onChanged(renamed.value)
    return undefined
  }

  return (
    <section className="flex flex-col gap-8">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" aria-label="Back to folders" onClick={props.onBack}>
          <ArrowLeftIcon />
        </Button>
        <h1 className="min-w-0 flex-1 truncate font-heading text-2xl">{props.folder.name}</h1>
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

      <SecretsForm
        session={props.session}
        folder={props.folder}
        initialEntries={props.entries}
        onSaved={(updatedAt) => props.onChanged({ ...props.folder, updatedAt })}
      />
    </section>
  )
}
