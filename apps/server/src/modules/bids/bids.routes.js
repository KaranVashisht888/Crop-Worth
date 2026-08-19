import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { requireRole } from "../../middleware/requireRole.js";
import * as controller from "./bids.controller.js";

const router = Router();

router.use(authenticate);

router.get("/mine", requireRole("BUYER"), controller.mine);
router.patch("/:id/accept", requireRole("FARMER"), controller.accept);

export default router;
