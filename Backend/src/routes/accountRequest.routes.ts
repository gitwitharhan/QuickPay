import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  createRequest,
  getMyRequests,
  getAllRequests,
  reviewRequest,
} from "../controllers/accountRequest.controller";

const router = Router();

// Regular User routes
router.post("/create", authenticate, createRequest);
router.get("/my", authenticate, getMyRequests);

// System User routes
router.get("/all", authenticate, getAllRequests);
router.post("/review/:requestId", authenticate, reviewRequest);

export default router;
