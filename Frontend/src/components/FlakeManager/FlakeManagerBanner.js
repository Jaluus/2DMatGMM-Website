import { Button, Center, Group, Input } from "@mantine/core";
import { Stack } from "react-bootstrap";
import "./FlakeManagerBanner.css";

const FlakeManagerBanner = () => {
  return (
    <div className="FlakeManagerBannerMainDiv">
      <Center>
        <Stack>
          <Center>
            <h1>Floogle</h1>
          </Center>
          <Group position="center" className="p-3">
            <Input placeholder="Flake IDs"></Input>
            <Button>Go!</Button>
          </Group>
        </Stack>
      </Center>
    </div>
  );
};

export default FlakeManagerBanner;
