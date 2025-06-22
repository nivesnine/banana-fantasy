# Drift Bracket Generator

An interactive bracket generator for Drift tournaments, allowing users to create and manage Top 32 or Top 16 brackets.

## Features

- Create Top 32 or Top 16 brackets (automatically determined based on number of drivers)
- Enter custom driver lists
- Customize competition name
- Interactive bracket - select winners by clicking on drivers
- Download the bracket as an image
- Share your bracket with others via a URL
- Data is saved in your browser - your bracket persists between sessions
- Reset bracket or clear all data with simple button clicks

## How to Use

1. Enter a competition name (optional) in the designated field
2. Enter your driver list (one per line) in the text area
3. Click "Load Drivers" to generate the bracket
4. The bracket will automatically determine whether to use Top 16 or Top 32 format based on your driver count
5. Click on driver names to advance them through the bracket
6. Use the "Download as Image" button to save a copy of your current bracket
7. Use the "Share Bracket" button to generate a shareable URL that contains your bracket data
8. Use "Reset Bracket" to clear winner selections while keeping your driver data
9. Use "Clear Saved Data" to completely reset the application

### Driver Entry Format

Enter one driver per line in the text area:
```
Driver Name
```

For example:
```
James Deane
Fredric Aasbo
Chris Forsberg
Daigo Saito
```

Tips for driver entry:
- Drivers will be seeded in the order they are entered
- You can use "BYE" as a driver name for empty slots (BYEs will automatically advance their opponent)
- For the best seeding, enter higher-ranked drivers at the top of your list
- You need at least 4 drivers to generate a bracket
- The application supports a maximum of 32 drivers
- Drivers will be paired based on standard tournament seeding (1 vs 32, 2 vs 31, etc.)

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