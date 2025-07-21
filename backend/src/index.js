import express from 'express';
import dotenv from 'dotenv';
import fileUpload from 'express-fileupload'; // Import express-fileupload for handling file uploads
import path from 'path'; // Import path for handling file paths
import cors from 'cors'
import { connectDB } from './lib/db.js'; // Import the database connection function
import { clerkMiddleware } from '@clerk/express'; // Import Clerk middleware for authentication
// Import routes
import userRoutes from './routes/user.route.js';
import { createServer } from 'http'; // Import createServer to create an HTTP server
import cron from 'node-cron'; // Import cron for scheduling tasks
import fs from 'fs'; // Import fs for file system operations
import { initializeSocket } from './lib/socket.js'; // Import the socket initialization function
// Load environment variables from .env file
import adminRoutes from './routes/admin.route.js';
import authRoutes from './routes/auth.route.js';
import songRoutes from './routes/song.route.js';
import statRoutes from './routes/stat.route.js';
import albumRoutes from './routes/album.route.js';


dotenv.config();

const app = express();
const __dirname = path.resolve(); // Get the current directory name
const PORT = process.env.PORT || 5000;

const httpServer = createServer(app); // Create an HTTP server using the Express app
initializeSocket(httpServer);

app.use(cors({
  origin:'http://localhost:3000', // Allow requests from the client URL
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
})); // Enable CORS for all routes

app.use(express.json()); // Middleware to parse JSON bodies
app.use(clerkMiddleware()); // Use Clerk middleware for authentication
app.use(fileUpload({
  useTempFiles: true, // Use temporary files for uploads
  tempFileDir: path.join(__dirname, "tmp"), // Directory to store temporary files
  createParentPath: true, // Create parent directories if they don't exist
  limits: { fileSize: 10 * 1024 * 1024 } // Limit file size to 10MB
}))

const tempDir = path.join(process.cwd(), 'tmp');
cron.schedule('0 * * * *', () => {
  if (fs.existsSync(tempDir)) {
    fs.readdir(tempDir, (err, files) => {
      if (err) {
        console.log('error', err);
        return;
      }
      for (const file of files) {
        fs.unlink(path.join(tempDir, file), (err) => {});
      }
    });
  }
});

app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/albums", albumRoutes);
// Adding the statRoutes to handle statistics related requests
app.use("/api/albums", statRoutes);

if(process.env.NODE_ENV === 'production') {
  // Serve static files from the React app
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  // Handle any requests that don't match the above routes with the React app
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
  });
}

app.use((err, req, res, next) => {
  res.status(500).json({ message: process.env.NODE_ENV === 'production' ? err.message : 'Internal Server Error' });
});



httpServer.listen(PORT, () => {
  console.log('Server is running on port ', PORT);
  connectDB(); // Ensure the database connection is established
});