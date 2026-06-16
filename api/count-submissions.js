// Fetches and prints the submission count for a Submittable project.
//
// Local run:
//   node --env-file=.env.local api/count-submissions.js

const { countSubmissionsForProject } = require('../lib/submittable');

const apiKey = process.env.SUBMITTABLE_API_KEY;
const projectId = process.env.SUBMITTABLE_PROJECT_ID;

if (!apiKey || !projectId) {
  console.error('Set SUBMITTABLE_API_KEY and SUBMITTABLE_PROJECT_ID in .env.local');
  process.exit(1);
}

countSubmissionsForProject({ apiKey, projectId })
  .then((count) => {
    console.log(`Project ID:  ${projectId}`);
    console.log(`Submissions: ${count}`);
  })
  .catch((error) => {
    console.error('Failed to count submissions:', error.message);
    process.exit(1);
  });
