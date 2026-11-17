import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import routes from './app/routes';

const app: Application = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Note: express-http-proxy works best when body-parser does not consume request stream
// prior to proxy routes, or handles it per-route if needed.
app.use(routes);

// 404 handler for unmatched routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl} on Gateway`,
  });
});

export default app;
