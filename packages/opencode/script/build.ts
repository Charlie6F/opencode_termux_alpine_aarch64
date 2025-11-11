#!/usr/bin/env bun

import solidPlugin from "../../../node_modules/@opentui/solid/scripts/solid-plugin"
import path from "path"
import fs from "fs"
import { $ } from "bun"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dir = path.resolve(__dirname, "..")

process.chdir(dir)

import pkg from "../package.json"
import { Script } from "@opencode-ai/script"

await $`rm -rf dist`

const binaries: Record<string, string> = {}

const buildConfigs = [
  {
    nameSuffix: "-network-enabled",
    define: {
      OPENCODE_ENABLE_NETWORK_MODELS_REFRESH: "true",
    },
  },
  {
    nameSuffix: "-network-disabled",
    define: {
      OPENCODE_ENABLE_NETWORK_MODELS_REFRESH: "false",
    },
  },
]

const os = "linux"
const arch = "arm64-musl"

for (const config of buildConfigs) {
  const name = `${pkg.name}-${os}-${arch}${config.nameSuffix}`
  console.log(`building ${name}`)
  await $`mkdir -p dist/${name}/bin`

  const watcher = `@parcel/watcher-${os === "windows" ? "win32" : os}-${arch.replace("-baseline", "").replace("-musl", "")}${os === "linux" ? (arch.includes("musl") ? "-musl" : "-glibc") : ""}`
  // Removed dynamic installation of @parcel/watcher as it should be a direct dependency

  const parserWorker = fs.realpathSync(path.join(dir, "../../node_modules/@opentui/core/parser.worker.js"))
  const workerPath = "./src/cli/cmd/tui/worker.ts"

  await Bun.build({
    conditions: ["browser"],
    tsconfig: "./tsconfig.json",
    plugins: [solidPlugin],
    sourcemap: "external",
    compile: {
      target: `bun-${os}-${arch}` as any,
      outfile: `dist/${name}/bin/opencode`,
      execArgv: [`--user-agent=opencode/${Script.version}`, `--env-file=""`, `--`],
      windows: {},
    },
    entrypoints: ["./src/index.ts", parserWorker, workerPath],
    define: {
      OPENCODE_VERSION: `'${Script.version}'`,
      OTUI_TREE_SITTER_WORKER_PATH: "/$bunfs/root/" + path.relative(dir, parserWorker),
      OPENCODE_WORKER_PATH: workerPath,
      OPENCODE_CHANNEL: `'${Script.channel}'`,
      ...config.define,
    },
  })

  await Bun.file(`dist/${name}/package.json`).write(
    JSON.stringify(
      {
        name,
        version: Script.version,
        os: [os === "windows" ? "win32" : os],
        cpu: [arch],
      },
      null,
      2,
    ),
  )
  binaries[name] = Script.version
}

export { binaries }