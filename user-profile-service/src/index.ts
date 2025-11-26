import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import profileRoutes from './routes/profile';
import { authenticateToken } from './middleware/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint (no auth required)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'user-profile-service' });
});

// Protected routes - require JWT authentication
app.use('/profile', authenticateToken, profileRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`User Profile Service running on port ${PORT}`);
  console.log(`Keycloak URL: ${process.env.KEYCLOAK_URL}`);
  console.log(`Keycloak Realm: ${process.env.KEYCLOAK_REALM}`);
});

