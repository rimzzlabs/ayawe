# ayawe

A small vault for your environment variables. You paste a `.env` file on one machine and copy it on another machine. Your browser encrypts the values before they leave it, so the server stores only ciphertext.

ayawe is a starting point. It does one job: it keeps the values of one developer encrypted. The code is small and MIT licensed, so you can extend it for a team. The [Extend it](#extend-it) section shows where each part lives.

The instance at `ayawe.rimzzlabs.com` is private. To use ayawe, [host your own copy](#host-your-own-copy). It runs on the Cloudflare free plan.

"Aya wé" is Sundanese for "it is around here somewhere".

## Features

- Sign in with GitHub. An allow list controls which GitHub accounts can sign in.
- A vault password encrypts your data. A recovery code opens the vault if you forget the password.
- Keep one folder for each project. Each folder holds key-value environment variables.
- Paste a full `.env` file into a key field. Each line becomes one variable.
- Copy a folder as a `.env` file.
- Multi-line values, for example PEM private keys, keep their line breaks.
- Search finds keys by word starts and small typos. The query `dps` finds `DATABASE_POOL_SIZE`.
- The vault locks after a page reload or after 15 minutes without input.
- The folder screens work on phones and tablets.

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

| Part       | Tools                                                                                  |
| ---------- | -------------------------------------------------------------------------------------- |
| Monorepo   | [moon](https://moonrepo.dev), pnpm workspaces                                          |
| Web app    | Vite, React 19, TanStack Router, shadcn/ui (Base UI), Tailwind CSS v4, React Hook Form |
| API        | Hono on Cloudflare Workers, Cloudflare D1                                              |
| Encryption | Web Crypto API (PBKDF2, AES-256-GCM)                                                   |
| Quality    | Biome, Prettier, Vitest, Lefthook, commitlint                                          |

## Repository layout

```text
apps/
  api/        Hono Worker: GitHub sign-in, sessions, keyring, and folders (D1)
  web/        React app: landing page, vault password flow, and folder editor
packages/
  crypto/     Envelope encryption that the browser uses (Web Crypto, with tests)
```

## Run it locally

You need Node.js 20.19 or later and pnpm 10.

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

4. Open http://localhost:5173/sign-in.
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

The setup takes about 10 minutes. You need these items:

- A Cloudflare account. The free plan is sufficient.
- A GitHub account.
- Node.js 20.19 or later and pnpm 10.

### 1. Get the code

1. Fork this repository on GitHub. A fork lets you deploy from GitHub Actions later.
2. Clone your fork and install the dependencies.

   ```sh
   git clone https://github.com/<your-username>/ayawe.git
   cd ayawe
   pnpm install
   ```

### 2. Create the database

Run these commands in `apps/api`.

1. Sign in to Cloudflare.

   ```sh
   pnpm exec wrangler login
   ```

2. Create the database.

   ```sh
   pnpm exec wrangler d1 create ayawe
   ```

3. Copy the `database_id` from the output into `apps/api/wrangler.jsonc`.

### 3. Choose the address of your app

The file `apps/api/wrangler.jsonc` has a `routes` entry with the domain of the original instance. Your deploy fails if you keep it. Do one of these steps:

- To use the free `workers.dev` address, delete the `routes` entry. Your app URL is then `https://ayawe.<your-subdomain>.workers.dev`.
- To use your own domain, change the `pattern` to your domain. The domain must be on your Cloudflare account. Your app URL is then `https://<your-domain>`.

In the next steps, `<app-url>` means the URL that you chose here.

### 4. Make a GitHub OAuth app

1. Open the [GitHub developer settings](https://github.com/settings/developers).
2. Create a new OAuth app.
3. Set the homepage URL to `<app-url>`.
4. Set the callback URL to `<app-url>/api/auth/github/callback`.
5. Generate a client secret. Keep the client ID and the client secret for the next step.

### 5. Set the Worker secrets

Run these commands in `apps/api`. Wrangler asks for each value. If Wrangler asks to create the Worker, answer yes.

```sh
pnpm exec wrangler secret put APP_URL
pnpm exec wrangler secret put GITHUB_CLIENT_ID
pnpm exec wrangler secret put GITHUB_CLIENT_SECRET
pnpm exec wrangler secret put ALLOWED_GITHUB_USERS
```

CAUTION: Set `ALLOWED_GITHUB_USERS` to your GitHub username. If it is empty, every GitHub user can sign in and store data on your account.

### 6. Deploy

Run this command in the repository root. It builds the web app, applies the D1 migrations, and deploys the Worker.

```sh
pnpm exec moon run api:deploy
```

If you use your own domain, set `SITE_URL` in the same command. Then the search tags, `robots.txt`, and `sitemap.xml` point to your domain.

```sh
SITE_URL=https://<your-domain> pnpm exec moon run api:deploy
```

Open `<app-url>` and sign in with GitHub. Then set your vault password and save the recovery code.

### Deploy from GitHub Actions

The workflow in `.github/workflows/release-please.yml` deploys each new release. To use it in your fork, do these steps:

1. Create a Cloudflare API token with edit access to Workers and D1.
2. In your fork, add the repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
3. Optional: add the repository variable `SITE_URL` if you use your own domain.
4. In the repository settings, let GitHub Actions create pull requests. release-please needs this permission.

After this setup, merge the release pull request that release-please opens. The merge deploys the new version.

### Update your copy

1. Pull the changes from this repository into your fork.
2. Run the deploy command again.

### Environment variables

| Name                   | Where     | Required | Description                                                                                                |
| ---------------------- | --------- | -------- | ---------------------------------------------------------------------------------------------------------- |
| `APP_URL`              | Worker    | Yes      | The public URL of the app, for example `https://ayawe.example.workers.dev`.                                |
| `GITHUB_CLIENT_ID`     | Worker    | Yes      | The client ID of your GitHub OAuth app.                                                                    |
| `GITHUB_CLIENT_SECRET` | Worker    | Yes      | The client secret of your GitHub OAuth app.                                                                |
| `ALLOWED_GITHUB_USERS` | Worker    | No       | GitHub logins that can sign in, separated by commas. If it is empty, every GitHub user can sign in.        |
| `DEV_LOGIN`            | Worker    | No       | Set to `true` for local development only. The server ignores it when `APP_URL` is not on localhost.        |
| `SITE_URL`             | Web build | No       | The public URL for the search tags, `robots.txt`, and `sitemap.xml`. The default is the original instance. |

## Extend it

ayawe keeps the base small, so you can add what your team needs. This section shows where each part lives and what each extension touches.

### Where each part lives

| Part                   | Location                      | Contents                                                                 |
| ---------------------- | ----------------------------- | ------------------------------------------------------------------------ |
| Database schema        | `apps/api/migrations`         | The `users`, `sessions`, and `folders` tables.                           |
| Sign-in                | `apps/api/src/auth`           | GitHub OAuth, the dev user, and the session cookie.                      |
| API routes             | `apps/api/src/routes`         | The keyring, the folders, and the current user.                          |
| Encryption             | `packages/crypto/src`         | Key derivation, the keyring with its two key slots, and AES-GCM sealing. |
| Session in the browser | `apps/web/src/lib/session.ts` | The signed-in user, the keyring, and the vault key in memory.            |
| Pages and guards       | `apps/web/src/routes`         | TanStack Router file routes. Each `beforeLoad` function guards one page. |
| Folder screens         | `apps/web/src/vault`          | The variable table, the cards, and the add and edit sheets.              |

### Ideas and where they start

- **Teams and organizations.** Today, one data key per user encrypts all folders of that user. For shared folders, give each folder its own data key. Then wrap that key once for each member. A member key pair (for example ECDH) lets one member wrap a key for another member without the password of that member. The work starts in `packages/crypto` and in a new `organizations` and `memberships` schema.
- **A CLI for CI and deploys.** A CLI can unlock the keyring with the vault password on the machine and write a `.env` file. The API needs a token type for machines. The work starts in `apps/api/src/auth` and `packages/crypto`.
- **History and an audit log.** Each save replaces the ciphertext of a folder. To keep history, store each old ciphertext in a new table before the update. The work starts in `apps/api/src/routes/folders.ts`.

Keep one rule in each extension: the server must never receive a key or a plain value.

## Contributing

Commit messages must follow [Conventional Commits](https://www.conventionalcommits.org). A git hook checks each message with commitlint. Other hooks format the staged files and check the types before each commit.

[release-please](https://github.com/googleapis/release-please) reads the commit messages on `main`. It opens a release pull request with the next version and the changelog.

## License

[MIT](LICENSE)
