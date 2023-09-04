import "./ScanInspector.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import FlakeTable from "../components/Inspector/FlakeTable/FlakeTable";
import FlakeInspectorHeader from "../components/Inspector/FlakeInspectorHeader";
import FlakeInspector from "../components/Inspector/FlakeInspector";
import FlakeInspectorNoFlakes from "../components/Inspector/FlakeInformationBanners/FlakeInspectorNoFlakes";
import { getDataWithLoading } from "../utils/functions";
import useCheckMobileScreen from "../hooks/mobileDetector";
import FlakeInspectorWait from "../components/Inspector/FlakeInformationBanners/FlakeInspectorWait";
import FlakeInspectorHeaderMobile from "../components/Inspector/FlakeInspectorHeaderMobile";
import { useHotkeys } from "@mantine/hooks";
import { Paper } from "@mantine/core";

const checkRange = (value, minMax) => {
  return (
    value >= (minMax === null ? 0 : minMax[0]) &&
    value <= (minMax === null ? Infinity : minMax[1])
  );
};

const downloadHandler = (flake_id, scalebar) => {
  if (scalebar) {
    window.location.href = `${process.env.REACT_APP_BACKEND_URL}download/flake?flake_id=${flake_id}&scalebar=1`;
  } else {
    window.location.href = `${process.env.REACT_APP_BACKEND_URL}download/flake?flake_id=${flake_id}`;
  }
};

