const express = require('express');
const cors = require('cors');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const path = require('path');
const fs = require('fs');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// Health check route
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Process video route
app.post('/process', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No video file provided' });
  }

  const inputPath = req.file.path;
  const outputPath = path.join('uploads', `processed-video-${Date.now()}.mp4`);

  ffmpeg(inputPath)
    .videoFilters([
      { filter: 'scale', options: 'trunc(iw*1.05/2)*2:trunc(ih*1.05/2)*2' },
      'eq=brightness=0.015',
      'noise=alls=20:allf=t'
    ])
    .outputOptions([
      '-c:v libx264',
      '-c:a aac',
      '-movflags +faststart'
    ])
    .on('end', () => {
      res.download(outputPath, 'processed-video.mp4', (err) => {
        // Cleanup uploaded and processed files
        fs.unlink(inputPath, () => {});
        fs.unlink(outputPath, () => {});
      });
    })
    .on('error', (err) => {
      console.error('FFmpeg processing error:', err);
      fs.unlink(inputPath, () => {});
      if (fs.existsSync(outputPath)) {
        fs.unlink(outputPath, () => {});
      }
      res.status(500).json({ error: 'Conversion failed' });
    })
    .save(outputPath);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
