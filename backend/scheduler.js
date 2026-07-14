const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');

// Yeh scheduler har 30 minute mein automatic chalega
cron.schedule('*/30 * * * *', () => {
    console.log('--- Automated Social Media Scraping Started ---');
    
    // facebook.py root par ya scripts folder mein hai
    // Agar root par hai toh path yeh hoga:
    const scriptPath = path.join(__dirname, 'facebook.py'); 
    
    exec(`python "${scriptPath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`[Scraper Error]: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`[Scraper Stderr]: ${stderr}`);
            return;
        }
        console.log(`[Scraper Success]: Data scraped successfully.\n${stdout}`);
    });
});

console.log('Cron Job Scheduler Initialized: Running every 30 minutes.');