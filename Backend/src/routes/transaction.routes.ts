import express from "express";
import * as authmiddleware from "../middleware/auth.middleware";
import * as transactionController from "../controllers/transaction.controller";
const trasactionRouter = express.Router();

trasactionRouter.post("/", authmiddleware.authenticate, transactionController.createTransaction );

export default trasactionRouter;