import express, {response} from "express";
import logger from "morgan";

// TODO #2: Create an Express app.
const app = express();
const port = process.env.PORT || 5500;

// TODO #3: Add middleware to the Express app.
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger('dev'));
app.use('/', express.static('client'));

// This matches all routes that are not defined.
app.all('*', async (request, response) => {
  response.status(404).send(`Not found: ${request.path}`);
});

// Start the server.
app.listen(port, () => {
  const msg = `Server started on http://localhost:${port}`;
  console.log(msg);
});
