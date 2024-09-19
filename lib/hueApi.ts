import {
  FetchConfig,
  PairFailure,
  PairSuccess,
  Resource,
} from "./hueApi.types";

export class HueApi {
  appKey: string;
  baseUrl: string;
  syncbox?: {
    registrationId: string;
    accessToken: string;
    connection: string;
  };
  constructor(options: {
    username: string;
    clientkey: string;
    /** ex: "https://192.168.00.000" */
    connection: string;
    syncbox?: {
      registrationId: string;
      accessToken: string;
      connection: string;
    };
  }) {
    this.appKey = options.username;
    this.baseUrl = options.connection.endsWith("/")
      ? options.connection.substring(
          0,
          options.connection.length - 1
        )
      : options.connection;
    this.syncbox = options.syncbox;
  }

  fetch<T = unknown>(url: Resource, config?: FetchConfig) {
    const headers = new Headers();
    headers.set("hue-application-key", this.appKey);
    if (config?.headers) {
      Object.keys(config.headers).forEach((header) => {
        headers.set(header, config.headers![header]);
      });
    }
    return fetch(`${this.baseUrl}/clip/v2/${url}`, {
      ...config,
      body: config?.body
        ? JSON.stringify(config.body)
        : undefined,
      headers,
    }).then((res) => res.json() as Promise<T>);
  }

  syncboxRequest<T = unknown>(
    method: "PUT" | "GET" | "POST",
    url: string,
    body?: Record<string, unknown>
  ) {
    if (!this.syncbox) throw new Error("Syncbox not configured");
    const headers = new Headers();
    headers.set(
      "Authorization",
      `Bearer ${this.syncbox.accessToken}`
    );
    return fetch(`${this.syncbox.connection}/${url}`, {
      headers,
      method,
      body: body ? JSON.stringify(body) : undefined,
    }).then((res) => {
      return res.json() as Promise<T>;
    });
  }

  /** **Note**: You will need to physically click the pair button on your Hue Bridge before running this. */
  static async pairWithBridge(
    /** ex: "https://168.192.00.000" */
    deviceIp: string
  ) {
    const res = await fetch(`${deviceIp}/api`, {
      body: JSON.stringify({
        devicetype: "app_name#instance_name",
        generateclientkey: true,
      }),
      method: "POST",
    }).then(
      (res) =>
        res.json() as Promise<[PairSuccess] | [PairFailure]>
    );
    const credentials = res.find((v) =>
      "success" in v ? true : false
    ) as PairSuccess | undefined;
    return {
      credentials: credentials?.success ?? null,
      raw_response: res,
    };
  }

  /** **Note**: You will need to physically click the pair button on your Hue Bridge before running this. */
  static async pairWithSyncBox(
    /** ex: "https://168.192.00.000" */
    deviceIp: string
  ) {
    const res = await fetch(`${deviceIp}/api/v1/registrations`, {
      body: JSON.stringify({
        appName: "curl",
        instanceName: "Web app",
      }),
      method: "POST",
    }).then(
      (res) =>
        res.json() as Promise<
          | { code: number; message: string }
          | { registrationId: string; accessToken: string }
        >
    );
    const credentials = "registrationId" in res ? res : null;
    return { credentials, raw_response: res };
  }
}
