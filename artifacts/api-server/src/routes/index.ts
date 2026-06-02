import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import coursesRouter from "./courses";
import enrollmentsRouter from "./enrollments";
import enquiriesRouter from "./enquiries";
import liveClassesRouter from "./live-classes";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(coursesRouter);
router.use(enrollmentsRouter);
router.use(enquiriesRouter);
router.use(liveClassesRouter);
router.use(dashboardRouter);

export default router;
