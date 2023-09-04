import "./FlakeInspector.css";
import { Grid, SimpleGrid } from "@mantine/core";
import FlakeInspectorFooter from "./FlakeFooter/FlakeInspectorFooter";
import FlakeInspectorFooterMobile from "./FlakeFooter/FlakeInspectorFooterMobile";
import FlakeInformationTable from "./FlakeInformationTable/FlakeInformationTable";
import FlakeInformationTableMobile from "./FlakeInformationTable/FlakeInformationTableMobile";
import FlakeMagnificationImage from "./FlakeImages/FlakeMagnificationImage";
import FlakeMagnificationImageMobile from "./FlakeImages/FlakeMagnificationImageMobile";
import FlakeEvaluationImage from "./FlakeImages/FlakeEvaluationImage";
import useCheckMobileScreen from "../../hooks/mobileDetector";
import FlakeIndexBannerMobile from "./FlakeIndexBannerMobile/FlakeIndexBannerMobile";

function FlakeInspector(props) {
  const isMobile = useCheckMobileScreen();

  let mobileFooter = (
    <FlakeInspectorFooterMobile
      flake={props.flake}
      onFavorite={props.onFavorite}
      onUsed={props.onUsed}
      onNext={props.onNext}
      onPrevious={props.onPrevious}
    />
  );

  let desktopFooter = (
    <FlakeInspectorFooter
      onDelete={() => props.onDelete(props.flake.flake_id)}
      onDownload={(scalebar) =>
        props.onDownload(props.flake?.flake_id, scalebar)
      }
      flake_id={props.flake?.flake_id}
    />
  );

  if (!isMobile) {
    return (
      <div className="m-3">
        <Grid columns={2}>
          <Grid.Col span={1}>
            <FlakeEvaluationImage flake={props.flake} />
          </Grid.Col>
          <Grid.Col span={1}>
            <FlakeMagnificationImage flake={props.flake} />
          </Grid.Col>
          <Grid.Col span={2}>
            <FlakeInformationTable flake={props.flake} />
          </Grid.Col>
        </Grid>
        {desktopFooter}
      </div>
    );
  } else {
    return (
      <div className="m-3 mt-2">
        <SimpleGrid verticalSpacing="xs">
          <FlakeIndexBannerMobile
            numTotalFlakes={props.numTotalFlakes}
            numFilteredFlakes={props.numFilteredFlakes}
            currentFlakeIndex={props.currentFlakeIndex}
          />
          <FlakeMagnificationImageMobile flake={props.flake} />
          <FlakeInformationTableMobile flake={props.flake} />
        </SimpleGrid>
        {mobileFooter}
      </div>
    );
  }
}

export default FlakeInspector;
