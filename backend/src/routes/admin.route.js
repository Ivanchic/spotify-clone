import { Router} from "express";
import { createSong, deleteSong, deleteAlbum, createAlbum, checkAdmin } from "../controller/admin.controller.js";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";
// Import necessary controllers and middleware

const router = Router();

router.use(protectRoute, requireAdmin); // Apply protectRoute and requireAdmin middleware to all routes in this router

router.get("/check", checkAdmin);

router.post("/songs", createSong);
router.delete("/songs/:id", deleteSong);
router.post("/albums", createAlbum);
router.delete("/albums/:id", deleteAlbum);


export default router;