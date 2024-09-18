import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Light } from "lib/hueApi.types";
import { hueApi } from "../../services/hueApi";

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function loader(args: LoaderFunctionArgs) {
  return json(
    await hueApi.fetch<{ data: Light[] }>("resource/light", {
      method: "GET",
    })
  );
}
