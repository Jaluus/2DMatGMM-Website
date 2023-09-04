import FlakeFilter from "./FlakeFilter/FlakeFilter";
import { Link } from "react-router-dom";
import FlakeSidebarTable from "./FlakeSidebarTable/FlakeSidebarTable";
import { CloseButton, Paper } from "@mantine/core";
import "./FlakeInspectorHeaderMobile.css";
import FlakeInspectorInfo from "./FlakeInspectorInfo";
import ScanInspectorTutorial from "../Tutorials/ScanInspectorTutorial";

function FlakeInspectorHeaderMobile(props) {
  return (
    <Paper className="flakeInspectorHeaderMobile" withBorder radius={0}>
      <div className="flakeInspectorHeaderMobileButtonsLeft">
        {/* Go back to the scan Manager */}
        <CloseButton
          component={Link}
          to={".."}
          size="xl"
          variant="default"
          iconSize={25}
        />
        <FlakeSidebarTable
          flakeData={props.flakeData}
          numTotalFlakes={props.numTotalFlakes}
          selectedIndex={props.selectedIndex}
          onClickFlake={props.onClickFlake}
          onFavorite={props.onFavorite}
          onUsed={props.onUsed}
          isLoading={props.isLoading}
        />
        <ScanInspectorTutorial />
      </div>
      <div className="flakeInspectorHeaderMobileButtonsRight">
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

export default FlakeInspectorHeaderMobile;
