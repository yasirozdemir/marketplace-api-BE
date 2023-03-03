import Express from "express";
import createHttpError from "http-errors";
import multer from "multer";
import uniqid from "uniqid";
import { extname } from "path";
import {
  getProducts,
  saveProductsImage,
  writeProducts,
} from "../../lib/fs-tools.js";

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
    res
      .status(201)
      .send({ success: true, message: "Product created!", id: newProduct.id });
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
      res.send({
        success: true,
        message: "Product updated!",
        id: updatedProduct.id,
      });
    } else {
      next(createHttpError(404, `Product with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

// DELETE a single product
productsRouter.delete("/:productId", async (req, res, next) => {
  try {
    const products = await getProducts();
    const remainingProducts = products.filter(
      (p) => p.id !== req.params.productId
    );
    if (products.length !== remainingProducts.length) {
      await writeProducts(remainingProducts);
      res.status(204).send();
    } else {
      next(createHttpError(404, `Product with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

// POST upload an image for a product
productsRouter.post(
  "/:productId/img",
  multer().single("product-img"),
  async (req, res, next) => {
    try {
      const products = await getProducts();
      const index = products.findIndex((p) => p.id === req.params.productId);

      if (index !== -1) {
        const fileExtension = extname(req.file.originalname);
        const fileName = req.params.productId + fileExtension;
        await saveProductsImage(fileName, req.file.buffer);

        products[
          index
        ].imageUrl = `http://localhost:3001/img/products/${fileName}`;
        await writeProducts(products);
        res.status(201).send({
          success: true,
          message: `Cover uploaded to product with id ${req.params.productId}`,
        });
      } else {
        next(
          createHttpError(
            404,
            `Product with id ${req.params.productId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

export default productsRouter;
