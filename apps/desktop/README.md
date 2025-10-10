# Scenoghetto Desktop

A desktop application that wraps the Scenoghetto server, console, and player into a single application.

## Features

- Runs without a window, only showing a tray icon
- Provides quick access to the Scenoghetto Console and Player
- Automatically starts the Scenoghetto Server
- Handles native code (ffmpeg) integration

## Development

### Prerequisites

- Node.js (v14 or later)
- pnpm

### Setup

1. Install dependencies:

```bash
pnpm install
```

2. Build the application:

```bash
pnpm build
```

3. Start the application in development mode:

```bash
pnpm dev
```

## Usage

Once the application is running, you'll see a tray icon in your system tray. Right-click on the icon to access the menu:

- **Open Console**: Opens the Scenoghetto Console in your default browser (http://localhost:1339)
- **Open Player**: Opens the Scenoghetto Player in your default browser (http://localhost:1340)
- **Quit**: Exits the application

## Building for Production

To build the application for production:

```bash
pnpm build
```

## Notes

- The application stores all data in the user's application data directory
- The server, console, and player are all served from the same application
- The application uses native code (ffmpeg) for video processing