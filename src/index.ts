import express from 'express';
import { getCitation } from './services/citationService';
import { testEndpoint } from './test/testService';

const app = express();
const port = 3000;

app.get('/citation', getCitation);
app.get('/test', testEndpoint);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
