import Express from "express";
import createHttpError from "http-errors";
import multer from "multer";
import uniqid from "uniqid";
import { extname } from "path";
import { getProducts, writeProducts } from "../../lib/fs-tools.js";

const productsRouter = Express.Router();

// POST a product
productsRouter.post("/", async (req, res, next) => {
  try {
    const products = await getProducts();
    const newProduct = {
      ...req.body,
      id: uniqid(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    products.push(newProduct);
    await writeProducts(products);
    res.status(201).send({ message: "Product created!", id: newProduct.id });
  } catch (error) {
    next(error);
  }
});

// GET all products
productsRouter.get("/", async (req, res, next) => {
  try {
    const products = await getProducts();
    res.send(products);
  } catch (error) {
    next(error);
  }
});

export default productsRouter;
