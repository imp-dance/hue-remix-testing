import { z } from "zod";

export const heatPumpEventSchema = z
  .object({
    action: z.literal("set_mode"),
    mode: z.enum(["auto", "cool", "dry", "fan", "heat"]),
  })
  .or(
    z.object({
      action: z.literal("power"),
      on: z.boolean(),
    })
  )
  .or(
    z.object({
      action: z.literal("set_channel"),
      channel: z.string(),
    })
  )
  .or(
    z.object({
      action: z.literal("set_temp"),
      temp: z.number(),
    })
  )
  .or(
    z.object({
      action: z.literal("set_fan"),
      speed: z.enum([
        "low",
        "lowMid",
        "mid",
        "highMid",
        "high",
        "auto",
      ]),
    })
  );
