import fs from 'fs';
import express from 'express';
import cors from 'cors';
import { getCitation } from './services/citationService';
import { testEndpoint } from './test/testService';
import swaggerUi from 'swagger-ui-express';

const app = express();
const port = 3000;

app.use(cors({
  origin: '*',
  methods: ['GET']
}));

const config = {
  //TODO: use actual config, possibly from environment variables

  //dev
  //version : '1.1.2',
  //production_build: false,
  //documentation_api_base_url: 'http://localhost:3000/'

  //prod
  version : '1.1.2',
  production_build: true,
  documentation_api_base_url: 'https://citace.osdd.mzk.cz/'
}

function initSwagger() { // API documentation
  //const swaggerDocument = YAML.load('./openapi-src/api.yaml');
  const swaggerDocument = JSON.parse(fs.readFileSync('./openapi.json', 'utf8'));

  swaggerDocument.servers = [
    {
      url: config.documentation_api_base_url,
      description: config.production_build ? 'Production server' : 'Development server'
    }
  ];
  swaggerDocument.info.version = config.version;
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

initSwagger();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.get('/citation', getCitation);
app.get('/test', testEndpoint);

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
        <p>Version ${config.version}</p>
        <p>See the <a href="https://github.com/trineracz/citation-api">GitHub repository</a> or <a href="${baseUrl}/api-docs">API documentation</a>.
        <p>Or try the <code>/citation</code> endpoint, for example:</p>
        <p><a href="${baseUrl}/citation?url=https://api.kramerius.mzk.cz&uuid=uuid:869e4730-6c8b-11e2-8ed6-005056827e52&format=html&lang=cs">
          ${baseUrl}/citation?url=https://api.kramerius.mzk.cz&uuid=uuid:869e4730-6c8b-11e2-8ed6-005056827e52&format=html&lang=cs
        </a></p>
      </main>

      <footer>
        <p>Developed by <a href="https://www.trinera.cz/" target="_blank">Trinera s. r. o.</a> in 2024</p>
      </footer>
    </body>
    </html>
  `);
});