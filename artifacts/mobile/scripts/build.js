#!/usr/bin/env node
/**
 * Build helper — wraps EAS CLI with sane defaults.
 * Usage: node scripts/build.js [android|ios|all] [preview|production]
 */

const { execSync } = require("child_process");

const platform = process.argv[2] || "android";
const profile = process.argv[3] || "preview";

const validPlatforms = ["android", "ios", "all"];
const validProfiles = ["preview", "production", "development"];

if (!validPlatforms.includes(platform)) {
  console.error(`Invalid platform: ${platform}. Use: ${validPlatforms.join(", ")}`);
  process.exit(1);
}
if (!validProfiles.includes(profile)) {
  console.error(`Invalid profile: ${profile}. Use: ${validProfiles.join(", ")}`);
  process.exit(1);
}

console.log(`Building ${platform} (${profile})...`);
execSync(`eas build --platform ${platform} --profile ${profile} --non-interactive`, {
  stdio: "inherit",
  cwd: __dirname + "/..",
});
