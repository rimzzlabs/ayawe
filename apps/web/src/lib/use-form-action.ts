import { startTransition, useActionState, type FormEvent } from "react"

type FormHandler = (formData: FormData) => Promise<string | undefined>

// A plain `<form action>` resets its inputs after each submit.
// This hook submits through a transition instead, so the user keeps what they typed when an error shows.
export function useFormAction(handler: FormHandler, initialError?: string) {
  const [error, dispatch, pending] = useActionState(
    (_previous: string | undefined, formData: FormData) => handler(formData),
    initialError,
  )

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    startTransition(() => dispatch(formData))
  }

  return { error, pending, onSubmit }
}

export function readField(formData: FormData, name: string) {
  const value = formData.get(name)
  return typeof value === "string" ? value.trim() : ""
}
