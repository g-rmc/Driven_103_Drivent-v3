import { Request, Response } from "express";
import httpStatus from "http-status";
import { AuthenticatedRequest } from "@/middlewares";
import hotelService from "@/services/hotels-service";

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const hotels = await hotelService.getHotels(userId);

    return res.status(httpStatus.OK).send(hotels);
  } catch (error) {
    if(
      error.message === "enrollment not found" ||
      error.message === "ticket not found" ||
      error.message === "ticket doesnt have hotel"
    ) {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }
    if(error.message === "ticket not payed") {
      return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    }
  }
}

export async function getHotelById(req: AuthenticatedRequest, res: Response) {
  try {
    return res.sendStatus(httpStatus.OK);
  } catch (error) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}
