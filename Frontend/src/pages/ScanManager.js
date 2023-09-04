import ScanHeader from "../components/ScanHeader";
import ScanFooter from "../components/ScanFooter";
import ScanTable from "../components/ScanTable/ScanTable";
import useCheckMobileScreen from "../hooks/mobileDetector";
import ScanHeaderMobile from "../components/ScanHeaderMobile";

const ScanManager = () => {
  const isMobile = useCheckMobileScreen();

  return (
    <div>
      {isMobile ? <ScanHeaderMobile /> : <ScanHeader />}
      <ScanTable />
      <ScanFooter />
    </div>
  );
};

export default ScanManager;
