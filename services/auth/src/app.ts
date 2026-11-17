import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import routes from './app/routes';

const app: Application = express();

// Configure isolated EJS view engine for auth testing
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, '../views'));

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl} on Auth Service`,
  });
});

export default app;
