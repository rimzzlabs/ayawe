import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { DiscardChangesDialog } from "@/components/discard-changes-dialog"

interface UnsavedChanges {
  setDirty: (dirty: boolean) => void
  /** Runs `leave` now, or first asks the user to discard their unsaved changes. */
  confirmLeave: (leave: () => void) => void
}

const UnsavedChangesContext = createContext<UnsavedChanges | null>(null)

interface UnsavedChangesProviderProps {
  children: ReactNode
}

export function UnsavedChangesProvider(props: UnsavedChangesProviderProps) {
  // A ref, not state: the flag changes on every keystroke and nothing renders from it.
  const dirtyRef = useRef(false)
  const [pendingLeave, setPendingLeave] = useState<(() => void) | null>(null)

  const value = useMemo<UnsavedChanges>(
    () => ({
      setDirty: (dirty) => {
        dirtyRef.current = dirty
      },
      confirmLeave: (leave) => {
        if (!dirtyRef.current) {
          leave()
          return
        }
        setPendingLeave(() => leave)
      },
    }),
    [],
  )

  function handleDiscard() {
    const leave = pendingLeave
    dirtyRef.current = false
    setPendingLeave(null)
    leave?.()
  }

  return (
    <UnsavedChangesContext.Provider value={value}>
      {props.children}
      <DiscardChangesDialog
        open={pendingLeave !== null}
        onKeepEditing={() => setPendingLeave(null)}
        onDiscard={handleDiscard}
      />
    </UnsavedChangesContext.Provider>
  )
}

/** Marks the screen as having unsaved changes, and warns before a reload or tab close. */
export function useUnsavedChanges(isDirty: boolean) {
  const context = useContext(UnsavedChangesContext)

  // Syncs with two outside systems: the provider's flag and the browser's beforeunload prompt.
  useEffect(() => {
    context?.setDirty(isDirty)
    if (!isDirty) return

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault()
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      context?.setDirty(false)
    }
  }, [context, isDirty])
}

export function useConfirmLeave() {
  const context = useContext(UnsavedChangesContext)
  return context?.confirmLeave ?? ((leave: () => void) => leave())
}
