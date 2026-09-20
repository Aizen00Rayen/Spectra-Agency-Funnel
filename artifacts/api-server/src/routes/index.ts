import { Router, type IRouter } from "express";
import healthRouter from "./health";
import crmRouter from "./crm";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(crmRouter);
router.use(storageRouter);

export default router;
