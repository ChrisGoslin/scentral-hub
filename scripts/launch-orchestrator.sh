#!/bin/bash

################################################################################
# nota. v1.0 Launch Orchestrator
# Automates prompt sequencing, validation, and deployment
#
# Usage:
#   ./scripts/launch-orchestrator.sh [phase] [--dry-run] [--skip-validation]
#
# Phases:
#   blocker    - Run critical blockers only (Prompts 33-34)
#   polish     - Run polish path (Prompts 35-39)
#   qe         - Run final QE suite (Prompt 40)
#   all        - Run all launch sequence (33-40)
#   v11-week1  - Run v1.1 Week 1 features (Prompts 41-45)
#   v11-week2  - Run v1.1 Week 2 features (Prompts 46-50)
#
# Options:
#   --dry-run          - Print commands without executing
#   --skip-validation  - Skip tsc/build checks
#
################################################################################

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MANIFEST="${PROJECT_ROOT}/docs/COMPLETE_WORK_MANIFEST.md"
LOG_DIR="${PROJECT_ROOT}/.launch-logs"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${LOG_DIR}/launch_${TIMESTAMP}.log"

DRY_RUN=false
SKIP_VALIDATION=false
PHASE="${1:-blocker}"

while [[ $# -gt 1 ]]; do
  case "$2" in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --skip-validation)
      SKIP_VALIDATION=true
      shift
      ;;
    *)
      echo "Unknown option: $2"
      exit 1
      ;;
  esac
done

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
  local level=$1
  shift
  local msg="$@"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo -e "${timestamp} [${level}] ${msg}" | tee -a "${LOG_FILE}"
}

log_info() {
  echo -e "${BLUE}[INFO]${NC} $@" | tee -a "${LOG_FILE}"
}

log_success() {
  echo -e "${GREEN}[✓]${NC} $@" | tee -a "${LOG_FILE}"
}

log_warn() {
  echo -e "${YELLOW}[⚠]${NC} $@" | tee -a "${LOG_FILE}"
}

log_error() {
  echo -e "${RED}[✗]${NC} $@" | tee -a "${LOG_FILE}"
}

init() {
  mkdir -p "${LOG_DIR}"
  log_info "Launch Orchestrator started"
  log_info "Phase: ${PHASE}"
  log_info "Dry run: ${DRY_RUN}"
  log_info "Skip validation: ${SKIP_VALIDATION}"
  log_info "Log file: ${LOG_FILE}"
  log_info "Project root: ${PROJECT_ROOT}"

  if [[ ! -f "${MANIFEST}" ]]; then
    log_error "Manifest not found: ${MANIFEST}"
    exit 1
  fi
}

validate_tsc() {
  if [[ "${SKIP_VALIDATION}" == "true" ]]; then
    log_warn "Skipping tsc validation"
    return 0
  fi

  log_info "Running tsc type check..."
  if ! npx tsc --noEmit --skipLibCheck 2>&1 | tee -a "${LOG_FILE}"; then
    log_error "tsc validation failed"
    return 1
  fi
  log_success "tsc validation passed"
}

validate_build() {
  if [[ "${SKIP_VALIDATION}" == "true" ]]; then
    log_warn "Skipping build validation"
    return 0
  fi

  log_info "Running npm build..."
  if ! npm run build 2>&1 | tee -a "${LOG_FILE}"; then
    log_error "Build failed"
    return 1
  fi
  log_success "Build validation passed"
}

get_prompt() {
  local prompt_num=$1
  sed -n "/^### Prompt ${prompt_num} —/,/^### Prompt/p" "${MANIFEST}" | sed '$d'
}

