import fs from 'node:fs';
import path from 'node:path';
import { loadSupabaseAccessToken } from './jwt-auth.mjs';

const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000';

function toFile(buffer, name, type) {
  return new File([buffer], name, { type });
}

function makeSamplePdf() {
  const pdfText = `
%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 188 >>
stream
RealEST property title deed document
Property owner: Sample Owner
Property address: 12 Validation Way, Lagos
Date: 2026-05-24
Signature and official seal present
Watermark visible
endstream
endobj
trailer
<< /Root 1 0 R >>
%%EOF
`;
  return Buffer.from(pdfText.trim(), 'utf8');
}

async function requestJson(url, options) {
  const response = await fetch(url, options);
  const contentType = response.headers.get('content-type') ?? '';
  const body = contentType.includes('application/json') ? await response.json() : await response.text();
  return { response, body, contentType };
}

async function processValidationJob(baseUrl, headers, jobId) {
  const processResult = await requestJson(`${baseUrl}/api/admin/validation/jobs/process`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ jobId }),
  });

  if (!processResult.response.ok) {
    const preview = typeof processResult.body === 'string' ? processResult.body.slice(0, 1024) : JSON.stringify(processResult.body);
    throw new Error(`Failed to process validation job ${jobId}: ${processResult.response.status} ${processResult.response.statusText}\n${preview}`);
  }

  for (let attempt = 0; attempt < 30; attempt += 1) {
    const statusResult = await requestJson(`${baseUrl}/api/admin/validation/jobs/${jobId}`, { headers });
    if (!statusResult.response.ok) {
      throw new Error(`Failed to load validation job ${jobId}: ${statusResult.response.status} ${statusResult.response.statusText}`);
    }

    const job = statusResult.body?.data ?? statusResult.body;
    if (job?.status === 'completed' || job?.status === 'failed') {
      return job;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Timed out waiting for validation job ${jobId}`);
}

function buildSmokePropertyPayload(sourceRole) {
  const nonce = Date.now().toString(36);
  const latitude = 4.9001 + (Number.parseInt(nonce.slice(-2), 36) % 7) * 0.001;
  const longitude = 6.2501 + (Number.parseInt(nonce.slice(-2), 36) % 7) * 0.001;

  return {
    title: `RealEST ML Smoke Test ${nonce}`,
    description: 'Synthetic property listing created for the RealEST ML validation smoke test. It exists only to exercise document, image, and duplicate validation flows.',
    property_type: 'apartment',
    listing_type: 'for_rent',
    listing_source: sourceRole,
    address: `12 Validation Way ${nonce}, Yenagoa, Bayelsa`,
    city: 'Yenagoa',
    state: 'Bayelsa',
    postal_code: '569101',
    country: 'NG',
    latitude,
    longitude,
    bedrooms: 2,
    bathrooms: 2,
    square_feet: 1200,
    price: 250000,
    price_frequency: 'monthly',
    status: 'pending_ml_validation',
    verification_status: 'pending',
    images: ['/placeholder.jpg'],
  };
}

async function loadPropertySeed(token, role) {
  const listResult = await requestJson(`${baseUrl}/api/properties/owner?page=1&limit=5`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (listResult.response.ok && Array.isArray(listResult.body?.properties) && listResult.body.properties.length > 0) {
    return listResult.body.properties[0];
  }

  const createResult = await requestJson(`${baseUrl}/api/properties`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildSmokePropertyPayload(role)),
  });

  if (!createResult.response.ok) {
    const preview = typeof createResult.body === 'string' ? createResult.body.slice(0, 1024) : JSON.stringify(createResult.body);
    throw new Error(`Failed to create smoke property via ${role}: ${createResult.response.status} ${createResult.response.statusText}\n${preview}`);
  }

  return createResult.body?.property ?? createResult.body;
}

async function loadAdminPropertySeed(token) {
  const createResult = await requestJson(`${baseUrl}/api/admin/properties`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildSmokePropertyPayload('agent')),
  });

  if (!createResult.response.ok) {
    const preview = typeof createResult.body === 'string' ? createResult.body.slice(0, 1024) : JSON.stringify(createResult.body);
    throw new Error(`Failed to create smoke property via admin: ${createResult.response.status} ${createResult.response.statusText}\n${preview}`);
  }

  return createResult.body?.property ?? createResult.body;
}

async function main() {
  const adminToken = await loadSupabaseAccessToken({
    label: 'admin',
    emailEnvNames: ['ADMIN_EMAIL', 'SUPABASE_ADMIN_EMAIL', 'REALEST_ADMIN_EMAIL'],
    passwordEnvNames: ['ADMIN_PASSWORD', 'SUPABASE_ADMIN_PASSWORD', 'REALEST_ADMIN_PASSWORD'],
    refreshTokenEnvNames: ['ADMIN_REFRESH_TOKEN', 'SUPABASE_ADMIN_REFRESH_TOKEN', 'REALEST_ADMIN_REFRESH_TOKEN'],
  });

  const headers = { Authorization: `Bearer ${adminToken}` };

  const queueResult = await requestJson(`${baseUrl}/api/admin/validation/ml?page=1&per_page=5`, { headers });
  if (!queueResult.response.ok) {
    const preview = typeof queueResult.body === 'string' ? queueResult.body.slice(0, 1024) : JSON.stringify(queueResult.body);
    console.error(`Failed to load ML queue: ${queueResult.response.status} ${queueResult.response.statusText}`);
    console.error('Response content-type:', queueResult.contentType);
    console.error('Body preview:\n', preview);
    process.exit(1);
  }

  if (!queueResult.contentType.includes('application/json')) {
    console.error('Expected JSON response but received:', queueResult.contentType);
    console.error('Body preview:\n', (typeof queueResult.body === 'string' ? queueResult.body.slice(0, 2048) : JSON.stringify(queueResult.body)));
    process.exit(1);
  }

  let firstProperty = queueResult.body?.data?.[0];
  if (!firstProperty?.id) {
    const ownerToken = await loadSupabaseAccessToken({
      label: 'owner',
      emailEnvNames: ['OWNER_EMAIL', 'SUPABASE_OWNER_EMAIL', 'REALEST_OWNER_EMAIL'],
      passwordEnvNames: ['OWNER_PASSWORD', 'SUPABASE_OWNER_PASSWORD', 'REALEST_OWNER_PASSWORD'],
      refreshTokenEnvNames: ['OWNER_REFRESH_TOKEN', 'SUPABASE_OWNER_REFRESH_TOKEN', 'REALEST_OWNER_REFRESH_TOKEN'],
    });

    try {
      firstProperty = await loadPropertySeed(ownerToken, 'owner');
    } catch (ownerError) {
      try {
        const agentToken = await loadSupabaseAccessToken({
          label: 'agent',
          emailEnvNames: ['AGENT_EMAIL', 'SUPABASE_AGENT_EMAIL', 'REALEST_AGENT_EMAIL'],
          passwordEnvNames: ['AGENT_PASSWORD', 'SUPABASE_AGENT_PASSWORD', 'REALEST_AGENT_PASSWORD'],
          refreshTokenEnvNames: ['AGENT_REFRESH_TOKEN', 'SUPABASE_AGENT_REFRESH_TOKEN', 'REALEST_AGENT_REFRESH_TOKEN'],
        });

        firstProperty = await loadPropertySeed(agentToken, 'agent');
      } catch (agentError) {
        firstProperty = await loadAdminPropertySeed(adminToken);
      }
    }

    const refreshedQueue = await requestJson(`${baseUrl}/api/admin/validation/ml?page=1&per_page=5`, { headers });
    if (!refreshedQueue.response.ok) {
      throw new Error(`Failed to refresh ML queue after seeding property: ${refreshedQueue.response.status} ${refreshedQueue.response.statusText}`);
    }

    firstProperty = refreshedQueue.body?.data?.[0] ?? firstProperty;
  }

  const propertyId = firstProperty.id;
  const propertyType = firstProperty.property_type ?? 'house';
  const address = firstProperty.address ?? '12 Validation Way, Lagos';
  const description = `${firstProperty.title ?? 'Sample property'} on the ML validation smoke test path.`;

  const documentForm = new FormData();
  documentForm.set('file', toFile(makeSamplePdf(), 'validation-sample.pdf', 'application/pdf'));
  documentForm.set('propertyId', propertyId);
  documentForm.set('documentType', 'title_deed');

  const documentResult = await requestJson(`${baseUrl}/api/admin/validation/document`, {
    method: 'POST',
    headers,
    body: documentForm,
  });
  console.log(`[document] ${documentResult.response.status} ${documentResult.response.statusText}`);
  console.log(JSON.stringify(documentResult.body, null, 2));

  if (!documentResult.body?.jobId) {
    throw new Error(`Document validation did not return a jobId: ${JSON.stringify(documentResult.body)}`);
  }

  const documentJob = await processValidationJob(baseUrl, headers, documentResult.body.jobId);
  console.log(`[document-job] ${JSON.stringify(documentJob, null, 2)}`);

  const imagePath = path.join(process.cwd(), 'public', 'placeholder.jpg');
  const imageBuffer = fs.readFileSync(imagePath);
  const imageForm = new FormData();
  imageForm.set('file', toFile(imageBuffer, 'placeholder.jpg', 'image/jpeg'));
  imageForm.set('propertyId', propertyId);
  imageForm.set('propertyType', propertyType);

  const imageResult = await requestJson(`${baseUrl}/api/admin/validation/image`, {
    method: 'POST',
    headers,
    body: imageForm,
  });
  console.log(`[image] ${imageResult.response.status} ${imageResult.response.statusText}`);
  console.log(JSON.stringify(imageResult.body, null, 2));

  if (!imageResult.body?.jobId) {
    throw new Error(`Image validation did not return a jobId: ${JSON.stringify(imageResult.body)}`);
  }

  const imageJob = await processValidationJob(baseUrl, headers, imageResult.body.jobId);
  console.log(`[image-job] ${JSON.stringify(imageJob, null, 2)}`);

  const duplicateResult = await requestJson(`${baseUrl}/api/admin/validation/duplicates`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      propertyId,
      images: [`${baseUrl}/placeholder.jpg`],
      location: {
        lat: Number(firstProperty.latitude ?? 4.0),
        lng: Number(firstProperty.longitude ?? 6.0),
      },
      description,
      address,
      propertyType,
    }),
  });
  console.log(`[duplicates] ${duplicateResult.response.status} ${duplicateResult.response.statusText}`);
  console.log(JSON.stringify(duplicateResult.body, null, 2));

  if (!duplicateResult.body?.jobId) {
    throw new Error(`Duplicate check did not return a jobId: ${JSON.stringify(duplicateResult.body)}`);
  }

  const duplicateJob = await processValidationJob(baseUrl, headers, duplicateResult.body.jobId);
  console.log(`[duplicate-job] ${JSON.stringify(duplicateJob, null, 2)}`);
}

main().catch((error) => {
  console.error('Validation smoke test failed:', error);
  process.exit(1);
});