/**
 * Main application initialization and event handling
 */
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize the bracket generator
    await bracketGenerator.init();
    
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
                    'show-round-one',
                    'show-round-two',
                    'show-round-three',
                    'show-round-four',
                    'show-championship'
                );
                
                // If not showing all rounds, add mobile view and specific round class
                if (selectedRound !== 'all') {
                    bracketContainer.classList.add('mobile-view');
                    bracketContainer.classList.add(`show-${selectedRound}`);
                }
            }
        });
        
        // Auto-select the first round on mobile devices
        if (isMobile) {
            roundSelector.value = 'round-one';
            roundSelector.dispatchEvent(new Event('change'));
        }
    }
    
    // Set up download button
    document.getElementById('download-bracket').addEventListener('click', function() {
        // For mobile, ensure all rounds are visible before downloading
        if (isMobile) {
            const bracketContainer = document.getElementById('bracket-container');
            if (bracketContainer) {
                // Remove mobile view classes temporarily to show the full bracket
                bracketContainer.classList.remove('mobile-view', 'show-round-one', 'show-round-two', 
                    'show-round-three', 'show-round-four', 'show-championship');
                
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
}); 