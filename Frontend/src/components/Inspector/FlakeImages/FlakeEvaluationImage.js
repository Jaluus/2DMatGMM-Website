import { Card, Loader, Text } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import "./FlakeEvaluationImage.css";

const imgAspectRatio = 1920 / 1200;

function FlakeEvaluationImage(props) {
  const [isLoaded, setIsLoaded] = useState(false);
  const cardRef = useRef(null);
  const cardWidth = cardRef.current ? cardRef.current.offsetWidth : 0;

  const flakePath = props.flake?.flake_path;
  const evalImageURL = `${process.env.REACT_APP_IMAGE_URL}${flakePath}/eval_img.jpg`;

  useEffect(() => {
    setIsLoaded(false);
  }, [flakePath]);

  // Forcing a re-render on initial render to make sure the Ref is defined on the first render
  // some performance hit, but not too bad
  const [shouldUpdate, setShouldUpdate] = useState(true);
  useEffect(() => {
    if (shouldUpdate) setShouldUpdate(false);
  }, [shouldUpdate]);

  return (
    <Card shadow="sm" radius="md" className="p-0" ref={cardRef}>
      <div className="FlakeEvaluationTextDiv">
        <Text weight={500}>Evaluation Image</Text>
      </div>
      <img
        style={{ width: "100%", display: isLoaded ? "block" : "none" }}
        onLoad={() => {
          setIsLoaded(true);
        }}
        src={evalImageURL}
        alt="eval_image"
      />
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
    </Card>
  );
}

export default FlakeEvaluationImage;
