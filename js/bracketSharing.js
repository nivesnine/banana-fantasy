/**
 * BracketSharing - Handles sharing bracket data via URL
 */
const bracketSharing = {
    /**
     * Creates a shareable URL for the current bracket
     * @returns {string} - Shareable URL
     */
    createShareableURL: function() {
        try {
            // Get current bracket data
            const bracketData = {
                competitionName: bracketGenerator.bracketData.competitionName,
                drivers: bracketGenerator.bracketData.drivers,
                winners: bracketGenerator.bracketData.winners,
                bracketSize: bracketGenerator.bracketData.bracketSize,
                driverListText: bracketGenerator.bracketData.driverListText
            };
            
            // Convert to JSON and encode for URL safety
            const jsonData = JSON.stringify(bracketData);
            const encodedData = encodeURIComponent(btoa(jsonData));
            
            // Create the URL with data as a parameter
            const shareURL = `${window.location.origin}${window.location.pathname}?share=${encodedData}`;
            
            return shareURL;
        } catch (error) {
            console.error('Error creating shareable URL:', error);
            bracketStorage.showStatusMessage('Error creating shareable URL', 'error');
            return null;
        }
    },
    
    /**
     * Copies shareable URL to clipboard
     */
    copyShareableURL: function() {
        const shareURL = this.createShareableURL();
        if (!shareURL) return;
        
        // Create a temporary input element
        const tempInput = document.createElement('input');
        tempInput.value = shareURL;
        document.body.appendChild(tempInput);
        
        // Select and copy the URL
        tempInput.select();
        document.execCommand('copy');
        
        // Remove the temporary input
        document.body.removeChild(tempInput);
        
        bracketStorage.showStatusMessage('Shareable URL copied to clipboard', 'success');
    },
    
    /**
     * Loads bracket data from a shared URL parameter
     * @returns {Promise<boolean>} - True if data was loaded successfully
     */
    loadFromSharedURL: async function() {
        try {
            // Check if there's a share parameter in the URL
            const urlParams = new URLSearchParams(window.location.search);
            const shareData = urlParams.get('share');
            
            if (!shareData) {
                return false;
            }
            
            // Decode the data
            const jsonData = atob(decodeURIComponent(shareData));
            const bracketData = JSON.parse(jsonData);
            
            // Validate the data structure
            if (!this.validateBracketData(bracketData)) {
                bracketStorage.showStatusMessage('Invalid shared bracket data', 'error');
                return false;
            }
            
            // Sanitize data to prevent XSS
            const sanitizedData = this.sanitizeBracketData(bracketData);
            
            // Load the bracket with the shared data
            await bracketGenerator.loadSavedBracket(sanitizedData);
            
            // Show success message
            bracketStorage.showStatusMessage('Shared bracket loaded successfully', 'success');
            
            // Clear the URL parameter to avoid reloading on refresh
            window.history.replaceState({}, document.title, window.location.pathname);
            
            return true;
        } catch (error) {
            console.error('Error loading shared bracket:', error);
            bracketStorage.showStatusMessage('Error loading shared bracket', 'error');
            return false;
        }
    },
    
    /**
     * Validates bracket data structure
     * @param {Object} data - Bracket data to validate
     * @returns {boolean} - True if data is valid
     */
    validateBracketData: function(data) {
        // Check for required properties
        if (!data || 
            typeof data.competitionName !== 'string' || 
            !data.drivers || 
            !data.winners || 
            typeof data.bracketSize !== 'number') {
            return false;
        }
        
        // Validate competitionName is not too long
        if (data.competitionName.length > 100) {
            return false;
        }
        
        // Validate drivers
        if (typeof data.drivers !== 'object') {
            return false;
        }
        
        // Additional validations could be added here
        
        return true;
    },
    
    /**
     * Sanitizes bracket data to prevent XSS
     * @param {Object} data - Bracket data to sanitize
     * @returns {Object} - Sanitized bracket data
     */
    sanitizeBracketData: function(data) {
        // Create a deep copy of the data
        const sanitizedData = JSON.parse(JSON.stringify(data));
        
        // Sanitize competition name
        sanitizedData.competitionName = this.sanitizeString(data.competitionName);
        
        // Sanitize driver list text if available
        if (data.driverListText) {
            sanitizedData.driverListText = this.sanitizeString(data.driverListText);
        }
        
        // Sanitize driver names
        for (const pos in sanitizedData.drivers) {
            if (sanitizedData.drivers[pos] && sanitizedData.drivers[pos].name) {
                sanitizedData.drivers[pos].name = this.sanitizeString(sanitizedData.drivers[pos].name);
            }
        }
        
        // Sanitize winner names
        for (const matchId in sanitizedData.winners) {
            sanitizedData.winners[matchId] = this.sanitizeString(sanitizedData.winners[matchId]);
        }
        
        return sanitizedData;
    },
    
    /**
     * Sanitizes a string to prevent XSS
     * @param {string} str - String to sanitize
     * @returns {string} - Sanitized string
     */
    sanitizeString: function(str) {
        if (typeof str !== 'string') {
            return '';
        }
        
        // Create a temporary element
        const temp = document.createElement('div');
        
        // Set the string as text content (not HTML) to escape HTML entities
        temp.textContent = str;
        
        // Return the escaped string
        return temp.innerHTML;
    }
}; 