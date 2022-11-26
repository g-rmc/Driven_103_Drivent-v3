import Joi from "joi";

export const hotelIdSchema = Joi.object<{hotelId: number}>({
  hotelId: Joi.number().min(0).required(),
});
