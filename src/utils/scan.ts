import fs from "fs";
import path from "path";

export function getSourceFiles(dir: string): string[] {
    let results: string[] = [];

    const list = fs.readdirSync(dir);

    list.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat && stat.isDirectory()) {
            results = results.concat(getSourceFiles(filePath));
        } else if (file.endsWith('.js') || file.endsWith('.ts')) {
            if (!file.includes("test")) {
                results.push(filePath);
            }
        }
    })
    return results;
}