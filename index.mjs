import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import ProgressStream from 'progress-stream';
import videoUrls from './urls.json' assert { type: 'json' };

const outputDirectory = './videos';

const downloadVideo = async (url, outputPath) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch video from ${url}`);

    const totalBytes = response.headers.get('content-length');
    console.log(`Fetching video from ${url} | Total size: ${totalBytes} bytes`);

    const progress = ProgressStream({
      length: totalBytes,
      time: 5000
    });

    progress.on('progress', function (progressData) {
      const percentage = progressData.percentage.toFixed(2);
      // console.log(`Progress: ${percentage}% (${progressData.transferred} of ${progressData.length} bytes)`);
      console.log(`Progress: ${percentage}%`);
    });

    const fileStream = fs.createWriteStream(outputPath);

    // Pipe the response through the progress stream and into the file
    response.body.pipe(progress).pipe(fileStream);

    // Return a promise that resolves when the file is done writing
    await new Promise((resolve, reject) => {
      fileStream.on('finish', resolve);
      fileStream.on('error', reject);
    });

    console.log(`Download completed: ${outputPath}`);
  } catch (error) {
    console.error(`Error downloading video:`, error);
  }
}

const downloadVideos = async (urls, outputDir) => {
  try {
    urls.length > 0 ? (async () => {
      for (let i = 0; i < urls.length; i++) {
        const fileName = `file_${i}`;
        const outputPath = path.join(outputDir, fileName);
        await downloadVideo(urls[i], outputPath);
      }
    })() : console.log("Error: Please insert urls in urls.json");
  } catch (error) {
    console.log("Error: ", error);
  }
}

if (!fs.existsSync(outputDirectory)) {
  fs.mkdirSync(outputDirectory, { recursive: true });
}

downloadVideos(videoUrls, outputDirectory);
