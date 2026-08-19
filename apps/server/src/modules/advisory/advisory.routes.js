import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { list } from "./advisory.controller.js";

const router = Router();

router.use(authenticate);
router.get("/", list);

export default router;
