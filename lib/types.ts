export type Coords = [number, number];

export class SnakeLink {
  position: Coords;
  next: SnakeLink | null;

  constructor(coords: Coords) {
    this.position = coords;
    this.next = null;
  }
}

export class Snake {
  head: SnakeLink;
  private direction: Direction = Direction.Left;
  private directionLock: boolean = false;
  private maxX: number;
  private maxY: number;
  private coordsToAdd: Coords[] = [];

  constructor(
    head: SnakeLink,
    canvasDimensions: Coords,
    linkDimensions: Coords
  ) {
    this.head = head;
    this.maxX = canvasDimensions[0] / linkDimensions[0];
    this.maxY = canvasDimensions[1] / linkDimensions[1];
  }

  feedFront(): boolean {
    let link = new SnakeLink(this.calculateCoords());

    let node: SnakeLink | null = this.head;
    while (node) {
      if (
        link.position[0] === node.position[0] &&
        link.position[1] === node.position[1]
      )
        return false;
      node = node.next;
    }

    link.next = this.head;
    this.head = link;
    this.directionLock = false;
    return true;
  }

  pop() {
    let node = this.head;
    let prevNode: SnakeLink | null = null;
    while (node) {
      if (node.next === null) {
        if (
          this.coordsToAdd.length > 0 &&
          node.position[0] === this.coordsToAdd[0][0] &&
          node.position[1] === this.coordsToAdd[0][1]
        ) {
          this.coordsToAdd = this.coordsToAdd.slice(1);
          break;
        }
        if (prevNode) prevNode.next = null;
        break;
      }
      prevNode = node;
      node = node.next;
    }
  }

  growAt(coords: Coords) {
    this.coordsToAdd.push(coords);
  }

  setDirection(direction: Direction) {
    if (this.directionLock) return;
    if (this.direction === Direction.Down && direction === Direction.Up) return;
    if (this.direction === Direction.Up && direction === Direction.Down) return;
    if (this.direction === Direction.Left && direction === Direction.Right)
      return;
    if (this.direction === Direction.Right && direction === Direction.Left)
      return;
    this.direction = direction;
    this.directionLock = true;
  }

  private calculateCoords(): Coords {
    switch (this.direction) {
      case Direction.Up: {
        let y =
          this.head.position[1] === 0
            ? this.maxY - 1
            : this.head.position[1] - 1;
        return [this.head.position[0], y];
      }
      case Direction.Down: {
        let y =
          this.head.position[1] === this.maxY - 1
            ? 0
            : this.head.position[1] + 1;
        return [this.head.position[0], y];
      }
      case Direction.Left: {
        let x =
          this.head.position[0] === 0
            ? this.maxX - 1
            : this.head.position[0] - 1;
        return [x, this.head.position[1]];
      }
      case Direction.Right: {
        let x =
          this.head.position[0] === this.maxX - 1
            ? 0
            : this.head.position[0] + 1;
        return [x, this.head.position[1]];
      }
    }
  }
}

export enum Direction {
  Up,
  Down,
  Left,
  Right,
}

export class Target {
  position: Coords;
  maxX: number;
  maxY: number;

  constructor(canvasDimensions: Coords, linkDimensions: Coords) {
    this.maxX = canvasDimensions[0] / linkDimensions[0];
    this.maxY = canvasDimensions[1] / linkDimensions[1];
    this.position = this.getRandomPosition();
  }

  checkCollision(nodePosition: Coords) {
    return (
      this.position[0] === nodePosition[0] &&
      this.position[1] === nodePosition[1]
    );
  }

  moveTarget() {
    this.position = this.getRandomPosition();
  }

  private getRandomPosition(): Coords {
    return [
      Math.floor(Math.random() * this.maxX),
      Math.floor(Math.random() * this.maxY),
    ];
  }
}

export class GameControl {
  ctx: CanvasRenderingContext2D;
  snake: Snake;
  linkDimensionsInPx: Coords;
  canvasDimensionsInPx: Coords;
  pauseOverlay: HTMLDivElement;
  playOverlay: HTMLDivElement;
  intervalId: number | undefined;
  state: "running" | "paused" = "paused";
  canvas: HTMLCanvasElement;
  target: Target;

  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    snake: Snake,
    linkDimensionsInPx: Coords,
    canvasDimensionsInPx: Coords
  ) {
    this.ctx = ctx;
    this.snake = snake;
    this.linkDimensionsInPx = linkDimensionsInPx;
    this.canvasDimensionsInPx = canvasDimensionsInPx;
    this.canvas = canvas;

    this.target = new Target(canvasDimensionsInPx, linkDimensionsInPx);

    const { width, height, left, top } = canvas.getClientRects()[0];
    this.pauseOverlay = document.createElement("div");
    this.pauseOverlay.style.width = `${width}px`;
    this.pauseOverlay.style.height = `${height}px`;
    this.pauseOverlay.style.position = "fixed";
    this.pauseOverlay.style.top = `${top}px`;
    this.pauseOverlay.style.left = `${left}px`;
    this.pauseOverlay.style.backgroundColor = "rgba(255, 0, 0, 0.5)";
    this.pauseOverlay.style.display = "none";

    this.playOverlay = document.createElement("div");
    this.playOverlay.style.width = `${width}px`;
    this.playOverlay.style.height = `${height}px`;
    this.playOverlay.style.position = "fixed";
    this.playOverlay.style.top = `${top}px`;
    this.playOverlay.style.left = `${left}px`;
    this.playOverlay.style.backgroundColor = "rgba(0, 255, 0, 0.5)";

    document.querySelector("body")?.appendChild(this.pauseOverlay);
    document.querySelector("body")?.appendChild(this.playOverlay);

    this.canvas.addEventListener("blur", () => this.pause());

    this.playOverlay.addEventListener("click", () => this.play());
    this.pauseOverlay.addEventListener("click", () => this.play());
  }

  play() {
    if (this.state === "running") return;
    this.playOverlay.style.display = "none";
    this.pauseOverlay.style.display = "none";
    this.intervalId = setInterval(() => {
      !this.run() && clearInterval(this.intervalId);
    }, 250);
    this.canvas.focus();
    this.state = "running";
  }

  pause() {
    if (this.state === "paused") return;
    this.pauseOverlay.style.display = "block";
    clearInterval(this.intervalId);
    this.state = "paused";
  }

  private run(): boolean {
    let node: SnakeLink | null = this.snake.head;

    this.ctx.clearRect(
      0,
      0,
      this.canvasDimensionsInPx[0],
      this.canvasDimensionsInPx[1]
    );

    if (this.target.checkCollision(node.position)) {
      this.snake.growAt(this.target.position);
      this.target.moveTarget();
    }

    this.printTarget(this.ctx, this.target, this.linkDimensionsInPx);

    // print head
    this.ctx.fillStyle = "green";
    this.ctx.fillRect(
      node.position[0] * this.linkDimensionsInPx[0],
      node.position[1] * this.linkDimensionsInPx[1],
      this.linkDimensionsInPx[0],
      this.linkDimensionsInPx[1]
    );
    this.ctx.fillStyle = "black";
    node = node.next;

    while (node) {
      this.ctx.fillRect(
        node.position[0] * this.linkDimensionsInPx[0],
        node.position[1] * this.linkDimensionsInPx[1],
        this.linkDimensionsInPx[0],
        this.linkDimensionsInPx[1]
      );
      node = node.next;
    }

    this.snake.pop();
    return this.snake.feedFront();
  }

  private printTarget(
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
}
