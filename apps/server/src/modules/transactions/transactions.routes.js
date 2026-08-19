import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { validateResolveTransaction } from "./transactions.validators.js";
import * as controller from "./transactions.controller.js";

const router = Router();

router.use(authenticate);

router.get("/mine", controller.mine);
router.patch("/:id/complete", validateResolveTransaction, controller.resolve);

export default router;
