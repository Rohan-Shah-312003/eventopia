import { Router } from "express";
import { createEvent, getEvents } from "../controllers/event.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authMiddleware(["club"]), createEvent);
router.get("/", getEvents);

export default router;
