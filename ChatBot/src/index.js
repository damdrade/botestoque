import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Serve static files from the uploads directory
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/uploads', express.static('uploads'));

// Serve the HTML form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Handle file upload
app.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  //const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  //res.json({ imageUrl });

  const imageUrl = req.file.path;

  const resposta = await fetch('http://localhost:5000/processar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imagem: imageUrl })
});

    const resultado = await resposta.json();
    res.send(`<pre>${resultado.resposta}</pre>`);
});


// Create uploads directory if it doesn't exist
import { mkdir } from 'fs/promises';
mkdir('uploads').catch(() => {});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});