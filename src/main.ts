import "./style.css";
import { type Coords, Snake, SnakeLink, Direction } from "./types";

// settable by the client
const linkDimensionsInPx: Coords = [5, 5];
const canvasDimensionsInPx: Coords = [100, 100];

function main() {
  const initSnakeCoords: Coords[] = [
    [10, 2],
    [11, 2],
    [12, 2],
    [13, 2],
  ];
  const canvas: HTMLCanvasElement | null = document.querySelector("#canvas");

  if (!canvas) {
    console.warn("Could not find canvas element with id 'canvas'");
    return;
  }

  canvas.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "ArrowUp":
        snake.setDirection(Direction.Up);
        break;
      case "ArrowDown":
        snake.setDirection(Direction.Down);
        break;
      case "ArrowRight":
        snake.setDirection(Direction.Right);
        break;
      case "ArrowLeft":
        snake.setDirection(Direction.Left);
        break;
    }
  });

  canvas.focus();

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    console.warn("Could not get canvas rendering context 2D");
    return;
  }

  const snake = new Snake(
    new SnakeLink(initSnakeCoords[0]),
    canvasDimensionsInPx,
    linkDimensionsInPx
  );
  for (const link of initSnakeCoords.slice(1)) {
    snake.feedBack(new SnakeLink(link));
  }

  const intervalId = setInterval(() => {
    run(ctx, snake);
  }, 250);
}

function run(ctx: CanvasRenderingContext2D, snake: Snake) {
  let node: SnakeLink | null = snake.head;

  while (node) {
    ctx.fillRect(
      node.position[0] * linkDimensionsInPx[0],
      node.position[1] * linkDimensionsInPx[1],
      linkDimensionsInPx[0],
      linkDimensionsInPx[1]
    );
    node = node.next;
  }

  snake.feedFront();
  let coords = snake.pop();

  coords &&
    ctx.clearRect(
      coords[0] * linkDimensionsInPx[0],
      coords[1] * linkDimensionsInPx[1],
      linkDimensionsInPx[0],
      linkDimensionsInPx[1]
    );
}

main();
