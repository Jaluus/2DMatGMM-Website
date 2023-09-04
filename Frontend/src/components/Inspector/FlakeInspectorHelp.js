import { Modal, Group, ActionIcon, Table, Kbd, Divider } from "@mantine/core";
import { useState } from "react";
import { IconQuestionMark, IconFilter } from "@tabler/icons-react";

function FlakeInspectorHelp() {
  const [opened, setOpened] = useState(false);

  return (
    <>
      <Modal
        opened={opened}
        overlayOpacity={0.55}
        overlayBlur={3}
        onClose={() => setOpened(false)}
        title={<b>General Help</b>}
      >
        <Divider my="sm" label="Filtering" />
        You can filter flakes by clicking the filter (<IconFilter />) in the
        Header.
        <Divider my="sm" label="Favorite Flakes" />
        When you select flakes as favorites they are saved locally in your
        Browser. When clearing your cookies the website might forget your
        favorites.
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
      </Modal>

      <Group position="center" className="mx-3">
        <ActionIcon size="xl" variant="default" onClick={() => setOpened(true)}>
          <IconQuestionMark />
        </ActionIcon>
      </Group>
    </>
  );
}

export default FlakeInspectorHelp;
