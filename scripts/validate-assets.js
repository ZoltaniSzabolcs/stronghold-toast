/**
 * i18n Audio Asset Validator
 * --------------------------
 * Scans language asset directories, detects missing translations,
 * and reports the exact differences across all languages.
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

const CONFIG = {
    audioDir: path.join(__dirname, '../src/assets/sounds'),
    supportedLangs: ['en', 'hu'] // Add any new languages here
};

async function validateAudioAssets() {
    console.log('🛡️  Validating Stronghold Audio Localization Assets...\n');

    try {
        const langMaps = {};
        const allUniqueFiles = new Set();
        let hasMissingFiles = false;

        // Step 1: Scan all directories recursively and collect relative file paths
        for (const lang of CONFIG.supportedLangs) {
            const langDir = path.join(CONFIG.audioDir, lang);

            try {
                await fs.access(langDir);
                
                // USE THE NEW RECURSIVE HELPER
                const allFiles = await getFilesRecursive(langDir);
                const audioFiles = allFiles.filter(file => file.endsWith('.wav') || file.endsWith('.mp3'));
                
                langMaps[lang] = new Set(audioFiles);
                audioFiles.forEach(file => allUniqueFiles.add(file));
            } catch {
                console.error(`❌ Error: Language directory for '${lang}' does not exist at: ${langDir}`);
                process.exit(1);
            }
        }

        // Step 2: Cross-reference and find discrepancies
        console.log(`📊 Matrix Audit: Checking ${allUniqueFiles.size} unique audio keys across [${CONFIG.supportedLangs.join(', ')}]\n`);
        console.log('-'.repeat(60));

        for (const lang of CONFIG.supportedLangs) {
            const presentFiles = langMaps[lang];
            const missingFiles = [...allUniqueFiles].filter(file => !presentFiles.has(file));

            if (missingFiles.length > 0) {
                hasMissingFiles = true;
                console.log(`⚠️  Language [${lang.toUpperCase()}] is missing ${missingFiles.length} file(s):`);
                missingFiles.forEach(file => {
                    console.log(`   ↳ ❌ Missing: ${file}`);
                });
            } else {
                console.log(`✅ Language [${lang.toUpperCase()}] is complete! (All ${allUniqueFiles.size} files present)`);
            }
            console.log('-'.repeat(60));
        }

        // Step 3: Determine script exit status
        if (hasMissingFiles) {
            console.log('\n🚨 Audit Failed: Discrepancies found in localization files. Fix them before deployment!');
            // Exit with code 1 so CI/CD pipelines or build tools know it failed
            process.exit(1); 
        } else {
            console.log('\n🎉 Audit Passed: Perfect parity achieved across all languages. "The people love you, my Lord!"');
            process.exit(0);
        }

    } catch (error) {
        console.error('An unexpected error occurred during validation:', error.message);
        process.exit(1);
    }
}

validateAudioAssets();