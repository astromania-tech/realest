#!/usr/bin/env node
import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { loadSupabaseAccessToken } from './jwt-auth.ts'

const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000'
const uploadsDir = path.join(process.cwd(), 'uploads')
const resortAddress = 'No 1, 7th Avenue, New Otuoke road, Bayelsa Palm, Yenagoa, Nigeria, 569101'
const resortLatitude = 4.9334651
const resortLongitude = 6.2747786

function toFile(buffer: Buffer, name: string, type: string) {
  // In Node, constructing a browser File can be unreliable across versions.
  // Return raw buffer and filename so callers can append it to FormData
  // in a Node-friendly way: `formData.set('file', buffer, filename)`.
  return { buffer, name, type }
}

function mimeTypeForFile(fileName: string) {
  const ext = path.extname(fileName).toLowerCase()
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg'
  if (ext === '.png') return 'image/png'
  if (ext === '.webp') return 'image/webp'
  if (ext === '.mp4') return 'video/mp4'
  return 'application/octet-stream'
}

async function requestJson(url: string, options: RequestInit = {}) {
  const response = await fetch(url, options)
  const contentType = response.headers.get('content-type') ?? ''
  const body = contentType.includes('application/json') ? await response.json() : await response.text()
  return { response, body, contentType }
}

