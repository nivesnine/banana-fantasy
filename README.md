# Drift Bracket Generator

An interactive bracket generator for Drift tournaments, allowing users to create and manage Top 32 or Top 16 brackets.

## Features

- Create Top 32 or Top 16 brackets (automatically determined based on number of drivers)
- Enter custom driver lists with seed numbers
- Customize competition name
- Interactive bracket - select winners by clicking on drivers
- Download the bracket as an image
- Share your bracket with others via a URL
- Data is saved in your browser - your bracket persists between sessions
- Reset bracket or clear all data with simple button clicks

## How to Use

1. Enter a competition name (optional)
2. Enter your driver list in the format "Driver Name, Seed Number" (one per line)
3. Click "Load Drivers" to generate the bracket
4. Click on drivers to advance them through the bracket
5. Use the "Download as Image" button to save your bracket
6. Use the "Share Bracket" button to generate a shareable URL
7. Use "Reset Bracket" to clear winner selections but keep driver data
8. Use "Clear Saved Data" to completely reset the bracket

### Driver Entry Format

Enter one driver per line in the text area using this format:
```
Driver Name, Seed Number
```

For example:
```
James Deane, 1
Fredric Aasbo, 2
Chris Forsberg, 3
```

If you don't specify a seed number, drivers will be seeded in the order they are entered.

You can use "BYE" as a driver name for empty slots. BYEs will automatically advance their opponent.

### Sharing Your Bracket

The "Share Bracket" button generates a URL that contains your entire bracket data (competition name, drivers, and winners). You can copy and share this URL with others, and when they open it, they'll see the exact same bracket you've created.

Security note: All shared data is properly sanitized to prevent XSS attacks.

## Hosting on GitHub Pages

This project is designed to be hosted on GitHub Pages. To host your own copy:

1. Fork this repository
2. Go to Settings > Pages
3. Select the main branch as the source
4. Click Save

Your bracket generator will be available at `https://[your-username].github.io/[repository-name]/`

## Local Development

To run this project locally, simply clone the repository and open the index.html file in your browser. No server is required as all functionality runs in the browser.

## License

This project is open source and available under the MIT License. 