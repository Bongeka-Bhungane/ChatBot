import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { chatWithModel } from "./controllers/chatController";
import path from "path";
import adminRoutes from "./routes/adminRoutes";
import docsRoutes from "./routes/docRoutes";

dotenv.config();
const app = express();
const upload = multer({ dest: "src/uploads/" });

app.use(cors());
app.use(express.json());

// Endpoint
app.post("/api/chat", chatWithModel);
app.use("/api/admins", adminRoutes);
app.use("/api/documents", docsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(` CodeTribe Backend running on port ${PORT}`),
);
