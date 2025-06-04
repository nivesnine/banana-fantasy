/**
 * BracketStorage - Handles storing and retrieving bracket data from localStorage
 */
const bracketStorage = {
    /**
     * Saves the current bracket data to localStorage
     * @param {Object} data - Bracket data to save
     */
    saveBracket: function(data) {
        const bracketData = {
            timestamp: new Date().getTime(),
            data: data
        };
        
        localStorage.setItem('driftBracketData', JSON.stringify(bracketData));
        this.showStatusMessage('Bracket saved successfully', 'success');
    },
    
    /**
     * Checks if there is saved bracket data in localStorage
     * @returns {boolean} - True if saved data exists
     */
    hasSavedBracket: function() {
        return localStorage.getItem('driftBracketData') !== null;
    },
    
    /**
     * Loads bracket data from localStorage
     * @returns {Object|null} - The bracket data or null if not found
     */
    loadBracket: function() {
        try {
            const savedData = localStorage.getItem('driftBracketData');
            if (savedData) {
                return JSON.parse(savedData).data;
            }
        } catch (error) {
            console.error('Error loading bracket data:', error);
            this.showStatusMessage('Error loading saved data', 'error');
        }
        return null;
    },
    
    /**
     * Clears bracket data from localStorage
     */
    clearBracket: function() {
        localStorage.removeItem('driftBracketData');
        this.showStatusMessage('Bracket data cleared', 'info');
    },
    
    /**
     * Gets the timestamp of when the bracket was last updated
     * @returns {number|null} - Timestamp or null if not found
     */
    getLastUpdated: function() {
        try {
            const savedData = localStorage.getItem('driftBracketData');
            if (savedData) {
                return JSON.parse(savedData).timestamp;
            }
        } catch (error) {
            console.error('Error getting last updated timestamp:', error);
        }
        return null;
    },
    
    /**
     * Shows a status message to the user
     * @param {string} message - Message to display
     * @param {string} type - Message type ('info', 'success', 'error', 'processing')
     */
    showStatusMessage: function(message, type = 'info') {
        const statusMessage = document.createElement('div');
        statusMessage.className = `status-message ${type}`;
        statusMessage.textContent = message;
        document.querySelector('.admin-panel').appendChild(statusMessage);
        
        setTimeout(() => {
            statusMessage.classList.add('fade-out');
            setTimeout(() => statusMessage.remove(), 500);
        }, 3000);
    }
}; 