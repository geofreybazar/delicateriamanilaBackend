import app from "./app";
import config from "./config/config";

const PORT = config.PORT;

app.get("/", (_req, res) => {
  res.send("<h1>Hello JS</h1>");
});

app.listen(PORT, () => {
  console.log(`Server is Running on PORT ${PORT}`);
});