const ScanInspector = () => {
  let id = undefined;
  const { state } = useLocation();
  if (state !== undefined && state !== null) {
    id = state["id"];
  }

  const navigate = useNavigate();
  const flakesURL = `${process.env.REACT_APP_BACKEND_URL}flakes?scan_id=${id}`;
  const isMobile = useCheckMobileScreen();

  const [currentFlakeIndex, setCurrentFlakeIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [flakes, setFlakes] = useState([]);

  const [filterSettings, setFilterSettings] = useState({
    flake_thickness: [],
    chip_id: [],
    setSort: "flake_id",
    order: "1",
    favorite: false,
    size_range: [null, null],
    aspect_ratio_range: [null, null],
    false_positive_probability_range: [0, 0.5],
    entropy_range: [null, null],
  });

  // Getting the data from the server
  useEffect(() => {
    getDataWithLoading(flakesURL, setFlakes, setIsLoading);
  }, []);

  useEffect(() => {
    setCurrentFlakeIndex(0);
  }, [filterSettings]);

  const deleteHandler = (flake_id) => {
    if (window.confirm("Are you sure you want to delete this flake?")) {
      fetch(`${process.env.REACT_APP_BACKEND_URL}flakes?flake_id=${flake_id}`, {
        method: "DELETE",
      }).then((response) => {
        setFlakes(flakes.filter((flake) => flake.flake_id !== flake_id));
      });
    }
  };

  const favoriteHandler = (flake_id) => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}favorite?flake_id=${flake_id}`, {
      method: "GET",
    }).then((response) => {
      // Okay, this might be a bit hard to understand directly, but it's basically
      // we look for the flake we just favorited, if we get a match we copy everything about the flake execpt the flake_favorite status
      // this is toggled
      setFlakes(
        flakes.map((flake) =>
          flake.flake_id === flake_id
            ? { ...flake, flake_favorite: !flake.flake_favorite }
            : flake
        )
      );
    });
  };

  const usedHandler = (flake_id) => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}used?flake_id=${flake_id}`, {
      method: "GET",
    }).then((response) => {
      setFlakes(
        flakes.map((flake) =>
          flake.flake_id === flake_id
            ? { ...flake, flake_used: !flake.flake_used }
            : flake
        )
      );
    });
  };

  useHotkeys([
    ["arrowUp", () => previousFlake()],
    ["arrowDown", () => nextFlake()],
    ["q", () => deleteCurrentFlake()],
    ["x", () => favoriteCurrentFlake()],
  ]);

  const nextFlake = () => {
    if (currentFlakeIndex < filteredFlakes.length - 1) {
      setCurrentFlakeIndex(currentFlakeIndex + 1);
    }
  };

  const previousFlake = () => {
    if (currentFlakeIndex > 0) {
      setCurrentFlakeIndex(currentFlakeIndex - 1);
    }
  };

  const deleteCurrentFlake = () => {
    deleteHandler(filteredFlakes[currentFlakeIndex].flake_id);
  };

  const favoriteCurrentFlake = () => {
    favoriteHandler(filteredFlakes[currentFlakeIndex].flake_id);
  };

  const flakeFilter = (flake) => {
    let isThickness =
      filterSettings.flake_thickness.includes(flake.flake_thickness) ||
      filterSettings.flake_thickness.length === 0;
    let isChipID =
      filterSettings.chip_id.includes(flake.chip_id) ||
      filterSettings.chip_id.length === 0;
    let isSize = checkRange(flake.flake_size, filterSettings.size_range);
    let isAspectRatio = checkRange(
      flake.flake_aspect_ratio,
      filterSettings.aspect_ratio_range
    );
    let isFalsePositive = checkRange(
      flake.flake_false_positive_probability,
      filterSettings.false_positive_probability_range
    );
    let isEntropy = checkRange(
      flake.flake_entropy,
      filterSettings.entropy_range
    );
    return (
      isThickness &&
      isChipID &&
      isSize &&
      isAspectRatio &&
      isFalsePositive &&
      isEntropy
    );
  };

  const filterAndSortFlakes = (flake_array) => {
    if (filterSettings.favorite) {
      flake_array = flake_array.filter((flake) => flake.flake_favorite);
    }

    flake_array = flake_array.filter(flakeFilter);

    flake_array.sort((a, b) => {
      if (a[filterSettings.setSort] < b[filterSettings.setSort]) {
        return 1 * parseInt(filterSettings.order);
      }
      if (a[filterSettings.setSort] > b[filterSettings.setSort]) {
        return -1 * parseInt(filterSettings.order);
      }
      return 0;
    });

    return flake_array;
  };

  // first filtering and then sorting the flakes
  let filteredFlakes = useMemo(
    () => filterAndSortFlakes(flakes),
    [flakes, filterSettings]
  );

  const currentFlake = filteredFlakes[currentFlakeIndex];

  if (id === undefined) {
    // if the id is undefined navigate to the root
    return navigate("/");
  }

  if (!isMobile) {
    return (
      <div>
        <FlakeInspectorHeader
          flakes={flakes}
          filterSettings={filterSettings}
          setFilterSettings={setFilterSettings}
        ></FlakeInspectorHeader>
        <div className="scanInspectorMainDiv">
          <Paper className="scanInspectorFlakeTableTray" withBorder radius={0}>
            <FlakeTable
              flakeData={filteredFlakes}
              numTotalFlakes={flakes.length}
              selectedIndex={currentFlakeIndex}
              onClickFlake={(index) => setCurrentFlakeIndex(index)}
              onFavorite={favoriteHandler}
              onUsed={usedHandler}
              isLoading={isLoading}
            ></FlakeTable>
          </Paper>
          <div className="scanInspectorFlakeInspector">
            {isLoading ? (
              <FlakeInspectorWait />
            ) : filteredFlakes.length > 0 ? (
              <FlakeInspector
                onDelete={deleteHandler}
                onDownload={downloadHandler}
                flake={currentFlake}
                onFavorite={favoriteHandler}
                onUsed={usedHandler}
              ></FlakeInspector>
            ) : (
              <FlakeInspectorNoFlakes />
            )}
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div>
        <FlakeInspectorHeaderMobile
          flakes={flakes}
          filterSettings={filterSettings}
          setFilterSettings={setFilterSettings}
          flakeData={filteredFlakes}
          numTotalFlakes={flakes.length}
          selectedIndex={currentFlakeIndex}
          onClickFlake={(index) => setCurrentFlakeIndex(index)}
          onFavorite={favoriteHandler}
          onUsed={usedHandler}
          isLoading={isLoading}
        ></FlakeInspectorHeaderMobile>
        {isLoading ? (
          <FlakeInspectorWait />
        ) : filteredFlakes.length > 0 ? (
          <FlakeInspector
            onDelete={deleteHandler}
            onDownload={downloadHandler}
            flake={currentFlake}
            onFavorite={favoriteHandler}
            onUsed={usedHandler}
            onNext={nextFlake}
            onPrevious={previousFlake}
            currentFlakeIndex={currentFlakeIndex}
            numFilteredFlakes={filteredFlakes.length}
            numTotalFlakes={flakes.length}
          ></FlakeInspector>
        ) : (
          <FlakeInspectorNoFlakes />
        )}
      </div>
    );
  }
};

export default ScanInspector;
