#!/bin/bash
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.

# Color definitions
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BOLD='\033[1m'

echo -e "\n${BOLD}${CYAN}====== LegalContext Setup ======${NC}\n"

# Step 1: Check/Install Bun
echo -e "${BOLD}Checking for Bun installation...${NC}"

if ! command -v bun &> /dev/null; then
    echo -e "${YELLOW}Bun is not installed. Installing now...${NC}"
    
    if [[ "$OSTYPE" == "darwin"* || "$OSTYPE" == "linux-gnu"* ]]; then
        # macOS or Linux
        curl -fsSL https://bun.sh/install | bash
        
        # Add to current PATH
        export PATH="$HOME/.bun/bin:$PATH"
    else
        # Windows (assuming running in Git Bash or similar)
        echo -e "${YELLOW}Please install Bun manually on Windows:${NC}"
        echo -e "  1. Open PowerShell as administrator"
        echo -e "  2. Run: ${CYAN}irm bun.sh/install.ps1 | iex${NC}"
        echo -e "  3. Restart your terminal after installation"
        read -p "Press Enter once you have installed Bun..." </dev/tty
    fi
    
    # Verify installation
    if command -v bun &> /dev/null; then
        echo -e "${GREEN}✓ Bun installed successfully $(bun --version)${NC}"
    else
        echo -e "${RED}Failed to install Bun. Please install manually from https://bun.sh${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Bun is installed ($(bun --version))${NC}"
fi

# Step 2: Validate Environment Variables
echo -e "\n${BOLD}Checking environment variables...${NC}"

# Create .env file if it doesn't exist
if [ -f .env ]; then
    echo -e "${GREEN}✓ Found .env file${NC}"
else
    echo -e "${YELLOW}No .env file found. Creating one...${NC}"
    
    # If .env.example exists, copy it
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ Created .env from .env.example${NC}"
    else
        touch .env
        echo -e "${YELLOW}Created empty .env file${NC}"
    fi
fi

# Required variables to check
declare -a required_vars=(
    "NODE_ENV:development:Environment (development or production)"
    "LOG_LEVEL:info:Logging level (debug, info, warn, error)"
    "PORT:3001:Port for the OAuth HTTP server"
    "CLIO_CLIENT_ID::Clio API Client ID from developer portal"
    "CLIO_CLIENT_SECRET::Clio API Client Secret from developer portal"
    "CLIO_REDIRECT_URI:http://localhost:3001/clio/auth/callback:OAuth callback URL (must match Clio settings)"
    "CLIO_API_REGION:us:Clio API region (us, ca, eu, au)"
    "LANCEDB_DB_PATH:./lancedb:Path to store LanceDB database files"
    "SECRET_KEY::Secret key for encrypting stored tokens"
    "MAX_DOCUMENTS:100:Maximum number of documents for free tier"
    "MAX_QUERIES_PER_DAY:50:Maximum queries per day for free tier"
)

# Check and update environment variables
for var_info in "${required_vars[@]}"; do
    # Split the var_info string
    IFS=':' read -r key default description <<< "$var_info"
    
    # Check if variable exists in .env file
    if ! grep -q "^${key}=" .env; then
        echo -e "${YELLOW}Missing ${key}${NC} - ${description}"
        
        # For sensitive info, don't show default
        if [[ "$key" == "CLIO_CLIENT_ID" || "$key" == "CLIO_CLIENT_SECRET" || "$key" == "SECRET_KEY" ]]; then
            if [[ "$key" == "SECRET_KEY" ]]; then
                # Generate a random secret key
                random_key=$(openssl rand -hex 16)
                echo "${key}=${random_key}" >> .env
                echo -e "${GREEN}✓ Generated random SECRET_KEY${NC}"
            else
                read -p "Enter ${key}: " value </dev/tty
                if [[ -n "$value" ]]; then
                    echo "${key}=${value}" >> .env
                fi
            fi
        elif [[ -n "$default" ]]; then
            read -p "Enter ${key} (default: ${default}): " value </dev/tty
            echo "${key}=${value:-$default}" >> .env
        else
            read -p "Enter ${key}: " value </dev/tty
            if [[ -n "$value" ]]; then
                echo "${key}=${value}" >> .env
            fi
        fi
    fi
done

echo -e "${GREEN}✓ Environment variables configured${NC}"

# Step 3: Setup OAuth with Clio
echo -e "\n${BOLD}Setting up OAuth with Clio...${NC}"

# Display Clio configuration info
CLIO_CLIENT_ID=$(grep "^CLIO_CLIENT_ID=" .env | cut -d= -f2)
CLIO_REDIRECT_URI=$(grep "^CLIO_REDIRECT_URI=" .env | cut -d= -f2)
CLIO_API_REGION=$(grep "^CLIO_API_REGION=" .env | cut -d= -f2)
PORT=$(grep "^PORT=" .env | cut -d= -f2)

