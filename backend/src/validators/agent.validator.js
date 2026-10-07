const { z } = require("zod");

const fullName = z.string().trim().min(2).max(120);
const phone = z.string()
  .trim()
  .transform((value) => value.replace(/[ -]/g, ""))
  .pipe(z.string().regex(/^\+?[0-9]{10,15}$/));
const email = z.string().trim().email().max(255).transform((value) => value.toLowerCase());
const serviceArea = z.string().trim().min(2).max(120);
const status = z.enum(["active", "inactive"]);

const createAgentSchema = z.object({
  fullName,
  phone,
  email,
  serviceArea,
  status: status.default("active")
}).strict();

const updateAgentSchema = z.object({
  fullName: fullName.optional(),
  phone: phone.optional(),
  email: email.optional(),
  serviceArea: serviceArea.optional(),
  status: status.optional()
}).strict().refine((agent) => Object.keys(agent).length > 0, {
  message: "At least one field must be provided"
});

const idParamSchema = z.object({
  id: z.string().uuid()
}).strict();

const emptyToUndefined = (schema) => z.preprocess(
  (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
  schema
);
const positiveInteger = (minimum, maximum) => emptyToUndefined(
  z.coerce.number().int().min(minimum).max(maximum).optional()
);
const optionalTrimmedString = (maximum) => emptyToUndefined(
  z.string().trim().max(maximum).optional()
).transform((value) => value === "" ? undefined : value);

const listQuerySchema = z.object({
  page: positiveInteger(1).transform((value) => value ?? 1),
  limit: positiveInteger(1, 100).transform((value) => value ?? 10),
  status: emptyToUndefined(z.enum(["active", "inactive"]).optional()),
  serviceArea: optionalTrimmedString(120),
  q: optionalTrimmedString(100),
  sortBy: emptyToUndefined(z.enum(["createdAt", "updatedAt", "fullName"]).optional())
    .transform((value) => value ?? "createdAt"),
  order: emptyToUndefined(z.enum(["asc", "desc"]).optional())
    .transform((value) => value ?? "desc")
}).strict();

module.exports = {
  createAgentSchema,
  updateAgentSchema,
  idParamSchema,
  listQuerySchema
};
