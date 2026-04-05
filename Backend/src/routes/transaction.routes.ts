import express from "express";
import * as authmiddleware from "../middleware/auth.middleware";
import * as transactionController from "../controllers/transaction.controller";
import * as systemUserMiddleware from "../middleware/systemUserAuth.middleware";
const trasactionRouter = express.Router();

trasactionRouter.post("/create", authmiddleware.authenticate, transactionController.createTransaction );

/**
 * transaction initial amount from system user
 */
trasactionRouter.post("/initial", systemUserMiddleware.authenticateSystemUser, transactionController.createInitialTransaction );
export default trasactionRouter;