module.exports = {
  apps: [
    {
      name: "spectra-api",
      cwd: "./artifacts/api-server",
      script: "dist/index.mjs",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: 5050,
      },
    },
  ],
};
