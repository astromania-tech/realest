import sharp from 'sharp';
import { Resvg } from '@resvg/resvg-js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Icon configurations - SVG file and desired PNG output
const iconConfigs = [
  // Apple Touch Icons
  {
    input: 'public/apple-touch-icon.svg',
    output: 'public/apple-touch-icon.png',
    size: 180
  },
  {
    input: 'public/apple-touch-icon-precomposed.svg',
    output: 'public/apple-touch-icon-precomposed.png',
    size: 180
  },
  {
    input: 'public/apple-touch-icon-120x120.svg',
    output: 'public/apple-touch-icon-120x120.png',
    size: 120
  },
  {
    input: 'public/apple-touch-icon-120x120-precomposed.svg',
    output: 'public/apple-touch-icon-120x120-precomposed.png',
    size: 120
  },

  // Web App Icons
  {
    input: 'public/icon-192.svg',
    output: 'public/icon-192.png',
    size: 192
  },
  {
    input: 'public/icon-512.svg',
    output: 'public/icon-512.png',
    size: 512
  },

  // Shortcut Icons
  {
    input: 'public/icon-search.svg',
    output: 'public/icon-search.png',
    size: 96
  },
  {
    input: 'public/icon-add.svg',
    output: 'public/icon-add.png',
    size: 96
  },

  // Standard Favicon
  {
    input: 'public/favicon.svg',
    output: 'public/favicon-32x32.png',
    size: 32
  },
  {
    input: 'public/favicon.svg',
    output: 'public/favicon-16x16.png',
    size: 16
  },

  // Enhanced Logos
  {
    input: 'public/realest-logo-enhanced.svg',
    output: 'public/realest-logo-enhanced.png',
    size: 200
  },
  {
    input: 'public/realest-logo-square.svg',
    output: 'public/realest-logo-square.png',
    size: 300
  },

  // Email wordmark PNGs — 2× retina (displayed at 160px wide in EmailHeader)
  {
    input: 'public/realest-wordmark-dark.svg',
    output: 'public/realest-wordmark-dark.png',
    size: 320
  },
  {
    input: 'public/realest-wordmark-light.svg',
    output: 'public/realest-wordmark-light.png',
    size: 320
  },
];

async function convertSvgToPng(svgPath, pngPath, size) {
  try {
    // Read SVG file
    const svgBuffer = await fs.readFile(svgPath);

    // Convert SVG to PNG using resvg
    const resvg = new Resvg(svgBuffer, {
      background: 'rgba(0, 0, 0, 0)', // Transparent background
      fitTo: {
        mode: 'width',
        value: size,
      },
      font: {
        loadSystemFonts: false, // Don't load system fonts for better consistency
      },
    });

    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    // Optimize with Sharp (optional, for better compression)
    const optimizedBuffer = await sharp(pngBuffer)
      .resize(size, null)  // constrain width only, preserve aspect ratio
      .png({
        compressionLevel: 9,
        quality: 95
      })
      .toBuffer();

    // Write PNG file
    await fs.writeFile(pngPath, optimizedBuffer);

    return { success: true, size: optimizedBuffer.length };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function generateAllIcons() {
  console.log('🎨 Starting PNG icon generation...\n');

  let successCount = 0;
  let failCount = 0;

  for (const config of iconConfigs) {
    const { input, output, size } = config;

    console.log(`Converting ${input} → ${output} (${size}x${size})`);

    const result = await convertSvgToPng(input, output, size);

    if (result.success) {
      const sizeKb = (result.size / 1024).toFixed(2);
      console.log(`✅ Success! Generated ${sizeKb}KB PNG\n`);
      successCount++;
    } else {
      console.log(`❌ Failed: ${result.error}\n`);
      failCount++;
    }
  }

  console.log('📊 Summary:');
  console.log(`✅ Successfully converted: ${successCount} icons`);
  console.log(`❌ Failed conversions: ${failCount} icons`);

  if (successCount > 0) {
    console.log('\n🎉 PNG icons generated! You may now want to:');
    console.log('1. Update manifest.json to reference .png files');
    console.log('2. Update layout.tsx icon references if needed');
    console.log('3. Test the icons in different browsers and devices');
    console.log('4. Use enhanced logos for branding materials');
    console.log('   - realest-logo-enhanced.png (200x200) - High-quality icon');
    console.log('   - realest-logo-with-text.png (400x120) - Full branding');
    console.log('   - realest-logo-square.png (300x300) - Social media');
  }
}

// Handle command line execution
generateAllIcons().catch((error) => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});

export { convertSvgToPng, generateAllIcons };
