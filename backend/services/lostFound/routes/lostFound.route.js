import { Router } from "express";
import { createReport, getUserMatches, openMatchChat, getMyReports, confirmReturn, rejectMatch } from "../controllers/lostFound.controller.js";

const router = Router();

router.post("/report", createReport);
router.get("/matches", getUserMatches);
router.post("/matches/:matchId/chat", openMatchChat);
router.post("/matches/:matchId/confirm-return", confirmReturn);
router.post("/matches/:matchId/reject", rejectMatch);
router.get("/my-reports", getMyReports);

export default router;
