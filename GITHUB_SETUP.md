# Git And GitHub Setup For Beginners

This guide helps you do four things:

1. install `Git` on Windows
2. turn this folder into a Git repository
3. create a GitHub repository
4. upload this project to GitHub

This is the best next step before VPS deployment because it makes server updates much easier.

## 0. What We Already Know

On your current computer:
- `git` is not available in PowerShell yet
- this project folder is not a Git repository yet
- the code is currently local only

That is a normal starting point.

## 1. Install Git On Windows

### Option A. Recommended

Open:

- [Git for Windows](https://git-scm.com/download/win)

Download the installer and run it.

If the installer asks many questions, the default values are fine.

The only preference I recommend keeping enabled is:
- `Git from the command line and also from 3rd-party software`

When installation finishes:

1. close PowerShell
2. open a **new** PowerShell window
3. run:

```powershell
git --version
```

Expected result:

```text
git version ...
```

If you still see `git is not recognized`, restart Windows once and try again.

## 2. Configure Git One Time

In PowerShell run:

```powershell
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

Use the same email that you plan to use in GitHub.

Check that it was saved:

```powershell
git config --global --list
```

You should see:
- `user.name=...`
- `user.email=...`

## 3. Initialize Git In This Project

Open PowerShell in:

```text
C:\Users\sivko\Documents\site
```

Then run:

```powershell
git init
```

This creates the hidden `.git` folder.

Check status:

```powershell
git status
```

Expected result:
- Git says you are on a branch
- untracked files are shown

## 4. Check What Will Not Go To GitHub

This project already has a good `.gitignore`.

Important things that should stay out of GitHub:
- `.env`
- `.next`
- `node_modules`
- `.data`

You can double-check with:

```powershell
git status --ignored
```

If you see `.env`, `node_modules`, or `.next` under ignored files, that is correct.

## 5. Create The First Commit

Add everything that should be versioned:

```powershell
git add .
```

Then create the first commit:

```powershell
git commit -m "Initial MVP foundation"
```

If Git complains that your name or email is missing, go back to step 2.

## 6. Create A GitHub Account

If you do not already have one:

1. open [GitHub](https://github.com)
2. click `Sign up`
3. create an account
4. verify your email

## 7. Create A Repository On GitHub

After login:

1. click the `+` in the top-right
2. choose `New repository`
3. repository name:

```text
nardy-vision
```

Recommended settings:
- visibility: `Private`
- `Do not` add a README
- `Do not` add `.gitignore`
- `Do not` add a license

Why:
- this project already has those files locally
- creating them on GitHub first can complicate the first push

Then click `Create repository`.

## 8. Connect Local Project To GitHub

GitHub will show commands after repository creation.

Inside your local project folder, run:

```powershell
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/nardy-vision.git
git push -u origin main
```

Replace:

```text
YOUR_USERNAME
```

with your real GitHub username.

## 9. If GitHub Asks For Login

Most likely GitHub will open a browser login flow or ask for credentials.

If it asks for:
- username: use your GitHub username
- password: GitHub may require a token instead of your account password

If that happens, the simplest beginner-friendly path is:

1. install [GitHub Desktop](https://desktop.github.com/)
2. sign in there
3. retry the push from PowerShell

In many cases, modern Git for Windows handles the login flow automatically.

## 10. Verify That The Project Is Really On GitHub

Open:

```text
https://github.com/YOUR_USERNAME/nardy-vision
```

You should see:
- project files
- folders like `src`, `prisma`, `deploy`
- recent commit history

## 11. What To Do For The Second And Third Commits

After future changes, the normal workflow is:

```powershell
git status
git add .
git commit -m "Describe the change"
git push
```

That is enough for now.

## 12. Useful Safety Rules

Before `git add .`, always remember:
- do not put real secrets into `.env.example`
- do not commit your real `.env`
- do not commit `node_modules`
- do not commit `.next`

This project is already configured to ignore those.

## 13. Good First Repository Visibility

For this project I recommend:
- start with a `Private` repository

Later, if you want:
- public marketing visibility
- outside collaboration
- portfolio usage

you can switch it to public after reviewing the repository carefully.

## 14. Optional But Helpful

After Git is installed, you can also install:
- [GitHub Desktop](https://desktop.github.com/)

Why it helps:
- easier sign-in
- visual commit history
- easier push/pull for beginners

But it is optional. The command line steps above are enough.

## 15. What You Should Send Me After This Step

When you finish this GitHub step, send me:

1. whether `git --version` works
2. whether `git init` worked
3. whether the repository was created on GitHub
4. the repository URL

After that, I will take you to the next practical stage:
- buying or choosing a VPS
- buying or choosing a domain
- then the real server deployment
