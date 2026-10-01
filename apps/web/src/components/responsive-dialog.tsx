import { type ComponentProps, createContext, type ReactNode, use } from "react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useMediaQuery } from "@/hooks/use-media-query"

// Tailwind `lg`. Tablets and phones are narrower, so they get a bottom drawer.
const DESKTOP_QUERY = "(min-width: 64rem)"

type ResponsiveDialogRole = "dialog" | "alertdialog"

interface ResponsiveDialogContextValue {
  isDesktop: boolean
  role: ResponsiveDialogRole
}

const ResponsiveDialogContext = createContext<ResponsiveDialogContextValue>({
  isDesktop: true,
  role: "dialog",
})

interface ResponsiveDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: ReactNode
}

interface ResponsiveRootProps extends ResponsiveDialogProps {
  role: ResponsiveDialogRole
}

function ResponsiveRoot(props: ResponsiveRootProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const Root = isDesktop ? Dialog : Drawer

  return (
    <ResponsiveDialogContext value={{ isDesktop, role: props.role }}>
      <Root
        open={props.open}
        onOpenChange={props.onOpenChange}
        disablePointerDismissal={props.role === "alertdialog"}
      >
        {props.children}
      </Root>
    </ResponsiveDialogContext>
  )
}

export function ResponsiveDialog(props: ResponsiveDialogProps) {
  return <ResponsiveRoot {...props} role="dialog" />
}

/** Asks the user to confirm an action. A click outside does not close it. */
export function ResponsiveAlertDialog(props: ResponsiveDialogProps) {
  return <ResponsiveRoot {...props} role="alertdialog" />
}

export function ResponsiveDialogTrigger(
  props: Omit<ComponentProps<typeof DialogTrigger>, "handle">,
) {
  const context = use(ResponsiveDialogContext)
  return context.isDesktop ? <DialogTrigger {...props} /> : <DrawerTrigger {...props} />
}

export function ResponsiveDialogClose(props: ComponentProps<typeof DialogClose>) {
  const context = use(ResponsiveDialogContext)
  return context.isDesktop ? <DialogClose {...props} /> : <DrawerClose {...props} />
}

interface ResponsiveDialogContentProps {
  className?: string
  children: ReactNode
}

export function ResponsiveDialogContent(props: ResponsiveDialogContentProps) {
  const context = use(ResponsiveDialogContext)

  if (context.isDesktop) {
    return (
      <DialogContent role={context.role} showCloseButton={false} className={props.className}>
        {props.children}
      </DialogContent>
    )
  }
  return (
    <DrawerContent role={context.role} className={props.className}>
      {props.children}
    </DrawerContent>
  )
}

export function ResponsiveDialogHeader(props: ComponentProps<"div">) {
  const context = use(ResponsiveDialogContext)
  return context.isDesktop ? <DialogHeader {...props} /> : <DrawerHeader {...props} />
}

export function ResponsiveDialogFooter(props: ComponentProps<"div">) {
  const context = use(ResponsiveDialogContext)
  return context.isDesktop ? <DialogFooter {...props} /> : <DrawerFooter {...props} />
}

export function ResponsiveDialogTitle(props: ComponentProps<typeof DialogTitle>) {
  const context = use(ResponsiveDialogContext)
  return context.isDesktop ? <DialogTitle {...props} /> : <DrawerTitle {...props} />
}

export function ResponsiveDialogDescription(props: ComponentProps<typeof DialogDescription>) {
  const context = use(ResponsiveDialogContext)
  return context.isDesktop ? <DialogDescription {...props} /> : <DrawerDescription {...props} />
}
