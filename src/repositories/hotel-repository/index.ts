import { prisma } from "@/config";
import { Hotel } from "@prisma/client";

async function findHotels() {
  return prisma.hotel.findMany();
}

const hotelRepository = {
  findHotels
};
  
export default hotelRepository;
