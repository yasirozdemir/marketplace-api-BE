import createHttpError from "http-errors";
import { getProducts } from "./fs-tools.js";

export const isProductExisted = async (req, res, next) => {
  const products = await getProducts();
  const specificProduct = products.find((p) => p.id === req.params.productId);
  if (specificProduct) {
    next();
  } else
    next(
      createHttpError(
        404,
        `Review cannot saved! Product with id ${req.params.productId} not found!`
      )
    );
};
