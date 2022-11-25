import faker from "@faker-js/faker";
import { prisma } from "@/config";

export async function createHotel() {
  const result = await prisma.hotel.create({
    data: {
      name: faker.company.companyName(),
      image: faker.image.business(),
    },
  });

  await prisma.room.createMany({
    data: [
      { name: "101", capacity: 2, hotelId: result.id },
      { name: "102", capacity: 4, hotelId: result.id },
      { name: "103", capacity: 2, hotelId: result.id },
    ]
  });

  return result;
}