echo -e "\n${CYAN}Clio API Configuration:${NC}"
if [[ -n "$CLIO_CLIENT_ID" ]]; then
    # Show just the last 4 characters of the client ID for security
    echo -e "• Client ID: ****${CLIO_CLIENT_ID: -4}"
else
    echo -e "• Client ID: Not set"
fi
echo -e "• Redirect URI: ${CLIO_REDIRECT_URI:-http://localhost:3001/clio/auth/callback}"
echo -e "• API Region: ${CLIO_API_REGION:-us}"

# Instructions for registering with Clio
echo -e "\n${YELLOW}Make sure you have registered this application in the Clio Developer Portal:${NC}"
echo -e "1. Go to: ${CYAN}https://app.clio.com/settings/developer_applications${NC} (or your region-specific Clio URL)"
echo -e "2. Create a new application (if not done already)"
echo -e "3. Set the redirect URI to exactly: ${CYAN}${CLIO_REDIRECT_URI:-http://localhost:3001/clio/auth/callback}${NC}"
echo -e "4. Copy the Client ID and Client Secret to your .env file"

# Ask if user wants to start OAuth flow
read -p $'\nDo you want to start the OAuth authorization flow now? (y/n): ' start_auth </dev/tty

if [[ "$start_auth" == "y" || "$start_auth" == "Y" ]]; then
    # Check for required environment variables
    if [[ -z "$CLIO_CLIENT_ID" || -z "$(grep -E "^CLIO_CLIENT_SECRET=.+" .env)" ]]; then
        echo -e "${RED}Error: Missing required Clio API credentials in .env file${NC}"
        exit 1
    fi
    
    echo -e "\n${YELLOW}Starting OAuth server...${NC}"
    
    # Start server in background
    bun run src/server.ts &
    SERVER_PID=$!
    
    # Wait for server to start
    sleep 2
    
    # Open browser to auth URL
    AUTH_URL="http://localhost:${PORT:-3001}/clio/auth"
    echo -e "\n${BOLD}Opening browser to authorize with Clio: ${CYAN}${AUTH_URL}${NC}"
    
    # Open browser based on platform
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open "$AUTH_URL"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        xdg-open "$AUTH_URL" 2>/dev/null || sensible-browser "$AUTH_URL" 2>/dev/null || \
        echo -e "${YELLOW}Please open this URL in your browser:${NC} ${AUTH_URL}"
    else
        # Windows
        start "$AUTH_URL" 2>/dev/null || \
        echo -e "${YELLOW}Please open this URL in your browser:${NC} ${AUTH_URL}"
    fi
    
    # Wait for user to complete authorization
    read -p $'\n'"${YELLOW}Press Enter after completing the authorization process in your browser...${NC}" </dev/tty
    
    # Stop the server
    kill $SERVER_PID 2>/dev/null
    
    echo -e "${GREEN}✓ OAuth setup completed${NC}"
else
    echo -e "${YELLOW}Skipped OAuth authorization flow${NC}"
    echo -e "You can run the authorization flow later by starting the server with ${CYAN}bun start${NC}"
    echo -e "Then visit ${CYAN}http://localhost:${PORT:-3001}/clio/auth${NC}"
fi

# Step 4: Update Claude Desktop configuration
echo -e "\n${BOLD}Setting up Claude Desktop configuration...${NC}"

# Determine Claude Desktop config path
HOMEDIR="$HOME"
CLAUDE_CONFIG_PATH=""

if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    CLAUDE_CONFIG_PATH="$HOMEDIR/Library/Application Support/Claude/claude_desktop_config.json"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    CLAUDE_CONFIG_PATH="$HOMEDIR/.config/Claude/claude_desktop_config.json"
else
    # Windows (assuming running in Git Bash or similar)
    CLAUDE_CONFIG_PATH="$HOMEDIR/AppData/Roaming/Claude/claude_desktop_config.json"
fi

# Get absolute path to project and bun executable
PROJECT_PATH="$(pwd)"
BUN_PATH="$(which bun)"

echo -e "${CYAN}Project path:${NC} $PROJECT_PATH"
echo -e "${CYAN}Bun path:${NC} $BUN_PATH"
echo -e "${CYAN}Claude config path:${NC} $CLAUDE_CONFIG_PATH"

# Create Claude config directory if it doesn't exist
CLAUDE_CONFIG_DIR=$(dirname "$CLAUDE_CONFIG_PATH")
mkdir -p "$CLAUDE_CONFIG_DIR"

