import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import * as d3 from "d3-array";
import { Text, Group, Paper } from "@mantine/core";
import "./ScanInfoPlot.css";

const getTexts = (payload) => {
  let texts = [];
  const colors = ["blue", "cyan", "teal", "lime", "yellow", "orange", "red"];
  let color_index = 0;
  for (const [key, value] of Object.entries(payload[0].payload)) {
    if (key.includes("num_flakes_")) {
      let class_name = key.replace("num_flakes_", "");
      if (value > 0) {
        texts.push(
          <Text c={colors[color_index % colors.length]}>{`Class ${class_name}: ${value} Flakes`}</Text>
        );
      }
      color_index += 1;
    }
  }
  if (texts.length === 0) {
    texts.push(<Text>No Flakes</Text>);
  }
  // invert the order of the texts
  texts = texts.reverse();
  return texts;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper p="xs" withBorder>
        <Text>{`${payload[0].payload.bin_left} - ${payload[0].payload.bin_right} μm²`}</Text>
        {getTexts(payload)}
      </Paper>
    );
  }

  return null;
};

function getMinMaxSizes(flakes) {
  let min = 0;
  let max = 0;
  if (flakes.length > 0) {
    min = flakes[0].size;
    max = flakes[0].size;
  }
  flakes.forEach((flake) => {
    if (flake.size < min) {
      min = flake.size;
    }
    if (flake.size > max) {
      max = flake.size;
    }
  });
  return [min, max];
}

function ScanInfoPlot(props) {
  let flakes = props.flakes;
  let flake_classes = [...new Set(flakes.map((flake) => flake.thickness))];

  let all_flake_classes_numerical = flake_classes.every((val) =>
    !isNaN(val)
  );
  if (all_flake_classes_numerical) {
    flake_classes = flake_classes.map((val) => parseInt(val));
    flake_classes.sort((a, b) => a - b);
  }
  else {
    flake_classes.sort();
  }

  // generate a histogram for each flake class

  let all_flake_sizes = flakes.map((flake) => flake.size);
  let min = 0;
  let max = 1000;
  [min, max] = getMinMaxSizes(flakes);

  const hist_generator = d3.bin();
  hist_generator.domain([min, max]);
  hist_generator.thresholds(
    d3.thresholdFreedmanDiaconis(all_flake_sizes, min, max)
  );

  // Array 1: Len: Number of bins
  // [
  // {bin_left, bin_right},
  // {bin_left, bin_right},
  // {bin_left, bin_right},
  // {bin_left, bin_right},
  // {bin_left, bin_right},
  // ]

  // Array 2: Len Number of flake classes
  // [
  // {num_flakes_2},
  // {num_flakes_1},
  // {num_flakes_3},
  // ]

  // Array Final: Len Number of bins
  // [
  // {bin_left, bin_right, num_flakes_1, num_flakes_2, num_flakes_3, ...},
  // {bin_left, bin_right, num_flakes_1, num_flakes_2, num_flakes_3, ...},
  // {bin_left, bin_right, num_flakes_1, num_flakes_2, num_flakes_3, ...},
  // {bin_left, bin_right, num_flakes_1, num_flakes_2, num_flakes_3, ...},
  // {bin_left, bin_right, num_flakes_1, num_flakes_2, num_flakes_3, ...},
  // ]

  // Step 1: Generate the bins (Array 1)
  let base_bins = hist_generator([]);
  let base_bin_structures = base_bins.map((bin) => ({
    bin_left: bin.x0,
    bin_right: bin.x1,
  }));

  // Step 2: For each flake_class, calculate the bin counts (Array 2)
  flake_classes.forEach((flake_class) => {
    let flakes_of_class = flakes.filter(
      (flake) => flake.thickness == flake_class
    );
    let flake_sizes = flakes_of_class.map((flake) => flake.size);
    let num_flake_key = `num_flakes_${flake_class}`;
    const histBins = hist_generator(flake_sizes);

    // Step 3: Accumulate these counts onto the previously generated bins
    histBins.forEach((bin, index) => {
      if (base_bin_structures[index]) {
        base_bin_structures[index][num_flake_key] = bin.length;
      }
    });
  });

  function getBars(bin_structure) {
    let bars = [];
    const colors = [
      "#228be6",
      "#15aabf",
      "#12b886",
      "#82c91e",
      "#fab005",
      "#fd7e14",
      "#fa5252",
    ];

    let color_index = 0;
    for (const [key, value] of Object.entries(bin_structure)) {
      if (key.includes("num_flakes_")) {
        bars.push(
          <Bar
            dataKey={key}
            fill={colors[color_index % colors.length]}
            stackId="a"
            name="Number of Flakes"
          />
        );
        color_index += 1;
      }
    }
    return bars;
  }

  return (
    <>
      <Group position="center">
        <Text>Flake Size Histogram</Text>
      </Group>
      <ResponsiveContainer width={"100%"} aspect={4.0 / 2.0}>
        <BarChart
          data={base_bin_structures}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="bin_left" unit="μm²" />
          <YAxis width={45} />
          <Tooltip content={<CustomTooltip />} />
          {getBars(base_bin_structures[0])}
        </BarChart>
      </ResponsiveContainer>
    </>
  );
}

export default ScanInfoPlot;
