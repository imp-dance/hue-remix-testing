import { HueApi } from "lib/hueApi";

const username = process.env.USERNAME;
const clientkey = process.env.CLIENTKEY;
const connection = process.env.CONNECTION;

if (!username || !clientkey || !connection)
  throw new Error("Environment variables not set");

export const hueApi = new HueApi({
  username,
  clientkey,
  connection,
});
