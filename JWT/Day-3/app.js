import express from "express";
import router from "./routes/authRoutes.js";

const app = express();
app.use(express.json());
app.use("/api", router);

app.get("/", (req, res) => {
  res.send({
    message: "API is Working",
  });
});

export default app;
