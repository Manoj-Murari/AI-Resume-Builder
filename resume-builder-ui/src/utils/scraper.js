/* global chrome */

export const parseJobDetails = async () => {
    // Check if we are in an extension environment (simplified check)
    const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage;

    if (!isExtension) {
        console.warn("Chrome Extension APIs not available. Scraping disabled.");
        return null;
    }

    try {
        // Delegate to Background Script
        const response = await new Promise((resolve) => {
            chrome.runtime.sendMessage({ action: "SCRAPE_JOB_DETAILS" }, (res) => {
                if (chrome.runtime.lastError) {
                    console.error("Runtime message error:", chrome.runtime.lastError);
                    resolve(null);
                } else {
                    resolve(res);
                }
            });
        });

        if (response && response.data) {
            return response.data;
        } else {
            console.warn("Background scraping returned no data:", response?.error);
        }

    } catch (err) {
        console.error("Scraping failed", err);
    }
    return null;
};
