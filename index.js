const express = require("express");
const { Borgen, Logger } = require("borgen");
const { subscribeTicks, getActiveSymbols } = require("./getTick.js");

const app = express();
app.use(Borgen({}));

app.listen(7009, () => {
  subscribeTicks();
  getActiveSymbols()
  Logger.info({ message: "The server is listening on port 7009" });
});
