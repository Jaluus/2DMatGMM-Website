import {
  Modal,
  Group,
  ActionIcon,
  Divider,
  RingProgress,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconInfoSquare } from "@tabler/icons-react";

const getThicknesCount = (flakes) => {
  let thicknesses = flakes.map((flake) => flake.flake_thickness);
  let thicknesCount = thicknesses.reduce((acc, curr) => {
    if (typeof acc[curr] === "undefined") {
      acc[curr] = 1;
    } else {
      acc[curr] += 1;
    }
    return acc;
  }, {});
  return thicknesCount;
};

const generateRandomColor = (i) => {
  return `hsl(${i * 1238 + 34}, 100%, 50%)`;
};

function FlakeInspectorInfo(props) {
  const [opened, { open, close }] = useDisclosure(false);

  let numberOfFlakes = 0;
  let thicknessCount = {};
  let uniqueThicknesses = [];
  let sections = [];

  if (props.flakes) {
    numberOfFlakes = props.flakes.length;
    thicknessCount = getThicknesCount(props.flakes);
    uniqueThicknesses = Object.keys(thicknessCount);

    for (let i = 0; i < uniqueThicknesses.length; i++) {
      sections.push({
        value: Math.round(
          (thicknessCount[uniqueThicknesses[i]] / numberOfFlakes) * 100
        ),
        color: generateRandomColor(i),
        tooltip: `${uniqueThicknesses[i]} - ${
          thicknessCount[uniqueThicknesses[i]]
        } Flakes`,
      });
    }
  }

  return (
    <>
      <Modal opened={opened} onClose={close} title={<b>Flake Information</b>}>
        <Divider my="sm" label="Overview" />
        <Group position="center">
          <RingProgress
            size={170}
            thickness={10}
            label={
              <Text
                size="xs"
                align="center"
                px="xs"
                sx={{ pointerEvents: "none" }}
              >
                {numberOfFlakes} Flakes Found
              </Text>
            }
            sections={sections}
          />
        </Group>
      </Modal>

      <Group position="center" className="mx-3">
        <ActionIcon size="xl" variant="default" onClick={open}>
          <IconInfoSquare />
        </ActionIcon>
      </Group>
    </>
  );
}

export default FlakeInspectorInfo;
