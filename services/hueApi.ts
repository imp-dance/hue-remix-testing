import { HueApi } from "lib/hueApi";

const username = process.env.USERNAME;
const clientkey = process.env.CLIENTKEY;
const connection = process.env.BRIDGE_CONNECTION;

const syncbox =
  process.env.SYNCBOX_REGISTRATIONID &&
  process.env.SYNCBOX_ACCESSTOKEN &&
  process.env.SYNCBOX_CONNECTION
    ? {
        registrationId: process.env.SYNCBOX_REGISTRATIONID,
        accessToken: process.env.SYNCBOX_ACCESSTOKEN,
        connection: process.env.SYNCBOX_CONNECTION,
      }
    : undefined;

if (!username || !clientkey || !connection)
  throw new Error("Environment variables not set");

export const hueApi = new HueApi({
  username,
  clientkey,
  connection,
  syncbox,
});
