import app from "./app";
import config from "./config/config";

const PORT = config.PORT;

app.httpServer.listen(PORT, () => {
  console.log(`Server is Running on PORT ${PORT}`);
});
