import { Router } from "express";
import { searchQuestion, downloadQuestion } from "../controller/qBank.controller.js";
const router = Router();

router.post('/search', searchQuestion);
router.get('/files/:id', downloadQuestion);


export default router;