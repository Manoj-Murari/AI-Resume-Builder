chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));
});

// Listener for Scraping Request from Side Panel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "SCRAPE_JOB_DETAILS") {

    (async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.id) {
          sendResponse({ error: "No active tab found" });
          return;
        }

        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            const url = window.location.href;
            let data = {
              title: "",
              company: "",
              location: "",
              description: "",
              url: url,
              platform: "Unknown"
            };

            const getText = (selector) => document.querySelector(selector)?.innerText?.trim() || "";

            if (url.includes("linkedin.com")) {
              data.platform = "LinkedIn";
              // Strategy 1: Search View (Right Rail)
              const rightRail = document.querySelector('.jobs-search__right-rail') || document.querySelector('.job-details-jobs-unified-top-card__content--two-pane');

              if (rightRail || document.querySelector('.job-details-jobs-unified-top-card__job-title')) {
                data.title = getText('.job-details-jobs-unified-top-card__job-title') || getText('h1');
                data.company = getText('.job-details-jobs-unified-top-card__company-name') || getText('.topcard__org-name-link');
                data.description = getText('#job-details') || getText('.jobs-description__content') || getText('.description__text');
                data.location = getText('.job-details-jobs-unified-top-card__workplace-type');
              } else {
                // Strategy 2: Direct Job View
                data.title = getText('.top-card-layout__title') || getText('h1');
                data.company = getText('.topcard__org-name-link');
                data.description = getText('.show-more-less-html__markup') || getText('.description__text');
              }
            }
            else if (url.includes("naukri.com")) {
              data.platform = "Naukri";
              data.title = getText('header h1');
              data.company = getText('.jd-header-comp-name');
              data.description = getText('.job-desc');
              data.location = getText('.loc .location');
            }
            else if (url.includes("workday.com")) {
              data.platform = "Workday";
              data.title = getText('[data-automation-id="jobPostingHeader"]') || getText('h1');
              data.company = "Workday System";
              data.description = getText('[data-automation-id="jobPostingDescription"]');
            }

            // Universal Fallback if specific scraping failed to get a description
            if (!data.description || data.description.length < 50) {
              // Try to grab the main text content of the body, excluding scripts/styles
              data.description = document.body.innerText.substring(0, 5000);
              if (!data.platform) data.platform = "Unknown";
            }

            return data;
          }
        });

        if (results && results[0] && results[0].result) {
          sendResponse({ data: results[0].result });
        } else {
          sendResponse({ error: "Script returned no data" });
        }

      } catch (err) {
        console.error("Scraping error:", err);
        sendResponse({ error: err.message });
      }
    })();

    return true; // Keep channel open for async response
  }
});
