import Express from "express";
import createHttpError from "http-errors";
import multer from "multer";
import uniqid from "uniqid";
import { extname } from "path";
import {
  getProducts,
  getReviews,
  saveProductsImage,
  writeProducts,
  writeReviews,
} from "../../lib/fs-tools.js";
import {
  checkProductSchema,
  checkReviewSchema,
  triggerBadRequest,
} from "../validation.js";
import { isProductExisted } from "../../lib/middlewares.js";

const productsRouter = Express.Router();

// POST a product
productsRouter.post(
  "/",
  checkProductSchema,
  triggerBadRequest,
  async (req, res, next) => {
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
      res.status(201).send({
        success: true,
        message: "Product created!",
        id: newProduct.id,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET products by category
productsRouter.get("/", async (req, res, next) => {
  try {
    const products = await getProducts();
    if (req.query && req.query.category) {
      const productsByCategory = products.filter(
        (p) => p.category.toLowerCase() === req.query.category.toLowerCase()
      );
      res.send(productsByCategory);
    } else {
      res.send(products);
    }
  } catch (error) {
    next(error);
  }
});

// GET single product
productsRouter.get("/:productId", isProductExisted, async (req, res, next) => {
  try {
    const products = await getProducts();
    const specificProduct = products.find((p) => p.id === req.params.productId);
    res.send(specificProduct);
  } catch (error) {
    next(error);
  }
});

// PUT update a single product
productsRouter.put(
  "/:productId",
  checkProductSchema,
  triggerBadRequest,
  async (req, res, next) => {
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
        next(
          createHttpError(404, `Product with id ${req.params.id} not found!`)
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

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

// POST a review on a product
productsRouter.post(
  "/:productId/reviews",
  checkReviewSchema,
  triggerBadRequest,
  isProductExisted,
  async (req, res, next) => {
    try {
      const reviews = await getReviews();
      const newReview = {
        ...req.body,
        id: uniqid(),
        createdAt: new Date(),
        updatedAt: new Date(),
        productId: req.params.productId,
        rate: 3,
      };
      reviews.push(newReview);
      await writeReviews(reviews);
      res.status(201).send({
        success: true,
        message: "Review saved!",
        id: newReview.id,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET all reviews of a product
productsRouter.get(
  "/:productId/reviews",
  isProductExisted,
  async (req, res, next) => {
    try {
      const reviews = await getReviews();
      res.status(201).send(reviews);
    } catch (error) {
      next(error);
    }
  }
);

// GET a single review
productsRouter.get(
  "/:productId/reviews/:reviewId",
  isProductExisted,
  async (req, res, next) => {
    try {
      const reviews = await getReviews();
      const specificReview = reviews.find((r) => r.id === req.params.reviewId);
      if (specificReview) {
        res.send(specificReview);
      } else {
        next(
          createHttpError(
            404,
            `Review with id ${req.params.reviewId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

// PUT update a single comment
productsRouter.put(
  "/:productId/reviews/:reviewId",
  checkReviewSchema,
  triggerBadRequest,
  isProductExisted,
  async (req, res, next) => {
    try {
      const reviews = await getReviews();
      const index = reviews.findIndex((p) => p.id === req.params.reviewId);
      if (index !== -1) {
        const updatedReview = {
          ...reviews[index],
          ...req.body,
          updatedAt: new Date(),
        };
        reviews[index] = updatedReview;
        await writeReviews(reviews);
        res.send({
          success: true,
          message: "Review updated!",
          id: updatedReview.id,
        });
      } else {
        next(
          createHttpError(
            404,
            `Review with id ${req.params.reviewId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

// DELETE a single review
productsRouter.delete(
  "/:productId/reviews/:reviewId",
  isProductExisted,
  async (req, res, next) => {
    try {
      const reviews = await getReviews();
      const remainingReviews = reviews.filter(
        (r) => r.id !== req.params.reviewId
      );
      if (reviews.length !== remainingReviews.length) {
        await writeReviews(remainingReviews);
        res.status(204).send();
      } else {
        next(
          createHttpError(
            404,
            `Review with id ${req.params.reviewId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

export default productsRouter;
