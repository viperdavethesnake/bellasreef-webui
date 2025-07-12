module.exports = {
  apps: [{
    name: 'bellasreef-webui',
    script: 'npm',
    args: 'run start',
    cwd: '/home/pi/bellasreef-webui',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      NODE_OPTIONS: '--max-old-space-size=2048'
    },
    error_file: '/home/pi/bellasreef-webui/logs/err.log',
    out_file: '/home/pi/bellasreef-webui/logs/out.log',
    log_file: '/home/pi/bellasreef-webui/logs/combined.log',
    time: true
  }]
} 