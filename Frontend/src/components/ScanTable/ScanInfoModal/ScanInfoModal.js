import { Group, Loader, Modal } from "@mantine/core";
import "./ScanInfoModal.css";
import { useEffect, useState, useRef } from "react";
import ScanInfo from "./ScanInfo";
import ScanInfoInputs from "./ScanInfoInputs";

function getDataFromAPI(setter, loadSetter, scan_id) {
  if (scan_id === null || scan_id === undefined) {
    setter(null);
    return;
  }

  loadSetter(true); // Set loading to true as you're about to fetch data

  fetch(`${process.env.REACT_APP_BACKEND_URL}stats/scan?scan_id=${scan_id}`, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      setter(data);
      loadSetter(false); // Set loading to false after data has been set
    })
    .catch((error) => {
      console.error("There was an error fetching the data:", error);
      loadSetter(false); // Set loading to false if there was an error
    });
}

function extractFlakes(scan) {
  let flakes = scan.chips.map((chip) => {
    return chip.flakes;
  });
  flakes = [].concat.apply([], flakes);
  return flakes;
}

function ScanInfoModal(props) {
  let scan_id = props.currentScan?.scan_id;
  const [currentScan, setCurrentScan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const prevIsOpenedRef = useRef();

  // only fetch data if the modal is opened
  // the prevIsOpenedRef is used to check if the modal was opened before
  useEffect(() => {
    const currentIsOpened = props.isOpened;
    if (!prevIsOpenedRef.current && currentIsOpened) {
      getDataFromAPI(setCurrentScan, setIsLoading, scan_id);
    }
    prevIsOpenedRef.current = currentIsOpened;
  }, [props.isOpened]);

  // the scan has an array of chips
  // each chips is a dict with an array for flakes
  let flakes = [];
  if (currentScan != null && currentScan != undefined) {
    flakes = extractFlakes(currentScan);
  }

  const modalBody = (
    <Modal.Body>
      <ScanInfo flakes={flakes} />
      <ScanInfoInputs
        currentScan={currentScan}
        currentScanSetter={setCurrentScan}
        onUpdate={props.onUpdate}
        onDelete={props.onDelete}
        isUpdating={props.isUpdating}
      />
    </Modal.Body>
  );

  const modalBodyLoading = (
    <Modal.Body>
      <Group position="center" style={{ height: "300px" }}>
        <Loader size="xl" variant="dots" />
      </Group>
    </Modal.Body>
  );

  const modalTitle = (
    <Modal.Title>
      <b>Info about Scan {currentScan?.name}</b>
    </Modal.Title>
  );

  const modalTitleLoading = (
    <Modal.Title>
      <b>Fetching from the API...</b>
    </Modal.Title>
  );

  return (
    <>
      <Modal.Root opened={props.isOpened} onClose={props.onClose}>
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Header>
            <Modal.Title>
              {isLoading ? modalTitleLoading : modalTitle}
            </Modal.Title>
            <Modal.CloseButton />
          </Modal.Header>
          {isLoading ? modalBodyLoading : modalBody}
        </Modal.Content>
      </Modal.Root>
    </>
  );
}

export default ScanInfoModal;
