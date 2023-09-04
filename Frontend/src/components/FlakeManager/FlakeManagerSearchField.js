import {
  Group,
  Select,
  MultiSelect,
  Stack,
  NumberInput,
  SegmentedControl,
  Button,
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { useState } from "react";
import FlakeFilterDoubleRange from "../Inspector/FlakeFilter/FlakeFilterDoubleRange";
import "./FlakeManagerSearchField.css";

// Filter options
// INPUTS:
// Flake ID (multiple, with comma separation)

// SELECTS:
// sort by
// order
// Material
// Thickness (MULTI)
// User (MULTI)

// RANGES:
// Size Range (DUAL)
// Aspect Ratio (DUAL)
// False Positive Percentage (DUAL)

// ETC:
// Date Range
// Show only Favorites
// Hide Used
const FlakeManagerSearchField = (props) => {
  const [selectedUser, setSelectedUser] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [selectedThickness, setSelectedThickness] = useState([]);
  const [ThicknessData, setThicknessData] = useState([]);
  const [selectedSize, setSelectedSize] = useState([null, null]);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState([null, null]);
  const [
    selectedFalsePositiveProbabilityRange,
    setSelectedFalsePositiveProbabilityRange,
  ] = useState([0, 1]);
  const [selectedMinDate, setSelectedMinDate] = useState(null);
  const [showFavorites, setShowFavorites] = useState("0");

  const handleFilterChange = (value, setter, key) => {
    setter(value);
  };

  const handleRangeReset = () => {
    setSelectedFalsePositiveProbabilityRange([0, 1]);
  };

  const updateShownThicknesses = (value) => {
    setSelectedMaterial(value);
    setSelectedThickness([]);

    // update thickness data to be displayed
    let tempThicknessData = [];
    props.materialCombinations[value]?.forEach((thickness) => {
      tempThicknessData.push({
        label: thickness,
        value: thickness,
      });
    });

    // sort thickness data
    // extract only the first numbers in the string (5-10nm => 5) / (4 - 6 => 4)
    tempThicknessData.sort((a, b) => {
      return (
        a.value.replace(/(^\d+)(.+$)/i, "$1") -
        b.value.replace(/(^\d+)(.+$)/i, "$1")
      );
    });

    setThicknessData(tempThicknessData);
  };

  const userOptions = [];
  props.userData.forEach((user) => {
    userOptions.push({ value: user, label: user });
  });

  const materialOptions = [];
  props.materialData.forEach((material) => {
    materialOptions.push({ value: material, label: material });
  });

  return (
    <div className="FlakeManagerSearchFieldBody">
      <Stack>
        <Group grow position="center">
          <Select
            placeholder="All Materials"
            value={selectedMaterial}
            onChange={updateShownThicknesses}
            data={materialOptions}
            label="Material Filter"
            clearable
            required
          />
          <MultiSelect
            placeholder="All Thicknesses"
            value={selectedThickness}
            onChange={setSelectedThickness}
            data={ThicknessData}
            label="Thickness Filter"
            searchable
            nothingFound="Nothing found"
            clearable
            disabled={selectedMaterial === null}
          />
          <MultiSelect
            placeholder="All Users"
            value={selectedUser}
            onChange={setSelectedUser}
            data={userOptions}
            label="User Filter"
            searchable
            nothingFound="Nothing found"
            clearable
          />
          <DatePicker
            label="Minimum Exfoliation Date"
            placeholder="All Dates"
            value={selectedMinDate}
            onChange={setSelectedMinDate}
          />
        </Group>

        <Group grow position="center">
          <SegmentedControl
            data={[
              { label: "Show All", value: "0" },
              { label: "Show Only Favorites", value: "1" },
            ]}
            value={showFavorites}
            onChange={setShowFavorites}
          />
        </Group>

        <Group grow position="center">
          <NumberInput
            label="Min Size"
            placeholder="0"
            min={0}
            value={selectedSize[0]}
            onChange={(value) => {
              setSelectedSize([value, selectedSize[1]]);
            }}
          ></NumberInput>
          <NumberInput
            label="Max Size"
            placeholder="∞"
            min={0}
            value={selectedSize[1]}
            onChange={(value) => {
              setSelectedSize([selectedSize[0], value]);
            }}
          ></NumberInput>
        </Group>

        <Group grow position="center">
          <NumberInput
            label="Min Aspect Ratio"
            placeholder="0"
            min={0}
            value={selectedAspectRatio[0]}
            onChange={(value) => {
              setSelectedAspectRatio([value, selectedAspectRatio[1]]);
            }}
          ></NumberInput>
          <NumberInput
            label="Max Aspect Ratio"
            placeholder="∞"
            min={0}
            value={selectedAspectRatio[1]}
            onChange={(value) => {
              setSelectedAspectRatio([selectedAspectRatio[0], value]);
            }}
          ></NumberInput>
        </Group>

        <FlakeFilterDoubleRange
          name="False Positive Prob."
          unitSuffix="%"
          filterKey="false_positive_probability_range"
          rangeState={selectedFalsePositiveProbabilityRange}
          stateSetter={setSelectedFalsePositiveProbabilityRange}
          minMax={[0, 1]}
          multiplier={100}
          onFilterChange={handleFilterChange}
          onFilterReset={handleRangeReset}
          step={0.01}
          minRange={0.01}
          precision={2}
        />
        <Group grow position="right">
          <div />
          <div />
          <Button>Search with Filters</Button>
        </Group>
      </Stack>
    </div>
  );
};

export default FlakeManagerSearchField;
