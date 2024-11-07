import {
  LinkBreak1Icon,
  MixerVerticalIcon,
} from "@radix-ui/react-icons";
import { Flex, Heading } from "@radix-ui/themes";
import { createApp } from "radix-os";
import { useHeatPumpQuery } from "~/clientApi";
import { HeatPumpControl } from "~/components/HeatPumpControl";

const TempControlAppComponent = createApp(() => {
  const query = useHeatPumpQuery();
  if (query.isLoading) {
    return (
      <div style={{ padding: "var(--space-3)" }}>
        <Heading size="4">
          <Flex gap="2" align="center">
            Trying to reach heat pump...
          </Flex>
        </Heading>
      </div>
    );
  }
  if (query.isError) {
    return (
      <div style={{ padding: "var(--space-3)" }}>
        <Heading size="4">
          <Flex gap="2" align="center">
            <LinkBreak1Icon /> Could not reach heat pump!
          </Flex>
        </Heading>
      </div>
    );
  }
  return <HeatPumpControl />;
});

export const tempControlApp = {
  component: TempControlAppComponent,
  appId: "temp",
  appName: "Temperature Control",
  addToDesktop: true,
  defaultWindowSettings: {
    initialHeight: 200,
    initialWidth: 300,
    icon: <MixerVerticalIcon />,
    title: "Temperature Control",
  },
};
