import './style.css';

import * as PIXI from 'pixi.js';
import SimplexNoise from 'simplex-noise';

const app = new PIXI.Application({
  width: 640,
  height: 360,
  backgroundColor: 0xffffff,
});
document.getElementById('main').appendChild(app.view);

app.stage.sortableChildren = true;

const textures = {
  missile: PIXI.Texture.from('texture/missile.png'),
  aim1: PIXI.Texture.from('texture/aim1.png'),
  aim2: PIXI.Texture.from('texture/aim2.png'),
  target: PIXI.Texture.from('texture/target.png'),
  explosion: PIXI.Texture.from('texture/explosion.png'),
};

class Game {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.target = new Target(x + w / 2, y + h * 0.1 + 50 * Math.random(), [
      x + w / 2 - 50,
      y,
      x + w / 2 + 50,
      y + h / 3,
    ]);
    this.missiles = new Array();
    this.missileInterval = 0;
    this.nearby = false;

    const frame = new PIXI.Graphics();
    frame.position.x = x;
    frame.position.y = y;
    // frame.beginStroke(0x0);
    frame.lineStyle(1, 0x0, 1);
    frame.drawRect(0, 0, w, h);
    // frame.endStroke();
    app.stage.addChild(frame);
    this.frame = frame;
  }

  update(delta, elapsed) {
    this.missiles.map((missile) => missile.update());
    this.missiles = this.missiles.filter((missile) => {
      if (missile.obj.position.y >= this.y) {
        return true;
      } else {
        missile.remove();
        return false;
      }
    });
    // this.player.update(elapsed);
    this.target.update(elapsed);

    /* Nearby */
    {
      let nearby = false;
      const marginX = 5,
        marginY = 3;
      this.missiles.map((missile) => {
        const mcx = missile.obj.position.x + 8;
        if (
          this.target.obj.position.x - marginX < mcx &&
          mcx < this.target.obj.position.x + 16 + marginX &&
          this.target.obj.position.y < missile.obj.position.y &&
          missile.obj.position.y < this.target.obj.position.y + 16 + marginY
        ) {
          nearby = true;
        }
      });
      this.nearby = nearby;
    }

    this.missiles.map((missile) => {
      const mcx = missile.obj.position.x + 8;
      if (
        this.target.obj.position.x < mcx &&
        mcx < this.target.obj.position.x + 16 &&
        this.target.obj.position.y < missile.obj.position.y &&
        missile.obj.position.y < this.target.obj.position.y + 16
      ) {
        const obj = new PIXI.Sprite.from(textures.explosion);
        obj.position.x = this.target.obj.position.x;
        obj.position.y = this.target.obj.position.y;
        app.stage.addChild(obj);
        app.stage.removeChild(this.target.obj);
        // app.stage.deleteChild(this.target.obj);
        // app.ticker.stop();
      }
    });
    
    if (this.missileInterval > 0) {
      this.missileInterval -= delta;
    }
  }
}

class Target {
  constructor(x, y, bbox) {
    this.bbox = bbox;
    this.obj = new PIXI.Sprite.from(textures.target);
    this.obj.position.x = x - 8;
    this.obj.position.y = y - 8;
    app.stage.addChild(this.obj);
    this.dx = 0.5;
    this.dy = 0;
  }

  update() {
    let nx = this.obj.position.x + this.dx;
    if (nx < this.bbox[0] || nx > this.bbox[2]) this.dx *= -1;
    this.obj.position.x += this.dx;
    // this.obj.position.y += this.dy;
  }
}

const noise = new SimplexNoise();

class Missile {
  constructor(x, y) {
    this.obj = new PIXI.Sprite.from(textures.missile);
    this.obj.zIndex = 90;
    this.obj.position.x = x;
    this.obj.position.y = y;
    app.stage.addChild(this.obj);
    // app.stage.sortChildren();
    this.dx = 0;
    this.dy = -4;
  }

  update() {
    this.obj.position.x += this.dx;
    this.obj.position.y += this.dy;
  }

  remove() {
    app.stage.removeChild(this.obj);
    this.obj = null;
  }
}

const margin = 10;

const game1 = new Game(
  margin + 0,
  margin + 0,
  320 - margin * 2,
  360 - margin * 2,
);
const game2 = new Game(
  margin + 320,
  margin + 0,
  320 - margin * 2,
  360 - margin * 2,
);

document.addEventListener('keydown', (ev) => {
  // console.log(ev.key);
  if (ev.key === 'e') {
    if (game1.missileInterval <= 0) {
      game1.missileInterval = 40;
      game1.missiles.push(new Missile(150, game1.h));
    }
  } else if (ev.key === 'l') {
    if (game2.missileInterval <= 0) {
      game2.missileInterval = 40;
      game2.missiles.push(new Missile(480, game2.h));
    }
  }
});

let elapsed = 0.0;
app.ticker.add((delta) => {
  elapsed += delta;
  game1.update(delta, elapsed);
  game2.update(delta, elapsed);
  if (game1.nearby && game2.nearby) {
    app.ticker.stop();
    alert("Clear!")
  }
});
