import { SunIcon } from "@radix-ui/react-icons";
import { Flex, Select } from "@radix-ui/themes";
import {
  FanSpeed,
  OperationMode,
} from "panasonic-comfort-cloud-client";
import {
  useHeatPumpEventMutation,
  useHeatPumpQuery,
} from "../clientApi";
import { useDebounceValue } from "../hooks/useDebounceValue";
import { extractDeviceFromGroups } from "../utils";

const modes = ["Auto", "Cool", "Dry", "Fan", "Heat"];
const operationModeToMode = {
  [OperationMode.Auto]: "auto",
  [OperationMode.Cool]: "cool",
  [OperationMode.Dry]: "dry",
  [OperationMode.Fan]: "fan",
  [OperationMode.Heat]: "heat",
};
const fanSpeedToSpeed = {
  [FanSpeed.Low]: "low",
  [FanSpeed.LowMid]: "lowMid",
  [FanSpeed.Mid]: "mid",
  [FanSpeed.HighMid]: "highMid",
  [FanSpeed.High]: "high",
  [FanSpeed.Auto]: "auto",
};
const fanSpeedToLabel = {
  low: "Lower",
  lowMid: "Low",
  mid: "Medium",
  highMid: "High",
  high: "Higher",
  auto: "Auto",
};

export function HeatPumpControl() {
  const query = useHeatPumpQuery();
  const mutation = useHeatPumpEventMutation();
  const [isLoading] = useDebounceValue(mutation.isPending, 3000);
  if (!query.data) return null;

  const device = extractDeviceFromGroups(query.data);

  if (!device) return null;

  return (
    <Flex
      align="center"
      gap="3"
      width="100%"
      style={{ flexGrow: 0, flexShrink: 2 }}
    >
      <SunIcon />
      <Select.Root
        value={operationModeToMode[device.operationMode]}
        onValueChange={(value) => {
          mutation.mutate({
            action: "set_mode",
            mode: value as "auto",
          });
        }}
        disabled={mutation.isPending || isLoading}
      >
        <Select.Trigger style={{ flexGrow: 1 }} />
        <Select.Content>
          <Select.Group>
            <Select.Label>Mode</Select.Label>
            {modes.map((mode) => (
              <Select.Item key={mode} value={mode.toLowerCase()}>
                {mode}
              </Select.Item>
            ))}
          </Select.Group>
          <Select.Separator />
        </Select.Content>
      </Select.Root>
      <Select.Root
        value={device.temperatureSet.toString()}
        onValueChange={(value) => {
          mutation.mutate({
            action: "set_temp",
            temp: parseInt(value, 10),
          });
        }}
        disabled={mutation.isPending || isLoading}
      >
        <Select.Trigger style={{ flexGrow: 1 }} />
        <Select.Content>
          <Select.Group>
            <Select.Label>Temperature</Select.Label>
            {new Array(30).fill(null).map((_, i) => (
              <Select.Item key={i} value={(i + 1).toString()}>
                {i + 1}°
              </Select.Item>
            ))}
          </Select.Group>
          <Select.Separator />
        </Select.Content>
      </Select.Root>
      <Select.Root
        value={fanSpeedToSpeed[device.fanSpeed]}
        onValueChange={(value) => {
          mutation.mutate({
            action: "set_fan",
            speed: value as "auto",
          });
        }}
        disabled={mutation.isPending || isLoading}
      >
        <Select.Trigger style={{ flexGrow: 1 }} />
        <Select.Content>
          <Select.Group>
            <Select.Label>Fan</Select.Label>
            {[
              "auto",
              "low",
              "lowMid",
              "mid",
              "highMid",
              "high",
            ].map((speed) => (
              <Select.Item key={speed} value={speed}>
                {fanSpeedToLabel[speed as "low"]}
              </Select.Item>
            ))}
          </Select.Group>
          <Select.Separator />
        </Select.Content>
      </Select.Root>
    </Flex>
  );
}
