import fs from 'fs';
import https from 'https';

const url = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzI1Mjg4M2Y0MGNkZTRkZGQ5NGNlM2YwMzFkMTFlOThkEgsSBxCX0NCTyRYYAZIBJAoKcHJvamVjdF9pZBIWQhQxMjAwNzcxOTU3MDQ1MDU0Mzc5Nw&filename=&opi=89354086";
const file = fs.createWriteStream("stitch_password.html");

https.get(url, response => {
    response.pipe(file);
    file.on("finish", () => {
        file.close();
        console.log("Download Completed");
    });
}).on("error", err => {
    console.log("Error: ", err.message);
});
