import express from 'express' ;
import { getDashboardStatsController, getDashboardStatsDirectController } from './dash.controller';
const router = express.Router();


router.get('/stats', getDashboardStatsController);
// Alternative route using direct controller
router.get('/stats/direct', getDashboardStatsDirectController);

export default router ;