import { Router } from "express";
import { createRoom, joinRoom } from "../controllers/roomController.js";

const router = Router();

router.post("/", createRoom);
router.post("/:code/", joinRoom);
export default router;
