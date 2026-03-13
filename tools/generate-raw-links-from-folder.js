const fs = require("fs");
const path = require("path");

const repoOwner = "Luckywolf82";
const repoName = "governancehub";
const branch = "main";
const targetFolder = "src/components";

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else {
      results.push(fullPath.replace(/\\/g, "/"));
    }
  });

  return results;
}

const files = walk(targetFolder);

const rawLinks = files.map(
  (file) =>
    `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${branch}/${file}`
);

console.log(rawLinks.join("\n"));
