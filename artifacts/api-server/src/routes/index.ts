import { Router, type IRouter } from "express";
import healthRouter from "./health";
import investigationsRouter from "./investigations";
import campaignsRouter from "./campaigns";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(investigationsRouter);
router.use(campaignsRouter);
router.use(dashboardRouter);

export default router;
