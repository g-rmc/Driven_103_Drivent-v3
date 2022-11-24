import supertest from "supertest";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import faker from "@faker-js/faker";

import app, { init } from "@/app";
import { prisma } from "@/config";
import { cleanDb, generateValidToken } from "../helpers";
import { createUser } from "../factories";

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
});

describe("GET /hotels/:hotelId", () => {
  console.log("GET /hotels/:hotelId");
});
