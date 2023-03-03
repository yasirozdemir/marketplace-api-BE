import Express from "express";
import listEndpoints from "express-list-endpoints";
import productsRouter from "./api/products/index.js";
import reviewsRouter from "./api/reviews/index.js";
import {
  badRequestHandler,
  genericErrorHandler,
  notFoundHandler,
  unauthorizedHandler,
} from "./errorHandlers.js";
import { publicFolderPath } from "./lib/fs-tools.js";

const server = Express();
const port = 3001;

server.use(Express.static(publicFolderPath));
server.use(Express.json());

server.use("/products", productsRouter);
server.use("/products", reviewsRouter);

server.use(badRequestHandler);
server.use(unauthorizedHandler);
server.use(notFoundHandler);
server.use(genericErrorHandler);

server.listen(port, () => {
  console.table(listEndpoints(server));
  // console.log("Server running on port", port);
});
