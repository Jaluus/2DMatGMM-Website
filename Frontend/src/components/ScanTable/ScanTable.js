import "./ScanTable.css";
import { useEffect, useState, useMemo } from "react";
import { getDataWithCache } from "../../utils/functions";
import { MantineReactTable } from "mantine-react-table";
import ScanTableActions from "./ScanTableActions";
import useCheckMobileScreen from "../../hooks/mobileDetector";
import { Tooltip } from "@mantine/core";
import ScanInfoModal from "./ScanInfoModal/ScanInfoModal";
import { notifications } from "@mantine/notifications";

const cache = {};

function getUniqueUsers(data) {
  let uniqueUsers = new Set();
  data.forEach((row) => uniqueUsers.add(row.scan_user));
  return Array.from(uniqueUsers);
}

function getUniqueMaterials(data) {
  let uniqueMaterials = new Set();
  data.forEach((row) =>
    row.scan_materials.forEach((material) => uniqueMaterials.add(material))
  );
  return Array.from(uniqueMaterials);
}

function truncateString(str, n) {
  return str.length > n ? str.slice(0, n - 1) + "..." : str;
}

const deleteScan = (scan_id, scanSetter) => {
  if (window.confirm(`Do you wish to delete Scan ${scan_id}?`)) {
    if (
      window.confirm(
        `Are you REALLY Sure, this is permanent\nYou are about to delete all associated files and entries in the Database`
      )
    ) {
      fetch(`${process.env.REACT_APP_BACKEND_URL}scans?scan_id=${scan_id}`, {
        method: "DELETE",
      }).then((response) => {
        scanSetter((prev) => {
          return prev.filter((scan) => scan.scan_id !== scan_id);
        });
        cache[process.env.REACT_APP_BACKEND_URL + "scans"] = cache[
          process.env.REACT_APP_BACKEND_URL + "scans"
        ].filter((scan) => scan.scan_id !== scan_id);
      });
    }
  }
};

