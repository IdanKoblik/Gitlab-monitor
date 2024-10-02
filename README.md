# GitLab Monitor

GitLab Monitor is a Discord webhook that notifies about GitLab project actions. It listens for GitLab webhook events and forwards them to a specified Discord channel.

## Features

- Receives GitLab webhook events
- Forwards notifications to Discord

## Installation

### Option 1: Clone and Run

1. Clone the repository:
   ```
   git clone https://github.com/IdanKoblik/Gitlab-monitor
   cd gitlab-monitor
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up your `config.json` file (see Configuration section)

4. Run the application:
   ```
    node .
   ```

### Option 2: Docker

1. Pull the Docker image:
   ```
   docker pull ghcr.io/idankoblik/gitlab-monitor:master
   ```

2. Set up your `config.json` file (see Configuration section)

## Configuration

Create a `config.json` file in the project root with the following structure:

```json
{
  "port": 3000,
  "gitlabToken": "your-gitlab-webhook-token",
  "webhookId": "your-discord-webhook-id",
  "webhookToken": "your-discord-webhook-token"
}
```

- `port`: The port on which the server will listen (use 3000 for Docker)
- `gitlabToken`: A random UUID that you'll set in your GitLab webhook settings
- `webhookId` and `webhookToken`: Your Discord webhook credentials

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.