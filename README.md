# Unipile LinkedIn Campaign Tool

This project automates LinkedIn messaging using the Unipile SDK. It includes tools for cleaning LinkedIn invitation data and sending bulk messages.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up your environment variables:
   
   **Option A: Using a .env file (recommended)**
   ```bash
   cp env.example .env
   # Edit .env with your actual values
   ```
   
   **Option B: Export environment variables**
   ```bash
   export UNIPILE_API_KEY="your-unipile-api-key"
   export LINKEDIN_ACCOUNT_ID="your-linkedin-account-id"
   export MESSAGE_TEXT="your custom message"
   ```

## Environment Variables

Create a `.env` file with the following variables:

- `UNIPILE_DSN`: Your Unipile DSN (default: https://api15.unipile.com:14502)
- `UNIPILE_API_KEY`: Your Unipile API key (required)
- `LINKEDIN_ACCOUNT_ID`: Your LinkedIn account ID from Unipile (required)
- `MESSAGE_TEXT`: The message to send to connections (optional - has default)
- `LINKEDIN_USERNAME`: LinkedIn username for reconnecting (optional)
- `LINKEDIN_PASSWORD`: LinkedIn password for reconnecting (optional)

## Usage

### 1. Clean LinkedIn Invitation Data

First, clean your LinkedIn invitation CSV file:

```bash
npm run clean
# or
node csv_cleaner.js Invitations.csv cleaned_profiles.csv
```

This will:
- Filter for incoming invitations after a specific date
- Extract LinkedIn profile URLs
- Save cleaned data to `cleaned_profiles.csv`

### 2. Send Bulk LinkedIn Messages

Send messages to the cleaned profiles:

```bash
npm run send
# or
node unipile_bulk_linkedin.js cleaned_profiles.csv
```

## Files

- `csv_cleaner.js`: Cleans LinkedIn invitation CSV data
- `unipile_bulk_linkedin.js`: Main script for sending bulk messages
- `env.example`: Template for environment variables
- `Invitations.csv`: Input file with LinkedIn invitation data
- `cleaned_profiles.csv`: Output file with cleaned LinkedIn profile URLs

## Requirements

- Node.js 18+
- Unipile API key
- LinkedIn account connected to Unipile 