// scripts/audit-fix.js
//
// Routine dependency maintenance, automated:
//   1. npm install
//   2. npm audit fix   (no --force, so only semver-compatible / non-breaking
//      updates are applied - the kind you accept without a code review)
//   3. if package.json / package-lock.json changed, commit just those two
//      files with a standard message. Nothing else is staged, and nothing is
//      committed when there is nothing to update.
//
// Run via: npm run audit-fix

const { execSync } = require('child_process');

const COMMIT_MESSAGE = 'fix: update vulnerable dependencies via npm audit fix';
const DEP_FILES = ['package.json', 'package-lock.json'];

function run(cmd, { allowFailure = false } = {}) {
    console.log(`\n$ ${cmd}`);
    try {
        execSync(cmd, { stdio: 'inherit' });
    } catch (err) {
        if (allowFailure) {
            console.log(`(command exited non-zero - continuing)`);
            return;
        }
        throw err;
    }
}

function depFilesStatus() {
    return execSync(`git status --porcelain -- ${DEP_FILES.join(' ')}`, { encoding: 'utf8' }).trim();
}

// Refuse to run if the dependency files already have uncommitted changes -
// otherwise those unrelated edits would be swept into the audit-fix commit.
const preexisting = depFilesStatus();
if (preexisting) {
    console.error('✗ package.json / package-lock.json have uncommitted changes:');
    console.error(preexisting);
    console.error('\nCommit or stash them first, then re-run `npm run audit-fix`.');
    process.exit(1);
}

run('npm install');

// `npm audit fix` exits non-zero when vulnerabilities remain that would need
// --force (i.e. breaking changes we intentionally do NOT auto-apply). That is
// not an error for this workflow, so we tolerate a non-zero exit.
run('npm audit fix', { allowFailure: true });

if (!depFilesStatus()) {
    console.log('\nNo dependency changes to commit. Already up to date.');
    process.exit(0);
}

run(`git add ${DEP_FILES.join(' ')}`);
run(`git commit -m "${COMMIT_MESSAGE}"`);
console.log('\n✓ Committed dependency updates.');
