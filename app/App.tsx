// Render only on client

import {
  createZustandFsIntegration,
  RadixOS,
  setupApps,
} from "radix-os";
import { useLightsQuery, useRoomsQuery } from "./api";
import { channelSwitcherApp } from "./apps/ChannelSwitcherApp";
import { lightControlApp } from "./apps/LightControlApp";
import { tempControlApp } from "./apps/TempControlApp";

const fs = createZustandFsIntegration();

export function App() {
  const roomsQuery = useRoomsQuery();
  const lightsQuery = useLightsQuery();
  const apps = setupApps(
    [lightControlApp, tempControlApp, channelSwitcherApp],
    { defaultAppsOnDesktop: [] }
  );
  // preload queries before mounting os
  if (!roomsQuery.data || !lightsQuery.data) return <div />;

  return <RadixOS fs={fs} applications={apps} />;
}
