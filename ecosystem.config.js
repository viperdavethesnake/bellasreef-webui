module.exports = {
  apps: [
    {
      name: 'bellasreef-webui',
      script: 'node_modules/.bin/serve',
      args: '-s dist -l 3000',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/error.log',
      out_file: './logs/app.log',
      log_file: './logs/combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 8000
    }
  ],

  deploy: {
    production: {
      user: 'pi',
      host: '192.168.33.126',
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/bellasreef-webui.git',
      path: '/home/pi/bellasreef-webui',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run pi:build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
}; 