# OpenCode Alpine AArch64 Fork

This is a fork of the official `opencode` repository, specifically engineered to support Alpine Linux on AArch64 architecture, primarily for use within a Termux environment with `proot-distro`.

## Key Engineering Changes

This fork incorporates several modifications to ensure `opencode` builds and runs efficiently on Alpine AArch64:

*   **`linux-arm64-musl` Build Target:** The build script (`packages/opencode/script/build.ts`) has been updated to correctly generate a native binary for `linux-arm64-musl` (Alpine AArch64).
*   **Bundled Dependencies:** All external JavaScript/TypeScript dependencies (including `@ai-sdk` packages, `opencode-anthropic-auth`, `opencode-copilot-auth`, `zod`, `hono`, `jose`, `@aws-sdk/credential-providers`, `@ai-sdk/openai-compatible`) are now explicitly bundled into the `opencode` binary. This eliminates runtime `bun add` calls and `EACCES: Permission denied` errors.
*   **Configurable Models Data Refresh:** Users can now choose to build `opencode` with or without network refresh for models data. This allows for faster startup and offline functionality, or the ability to fetch the latest model information.
*   **Disabled Auto-Update:** The auto-update mechanism has been disabled by default to prevent unexpected network requests and installation failures in constrained environments.
*   **`ripgrep` Integration:** `opencode` relies on `ripgrep` (`rg`) for fast content search. While `ripgrep` is not bundled, the documentation emphasizes its installation in the Alpine environment.

## Contents

*   **`opencode/`**: The modified `opencode` source code.
*   **Pre-built Binaries (from Releases):**
    *   `opencode-linux-arm64-musl-network-enabled.tar.xz`: A highly compressed `opencode` binary for Alpine AArch64 with network refresh for models **enabled**.
    *   `opencode-linux-arm64-musl-network-disabled.tar.xz`: A highly compressed `opencode` binary for Alpine AArch64 with network refresh for models **disabled**.
*   **`opencode-termux-wrapper.sh`**: A wrapper script to simplify running `opencode` within your `proot-distro` Alpine environment.

## Prerequisites

To use this binary, you need:

1.  **Termux:** Installed on your AArch64 Android device.
2.  **`proot-distro`:** Installed and configured in Termux with an Alpine Linux installation.

    If you don't have `proot-distro` or Alpine installed, follow these steps in Termux:

    ```bash
    pkg install proot-distro
    proot-distro install alpine
    ```

3.  **`ripgrep` and `jq` in Alpine:** These tools are required by `opencode` and the wrapper script.

    Enter your Alpine environment and install them:

    ```bash
    proot-distro login alpine --termux-home
    apk add ripgrep jq
    exit
    ```

## Building the Binary from Source

If you wish to build the `opencode` binary yourself, follow these steps:

1.  **Clone this repository**:

    ```bash
    git clone https://github.com/Charlie6F/opencode_termux_alpine_aarch64.git
    cd opencode_termux_alpine_aarch64/opencode
    ```

2.  **Install Bun:** Ensure you have `bun` installed in your Termux environment. Refer to the [Bun documentation](https://bun.sh/docs/installation) for installation instructions.

3.  **Install Dependencies:** Navigate to the `opencode` directory and install the project dependencies:

    ```bash
    cd /path/to/your/fork/opencode
    bun install
    ```

4.  **Build the Binaries:** Run the build script. This will generate two `linux-arm64-musl` binaries:

    *   `opencode-linux-arm64-musl-network-enabled` (with network refresh for models enabled)
    *   `opencode-linux-arm64-musl-network-disabled` (with network refresh for models disabled)

    ```bash
    cd /path/to/your/fork/opencode/packages/opencode
    bun run build
    ```

    The built binaries will be located in `packages/opencode/dist/` within their respective directories (e.g., `packages/opencode/dist/opencode-linux-arm64-musl-network-enabled/bin/opencode`).

## Using the Pre-built Binaries

1.  **Download the archives:** Download either `opencode-linux-arm64-musl-network-enabled.tar.xz` or `opencode-linux-arm64-musl-network-disabled.tar.xz` from the [Releases page](https://github.com/Charlie6F/opencode_termux_alpine_aarch64/releases) of this repository, depending on your preference.

2.  **Extract the archive** in your Termux environment:

    ```bash
    tar -xJf opencode-linux-arm64-musl-network-enabled.tar.xz # or the disabled version
    ```

    This will extract the `opencode` binary.

3.  **Make the binary and wrapper executable:**

    ```bash
    chmod +x opencode
    chmod +x opencode-termux-wrapper.sh
    ```

4.  **Copy the binary to Alpine:** Copy the chosen `opencode` binary to `/usr/local/bin/opencode` inside your Alpine environment. You can do this by running the wrapper script once, as it includes logic to set up the configuration and copy the binary.

    ```bash
    ./opencode-termux-wrapper.sh
    ```

## Usage

### Using the wrapper script (convenient, but may have performance overhead)

The `opencode-termux-wrapper.sh` script will automatically log into your Alpine environment, ensure `jq` is installed, set up the `autoupdate: false` configuration, and run the `opencode` binary.

```bash
./opencode-termux-wrapper.sh [any opencode arguments]
```

For example, to run `opencode web`:

```bash
./opencode-termux-wrapper.sh web
```

### Running directly in `proot-distro` shell (for best performance)

For optimal performance, you can manually enter your Alpine environment and run `opencode` directly:

```bash
proot-distro login alpine --termux-home
/usr/local/bin/opencode [any opencode arguments]
```

## Configurable Models Data Refresh (Pros & Cons)

This fork allows you to choose whether `opencode` fetches model metadata from the network or uses locally bundled data.

**Network Refresh Enabled (Binary: `opencode-linux-arm64-musl-network-enabled`)**

**Pros:**

*   **Latest Models Data:** Automatically fetches the most up-to-date model information from `models.dev`.
*   **Dynamic Model Discovery:** Can discover and integrate new providers or models as they are introduced.

**Cons:**

*   **Slower Startup and Potential Delays:** Network requests can introduce latency, especially with slow or no internet connectivity.
*   **Requires Internet Connection:** Cannot fetch model metadata offline.
*   **Increased Network Usage:** Periodically downloads model data.

**Network Refresh Disabled (Binary: `opencode-linux-arm64-musl-network-disabled`)**

**Pros:**

*   **Faster Startup and Reduced Delays:** Eliminates network requests, leading to quicker startup and more responsive operation.
*   **Offline Functionality:** `opencode` can operate without an active internet connection for fetching model metadata.
*   **Predictable Behavior:** Removes variability from network latency and external API availability.
*   **Reduced Network Usage:** Saves bandwidth.
*   **Improved Privacy/Security:** No external calls are made to `models.dev/api.json` for model data.

**Cons:**

*   **Stale Models Data:** The bundled models data will not automatically update. New models, updates to existing models, or changes in provider configurations on `models.dev` will not be reflected.
*   **Manual Updates Required:** To get the latest model information, the `opencode` binary would need to be rebuilt and redistributed with updated bundled data.
*   **Loss of Dynamic Model Discovery:** Prevents automatic discovery and integration of new providers or models introduced on `models.dev`.

## Known Issues

*   **API Quota Exceeded:** If you encounter "Quota exceeded" errors, this is an API usage limit issue, not a bug in the `opencode` binary. You may need to check your API provider's billing and quota settings.
*   **Wrapper Script Performance:** The wrapper script might introduce some performance overhead. If you experience significant slowness, running `opencode` directly within the `proot-distro` shell is recommended.

## Contributing

If you find any issues or have suggestions, please open an issue on the GitHub repository.
