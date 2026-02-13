import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { chatWithModel } from "./controllers/chatController";
import path from "path";
import adminRoutes from "./routes/adminRoutes";
import docsRoutes from "./routes/docRoutes";
import modelRoutes from "./routes/modelRoutes";

dotenv.config();
const app = express();
const upload = multer({ dest: "src/uploads/" });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "static")));
``;

app.use("/", express.static(path.join(__dirname, "static")));

// Endpoint
app.post("/api/chat", chatWithModel);
app.use("/api/admins", adminRoutes);
app.use("/api/documents", docsRoutes);
app.use("/api/models", modelRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(` CodeTribe Backend running on port ${PORT}`),
);
