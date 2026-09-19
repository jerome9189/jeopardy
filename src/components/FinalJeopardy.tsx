import { useEffect, useRef, useState } from "react";
import { FinalRound } from "../types";
import MediaClip, { mediaLabel } from "./MediaClip";

interface FinalJeopardyProps {
  final: FinalRound;
  onFinishGame: () => void;
}

function FinalJeopardy(props: FinalJeopardyProps) {
  const { final, onFinishGame } = props;

  const [category, setCategory] = useState(true);
  const [solution, setSolution] = useState(false);
  const [themeStarted, setThemeStarted] = useState(false);
  const themeAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    document.addEventListener("keydown", clueKeyPress);
    return () => {
      document.removeEventListener("keydown", clueKeyPress);
    };
  });

  useEffect(() => {
    const audio = new Audio(`${process.env.PUBLIC_URL}/final_jeopardy.mp3`);
    themeAudio.current = audio;
    return () => {
      audio.pause();
      themeAudio.current = null;
    };
  }, []);

  function showClue() {
    setCategory(false);
    setSolution(false);
    setThemeStarted(false);
  }

  function playTheme() {
    setThemeStarted(true);
    themeAudio.current?.play();
  }

  function toggleSolution() {
    setSolution(!solution);
  }

  function clueClick() {
    if (category) {
      showClue();
    } else if (solution) {
      onFinishGame();
    } else if (!themeStarted) {
      playTheme();
    } else {
      toggleSolution();
    }
  }

  function clueKeyPress(event: KeyboardEvent) {
    if (event.key === " " || event.key === "Enter") {
      clueClick();
    } else if (event.key === "Escape" && !category && solution) {
      onFinishGame();
    }
  }

  if (category) {
    return (
      <div onClick={showClue} className="clue">
        <div className="clue-display final-category">{final.category}</div>
      </div>
    );
  }
  return (
    <div onClick={clueClick} className="clue">
      <div className="clue-category-label">
        {final.category} {mediaLabel(final)}
      </div>
      <div className="clue-display">
        <div className="clue-display-content">
          <MediaClip
            image={final.image}
            audio={final.audio}
            video={final.video}
          />
          {final.html === true ? (
            <div
              dangerouslySetInnerHTML={{
                __html: solution ? final.solution : final.clue,
              }}
            />
          ) : solution ? (
            final.solution
          ) : (
            final.clue
          )}
        </div>
      </div>
    </div>
  );
}

export default FinalJeopardy;
