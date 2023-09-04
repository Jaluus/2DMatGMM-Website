import "./FlakeIndexBannerMobile.css";

function FlakeIndexBannerMobile(props) {
  return (
    <div className="FlakeIndexBannerMobile">
      <b>
        Showing Flake {props.currentFlakeIndex + 1} of {props.numFilteredFlakes}{" "}
        ({props.numTotalFlakes})
      </b>
    </div>
  );
}

export default FlakeIndexBannerMobile;
