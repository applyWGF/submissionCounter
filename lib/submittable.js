const API_BASE = 'https://submittable-api.submittable.com';
const PAGE_SIZE = 500;

function buildAuthHeader(apiKey) {
  const encoded = Buffer.from(`${apiKey}:`).toString('base64');
  return `Basic ${encoded}`;
}

async function fetchSubmissionsPage({ apiKey, projectId, continuationToken }) {
  const url = new URL(`${API_BASE}/v4/submissions`);

  if (continuationToken) {
    url.searchParams.set('continuationToken', continuationToken);
  } else {
    url.searchParams.set('size', String(PAGE_SIZE));
    url.searchParams.append('Projects.Include', projectId);
  }

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      Authorization: buildAuthHeader(apiKey),
    },
  });

  const bodyText = await response.text();

  if (!response.ok) {
    const detail = bodyText ? `: ${bodyText.slice(0, 300)}` : '';
    throw new Error(`Request failed (${response.status} ${response.statusText})${detail}`);
  }

  return JSON.parse(bodyText);
}

async function countSubmissionsForProject({ apiKey, projectId }) {
  const submissions = await listSubmissionsForProject({ apiKey, projectId });
  return submissions.length;
}

async function listSubmissionsForProject({ apiKey, projectId }) {
  const submissions = [];
  let continuationToken = null;

  do {
    const page = await fetchSubmissionsPage({ apiKey, projectId, continuationToken });
    if (page.items?.length) {
      submissions.push(...page.items);
    }
    continuationToken = page.continuationToken || null;
  } while (continuationToken);

  return submissions;
}

async function deleteSubmission({ apiKey, submissionId }) {
  const response = await fetch(`${API_BASE}/v4/submissions/${submissionId}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      Authorization: buildAuthHeader(apiKey),
    },
  });

  if (response.status === 204) {
    return;
  }

  const bodyText = await response.text();
  const detail = bodyText ? `: ${bodyText.slice(0, 300)}` : '';
  throw new Error(`Delete failed (${response.status} ${response.statusText})${detail}`);
}

module.exports = {
  countSubmissionsForProject,
  listSubmissionsForProject,
  deleteSubmission,
};
