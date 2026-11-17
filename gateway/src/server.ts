import app from './app';
import { config } from './app/config';

const server = app.listen(config.port, () => {
  console.log(`[Gateway] Running on http://localhost:${config.port}`);
  console.log(`[Gateway] Registered Service Routes:`);
  console.log(`  - Auth:    /api/v1/auth    -> ${config.services.auth}`);
  console.log(`  - Chat:    /api/v1/chat    -> ${config.services.chat}`);
  console.log(`  - Agents:  /api/v1/agents  -> ${config.services.agents}`);
  console.log(`  - Billing: /api/v1/billing -> ${config.services.billing}`);
});

export default server;
