import express from "express";
import * as accountController from "../controllers/account.controller";
import * as authmiddleware from "../middleware/auth.middleware";
const router = express.Router();


/** 
 * * Create a new account for the authenticated user
 * * POST /api/accounts
 */

router.post("/createAccount", authmiddleware.authenticate, accountController.createAccount);

/** 
 * /Get /api/accounts/allAccounts
 * Get all accounts of the authenticated user
 */
router.get("/allAccounts", authmiddleware.authenticate, accountController.getUserAccounts );

/**
 * * Get account balance details by account ID
 * * GET /api/accounts/:accountId
 */
router.get("/:accountId", authmiddleware.authenticate, accountController.getAccountDetailsById);

export default router;