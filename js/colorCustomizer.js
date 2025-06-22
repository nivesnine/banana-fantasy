/**
 * Color Customizer Module
 * Handles color picker functionality, local storage, and CSS variable updates
 */

class ColorCustomizer {
    constructor() {
        this.defaultColors = {
            accentPrimary: '#bc2b21',
            textSecondary: '#cfcfcf'
        };
        
        this.storageKey = 'bracket-custom-colors';
        this.modal = null;
        this.isInitialized = false;
        
        // Bind methods to maintain context
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.handleColorChange = this.handleColorChange.bind(this);
        this.applyColors = this.applyColors.bind(this);
        this.resetColors = this.resetColors.bind(this);
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
        this.handleEscapeKey = this.handleEscapeKey.bind(this);
    }
    
    /**
     * Initialize the color customizer
     */
    init() {
        if (this.isInitialized) return;
        
        this.modal = document.getElementById('color-picker-modal');
        if (!this.modal) {
            console.error('Color picker modal not found');
            return;
        }
        
        this.setupEventListeners();
        this.loadSavedColors();
        this.updatePreview();
        
        this.isInitialized = true;
        console.log('Color customizer initialized');
    }
    
    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Open modal button
        const openButton = document.getElementById('customize-colors');
        if (openButton) {
            openButton.addEventListener('click', this.openModal);
        }
        
        // Close modal buttons
        const closeButton = document.getElementById('close-color-picker');
        if (closeButton) {
            closeButton.addEventListener('click', this.closeModal);
        }
        
        // Color picker inputs
        const accentColorPicker = document.getElementById('accent-color-picker');
        const accentColorText = document.getElementById('accent-color-text');
        const textColorPicker = document.getElementById('text-color-picker');
        const textColorText = document.getElementById('text-color-text');
        
        if (accentColorPicker && accentColorText) {
            accentColorPicker.addEventListener('input', (e) => this.handleColorChange('accent', e.target.value));
            accentColorText.addEventListener('input', (e) => this.handleColorChange('accent', e.target.value));
            accentColorText.addEventListener('blur', (e) => this.validateHexColor(e.target, 'accent'));
        }
        
        if (textColorPicker && textColorText) {
            textColorPicker.addEventListener('input', (e) => this.handleColorChange('text', e.target.value));
            textColorText.addEventListener('input', (e) => this.handleColorChange('text', e.target.value));
            textColorText.addEventListener('blur', (e) => this.validateHexColor(e.target, 'text'));
        }
        
        // Action buttons
        const applyButton = document.getElementById('apply-colors');
        const resetButton = document.getElementById('reset-colors');
        
        if (applyButton) {
            applyButton.addEventListener('click', this.applyColors);
        }
        
        if (resetButton) {
            resetButton.addEventListener('click', this.resetColors);
        }
        
