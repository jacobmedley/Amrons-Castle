# Release a version

You need a clean checkout, Node.js 24 or later, and repository write access. The package, lockfile, changelog and Git tag must agree. Tags use `vMAJOR.MINOR.PATCH`; the project remains a prototype during `0.x`.

1. Select the release scope. Move completed backlog work into the enhancement ledger with evidence. Keep proposals labeled as planned.
2. Update package metadata without creating a commit or tag. For the next patch after 0.1.0:

   ```sh
   npm version 0.1.1 --no-git-tag-version
   ```

3. Add the release date and user-visible changes to `CHANGELOG.md`. Update the README version and affected screenshots; preserve an `Unreleased` section.
4. Run these checks from the repository root:

   ```sh
   npm ci
   npm run typecheck
   npm test
   npm run build
   ```

   All commands must succeed. Inspect affected desktop/phone journeys, keyboard focus and reduced motion. Exclude build outputs and private evidence from commits.

5. Review documentation links, the diff and asset licenses. Commit the preparation and integrate it into `main` under the repository's applicable review requirements. Do not force-push over remote work.
6. Push `main`, confirm CI, then create an annotated tag on the verified commit. For the example patch:

   ```sh
   git tag -a v0.1.1 -m "Amron's Castle v0.1.1"
   git push origin v0.1.1
   ```

7. Create a GitHub release from the existing tag. Use the matching changelog section as its notes and include known limits. Verify the tag resolves to the intended `main` commit.

The package's `private: true` prevents accidental npm publication; it does not make GitHub private. A GitHub release does not deploy a website, restart a host, install an integration or publish account data. Host updates are separate operations.
