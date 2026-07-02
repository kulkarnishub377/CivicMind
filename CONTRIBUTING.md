# Contributing to CivicMind

First off, thank you for considering contributing to CivicMind! It's people like you that make CivicMind such a great tool.

## 1. Where do I go from here?

If you've noticed a bug or have a feature request, make sure to check our [Issues](../../issues) to see if someone else in the community has already created a ticket. If not, go ahead and [make one](../../issues/new/choose)!

## 2. Fork & create a branch

If this is something you think you can fix, then fork CivicMind and create a branch with a descriptive name.

A good branch name would be (where issue #325 is the ticket you're working on):

```sh
git checkout -b 325-add-new-prediction-model
```

## 3. Get the test suite running

Make sure you're running the application locally. Refer to the `README.md` for instructions on how to start the FastAPI backend and Next.js frontend using Docker or locally.

## 4. Implement your fix or feature

At this point, you're ready to make your changes. Feel free to ask for help; everyone is a beginner at first.

## 5. Make a Pull Request

At this point, you should switch back to your master branch and make sure it's up to date with CivicMind's master branch:

```sh
git remote add upstream git@github.com:kulkarnishub377/CivicMind.git
git checkout master
git pull upstream master
```

Then update your feature branch from your local copy of master, and push it!

```sh
git checkout 325-add-new-prediction-model
git rebase master
git push --set-upstream origin 325-add-new-prediction-model
```

Finally, go to GitHub and [make a Pull Request](../../pulls) :D
