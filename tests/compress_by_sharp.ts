import sharp from "sharp";
import fs from "fs";

async function findOptimalCompression(inputPath: string, outputDir: string) {
  const colorCounts = [4,8,12,16];
  let bestResult = { colors: 256, size: Infinity, path: '' };
  
  for (const colors of colorCounts) {
    const outputPath = `${outputDir}/colors-${colors}.png`;
    
    await sharp(inputPath)
      .png({
        palette: true,
        colours: colors,
        compressionLevel: 9,
        adaptiveFiltering: true,
        dither: 1.0,
        force: true
      })
      .withMetadata({})
      .toFile(outputPath);
    
    const stats = fs.statSync(outputPath);
    console.log(`${colors} colors: ${(stats.size/1024).toFixed(2)} KB`);
    
    if (stats.size < bestResult.size) {
      bestResult = { colors, size: stats.size, path: outputPath };
    }
  }
  
  console.log(`\n🎯 Best config: ${bestResult.colors} colors, ${(bestResult.size/1024).toFixed(2)} KB`);
  return bestResult;
}

await findOptimalCompression("screenshot.png", "compressed-optimal");