import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import katalogRoutes from "./routes/katalogRoute.js";
import peminjamanRoutes from "./routes/peminjamanRoute.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

//routes
app.use("/api/katalog", katalogRoutes);
app.use("/api/peminjaman", peminjamanRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
