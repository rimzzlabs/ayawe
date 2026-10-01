import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cn } from "cn"
import { type ComponentProps, createContext, type ReactNode, use } from "react"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useDeferredOpen } from "@/hooks/use-deferred-open"
import { useIsDesktop } from "@/hooks/use-is-desktop"

const ResponsiveSheetContext = createContext(true)

interface ResponsiveSheetProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: ReactNode
}

/** A side sheet on desktop. A bottom drawer on tablets and phones. */
export function ResponsiveSheet(props: ResponsiveSheetProps) {
  const isDesktop = useIsDesktop()
  const Root = isDesktop ? Sheet : Drawer
  const open = useDeferredOpen(props.open)

  return (
    <ResponsiveSheetContext value={isDesktop}>
      <Root open={open} onOpenChange={props.onOpenChange}>
        {props.children}
      </Root>
    </ResponsiveSheetContext>
  )
}

interface ResponsiveSheetContentProps {
  className?: string
  children: ReactNode
}

export function ResponsiveSheetContent(props: ResponsiveSheetContentProps) {
  const isDesktop = use(ResponsiveSheetContext)

  if (isDesktop) {
    return (
      <SheetContent className={cn("gap-0 data-[side=right]:sm:max-w-xl", props.className)}>
        {props.children}
      </SheetContent>
    )
  }
  return <DrawerContent className={props.className}>{props.children}</DrawerContent>
}

/**
 * Lays out the header, body, and footer. Render it as a `<form>` so the footer
 * buttons can submit: `<ResponsiveSheetFrame render={<form />} />`.
 */
export function ResponsiveSheetFrame(props: useRender.ComponentProps<"div">) {
  const { className, render, ...rest } = props
  const isDesktop = use(ResponsiveSheetContext)

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        className: cn(
          isDesktop ? "flex min-h-0 flex-1 flex-col" : "flex flex-col gap-6",
          className,
        ),
      },
      rest,
    ),
  })
}

export function ResponsiveSheetHeader(props: ComponentProps<"div">) {
  const isDesktop = use(ResponsiveSheetContext)
  if (!isDesktop) return <DrawerHeader {...props} />
  return <SheetHeader {...props} className={cn("border-b p-6 pr-16", props.className)} />
}

export function ResponsiveSheetBody(props: ComponentProps<"div">) {
  const isDesktop = use(ResponsiveSheetContext)
  return (
    <div
      {...props}
      className={cn(isDesktop && "min-h-0 flex-1 overflow-y-auto p-6", props.className)}
    />
  )
}

export function ResponsiveSheetFooter(props: ComponentProps<"div">) {
  const isDesktop = use(ResponsiveSheetContext)
  if (!isDesktop) {
    // Pinned to the bottom of the drawer's scroll area, so the buttons stay in reach.
    return (
      <DrawerFooter
        {...props}
        className={cn(
          "sticky bottom-0 z-10 grid grid-cols-2 border-t bg-popover pt-4",
          props.className,
        )}
      />
    )
  }
  return (
    <SheetFooter
      {...props}
      className={cn("mt-0 flex-row justify-end border-t p-6", props.className)}
    />
  )
}

export function ResponsiveSheetTitle(props: ComponentProps<typeof SheetTitle>) {
  const isDesktop = use(ResponsiveSheetContext)
  return isDesktop ? <SheetTitle {...props} /> : <DrawerTitle {...props} />
}

export function ResponsiveSheetDescription(props: ComponentProps<typeof SheetDescription>) {
  const isDesktop = use(ResponsiveSheetContext)
  return isDesktop ? <SheetDescription {...props} /> : <DrawerDescription {...props} />
}

export function ResponsiveSheetClose(props: ComponentProps<typeof SheetClose>) {
  const isDesktop = use(ResponsiveSheetContext)
  return isDesktop ? <SheetClose {...props} /> : <DrawerClose {...props} />
}
