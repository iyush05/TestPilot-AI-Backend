import { execSync } from 'child_process';
import fs from "fs-extra";

export function cloneRepo(repoUrl: string) {    //add target too in v2 after implementing auth
    const dir = "sandbox";

    if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
    }

    console.log("Cloning repository...");
    execSync(`git clone ${repoUrl} ${dir}`, { stdio: 'inherit' });

    console.log("Repository cloned successfully.");
}