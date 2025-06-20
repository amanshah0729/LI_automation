import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';

// Configuration
const INPUT_FILE = process.argv[2] || 'Invitations.csv';
const OUTPUT_FILE = process.argv[3] || 'cleaned_profiles.csv';

const CUTOFF_DATE = new Date('2025-06-13');

const outputProfiles = [];

// Your file columns (example):
// Name,You,Date,,Type,TheirProfile,YourProfile

fs.createReadStream(INPUT_FILE)
  .pipe(csv({ headers: false }))
  .on('data', (row) => {
    try {
      const type = row[4] || Object.values(row)[4];
      const dateStr = row[2] || Object.values(row)[2];
      const theirProfile = row[5] || Object.values(row)[5];

      // Date parsing: your dates look like "6/15/25, 9:45 AM"
      // Parse just the date part
      const dateOnly = dateStr.split(',')[0].trim();
      const parsedDate = new Date(dateOnly);

      if (
        type === 'INCOMING' &&
        parsedDate > CUTOFF_DATE &&
        theirProfile &&
        theirProfile.includes('linkedin.com/in/')
      ) {
        outputProfiles.push(theirProfile);
      }
    } catch (err) {
      // skip malformed lines
    }
  })
  .on('end', () => {
    // Output to file, one URL per line
    fs.writeFileSync(OUTPUT_FILE, outputProfiles.join('\n'), 'utf8');
    console.log(`Done! Cleaned ${outputProfiles.length} profiles to ${OUTPUT_FILE}`);
  });
