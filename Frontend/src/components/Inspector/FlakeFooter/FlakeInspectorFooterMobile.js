import "./FlakeInspectorFooterMobile.css";
import { ActionIcon, Group, Paper } from "@mantine/core";
import FlakeTableActions from "../FlakeTable/FlakeTableActions";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";

function FlakeInspectorFooterMobile(props) {
  return (
    <Paper className="FlakeInspectorFooterMobilefooterDiv" withBorder radius={0}>
      <ActionIcon
        size="xl"
        onClick={props.onPrevious}
        className="FlakeInspectorFooterMobileArrowButtons"
      >
        <IconArrowLeft />
      </ActionIcon>
      <FlakeTableActions
        flake={props.flake}
        onFavorite={props.onFavorite}
        onUsed={props.onUsed}
      />
      <ActionIcon
        size="xl"
        onClick={props.onNext}
        className="FlakeInspectorFooterMobileArrowButtons"
      >
        <IconArrowRight />
      </ActionIcon>
    </Paper>
  );
}

export default FlakeInspectorFooterMobile;
