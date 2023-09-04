import { ActionIcon, Group, Tooltip } from "@mantine/core";
import { IconArrowRight, IconInfoHexagon } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

function ScanTableActions(props) {
  const navigate = useNavigate();

  return (
    <div className="m-0">
      <Group position="left" spacing="xs">
        <Tooltip label={`View Info for Scan ${props._id}`}>
          <ActionIcon onClick={props.onInfo} disabled={props.isLoading}>
            <IconInfoHexagon />
          </ActionIcon>
        </Tooltip>
        <Tooltip label={`Inspect Scan ${props._id}`}>
          <ActionIcon
            onClick={() => navigate(props.link, { state: { id: props._id } })}
            disabled={props.isLoading}
          >
            <IconArrowRight />
          </ActionIcon>
        </Tooltip>
      </Group>
    </div>
  );
}

export default ScanTableActions;
