import { Router } from "express";
import { getHotels, getHotelById } from "@/controllers";

const hotelsRouter = Router();

hotelsRouter.get("/", getHotels);
hotelsRouter.get("/:id", getHotelById);

export { hotelsRouter };
