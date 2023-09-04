import "./ScanFooter.css";
import useCheckMobileScreen from "../hooks/mobileDetector";

function ScanFooter(props) {

  const isMobile = useCheckMobileScreen();
  if (isMobile){
    return null;
  }

  return (
    <div className="ScanFooterImagePos">
        <a href="http://www.graphene.ac" target="_blank">
          <img
            src="\Logo_AG2D_Center.svg"
            alt="www.graphene.ac Logo"
            className="ScanFooterLogo"
          />
        </a>
    </div>
  );
}

export default ScanFooter;
