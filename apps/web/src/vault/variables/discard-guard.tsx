import { useState } from "react"
import {
  ResponsiveSheetBody,
  ResponsiveSheetDescription,
  ResponsiveSheetFooter,
  ResponsiveSheetFrame,
  ResponsiveSheetHeader,
  ResponsiveSheetTitle,
} from "@/components/responsive-sheet"
import { Button } from "@/components/ui/button"

interface DiscardGuardParams {
  isDirty: boolean
  isPending: boolean
  onClose: () => void
}

/** Asks before a sheet with unsaved changes closes. */
export function useDiscardGuard(params: DiscardGuardParams) {
  const [confirming, setConfirming] = useState(false)

  function handleOpenChange(open: boolean) {
    if (open) return
    // Esc or a swipe on the confirmation means "keep editing", not "close everything".
    if (confirming) {
      setConfirming(false)
      return
    }
    if (params.isDirty && !params.isPending) {
      setConfirming(true)
      return
    }
    params.onClose()
  }

  return {
    confirming,
    handleOpenChange,
    keepEditing: () => setConfirming(false),
    discard: params.onClose,
  }
}

interface DiscardConfirmationProps {
  onKeepEditing: () => void
  onDiscard: () => void
}

// The confirmation replaces the form inside the same sheet. A second, stacked sheet
// gets no backdrop of its own, so the first one shows through around it.
export function DiscardConfirmation(props: DiscardConfirmationProps) {
  return (
    <ResponsiveSheetFrame>
      <ResponsiveSheetHeader>
        <ResponsiveSheetTitle>Discard changes?</ResponsiveSheetTitle>
        <ResponsiveSheetDescription id="discard-variables-description">
          Your changes are not saved. If you close now, they are gone.
        </ResponsiveSheetDescription>
      </ResponsiveSheetHeader>
      <ResponsiveSheetBody />
      <ResponsiveSheetFooter>
        <Button
          type="button"
          variant="outline"
          autoFocus
          aria-describedby="discard-variables-description"
          onClick={props.onKeepEditing}
        >
          Keep editing
        </Button>
        <Button type="button" variant="destructive" onClick={props.onDiscard}>
          Discard
        </Button>
      </ResponsiveSheetFooter>
    </ResponsiveSheetFrame>
  )
}
