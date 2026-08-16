import { Router } from "express";
import { searchMentor } from "../controllers/mentor.controller.js";

const router = Router();

router.get("/search", searchMentor);
router.post("/search", searchMentor);

export default router;
