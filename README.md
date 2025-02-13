# Achievement Tracker Deployment Guide

This repository contains a deployment script for setting up the Achievement Tracker application on Debian 12 (Bookworm) machines.

## Prerequisites

- Debian 12 (Bookworm) machine
- Sudo access
- Internet connection

## Quick Start

1. Download the deployment script:
```bash
wget https://github.com/Joka07/deploy/deploy_achievement.sh
```

2. Make the script executable:
```bash
chmod +x deploy_achievement.sh
```

3. Run the deployment script:
```bash
./deploy_achievement.sh
```

## What the Script Does

1. Updates the system package list
2. Installs necessary prerequisites (curl, build tools)
3. Installs Node.js 20.x
4. Installs and configures PostgreSQL
5. Sets up the application database and user
6. Clones the application repository
7. Installs project dependencies
8. Sets up environment variables
9. Runs database migrations
10. Installs PM2 for process management
11. Builds and starts the application

## Post-Installation

After running the script, your application will be:
- Running on port 5000 (http://localhost:5000)
- Managed by PM2 process manager
- Configured to start automatically on system boot

## Monitoring

- View logs: `pm2 logs`
- Monitor processes: `pm2 monit`
- View status: `pm2 status`

## Troubleshooting

If you encounter any issues:
1. Check the logs: `pm2 logs`
2. Ensure PostgreSQL is running: `sudo systemctl status postgresql`
3. Verify Node.js installation: `node --version`
4. Check database connection: `psql -U achievementapp -d achievements -h localhost`

## Security Notes

- The script creates a default database user and password. In production, you should:
  1. Change the default database password
  2. Configure proper firewall rules
  3. Set up SSL/TLS for database connections
  4. Follow security best practices for Node.js applications

## Support

For issues or questions, please open an issue in the repository or contact the system administrator.
