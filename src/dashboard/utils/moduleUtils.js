import fs from "fs";
import path from "path";

export const getBaseMethodNames = () => {
  const srcDir = path.join(__dirname, "..", "..");
  const moduleBasePath = path.join(
    srcDir,
    "projector",
    "helpers",
    "moduleBase.js"
  );
  const threeBasePath = path.join(
    srcDir,
    "projector",
    "helpers",
    "threeBase.js"
  );

  try {
    const moduleBaseContent = fs.readFileSync(moduleBasePath, "utf-8");
    const threeBaseContent = fs.readFileSync(threeBasePath, "utf-8");

    const methodRegex = /{\s*name:\s*"([^"]+)",\s*executeOnLoad:/g;

    const moduleBaseMatches = [...moduleBaseContent.matchAll(methodRegex)];
    const threeBaseMatches = [...threeBaseContent.matchAll(methodRegex)];

    return {
      moduleBase: moduleBaseMatches.map((match) => match[1]),
      threeBase: threeBaseMatches.map((match) => match[1]),
    };
  } catch (error) {
    console.error("Error reading base files:", error);
    return { moduleBase: [], threeBase: [] };
  }
};

