import "./ScanInfo.css";
import { Progress, Text, Badge, Group, Slider, Input } from "@mantine/core";
import ScanInfoPlot from "./ScanInfoPlot";
import { useEffect, useState, useRef } from "react";

function countAndSortFlakesByThickness(flakes) {
  const thicknessCounts = {};
  // Count flakes by thickness
  flakes.forEach((flake) => {
    const thickness = flake.thickness;
    if (!thicknessCounts[thickness]) {
      thicknessCounts[thickness] = 0;
    }
    thicknessCounts[thickness]++;
  });

  // Convert the object to an array of [key, value] pairs
  const entries = Object.entries(thicknessCounts);

  // check if all class names contain only numbers and are not strings
  const allClassNamesAreNumbers = entries.every(([thickness, count]) => {
    return !isNaN(thickness);
  });

  // Sort the entries by the classnames if they are all numbers
  // Otherwise, sort by the count
  let sortIndex = 1 ? allClassNamesAreNumbers : 0;
  const sortedEntries = entries.sort((a, b) => {
    return parseFloat(a[sortIndex]) - parseFloat(b[sortIndex]);
  });

  const totalFlakes = flakes.length;
  const colors = ["blue", "cyan", "teal", "lime", "yellow", "orange", "red"];

  let currentIndex = 0;
  // Format the sorted entries
  const formattedArray = sortedEntries.map(([thickness, count]) => {
    const value = (count / totalFlakes) * 100;
    const color = colors[currentIndex % colors.length];
    const tooltip = `Class ${thickness} : ${count}`;
    currentIndex += 1;
    return {
      value: value,
      color: color,
      tooltip: tooltip,
      currentindex: currentIndex,
    };
  });

  return formattedArray;
}



function ScanInfo(props) {
  const [confidence, setConfidence] = useState(50);
  const [dataPercentage, setDataPercentage] = useState(95);

  useEffect(() => {
    setConfidence(50);
    setDataPercentage(95);
  }, [props.flakes]);

  let num_all_flakes = props.flakes.length;
  let sorted_flakes = props.flakes.sort((a, b) => {
    return a.size - b.size;
  });
  let flake_index = 0;
  let culled_flakes = sorted_flakes.filter((flake) => {
    flake_index += 1;
    return (
      flake.false_positive_probability <= 1 - confidence / 100 &&
      flake_index - 1 < (sorted_flakes.length * dataPercentage) / 100
    );
  });

  let formattedCounts = countAndSortFlakesByThickness(culled_flakes);
  if (formattedCounts.length === 0) {
    formattedCounts = [
      {
        value: 100,
        color: "gray",
        tooltip: "No Flakes Detected",
      },
    ];
  }
  return (
    <>
      <ScanInfoPlot flakes={culled_flakes} />
      <Group position="apart" grow className="py-1">
      <div>
      <Input.Label>Shown Data Percentage</Input.Label>
      <Slider
        label={(value) => `${value}%`}
        value={dataPercentage}
        onChange={(value) => setDataPercentage(value)}
      />
      </div>
      <div>
      <Input.Label>Minimal Confidence</Input.Label>
      <Slider
        label={(value) => `${value}%`}
        value={confidence}
        onChange={(value) => setConfidence(value)}
      />
      </div>
      </Group>
      <div className="pb-3">
        <Text>
          Detected {num_all_flakes} Flakes {"("} {culled_flakes.length} shown{" "}
          {")"}
        </Text>
        <Progress size="xl" sections={formattedCounts} />
        <Group position="center" className="pt-3">
          {formattedCounts.map((formattedCounts) => {
            return (
              <Badge
                color={formattedCounts.color}
                key={formattedCounts.currentindex}
                variant="light"
              >
                {formattedCounts.tooltip}
              </Badge>
            );
          })}
        </Group>
      </div>
    </>
  );
}

export default ScanInfo;
