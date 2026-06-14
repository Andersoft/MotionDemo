set shell := ["zsh", "-c"]

zshrc := env_var_or_default("HOME", "") + "/.zshrc"
web := "src/Web"
sln := "Motion.slnx"

# ── Setup ──────────────────────────────────────────────────────────

mise-hook:
    #!/usr/bin/env zsh
    if grep -q 'mise activate zsh' "{{zshrc}}"; then
        echo "mise hook already present in {{zshrc}}"
    else
        echo "" >> "{{zshrc}}"
        echo "# mise version manager" >> "{{zshrc}}"
        echo 'eval "$(mise activate zsh)"' >> "{{zshrc}}"
        echo "Added mise hook to {{zshrc}}"
    fi

mise-install:
    mise install

npm-install:
    cd {{web}} && npm ci

setup: mise-hook mise-install npm-install
    @echo "Setup complete — restart your shell or run: exec zsh"

# ── Build ──────────────────────────────────────────────────────────

build: lint build-web build-api

build-web:
    cd {{web}} && npm run build

build-api:
    dotnet build {{sln}}

# ── Dev ────────────────────────────────────────────────────────────

dev:
    cd {{web}} && npm run dev

# ── Lint ───────────────────────────────────────────────────────────

lint: lint-web lint-api

lint-web:
    cd {{web}} && npm run lint

lint-api:
    dotnet format {{sln}} --verify-no-changes

# ── Test ───────────────────────────────────────────────────────────

test: test-web test-api

test-web:
    cd {{web}} && npm run test:unit

test-api:
    dotnet test {{sln}}

# ── Clean ──────────────────────────────────────────────────────────

clean:
    rm -rf {{web}}/dist {{web}}/node_modules/.tmp
    rm -rf src/Motion.Api/bin src/Motion.Api/obj
