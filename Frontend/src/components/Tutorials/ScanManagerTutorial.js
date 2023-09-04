import {
  Modal,
  Button,
  Group,
  Text,
  Checkbox,
  Divider,
} from "@mantine/core";
import { useState } from "react";
import { IconArrowRight, IconInfoHexagon, IconHelpHexagon } from "@tabler/icons-react";
import useCheckMobileScreen from "../../hooks/mobileDetector";

function ScanManagerTutorial() {
  const keyName = "mantine-scan-manager-tutorial";
  const [isOpened, setIsOpened] = useState(
    !(localStorage.getItem(keyName) === "dontShowAgain")
  );
  const [dontShowAgain, setDontShowAgain] = useState(
    localStorage.getItem(keyName) === "dontShowAgain"
  );

  const isMobile = useCheckMobileScreen();

  const mobileHTML = (
    <>
      Welcome to the demo website showcasing a flake database used by the
      automated 2D Material detection algorithm outlined in{" "}
      <a href="https://arxiv.org/abs/2306.14845" target="_blank">
        this paper
      </a>
      .
    </>
  );
  const desktopHTML = (
    <>
      Welcome to the demo website showcasing a flake database used by the
      automated 2D Material detection algorithm outlined in the paper <a href="https://arxiv.org/abs/2306.14845" target="_blank">"An
      open-source robust machine learning platform for real-time detection and
      classification of 2D material flakes"</a>.
    </>
  );

  const ToggleDontShowAgain = (event) => {
    localStorage.setItem(
      keyName,
      event.currentTarget.checked ? "dontShowAgain" : "ShowAgain"
    );
    setDontShowAgain(event.currentTarget.checked);
  };

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
        size="md"
        styles={{inner: {"paddingTop": "2vh !important"}}}
        yOffset={isMobile ? "4rem" : "10vh"}
      >
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Header>
            <Modal.Title>
              <b>Flake Database Demo</b>
            </Modal.Title>
            <Modal.CloseButton />
          </Modal.Header>
          <Modal.Body>
            <Text>{isMobile ? mobileHTML : desktopHTML}</Text>
            <Divider my="sm" label="Accessing Scans" />
            <Text>
              To access a scan, click on the <IconArrowRight /> icon. <br/> 
              This will open the Scan Inspector.
            </Text>
            <Divider my="sm" label="Scan Metadata" />
            <Text>
              To inspect the metadata of a scan, click on the <IconInfoHexagon /> icon. <br/>
              
            </Text>
            <Divider my="sm" label="More Information" />
            <Text>
              For more information about the algorithm, the database setup or
              the how the images are generated check out the{" "}
              <a href="https://arxiv.org/abs/2306.14845" target="_blank">
                paper
              </a>{" "}
              or the{" "}
              <a href="https://github.com/Jaluus/2DMatGMM" target="_blank">
                Git repository
              </a>
              .
            </Text>
            <br />
            <Group position="apart">
              <Checkbox
                label="Dont show this again"
                onChange={ToggleDontShowAgain}
                checked={dontShowAgain}
              />
              <Button onClick={() => setIsOpened(false)}>Got It!</Button>
            </Group>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>

      <Button
        component="a"
        leftIcon={<IconHelpHexagon size="1rem" />}
        variant="default"
        onClick={() => setIsOpened(true)}
      >
        Help
      </Button>
    </>
  );
}

export default ScanManagerTutorial;
