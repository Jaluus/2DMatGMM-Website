import { useEffect, useState } from "react";
import FlakeFilterElement from "./FlakeFilterElement";
import { Button, Modal, ActionIcon } from "@mantine/core";
import { IconFilter } from "@tabler/icons-react";

import "./FlakeFilter.css";
import FlakeFilterDoubleRange from "./FlakeFilterDoubleRange";
import FlakeFilterElementMulti from "./FlakeFilterElementMulti";

function extractUniqueValues(data, key) {
  // extracts the thicknesses from the data
  function onlyUnique(value, index, self) {
    // filters out duplicates from an array
    return self.indexOf(value) === index;
  }
  let values = [];
  for (let i = 0; i < data.length; i++) {
    values.push(data[i][key]);
  }
  let uniqueValues = values.filter(onlyUnique);
  return uniqueValues;
}

function extractMinMaxValues(data, key) {
  let values = [];
  for (let i = 0; i < data.length; i++) {
    values.push(data[i][key]);
  }

  return [Math.min(...values), Math.max(...values)];
}

function FlakeFilter(props) {
  const [show, setShow] = useState(false);

  const thicknesses = extractUniqueValues(props.flakes, "flake_thickness");
  const chipIDs = extractUniqueValues(props.flakes, "chip_id");
  const sizeMinMax = extractMinMaxValues(props.flakes, "flake_size");
  const aspectMinMax = extractMinMaxValues(props.flakes, "flake_aspect_ratio");
  const entropyMinMax = extractMinMaxValues(props.flakes, "flake_entropy");

  // this is the most scuffed impleemnentation of a filter.
  // i run the useEffect on update of the props as they are passed as gibberish in the beginnging.
  useEffect(() => {
    if (
      props.filterSettings.size_range[0] === null &&
      sizeMinMax[0] !== Infinity
    ) {
      handleFilterChange(sizeMinMax, "size_range");
      handleFilterChange(aspectMinMax, "aspect_ratio_range");
      handleFilterChange(entropyMinMax, "entropy_range");
    }
  }, [props.flakes]);

  const thicknessOptions = [];
  thicknesses.forEach((thickness) => {
    thicknessOptions.push({ label: thickness, value: thickness });
  });

  const chipOptions = [];
  chipIDs.forEach((ID) => {
    chipOptions.push({ label: ID, value: ID });
  });

  const sortOptions = [
    { label: "ID", value: "flake_id" },
    { label: "Size", value: "flake_size" },
    { label: "Aspect Ratio", value: "flake_aspect_ratio" },
    { label: "Entropy", value: "flake_entropy" },
  ];

  const orderOptions = [
    { label: "Ascending", value: "-1" },
    { label: "Descending", value: "1" },
  ];

  const handleFilterChange = (value, key) => {
    props.setFilterSettings((prevState) => {
      return { ...prevState, [key]: value };
    });
  };

  const handleRangeReset = (key) => {
    switch (key) {
      case "size_range":
        handleFilterChange(sizeMinMax, "size_range");
        break;
      case "aspect_ratio_range":
        handleFilterChange(aspectMinMax, "aspect_ratio_range");
        break;
      case "false_positive_probability_range":
        handleFilterChange([0, 1], "false_positive_probability_range");
        break;
      case "entropy_range":
        handleFilterChange(entropyMinMax, "entropy_range");
        break;
    }
  };

  return (
    <div>
      <Modal
        opened={show}
        onClose={() => setShow(false)}
        title={<b>Flake Filter Options</b>}
      >
        <Button.Group className="mb-3 favoriteGroup">
          <Button
            className="w-50"
            {...(props.filterSettings.favorite
              ? { variant: "outline" }
              : { variant: "filled" })}
            onClick={() => {
              handleFilterChange(false, "favorite");
            }}
          >
            Show All
          </Button>
          <Button
            className="w-50"
            {...(props.filterSettings.favorite
              ? { variant: "filled" }
              : { variant: "outline" })}
            onClick={() => {
              handleFilterChange(true, "favorite");
            }}
          >
            Show Favorites
          </Button>
        </Button.Group>
        <FlakeFilterElement
          name="Sort By"
          clearable={false}
          filterKey="setSort"
          value={props.filterSettings}
          onFilter={handleFilterChange}
          options={sortOptions}
        />
        <FlakeFilterElement
          name="Order"
          clearable={false}
          filterKey="order"
          value={props.filterSettings}
          onFilter={handleFilterChange}
          options={orderOptions}
        />
        <FlakeFilterElementMulti
          placeholder="All Thicknesses"
          clearable={true}
          name="Thickness"
          filterKey="flake_thickness"
          value={props.filterSettings}
          onFilter={handleFilterChange}
          options={thicknessOptions}
        />
        <FlakeFilterElementMulti
          placeholder="All Chips"
          clearable={true}
          name="Chip ID"
          filterKey="chip_id"
          value={props.filterSettings}
          onFilter={handleFilterChange}
          options={chipOptions}
        />
        <FlakeFilterDoubleRange
          name="Size"
          unitSuffix="μm²"
          filterKey="size_range"
          filterSettings={props.filterSettings}
          minMax={sizeMinMax}
          multiplier={1}
          onFilterChange={handleFilterChange}
          onFilterReset={handleRangeReset}
          step={25}
          minRange={50}
          precision={0}
        />
        <FlakeFilterDoubleRange
          name="Aspect Ratio"
          unitSuffix=""
          filterKey="aspect_ratio_range"
          filterSettings={props.filterSettings}
          minMax={aspectMinMax}
          multiplier={1}
          onFilterChange={handleFilterChange}
          onFilterReset={handleRangeReset}
          step={1}
          minRange={1}
          precision={0}
        />
        <FlakeFilterDoubleRange
          name="Entropy"
          unitSuffix=""
          filterKey="entropy_range"
          filterSettings={props.filterSettings}
          minMax={entropyMinMax}
          multiplier={1}
          onFilterChange={handleFilterChange}
          onFilterReset={handleRangeReset}
          step={0.01}
          numFixed={2}
          minRange={0.01}
          precision={100}
        />
        <FlakeFilterDoubleRange
          name="FP Prob."
          unitSuffix="%"
          filterKey="false_positive_probability_range"
          filterSettings={props.filterSettings}
          minMax={[0, 1]}
          multiplier={100}
          onFilterChange={handleFilterChange}
          onFilterReset={handleRangeReset}
          step={0.01}
          minRange={0.01}
          precision={2}
        />
      </Modal>

      <ActionIcon
        size="xl"
        variant="default"
        onClick={() => {
          setShow(true);
        }}
      >
        <IconFilter />
      </ActionIcon>
    </div>
  );
}

export default FlakeFilter;
