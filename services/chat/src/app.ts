import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import routes from './app/routes';

const app: Application = express();

// Universal CORS handler for all origins (localhost:3000, 4000, etc.)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie, x-user-id, x-user-role, x-user-email'
  );
  res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie, set-auth-token, x-user-id');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl} on Chat Service`,
  });
});

export default app;
