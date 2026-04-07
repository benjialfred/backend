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

        // Replace backgrounds
        content = content.replace(/bg-slate-50/g, 'bg-white');
        content = content.replace(/bg-slate-100/g, 'bg-primary-50');
        content = content.replace(/bg-slate-200/g, 'bg-primary-100');
        content = content.replace(/bg-slate-800/g, 'bg-dark-800');
        content = content.replace(/bg-slate-900/g, 'bg-dark-900');
        content = content.replace(/bg-gray-50/g, 'bg-white');
        content = content.replace(/bg-gray-100/g, 'bg-primary-50');
        content = content.replace(/bg-gray-800/g, 'bg-dark-800');
        content = content.replace(/bg-gray-900/g, 'bg-dark-900');

        // Text
        content = content.replace(/text-slate-500/g, 'text-dark-600 dark:text-primary-300');
        content = content.replace(/text-slate-600/g, 'text-dark-700 dark:text-primary-200');
        content = content.replace(/text-slate-700/g, 'text-dark-700 dark:text-primary-200');
        content = content.replace(/text-slate-800/g, 'text-dark-800 dark:text-primary-100');
        content = content.replace(/text-slate-900/g, 'text-dark-900 dark:text-white');
        content = content.replace(/text-gray-500/g, 'text-dark-600 dark:text-primary-300');
        content = content.replace(/text-gray-900/g, 'text-dark-900 dark:text-white');

        // Borders
        content = content.replace(/border-slate-200/g, 'border-primary-100 dark:border-dark-700');
        content = content.replace(/border-slate-300/g, 'border-primary-200 dark:border-dark-600');
        content = content.replace(/border-slate-700/g, 'border-dark-700');
        content = content.replace(/border-slate-800/g, 'border-dark-800');
        content = content.replace(/border-gray-200/g, 'border-primary-100 dark:border-dark-700');

        // Hovers
        content = content.replace(/hover:bg-slate-50/g, 'hover:bg-primary-50');
        content = content.replace(/hover:bg-slate-100/g, 'hover:bg-primary-100');
        content = content.replace(/hover:bg-slate-800/g, 'hover:bg-dark-800');
        content = content.replace(/hover:text-slate-900/g, 'hover:text-dark-900');

        // Hexes specifics overrides left from before
        content = content.replace(/#221f10/g, '#221F10');
        content = content.replace(/#f2cc0d/g, '#f2cc0d');

        if (content !== initial) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated ${filePath}`);
        }
    });
}
processFiles();
