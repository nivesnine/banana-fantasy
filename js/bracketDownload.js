/**
 * BracketDownload - Handles downloading the bracket as an image
 */
const bracketDownload = {
    /**
     * Downloads the bracket as an image
     */
    downloadBracketAsImage: function() {
        // Show processing message
        bracketStorage.showStatusMessage('Generating image...', 'processing');
        
        try {
            // Direct reference to the original bracket container
            const bracketContainer = document.getElementById('bracket-container');
            const isMobile = window.innerWidth <= 768;
            
            // Save original state to restore later
            const originalHtml = bracketContainer.innerHTML;
            const originalStyle = bracketContainer.getAttribute('style') || '';
            
            // Remove mobile view and specific round classes
            if (isMobile) {
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
            }
            
            // Store original display states of all rounds
            const roundElements = bracketContainer.querySelectorAll('.round');
            const originalDisplayStates = Array.from(roundElements).map(el => el.style.display);
            
            // Store champion display state
            const championElement = bracketContainer.querySelector('.champion');
            const originalChampionDisplay = championElement ? championElement.style.display : '';
            
            // Store mobile controls display state
            const mobileControls = document.querySelector('.mobile-controls');
            const originalMobileControlsDisplay = mobileControls ? mobileControls.style.display : '';
            
            // Prepare container for screenshot
            bracketContainer.style.backgroundColor = '#1a1a1a';
            bracketContainer.style.padding = '20px';
            bracketContainer.style.borderRadius = '8px';
            bracketContainer.style.width = isMobile ? '1200px' : 'auto';
            bracketContainer.style.maxWidth = 'none';
            bracketContainer.style.overflow = 'visible';
            
            // Show all rounds on mobile
            if (isMobile) {
                roundElements.forEach(round => {
                    round.style.display = 'flex';
                });
                
                if (championElement) {
                    championElement.style.display = 'flex';
                }
                
                if (mobileControls) {
                    mobileControls.style.display = 'none';
                }
                
                // Enhance competition name display
                const compName = bracketContainer.querySelector('#competition-name');
                if (compName) {
                    compName.style.fontSize = '2.2rem';
                    compName.style.marginBottom = '20px';
                    compName.style.textAlign = 'center';
                    compName.style.width = '100%';
                }
                
                // Fix bracket container
                const bracketContainerEl = bracketContainer.querySelector('.bracket-container');
                if (bracketContainerEl) {
                    bracketContainerEl.style.minWidth = '1200px';
                    bracketContainerEl.style.justifyContent = 'center';
                }
            }
            
            // Function to handle cleanup and restore original state
            const restoreOriginalState = () => {
                // Replace innerHTML with a safer method
                while (bracketContainer.firstChild) {
                    bracketContainer.removeChild(bracketContainer.firstChild);
                }
                
                // Parse and sanitize the original HTML using DOMParser
                const parser = new DOMParser();
                const doc = parser.parseFromString(originalHtml, 'text/html');
                const safeNodes = doc.body.childNodes;
                
                // Append each node safely
                for (let i = 0; i < safeNodes.length; i++) {
                    bracketContainer.appendChild(document.importNode(safeNodes[i], true));
                }
                
                bracketContainer.setAttribute('style', originalStyle);
                
                // Re-apply original styles after the DOM is updated
                setTimeout(() => {
                    // Restore round display states
                    const newRoundElements = bracketContainer.querySelectorAll('.round');
                    newRoundElements.forEach((el, index) => {
                        if (index < originalDisplayStates.length) {
                            el.style.display = originalDisplayStates[index];
                        }
                    });
                    
                    // Restore champion display
                    const newChampionElement = bracketContainer.querySelector('.champion');
                    if (newChampionElement) {
                        newChampionElement.style.display = originalChampionDisplay;
                    }
                    
                    // Restore mobile controls
                    if (mobileControls) {
                        mobileControls.style.display = originalMobileControlsDisplay;
                    }
                }, 100);
            };
            
            // Enhanced options for html-to-image
            const options = {
                backgroundColor: '#1a1a1a',
                pixelRatio: 2,  // Higher quality output
                quality: 1.0,   // Maximum quality
                includeQueryParams: true,  // Include image URLs with query params
                skipFonts: false,  // Include fonts in rendering
                // Filter to ensure all nodes render properly
                filter: (node) => {
                    return true;  // Include all nodes
                },
                // Special handling for Canvas elements if needed
                canvasWidth: isMobile ? 1200 : undefined,
                canvasHeight: undefined,
                // Placeholder for any images that fail to load
                imagePlaceholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
            };
            
            // Wait a moment for all style changes to apply
            setTimeout(() => {
                // Use html-to-image to generate PNG
                htmlToImage.toPng(bracketContainer, options)
                    .then(dataUrl => {
                        // Validate the data URL
                        if (!dataUrl || dataUrl === 'data:,') {
                            throw new Error('Generated image is empty');
                        }
                        
                        // Create a download link
                        const downloadLink = document.createElement('a');
                        downloadLink.href = dataUrl;
                        downloadLink.download = `${bracketGenerator.bracketData.competitionName.replace(/\s+/g, '-')}-bracket.png`;
                        
                        // Click the link to trigger the download
                        document.body.appendChild(downloadLink);
                        downloadLink.click();
                        document.body.removeChild(downloadLink);
                        
                        // Show success message
                        bracketStorage.showStatusMessage('Bracket downloaded successfully', 'success');
                    })
                    .catch(error => {
                        console.error('Error generating image:', error);
                        bracketStorage.showStatusMessage('Error generating image. Trying alternative approach...', 'processing');
                        
                        // Try an alternative approach (toCanvas first)
                        htmlToImage.toCanvas(bracketContainer, options)
                            .then(canvas => {
                                const imgData = canvas.toDataURL('image/png');
                                
                                // Create a download link
                                const downloadLink = document.createElement('a');
                                downloadLink.href = imgData;
                                downloadLink.download = `${bracketGenerator.bracketData.competitionName.replace(/\s+/g, '-')}-bracket.png`;
                                
                                document.body.appendChild(downloadLink);
                                downloadLink.click();
                                document.body.removeChild(downloadLink);
                                
                                bracketStorage.showStatusMessage('Bracket downloaded successfully', 'success');
                            })
                            .catch(canvasError => {
                                console.error('Canvas approach failed:', canvasError);
                                bracketStorage.showStatusMessage('Failed to generate image', 'error');
                            });
                    })
                    .finally(() => {
                        // Always restore the original state
                        restoreOriginalState();
                    });
            }, 300); // Increased delay for better rendering
            
        } catch (error) {
            console.error('Fatal error in downloadBracketAsImage:', error);
            bracketStorage.showStatusMessage('Error generating image', 'error');
        }
    }
}; 