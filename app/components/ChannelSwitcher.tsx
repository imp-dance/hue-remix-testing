import { DesktopIcon } from "@radix-ui/react-icons";
import { Flex, Select } from "@radix-ui/themes";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { memo } from "react";
import { getEntertainment, setChannel } from "../clientApi";
import { queryKeys } from "../constants";

export const ChannelSwitcher = memo(() => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: setChannel,
    mutationKey: ["setEntertainment"],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.entertainment],
      });
    },
  });
  const { data } = useQuery({
    queryFn: getEntertainment,
    queryKey: [queryKeys.entertainment],
    refetchInterval: 2000,
  });
  if (!data) return null;
  if (isErrorResponse(data)) return null;
  const inputs = Object.keys(data.hdmi)
    .filter((k) => k.startsWith("input"))
    .map((k) => ({
      id: k,
      ...data.hdmi[k as "input1"],
    }));

  const activeInput = data.execution.hdmiSource;

  return (
    <Flex align="center" gap="3" width="100%">
      <DesktopIcon />
      <Select.Root
        value={activeInput}
        onValueChange={(value) => {
          mutation.mutate(value as "input1");
        }}
        disabled={mutation.isPending}
      >
        <Select.Trigger style={{ flexGrow: 1 }} />
        <Select.Content>
          <Select.Group>
            <Select.Label>Change TV source</Select.Label>
            {inputs.map((input) => (
              <Select.Item key={input.id} value={input.id}>
                {input.name}
              </Select.Item>
            ))}
          </Select.Group>
          <Select.Separator />
        </Select.Content>
      </Select.Root>
    </Flex>
  );
});

ChannelSwitcher.displayName = "ChannelSwitcher";

function isErrorResponse(
  data: unknown
): data is { error: string } {
  return data && typeof data === "object" && "error" in data
    ? true
    : false;
}
