"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dash_controller_1 = require("./dash.controller");
const router = express_1.default.Router();
router.get('/stats', dash_controller_1.getDashboardStatsController);
// Alternative route using direct controller
router.get('/stats/direct', dash_controller_1.getDashboardStatsDirectController);
exports.default = router;
