#!/usr/bin/env bash
set -euo pipefail
shopt -s nocasematch

SCRIPT_DIR="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
CHANGELOG_FILE="$SCRIPT_DIR/src/CHANGELOG.md"
CUTOFF_DATE="2025-01-14T16:20:00-08:00"
TIMEZONE="America/Los_Angeles"

[ -f "$CHANGELOG_FILE" ] || touch "$CHANGELOG_FILE"
git fetch --unshallow 2>/dev/null || true
git fetch --all

ALL_COMMITS="$(git log \
  --since="$CUTOFF_DATE" \
  --pretty=format:"%h|%ad|%s|%an" \
  --date=iso8601 \
  --reverse \
)"

# If we have no commits, create a minimal changelog and exit.
if [ -z "$ALL_COMMITS" ]; then
  echo "# Changelog" > "$CHANGELOG_FILE"
  echo "" >> "$CHANGELOG_FILE"
  echo "_No commits found since $CUTOFF_DATE._" >> "$CHANGELOG_FILE"
  echo "Changelog updated (no commits)."
  exit 0
fi

TEMP_CONTENT=""
current_month=""
current_day=""

while IFS='|' read -r hash date subject author; do
  # Ignore GitHub bot commits
  if [[ "$author" == "github-actions[bot]" ]]; then
    continue
  fi

  # Only include conventional commits
  if [[ ! "$subject" =~ ^(feat|fix|docs|style|refactor|perf|chore|revert)\: ]]; then
    continue
  fi

  # Convert the date to our local timezone
  month_year="$(TZ="$TIMEZONE" date -d "$date" "+%B %Y" 2>/dev/null || true)"
  day_heading="$(TZ="$TIMEZONE" date -d "$date" "+%Y-%m-%d" 2>/dev/null || true)"

  # If we moved to a new month, insert a new month heading
  if [ "$month_year" != "$current_month" ]; then
    TEMP_CONTENT+="\n## $month_year\n"
    current_month="$month_year"
    # Reset current_day when we switch months
    current_day=""
  fi

  # If we moved to a new day, insert a subheading
  if [ "$day_heading" != "$current_day" ]; then
    TEMP_CONTENT+="\n### $day_heading\n"
    current_day="$day_heading"
  fi

  # Append the commit entry 
  # Format: * fix: updating changelog [abc1234] (Jon Myers)
  TEMP_CONTENT+="* ${subject} [${hash}] (${author})\n"

done <<< "$ALL_COMMITS"

# Reverse the lines so newest appear first
REVERSED_CONTENT="$(echo -e "$TEMP_CONTENT" | tac)"

{
  echo "# Changelog"
  echo ""
  echo -e "$REVERSED_CONTENT"
  echo ""
} > "$CHANGELOG_FILE"

echo "Changelog updated."
