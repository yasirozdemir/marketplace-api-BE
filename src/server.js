import Express from "express";
import listEndpoints from "express-list-endpoints";
import productsRouter from "./api/products/index.js";
import { publicFolderPath } from "./lib/fs-tools.js";

const server = Express();
const port = 3001;

server.use(Express.static(publicFolderPath));
server.use(Express.json());

server.use("/products", productsRouter);

server.listen(port, () => {
  console.log(listEndpoints(server));
  console.log("Server running on port", port);
});
