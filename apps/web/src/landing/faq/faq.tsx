import { CaretDownIcon } from "@phosphor-icons/react"

const QUESTIONS = [
  {
    question: "Can I sign up here?",
    answer:
      "No. Each ayawe instance is private to the GitHub accounts its owner allows. Deploy your own copy with the steps above. It takes about 10 minutes on Cloudflare's free plan.",
  },
  {
    question: "Can the server read my values?",
    answer:
      "No. Your browser encrypts each folder with a key derived from your vault password. The server receives ciphertext, and it never receives the password or the key.",
  },
  {
    question: "What does the server know about me?",
    answer:
      "Your GitHub user ID, username, and avatar URL. Your folder names, when each folder was created and last changed, and the size of its encrypted data. Not your values, and not your vault password.",
  },
  {
    question: "What if I forget my vault password?",
    answer:
      "Use the recovery code from setup to set a new password. If you lose both, nobody can decrypt the vault, not even the person who runs the server. That is the cost of keeping the key away from the server.",
  },
  {
    question: "Why sign in with GitHub?",
    answer:
      "GitHub proves who you are, so ayawe stores no account passwords. Sign-in and encryption are separate: GitHub never sees your vault password or your values.",
  },
  {
    question: "Can I share a folder with my team?",
    answer:
      "Not by default. Each vault belongs to one GitHub account. ayawe is a starting point: fork it to add organizations, shared folders, or roles.",
  },
  {
    question: "Is it free?",
    answer:
      "Yes. ayawe is MIT licensed, and your copy runs on Cloudflare's free plan. The source for the encryption, the API, and this page is on GitHub.",
  },
]

export function Faq() {
  return (
    <section aria-labelledby="faq" className="flex flex-col gap-8 border-t pt-12">
      <h2 id="faq" className="font-heading text-3xl">
        Questions
      </h2>

      <div className="border-t">
        {QUESTIONS.map((item) => (
          // Native <details>, so the answers open without JavaScript and stay in the prerendered HTML.
          <details key={item.question} className="group border-b">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
              {item.question}
              <CaretDownIcon
                className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <p className="max-w-xl pb-4 text-muted-foreground text-sm">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
