/* eslint-disable @typescript-eslint/no-require-imports */
const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer();
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("patient:update", (data) => {
      const payload = { ...data, lastUpdated: new Date().toISOString() };
      io.emit("patient:update", payload);
    });

    socket.on("join:staff", () => {
        socket.join("staff");
    });

    socket.on("disconnect", () => {
        // console.log("Client disconnected:", socket.id);
    });
  });

  httpServer.on("request", (req, res) => {
    if (req.url.startsWith("/socket.io")) {
        return;
    }
    handle(req, res);
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
