import express from 'express';
import cors from 'cors';
import { getCitation } from './services/citationService';
import { testEndpoint } from './test/testService';

const app = express();
const port = 3000;

app.use(cors({
  origin: '*',
  methods: ['GET']
}));

app.get('/citation', getCitation);
app.get('/test', testEndpoint);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.get('/', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Citation API</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
        }
        header, footer {
          background-color: #f8f9fa;
          padding: 10px;
          text-align: center;
        }
        h1 {
          color: #333;
        }
        a {
          color: #007bff;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <header>
        <h1>Welcome to the Citation API</h1>
      </header>

      <main>
        <h2>Citation API Documentation</h2>
        <p>See the <a href="https://github.com/trineracz/citation-api">GitHub repository</a>. Or try the <code>/citation</code> endpoint, for example:</p>
        <p><a href="${baseUrl}/citation?uuid=uuid:869e4730-6c8b-11e2-8ed6-005056827e52&form=html&lang=cs">
          ${baseUrl}/citation?uuid=uuid:869e4730-6c8b-11e2-8ed6-005056827e52&form=html&lang=cs
        </a></p>
      </main>

      <footer>
        <p>Developed by <a href="https://www.trinera.cz/" target="_blank">Trinera s. r. o.</a> in 2024</p>
      </footer>
    </body>
    </html>
  `);
});