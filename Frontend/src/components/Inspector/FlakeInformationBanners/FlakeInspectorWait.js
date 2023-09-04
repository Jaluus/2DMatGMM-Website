import { Group, Loader } from "@mantine/core";
import "./FlakeInspectorWait.css";

function FlakeInspectorWait() {
  return (
    <div className="waitNoFlakes">
      <Group>
        <Loader size="lg" />
        <h1>Fetching Flakes...</h1>
      </Group>
    </div>
  );
}

export default FlakeInspectorWait;
