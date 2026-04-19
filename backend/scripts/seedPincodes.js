const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');

// Load environment variables (relative to the script location)
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Pincode = require('../src/domains/locations/models/Pincode');

const CSV_FILE = path.join(__dirname, '../../pincode_with_lat-long.csv');
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vb';
const BATCH_SIZE = 1000; // Batch size for bulk write

async function seedDatabase() {
  try {
    console.log(`Connecting to MongoDB at ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    if (!fs.existsSync(CSV_FILE)) {
      console.error(`CSV file not found at ${CSV_FILE}`);
      process.exit(1);
    }

    console.log(`Reading CSV file: ${CSV_FILE}`);
    let batch = [];
    let count = 0;
    
    return new Promise((resolve, reject) => {
      fs.createReadStream(CSV_FILE)
        .pipe(csv())
        .on('data', async (row) => {
          try {
            // Extract necessary fields
            const pincode = row['Pincode'];
            const latitude = parseFloat(row['Latitude']);
            const longitude = parseFloat(row['Longitude']);
            const city = row['District'];
            const state = row['StateName'];
            
            // Skip invalid data
            if (!pincode || isNaN(latitude) || isNaN(longitude)) {
              return; // Skip this row
            }

            const operation = {
              updateOne: {
                filter: { pincode },
                update: {
                  $set: {
                    pincode,
                    latitude,
                    longitude,
                    city: city || 'Unknown',
                    state: state || 'Unknown',
                    updatedAt: new Date()
                  },
                  $setOnInsert: {
                    createdAt: new Date(),
                    country: 'India'
                  }
                },
                upsert: true
              }
            };
            
            batch.push(operation);
            
            // Process batch
            if (batch.length >= BATCH_SIZE) {
              const currentBatch = batch;
              batch = []; // Reset batch quickly before async logic
              
              // We pause the stream to prevent memory overflow
              count += currentBatch.length;
              console.log(`Processed ${count} records...`);
              await Pincode.bulkWrite(currentBatch, { ordered: false });
            }
          } catch (err) {
            console.error('Error processing row:', err);
          }
        })
        .on('end', async () => {
          // Process any remaining items in the batch
          if (batch.length > 0) {
            count += batch.length;
            console.log(`Processing final batch. Total: ${count} records.`);
            await Pincode.bulkWrite(batch, { ordered: false });
          }
          console.log('CSV import completed successfully.');
          resolve();
        })
        .on('error', (err) => {
          console.error('Error reading the CSV stream:', err);
          reject(err);
        });
    });
  } catch (err) {
    console.error('Error starting seed process:', err);
    process.exit(1);
  }
}

seedDatabase()
  .then(() => {
    console.log('Closing database connection.');
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error('Seed process failed:', err);
    mongoose.connection.close();
    process.exit(1);
  });
