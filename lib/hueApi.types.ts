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

type Coord = { x: number; y: number };

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
    xy: Coord;
    gamut: { red: Coord; green: Coord; blue: Coord };
    gamut_type: string;
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

export type EntertainmentConfigurationResponse = {
  errors: unknown[];
  data: EntertainmentConfiguration[];
};

type EntertainmentConfiguration = {
  id: string;
  type: "entertainment_configuration";
  id_v1: string;
  name: string;
  status: "active" | "inactive";
  configuration_type: "music" | "screen";
  metadata: {
    name: string;
  };
  stream_proxy: {
    mode: string;
    node: {
      rtype: "entertainment";
      rid: string;
    };
  };
  channels: Channel[];
  locations: {
    service_locations: ServiceLocation[];
  };
  light_services: LightService[];
  active_streamer?: {
    rid: string;
    rtype: "auth_v1";
  };
};

type Channel = {
  channel_id: number;
  position: Position;
  members: ChannelMember[];
};

type ChannelMember = {
  service: {
    rtype: "entertainment";
    rid: string;
  };
  index: number;
};

type Position = {
  x: number;
  y: number;
  z: number;
};

type ServiceLocation = {
  service: {
    rtype: "entertainment";
    rid: string;
  };
  positions: Position[];
  equalization_factor: number;
  position: Position;
};

type LightService = {
  rtype: "light";
  rid: string;
};
