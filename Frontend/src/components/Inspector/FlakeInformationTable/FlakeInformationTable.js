import { Table } from "@mantine/core";

import "./FlakeInformationTable.css";

function FlakeInformationTable(props) {
  return (
    <div className="row m-0 mt-3">
      <div className="col-4">
        <Table
          highlightOnHover
          verticalSpacing="xs"
          className="flakeInformationTable"
        >
          <thead>
            <tr>
              <th>Flake Key</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>ID</td>
              <td>{props.flake?.flake_id}</td>
            </tr>
            <tr>
              <td>Size</td>
              <td>{Math.round(props.flake?.flake_size)} μm²</td>
            </tr>
            <tr>
              <td>Thickness</td>
              <td>{props.flake?.flake_thickness}</td>
            </tr>
            <tr>
              <td>False Positive Probability</td>
              <td>
                {Math.round(
                  props.flake?.flake_false_positive_probability * 1000
                ) / 10}{" "}
                %
              </td>
            </tr>
          </tbody>
        </Table>
      </div>
      <div className="col-4">
        {" "}
        <Table
          highlightOnHover
          verticalSpacing="xs"
          className="flakeInformationTable"
        >
          <thead>
            <tr>
              <th>Flake Key</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Aspect Ratio</td>
              <td>{props.flake?.flake_aspect_ratio}</td>
            </tr>
            <tr>
              <td>Entropy</td>
              <td>{props.flake?.flake_entropy}</td>
            </tr>
            <tr>
              <td>Max Sidelength</td>
              <td>{Math.round(props.flake?.flake_max_sidelength)} μm</td>
            </tr>
            <tr>
              <td>Min Sidelength</td>
              <td>{Math.round(props.flake?.flake_min_sidelength)} μm</td>
            </tr>
          </tbody>
        </Table>
      </div>
      <div className="col-4">
        <Table
          highlightOnHover
          verticalSpacing="xs"
          className="flakeInformationTable"
        >
          <thead>
            <tr>
              <th>Chip Key</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>ID</td>
              <td>{props.flake?.chip_id}</td>
            </tr>
            <tr>
              <td>Wafer</td>
              <td>{props.flake?.chip_wafer}</td>
            </tr>
          </tbody>
        </Table>
      </div>
    </div>
  );
}
export default FlakeInformationTable;
