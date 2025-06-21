import app from "./app.ts";
import config from "./config/config.ts";

const PORT = config.PORT;

app.get("/", (_req, res) => {
  res.send("<h1>Hello JS</h1>");
});

app.listen(PORT, () => {
  console.log(`Server is Running on PORT ${PORT}`);
});
