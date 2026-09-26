---
# HOW TO WRITE A CHANGELOG ENTRY
#
# - Newest entry at the top.
# - Each entry starts with a heading in one of these two forms:
#     ## 1.2.0 (26 Sep 2026)     a numbered version with its date
#     ## Unreleased              work not released as a version yet
# - The date is day, short month, year: 26 Sep 2026.
# - Under the heading, one bullet per change, starting with a verb:
#     - Added a new boss arena.
#     - Fixed the bridge collapsing early.
# - The first bullet shows in the home page activity log, so lead with the main change.
# - When you release, rename "## Unreleased" to the version and date,
#   and set the same version in index.md.
# - Leave older entries as they are; they're the project's history.
#
# The build fails if a heading doesn't match these forms.
#
# ------Example------
# ## 0.1.0 (26 Sep 2026)
#
# - Entry for this version
#
# ## Unreleased
#
# - Project page set up.
---

## Unreleased

- Project page set up with premise, gallery, design and guide sheets.
