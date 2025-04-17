# 🤝 Contributing to the UZH Uniswap V3 Lottery dApp

Thanks for your interest in contributing! This repo uses a clean, GitHub-based workflow with branch protections and pull requests. Please follow the steps below to ensure consistency and maintainability.

---

## 📝 1. Assign an Issue

- Browse open issues or create a new one.
- Assign yourself to the issue so others know you're working on it.
- Discuss any unclear scope or open questions in the issue comments before coding.

---

## 🌱 2. Create a Feature Branch

Create your branch locally from `main` using this naming convention:

```bash
git checkout -b #{issue_number}_{short_description}
```

**Example:**

```bash
git checkout -b #42_add-wallet-connect
```

---

## 🔁 3. Pull the Latest Changes

Always ensure your local `main` is up-to-date before starting or rebasing:

```bash
git checkout main
git pull origin main
```

---

## 🔧 4. Develop & Commit

- Keep commits meaningful and atomic.
- Run formatters and linters **before** committing:

```bash
yarn format
yarn lint
```

---

## ⚠️ 5. Rebase to Resolve Conflicts

If your branch is behind `main`, rebase it instead of merging:

```bash
git fetch origin
git rebase origin/main
```

This keeps the commit history clean.

> 📘 [Git rebase guide](https://www.atlassian.com/git/tutorials/rewriting-history/git-rebase)

If you run into conflicts:

- Fix them
- `git add .`
- Continue with: `git rebase --continue`

---

## 🚀 6. Push and Create a Pull Request

After rebasing:

```bash
git push --set-upstream origin your-branch-name
```

Then go to GitHub and open a **Pull Request** into `main`.

---

## 🧑‍⚖️ 7. Wait for Review

- At least one team member should review and approve your changes.
- Address all comments and suggestions.

---

## 🔁 8. Rebase Again if Needed

If `main` has moved ahead, rebase again:

```bash
git rebase origin/main
```

---

## ✅ 9. Merge and Celebrate!

Once your PR is approved and CI checks pass, the PR will be merged via GitHub.

---

## ✨ Bonus: Checklist Before You PR

- [ ] ✅ Code is formatted and linted
- [ ] ✅ Tests (if any) are passing
- [ ] ✅ You followed the branch naming convention
- [ ] ✅ You rebased instead of merged
- [ ] ✅ No `.env` files or local dev junk is committed
