#!/bin/bash

# Exit on any error
set -e

echo "Starting deployment process..."

# Update package list
echo "Updating package list..."
sudo apt-get update

# Install curl and other prerequisites
echo "Installing prerequisites..."
sudo apt-get install -y curl gnupg2 build-essential

# Install Node.js 20.x
echo "Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
echo "Installing PostgreSQL..."
sudo apt-get install -y postgresql postgresql-contrib

# Start PostgreSQL service
echo "Starting PostgreSQL service..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create PostgreSQL user and database
echo "Setting up PostgreSQL database..."
sudo -u postgres psql -c "CREATE USER achievementapp WITH PASSWORD 'achievement123';"
sudo -u postgres psql -c "CREATE DATABASE achievements OWNER achievementapp;"
sudo -u postgres psql -c "ALTER USER achievementapp WITH SUPERUSER;"

# Clone the application (assuming you have a git repository)
echo "Cloning the application..."
git clone https://github.com/yourusername/achievement-tracker.git
cd achievement-tracker

# Install dependencies
echo "Installing project dependencies..."
npm install

# Create environment file
echo "Creating environment file..."
cat > .env << EOL
DATABASE_URL=postgresql://achievementapp:achievement123@localhost:5432/achievements
PORT=5000
NODE_ENV=production
EOL

# Run database migrations
echo "Running database migrations..."
npm run db:push

# Install PM2 for process management
echo "Installing PM2..."
sudo npm install -g pm2

# Build the application
echo "Building the application..."
npm run build

# Start the application with PM2
echo "Starting the application..."
pm2 start npm --name "achievement-tracker" -- start

# Save PM2 process list and configure to start on reboot
echo "Configuring PM2 startup..."
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME

echo "Deployment complete!"
echo "Your application should now be running on http://localhost:5000"

# Add monitoring instructions
echo "
To monitor your application:
- View logs: pm2 logs
- Monitor processes: pm2 monit
- View status: pm2 status
"
