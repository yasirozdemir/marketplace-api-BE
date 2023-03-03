import Express from "express";
import createHttpError from "http-errors";
import uniqid from "uniqid";
import { getReviews, writeReviews } from "../../lib/fs-tools.js";
import { checkReviewSchema, triggerBadRequest } from "../validation.js";
import { isProductExisted } from "../../lib/middlewares.js";

const reviewsRouter = Express.Router();

// POST a review on a product
reviewsRouter.post(
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
reviewsRouter.get(
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
reviewsRouter.get(
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
reviewsRouter.put(
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
reviewsRouter.delete(
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

export default reviewsRouter;
