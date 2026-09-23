const fs = require('fs');
const path = require('path');

const replacements = [
    ["30+ YEARS OF ACADEMIC EXCELLENCE", "30+ YEARS OF ACADEMIC EXCELLENCE"],
    ["30+ Years Of Academic Excellence", "30+ Years Of Academic Excellence"],
    ["One is the outcome, one is the path, one is the knowledge that makes the path visible. ClariVeda exists at the point where all three meet — where confusion gives way to direction, effort becomes mastery, and ancient wisdom meets modern chaos.", "One is the outcome, one is the path, one is the knowledge that makes the path visible. ClariVeda exists at the point where all three meet — where confusion gives way to direction, effort becomes mastery, and ancient wisdom meets modern chaos."],
    ["Empowering Parents. Guiding Students. Shaping Success. Transforming Lives.", "Empowering Parents. Guiding Students. Shaping Success. Transforming Lives."],
    ["Confusion → Awareness → Clarity → Direction → Action → Mastery", "Confusion → Awareness → Clarity → Direction → Action → Mastery"]
];

function processDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!fullPath.includes('.git')) {
                processDir(fullPath);
            }
        } else {
            if (['.html', '.js', '.txt'].includes(path.extname(fullPath))) {
                let content = fs.readFileSync(fullPath, 'utf8');
                let newContent = content;
                for (const [oldText, newText] of replacements) {
                    newContent = newContent.split(oldText).join(newText);
                }
                if (content !== newContent) {
                    fs.writeFileSync(fullPath, newContent, 'utf8');
                    console.log('Updated ' + fullPath);
                }
            }
        }
    });
}

processDir(__dirname);
