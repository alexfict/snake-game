export type Coords = [number, number];

export class SnakeLink {
  position:Coords;
  next:SnakeLink | null;

  constructor(coords:Coords) {
      this.position = coords
      this.next = null                
  }
}

export class Snake {
  head:SnakeLink;
  direction:Direction = Direction.Left;
  
  constructor(head:SnakeLink) {
      this.head = head
  }

  feedFront() {
    let link = new SnakeLink(this.calculateCoords())
    link.next = this.head;
    this.head = link;
  }

  feedBack(link:SnakeLink) {
      let node = this.head;
      while(node){
          if(node.next === null){
              node.next = link;
              break;
          }
          node = node.next;
      }
  }

  pop(): Coords|null {
      let node = this.head;
      let prevNode:SnakeLink|null = null;
      let o:Coords | null = null;
      while(node){
          if(node.next === null){
              o = node.position;
              if(prevNode) prevNode.next = null;
              break;
          }
          prevNode = node;
          node = node.next;
      }
      return o;
  }

  setDirection(direction:Direction) {
    this.direction = direction;
  }

  private calculateCoords():Coords{
    switch (this.direction){
        case Direction.Up:
            return [this.head.position[0], this.head.position[1]-1]
        case Direction.Down:
            return [this.head.position[0], this.head.position[1]+1]
        case Direction.Left:
            return [this.head.position[0]-1, this.head.position[1]]
        case Direction.Right:
            return [this.head.position[0]+1, this.head.position[1]]
    }
  }
}

export enum Direction {
  Up,
  Down,
  Left,
  Right
}