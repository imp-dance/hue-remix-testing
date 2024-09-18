import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { z } from "zod";
import { hueApi } from "../../services/hueApi";

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function loader(args: LoaderFunctionArgs) {
  const id = args.params.id;
  return json(
    await hueApi.fetch(`resource/light/${id}`, {
      method: "GET",
    })
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const body = z
    .object({
      id: z.string(),
      on: z.boolean().optional(),
      color: z
        .object({
          x: z.number(),
          y: z.number(),
        })
        .optional(),
      brightness: z.number().optional(),
    })
    .parse(await request.json());

  const parsed = {
    color: body.color ? { xy: body.color } : undefined,
    on: body.on !== undefined ? { on: body.on } : undefined,
    dimming:
      body.brightness !== undefined
        ? { brightness: body.brightness }
        : undefined,
  };

  switch (request.method) {
    case "PUT": {
      return json(
        await hueApi.fetch(`resource/light/${body.id}`, {
          body: parsed,
          method: "PUT",
        })
      );
    }
    default:
      return new Response(null, { status: 405 });
  }
}
