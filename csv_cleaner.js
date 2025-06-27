import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';

// Configuration
const INPUT_FILE = process.argv[2] || 'Invitations.csv';
const OUTPUT_FILE = process.argv[3] || 'cleaned_profiles.csv';

const MAX_PROFILES = 671;

const outputProfiles = [];

// Your file columns (example):
// Name,You,Date,,Type,TheirProfile,YourProfile

fs.createReadStream(INPUT_FILE)
  .pipe(csv({ headers: false }))
  .on('data', (row) => {
    try {
      const type = row[4] || Object.values(row)[4];
      const theirProfile = row[5] || Object.values(row)[5];

      if (
        type === 'INCOMING' &&
        theirProfile &&
        theirProfile.includes('linkedin.com/in/') &&
        outputProfiles.length < MAX_PROFILES
      ) {
        outputProfiles.push(theirProfile);
        console.log(`Added profile ${outputProfiles.length}/${MAX_PROFILES}: ${theirProfile}`);
      }
    } catch (err) {
      // skip malformed lines
    }
  })
  .on('end', () => {
    // Output to file, one URL per line
    fs.writeFileSync(OUTPUT_FILE, outputProfiles.join('\n'), 'utf8');
    console.log(`Done! Cleaned ${outputProfiles.length} profiles to ${OUTPUT_FILE}`);
    console.log(`Stopped at ${outputProfiles.length} profiles (limit: ${MAX_PROFILES})`);
  });
