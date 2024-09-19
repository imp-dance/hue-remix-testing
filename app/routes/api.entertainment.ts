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
  return json(
    await hueApi.syncboxRequest<{ data: unknown }>(
      "GET",
      "api/v1"
    )
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const body = z
    .object({
      action: z.literal("change_mode"),
      mode: z.enum(["game", "video", "music"]),
    })
    .or(
      z.object({
        action: z.literal("set_channel"),
        channel: z.string(),
      })
    )
    .or(
      z.object({
        action: z.literal("set_channel"),
        channel: z.string(),
      })
    )
    .parse(await request.json());

  switch (body.action) {
    case "change_mode": {
      return json(
        await hueApi.syncboxRequest<{ data: unknown }>(
          "PUT",
          "api/v1/execution",
          {
            mode: body.mode,
          }
        )
      );
    }
    case "set_channel": {
      return json(
        await hueApi.syncboxRequest<{ data: unknown }>(
          "PUT",
          "api/v1/execution",
          {
            hdmiSource: body.channel,
          }
        )
      );
    }
    default:
      return json(null, { status: 400 });
  }
}
