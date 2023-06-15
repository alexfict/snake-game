import { Snake, type Coords, Direction, SnakeLink, Target } from "./types";

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

  canvas.focus();

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

  const target = new Target(canvasDimensionsInPx, linkDimensionsInPx);
  printTarget(ctx, target, linkDimensionsInPx);

  const intervalId = setInterval(() => {
    !run(ctx, snake, target, linkDimensionsInPx, canvasDimensionsInPx) &&
      clearInterval(intervalId);
  }, 250);
}

function printTarget(
  ctx: CanvasRenderingContext2D,
  target: Target,
  linkDimensionsInPx: Coords
) {
  ctx.fillStyle = "red";
  ctx.fillRect(
    target.position[0] * linkDimensionsInPx[0],
    target.position[1] * linkDimensionsInPx[1],
    linkDimensionsInPx[0],
    linkDimensionsInPx[1]
  );
  ctx.fillStyle = "black";
}

function run(
  ctx: CanvasRenderingContext2D,
  snake: Snake,
  target: Target,
  linkDimensionsInPx: Coords,
  canvasDimensionsInPx: Coords
): boolean {
  let node: SnakeLink | null = snake.head;

  ctx.clearRect(0, 0, canvasDimensionsInPx[0], canvasDimensionsInPx[1]);

  if (target.checkCollision(node.position)) {
    snake.growAt(target.position);
    target.moveTarget();
  }

  printTarget(ctx, target, linkDimensionsInPx);

  // print head
  ctx.fillStyle = "green";
  ctx.fillRect(
    node.position[0] * linkDimensionsInPx[0],
    node.position[1] * linkDimensionsInPx[1],
    linkDimensionsInPx[0],
    linkDimensionsInPx[1]
  );
  ctx.fillStyle = "black";
  node = node.next;

  while (node) {
    ctx.fillRect(
      node.position[0] * linkDimensionsInPx[0],
      node.position[1] * linkDimensionsInPx[1],
      linkDimensionsInPx[0],
      linkDimensionsInPx[1]
    );
    node = node.next;
  }

  snake.pop();
  return snake.feedFront();
}
