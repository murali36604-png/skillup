import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import coursesRouter from "./courses";
import enrollmentsRouter from "./enrollments";
import enquiriesRouter from "./enquiries";
import liveClassesRouter from "./live-classes";
import dashboardRouter from "./dashboard";
import freelancerRouter from "./freelancer";
import projectsRouter from "./projects";
import messagesRouter from "./messages";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(coursesRouter);
router.use(enrollmentsRouter);
router.use(enquiriesRouter);
router.use(liveClassesRouter);
router.use(dashboardRouter);
router.use(freelancerRouter);
router.use(projectsRouter);
router.use(messagesRouter);

export default router;
