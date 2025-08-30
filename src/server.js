import express from "express";
import bodyParser from "body-parser";
import broadcastRoutes from "./routes/broadcastRoutes.js";

const app = express();
app.use(bodyParser.json());

app.use("/api", broadcastRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
