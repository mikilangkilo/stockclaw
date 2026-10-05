class AppConstants {
  static const String appName = 'OpenClaw';
  static const String version = '2026.9.14';
  static const String packageName = 'com.nxg.openclawproot';

  /// Matches ANSI escape sequences (e.g. color codes in terminal output).
  static final ansiEscape = RegExp(r'\x1b\[[0-9;]*[a-zA-Z]');

  static const String authorName = 'Mithun Gowda B';
  static const String authorEmail = 'mithungowda.b7411@gmail.com';
  static const String githubUrl = 'https://github.com/mithun50/openclaw-termux';
  static const String license = 'MIT';

  static const String githubApiLatestRelease =
      'https://api.github.com/repos/mithun50/openclaw-termux/releases/latest';

  // Project links
  static const String issuesUrl =
      'https://github.com/mithun50/openclaw-termux/issues';
  static const String releasesUrl =
      'https://github.com/mithun50/openclaw-termux/releases';
  static const String upstreamUrl = 'https://github.com/openclaw/openclaw';

  static const String gatewayHost = '127.0.0.1';

  /// Port the gateway binds to when `gateway.port` is absent from
  /// openclaw.json. The effective port is resolved at runtime by
  /// [GatewayConfig] - do not assume this value (#124).
  static const int defaultGatewayPort = 18789;

  /// Deprecated alias kept for call sites that only need the default.
  static const int gatewayPort = defaultGatewayPort;
  static const String gatewayUrl = 'http://$gatewayHost:$defaultGatewayPort';

  static const String ubuntuRootfsUrl =
      'https://cdimage.ubuntu.com/ubuntu-base/releases/24.04/release/ubuntu-base-24.04.3-base-';
  static const String rootfsArm64 = '${ubuntuRootfsUrl}arm64.tar.gz';
  static const String rootfsArmhf = '${ubuntuRootfsUrl}armhf.tar.gz';
  static const String rootfsAmd64 = '${ubuntuRootfsUrl}amd64.tar.gz';

  // Node.js binary tarball - downloaded directly by Flutter, extracted by Java.
  // Bypasses curl/gpg/NodeSource which fail inside proot.
  //
  // StockClaw fork: bumped 22.23.2 -> 24.18.1. The OpenClaw plugin SDK requires
  // Node 24.16+, and StockClaw ships as an OpenClaw plugin, so 22.x is not
  // usable. This also still satisfies undici's `engines.node >= 22.19.0` and
  // OpenClaw's own range (>= 24.15.0 < 25).
  //
  // NOTE: Node 24 publishes no linux-armv7l build (the last Node release with
  // 32-bit ARM Linux binaries was v23.11.1). armeabi-v7a support was therefore
  // dropped - see getNodeTarballUrl() and the ABI list in
  // .github/workflows/flutter-build.yml.
  static const String nodeVersion = '24.18.1';
  static const String nodeBaseUrl =
      'https://nodejs.org/dist/v$nodeVersion/node-v$nodeVersion-linux-';

  static String getNodeTarballUrl(String arch) {
    switch (arch) {
      case 'aarch64':
        return '${nodeBaseUrl}arm64.tar.xz';
      case 'x86_64':
        return '${nodeBaseUrl}x64.tar.xz';
      case 'arm':
        // 32-bit ARM is no longer supported: Node 24 has no linux-armv7l build.
        // Fail loudly instead of silently handing back a mismatched binary.
        throw UnsupportedError(
          'StockClaw 不再支持 32 位 ARM（armeabi-v7a）：'
          'Node $nodeVersion 没有 linux-armv7l 构建。',
        );
      default:
        return '${nodeBaseUrl}arm64.tar.xz';
    }
  }

  static const int healthCheckIntervalMs = 5000;
  static const int maxAutoRestarts = 5;

  // Node constants
  static const int wsReconnectBaseMs = 350;
  static const double wsReconnectMultiplier = 1.7;
  static const int wsReconnectCapMs = 8000;
  static const String nodeRole = 'node';
  static const int pairingTimeoutMs = 300000;

  static const String channelName = 'com.nxg.openclawproot/native';
  static const String eventChannelName = 'com.nxg.openclawproot/gateway_logs';

  static String getRootfsUrl(String arch) {
    switch (arch) {
      case 'aarch64':
        return rootfsArm64;
      case 'arm':
        return rootfsArmhf;
      case 'x86_64':
        return rootfsAmd64;
      default:
        return rootfsArm64;
    }
  }
}