# Create or update Claude config
if [ -f "$CLAUDE_CONFIG_PATH" ]; then
    echo -e "${GREEN}✓ Found existing Claude Desktop config${NC}"
    
    # Check if jq is available for JSON manipulation
    if command -v jq &> /dev/null; then
        # Use jq to update the config
        if [ -f "$CLAUDE_CONFIG_PATH.bak" ]; then
            rm "$CLAUDE_CONFIG_PATH.bak"
        fi
        cp "$CLAUDE_CONFIG_PATH" "$CLAUDE_CONFIG_PATH.bak"
        
        # Update config using jq
        jq --arg cmd "$BUN_PATH" --arg path "$PROJECT_PATH/src/server.ts" --arg cwd "$PROJECT_PATH" \
           '.mcpServers.legalcontext = {"command": $cmd, "args": [$path], "cwd": $cwd}' "$CLAUDE_CONFIG_PATH.bak" > "$CLAUDE_CONFIG_PATH"
        
        echo -e "${GREEN}✓ Updated Claude Desktop config with LegalContext server${NC}"
    else
        # Manual approach if jq is not available
        echo -e "${YELLOW}jq not found. Manually updating config...${NC}"
        
        # Create backup
        if [ -f "$CLAUDE_CONFIG_PATH.bak" ]; then
            rm "$CLAUDE_CONFIG_PATH.bak"
        fi
        cp "$CLAUDE_CONFIG_PATH" "$CLAUDE_CONFIG_PATH.bak"
        
        # Check if mcpServers exists in the config
        if grep -q '"mcpServers"' "$CLAUDE_CONFIG_PATH"; then
            # Update existing mcpServers section (simple approach)
            # This is a simplified approach and might not work for all JSON structures
            # A proper JSON parser like jq is recommended
            echo -e "${YELLOW}Attempting to update existing mcpServers section...${NC}"
            
            # Try to replace mcpServers section with a new one that includes legalcontext
            # This is a very simplistic approach and might fail for complex JSON structures
            sed -i.tmp -e '/"mcpServers"[[:space:]]*:/{
                :a
                n
                /}/!ba
                s/}/,"legalcontext": {"command": "'"$BUN_PATH"'", "args": ["'"$PROJECT_PATH/src/server.ts"'"], "cwd": "'"$PROJECT_PATH"'"}}/
            }' "$CLAUDE_CONFIG_PATH"
            
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✓ Updated Claude Desktop config with LegalContext server${NC}"
            else
                echo -e "${RED}Failed to update config. Please install jq or update manually.${NC}"
                echo -e "Configuration to add:"
                echo -e '{\n  "mcpServers": {\n    "legalcontext": {\n      "command": "'"$BUN_PATH"'",\n      "args": ["'"$PROJECT_PATH/src/server.ts"'"],\n      "cwd": "'"$PROJECT_PATH"'"\n    }\n  }\n}'
            fi
        else
            # If mcpServers doesn't exist, create a new config
            echo '{
  "mcpServers": {
    "legalcontext": {
      "command": "'"$BUN_PATH"'",
      "args": ["'"$PROJECT_PATH/src/server.ts"'"],
      "cwd": "'"$PROJECT_PATH"'"
    }
  }
}' > "$CLAUDE_CONFIG_PATH"
            
            echo -e "${GREEN}✓ Created new Claude Desktop config with LegalContext server${NC}"
        fi
    fi
else
    echo -e "${YELLOW}No Claude Desktop config found, creating new one${NC}"
    
    # Create new config from scratch
    echo '{
  "mcpServers": {
    "legalcontext": {
      "command": "'"$BUN_PATH"'",
      "args": ["'"$PROJECT_PATH/src/server.ts"'"],
      "cwd": "'"$PROJECT_PATH"'"
    }
  }
}' > "$CLAUDE_CONFIG_PATH"
    
    echo -e "${GREEN}✓ Created new Claude Desktop config with LegalContext server${NC}"
fi

echo -e "${YELLOW}Note: You may need to restart Claude Desktop for changes to take effect${NC}"

# Final instructions
echo -e "\n${BOLD}${CYAN}====== Setup Complete ======${NC}\n"
echo -e "You can now start LegalContext with: ${CYAN}bun start${NC}"
echo -e "To access LegalContext from Claude Desktop:"
echo -e "1. Start Claude Desktop"
echo -e "2. LegalContext should appear as an available MCP server"
echo -e "\nIf you encounter any issues, check the following:"
echo -e "• The .env file is correctly configured"
echo -e "• Claude Desktop configuration is correctly updated"
echo -e "• Clio API credentials are valid and registered with the correct redirect URI"
echo -e "• The OAuth flow is completed successfully"

echo -e "\n${GREEN}${BOLD}Happy legal researching with Claude! 📚⚖️${NC}\n"
