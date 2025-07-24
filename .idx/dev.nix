# To learn more about how to use Nix to configure your environment
# see: https://firebase.google.com/docs/studio/customize-workspace
{pkgs}: {
  # Which nixpkgs channel to use.
  channel = "stable-24.11"; # or "unstable"
  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_20
    pkgs.zulu
  ];
  # Sets environment variables in the workspace
  env = {};
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      # "vscodevim.vim"
    ];
    workspace = {
      # Run this command whenever the workspace is (re)started.
      # This ensures the functions are built before the emulators start.
      onStart = {
        build = "npm run build";
      };
      # We also keep it here to ensure it runs on the initial creation.
      onCreate = {
        build = "npm run build";
      };
    };
    # Enable previews and customize configuration
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev" "--" "--port" "$PORT" "--hostname" "0.0.0.0"];
          manager = "web";
        };
      };
    };
  };
  # This section MUST come AFTER the idx.workspace.onStart hook.
  # It adds a file watcher to startup the firebase emulators. The emulators will only start if
  # a firebase.json file is written into the user's directory.
  # Nix processes these sections sequentially, so onStart runs, then services start.
  services.firebase.emulators = {
    detect = true;
    projectId = "demo-app";
    # services = ["auth" "firestore" "hosting" "functions"];
  };
}
