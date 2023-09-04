import "./FlakeInspectorFooter.css";
import { Button, Group, Paper } from "@mantine/core";
import { IconDownload, IconTrash } from "@tabler/icons-react";

function FlakeInspectorFooter(props) {
  const deleteFlake = () => {
    props.onDelete();
  };

  return (
    <Paper className="FlakeInspectorFooterfooterDiv" withBorder radius={0}>
      <Group>
        <Button
          onClick={() => props.onDownload(0)}
          leftIcon={<IconDownload size={15} />}
          variant="gradient"
          gradient={{ from: "blue", to: "indigo" }}
        >
          Download
        </Button>
        <Button
          onClick={() => props.onDownload(1)}
          leftIcon={<IconDownload size={15} />}
          variant="gradient"
          gradient={{ from: "indigo", to: "blue" }}
        >
          Download \w Scalebar
        </Button>
        <Button
          onClick={deleteFlake}
          leftIcon={<IconTrash size={15} />}
          variant="gradient"
          gradient={{ from: "orange", to: "red" }}
        >
          Delete
        </Button>
      </Group>
    </Paper>
  );
}

export default FlakeInspectorFooter;
