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
  direction: Direction = Direction.Left;
  maxX: number;
  maxY: number;
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

  feedFront() {
    let link = new SnakeLink(this.calculateCoords());
    link.next = this.head;
    this.head = link;
  }

  feedBack(link: SnakeLink) {
    let node = this.head;
    while (node) {
      if (node.next === null) {
        node.next = link;
        break;
      }
      node = node.next;
    }
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
    if (this.direction === Direction.Down && direction === Direction.Up) return;
    if (this.direction === Direction.Up && direction === Direction.Down) return;
    if (this.direction === Direction.Left && direction === Direction.Right)
      return;
    if (this.direction === Direction.Right && direction === Direction.Left)
      return;
    this.direction = direction;
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