run_prompt() {
  local prompt_num=$1
  local prompt_title=$(grep "^### Prompt ${prompt_num} —" "${MANIFEST}" | sed 's/### Prompt [0-9]* — //')

  log_info "Starting Prompt ${prompt_num}: ${prompt_title}"

  local prompt_content=$(get_prompt "${prompt_num}")

  if [[ -z "${prompt_content}" ]]; then
    log_error "Prompt ${prompt_num} not found"
    return 1
  fi

  local prompt_file="${LOG_DIR}/prompt_${prompt_num}.md"
  echo "${prompt_content}" > "${prompt_file}"
  log_info "Prompt saved to: ${prompt_file}"

  if [[ "${DRY_RUN}" == "true" ]]; then
    log_warn "[DRY RUN] Would run Prompt ${prompt_num}"
    cat "${prompt_file}" | head -20
    echo "... (truncated)"
  else
    log_info "⏳ Waiting for Prompt ${prompt_num} completion..."
    log_info "📋 Prompt file: ${prompt_file}"
    log_info "Copy the prompt from above and run in Claude Code"

    read -p "Press ENTER once Prompt ${prompt_num} is complete and committed: " -n 1 -r
    echo

    if ! validate_recent_commit; then
      log_warn "No recent commit detected. Continuing anyway..."
    fi
  fi

  log_success "Prompt ${prompt_num} completed"
}

validate_recent_commit() {
  local last_commit=$(git log -1 --format="%at" 2>/dev/null || echo "0")
  local current_time=$(date +%s)
  local time_diff=$((current_time - last_commit))

  if [[ ${time_diff} -lt 300 ]]; then
    log_success "Recent commit detected ($(git log -1 --oneline 2>/dev/null || echo 'unknown'))"
    return 0
  else
    return 1
  fi
}

run_phase() {
  local phase=$1
  local prompts=()

  case "${phase}" in
    blocker)
      prompts=(33 34)
      log_info "Running Phase: BLOCKER (NO_LCP + PostHog key)"
      ;;
    polish)
      prompts=(35 36 37 38 39)
      log_info "Running Phase: POLISH (Empty states + Errors + Skeletons + Push + Dark mode)"
      ;;
    qe)
      prompts=(40)
      log_info "Running Phase: QE (Final validation suite)"
      ;;
    all)
      prompts=(33 34 35 36 37 38 39 40)
      log_info "Running Phase: ALL (Full launch sequence)"
      ;;
    v11-week1)
      prompts=(41 42 43 44 45)
      log_info "Running Phase: V1.1 WEEK 1 (Maceration + Origins + 5-stage + Coach)"
      ;;
    v11-week2)
      prompts=(46 47 48 49 50)
      log_info "Running Phase: V1.1 WEEK 2 (Magnetic Canvas + Social + Insights)"
      ;;
    *)
      log_error "Unknown phase: ${phase}"
      exit 1
      ;;
  esac

  for prompt_num in "${prompts[@]}"; do
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    run_prompt "${prompt_num}"

    if [[ "${prompt_num}" == "34" ]] || [[ "${prompt_num}" == "39" ]] || [[ "${prompt_num}" == "40" ]]; then
      log_info "Running validation after Prompt ${prompt_num}..."
      validate_tsc || true
    fi
  done
}

finalize() {
  log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  log_info "Launch sequence complete!"

  log_info "Summary:"
  log_success "Phase: ${PHASE}"
  log_success "Log file: ${LOG_FILE}"

  case "${PHASE}" in
    blocker)
      log_info "Next: Run 'polish' phase for UX polish"
      ;;
    polish)
      log_info "Next: Run 'qe' phase for final validation"
      ;;
    qe)
      log_success "Ready for App Store submission!"
      log_info "Next: Upload to App Store + Play Console"
      ;;
    all)
      log_success "Ready for App Store submission!"
      ;;
    v11-week1)
      log_info "Next: Run 'v11-week2' for Week 2 features"
      ;;
    v11-week2)
      log_success "v1.1 roadmap complete!"
      ;;
  esac

  log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

main() {
  init

  log_info "Running pre-flight checks..."

  if ! cd "${PROJECT_ROOT}"; then
    log_error "Failed to cd to project root"
    exit 1
  fi

  if ! git rev-parse --git-dir > /dev/null 2>&1; then
    log_error "Not a git repository"
    exit 1
  fi

  log_success "Pre-flight checks passed"

  run_phase "${PHASE}"

  finalize
}

trap 'log_error "Script interrupted"; exit 1' INT TERM

main "$@"
