import "./FlakeManager.css";
import ScanHeader from "../components/ScanHeader";
import FlakeManagerBanner from "../components/FlakeManager/FlakeManagerBanner";
import FlakeManagerSearchField from "../components/FlakeManager/FlakeManagerSearchField";
import { useEffect, useState } from "react";
import { getData } from "../utils/functions";

const FlakeManager = () => {
  const [users, setUsers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [combinations, setCombinations] = useState([]);
  useEffect(() => {
    getData(process.env.REACT_APP_BACKEND_URL + "users", setUsers);
    getData(process.env.REACT_APP_BACKEND_URL + "materials", setMaterials);
    getData(
      process.env.REACT_APP_BACKEND_URL + "uniqueCombinations",
      setCombinations
    );
  }, []);

  return (
    <div className="FlakeManagerMainDiv">
      <ScanHeader></ScanHeader>
      <FlakeManagerBanner />
      <FlakeManagerSearchField
        userData={users}
        materialData={materials}
        materialCombinations={combinations}
      />
    </div>
  );
};

export default FlakeManager;
