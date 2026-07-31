// scripts/bump-version.js
//
// Bumps the application version and commits the result in one step.
// Usage: node scripts/bump-version.js <patch|minor|major>
// (invoked by the bump-version-* npm scripts)
//
// Steps:
//   1. Refuse to run if the working tree has uncommitted changes to tracked
//      files - so the version-bump commit can't sweep in unrelated edits.
//   2. npm version <type> --no-git-tag-version  (package.json + package-lock.json)
//   3. npm run sync-version  (propagate to src/index.ts and README.md)
//   4. commit exactly the version files with a standard message.

const { execSync } = require('child_process');
const path = require('path');

const VALID_TYPES = ['patch', 'minor', 'major'];
const type = process.argv[2];

if (!VALID_TYPES.includes(type)) {
    console.error(`✗ Usage: node scripts/bump-version.js <${VALID_TYPES.join('|')}>`);
    process.exit(1);
}

const root = path.resolve(__dirname, '..');

// Files the bump may touch and commit.
const VERSION_FILES = [
    'package.json',
    'package-lock.json',
    'src/index.ts',
    'README.md',
];

function run(cmd) {
    console.log(`\n$ ${cmd}`);
    execSync(cmd, { stdio: 'inherit' });
}

function isWorkingTreeClean() {
    // Non-zero exit from either diff means there are unstaged or staged changes
    // to tracked files. Untracked files are intentionally ignored - they won't
    // be part of the version commit.
    try {
        execSync('git diff --quiet');
        execSync('git diff --cached --quiet');
        return true;
    } catch (e) {
        return false;
    }
}

if (!isWorkingTreeClean()) {
    console.error('✗ Working tree has uncommitted changes to tracked files:');
    console.error(execSync('git status --short', { encoding: 'utf8' }));
    console.error('Commit or stash them first, then re-run the version bump.');
    process.exit(1);
}

run(`npm version ${type} --no-git-tag-version`);
run('npm run sync-version');

const { version } = require(path.join(root, 'package.json'));

run(`git add ${VERSION_FILES.join(' ')}`);
run(`git commit -m "chore(release): bump version to ${version}"`);
console.log(`\n✓ Bumped and committed version ${version}.`);
