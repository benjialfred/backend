const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function processFiles() {
    walkDir(path.join(__dirname, 'src'), function (filePath) {
        if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

        let content = fs.readFileSync(filePath, 'utf8');
        let initial = content;

        // Clenaup messy classes from previous replacement
        content = content.replace(/text-dark-800 dark:text-primary-100 dark:text-slate-200 dark:text-dark-800 dark:text-primary-100 dark:text-slate-200 dark:text-slate-400/g, 'text-dark-600 dark:text-primary-200');
        content = content.replace(/text-dark-800 dark:text-primary-100 dark:text-slate-200 dark:text-slate-400/g, 'text-dark-600 dark:text-primary-200');
        content = content.replace(/text-dark-700 dark:text-primary-200 dark:text-slate-300/g, 'text-dark-700 dark:text-primary-100');
        content = content.replace(/text-dark-900 dark:text-white dark:text-slate-50/g, 'text-dark-900 dark:text-white');
        content = content.replace(/text-dark-900 dark:text-white dark:text-white/g, 'text-dark-900 dark:text-white');
        content = content.replace(/text-dark-900 dark:text-white dark:text-slate-100/g, 'text-dark-900 dark:text-white');
        content = content.replace(/text-base font-medium md:text-base font-medium/g, 'text-sm md:text-base font-medium');
        content = content.replace(/text-base font-medium font-medium/g, 'text-base font-medium');

        if (content !== initial) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Cleaned up classes in ${filePath}`);
        }
    });
}
processFiles();
