/**
 * BracketGenerator - Handles generating and updating the bracket
 */
const bracketGenerator = {
    template32: null,
    template16: null,
    bracketData: {
        competitionName: 'Drift Top 32 Bracket',
        drivers: [],
        winners: {},
        bracketSize: 32,
        bracketType: 'top32', // Default to top32
        driverListText: '' // Store the original driver list text
    },
    
    /**
     * Initializes the bracket generator
     */
    init: async function() {
        // Load the templates
        try {
            // Load Top 32 template
            const response32 = await fetch('template.html');
            this.template32 = await response32.text();
            
            // Load Top 16 template
            const response16 = await fetch('template16.html');
            this.template16 = await response16.text();
        } catch (error) {
            console.error('Error loading templates:', error);
            bracketStorage.showStatusMessage('Error loading bracket templates', 'error');
        }
    },
    
    /**
     * Parses driver data from input text
     * @param {string} inputText - Driver data input text
     * @returns {Array} - Array of driver objects
     */
    parseDrivers: function(inputText) {
        const lines = inputText.trim().split('\n');
        const drivers = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // Check if the line has a comma to parse as "Name, Seed"
            if (line.includes(',')) {
                const parts = line.split(',').map(part => part.trim());
                const driverName = parts[0];
                // For explicit seed numbers, use the provided value
                const seed = parseInt(parts[1]) || (i + 1);
                
                drivers.push({
                    name: driverName,
                    seed: seed,
                    isBye: driverName.toLowerCase() === 'bye'
                });
            } else {
                // No comma, assign sequential seed numbers (1, 2, 3, 4...)
                drivers.push({
                    name: line,
                    seed: i + 1,
                    isBye: line.toLowerCase() === 'bye'
                });
            }
        }
        
        return drivers;
    },
    
    /**
     * Sets up a Top 16 or Top 32 bracket based on number of drivers
     * @param {Array} drivers - Array of driver objects
     * @returns {number} - The bracket size (16 or 32)
     */
    determineBracketSize: function(drivers) {
        // If there are 16 or fewer drivers, use a Top 16 bracket
        // Otherwise, use a Top 32 bracket
        return drivers.length <= 16 ? 16 : 32;
    },
    
    /**
     * Assigns drivers to their positions in the bracket
     * @param {Array} drivers - Array of driver objects
     * @param {number} bracketSize - Size of the bracket (16 or 32)
     * @returns {Object} - Object mapping position numbers to driver data
     */
    assignDriverPositions: function(drivers, bracketSize) {
        const positions = {};
        
        // Place drivers directly in positions 1, 2, 3, 4, etc. based on their order
        for (let i = 0; i < Math.min(drivers.length, bracketSize); i++) {
            // Add 1 to convert from 0-based index to 1-based position
            const position = i + 1;
            positions[position] = drivers[i];
        }
        
        // Fill empty positions with BYEs
        for (let i = 1; i <= bracketSize; i++) {
            if (!positions[i]) {
                positions[i] = { name: 'BYE', seed: i, isBye: true };
            }
        }
        
        return positions;
    },
    
    /**
     * Gets the positions for each seed in the bracket
     * @param {number} bracketSize - Size of the bracket (16 or 32)
     * @returns {Array} - Array mapping index to position
     */
    getSeedPositions: function(bracketSize) {
        if (bracketSize === 16) {
            // Standard 16-team bracket seeding
            return [1, 16, 8, 9, 4, 13, 5, 12, 2, 15, 7, 10, 3, 14, 6, 11];
        } else {
            // Standard 32-team bracket seeding
            return [
                1, 32, 16, 17, 8, 25, 9, 24, 4, 29, 13, 20, 5, 28, 12, 21,
                2, 31, 15, 18, 7, 26, 10, 23, 3, 30, 14, 19, 6, 27, 11, 22
            ];
        }
    },
    
    /**
     * Generates bracket HTML from template
     * @returns {string} - Generated HTML
     */
    generateBracketHTML: function() {
        // Select the appropriate template based on bracket size
        const template = this.bracketData.bracketSize === 16 ? this.template16 : this.template32;
        
        if (!template) {
            console.error('Template not loaded');
            return '<div>Error: Template not loaded</div>';
        }
        
        let html = template;
        
        // Replace competition name
        html = html.replace(/{{competition_name}}/g, this.bracketData.competitionName);
        
        // Replace driver names based on seed numbers
        const drivers = this.bracketData.drivers;
        for (const seed in drivers) {
            if (drivers[seed]) {
                // Try specific placeholder first (e.g., {{driver_name_1}})
                const specificPlaceholder = `{{driver_name_${seed}}}`;
                const specificRegex = new RegExp(specificPlaceholder, 'g');
                html = html.replace(specificRegex, drivers[seed].name);
                
                // Also try matching the seed number in span with regular placeholder
                const spanPattern = `<span class="qualif_num">${seed}</span>{{driver_name}}`;
                const spanReplacement = `<span class="qualif_num">${seed}</span>${drivers[seed].name}`;
                html = html.replace(spanPattern, spanReplacement);
            }
        }
        
        // Replace any remaining placeholders
        html = html.replace(/{{driver_name(_\d+)?}}/g, '');
        html = html.replace(/{{winner_r\d+_m\d+}}/g, '');
        
        return html;
    },
    
    /**
     * Converts the template to a Top 16 bracket
     * @param {string} html - The template HTML
     * @returns {string} - Modified HTML for Top 16
     */
    convertToTop16: function(html) {
        // No longer needed as we're using a dedicated Top 16 template
        return html;
    },
    
    /**
     * Updates the bracket with new data
     * @param {string} competitionName - Name of the competition
     * @param {Array} drivers - Array of driver objects
     * @param {string} driverListText - The original driver list text
     */
    updateBracket: async function(competitionName, drivers, driverListText = '') {
        // Ensure template is loaded
        if (!this.template32 || !this.template16) {
            await this.init();
        }
        
        // Determine bracket size
        const bracketSize = this.determineBracketSize(drivers);
        const bracketType = bracketSize === 16 ? 'top16' : 'top32';
        
        // Update bracket data
        this.bracketData.competitionName = competitionName;
        this.bracketData.bracketSize = bracketSize;
        this.bracketData.bracketType = bracketType;
        this.bracketData.drivers = this.assignDriverPositions(drivers, bracketSize);
        this.bracketData.winners = {};
        this.bracketData.driverListText = driverListText; // Save the original text
        
        // Generate and render the bracket
        const bracketHTML = this.generateBracketHTML();
        
        // Get references to important elements
        let competitionNameElement = document.getElementById('competition-name');
        const mobileControls = document.querySelector('.mobile-controls');
        const bracketContainer = document.getElementById('bracket-container');
        
        // Create competition name element if it doesn't exist
        if (!competitionNameElement) {
            competitionNameElement = document.createElement('div');
            competitionNameElement.id = 'competition-name';
        }
        
        // Update competition name
        competitionNameElement.textContent = competitionName;
        
        // Update the bracket container
        while (bracketContainer.firstChild) {
            bracketContainer.removeChild(bracketContainer.firstChild);
        }
        
        // Parse and sanitize the bracket HTML using DOMParser
        const parser = new DOMParser();
        const doc = parser.parseFromString(bracketHTML, 'text/html');
        const safeNodes = doc.body.childNodes;
        
        // Append each node safely
        for (let i = 0; i < safeNodes.length; i++) {
            bracketContainer.appendChild(document.importNode(safeNodes[i], true));
        }
        
        // Add competition name as the first child
        bracketContainer.insertBefore(competitionNameElement, bracketContainer.firstChild);
        
        // Save the bracket data
        bracketStorage.saveBracket(this.bracketData);
        
        // Set up click handlers for driver selection
        this.setupDriverClickHandlers();
    },
    
    /**
     * Sets up click handlers for selecting winners
     */
    setupDriverClickHandlers: function() {
        // Add click handlers to driver entries
        const driverElements = document.querySelectorAll('.top, .bottom');
        driverElements.forEach(element => {
            this.makeElementSelectable(element);
            
            // Add title attribute with full name for hover tooltip
            const fullName = this.cleanDriverName(element.textContent.trim());
            if (fullName && fullName !== 'BYE') {
                element.setAttribute('title', fullName);
            }
        });
    },
    
    /**
     * Gets the ID for a match
     * @param {Element} matchupElement - Matchup element
     * @returns {string} - Match ID
     */
    getMatchId: function(matchupElement) {
        // Find the round and position of this matchup
        const round = matchupElement.closest('.round');
        const roundNumber = this.getRoundNumber(round);
        
        // Check if this is in split-two (right side of bracket)
        const isRightSide = !!matchupElement.closest('.split-two');
        
        // Find the position of this matchup within its round
        const matchups = Array.from(round.querySelectorAll('.matchup'));
        const matchPosition = matchups.indexOf(matchupElement) + 1;
        
        // The offset depends on bracket size and round number
        let offset = 0;
        if (isRightSide) {
            if (this.bracketData.bracketSize === 32) {
                // For Top 32 bracket
                if (roundNumber === 1) offset = 8;
                else if (roundNumber === 2) offset = 4;
                else if (roundNumber === 3) offset = 2;
                else if (roundNumber === 4) offset = 1;
            } else {
                // For Top 16 bracket
                if (roundNumber === 1) offset = 4;
                else if (roundNumber === 2) offset = 2;
                else if (roundNumber === 3) offset = 1;
            }
        }
        
        return `r${roundNumber}_m${matchPosition + offset}`;
    },
    
    /**
     * Gets the round number for a round element
     * @param {Element} roundElement - Round element
     * @returns {number} - Round number (1-4)
     */
    getRoundNumber: function(roundElement) {
        if (roundElement.classList.contains('round-one')) {
            return 1;
        } else if (roundElement.classList.contains('round-two')) {
            return 2;
        } else if (roundElement.classList.contains('round-three')) {
            return 3;
        } else if (roundElement.classList.contains('round-four')) {
            return 4;
        }
        return 0;
    },
    
    /**
     * Advances a winner to the next round
     * @param {string} matchId - ID of the match
     * @param {string} winnerName - Name of the winner
     * @param {boolean} markSelected - Whether to mark the advanced winner as selected
     */
    advanceWinner: function(matchId, winnerName, markSelected = false) {
        // Check if there was a previous winner for this match
        const previousWinner = this.bracketData.winners[matchId];
        const cleanNewWinnerName = this.cleanDriverName(winnerName);
        
        // If there was a different previous winner, we need to cascade delete it from all subsequent rounds
        if (previousWinner && previousWinner !== winnerName && 
            this.cleanDriverName(previousWinner) !== cleanNewWinnerName) {
            this.cascadeDeleteWinner(matchId, previousWinner);
        }
        
        // Update the winner in the data structure
        this.bracketData.winners[matchId] = winnerName;
        
        // Save the updated bracket data
        bracketStorage.saveBracket(this.bracketData);
        
        // Parse the match ID to get round and match numbers
        const [roundNumber, matchNumber] = matchId.replace('r', '').split('_m').map(n => parseInt(n));
        
        // Determine the final round number based on bracket size
        const finalRound = this.bracketData.bracketSize === 32 ? 4 : 3;
        
        // If this is the final round before championship, advance to final
        if (roundNumber === finalRound) {
            // Championship placeholders are winner_r4_m1 and winner_r4_m2 for Top 32
            // or winner_r3_m1 and winner_r3_m2 for Top 16
            const championshipElement = document.querySelector('.championship');
            if (championshipElement) {
                // Determine if this is match 1 or match 2 in the final round
                if (matchNumber === 1) {
                    // Update the top position in the championship
                    const topElement = championshipElement.querySelector('.top');
                    if (topElement) {
                        topElement.textContent = cleanNewWinnerName;
                        this.makeElementSelectable(topElement);
                        topElement.setAttribute('title', cleanNewWinnerName); // Add title for tooltip
                        
                        // If this is a restoration, mark as selected if needed
                        if (markSelected) {
                            topElement.classList.add('selected');
                        }
                    }
                } else if (matchNumber === 2) {
                    // Update the bottom position in the championship
                    const bottomElement = championshipElement.querySelector('.bottom');
                    if (bottomElement) {
                        bottomElement.textContent = cleanNewWinnerName;
                        this.makeElementSelectable(bottomElement);
                        bottomElement.setAttribute('title', cleanNewWinnerName); // Add title for tooltip
                        
                        // If this is a restoration, mark as selected if needed
                        if (markSelected) {
                            bottomElement.classList.add('selected');
                        }
                    }
                }
            }
            return;
        }
        
        // Regular rounds
        // Target the next round
        const nextRoundNumber = roundNumber + 1;
        const nextRoundClass = this.getRoundClassName(nextRoundNumber);
        
        // Calculate target position in next round
        const nextMatchIndex = Math.floor((matchNumber - 1) / 2);
        const nextMatchNumber = nextMatchIndex + 1;
        
        // In each next round matchup, the winner from an odd-numbered match goes to top
        // and the winner from an even-numbered match goes to bottom
        const isOddMatch = matchNumber % 2 === 1;
        const targetPosition = isOddMatch ? 'top' : 'bottom';
        
        // Determine if this match is on the left or right side of the bracket
        // For Top 32: Matches 1-8 are left, 9-16 are right in round 1
        // For Top 16: Matches 1-4 are left, 5-8 are right in round 1
        const bracketSize = this.bracketData.bracketSize;
        const midpoint = bracketSize === 32 ? 8 : 4;
        const isRightSide = matchNumber > midpoint / Math.pow(2, roundNumber - 1);
        
        // Find the correct side of the bracket
        const sideSelector = isRightSide ? '.split-two' : '.split-one';
        
        // Find the target matchup in the next round more precisely
        const targetRoundElement = document.querySelector(`${sideSelector} .round-${nextRoundClass}`);
        
        if (targetRoundElement) {
            // Find all matchups in this round on this side
            const matchups = targetRoundElement.querySelectorAll('.matchup');
            
            // Calculate local index - which matchup within this side and round
            const localNextMatchIndex = isRightSide ? 
                nextMatchIndex - (midpoint / Math.pow(2, nextRoundNumber - 1)) : nextMatchIndex;
            
            if (localNextMatchIndex >= 0 && localNextMatchIndex < matchups.length) {
                const targetMatchup = matchups[localNextMatchIndex];
                const targetElement = targetMatchup.querySelector(`.${targetPosition}`);
                
                if (targetElement) {
                    // Update with the new winner name
                    targetElement.textContent = cleanNewWinnerName;
                    
                    // Make the advanced winner selectable
                    this.makeElementSelectable(targetElement);
                    
                    // Add title attribute for tooltip
                    targetElement.setAttribute('title', cleanNewWinnerName);
                    
                    console.log(`Advanced ${cleanNewWinnerName} to ${isRightSide ? 'right' : 'left'} side, round ${nextRoundNumber}, match ${nextMatchNumber}, position ${targetPosition}`);
                }
            } else {
                console.warn(`Could not find target matchup: side=${isRightSide ? 'right' : 'left'}, round=${nextRoundNumber}, localIndex=${localNextMatchIndex}, matchups.length=${matchups.length}`);
            }
        } else {
            console.warn(`Could not find target round element: ${sideSelector} .round-${nextRoundClass}`);
        }
    },
    
    /**
     * Removes a winner from all subsequent rounds
     * @param {string} matchId - ID of the match
     * @param {string} winnerName - Name of the winner to remove
     */
    cascadeDeleteWinner: function(matchId, winnerName) {
        const [roundNumber, matchNumber] = matchId.replace('r', '').split('_m').map(n => parseInt(n));
        const cleanWinnerName = this.cleanDriverName(winnerName);
        
        // Calculate the next round and match
        const nextRoundNumber = roundNumber + 1;
        const nextMatchIndex = Math.floor((matchNumber - 1) / 2);
        const nextMatchId = `r${nextRoundNumber}_m${nextMatchIndex + 1}`;
        
        // Check if this winner was advanced to the next round
        const nextRoundWinner = this.bracketData.winners[nextMatchId];
        if (nextRoundWinner && this.cleanDriverName(nextRoundWinner) === cleanWinnerName) {
            // Recursively cascade delete from all subsequent rounds
            this.cascadeDeleteWinner(nextMatchId, nextRoundWinner);
            
            // Remove from winners data
            delete this.bracketData.winners[nextMatchId];
        }
        
        // Clear the UI element in the next round
        const nextRoundClass = this.getRoundClassName(nextRoundNumber);
        const isOddMatch = matchNumber % 2 === 1;
        const targetPosition = isOddMatch ? 'top' : 'bottom';
        
        // Find the target element in the next round
        const nextRoundMatchups = document.querySelectorAll(`.round-${nextRoundClass} .matchup`);
        if (nextMatchIndex < nextRoundMatchups.length) {
            const targetMatchup = nextRoundMatchups[nextMatchIndex];
            const targetElement = targetMatchup.querySelector(`.${targetPosition}`);
            
            if (targetElement && targetElement.textContent.trim() === cleanWinnerName) {
                // Clear the element
                targetElement.textContent = '';
            }
        }
    },
    
    /**
     * Cleans a driver name by removing any seed numbers
     * @param {string} driverName - The driver name to clean
     * @returns {string} - The cleaned driver name
     */
    cleanDriverName: function(driverName) {
        // Remove seed numbers whether they appear at beginning or end
        // First, handle HTML content by removing span elements
        let cleanName = driverName;
        
        // Remove any HTML span elements with qualification numbers
        cleanName = cleanName.replace(/<span class="qualif_num">\d+<\/span>/g, '');
        
        // Remove any leading numbers (for left bracket)
        cleanName = cleanName.replace(/^\d+\s*/, '');
        
        // Remove any trailing numbers (for right bracket)
        cleanName = cleanName.replace(/\s*\d+$/, '');
        
        return cleanName.trim();
    },
    
    /**
     * Gets the class name for a round number
     * @param {number} roundNumber - Round number (1-4)
     * @returns {string} - Class name for the round
     */
    getRoundClassName: function(roundNumber) {
        switch(roundNumber) {
            case 1: return 'one';
            case 2: return 'two';
            case 3: return 'three';
            case 4: return 'four';
            default: return '';
        }
    },
    
    /**
     * Gets the target indexes in the next round for a winner
     * @param {number} roundNumber - Current round number
     * @param {number} matchNumber - Current match number
     * @returns {Array} - Array of target indexes
     */
    getNextRoundTargetIndexes: function(roundNumber, matchNumber) {
        // Calculate the target index in the next round
        // For a tournament bracket, each pair of consecutive matches feeds into one match in the next round
        const nextRoundIndex = Math.floor((matchNumber - 1) / 2);
        
        // Matches 1,2 feed into next round's match 1; matches 3,4 feed into next round's match 2, etc.
        // Odd-numbered matches (1,3,5,7...) -> top position
        // Even-numbered matches (2,4,6,8...) -> bottom position
        const isOddMatch = matchNumber % 2 === 1;
        
        // Return the single target index based on whether this is an odd or even match
        if (isOddMatch) {
            return [nextRoundIndex * 2]; // Top position
        } else {
            return [nextRoundIndex * 2 + 1]; // Bottom position
        }
    },
    
    /**
     * Makes an element selectable by adding click handlers
     * @param {Element} element - The element to make selectable
     */
    makeElementSelectable: function(element) {
        // Add a click handler to the element
        element.addEventListener('click', (e) => {
            const driverElement = e.currentTarget;
            const matchup = driverElement.closest('.matchup');
            
            if (!matchup) return;
            
            // Remove selected class from both drivers in the matchup
            matchup.querySelectorAll('.top, .bottom').forEach(el => {
                el.classList.remove('selected');
            });
            
            // Add selected class to the clicked driver
            driverElement.classList.add('selected');
            
            // Get winner name and make sure we clean it properly
            const winnerName = this.cleanDriverName(driverElement.textContent.trim());
            
            // Check if this is the championship matchup
            if (matchup.classList.contains('championship')) {
                // For championship, we just record the winner but don't advance further
                const matchId = 'championship';
                this.bracketData.winners[matchId] = winnerName;
                bracketStorage.saveBracket(this.bracketData);
                return;
            }
            
            // For regular matchups, get the match ID and advance the winner
            const matchId = this.getMatchId(matchup);
            
            // Save the updated bracket data and advance to next round
            this.advanceWinner(matchId, winnerName);
        });
        
        // Add the necessary styling and cursor
        element.style.cursor = 'pointer';
    },
    
    /**
     * Loads a saved bracket
     * @param {Object} savedData - Saved bracket data
     */
    loadSavedBracket: async function(savedData) {
        if (!savedData) return;
        
        // Set the bracket data
        this.bracketData = savedData;
        
        // Ensure bracketType is set based on bracketSize for backward compatibility
        if (!this.bracketData.bracketType) {
            this.bracketData.bracketType = this.bracketData.bracketSize === 16 ? 'top16' : 'top32';
        }
        
        // Ensure templates are loaded
        if (!this.template32 || !this.template16) {
            await this.init();
        }
        
        // Update the competition name input
        document.getElementById('competition-name-input').value = this.bracketData.competitionName;
        
        // Generate and render the bracket
        const bracketHTML = this.generateBracketHTML();
        
        // Get references to important elements
        let competitionNameElement = document.getElementById('competition-name');
        const bracketContainer = document.getElementById('bracket-container');
        
        // Create competition name element if it doesn't exist
        if (!competitionNameElement) {
            competitionNameElement = document.createElement('div');
            competitionNameElement.id = 'competition-name';
        }
        
        // Update competition name
        competitionNameElement.textContent = this.bracketData.competitionName;
        
        // Update the bracket container
        while (bracketContainer.firstChild) {
            bracketContainer.removeChild(bracketContainer.firstChild);
        }
        
        // Parse and sanitize the bracket HTML using DOMParser
        const parser = new DOMParser();
        const doc = parser.parseFromString(bracketHTML, 'text/html');
        const safeNodes = doc.body.childNodes;
        
        // Append each node safely
        for (let i = 0; i < safeNodes.length; i++) {
            bracketContainer.appendChild(document.importNode(safeNodes[i], true));
        }
        
        // Add competition name as the first child
        bracketContainer.insertBefore(competitionNameElement, bracketContainer.firstChild);
        
        // Restore the driver list text if available
        if (this.bracketData.driverListText) {
            document.getElementById('driver-list').value = this.bracketData.driverListText;
        }
        
        // Set up click handlers
        this.setupDriverClickHandlers();
        
        // Restore selected winners
        this.restoreWinners();
    },
    
    /**
     * Restores selected winners from saved data
     */
    restoreWinners: function() {
        // Verify we have all the required data
        if (!this.bracketData || !this.bracketData.winners) {
            console.error('Missing bracket data or winners when restoring');
            return;
        }
        
        console.log('Restoring winners for bracket size:', this.bracketData.bracketSize);
        console.log('Saved winners:', JSON.stringify(this.bracketData.winners));
        
        // First pass: advance winners to populate the bracket
        // Store the matches we need to mark as selected later
        const matchesToMark = {};
        
        // Process all non-championship matches
        const finalRound = this.bracketData.bracketSize === 32 ? 4 : 3;
        
        // Copy the winners to avoid modification issues during iteration
        const winnersToAdvance = {...this.bracketData.winners};
        
        // Process matches round by round to ensure proper advancement order
        for (let round = 1; round <= finalRound; round++) {
            for (const matchId in winnersToAdvance) {
                // Only process matches in the current round
                if (!matchId.startsWith(`r${round}_m`)) continue;
                
                // Skip the championship match
                if (matchId === 'championship') continue;
                
                const winner = winnersToAdvance[matchId];
                if (winner) {
                    // Advance this winner to the next round without marking as selected yet
                    this.advanceWinner(matchId, winner, false);
                    
                    // Record this match for highlighting in the second pass
                    matchesToMark[matchId] = winner;
                }
            }
        }
        
        // Second pass: Mark all selected winners with the 'selected' class
        // Handle all matchups in the bracket
        const allMatchups = document.querySelectorAll('.matchup');
        
        // Go through each matchup and mark selected winners
        allMatchups.forEach(matchup => {
            // Skip the championship matchup - we'll handle it separately
            if (matchup.classList.contains('championship')) return;
            
            // Get the match ID for this matchup
            let matchId;
            try {
                matchId = this.getMatchId(matchup);
            } catch (e) {
                console.warn('Error getting match ID:', e);
                return;
            }
            
            // Check if we have a winner for this match
            const winner = this.bracketData.winners[matchId];
            if (!winner) return;
            
            // Find the driver elements in this matchup
            const driverElements = matchup.querySelectorAll('.top, .bottom');
            
            // Find and mark the winner
            driverElements.forEach(driver => {
                const driverText = driver.textContent.trim();
                const cleanDriverText = this.cleanDriverName(driverText);
                const cleanWinnerName = this.cleanDriverName(winner);
                
                if (cleanDriverText === cleanWinnerName || driverText === winner) {
                    // Mark this driver as selected
                    driver.classList.add('selected');
                    console.log(`Marked ${cleanWinnerName} as winner for match ${matchId}`);
                }
            });
        });
        
        // Handle championship/final round separately
        // Use the correct match IDs based on bracket size
        const finalMatches = this.bracketData.bracketSize === 32 ? 
            ['r4_m1', 'r4_m2'] : ['r3_m1', 'r3_m2'];
        
        const championshipElement = document.querySelector('.championship');
        if (championshipElement) {
            // Populate championship matchup from final round winners
            finalMatches.forEach((matchId, index) => {
                if (this.bracketData.winners[matchId]) {
                    const winnerName = this.bracketData.winners[matchId];
                    const cleanWinnerName = this.cleanDriverName(winnerName);
                    
                    // Final match positions (top is from match 1, bottom is from match 2)
                    const position = index === 0 ? '.top' : '.bottom';
                    const targetElement = championshipElement.querySelector(position);
                    
                    if (targetElement) {
                        targetElement.textContent = cleanWinnerName;
                        this.makeElementSelectable(targetElement);
                        console.log(`Set ${cleanWinnerName} in championship ${position}`);
                    }
                }
            });
            
            // Check if there's a champion selected
            if (this.bracketData.winners['championship']) {
                const championName = this.bracketData.winners['championship'];
                const cleanChampionName = this.cleanDriverName(championName);
                
                // Find and highlight the champion
                const finalists = championshipElement.querySelectorAll('.top, .bottom');
                finalists.forEach(finalist => {
                    const finalistName = this.cleanDriverName(finalist.textContent.trim());
                    if (finalistName === cleanChampionName) {
                        finalist.classList.add('selected');
                        console.log(`Marked ${cleanChampionName} as champion`);
                    }
                });
            }
        }
    },
    
    /**
     * Advances a winner to the next round by name
     * @param {string} matchId - ID of the match
     * @param {string} winnerName - Name of the winner
     */
    advanceWinnerByName: function(matchId, winnerName) {
        // This is now the same as advanceWinner
        this.advanceWinner(matchId, winnerName);
    }
}; 