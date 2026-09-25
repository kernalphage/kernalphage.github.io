


#!/usr/bin/env bash
# set -euo pipefail

usage() {
    cat <<EOF
Usage: $0 [--build] [--watch] [--serve [PORT]] [--help]

Options:
  --build       run build steps
  --watch       watch src/ and static/ directories and rebuild on changes
  --serve       start a basic Python HTTP server serving ./www
  PORT          optional port for --serve (default: 8000)
  --help        show this help message
EOF
}

build() {
    echo "Running build..."

    echo "Copying static files..."
    rm -rf www/*

    mkdir -p www
    cp -r static/* www
    
    echo "Building TypeScript..."
    yarn build
}

serve() {
    local port="${1:-8000}"
    echo "Serving ./www at http://localhost:${port}"
    cd "$(dirname "$0")/www"
    python -m http.server "${port}"
}

watch() {
    echo "Watching src/ and static/ for changes..."

    local last_build_time=0
    local check_interval=3  # seconds

    build
    last_build_time=$(date +%s)

    while true; do
        sleep "$check_interval"

        local src_mtime=0
        local static_mtime=0

        if [ -d src ]; then
            src_mtime=$(find src -type f -printf '%T@\n' 2>/dev/null | sort -n | tail -1)
        fi

        if [ -d static ]; then
            static_mtime=$(find static -type f -printf '%T@\n' 2>/dev/null | sort -n | tail -1)
        fi

        local max_mtime=${src_mtime%.*}
        [ "${static_mtime%.*}" -gt "$max_mtime" ] && max_mtime=${static_mtime%.*}

        if [ "$max_mtime" -gt "$last_build_time" ]; then
            echo "Files changed, rebuilding..."
            build
            last_build_time=$(date +%s)
        fi
    done
}

if [ $# -eq 0 ]; then
    usage
    exit 1
fi

BUILD=false
WATCH=false
SERVE=false
SERVE_PORT=8000

while [ $# -gt 0 ]; do
    case "$1" in
        --build)
            BUILD=true
            shift
            ;;

        --serve)
            SERVE=true
            shift
            if [ $# -gt 0 ] && [ "$1" -ge 0 ] 2>/dev/null; then
                SERVE_PORT="$1"
                shift
            fi
            ;;

        --watch)
            WATCH=true
            shift
            ;;
        --help|-h)
            usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1" >&2
            usage
            exit 1
            ;;
    esac
done

if [ "$BUILD" = true ]; then
    build
fi

if [ "$WATCH" = true ] && [ "$SERVE" = true ]; then
    watch &
    WATCH_PID=$!
    trap 'kill "$WATCH_PID" 2>/dev/null' EXIT
    serve "$SERVE_PORT"
elif [ "$WATCH" = true ]; then
    watch
elif [ "$SERVE" = true ]; then
    serve "$SERVE_PORT"
fi