type ResourceType =
  | "light"
  | "scene"
  | "room"
  | "zone"
  | "bridge_home"
  | "grouped_light"
  | "device"
  | "bridge"
  | "device_software_update"
  | "device_power"
  | "zigbee_connectivity"
  | "zgp_connectivity"
  | "zigbee_device_discovery"
  | "motion"
  | "service_group"
  | "grouped_motion"
  | "grouped_light_level"
  | "camera_motion"
  | "temperature"
  | "light_level"
  | "button"
  | "relative_rotary"
  | "behavior_script"
  | "behavior_instance"
  | "geofence_client"
  | "geolocation"
  | "entertainment_configuration"
  | "entertainment"
  | "homekit"
  | "matter"
  | "matter_fabric"
  | "resource"
  | "smart_scene"
  | "contact"
  | "tamper";

export type Resource =
  | `resource/${ResourceType}`
  | `resource/${ResourceType}/${string}`
  | `resource`;

export type FetchConfig = Omit<
  RequestInit,
  "headers" | "body" | "method"
> & {
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
  method?: "PUT" | "DELETE" | "POST" | "GET";
};

export type Light = {
  id: string;
  id_v1: string;
  product_data: {
    model_id: string;
    manufacturer_name: string;
    product_name: string;
    product_archetype: string;
    certified: boolean;
    software_version: string;
    hardware_platform_type: string;
  };
  metadata: {
    name: string;
    archetype: string;
  };
  identify: Record<string, unknown>; // assuming 'identify' is an empty object, otherwise provide its structure
  services: {
    rid: string;
    rtype: string;
  }[];
  type: string;
  color: {
    xy: { x: number; y: number };
  };
  dimming: { brightness: number; min_dim_level: number };
  on: {
    on: boolean;
  };
  owner: {
    rid: string;
  };
};

export type Room = {
  children: Array<{ rid: string; rtype: string }>;
  id: string;
  metadata: {
    name: string;
  };
};

export type PairSuccess = {
  success: {
    username: string;
    clientkey: string;
  };
};

export type PairFailure = {
  error: {
    type: number;
    address: string;
    description: string;
  };
};
