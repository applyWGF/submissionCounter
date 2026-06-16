// Fetches the submission count from Submittable and writes public/count.json.
//
// Local run:
//   node --env-file=.env.local scripts/update-count.js
//
// Required env vars:
//   SUBMITTABLE_API_KEY
//   SUBMITTABLE_PROJECT_ID

const fs = require('fs/promises');
const path = require('path');
const { countSubmissionsForProject } = require('../lib/submittable');

const OUTPUT_PATH = path.join(__dirname, '../public/count.json');

async function main() {
  const apiKey = process.env.SUBMITTABLE_API_KEY;
  const projectId = process.env.SUBMITTABLE_PROJECT_ID;

  if (!apiKey || !projectId) {
    console.error('Set SUBMITTABLE_API_KEY and SUBMITTABLE_PROJECT_ID in .env.local');
    process.exit(1);
  }

  const count = await countSubmissionsForProject({ apiKey, projectId });
  const payload = {
    count,
    updatedAt: new Date().toISOString(),
  };

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`);

  console.log(`Wrote ${OUTPUT_PATH}`);
  console.log(JSON.stringify(payload));
}

main().catch((error) => {
  console.error('Failed to update count:', error.message);
  process.exit(1);
});
