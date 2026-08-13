#!/usr/bin/env bash
# Jaettu tarkistuslogiikka KnowWine AI:n git-hookeille ja Claude Coden
# pre-add-hookille. Ei suoriteta suoraan — sourcetetaan kutsujasta.
#
# Käyttö:
#   source "$(dirname "$0")/lib/run-checks.sh"
#   run_deterministic_checks "staged"    # pre-commit / commit-msg
#   run_deterministic_checks "worktree"  # Claude Code git-add -hook

REPO_ROOT="$(git rev-parse --show-toplevel)"

log_step() {
  # log_step "<vaihe/yhteensä>" "<lyhyt selitys>" "[ajettava komento]"
  echo "▶ [$1] $2" >&2
  if [ -n "${3:-}" ]; then
    echo "   \$ $3" >&2
  fi
}

log_ok() {
  echo "✓ $1" >&2
}

log_fail() {
  echo "✗ $1" >&2
}

# Tulostaa muuttuneiden tiedostojen polut (repo-juureen suhteutettuna).
get_changed_files() {
  local mode="$1"
  if [ "$mode" = "staged" ]; then
    git -C "$REPO_ROOT" diff --cached --name-only
  else
    git -C "$REPO_ROOT" status --porcelain --no-renames | cut -c4-
  fi
}

# Diffi-sisältö secrets-tarkistukselle: staged-tilassa vain index vs HEAD,
# worktree-tilassa myös stagemattomat + untracked-tiedostojen sisältö
# (koska hook ajetaan ennen git add:ia, mitään ei ole vielä stagattu).
get_content_for_secrets() {
  local mode="$1"
  if [ "$mode" = "staged" ]; then
    git -C "$REPO_ROOT" diff --cached -U0
  else
    git -C "$REPO_ROOT" diff -U0
    git -C "$REPO_ROOT" status --porcelain --no-renames \
      | awk '/^\?\?/{print substr($0,4)}' \
      | while IFS= read -r f; do
          [ -f "$REPO_ROOT/$f" ] && sed 's/^/+/' "$REPO_ROOT/$f"
        done
  fi
}

# Asettaa globaalit BACK_CHANGED / FRONT_CHANGED (0/1) $CHANGED_FILES:n perusteella.
determine_scope() {
  BACK_CHANGED=0
  FRONT_CHANGED=0
  if echo "$CHANGED_FILES" | grep -q '^back/'; then
    BACK_CHANGED=1
  fi
  if echo "$CHANGED_FILES" | grep -q '^front/'; then
    FRONT_CHANGED=1
  fi
}

