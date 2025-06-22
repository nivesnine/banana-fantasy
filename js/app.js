/**
 * Main application initialization and event handling
 */

/**
 * Updates the round selector options based on the active template (Top 32 or Top 16)
 * @param {boolean} isTop16 - Whether the active template is Top 16 (true) or Top 32 (false)
 */
function updateRoundSelectorOptions(isTop16) {
    const roundSelector = document.getElementById('round-selector');
    if (!roundSelector) return;
    
    // Clear existing options
    roundSelector.innerHTML = '';
    
    // Add "All Rounds" option
    const allRoundsOption = document.createElement('option');
    allRoundsOption.value = 'all';
    allRoundsOption.textContent = 'All Rounds';
    roundSelector.appendChild(allRoundsOption);
    
    if (isTop16) {
        // Add Top 16 options
        const top16Options = [
            { value: 'top16 round-one', text: 'Top 16' },
            { value: 'top16 round-two', text: 'Quarter Finals' },
            { value: 'top16 round-three', text: 'Semi Finals' },
            { value: 'top16 championship', text: 'Final Battle' }
        ];
        
        top16Options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.text;
            roundSelector.appendChild(option);
        });
    } else {
        // Add Top 32 options
        const top32Options = [
            { value: 'top32 round-one', text: 'Top 32' },
            { value: 'top32 round-two', text: 'Top 16' },
            { value: 'top32 round-three', text: 'Great 8' },
            { value: 'top32 round-four', text: 'Final 4' },
            { value: 'top32 championship', text: 'Final Battle' }
        ];
        
        top32Options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.text;
            roundSelector.appendChild(option);
        });
    }
    
    // Auto-select the first round option on mobile devices
    const isMobile = window.innerWidth <= 768;
    if (isMobile && roundSelector.options.length > 1) {
        roundSelector.value = roundSelector.options[1].value; // Select the first round after "All Rounds"
        roundSelector.dispatchEvent(new Event('change'));
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    // Check if LZString is available
    const lzStringAvailable = typeof LZString !== 'undefined' || typeof window.LZString !== 'undefined';
    
    // Initialize the bracket generator
    await bracketGenerator.init();
    
    // Initialize bracket sharing
    bracketSharing.init();
    
    // Check if we're on a mobile device
    const isMobile = window.innerWidth <= 768;
    
    // Set up mobile round selector
    const roundSelector = document.getElementById('round-selector');
    if (roundSelector) {
        roundSelector.addEventListener('change', function() {
            const selectedRound = this.value;
            const bracketContainer = document.getElementById('bracket-container');
            
            if (bracketContainer) {
                // First remove all round-specific classes
                bracketContainer.classList.remove(
                    'mobile-view',
                    'show-top32-round-one',
                    'show-top32-round-two',
                    'show-top32-round-three',
                    'show-top32-round-four',
                    'show-top32-championship',
                    'show-top16-round-one',
                    'show-top16-round-two',
                    'show-top16-round-three',
                    'show-top16-championship'
                );
                
                // If not showing all rounds, add mobile view and specific round class
                if (selectedRound !== 'all') {
                    bracketContainer.classList.add('mobile-view');
                    bracketContainer.classList.add(`show-${selectedRound.replace(' ', '-')}`);
                }
            }
        });
    }
    
    // Set up download button
    document.getElementById('download-bracket').addEventListener('click', function() {
        // For mobile, ensure all rounds are visible before downloading
        if (isMobile) {
            const bracketContainer = document.getElementById('bracket-container');
            if (bracketContainer) {
                // Remove mobile view classes temporarily to show the full bracket
                bracketContainer.classList.remove(
                    'mobile-view', 
                    'show-top32-round-one',
                    'show-top32-round-two',
                    'show-top32-round-three',
                    'show-top32-round-four',
                    'show-top32-championship',
                    'show-top16-round-one',
                    'show-top16-round-two',
                    'show-top16-round-three',
                    'show-top16-championship'
                );
                
                // Add a temporary class for download styling
                bracketContainer.classList.add('download-view');
            }
        }
        
        bracketDownload.downloadBracketAsImage();
        
        // Restore mobile view settings after download
        if (isMobile && roundSelector) {
            setTimeout(() => {
                const bracketContainer = document.getElementById('bracket-container');
                if (bracketContainer) {
                    // Remove the download view class
                    bracketContainer.classList.remove('download-view');
                    
                    // Restore the round view
                    roundSelector.dispatchEvent(new Event('change'));
                }
            }, 500);
        }
    });

    document.getElementById('download-bracket-mobile').addEventListener('click', function() {
        // For mobile, ensure all rounds are visible before downloading
        if (isMobile) {
            const bracketContainer = document.getElementById('bracket-container');
            if (bracketContainer) {
                // Remove mobile view classes temporarily to show the full bracket
                bracketContainer.classList.remove(
                    'mobile-view', 
                    'show-top32-round-one',
                    'show-top32-round-two',
                    'show-top32-round-three',
                    'show-top32-round-four',
                    'show-top32-championship',
                    'show-top16-round-one',
                    'show-top16-round-two',
                    'show-top16-round-three',
                    'show-top16-championship'
                );
                
                // Add a temporary class for download styling
                bracketContainer.classList.add('download-view');
            }
        }
        
        bracketDownload.downloadBracketAsImage();
        
        // Restore mobile view settings after download
        if (isMobile && roundSelector) {
            setTimeout(() => {
                const bracketContainer = document.getElementById('bracket-container');
                if (bracketContainer) {
                    // Remove the download view class
                    bracketContainer.classList.remove('download-view');
                    
                    // Restore the round view
                    roundSelector.dispatchEvent(new Event('change'));
                }
            }, 500);
        }
    });
    
    // Set up share button
    document.getElementById('share-bracket').addEventListener('click', function() {
        // Create the shareable URL
        const shareURL = bracketSharing.createShareableURL();
        if (!shareURL) return;
        
        // Show the share URL section
        const shareSection = document.querySelector('.share-url-section');
        shareSection.style.display = 'block';
        
        // Set the share URL in the input field
        const shareInput = document.getElementById('share-url-input');
        shareInput.value = shareURL;
        
        // Focus and select the input
        shareInput.focus();
        shareInput.select();
        
        // Scroll to the share section
        shareSection.scrollIntoView({ behavior: 'smooth' });
    });
    
    // Set up copy share URL button
    document.getElementById('copy-share-url').addEventListener('click', function() {
        const shareInput = document.getElementById('share-url-input');
        shareInput.select();
        document.execCommand('copy');
        bracketStorage.showStatusMessage('Share URL copied to clipboard', 'success');
    });
    
    // Set up share input field to select all text when clicked
    document.getElementById('share-url-input').addEventListener('click', function() {
        this.select();
    });
    
    // Set up reset bracket button
    document.getElementById('reset-bracket').addEventListener('click', function() {
        if (confirm('Are you sure you want to reset the bracket? This will keep your driver data but clear all winner selections.')) {
            // Reset winners but keep driver data
            bracketGenerator.bracketData.winners = {};
            bracketStorage.saveBracket(bracketGenerator.bracketData);
            location.reload();
        }
    });
    
    // Set up clear storage button
    document.getElementById('clear-storage').addEventListener('click', function() {
        if (confirm('Are you sure you want to clear all saved bracket data?')) {
            bracketStorage.clearBracket();
            location.reload();
        }
    });
    
    // Try to load from shared URL first
    const sharedBracketLoaded = await bracketSharing.loadFromSharedURL();
    
    // If no shared bracket, check for saved data and load if available
    if (!sharedBracketLoaded && bracketStorage.hasSavedBracket()) {
        const savedData = bracketStorage.loadBracket();
        await bracketGenerator.loadSavedBracket(savedData);
        
        const lastUpdated = bracketStorage.getLastUpdated();
        if (lastUpdated) {
            const dateStr = new Date(lastUpdated).toLocaleString();
            bracketStorage.showStatusMessage(`Loaded saved bracket from ${dateStr}`, 'info');
        }
        
        // Update round selector options based on the loaded bracket template
        if (savedData && savedData.bracketType) {
            updateRoundSelectorOptions(savedData.bracketType === 'top16');
        } else {
            // Default to top32 if no bracket type is specified
            updateRoundSelectorOptions(false);
        }
    } else if (!sharedBracketLoaded) {
        // No saved bracket, initialize with default Top 32 options
        updateRoundSelectorOptions(false);
    }
    
    // Check window resize for mobile/desktop switching
    window.addEventListener('resize', function() {
        const isMobileNow = window.innerWidth <= 768;
        const bracketContainer = document.getElementById('bracket-container');
        
        if (isMobileNow !== isMobile && bracketContainer && roundSelector) {
            if (isMobileNow) {
                // Switching to mobile
                roundSelector.value = 'round-one';
                roundSelector.dispatchEvent(new Event('change'));
            } else {
                // Switching to desktop
                bracketContainer.classList.remove('mobile-view');
            }
        }
    });
    
    // Set up driver entry form
    document.getElementById('driver-entry-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const competitionName = document.getElementById('competition-name-input').value.trim() || 'Drift Top 32 Bracket';
        const driverListText = document.getElementById('driver-list').value;
        
        if (!driverListText.trim()) {
            bracketStorage.showStatusMessage('Please enter driver data', 'error');
            return;
        }
        
        const drivers = bracketGenerator.parseDrivers(driverListText);
        
        if (drivers.length === 0) {
            bracketStorage.showStatusMessage('No valid drivers found', 'error');
            return;
        }
        
        // Pass the original driver list text to be saved
        bracketGenerator.updateBracket(competitionName, drivers, driverListText);
        bracketStorage.showStatusMessage(`Loaded ${drivers.length} drivers`, 'success');
        
        // Hide the share URL section when new drivers are loaded
        document.querySelector('.share-url-section').style.display = 'none';
        
        // Update round selector options based on the number of drivers
        // Top 16 bracket is used when there are fewer than 32 drivers
        updateRoundSelectorOptions(drivers.length <= 16);
    });

    // Initialize line numbers for textarea
    const driverTextarea = document.getElementById('driver-list');
    const lineNumbers = document.getElementById('driver-list-line-numbers');

    if (driverTextarea && lineNumbers) {
        // Initial line numbers update
        updateLineNumbers(driverTextarea, lineNumbers);

        // Update line numbers on input or when text changes
        driverTextarea.addEventListener('input', function() {
            updateLineNumbers(driverTextarea, lineNumbers);
        });
        
        driverTextarea.addEventListener('keydown', function() {
            // Small delay to ensure text has been updated
            setTimeout(() => updateLineNumbers(driverTextarea, lineNumbers), 0);
        });

        // Sync scroll position more precisely
        driverTextarea.addEventListener('scroll', function() {
            lineNumbers.scrollTop = driverTextarea.scrollTop;
        });
    }

    function updateLineNumbers(textarea, lineNumbersDiv) {
        const lines = textarea.value.split('\n');
        const lineCount = lines.length || 1; // Ensure at least one line
        lineNumbersDiv.innerHTML = '';
        
        // Create one number per line
        for (let i = 0; i < lineCount; i++) {
            const span = document.createElement('span');
            span.textContent = (i + 1).toString();
            lineNumbersDiv.appendChild(span);
        }
    }
}); 