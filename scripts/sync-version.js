// scripts/sync-version.js
//
// Reads the application version from package.json (the single source of truth,
// set by `npm version` in the bump-version-* npm scripts) and propagates it to
// the other places that must stay in sync for an application release:
//   - src/index.ts   (config.version - both the prod and the commented-out dev line)
//   - README.md      (trinera/citation-api:<version> in the Docker examples)
//
// openapi.json / openapi-src/__api.yaml are NOT touched: their info.version is
// the placeholder SHOULD_BE_INJECTED and is overwritten at runtime from
// config.version in src/index.ts (see initSwagger).

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const { version } = require(path.join(root, 'package.json'));

function readFile(relPath) {
    const filePath = path.join(root, relPath);
    if (!fs.existsSync(filePath)) {
        console.error(`✗ ${relPath} not found - cannot update the version there.`);
        process.exit(1);
    }
    return { filePath, content: fs.readFileSync(filePath, 'utf8') };
}

// Single occurrence: replace using the captured prefix/suffix around the value.
function syncFile(relPath, regex, value, label) {
    const { filePath, content } = readFile(relPath);
    const match = content.match(regex);
    if (!match) {
        console.error(`✗ Could not find ${label} in ${relPath} - version NOT updated there.`);
        process.exit(1);
    }
    fs.writeFileSync(filePath, content.replace(regex, `${match[1]}${value}${match[2]}`));
    console.log(`✓ ${relPath}: ${label} -> ${value}`);
}

// All occurrences: the README repeats the image tag in several examples.
function syncAllOccurrences(relPath, regex, replacer, label) {
    const { filePath, content } = readFile(relPath);
    const count = (content.match(regex) || []).length;
    if (count === 0) {
        console.error(`✗ Could not find ${label} in ${relPath} - version NOT updated there.`);
        process.exit(1);
    }
    fs.writeFileSync(filePath, content.replace(regex, replacer));
    console.log(`✓ ${relPath}: ${label} -> ${version} (${count}x)`);
}

console.log(`Syncing application version ${version} from package.json...`);

// src/index.ts -> prod:   version : '1.3.3',
syncFile('src/index.ts', /^(\s*version\s*:\s*')[^']*(')/m, version, 'config.version (prod)');

// src/index.ts -> dev (commented out):   //version : '1.3.3',
syncFile('src/index.ts', /^(\s*\/\/version\s*:\s*')[^']*(')/m, version, 'config.version (dev, commented out)');

// README.md -> trinera/citation-api:1.3.3  (the :latest tag is left alone)
syncAllOccurrences(
    'README.md',
    /(trinera\/citation-api:)\d+\.\d+\.\d+/g,
    (_m, prefix) => `${prefix}${version}`,
    'Docker image tag'
);

console.log('Done.');
