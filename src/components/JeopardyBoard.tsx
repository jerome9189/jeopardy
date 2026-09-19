import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { Clue, GameRound } from "../types";
import MediaClip, { mediaLabel } from "./MediaClip";
import "./JeopardyBoard.css";

interface ClueOrigin {
  x: number;
  y: number;
}

interface JeopardyBoardProps {
  backToBoard: () => void;
  board: GameRound;
  categoryShown: () => void;
  categoriesShown: number;
  chooseClue: (categoryIndex: number, clueIndex: number) => void;
  currentCategory: number | null;
  currentClue: number | null;
}

function JeopardyBoard(props: JeopardyBoardProps) {
  const {
    backToBoard,
    board,
    categoryShown,
    categoriesShown,
    chooseClue,
    currentCategory,
    currentClue,
  } = props;

  const [solution, setSolution] = useState(false);
  const [dailyDoubleScreenPresented, setDailyDoubleScreenPresented] =
    useState(false);
  const clueRef = useRef<HTMLDivElement | null>(null);
  const [clueOrigin, setClueOrigin] = useState<ClueOrigin | null>(null);
  const [zoomComplete, setZoomComplete] = useState(false);

  useLayoutEffect(() => {
    const el = clueRef.current;
    if (el === null || currentCategory === null || currentClue === null) {
      return;
    }
    if (clueOrigin === null) {
      setZoomComplete(true);
      return;
    }

    setZoomComplete(false);
    const originX = clueOrigin.x;
    const originY = clueOrigin.y;
    const animation = el.animate(
      [
        { transform: "scale(0)", transformOrigin: `${originX}px ${originY}px` },
        { transform: "scale(1)", transformOrigin: `${originX}px ${originY}px` },
      ],
      { duration: 975, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "both" }
    );
    animation.onfinish = () => setZoomComplete(true);
    return () => animation.cancel();
  }, [currentCategory, currentClue, clueOrigin]);

  useEffect(() => {
    document.addEventListener("keydown", clueKeyPress);
    return () => {
      document.removeEventListener("keydown", clueKeyPress);
    };
  });

  function renderCategory(index: number) {
    return (
      <div onClick={categoryShown} className="category-container">
        <TransitionGroup>
          <CSSTransition key={index} timeout={1000} classNames="categorybox">
            <div className="category-box">
              <div className="category">{board[index].category}</div>
            </div>
          </CSSTransition>
        </TransitionGroup>
      </div>
    );
  }

  function renderClue(categoryName: string, clue: Clue, value: number) {
    const showDailyDoubleScreen =
      clue.dailyDouble && !dailyDoubleScreenPresented;
    return (
      <div
        onClick={
          showDailyDoubleScreen
            ? switchDDToClue
            : solution
            ? returnToBoard
            : toggleSolution
        }
        ref={clueRef}
        className={"clue" + (zoomComplete ? "" : " clue-zoom-in-progress")}
      >
        <div className="clue-category-label">
          {categoryName} - ${clue.value} {mediaLabel(clue)}
        </div>
        <div
          className={
            showDailyDoubleScreen ? "clue-display daily-double" : "clue-display"
          }
        >
          <div
            className={
              zoomComplete ? "clue-text clue-text-visible" : "clue-text"
            }
          >
            {showDailyDoubleScreen ? (
              "Daily Double"
            ) : (
              <div className="clue-display-content">
                <MediaClip
                  image={clue.image}
                  audio={clue.audio}
                  video={clue.video}
                />
                {clue.html === true ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: solution ? clue.solution : clue.clue,
                    }}
                  />
                ) : solution ? (
                  clue.solution
                ) : (
                  clue.clue
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  function clueKeyPress(event: KeyboardEvent) {
    // First check for categoriesShown
    if (
      categoriesShown < board.length &&
      (event.key === " " || event.key === "Enter")
    ) {
      categoryShown();
    }

    if (currentCategory === null || currentClue === null) {
      return;
    }
    const clue = board[currentCategory].clues[currentClue];

    if (event.key === " " || event.key === "Enter") {
      // If we just showed the Daily Double screen, switch to the clue
      if (clue.dailyDouble && !dailyDoubleScreenPresented) {
        switchDDToClue();
      } else {
        toggleSolution();
      }
    } else if (event.key === "Escape") {
      returnToBoard();
    }
  }

  function switchDDToClue() {
    setSolution(false);
    setDailyDoubleScreenPresented(true);
  }

  function returnToBoard() {
    setSolution(false);
    setDailyDoubleScreenPresented(false);
    setClueOrigin(null);
    backToBoard();
  }

  function toggleSolution() {
    setSolution(!solution);
  }

  // First check for if we need to present categories
  if (categoriesShown < board.length) {
    return renderCategory(categoriesShown);
  }

  // Check if there is a clue to present
  if (currentCategory !== null && currentClue !== null) {
    return renderClue(
      board[currentCategory].category,
      board[currentCategory].clues[currentClue],
      board[currentCategory].clues[currentClue].value
    );
  }

  return (
    <div>
      <table>
        <thead>
          <tr>
            {board.map((category, i) => (
              <td key={i} className="category-title">
                {category.category}
              </td>
            ))}
          </tr>
        </thead>
        <tbody>
          {board[0].clues.map((_, j) => {
            return (
              <tr key={j}>
                {board.map((category, i) => {
                  if (category.clues[j].chosen) {
                    return <td key={i} className="board-clue"></td>;
                  }
                  return (
                    <td
                      key={i}
                      onClick={(event) => {
                        const rect =
                          event.currentTarget.getBoundingClientRect();
                        setClueOrigin({
                          x: rect.left + rect.width / 2,
                          y: rect.top + rect.height / 2,
                        });
                        if (category.clues[j].dailyDouble) {
                          new Audio(
                            `${process.env.PUBLIC_URL}/daily_double.mp3`
                          ).play();
                        }
                        chooseClue(i, j);
                      }}
                      className="board-clue"
                    >
                      ${category.clues[j].value}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default JeopardyBoard;
