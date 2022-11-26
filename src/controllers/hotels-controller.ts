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
  const { userId } = req;
  const hotelId = Number(req.params.hotelId);
  
  try {
    const hotel = await hotelService.getHotelById(userId, hotelId);
    if(isNaN(hotelId)) {
      return res.sendStatus(httpStatus.BAD_REQUEST);
    }

    return res.status(httpStatus.OK).send(hotel);
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
    if(error.message === "No result for this search!") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
  }
}
