import faker from "@faker-js/faker";
import { prisma } from "@/config";
import { Room } from "@prisma/client";

export async function createHotel() {
  return prisma.hotel.create({
    data: {
      name: faker.company.companyName(),
      image: faker.image.business(),
    },
  });
}

export async function createRooms(hotelId: number) {
  await prisma.room.createMany({
    data: [
      { name: "101", capacity: 2, hotelId },
      { name: "102", capacity: 4, hotelId },
      { name: "103", capacity: 2, hotelId },
    ]
  });
  return prisma.room.findMany();
}
