/**
 * Audio Codec Converter Pipeline
 * ------------------------------
 * Scans the asset directories for legacy .wav files, converts them to 
 * web-optimized .mp3 using FFmpeg, and removes the old .wav files.
 */

// HELPER: Recursively scan directories and return relative paths (e.g., 'speech/Genie_14.wav')
async function getFilesRecursive(baseDir, currentSubDir = '') {
    const fullPath = path.join(baseDir, currentSubDir);
    let results = [];
    const entries = await fs.readdir(fullPath, { withFileTypes: true });

    for (const entry of entries) {
        // Use forward slashes for cross-platform web safety
        const relativePath = path.posix.join(currentSubDir, entry.name);
        if (entry.isDirectory()) {
            const nested = await getFilesRecursive(baseDir, relativePath);
            results = results.concat(nested);
        } else {
            results.push(relativePath);
        }
    }
    return results;
}

const fs = require('fs').promises;
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

const CONFIG = {
    audioDir: path.join(__dirname, '../src/assets/sounds'),
    supportedLangs: ['en', 'hu'],
    deleteOriginal: true // Set to true if you want to auto-delete the .wav files after conversion
};

// Wraps the FFmpeg stream in a Promise so we can use async/await
function convertToMp3(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .toFormat('mp3')
            .audioBitrate('128k') // 128k is perfect for voice lines (small file size, good quality)
            .on('end', () => resolve())
            .on('error', (err) => reject(err))
            .save(outputPath);
    });
}

async function runConversionPipeline() {
    console.log('🎙️ Starting Stronghold Audio Codec Conversion...\n');

    let totalConverted = 0;

    try {
        for (const lang of CONFIG.supportedLangs) {
            const langDir = path.join(CONFIG.audioDir, lang);
            
            // USE THE NEW RECURSIVE HELPER
            const allFiles = await getFilesRecursive(langDir);
            const wavFiles = allFiles.filter(file => file.toLowerCase().endsWith('.wav'));

            if (wavFiles.length === 0) {
                console.log(`ℹ️ No .wav files found in [${lang.toUpperCase()}]`);
                continue;
            }

            console.log(`⚙️ Processing [${lang.toUpperCase()}] directory (${wavFiles.length} files)...`);

            for (const relativeFile of wavFiles) {
                const inputPath = path.join(langDir, relativeFile);
                // Create the output path in the exact same subdirectory
                const outputFileName = relativeFile.replace(/\.wav$/i, '.mp3');
                const outputPath = path.join(langDir, outputFileName);

                process.stdout.write(`   ➔ Converting ${relativeFile} ... `);

                try {
                    await convertToMp3(inputPath, outputPath);
                    process.stdout.write('✅ Done\n');
                    totalConverted++;

                    if (CONFIG.deleteOriginal) {
                        await fs.unlink(inputPath);
                    }
                } catch (err) {
                    process.stdout.write('❌ Failed\n');
                    console.error(`      Error details: ${err.message}`);
                }
            }
        }

        console.log(`\n🎉 Pipeline Complete! Successfully modernized ${totalConverted} audio files.`);

    } catch (error) {
        console.error('\n🚨 Pipeline crashed:', error.message);
        process.exit(1);
    }
}

// Execute the pipeline
runConversionPipeline();