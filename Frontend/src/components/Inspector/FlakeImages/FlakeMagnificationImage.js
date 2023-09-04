import { Card, Text, Button, Loader } from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";
import { useEffect, useRef, useState } from "react";
import "./FlakeMagnificationImage.css";

const MagDict = {
  "-1": "overview",
  0: "2.5x",
  1: "5x",
  2: "20x",
  3: "50x",
  4: "100x",
};

const imgAspectRatio = 1920 / 1200;

function FlakeMagnificationImage(props) {
  const [currentMagnification, setCurrentMagnification] = useState(2);
  const [isLoaded, setIsLoaded] = useState(false);
  const cardRef = useRef(null);
  const cardWidth = cardRef.current ? cardRef.current.offsetWidth : 0;
  const flakePath = props.flake?.flake_path;

  const overviewImageURL = `${process.env.REACT_APP_IMAGE_URL}${flakePath}/overview_marked.jpg`;
  const magImageURL = `${process.env.REACT_APP_IMAGE_URL}${flakePath}/${MagDict[currentMagnification]}.${process.env.REACT_APP_MAGNIFICATION_SUFFIX}`;
  const overlayImageURL = `scalebars/${MagDict[currentMagnification]}.png`;

  // Forcing a re-render on initial render to make sure the Ref is defined on the first render
  // some performance hit, but not too bad
  const [shouldUpdate, setShouldUpdate] = useState(true);
  useEffect(() => {
    if (shouldUpdate) setShouldUpdate(false);
  }, [shouldUpdate]);

  useEffect(() => {
    setIsLoaded(false);
  }, [currentMagnification, flakePath]);

  useHotkeys([
    ['arrowRight', () => increaseMagnification()],
    ['arrowLeft', () => decreaseMagnification()],
  ]);

  const increaseMagnification = () =>{
    if (currentMagnification < 4)  {
      setCurrentMagnification(currentMagnification + 1);
    }
  }

  const decreaseMagnification = () =>{
    if (currentMagnification > -1) {
      setCurrentMagnification(currentMagnification - 1);
    }
  }

  const magnificaitonImageComponent = (
    <>
      <img
        className="mainMagnificationImage"
        style={{ display: isLoaded ? "block" : "none" }}
        src={magImageURL}
        onLoad={() => {
          setIsLoaded(true);
        }}
      />

      <img
        className="overlayMagnificationImage"
        style={{ display: isLoaded ? "block" : "none" }}
        src={overlayImageURL}
      />
    </>
  );

  const overviewImageComponent = (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "black",
      }}
    >
      <img
        className="OverviewImage"
        style={{
          display: isLoaded ? "block" : "none",
          width: "auto",
          height: cardWidth / imgAspectRatio,
        }}
        src={overviewImageURL}
        onLoad={() => {
          setIsLoaded(true);
        }}
      />
    </div>
  );

  return (
    <Card shadow="sm" radius="md" className="FlakeMagnificationImageCard" ref={cardRef}>
      <div className="flakeMagnificationImageHeadingDiv">
        <Text weight={500}>Centered</Text>
        <Button.Group>
          <Button
            compact
            variant={currentMagnification === -1 ? "filled" : "outline"}
            onClick={() => setCurrentMagnification(-1)}
          >
            Full
          </Button>
          <Button
            compact
            variant={currentMagnification === 0 ? "filled" : "outline"}
            onClick={() => setCurrentMagnification(0)}
          >
            2.5x
          </Button>
          <Button
            compact
            variant={currentMagnification === 1 ? "filled" : "outline"}
            onClick={() => setCurrentMagnification(1)}
          >
            5x
          </Button>
          <Button
            compact
            variant={currentMagnification === 2 ? "filled" : "outline"}
            onClick={() => setCurrentMagnification(2)}
          >
            20x
          </Button>
          <Button
            compact
            variant={currentMagnification === 3 ? "filled" : "outline"}
            onClick={() => setCurrentMagnification(3)}
          >
            50x
          </Button>
          <Button
            compact
            variant={currentMagnification === 4 ? "filled" : "outline"}
            onClick={() => setCurrentMagnification(4)}
          >
            100x
          </Button>
        </Button.Group>
      </div>

      <div className="parentMagnificationImage">
        {currentMagnification === -1
          ? overviewImageComponent
          : magnificaitonImageComponent}
        <div
          style={{
            width: "100%",
            height: cardWidth / imgAspectRatio,
            justifyContent: "center",
            alignItems: "center",
            display: isLoaded ? "none" : "flex",
          }}
        >
          <Loader size="lg" />
        </div>
      </div>
    </Card>
  );
}

export default FlakeMagnificationImage;
