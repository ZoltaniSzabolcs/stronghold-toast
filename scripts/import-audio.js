/**
 * Asset Importer Tool
 * -------------------
 * This script automates the process of importing i18n audio files
 * from a raw source directory into the project's asset directory.
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

// Configuration: Define your source and destination paths here
const CONFIG = {
    sourceDir: path.join(__dirname, '../raw_audio_files'),
    destDir: path.join(__dirname, '../src/assets/audio'),
    supportedLangs: ['en', 'hu'] // Add more language codes here as needed
};

async function importAudioFiles() {
    console.log('🏰 Starting Stronghold Audio Import Process...\n');

    try {
        // Step 1: Ensure the main destination directory exists
        await fs.mkdir(CONFIG.destDir, { recursive: true });

        // Step 2: Loop through each supported language
        for (const lang of CONFIG.supportedLangs) {
            const langSourceDir = path.join(CONFIG.sourceDir, lang);
            const langDestDir = path.join(CONFIG.destDir, lang);

            // Check if the source language directory exists before proceeding
            // Check if the source language directory exists before proceeding
            try {
                await fs.access(langSourceDir);
            } catch {
                console.warn(`⚠️  Warning: Source directory for '${lang}' not found. Skipping.`);
                continue;
            }

            console.log(`📁 Processing '${lang}' translations recursively...`);
            
            // USE THE NEW RECURSIVE HELPER
            const allFiles = await getFilesRecursive(langSourceDir);
            const audioFiles = allFiles.filter(file => file.endsWith('.wav') || file.endsWith('.mp3'));

            if (audioFiles.length === 0) continue;

            // Step 3: Recreate subdirectories and copy files
            for (const relativeFile of audioFiles) {
                const sourcePath = path.join(langSourceDir, relativeFile);
                const destPath = path.join(langDestDir, relativeFile);

                // Ensure the specific subdirectory exists in the destination
                const destSubDir = path.dirname(destPath);
                await fs.mkdir(destSubDir, { recursive: true });

                await fs.copyFile(sourcePath, destPath);
                console.log(`  ➔ Copied: ${relativeFile}`);
            }
        }

        console.log('\n✅ All audio files imported successfully! The granary is full, Sire.');

    } catch (error) {
        console.error('\n❌ An error occurred during the import process:', error.message);
        process.exit(1);
    }
}

// Execute the script
importAudioFiles();