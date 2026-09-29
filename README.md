# ayawe

A small vault for your environment variables. You paste a `.env` file on one machine and copy it on another machine. Your browser encrypts the values before they leave it, so the server stores only ciphertext.

"Aya wé" is Sundanese for "it is around here somewhere".

## Features

- Sign in with GitHub. A vault password encrypts your data, and a recovery code opens the vault if you forget the password.
- Keep one folder for each project. Each folder holds key-value environment variables.
- Paste a full `.env` file into a key field. Each line becomes one row.
- Copy a folder as a `.env` file.
- Host your own copy on the Cloudflare free plan.

## How it works

The browser does all encryption. The server never gets your vault password, your key, or your values.

1. Your browser derives a key from the vault password with PBKDF2 (SHA-256, 600,000 rounds).
2. A random data key encrypts each folder with AES-256-GCM. The password key and the recovery code each wrap one copy of the data key.
3. A Cloudflare Worker stores the ciphertext and the wrapped keys in a D1 database.
4. On another device, the same vault password gives the same password key. The browser unwraps the data key with it and decrypts the folders.

Know these limits before you use ayawe:

- The server can read folder names. Do not put secrets in a folder name.
- If you lose the vault password and the recovery code, nobody can decrypt your data. This includes the server owner.
- The web app is only as safe as the server that sends its JavaScript. Host your own copy if you do not trust the host.

## Stack

| Part       | Tools                                                                 |
| ---------- | --------------------------------------------------------------------- |
| Monorepo   | [moon](https://moonrepo.dev), pnpm workspaces                         |
| Web app    | Vite, React 19, shadcn/ui (Base UI), Tailwind CSS v4, React Hook Form |
| API        | Hono on Cloudflare Workers, Cloudflare D1                             |
| Encryption | Web Crypto API (PBKDF2, AES-256-GCM)                                  |
| Quality    | Biome, Prettier, Vitest, Lefthook, commitlint                         |

## Repository layout

```text
apps/
  api/        Hono Worker: GitHub sign-in, sessions, keyring, and folders (D1)
  web/        React app: landing page, vault password flow, and folder editor
packages/
  crypto/     Envelope encryption that the browser uses (Web Crypto, with tests)
```

## Run it locally

You need Node.js 20 or later and pnpm 10.

1. Install the dependencies. This step also installs the git hooks.

   ```sh
   pnpm install
   ```

2. Copy the example file for the local environment variables.

   ```sh
   cp apps/api/.dev.vars.example apps/api/.dev.vars
   ```

3. Start the API and the web app.

   ```sh
   pnpm exec moon run api:dev web:dev
   ```

4. Open http://localhost:5173.
5. Click **Continue as dev user**.

The dev user works only when `DEV_LOGIN=true` and `APP_URL` is on localhost. To test the real GitHub sign-in, make a GitHub OAuth app with the callback URL `http://localhost:5173/api/auth/github/callback`. Then put its client ID and client secret in `apps/api/.dev.vars`.

### Common tasks

| Task                        | Command                         |
| --------------------------- | ------------------------------- |
| Check types in all projects | `pnpm exec moon run :typecheck` |
| Lint all projects           | `pnpm exec moon run :lint`      |
| Run all tests               | `pnpm exec moon run :test`      |
| Build the web app           | `pnpm exec moon run web:build`  |
| Format all files            | `pnpm format`                   |

moon caches each task. If the inputs of a task did not change, moon skips the task.

## Host your own copy

You need a Cloudflare account. Run these steps in `apps/api`.

1. Sign in to Cloudflare.

   ```sh
   pnpm exec wrangler login
   ```

2. Create the database.

   ```sh
   pnpm exec wrangler d1 create ayawe
   ```

3. Copy the `database_id` from the output into `apps/api/wrangler.jsonc`.
4. Make a GitHub OAuth app. Use `https://ayawe.<your-subdomain>.workers.dev/api/auth/github/callback` as the callback URL.
5. Add the secrets. Wrangler asks for each value.

   ```sh
   pnpm exec wrangler secret put APP_URL
   pnpm exec wrangler secret put GITHUB_CLIENT_ID
   pnpm exec wrangler secret put GITHUB_CLIENT_SECRET
   pnpm exec wrangler secret put ALLOWED_GITHUB_USERS
   ```

6. Deploy the app. This command builds the web app, applies the D1 migrations, and deploys the Worker.

   ```sh
   pnpm exec moon run api:deploy
   ```

To update your copy, pull the new code and run the deploy command again.

### Environment variables

| Name                   | Required | Description                                                                                         |
| ---------------------- | -------- | --------------------------------------------------------------------------------------------------- |
| `APP_URL`              | Yes      | The public URL of the app, for example `https://ayawe.example.workers.dev`.                         |
| `GITHUB_CLIENT_ID`     | Yes      | The client ID of your GitHub OAuth app.                                                             |
| `GITHUB_CLIENT_SECRET` | Yes      | The client secret of your GitHub OAuth app.                                                         |
| `ALLOWED_GITHUB_USERS` | No       | GitHub logins that can sign in, separated by commas. If it is empty, every GitHub user can sign in. |
| `DEV_LOGIN`            | No       | Set to `true` for local development only. The server ignores it when `APP_URL` is not on localhost. |

## Contributing

Commit messages must follow [Conventional Commits](https://www.conventionalcommits.org). A git hook checks each message with commitlint. Other hooks format the staged files and check the types before each commit.

[release-please](https://github.com/googleapis/release-please) reads the commit messages on `main`. It opens a release pull request with the next version and the changelog.

## License

[MIT](LICENSE)
