import { CaretRightIcon, FileTextIcon, PlusIcon, VaultIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item"
import { Spinner } from "@/components/ui/spinner"

interface VaultListProps {
  names: string[]
  openingName: string | null
  onOpen: (name: string) => void
  onNew: () => void
}

export function VaultList(props: VaultListProps) {
  if (props.names.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <VaultIcon />
          </EmptyMedia>
          <EmptyTitle>No env files yet</EmptyTitle>
          <EmptyDescription>Paste a .env or .dev.vars file to keep it here.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={props.onNew}>
            <PlusIcon data-icon="inline-start" />
            New env file
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-2xl">Env files</h1>
        <Button size="sm" onClick={props.onNew}>
          <PlusIcon data-icon="inline-start" />
          New
        </Button>
      </div>
      <ul className="flex flex-col gap-2">
        {props.names.map((name) => (
          <li key={name}>
            <Item
              variant="outline"
              size="sm"
              className="w-full text-left"
              render={
                <button
                  type="button"
                  disabled={props.openingName !== null}
                  onClick={() => props.onOpen(name)}
                />
              }
            >
              <ItemMedia variant="icon">
                <FileTextIcon />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="font-mono">{name}</ItemTitle>
              </ItemContent>
              <ItemActions>
                {props.openingName === name ? <Spinner /> : <CaretRightIcon />}
              </ItemActions>
            </Item>
          </li>
        ))}
      </ul>
    </section>
  )
}
