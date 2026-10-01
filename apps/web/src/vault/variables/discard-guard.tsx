import { useBlocker } from "@tanstack/react-router"
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

// Stable, so the blocker does not register again on every render. `disabled` does the switching.
function blockNavigation() {
  return true
}

/**
 * Asks before unsaved changes are lost: when the sheet closes, when the app navigates away
 * (Back button, Lock, Sign out), and when the tab closes.
 */
export function useDiscardGuard(params: DiscardGuardParams) {
  const [confirming, setConfirming] = useState(false)
  const hasChanges = params.isDirty && !params.isPending
  const blocker = useBlocker({
    shouldBlockFn: blockNavigation,
    disabled: !hasChanges,
    enableBeforeUnload: hasChanges,
    withResolver: true,
  })
  const navigationBlocked = blocker.status === "blocked"

  function handleOpenChange(open: boolean) {
    if (open) return
    // Esc or a swipe on the confirmation means "keep editing", not "close everything".
    if (confirming || navigationBlocked) {
      keepEditing()
      return
    }
    if (hasChanges) {
      setConfirming(true)
      return
    }
    params.onClose()
  }

  function keepEditing() {
    setConfirming(false)
    blocker.reset?.()
  }

  function discard() {
    // A blocked navigation continues and unmounts the sheet. A plain close only closes it.
    if (navigationBlocked) {
      blocker.proceed?.()
      return
    }
    params.onClose()
  }

  return {
    confirming: confirming || navigationBlocked,
    handleOpenChange,
    keepEditing,
    discard,
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
