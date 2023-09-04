import { Tooltip } from "@mantine/core";

import "./FlakeInspectorNoScan.css";

function FlakeInspectorNoScan() {
  return (
    <div className="noFlakes">
      <Tooltip.Floating label="Probably Go back please :)" color="blue">
        <h1>You did not select a Scan!</h1>
      </Tooltip.Floating>
    </div>
  );
}

export default FlakeInspectorNoScan;
