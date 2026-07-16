#!/usr/bin/env bash
#
# emu-test.sh — universal Firebase-emulator test pipeline.
#
# Boots the hermetic emulator suite (Firestore/Auth/Functions/Storage/Pub-Sub) on
# the *demo* project, runs a command once the emulators are ready, then tears the
# whole suite down and exits with the command's exit code. It wraps
# `firebase emulators:exec`, so readiness-waiting and clean shutdown are handled
# for us — no manual port-polling or SIGINT juggling.
#
# WHY the demo project: under the real project id the admin SDK inside a function
# reaches for the GCE metadata server and every in-function Firestore call hangs
# ~60s then 500s. A `demo-*` project id forces full offline mode. The suite is
# ephemeral — it never imports/exports the real ./.emulators dump (that dump is
# only used by `npm run emulators`, the manual app-testing flow).
#
# USAGE:
#   ./scripts/emu-test.sh                                # default: the functions e2e suite
#   ./scripts/emu-test.sh npm --prefix functions test    # same, explicit
#   ./scripts/emu-test.sh node path/to/verify.mjs        # any command against live emulators
#
# ENV OVERRIDES:
#   EMU_PROJECT=demo-qrcontest    demo project id (should start with `demo-`)
#   EMU_ONLY=functions,firestore,auth,storage,pubsub   which emulators to start
#   EMU_NO_BUILD=1                skip the functions tsc build (functions run from functions/lib)
#
set -euo pipefail

# Always operate from the repo root (the directory above this script).
cd "$(dirname "${BASH_SOURCE[0]}")/.."

PROJECT="${EMU_PROJECT:-demo-qrcontest}"
ONLY="${EMU_ONLY:-functions,firestore,auth,storage,pubsub}"

# Command to run against the live emulators (default: the functions e2e suite).
if [ "$#" -gt 0 ]; then
    CMD=( "$@" )
else
    CMD=( npm --prefix functions test )
fi

case "$PROJECT" in
    demo-*) ;;
    *) echo "[emu-test] WARNING: project '$PROJECT' is not a demo-* id — in-function Firestore calls may hang ~60s then 500." >&2 ;;
esac

# Cloud Functions load from functions/lib (compiled JS), never the .ts source, so
# build first unless told not to or unless functions aren't in the set.
if [ -z "${EMU_NO_BUILD:-}" ] && [[ ",$ONLY," == *",functions,"* ]]; then
    echo "[emu-test] building functions (tsc)…"
    npm --prefix functions run build
fi

# Shell-quote the command into the single string that emulators:exec expects.
SCRIPT="$(printf '%q ' "${CMD[@]}")"

echo "[emu-test] project=$PROJECT  only=$ONLY"
echo "[emu-test] run: ${CMD[*]}"
exec npx firebase emulators:exec --project "$PROJECT" --only "$ONLY" "$SCRIPT"