async function processValidationJob(baseUrl: string, headers: Record<string, string>, jobId: string) {
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

function readFileAsBlob(filePath: string) {
  const buffer = fs.readFileSync(filePath)
  return { buffer, mimeType: mimeTypeForFile(filePath), fileName: path.basename(filePath) }
}

function buildResortListingPayload() {
  const nonce = Date.now().toString(36)
  return {
    title: `7th Signature Resort & Accommodations Smoke Listing ${nonce}`,
    description:
      'End-to-end smoke listing for 7th Signature Resort & Accommodations in Yenagoa, Bayelsa State, exercising uploads, ML document validation, image validation, duplicate detection, and admin review transitions.',
    property_type: 'hotel',
    listing_type: 'short_let',
    listing_source: 'agent',
    address: resortAddress,
    city: 'Yenagoa',
    state: 'Bayelsa',
    postal_code: '569101',
    country: 'NG',
    latitude: resortLatitude,
    longitude: resortLongitude,
    bedrooms: 12,
    bathrooms: 12,
    toilets: 12,
    square_feet: 10000,
    year_built: 2025,
    price: 40000,
    price_frequency: 'nightly',
    status: 'pending_ml_validation',
    verification_status: 'pending',
    parking_spaces: 10,
    has_pool: true,
    has_garage: true,
    has_garden: true,
    amenities: {
      swimming_pool: true,
      parking_spaces: true,
      generator: true,
      air_conditioning: true,
      lounge_area: true,
      business_center: true,
      garden: true,
      furnished: true,
      balcony: true,
      elevator: false,
    },
    features: {
      wifi: true,
      bar: true,
      pool_table: true,
      event_space: true,
    },
    utilities: {
      water_source: 'borehole',
      has_water_treatment: true,
      internet_type: 'wi_fi',
    },
    power: {
      nepa_status: 'stable',
      power_source: 'generator + public supply',
      has_generator: true,
      has_inverter: true,
      solar_panels: false,
    },
    security: {
      security_type: ['gated_community', 'security_post', 'cctv', 'estate_security'],
      security_hours: '24/7',
      has_security_levy: false,
    },
    road: {
      road_condition: 'paved',
      road_accessibility: 'all_year',
    },
    building: {
      floors: 2,
      material: 'concrete',
      year_renovated: 2025,
    },
    fees: {
      service_charge: 0,
      caution_fee: 0,
      legal_fee: 0,
      agent_fee: 0,
    },
  }
}

async function main() {
  const adminToken = await loadSupabaseAccessToken({
    label: 'admin',
    emailEnvNames: ['ADMIN_EMAIL', 'SUPABASE_ADMIN_EMAIL', 'REALEST_ADMIN_EMAIL'],
    passwordEnvNames: ['ADMIN_PASSWORD', 'SUPABASE_ADMIN_PASSWORD', 'REALEST_ADMIN_PASSWORD'],
    refreshTokenEnvNames: ['ADMIN_REFRESH_TOKEN', 'SUPABASE_ADMIN_REFRESH_TOKEN', 'REALEST_ADMIN_REFRESH_TOKEN'],
  })

  const headers = { Authorization: `Bearer ${adminToken}` }
  const listingPayload = buildResortListingPayload()

  const createResult = await requestJson(`${baseUrl}/api/admin/properties`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(listingPayload),
  })

  console.log(`[create] ${createResult.response.status} ${createResult.response.statusText}`)
  console.log(JSON.stringify(createResult.body, null, 2))

  if (!createResult.response.ok) {
    throw new Error('Failed to create admin listing')
  }

  const property = createResult.body?.property ?? createResult.body?.data?.property ?? createResult.body?.data ?? createResult.body
  const propertyId = property?.id
  if (!propertyId) {
    throw new Error('Could not determine created property id')
  }

  console.log(`Created property id: ${propertyId}`)

  const uploads = fs.readdirSync(uploadsDir)
  const imageNames = uploads.filter((fileName) => /\.(jpe?g|png|webp)$/i.test(fileName) && fileName !== 'REALEST-CAC.jpg').sort()
  const videoNames = uploads.filter((fileName) => /\.mp4$/i.test(fileName)).sort()
  const documentName = 'REALEST-CAC.jpg'

  const mediaResults = []
  for (let index = 0; index < imageNames.length; index += 1) {
    const fileName = imageNames[index]
    const { buffer, mimeType } = readFileAsBlob(path.join(uploadsDir, fileName))
    const formData = new FormData()
    // Wrap buffer in a Blob for Node's FormData implementation
    formData.set('file', new Blob([buffer], { type: mimeType }), fileName)
    formData.set('media_type', 'image')
    formData.set('alt_text', `7th Signature Resort image ${index + 1}`)
    formData.set('is_featured', index === 0 ? 'true' : 'false')

    const uploadResult = await requestJson(`${baseUrl}/api/dashboard/listings/${propertyId}/media`, {
      method: 'POST',
      headers,
      body: formData,
    })

    console.log(`[media:${fileName}] ${uploadResult.response.status} ${uploadResult.response.statusText}`)
    console.log(JSON.stringify(uploadResult.body, null, 2))

    if (!uploadResult.response.ok) {
      throw new Error(`Failed to upload media file: ${fileName}`)
    }

    mediaResults.push(uploadResult.body?.data ?? uploadResult.body)
  }

  for (const fileName of videoNames) {
    const { buffer, mimeType } = readFileAsBlob(path.join(uploadsDir, fileName))
    const formData = new FormData()
    formData.set('file', new Blob([buffer], { type: mimeType }), fileName)
    formData.set('media_type', 'video')
    formData.set('alt_text', `7th Signature Resort video ${fileName}`)
    formData.set('is_featured', 'false')

    const uploadResult = await requestJson(`${baseUrl}/api/dashboard/listings/${propertyId}/media`, {
      method: 'POST',
      headers,
      body: formData,
    })

    console.log(`[video:${fileName}] ${uploadResult.response.status} ${uploadResult.response.statusText}`)
    console.log(JSON.stringify(uploadResult.body, null, 2))

    if (!uploadResult.response.ok) {
      throw new Error(`Failed to upload video file: ${fileName}`)
    }

    mediaResults.push(uploadResult.body?.data ?? uploadResult.body)
  }

  const docPath = path.join(uploadsDir, documentName)
  const docBlob = readFileAsBlob(docPath)
  const documentForm = new FormData()
  documentForm.set('file', new Blob([docBlob.buffer], { type: docBlob.mimeType }), documentName)
  documentForm.set('document_type', 'other')

  const documentUploadResult = await requestJson(`${baseUrl}/api/dashboard/listings/${propertyId}/documents`, {
    method: 'POST',
    headers,
    body: documentForm,
  })

  console.log(`[document-upload:${documentName}] ${documentUploadResult.response.status} ${documentUploadResult.response.statusText}`)
  console.log(JSON.stringify(documentUploadResult.body, null, 2))

  if (!documentUploadResult.response.ok) {
    throw new Error(`Failed to upload document file: ${documentName}`)
  }

  const documentUrl = documentUploadResult.body?.data?.document_url || documentUploadResult.body?.document_url
  const documentValidationForm = new FormData()
  // Send the public URL to the validation endpoint (server will fetch it)
  documentValidationForm.set('fileUrl', documentUrl)
  documentValidationForm.set('propertyId', propertyId)
  documentValidationForm.set('documentType', 'title_deed')

  const documentValidationResult = await requestJson(`${baseUrl}/api/admin/validation/document`, {
    method: 'POST',
    headers,
    body: documentValidationForm,
  })

  console.log(`[document-validation] ${documentValidationResult.response.status} ${documentValidationResult.response.statusText}`)
  console.log(JSON.stringify(documentValidationResult.body, null, 2))

  if (!documentValidationResult.body?.jobId) {
    throw new Error('Document validation failed to return a jobId')
  }

  const documentJob = await processValidationJob(baseUrl, headers, documentValidationResult.body.jobId)
  console.log(`[document-job] ${JSON.stringify(documentJob, null, 2)}`)

  const imageValidationResults = []
  for (let i = 0; i < imageNames.length; i += 1) {
    const fileName = imageNames[i]
    const uploaded = mediaResults[i]
    const imageUrl = uploaded?.media_url || uploaded?.mediaUrl || uploaded?.data?.media_url
    const imageForm = new FormData()
    // Use the public URL from the uploaded media for validation
    imageForm.set('fileUrl', imageUrl)
    imageForm.set('propertyId', propertyId)
    imageForm.set('propertyType', 'hotel')

    const imageValidationResult = await requestJson(`${baseUrl}/api/admin/validation/image`, {
      method: 'POST',
      headers,
      body: imageForm,
    })

    console.log(`[image-validation:${fileName}] ${imageValidationResult.response.status} ${imageValidationResult.response.statusText}`)
    console.log(JSON.stringify(imageValidationResult.body, null, 2))

    if (!imageValidationResult.response.ok) {
      throw new Error(`Failed image validation for ${fileName}`)
    }

    if (!imageValidationResult.body?.jobId) {
      throw new Error(`Image validation for ${fileName} failed to return a jobId`)
    }

    if (!imageValidationResult.body?.jobId) {
      throw new Error(`Image validation for ${fileName} failed to return a jobId: ${JSON.stringify(imageValidationResult.body)}`)
    }

    const imageJob = await processValidationJob(baseUrl, headers, imageValidationResult.body.jobId)
    console.log(`[image-job:${fileName}] ${JSON.stringify(imageJob, null, 2)}`)

    imageValidationResults.push({ fileName, result: imageJob })
  }

  const duplicatePayload = {
    propertyId,
    images: mediaResults
      .map((media) => media?.media_url)
      .filter((mediaUrl) => typeof mediaUrl === 'string' && mediaUrl.length > 0),
    location: {
      lat: resortLatitude,
      lng: resortLongitude,
    },
    description: listingPayload.description,
    address: listingPayload.address,
    propertyType: listingPayload.property_type,
  }

  const duplicateResult = await requestJson(`${baseUrl}/api/admin/validation/duplicates`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(duplicatePayload),
  })

  console.log(`[duplicate-check] ${duplicateResult.response.status} ${duplicateResult.response.statusText}`)
  console.log(JSON.stringify(duplicateResult.body, null, 2))

  if (!duplicateResult.response.ok) {
    throw new Error('Duplicate check failed')
  }
  
  if (!duplicateResult.body?.jobId) {
    throw new Error(`Duplicate check did not return a jobId: ${JSON.stringify(duplicateResult.body)}`)
  }

  const duplicateJob = await processValidationJob(baseUrl, headers, duplicateResult.body.jobId)
  console.log(`[duplicate-job] ${JSON.stringify(duplicateJob, null, 2)}`)

  const rejectionNotes = [
    'CAC document does not describe 7th Signature Resort.',
    'Uploaded certificate text refers to RealEST Connect business registration and a Bayelsa principal place of business address.',
    `Expected resort address for this smoke listing is ${listingPayload.address}.`,
    'This path intentionally exercises false-document rejection behavior.',
  ].join(' ')

  const mlReviewResult = await requestJson(`${baseUrl}/api/admin/validation/ml/${propertyId}`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'reject',
      ml_confidence_score: typeof documentJob?.result?.confidence === 'number' ? documentJob.result.confidence : undefined,
      ml_validation_notes: rejectionNotes,
      admin_notes: 'Smoke test rejected because the uploaded CAC document is intentionally unrelated to the 7th Signature resort listing.',
    }),
  })

  console.log(`[ml-update] ${mlReviewResult.response.status} ${mlReviewResult.response.statusText}`)
  console.log(JSON.stringify(mlReviewResult.body, null, 2))

  const adminQueueAfter = await requestJson(`${baseUrl}/api/admin/properties?status=rejected`, { headers })
  console.log(`[admin-properties-after] ${adminQueueAfter.response.status} ${adminQueueAfter.response.statusText}`)
  console.log(JSON.stringify(adminQueueAfter.body, null, 2))

  console.log(JSON.stringify({
    propertyId,
    address: listingPayload.address,
    uploads: {
      images: imageNames,
      videos: videoNames,
      document: documentName,
    },
    validations: {
      document: documentValidationResult.body,
      images: imageValidationResults,
      duplicates: duplicateResult.body,
    },
    mlUpdate: mlReviewResult.body,
  }, null, 2))
}

main().catch((error) => {
  console.error('Full listing E2E smoke test failed:', error)
  process.exit(1)
})
