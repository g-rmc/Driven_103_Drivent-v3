import { conflictError, notFoundError } from "@/errors";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import hotelRepository from "@/repositories/hotel-repository";

async function validateTicket(userId: number) {
  const validTicket = { valid: false, error: conflictError("") };

  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if(!enrollment) {
    validTicket.error = conflictError("enrollment not found");
    return validTicket;
  }

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if(!ticket) {
    validTicket.error = conflictError("ticket not found");
    return validTicket;
  }
  if(!ticket.TicketType.includesHotel) {
    validTicket.error = conflictError("ticket doesnt have hotel");
    return validTicket;
  }

  if(ticket.status !== "PAID") {
    validTicket.error = conflictError("ticket not payed");
    return validTicket;
  }

  validTicket.valid = true;
  return validTicket;
}

async function getHotels(userId: number) {
  const validTicket = await validateTicket(userId);
  if(!validTicket.valid) {
    throw validTicket.error;
  }
  
  const hotels = await hotelRepository.findHotels();
  if (!hotels) {
    throw notFoundError();
  }

  return hotels;
}

async function getHotelById(userId: number, hotelId: number) {
  const validTicket = await validateTicket(userId);
  if(!validTicket.valid) {
    throw validTicket.error;
  }

  const hotel = await hotelRepository.findHotelById(hotelId);
  if(!hotel) {
    throw notFoundError();
  }
  return hotel;
}

const hotelService = {
  getHotels,
  getHotelById
};
  
export default hotelService;
