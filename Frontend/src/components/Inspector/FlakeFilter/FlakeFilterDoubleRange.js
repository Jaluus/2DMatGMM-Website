import { RangeSlider, Text, Button, Paper } from "@mantine/core";

import "./FlakeFilterDoubleRange.css";

function FlakeFilterDoubleRange(props) {
  let currentState = props.filterSettings[props.filterKey];
  let currentMin = currentState[0];
  let currentMax = currentState[1];
  let numFixed = props.numFixed || 0;

  return (
    <Paper
      shadow="md"
      radius="md"
      p="md"
      className="my-3"
      withBorder
      classNames={props.className}
    >
      <Text>
        {props.name} :{" "}
        {currentState === undefined
          ? 0
          : (currentMin * props.multiplier).toFixed(numFixed)}{" "}
        {props.unitSuffix} -{" "}
        {currentState === undefined
          ? 0
          : (currentMax * props.multiplier).toFixed(numFixed)}{" "}
        {props.unitSuffix}
        <Button
          size="xs"
          compact
          className="rangeResetButton"
          onClick={() => props.onFilterReset(props.filterKey)}
        >
          Reset
        </Button>
      </Text>
      <RangeSlider
        className="rangeSlider"
        label={null}
        defaultValue={[props.minMax[0], props.minMax[1]]}
        min={props.minMax[0]}
        max={props.minMax[1]}
        value={[
          currentState === undefined ? 0 : currentMin,
          currentState === undefined ? 0 : currentMax,
        ]}
        step={props.step}
        minRange={props.minRange}
        precision={props.precision}
        onChange={(value) =>
          props.onFilterChange([value[0], value[1]], props.filterKey)
        }
      />{" "}
    </Paper>
  );
}

export default FlakeFilterDoubleRange;