function convertRemToPixels(rem) {
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

function ScanTable(props) {
  let scanLink = "/scanInspector";

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingInfoModal, setIsUpdatingInfoModal] = useState(false);
  const [scans, setScans] = useState([]);
  const [currentInfoScan, setCurrentInfoScan] = useState(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const users = getUniqueUsers(scans);
  const materials = getUniqueMaterials(scans);
  const isMobile = useCheckMobileScreen();

  const viewportHeight = window.innerHeight;
  const entryHeight = convertRemToPixels(2.5);
  const headerHeight = convertRemToPixels(5 + 1.5);
  const footerHeight = convertRemToPixels(1.5); //convertRemToPixels(1.5);
  const tableHeight =
    viewportHeight - headerHeight - footerHeight - entryHeight * 2;
  const tableHeightMobile = viewportHeight - convertRemToPixels(8);

  useEffect(() => {
    getDataWithCache(
      process.env.REACT_APP_BACKEND_URL + "scans",
      setScans,
      setIsLoading,
      cache
    );
  }, []);

  function closeInfoModal() {
    notifications.clean();
    setIsInfoModalOpen(false);
  }

  function showInfoModal(scan) {
    // set and open info in the modal
    setCurrentInfoScan(scan);
    setIsInfoModalOpen(true);
  }

  function handleUpdateScan(scan_id, scan_comment, scan_user, scan_name) {
    // push the new comment to the backend with a PUT request
    setIsUpdatingInfoModal(true);
    fetch(`${process.env.REACT_APP_BACKEND_URL}scan?scan_id=${scan_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        scan_comment: scan_comment,
        scan_user: scan_user,
        scan_name: scan_name,
      }),
    })
      .then((response) => {
        // Check if the response is OK (status code in the range 200-299)
        if (!response.ok) {
          // Throw an error if it's not
          throw new Error(
            `Network response was not ok: ${response.statusText}`
          );
        }
        return response;
      })
      .then((data) => {
        // update the cache
        cache[process.env.REACT_APP_BACKEND_URL + "scans"] = cache[
          process.env.REACT_APP_BACKEND_URL + "scans"
        ].map((scan) => {
          if (scan.scan_id === scan_id) {
            scan.scan_comment = scan_comment;
            scan.scan_user = scan_user;
            scan.scan_name = scan_name;
          }
          return scan;
        });

        // update the table
        setScans((prev) => {
          return prev.map((scan) => {
            if (scan.scan_id === scan_id) {
              scan.scan_comment = scan_comment;
              scan.scan_user = scan_user;
              scan.scan_name = scan_name;
            }
            return scan;
          });
        });
        setIsUpdatingInfoModal(false);
      })
      .catch((error) => {
        // Handle the error appropriately
        console.error(
          "There was a problem with the fetch operation:",
          error.message
        );

        // Optionally, provide feedback to the user about the error
        // For example, you can use a notification, alert, or update a UI component with the error message
        alert(`Failed to update scan. Error: ${error.message}`);
        setIsUpdatingInfoModal(false);
      });
  }

  const columns = useMemo(
    () => [
      {
        header: "Actions",
        enableColumnFilter: false,
        enableSorting: false,
        accessorFn: (row) => row,
        size: 50,
        minSize: 0,
        Cell: ({ cell }) => {
          let scan = cell.getValue();
          return (
            <ScanTableActions
              _id={scan.scan_id}
              onInfo={() => showInfoModal(scan)}
              link={scanLink}
              id={scan.scan_id}
              isLoading={isLoading}
            />
          );
        },
      },
      {
        accessorFn: (row) => row.scan_id,
        header: "ID",
        Cell: ({ cell }) => <b>{cell.getValue()}</b>,
        size: 20,
        minSize: 0,
        filterFn: "startsWith",
        enableColumnFilter: false,
        center: true,
      },
      {
        accessorFn: (row) => row.scan_name,
        header: "Name",
        size: 200,
        Cell: ({ cell }) => {
          let scan_name = cell.getValue();
          return (
            <Tooltip label={scan_name} position="top-start" closeDelay={100}>
              <div
                style={{
                  cursor: "default",
                }}
              >
                {truncateString(scan_name, 25)}
              </div>
            </Tooltip>
          );
        },
      },
      {
        accessorKey: "scan_user",
        header: "User",
        size: 100,
        minSize: 0,
        mantineFilterSelectProps: {
          data: users,
        },
        filterVariant: "select",
        mantineFilterTextInputProps: {
          placeholder: "Select User",
        },
      },
      {
        accessorKey: "scan_materials",
        header: "Materials",
        size: 100,
        minSize: 0,
        mantineFilterSelectProps: {
          data: materials,
        },
        filterVariant: "select",
        mantineFilterTextInputProps: {
          placeholder: "Select Material",
        },
      },
      {
        accessorKey: "scan_time",
        header: "Time",
        Cell: ({ cell }) => {
          let date = new Date(cell.getValue() * 1000);
          let day = date.getDate();
          let month = date.getMonth() + 1;
          let year = date.getFullYear();

          day = day < 10 ? "0" + day : day;
          month = month < 10 ? "0" + month : month;
          return (
            <>
              {day}.{month}.{year}
            </>
          );
        },
        size: 100,
        minSize: 0,
        enableColumnFilter: false,
      },
    ],
    [users, materials]
  );

  const mobileColumns = useMemo(
    () => [
      {
        header: "Actions",
        enableColumnFilter: false,
        size: 0,
        minSize: 0,
        accessorFn: (row) => row,
        Cell: ({ cell }) => {
          let scan = cell.getValue();
          return (
            <ScanTableActions
              _id={scan.scan_id}
              onInfo={() => showInfoModal(scan)}
              link={scanLink}
              id={scan.scan_id}
            />
          );
        },
      },
      {
        accessorFn: (row) => row.scan_id,
        header: "ID",
        Cell: ({ cell }) => <b>{cell.getValue()}</b>,
        size: 0,
        filterFn: "startsWith",
      },
      {
        accessorKey: "scan_name",
        header: "Name",
        Cell: ({ cell }) => {
          let scan_name = cell.getValue();
          return (
            <Tooltip.Floating label={scan_name}>
              <div>{truncateString(scan_name, 20)}</div>
            </Tooltip.Floating>
          );
        },
      },
    ],
    [users, materials]
  );

  const infoModal = (
    <ScanInfoModal
      currentScan={currentInfoScan}
      isOpened={isInfoModalOpen}
      isUpdating={isUpdatingInfoModal}
      onClose={closeInfoModal}
      onDelete={(scan_id) => deleteScan(scan_id, setScans)}
      onUpdate={(scan_comment, scan_user, scan_name) =>
        handleUpdateScan(
          currentInfoScan.scan_id,
          scan_comment,
          scan_user,
          scan_name
        )
      }
    />
  );

  if (!isMobile) {
    return (
      <div className="scanTable">
        {infoModal}
        <MantineReactTable
          columns={columns}
          data={scans}
          state={{ showSkeletons: isLoading }}
          enableGlobalFilter={false}
          enableFullScreenToggle={false}
          enableDensityToggle={false}
          enableHiding={false}
          enableStickyHeader
          enablePagination={true}
          enableBottomToolbar={false}
          initialState={{
            density: "xs",
            showColumnFilters: true,
            pagination: { pageSize: 25 },
          }}
          // mantineTableBodyCellProps={({ row }) => ({
          //   //add onClick to row to select upon clicking anywhere in the row
          //   onClick: () => {
          //     console.log(row);
          //   },
          // })}
          mantineTableContainerProps={{
            sx: { height: tableHeight, width: "100%" },
          }}
          renderTopToolbarCustomActions={({ table }) => {
            return (
              <h4 className="p-1">
                Managing <b>{scans.length} Scans</b>
              </h4>
            );
          }}
        />
      </div>
    );
  } else {
    return (
      <div className="scanTableMobile">
        {infoModal}
        <MantineReactTable
          columns={mobileColumns}
          data={scans}
          state={{ showSkeletons: isLoading }}
          enableGlobalFilter={false}
          enableFilters={false}
          enableStickyHeader
          enableFullScreenToggle={false}
          enableDensityToggle={false}
          enableHiding={false}
          enableColumnFilters={false}
          enableColumnActions={false}
          enablePagination={true}
          enableTopToolbar={false}
          enableBottomToolbar={false}
          mantinePaperProps={{ withBorder: false, shadow: "none" }}
          mantineTableContainerProps={{
            sx: { height: tableHeightMobile, width: "100%" },
          }}
          mantineBottomToolbarProps={{ sx: { height: headerHeight } }}
          mantineTableHeadCellProps={{ sx: { height: entryHeight } }}
          mantineTableBodyRowProps={{ sx: { height: entryHeight } }}
          initialState={{
            density: "md",
            showColumnFilters: false,
            pagination: { pageSize: 25 },
          }}
        />
      </div>
    );
  }
}

export default ScanTable;
