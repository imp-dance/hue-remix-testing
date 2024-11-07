import { PlayIcon } from "@radix-ui/react-icons";
import { createApp } from "radix-os";
import { ChannelSwitcher } from "~/components/ChannelSwitcher";

const ChannelSwitcherAppComponent = createApp(() => {
  return (
    <div style={{ padding: "var(--space-3)" }}>
      <ChannelSwitcher />
    </div>
  );
});

export const channelSwitcherApp = {
  component: ChannelSwitcherAppComponent,
  appId: "channel",
  appName: "Channel Switcher",
  addToDesktop: true,
  defaultWindowSettings: {
    initialHeight: 100,
    initialWidth: 300,
    icon: <PlayIcon />,
    title: "Channel Switcher",
  },
};
