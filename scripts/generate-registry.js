/**
 * JSON Audio Registry Generator
 * -----------------------------
 * Scans the audio directories, builds a nested JSON object mapping 
 * languages to their available audio files, applies semantic aliases,
 * and outputs the final sounds.json file for the frontend.
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
    soundsDir: path.join(__dirname, '../src/assets/sounds'),
    outputFile: path.join(__dirname, '../src/assets/sounds.json'),
    // This is the base path relative to the HTML file where the component runs
    frontendBasePath: '../src/assets/sounds' 
};

// Map your semantic toast types to actual Stronghold file names (without extension)
const ALIASES = {
    success: 'Pop_Popularity2',
    warning: 'Resource_Need1',
    error: 'Genie_14'
};

async function generateRegistry() {
    console.log('📜 Forging the Stronghold Audio Registry...\n');

    try {
        const registry = {};
        
        // Step 1: Read the language directories (e.g., 'en', 'hu')
        const items = await fs.readdir(CONFIG.soundsDir, { withFileTypes: true });
        const langs = items.filter(item => item.isDirectory()).map(dir => dir.name);

        if (langs.length === 0) {
            console.error('❌ No language directories found in the sounds folder.');
            process.exit(1);
        }

        // Step 2: Process each language recursively
        for (const lang of langs) {
            console.log(`🔍 Scanning [${lang.toUpperCase()}] directory...`);
            registry[lang] = {};
            
            const langPath = path.join(CONFIG.soundsDir, lang);
            
            // USE THE NEW RECURSIVE HELPER
            const allFiles = await getFilesRecursive(langPath);
            const audioFiles = allFiles.filter(file => file.endsWith('.mp3') || file.endsWith('.wav'));

            // Step 3: Map file names to their frontend paths
            for (const relativeFile of audioFiles) {
                const parsedPath = path.parse(relativeFile);
                
                // We still use just the file name (without extension) as the key
                // Example: 'speech/Treasury_Empty' becomes key 'treasury_empty'
                const fileKey = parsedPath.name.toLowerCase(); 
                
                // Ensure forward slashes for the frontend web path
                const frontendPath = `${CONFIG.frontendBasePath}/${lang}/${relativeFile}`;
                registry[lang][fileKey] = frontendPath;

                // Step 4: Apply Semantic Aliases (success, error, warning)
                for (const [aliasName, targetFile] of Object.entries(ALIASES)) {
                    if (parsedPath.name === targetFile) {
                        registry[lang][aliasName] = frontendPath;
                    }
                }
            }
            
            console.log(`   ➔ Mapped ${Object.keys(registry[lang]).length} keys (including aliases).`);
        }

        // Step 5: Write the JSON file to disk
        const jsonContent = JSON.stringify(registry, null, 2); // 2 spaces for readable formatting
        await fs.writeFile(CONFIG.outputFile, jsonContent, 'utf-8');

        console.log(`\n✅ Registry generated successfully at: ${CONFIG.outputFile}`);
        console.log('The scribe has updated the records, my Lord!');

    } catch (error) {
        console.error('\n🚨 Failed to generate registry:', error.message);
        process.exit(1);
    }
}

generateRegistry();