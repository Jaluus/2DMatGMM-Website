import { IconTrash, IconReload } from "@tabler/icons-react";
import { Button, Group, TextInput, Textarea, Accordion } from "@mantine/core";
import { notifications } from "@mantine/notifications";

function setCurrentComment(setter, comment) {
  setter((prev) => {
    return {
      ...prev,
      comment: comment,
    };
  });
}

function setCurrentUser(setter, user) {
  setter((prev) => {
    return {
      ...prev,
      user: user,
    };
  });
}

function setCurrentName(setter, name) {
  setter((prev) => {
    return {
      ...prev,
      name: name,
    };
  });
}

function validateUpdate(updater, comment, user, name) {
  if (user === null || user === undefined || user === "") {
    notifications.show({
      variant: "outline",
      withCloseButton: true,
      autoClose: 5000,
      title: "User Error",
      message: "You need to give a name to update the scan",
      color: "red",
      loading: false,
    });
    return;
  }
  if (name === null || name === undefined || name === "") {
    notifications.show({
      variant: "outline",
      withCloseButton: true,
      autoClose: 5000,
      title: "Name Error",
      message: "You need to give a name to update the scan",
      color: "red",
      loading: false,
    });
    return;
  }

  // comment over 255 characters
  if (comment.length > 255) {
    notifications.show({
      variant: "outline",
      withCloseButton: true,
      autoClose: 5000,
      title: "Comment Length Error",
      message: `The comment is too long, please keep it under 255 characters (current: ${comment.length})`,
      color: "red",
      loading: false,
    });
    return;
  }

  // user over 255 characters
  if (user.length > 255) {
    notifications.show({
      variant: "outline",
      withCloseButton: true,
      autoClose: 5000,
      title: "Username Length Error",
      message: `The Username is too long, please keep it under 255 characters (current: ${user.length})`,
      color: "red",
      loading: false,
    });
    return;
  }

  updater(comment, user, name);
}

function ScanInfoInputs(props) {
  let currentScan = props.currentScan;
  let setCurrentScan = props.currentScanSetter;

  return (
    <>
      <Accordion variant="filled">
        <Accordion.Item value="Metadata">
          <Accordion.Control>View Metadata</Accordion.Control>
          <Accordion.Panel>
            <TextInput
              disabled
              label="Name"
              placeholder="Add a Name to the Scan"
              value={currentScan?.name}
              onChange={(event) => {
                setCurrentName(setCurrentScan, event.currentTarget.value);
              }}
              withAsterisk
            />
            <TextInput
              label="User"
              placeholder="Add a User to the Scan"
              value={currentScan?.user}
              onChange={(event) => {
                setCurrentUser(setCurrentScan, event.currentTarget.value);
              }}
              withAsterisk
            />
            <Textarea
              label="Comment"
              placeholder="Add a Comment to the Scan"
              maxRows={4}
              minRows={4}
              value={currentScan?.comment}
              onChange={(event) => {
                setCurrentComment(setCurrentScan, event.currentTarget.value);
              }}
            />
            <Group position="apart" className="pt-3">
              <Button
                leftIcon={<IconTrash size={15} />}
                variant="gradient"
                gradient={{ from: "orange", to: "red" }}
                onClick={() => props.onDelete(currentScan.id)}
              >
                Delete
              </Button>
              <Button
                variant="gradient"
                gradient={{ from: "indigo", to: "blue" }}
                onClick={() =>
                  validateUpdate(
                    props.onUpdate,
                    currentScan?.comment,
                    currentScan?.user,
                    currentScan?.name
                  )
                }
                loading={props.isUpdating}
                leftIcon={<IconReload size={15} />}
              >
                Update
              </Button>
            </Group>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </>
  );
}

export default ScanInfoInputs;
