import Express from "express";
import createHttpError from "http-errors";
import multer from "multer";
import uniqid from "uniqid";
import { extname } from "path";

const productsRouter = Express.Router();

export default productsRouter;
