import "./ScanHeader.css";
import { Group, Header, Stack, Button } from "@mantine/core";
import { IconSchool, IconBrandGithub } from "@tabler/icons-react";
import ScanManagerTutorial from "./Tutorials/ScanManagerTutorial";

function ScanHeader(props) {
  return (
    <Header className="scanHeader">
      <div className="scanHeaderDiv">
        <Group position="apart">
          <Stack spacing="0">
            <span className="scanHeaderTextMain">
              2D Material Flake Database
            </span>
            <span className="scanHeaderTextSubtext">
              <a
                href="https://institut2a.physik.rwth-aachen.de/start/"
                className="nostyle"
                target="_blank"
              >
                of the 2nd Institute of Physics A, RWTH Aachen University
              </a>
            </span>
          </Stack>
          <Group>
            <ScanManagerTutorial />
            <Button
              component="a"
              leftIcon={<IconBrandGithub size="1rem" />}
              variant="default"
              href="https://github.com/Jaluus/2DMatGMM"
              target="_blank"
            >
              Github
            </Button>
            <Button
              component="a"
              leftIcon={<IconSchool size="1rem" />}
              variant="default"
              href="https://arxiv.org/abs/2306.14845"
              target="_blank"
            >
              Paper
            </Button>
          </Group>
        </Group>
      </div>
    </Header>
  );
}

export default ScanHeader;
