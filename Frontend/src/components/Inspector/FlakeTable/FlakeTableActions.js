import { Group, Button } from "@mantine/core";
import "./FlakeTableActions.css";

function FlakeTableActions(props) {
  const flake = props.flake;
  if (flake === undefined) {
    return <div></div>;
  }

  return (
    <Group spacing="xs" className={props.className}>
      <Button
        size="sm"
        color={"blue"}
        compact
        className="favoriteButton"
        {...(flake.flake_favorite
          ? { variant: "gradient" }
          : { variant: "outline" })}
        gradient={{ from: "teal", to: "blue", deg: 60 }}
        onClick={() => props.onFavorite(flake.flake_id)}
      >
        ❤
      </Button>
      <Button
        size="sm"
        color={"red"}
        compact
        className="usedButton"
        {...(flake.flake_used
          ? { variant: "gradient" }
          : { variant: "outline" })}
        gradient={{ from: "orange", to: "red", deg: 60 }}
        onClick={() => props.onUsed(flake.flake_id)}
      >
        ❌
      </Button>
    </Group>
  );
}

export default FlakeTableActions;
