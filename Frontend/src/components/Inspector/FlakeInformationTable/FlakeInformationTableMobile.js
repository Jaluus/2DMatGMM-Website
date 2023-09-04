import { Table } from "@mantine/core";

import "./FlakeInformationTableMobile.css";

function FlakeInformationTableMobile(props) {
  return (
    <div className="m-0 FlakeInformationTableMobileMainDiv">
      <div className="FlakeInformationTableMobileColumnLeft">
        <Table
          highlightOnHover
          verticalSpacing="xs"
          className="FlakeInformationTableMobile"
        >
          <thead>
            <tr>
              <th>Key</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Flake ID</td>
              <td>{props.flake?.flake_id}</td>
            </tr>
            <tr>
              <td>Thickness</td>
              <td>{props.flake?.flake_thickness}</td>
            </tr>
            <tr>
              <td>Size</td>
              <td>{Math.round(props.flake?.flake_size)} μm²</td>
            </tr>
            <tr>
              <td>Long Side</td>
              <td>{Math.round(props.flake?.flake_max_sidelength)} μm</td>
            </tr>
            <tr>
              <td>Short Side</td>
              <td>{Math.round(props.flake?.flake_min_sidelength)} μm</td>
            </tr>
          </tbody>
        </Table>
      </div>
      <div className="FlakeInformationTableMobileColumnRight">
        <Table
          highlightOnHover
          verticalSpacing="xs"
          className="FlakeInformationTableMobile"
        >
          <thead>
            <tr>
              <th>Key</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Scan ID</td>
              <td>{props.flake?.scan_id}</td>
            </tr>
            <tr>
              <td>Chip ID</td>
              <td>{props.flake?.chip_id}</td>
            </tr>
            <tr>
              <td>Material</td>
              <td>{props.flake?.chip_material}</td>
            </tr>
            <tr>
              <td>Wafer</td>
              <td>{props.flake?.chip_wafer}</td>
            </tr>
            <tr>
              <td>FP Prob.</td>
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
    </div>
  );
}
export default FlakeInformationTableMobile;
