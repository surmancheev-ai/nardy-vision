module.exports = {
  apps: [
    {
      name: "nardy-vision",
      script: "npm",
      args: "run start:hosted",
      cwd: ".",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
