import fs from "fs-extra";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const { readJSON, writeJSON, writeFile } = fs;

export const publicFolderPath = join(process.cwd(), "public");
export const dataFolderPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../data"
);

export const productsJSONPath = join(dataFolderPath, "products.json");
export const productsPublicPath = join(publicFolderPath, "img/products");

export const reviewsJSONPath = join(dataFolderPath, "reviews.json");
console.log(reviewsJSONPath);

export const getProducts = () => readJSON(productsJSONPath);
export const writeProducts = (products) =>
  writeJSON(productsJSONPath, products);

export const getReviews = () => readJSON(reviewsJSONPath);
export const writeReviews = (reviews) => writeJSON(reviewsJSONPath, reviews);

export const saveProductsImage = (fileName, fileContentAsBuffer) =>
  writeFile(join(productsPublicPath, fileName), fileContentAsBuffer);
