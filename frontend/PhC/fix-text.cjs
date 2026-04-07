const fs = require('fs');
const path = require('path');

const filesToFix = [
    'src/pages/Home.tsx',
    'src/pages/ProductsPublic.tsx',
    'src/pages/ContactPage.tsx',
    'src/pages/ProductDetail.tsx',
    'src/pages/AboutPage.tsx'
];

filesToFix.forEach(relPath => {
    const fullPath = path.join(__dirname, relPath);
    if (!fs.existsSync(fullPath)) return;

    let content = fs.readFileSync(fullPath, 'utf8');

    // Size changes
    content = content.replace(/text-\[10px\]/g, 'text-xs md:text-sm font-medium');
    content = content.replace(/text-xs(?![a-zA-Z0-9\-])/g, 'text-sm font-medium');
    content = content.replace(/text-sm(?![a-zA-Z0-9\-])/g, 'text-base font-medium');
    content = content.replace(/text-slate-500/g, 'text-slate-700 dark:text-slate-300');
    content = content.replace(/text-slate-400/g, 'text-slate-600 dark:text-slate-400');
    content = content.replace(/text-slate-600/g, 'text-slate-800 dark:text-slate-200');
    // Ensure we don't have duplicated font-medium
    content = content.replace(/font-medium\s+font-medium/g, 'font-medium');

    // Removing the blur overlay on the Home caroussel which makes text hard to read
    if (relPath === 'src/pages/Home.tsx') {
        content = content.replace(/bg-gradient-to-t from-\[\#221f10\]\/90 via-\[\#221f10\]\/40 to-transparent/g, 'bg-gradient-to-t from-[#221f10]/95 via-[#221f10]/60 to-[#221f10]/80');
        // Let's improve contrast constraint on text
        content = content.replace(/text-slate-300 mb-10/g, 'text-white font-medium drop-shadow-lg mb-10');
    }

    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Fixed text rendering in ${relPath}`);
});
