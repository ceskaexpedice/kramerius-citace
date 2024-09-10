import express from 'express';
import { getCitation } from './services/citationService';

const app = express();
const port = 3000;

app.get('/citation', getCitation);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
