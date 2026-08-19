import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { requireRole } from "../../middleware/requireRole.js";
import { upload } from "../../config/upload.js";
import { validateCreateListing, validateUpdateListing } from "./listings.validators.js";
import * as controller from "./listings.controller.js";
import * as bidsController from "../bids/bids.controller.js";
import { validatePlaceBid } from "../bids/bids.validators.js";

const router = Router();

router.use(authenticate);

router.get("/", controller.list);
router.get("/:id", controller.getOne);
router.post("/", requireRole("FARMER"), validateCreateListing, controller.create);
router.patch("/:id", requireRole("FARMER"), validateUpdateListing, controller.update);
router.delete("/:id", requireRole("FARMER"), controller.remove);
router.post("/:id/photo", requireRole("FARMER"), upload.single("photo"), controller.uploadPhoto);

router.post("/:id/bids", requireRole("BUYER"), validatePlaceBid, bidsController.place);
router.get("/:id/bids", bidsController.listForListing);

export default router;
