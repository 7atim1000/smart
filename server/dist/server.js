"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
require("colors");
const db_1 = __importDefault(require("./config/db"));
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
app.use(express_1.default.json({ limit: "4mb" }));
app.use((0, cors_1.default)({
    origin: "*",
    credentials: true,
}));
app.get('/', (req, res) => res.send("Server is running"));
app.use('/v1/api/', routes_1.default);
(0, db_1.default)();
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`.bgBlue);
});
