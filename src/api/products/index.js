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

// GET single product
productsRouter.get("/:productId", async (req, res, next) => {
  try {
    const products = await getProducts();
    const specificProduct = products.find((p) => p.id === req.params.productId);
    if (specificProduct) {
      res.send(specificProduct);
    } else {
      next(createHttpError(404, `Product with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

// PUT update a single product
productsRouter.put("/:productId", async (req, res, next) => {
  try {
    const products = await getProducts();
    const index = products.findIndex((p) => p.id === req.params.productId);
    if (index !== -1) {
      const updatedProduct = {
        ...products[index],
        ...req.body,
        updatedAt: new Date(),
      };
      products[index] = updatedProduct;
      await writeProducts(products);
      res.send({ message: "Product updated!", id: updatedProduct.id });
    } else {
      next(createHttpError(404, `Product with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

export default productsRouter;