        // Modal overlay click and escape key
        document.addEventListener('keydown', this.handleEscapeKey);
        this.modal.addEventListener('click', this.handleOutsideClick);
    }
    
    /**
     * Open the color picker modal
     */
    openModal() {
        if (this.modal) {
            this.modal.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
            this.loadCurrentColors();
        }
    }
    
    /**
     * Close the color picker modal
     */
    closeModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
            document.body.style.overflow = ''; // Restore scrolling
        }
    }
    
    /**
     * Handle outside click to close modal
     */
    handleOutsideClick(event) {
        if (event.target === this.modal) {
            this.closeModal();
        }
    }
    
    /**
     * Handle escape key to close modal
     */
    handleEscapeKey(event) {
        if (event.key === 'Escape' && this.modal.style.display === 'flex') {
            this.closeModal();
        }
    }
    
    /**
     * Handle color input changes
     */
    handleColorChange(type, value) {
        const colorPicker = document.getElementById(`${type === 'accent' ? 'accent' : 'text'}-color-picker`);
        const colorText = document.getElementById(`${type === 'accent' ? 'accent' : 'text'}-color-text`);
        
        if (this.isValidHex(value)) {
            colorPicker.value = value;
            colorText.value = value;
            this.updatePreview();
        }
    }
    
    /**
     * Validate hex color input
     */
    validateHexColor(input, type) {
        let value = input.value.trim();
        
        // Add # if missing
        if (value && !value.startsWith('#')) {
            value = '#' + value;
        }
        
        if (this.isValidHex(value)) {
            input.value = value;
            this.handleColorChange(type, value);
        } else if (value !== '') {
            // Reset to current valid value if invalid
            const currentColor = type === 'accent' ? 
                document.getElementById('accent-color-picker').value : 
                document.getElementById('text-color-picker').value;
            input.value = currentColor;
        }
    }
    
    /**
     * Check if a string is a valid hex color
     */
    isValidHex(hex) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
    }
    
    /**
     * Update the color preview boxes
     */
    updatePreview() {
        const accentColor = document.getElementById('accent-color-picker').value;
        const textColor = document.getElementById('text-color-picker').value;
        
        const accentPreview = document.querySelector('.accent-preview');
        
        if (accentPreview) {
            accentPreview.style.backgroundColor = accentColor;
            accentPreview.style.borderColor = accentColor;
            accentPreview.style.color = textColor;
        }
    }
    
    /**
     * Load current colors into the picker
     */
    loadCurrentColors() {
        const saved = this.getSavedColors();
        
        const accentColorPicker = document.getElementById('accent-color-picker');
        const accentColorText = document.getElementById('accent-color-text');
        const textColorPicker = document.getElementById('text-color-picker');
        const textColorText = document.getElementById('text-color-text');
        
        if (accentColorPicker && accentColorText) {
            accentColorPicker.value = saved.accentPrimary;
            accentColorText.value = saved.accentPrimary;
        }
        
        if (textColorPicker && textColorText) {
            textColorPicker.value = saved.textSecondary;
            textColorText.value = saved.textSecondary;
        }
        
        this.updatePreview();
    }
    
    /**
     * Apply selected colors to the CSS and save them
     */
    applyColors() {
        const accentColor = document.getElementById('accent-color-picker').value;
        const textColor = document.getElementById('text-color-picker').value;
        
        this.setCSSVariables(accentColor, textColor);
        this.saveColors(accentColor, textColor);
        this.closeModal();
        
        // Show success message
        this.showStatusMessage('Colors applied successfully!', 'success');
    }
    
    /**
     * Reset colors to default values
     */
    resetColors() {
        const accentColorPicker = document.getElementById('accent-color-picker');
        const accentColorText = document.getElementById('accent-color-text');
        const textColorPicker = document.getElementById('text-color-picker');
        const textColorText = document.getElementById('text-color-text');
        
        if (accentColorPicker && accentColorText) {
            accentColorPicker.value = this.defaultColors.accentPrimary;
            accentColorText.value = this.defaultColors.accentPrimary;
        }
        
        if (textColorPicker && textColorText) {
            textColorPicker.value = this.defaultColors.textSecondary;
            textColorText.value = this.defaultColors.textSecondary;
        }
        
        this.updatePreview();
        this.setCSSVariables(this.defaultColors.accentPrimary, this.defaultColors.textSecondary);
        this.clearSavedColors();
        
        // Show success message
        this.showStatusMessage('Colors reset to default!', 'info');
    }
    
    /**
     * Set CSS variables for the colors
     */
    setCSSVariables(accentColor, textColor) {
        const root = document.documentElement;
        
        root.style.setProperty('--accent-primary', accentColor);
        root.style.setProperty('--text-secondary', textColor);
        
        // Update hover color (slightly darker)
        const hoverColor = this.adjustBrightness(accentColor, -15);
        root.style.setProperty('--accent-primary-hover', hoverColor);
        
        // Update transparent version
        const transparentColor = accentColor + '70'; // Add 70% opacity
        root.style.setProperty('--accent-primary-transparent', transparentColor);
    }
    
    /**
     * Adjust color brightness (positive = lighter, negative = darker)
     */
    adjustBrightness(hex, percent) {
        // Convert hex to RGB
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        
        // Adjust brightness
        const newR = Math.max(0, Math.min(255, r + (r * percent / 100)));
        const newG = Math.max(0, Math.min(255, g + (g * percent / 100)));
        const newB = Math.max(0, Math.min(255, b + (b * percent / 100)));
        
        // Convert back to hex
        return `#${Math.round(newR).toString(16).padStart(2, '0')}${Math.round(newG).toString(16).padStart(2, '0')}${Math.round(newB).toString(16).padStart(2, '0')}`;
    }
    
    /**
     * Save colors to localStorage
     */
    saveColors(accentColor, textColor) {
        const colors = {
            accentPrimary: accentColor,
            textSecondary: textColor,
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(colors));
        } catch (error) {
            console.error('Failed to save colors to localStorage:', error);
        }
    }
    
    /**
     * Load saved colors from localStorage
     */
    getSavedColors() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const colors = JSON.parse(saved);
                return {
                    accentPrimary: colors.accentPrimary || this.defaultColors.accentPrimary,
                    textSecondary: colors.textSecondary || this.defaultColors.textSecondary
                };
            }
        } catch (error) {
            console.error('Failed to load colors from localStorage:', error);
        }
        
        return this.defaultColors;
    }
    
    /**
     * Load and apply saved colors on initialization
     */
    loadSavedColors() {
        const saved = this.getSavedColors();
        this.setCSSVariables(saved.accentPrimary, saved.textSecondary);
    }
    
    /**
     * Clear saved colors from localStorage
     */
    clearSavedColors() {
        try {
            localStorage.removeItem(this.storageKey);
        } catch (error) {
            console.error('Failed to clear colors from localStorage:', error);
        }
    }
    
    /**
     * Show status message (reusing existing status message system)
     */
    showStatusMessage(message, type = 'info') {
        // Check if there's a showStatus function available globally
        if (typeof window.showStatus === 'function') {
            window.showStatus(message, type);
        } else {
            // Fallback - create a simple status message
            const statusDiv = document.createElement('div');
            statusDiv.className = `status-message ${type}`;
            statusDiv.textContent = message;
            document.body.appendChild(statusDiv);
            
            setTimeout(() => {
                statusDiv.classList.add('fade-out');
                setTimeout(() => {
                    if (statusDiv.parentNode) {
                        statusDiv.parentNode.removeChild(statusDiv);
                    }
                }, 500);
            }, 3000);
        }
    }
}

// Create global instance
window.colorCustomizer = new ColorCustomizer();

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.colorCustomizer.init();
    });
} else {
    window.colorCustomizer.init();
} 