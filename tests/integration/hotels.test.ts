import supertest from "supertest";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import faker from "@faker-js/faker";

import app, { init } from "@/app";
import { prisma } from "@/config";
import { cleanDb, generateValidToken } from "../helpers";
import { createUser, createTicketType, createTicket, createHotel, createEnrollmentWithAddress, createRooms } from "../factories";
import { TicketStatus } from "@prisma/client";

beforeAll(async () => {
  await init();
});
  
beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /hotels", () => {
  it("should respond with status 401 if not token is given", async () => {
    const response = await server.get("/hotels");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/hotels").set("Authorization", token);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 403 if user doesnt have a ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      
      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 if ticket doesnt have hotel included", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, false);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      
      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 402 if ticket with hotel not payed", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      
      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    describe("when ticket is valid", () => {
      it("should respond with status 200 and empty array if no hotel created", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketType(false, true);
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        
        const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
   
        expect(response.status).toBe(httpStatus.OK);
        expect(response.body).toEqual([]);
      });

      it("should respond with status 200 and hotels list", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketType(false, true);
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        
        const hotel = await createHotel();

        const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
   
        expect(response.status).toBe(httpStatus.OK);
        expect(response.body).toEqual([{
          ...hotel,
          createdAt: hotel.createdAt.toISOString(),
          updatedAt: hotel.updatedAt.toISOString(),
        }]);
      });
    });
  });
});

describe("GET /hotels/:hotelId", () => {
  it("should respond with status 401 if not token is given", async () => {
    const response = await server.get("/hotels/1");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/hotels/1").set("Authorization", token);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
    const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 403 if user doesnt have a ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      
      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 if ticket doesnt have hotel included", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, false);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      
      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 402 if ticket with hotel not payed", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      
      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    describe("when ticket is valid", () => {
      it("should respond with status 400 if invalid hotel id", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketType(false, true);
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        
        const response = await server.get("/hotels/a").set("Authorization", `Bearer ${token}`);
 
        expect(response.status).toBe(httpStatus.BAD_REQUEST);
      });

      it("should respond with status 404 if hotel doesnt exists", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketType(false, true);
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        
        const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);
 
        expect(response.status).toBe(httpStatus.NOT_FOUND);
      });

      it("should respond with status 200 and hotel object with rooms", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketType(false, true);
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        
        const hotel = await createHotel();
        const rooms = await createRooms(hotel.id);

        const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);
   
        expect(response.status).toBe(httpStatus.OK);
        expect(response.body).toEqual({
          ...hotel,
          createdAt: hotel.createdAt.toISOString(),
          updatedAt: hotel.updatedAt.toISOString(),
          rooms,
        });
      });
    });
  });
});
