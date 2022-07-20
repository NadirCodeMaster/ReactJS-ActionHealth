# Programs2 Web UI

![Build and deploy](https://github.com/alliance/programs-web/workflows/Build%20and%20deploy/badge.svg) ![Tests](https://github.com/alliance/programs-web/workflows/Tests/badge.svg)

## Set-up

Requires an accessible instance of [programs-api](https://github.com/alliance/programs-api) at a compatible hostname. Generally, this means both share a 2nd-level domain but have unique 3rd-level domains. For example:

- `api.hg.localdev` (for your BE code)
- `www.hg.localdev` (for your FE code)

_Note: We recommend using www.hg.localdev for local instances of programs-web because it has been whitelisted at our font-hosting service. Using a different domain will likely result in the incorrect fonts being used during development._

To run this code on your machine at a custom hostname, you'll need to modify your `/etc/hosts` file to point that hostname at `127.0.0.1`. So, to use `www.hg.localdev`, add the line below to your `/etc/hosts` file then continue with the instructions under "Environment variables."

```
127.0.0.1 www.hg.localdev
```

### Environment variables

The `.env` file stored in this codebase contains the names of environment variables used when creating a `programs-web` build and running the built-in dev server. As described in the "Build and deploy" section below, env var values required for production and staging builds are defined in `.github/workflows/build-and-deploy.yml`.

When setting up a development instance of the project, you'll need to **create a copy of `.env.local.example` named `.env.local`** and adjust the variables within as appropriate for your instance. Defaults are provided for most values that should guide the way. Pusher values are unique to each instance, so coordinate with the team to get that information if you don't yet have it.

## Available Scripts

In the project directory, you can run the commands below.

`yarn start` -- Runs the P2 web app in development mode. It will automatically open a browser with your local instance of programs-web at the hostname you defined in your `.env.local` file. Automatically reloads when you make edits to the src files and you will also see any lint errors in the console.

`yarn test` -- Launches `jest`, the test runner, in interactive watch mode.

`yarn build` -- Builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance. The build is minified and the filenames include the hashes. Any HTTP server can serve the `index.html`, and requests to static paths like `/static/js/main.<hash>.js` are served with the contents of the `/static/js/main.<hash>.js` file.

`yarn styleguide-view` -- Runs the built-in styleguide ([Storybook](https://storybook.js.org/docs/guides/guide-react/)). Automatically opens your local instance in your default browser. **Styleguide is being rebuilt. This may not be operational.** See [styleguide section](#styleguide) later in this document for additional styleguide details.

`yarn styleguide-build` -- Compiles the built-in styleguide ([Storybook](https://storybook.js.org/docs/guides/guide-react/)) to the `styleguide/` directory as a static, standalone site. That directory is excluded from version control. **Styleguide is being rebuilt. This may not be operational.** See [styleguide section](#styleguide) later in this document for additional styleguide details.

## Build and deploy

While this codebase can be served as a stand-alone site like most React/CRA-based projects, we have unique integration with our Drupal-based marketing site ([CMS2](http://github.com/alliance/cms2)) to keep everything running under the same www.healthiergeneration.org domain.

In short, we deploy `programs-web` builds to a private S3 bucket that Drupal mounts via S3FS. The files are ultimately copied to the Drupal instance and served to the public through the Drupal application layer.

- Creating a new release of `programs-web` at Github will kick off a custom workflow that compiles separate staging and production builds and deploys them to S3.
- The workflow is defined in code at `.github/workflows/build-and-deploy.yml`.
- Env vars for credentials and other sensitive values are [declared in Github as "secrets"](https://github.com/alliance/programs-web/settings/secrets).
- The progress and history of workflow executions is visible at https://github.com/alliance/programs-web/actions.

The CMS2 code that integrates `programs-web` is a custom module called `ahg_programs2`. Its [README](https://github.com/alliance/cms2/blob/master/modules/custom/ahg_programs2/README.md) provides additional information, including how to make a new `programs-web` release available in CMS2.

### Git workflow and releases

Our typical git workflow is described below. Note that **we use [rebase](https://www.atlassian.com/git/tutorials/rewriting-history/git-rebase)** to maintain a clean history.

- Create a feature branche (i.e., `issues/x`) off of the current `develop` branch
- After each commit to a feature branch, the feature branch must be frequently rebased with the `develop` branch (`git fetch origin` then `git rebase origin/develop`)
- Feature branch should then be pushed to Github and a pull request opened to merge it to `develop`
- Request a review and approval from another `programs-web` developer before merging the PR into `develop`
- When work in `develop` is tested, approved and ready for release, the `develop` branch gets merged to `master`

#### Releases

Releases are only made based on the `develop` or `master` branches. Further, only releases based on `master` should be considered full "stable" versions (i.e., `v1.0.0`), and code shouldn't be merged to master until it's ready for release. Releases based on any non-master branch should be considered "pre-release" and given a version tag indicating that (i.e., `v1.0.0-alpha.0`).

Releases of `programs-web` must adhere to semantic versioning conventions. You can read more about them at [semver.org](https://semver.org/).

**Creating a new release of programs-web:**

- Navigate to the "[Create a release](https://github.com/alliance/programs-web/releases/new)" page in Github
- Select the branch to base the release on (as noted above, it should generally be `develop` or `master`, and only `master` should be used for "full" releases).
- Decide on a version number.
    - Refer to previous releases and [semantic version conventions](https://semver.org/) to determine what's currently appropriate
- Populate the **Tag version** and **Release title** fields with your version number (i.e., "v1.0.0"). **It must be prefixed with a `v`.**
- If it is a pre-release, tick the _"This is a pre-release"_ checkbox.
- Click **Publish release**

You can then [monitor the status of the build and deploy worklow here](https://github.com/alliance/programs-web/actions). When that's complete, the release can be incorporated into CMS2 per the instructions in the [ahg_programs2 Drupal module README](https://github.com/alliance/cms2/blob/master/modules/custom/ahg_programs2/README.md).

---

## File organization

We're in the process of re-organizing the code, so there are inconsistencies, but below are some important locations:

- `src/api/` -- Code used _throughout the system_ for integrating with the API.
- `src/components/` -- Components generally available for use throughout the system, organized by usage:
    - `src/components/layout/` -- React components that are used for the layout "shell" (header, footer, nav, etc)
    - `src/components/ui/` -- React components for generic interface elements (inputs, alerts, etc). Most of these will eventually be prefixed with `Hg` to help distinguish them from 3rd-party libraries.
    - `src/components/views/` -- React components for the types of displays that might be used as a primary element on a page.
- `src/images/` -- Custom icons and other imagery.
    - `src/images/alignments/` -- SVG representations of "alignment value" of a response to a question.
    - `src/images/program-branding/` -- SVGs used dynamically by certain displays to "brand" it as associated with a given program. Files are named for the machine name of the program they represent.
- `src/lib/` -- Subdirectories here represent a related features. It would be a stretch to say these are "modules," but they are intended to provide some encapsulation. This is a recently adopted strategy, so there's a lot of code not yet updated for it.
    - `src/lib/Assessment` -- Code related to our assessments (aka "sets").
    - `src/lib/Criterion` -- Code related to our criteria. Criteria are referenced by sets in the form of "criterion instances," but they are also integrated with other non-set features.
    - `src/lib/Docbuilder` -- Code for the Docbuilder tool.
    - `src/lib/Plan` -- Code for the Action Plan tool.
- `src/pages/` -- Files and directories here mostly represent user-facing URL paths.
- MORE TO COME

---

## Styleguide

We use [Storybook](https://storybook.js.org/docs/guides/guide-react/) to provide a living styleguide of Programs2. It pulls component and style code from the same files as Programs2 itself to ensure accuracy. You can view the styleguide locally by running `yarn styleguide-view`. Note that the the `package.json` for this project serves both P2 and Storybook, so be sure to check for incompatibilities in both when modifying dependencies.

You can create a build of the styleguide by running `yarn styleguide-build`. This will create a `.gitignore`d directory at the root of the codebase called `styleguide`.
