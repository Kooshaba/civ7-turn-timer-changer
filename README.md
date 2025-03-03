# Civilization 7 Turn Timer Utility

A simple web-based utility for modifying the turn timer in Civilization 7 save files.

## Features

- Upload Civilization 7 save files
- View the current turn timer value
- Modify the turn timer to a new value
- Download the modified save file

## How It Works

This utility works by:

1. Finding a specific marker in the save file (`LOC_GAMESPEED_QUICK_NAME`)
2. Locating the turn timer value at a fixed offset from this marker
3. Modifying the value to your specified time (in seconds)
4. Creating a new save file with the updated timer

## Development

This project was built with:

- [Vite](https://vitejs.dev/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)

### Running Locally

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Build for production:
   ```
   npm run build
   ```

## Important Notes

- Always make a backup of your save files before modifying them
- This tool is not affiliated with or endorsed by 2K Games or Firaxis Games
- Use at your own risk

## License

MIT 