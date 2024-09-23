import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
} from "@remix-run/node";
import {
  ComfortCloudClient,
  FanSpeed,
  OperationMode,
  Power,
} from "panasonic-comfort-cloud-client";
import { heatPumpEventSchema } from "~/domain";
import { extractDeviceFromGroups } from "~/utils/comfortCloud";

const client = new ComfortCloudClient();

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
const credentials = {
  username: process.env.PANASONIC_USERNAME,
  password: process.env.PANASONIC_PASSWORD,
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function loader(args: LoaderFunctionArgs) {
  if (!credentials.username || !credentials.password) {
    return json({ error: "no-credentials" }, { status: 400 });
  }
  await client
    .login(credentials.username, credentials.password)
    .catch(() => {});
  return json(await client.getGroups());
}

export async function action({ request }: ActionFunctionArgs) {
  const body = heatPumpEventSchema.parse(await request.json());

  if (!credentials.username || !credentials.password) {
    return json({ error: "no-credentials" }, { status: 400 });
  }
  if (!client.oauthClient.token) {
    await retry(
      () =>
        client.login(
          credentials.username!,
          credentials.password!
        ),
      10,
      700
    );
  }
  const groups = await client.getGroups().catch(() => []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deviceId = extractDeviceFromGroups(groups)?.guid;
  if (!deviceId) return json({ error: "no-device" });
  const device = await client
    .getDevice(deviceId)
    .catch(() => null);
  if (!device) return json({ error: "no-device" });
  switch (body.action) {
    case "set_mode": {
      device.operationMode = enumToOperationMode[body.mode];
      const res = await client.setDevice(device);
      const status = res?.status;
      return json({ success: true, status });
    }
    case "power": {
      device.operate = toPowerMode[body.on ? "true" : "false"];
      const res = await client.setDevice(device);
      const status = res?.status;
      return json({ success: true, status });
    }
    case "set_temp": {
      device.temperatureSet = body.temp;
      const res = await client.setDevice(device);
      const status = res?.status;
      return json({ success: true, status });
    }
    case "set_fan": {
      device.fanSpeed = enumToFanSpeed[body.speed];
      const res = await client.setDevice(device);
      const status = res?.status;
      return json({ success: true, status });
    }
    default:
      return json(null, { status: 400 });
  }
}

const enumToOperationMode = {
  auto: OperationMode.Auto,
  cool: OperationMode.Cool,
  dry: OperationMode.Dry,
  fan: OperationMode.Fan,
  heat: OperationMode.Heat,
};

const toPowerMode = {
  true: Power.On,
  false: Power.Off,
};

const enumToFanSpeed = {
  low: FanSpeed.Low,
  lowMid: FanSpeed.LowMid,
  mid: FanSpeed.Mid,
  highMid: FanSpeed.HighMid,
  high: FanSpeed.High,
  auto: FanSpeed.Auto,
};

async function retry<T>(
  func: () => Promise<T>,
  maxTries: number,
  timeout: number = 1000
) {
  return new Promise((res, reject) => {
    let tries = 0;
    function tryFunc() {
      func()
        .then((r) => res(r))
        .catch(() => {
          if (tries > maxTries)
            return reject("Max tries exceeded");
          setTimeout(() => {
            tries++;
            tryFunc();
          }, timeout);
        });
    }
    tryFunc();
  });
}
