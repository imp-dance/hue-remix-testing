import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { updateLightSchema } from "~/domain";
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
  const requestArgs = updateLightSchema.parse(
    await request.json()
  );

  const body = {
    color: requestArgs.color
      ? { xy: requestArgs.color }
      : undefined,
    on:
      requestArgs.on !== undefined
        ? { on: requestArgs.on }
        : undefined,
    dimming:
      requestArgs.brightness !== undefined
        ? { brightness: requestArgs.brightness }
        : undefined,
  };

  switch (request.method) {
    case "PUT": {
      return json(
        await hueApi.fetch(`resource/light/${requestArgs.id}`, {
          body: body,
          method: "PUT",
        })
      );
    }
    default:
      return new Response(null, { status: 405 });
  }
}
