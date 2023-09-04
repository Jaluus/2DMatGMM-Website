import {
  Modal,
  Button,
  Group,
  Text,
  Checkbox,
  Divider,
  Kbd,
  Table,
  ActionIcon,
  Space,
} from "@mantine/core";
import { useState } from "react";
import {
  IconFilter,
  IconQuestionMark,
  IconArrowLeft,
  IconArrowRight,
  IconMenu2,
} from "@tabler/icons-react";
import "./ScanInspectorTutorial.css";
import useCheckMobileScreen from "../../hooks/mobileDetector";

function ScanInspectorTutorial() {
  const keyName = "mantine-flake-manager-tutorial";
  const [isOpened, setIsOpened] = useState(
    !(localStorage.getItem(keyName) === "dontShowAgain")
  );
  const [dontShowAgain, setDontShowAgain] = useState(
    localStorage.getItem(keyName) === "dontShowAgain"
  );
  const ToggleDontShowAgain = (event) => {
    localStorage.setItem(
      keyName,
      event.currentTarget.checked ? "dontShowAgain" : "ShowAgain"
    );
    setDontShowAgain(event.currentTarget.checked);
  };
  const isMobile = useCheckMobileScreen();

  const mobileHTML = (
    <>
      <Text>
        Welcome to the Scan Inspector! This is where you can view the detected
        flakes. Navigate the flakes by tapping the <IconArrowLeft /> or{" "}
        <IconArrowRight /> buttons in the footer or tapping the <IconMenu2 />{" "}
        icon in the header.
      </Text>
      <Divider my="sm" label="Viewing Flakes" />
      <Text>
        The toolbar on top of the image allows you to adjust the magnification
        level of the image by tapping the corresponding magnification buttons.
      </Text>
      <Divider my="sm" label="Filtering Flakes" />
      <Text>
        You can filter flakes by clicking the <IconFilter /> icon in the header.
        This opens a filter menu with multiple options.
      </Text>
      <Divider my="sm" label="Favorite Flakes" />
      <Text>
        You can select a flake as a favorite by clicking the ❤️ icon or mark
        them by clicking the ❌ icon.
      </Text>
      <Space h="md" />
      <Group position="apart">
        <Checkbox
          label="Dont show this again"
          onChange={ToggleDontShowAgain}
          checked={dontShowAgain}
        />
        <Button onClick={() => setIsOpened(false)}>Got It!</Button>
      </Group>
    </>
  );
  const desktopHTML = (
    <>
      <Text>
        Welcome to the Scan Inspector! This is where you can view all the
        detected flakes and their associated metadata. You can navigate the
        detected flakes by clicking the rows in the table on the left.
      </Text>
      <Divider my="sm" label="Viewing Flakes" />
      <Text>
        The left panel shows the image used by the algorithm to classify the
        flake. <br></br>
        The right panel shows the centered flake with the scalebar.
      </Text>
      <Divider my="sm" label="Filtering Flakes" />
      <Text>
        You can filter flakes by clicking the <IconFilter /> icon in the header.
        This opens a filter menu with multiple options.
      </Text>
      <Divider my="sm" label="Favorite Flakes" />
      <Text>
        You can select a flake as a favorite by clicking the ❤️ icon. <br></br>
        Furthermore you can mark a flake as used by clicking the ❌ icon.
      </Text>
      <Divider my="sm" label="Downloading and Saving Flakes" />
      <Text>
        To download a flake with all images and metadata click the <Kbd>Download</Kbd> button. <br></br>
        Clicking the <Kbd>Download \w Scalebar</Kbd> button will download the flakes with a
        scalebar.
      </Text>
      <Divider my="sm" label="Keyboard Hotkeys" />
      <Table>
        <thead>
          <tr>
            <th>Key</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <Kbd>↑</Kbd> / <Kbd>↓</Kbd>
            </td>
            <td>Navigate to the previous / next Flake</td>
          </tr>
          <tr>
            <td>
              <Kbd>←</Kbd> / <Kbd>→</Kbd>
            </td>
            <td>Decrease / Increase the Magnification</td>
          </tr>
          <tr>
            <td>
              <Kbd>Q</Kbd>
            </td>
            <td>Delete the current Flake</td>
          </tr>
          <tr>
            <td>
              <Kbd>X</Kbd>
            </td>
            <td>Toggle the current Flake as favorite</td>
          </tr>
        </tbody>
      </Table>
      <br />
      <Group position="apart">
        <Checkbox
          label="Dont show this again"
          onChange={ToggleDontShowAgain}
          checked={dontShowAgain}
        />
        <Button onClick={() => setIsOpened(false)}>Got It!</Button>
      </Group>
    </>
  );

  return (
    <>
      <Modal.Root
        opened={isOpened}
        onClose={() => setIsOpened(false)}
        closeOnClickOutside={true}
        overlayProps={{
          opacity: 0.55,
          blur: 3,
        }}
        size="xl"
      >
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Header>
            <Modal.Title>
              <b>Scan Inspector Tutorial</b>
            </Modal.Title>
            <Modal.CloseButton />
          </Modal.Header>
          <Modal.Body>{isMobile ? mobileHTML : desktopHTML}</Modal.Body>
        </Modal.Content>
      </Modal.Root>
      <Group position="center" className="ScanInspectorTutorialButton">
        <ActionIcon
          size="xl"
          variant="default"
          onClick={() => setIsOpened(true)}
        >
          <IconQuestionMark />
        </ActionIcon>
      </Group>
    </>
  );
}

export default ScanInspectorTutorial;
