import {
  detectPlatform,
  extractUsername,
  getSupportedPlatforms,
  normalizeSocialUrl,
  validateSocialUrl,
} from "sociurl";

const inputs = [
  "https://instagram.com/ahmad",
  "www.instagram.com/",
  "instagram.com/ahmad",
  "https://linkedin.com/in/ahmad",
  "https://linkedin.com/in/",
  "https://instagram.com.fake.com/ahmad",
];

for (const input of inputs) {
  console.log({
    input,
    platform: detectPlatform(input),
    username: extractUsername(input),
    normalized: normalizeSocialUrl(input),
    validation: validateSocialUrl(input),
  });
}

console.log(`Supported platforms: ${getSupportedPlatforms().length}`);
