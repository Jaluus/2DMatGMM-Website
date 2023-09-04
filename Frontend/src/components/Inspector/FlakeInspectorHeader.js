import FlakeFilter from "./FlakeFilter/FlakeFilter";
import { Link } from "react-router-dom";
import { CloseButton, Paper } from "@mantine/core";
import "./FlakeInspectorHeader.css";
import ScanInspectorTutorial from "../Tutorials/ScanInspectorTutorial";

function FlakeInspectorHeader(props) {

  const scan_name = props.flakes[0]?.scan_name;

  return (
    <Paper className="flakeInspectorHeader" withBorder radius={0}>
      <div className="flakeInspectorHeaderButtonsLeft">
        {/* Go back to the scan Manager */}
        <CloseButton
          component={Link}
          to={".."}
          size="xl"
          variant="default"
          iconSize={25}
        />
        <ScanInspectorTutorial />
      </div>
      <b>{scan_name}</b>
      <div className="flakeInspectorHeaderButtonsRight">
        {/* <FlakeInspectorInfo flakes={props.flakes} /> */}
        <FlakeFilter
          flakes={props.flakes}
          filterSettings={props.filterSettings}
          setFilterSettings={props.setFilterSettings}
        ></FlakeFilter>
      </div>
    </Paper>
  );
}

export default FlakeInspectorHeader;
