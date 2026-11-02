import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";

dotenv.config();

const app = express();

app.use(cors({
    origin: "http://localhost:5173"
}));

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);

// Connect MongoDB
connectDB();

// Test route
app.get("/", (req, res) => {
    res.send("FinTrack Backend is Running!");
});

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "FinTrack API is working!"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});