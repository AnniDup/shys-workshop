# Workflow

How work moves from this machine to the live site. Every command runs in the VS Code terminal (`` Ctrl+` ``).

| Place | What it is |
|---|---|
| Local | This machine. Where work happens and gets previewed. |
| `dev` on GitHub | Backed-up work in progress. Checked on every push. |
| `main` on GitHub | The live site. Only changes through a pull request. |

## One-Off Setup

### Script Blocking on Windows

PowerShell blocks npm by default. The error looks like:

```
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system.
```

Fix, once per user account:

```
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Type `Y` if asked, then open a new terminal.

If that command is refused (managed laptops can lock it), switch the terminal to Command Prompt:

1. `Ctrl+Shift+P` → **Terminal: Select Default Profile** → **Command Prompt**.
2. Open a new terminal.

Every command in this file works in both.

### GitHub CLI

Needed for releasing from the terminal. Install from https://cli.github.com, open a new terminal, then:

```
gh auth login
```

Choose **GitHub.com**, **HTTPS**, and **Login with a web browser**.

## Day Start

```
git switch dev
git pull
npm run dev
```

- Open http://localhost:4321.
- If `package.json` changed since last time, run `npm install` before `npm run dev`.

`npm run dev` keeps that terminal busy. Open a second terminal with the **+** in the terminal panel for Git commands while it runs.

## During Work

Check where you are at any time:

```
git status
```

Commit each finished piece:

```
git add -A
git commit -m "Add project card component"
```

- One working thing per commit, with a message saying what changed.
- To stage a single file instead: `git add src/pages/index.astro`.

Sync after a commit or two. This backs up the work and runs Check on GitHub:

```
git push
```

Check the result:

```
gh run list --limit 3
```

- Red: `gh run view --log-failed` shows the error. Fix, commit, push.

Before a big push, run the same check GitHub runs:

```
npm run build
```

Never work on `main`. A rejected push to `main` is the ruleset doing its job.

## End of Day

Stop the dev server with `Ctrl+C` in its terminal, then:

```
git add -A
git commit -m "WIP: filter sidebar"
git push
gh run list --limit 1
```

- Prefix unfinished work with `WIP:`. A red Check on `dev` is fine; nothing reaches the live site.
- Release only if `dev` is ready to go live.

## Release

### 1. Preview the Production Build

```
npm run build
npm run preview
```

Click through the pages at http://localhost:4321, then `Ctrl+C`.

### 2. Open, Check and Merge

```
gh pr create --base main --head dev --title "Project page layout" --body ""
gh pr checks --watch
gh pr merge --merge
```

- Title the pull request with what's going live.
- Only merge once **Check and build** passes.
- Always `--merge`. Never `--squash`; it makes `main` and `dev` drift apart and causes conflicts later.
- If asked whether to delete the branch, answer **No**. That's `dev`.

### 3. Watch the Deploy

```
gh run watch
```

Pick the **Deploy to GitHub Pages** run. When it finishes, refresh the live site with `Ctrl+F5`.

### 4. Bring Dev Level With Main

```
git switch dev
git pull origin main
git push
```

## Undoing Things

```
git restore src/pages/index.astro           # discard uncommitted changes in a file
git restore --staged src/pages/index.astro  # unstage a file, keep the changes
git commit --amend -m "Better message"      # fix the last commit's message
```

- `git restore` on a file permanently discards its uncommitted changes.
- Only `--amend` a commit that hasn't been pushed. Amending a pushed commit rewrites history and the next push is rejected.

## Quick Reference

| Command | Does |
|---|---|
| `git status` | Branch, changed files, what's staged |
| `git switch dev` | Move to the dev branch |
| `git pull` | Fetch the latest from GitHub |
| `git add -A` | Stage everything changed |
| `git commit -m "..."` | Commit staged changes |
| `git push` | Send commits to GitHub |
| `git log --oneline -10` | Last 10 commits |
| `npm run dev` | Live preview while working |
| `npm run build` | Check and build, same as GitHub |
| `npm run preview` | Serve the production build locally |
| `gh run list --limit 3` | Latest workflow results |
| `gh run view --log-failed` | Error details for a failed run |
| `gh pr create ...` | Open the release pull request |
| `gh pr checks --watch` | Wait for Check to finish |
| `gh pr merge --merge` | Merge the release |
| `gh run watch` | Follow a running workflow |
