import { Snake, type Coords, Direction, SnakeLink, GameControl } from "./types";

export class SnakeGame extends HTMLElement {
  constructor() {
    super();

    const size = this.getAttribute("data-size");
    if (!size) {
      console.warn("missing required attribute 'data-size'");
      return;
    }

    const shadow = this.attachShadow({ mode: "open" });

    const canvas = document.createElement("canvas");
    canvas.setAttribute("id", "canvas");
    canvas.setAttribute("tabindex", "1");
    canvas.setAttribute("width", `${size}px`);
    canvas.setAttribute("height", `${size}px`);

    const style = document.createElement("style");
    style.innerHTML = `
    #canvas {
        border: 1px solid green;
    }
    `;

    shadow.appendChild(canvas);
    shadow.appendChild(style);

    main(canvas, [Number(size), Number(size)], [15, 15]);
  }
}

function main(
  canvas: HTMLCanvasElement,
  canvasDimensionsInPx: Coords,
  linkDimensionsInPx: Coords
) {
  const initSnakeTail: Coords = [13, 2];
  const initSnakeSize: number = 4;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    console.warn("Could not get canvas rendering context 2D");
    return;
  }

  const snake = new Snake(
    new SnakeLink(initSnakeTail),
    canvasDimensionsInPx,
    linkDimensionsInPx
  );

  for (let i = 0; i < initSnakeSize; i++) {
    snake.feedFront();
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

  new GameControl(canvas, ctx, snake, linkDimensionsInPx, canvasDimensionsInPx);
}