check_secrets() {
  local step_label="$1"
  local mode="$2"
  log_step "$step_label" "secrets: tiedostonimien ja sisällön tarkistus"

  local blocked_name_pattern='(^|/)(\.env(\..+)?|[^/]*\.pem|[^/]*\.key|id_rsa[^/]*|id_ed25519[^/]*|[^/]*\.p12|[^/]*\.pfx)$'
  local offending_names
  offending_names="$(echo "$CHANGED_FILES" | grep -E "$blocked_name_pattern" | grep -vE '\.example$' || true)"
  if [ -n "$offending_names" ]; then
    log_fail "Kielletyn nimisiä tiedostoja muutoksissa:"
    echo "$offending_names" | sed 's/^/    /' >&2
    echo "   Korjaus: git restore --staged <tiedosto>  (poista stagingista, tarkista .gitignore jos tarkoituksellinen)" >&2
    return 1
  fi

  local content
  content="$(get_content_for_secrets "$mode")"
  local secret_hits
  secret_hits="$(echo "$content" | grep -nE \
    -e '\-\-\-\-\-BEGIN[A-Z ]*PRIVATE KEY\-\-\-\-\-' \
    -e 'AKIA[0-9A-Z]{16}' \
    -e 'ghp_[A-Za-z0-9]{36}' \
    -e 'sk-[A-Za-z0-9]{20,}' \
    -e '(SECRET|API_KEY|PASSWORD|TOKEN)[[:space:]]*[:=][[:space:]]*"[^"]{8,}"' \
    || true)"
  if [ -n "$secret_hits" ]; then
    log_fail "Mahdollisia kovakoodattuja salaisuuksia löytyi:"
    echo "$secret_hits" | sed 's/^/    /' >&2
    echo "   Korjaus: poista salaisuus koodista, käytä ympäristömuuttujaa (.env, ei committoituna)." >&2
    return 1
  fi

  log_ok "secrets-tarkistus läpäisty"
  return 0
}

run_back_checks() {
  local step_label="$1"
  (
    cd "$REPO_ROOT/back" || exit 1

    log_step "$step_label" "back: lint (eslint)" "npm run lint"
    if ! npm run lint; then
      log_fail "back: lint epäonnistui"
      echo "   Korjausehdotus: cd back && npm run lint -- --fix   (osa korjautuu automaattisesti)" >&2
      echo "   Muotoilu:       cd back && npm run format          (prettier --write)" >&2
      exit 1
    fi

    log_step "$step_label" "back: testit" "NODE_ENV=test npm test"
    if ! NODE_ENV=test npm test; then
      log_fail "back: testit epäonnistuivat"
      echo "   Ei automaattikorjausta — tarkista epäonnistuneet testit yllä." >&2
      echo "   Jos virhe koskee tietokantayhteyttä: varmista että TEST_DATABASE_URL osoittaa käynnissä olevaan Postgresiin." >&2
      exit 1
    fi
  )
}

run_front_checks() {
  local step_label="$1"
  (
    cd "$REPO_ROOT/front" || exit 1

    log_step "$step_label" "front: lint (eslint)" "npm run lint"
    if ! npm run lint; then
      log_fail "front: lint epäonnistui"
      echo "   Korjausehdotus: cd front && npm run lint -- --fix" >&2
      echo "   Muotoilu:       cd front && npm run format" >&2
      exit 1
    fi

    log_step "$step_label" "front: tyyppitarkistus" "npm run tsc"
    if ! npm run tsc; then
      log_fail "front: tsc löysi tyyppivirheitä"
      echo "   Ei automaattikorjausta — tyyppivirheet vaativat käsin korjauksen." >&2
      exit 1
    fi

    log_step "$step_label" "front: testit (vitest)" "npm test"
    if ! npm test; then
      log_fail "front: testit epäonnistuivat"
      echo "   Ei automaattikorjausta — tarkista epäonnistuneet testit yllä." >&2
      exit 1
    fi
  )
}

# CI:n audit-komentojen paikallinen vastine (ks. .github/workflows/pipeline.yml).
run_audit_back() {
  (cd "$REPO_ROOT/back" && npm audit --audit-level=high) 1>&2
}

run_audit_front() {
  local tmp
  tmp="$(mktemp)"
  (cd "$REPO_ROOT/front" && npm audit --json) >"$tmp" 2>/dev/null || true

  local allowlist="GHSA-qwww-vcr4-c8h2"
  jq -r --arg allow "$allowlist" '
    ($allow | split(" ")) as $allowed
    | [.vulnerabilities[]?
       | select(.severity == "high" or .severity == "critical")
       | .via[]?
       | objects
       | .url
       | capture("advisories/(?<id>GHSA-[a-z0-9-]+)").id
      ]
    | unique
    | map(select(. as $id | $allowed | index($id) | not))
    | .[]
  ' "$tmp" 2>/dev/null
  rm -f "$tmp"
}

# Ajaa secrets- ja lint/tsc/test-tarkistukset skoopin mukaisesti.
# Palauttaa 0 jos kaikki läpäisty, 1 jos jokin epäonnistui.
# Asettaa CHANGED_FILES / BACK_CHANGED / FRONT_CHANGED kutsujan käyttöön.
run_deterministic_checks() {
  local mode="$1"
  CHANGED_FILES="$(get_changed_files "$mode")"

  if [ -z "$CHANGED_FILES" ]; then
    log_ok "Ei muuttuneita tiedostoja, ei tarkistettavaa."
    return 0
  fi

  determine_scope

  local total=1
  [ "$BACK_CHANGED" = 1 ] && total=$((total + 1))
  [ "$FRONT_CHANGED" = 1 ] && total=$((total + 1))
  local step=1

  check_secrets "$step/$total" "$mode" || return 1
  step=$((step + 1))

  if [ "$BACK_CHANGED" = 1 ]; then
    run_back_checks "$step/$total" || return 1
    step=$((step + 1))
  fi

  if [ "$FRONT_CHANGED" = 1 ]; then
    run_front_checks "$step/$total" || return 1
    step=$((step + 1))
  fi

  log_ok "Kaikki deterministiset tarkistukset läpäisty."
  return 0
}
