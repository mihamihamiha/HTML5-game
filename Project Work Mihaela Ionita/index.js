let game;

const gameOptions = {
  WaterGirlSpeed: 300,
  WaterGirlGravity: 1000,
};

let score = 0;
let score2 = score;
let doorIsOpen = false;

window.onload = function () {
  let gameConfig = {
    type: Phaser.AUTO,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 1600,
      height: 1000,
    },
    pixelArt: true,
    physics: {
      default: "arcade",
      arcade: {
        gravity: {
          y: 0,
        },
      },
    },
    scene: [PlayGame, Scene2, End],
    backgroundMusic: null,
  };

  game = new Phaser.Game(gameConfig);
  window.focus();
};

class PlayGame extends Phaser.Scene {
  constructor() {
    super("PlayGame");
  }

  preload() {
    this.load.image("ground", "assets/ground.png");
    this.load.image("opendoor", "assets/opendoor.png");
    this.load.image("ruby", "assets/ruby.png");
    this.load.image("diamond", "assets/diamond.png");
    this.load.audio("jump", "assets/mariojump.mp3");
    this.load.audio("musicback", "assets/musicback.mp3");
    this.load.image("closeddoor", "assets/closeddoor.png");
    this.load.image("background", "assets/background.jpg");
    this.load.image("bomb", "assets/bomb.png");
    this.load.spritesheet("watergirl", "assets/mushroom.png", {
      frameWidth: 64,
      frameHeight: 54,
    });
  }

  create() {
    score = 0;
    doorIsOpen = false;
    this.backgroundMusic = this.sound.add("musicback", { loop: true });
    this.backgroundMusic.play();

    this.Jump = this.sound.add("jump", { loop: false });

    this.background = this.add.image(0, 0, "background").setOrigin(0, 0);
    this.background.displayWidth = this.sys.game.config.width;
    this.background.displayHeight = this.sys.game.config.height;

    this.scoreText = this.add.text(32, 3, "0", {
      fontSize: "50px",
      fill: "#ffffff",
    });

    this.groundGroup = this.physics.add.group({
      immovable: true,
      allowGravity: false,
    });

    this.lavaGroup = this.physics.add.group({
      immovable: true,
      allowGravity: false,
    }); /*Not used anymore*/

    this.MovableGroundGroup = this.physics.add.group({
      immovable: true,
      allowGravity: false,
    });

    this.doorGroup = this.physics.add.group({
      immovable: true,
      allowGravity: false,
    });

    this.bombGroup = this.physics.add.group();
    this.diaGroup = this.physics.add.group();
    this.rubyGroup = this.physics.add.group();

    this.groundGroup.create(60, 970, "ground");
    this.groundGroup.create(450, 800, "ground");
    this.groundGroup.create(150, 600, "ground");
    this.groundGroup.create(350, 350, "ground");
    this.groundGroup.create(1350, 725, "ground");

    this.closedDoor = this.doorGroup
      .create(1350, 630, "closeddoor")
      .setDepth(1);

    this.movableGround = this.MovableGroundGroup.create(800, 970, "ground");
    this.movableGroundDirection = 1;
    this.movableGround.body.setVelocityX(100 * this.movableGroundDirection);

    this.time.addEvent({
      delay: 2500,
      callback: this.changeGroundDirection,
      callbackScope: this,
      loop: true,
    });

    this.diaGroup.create(450, 735, "diamond").setScale(0.05);
    this.diaGroup.create(150, 535, "diamond").setScale(0.05);
    this.diaGroup.create(350, 275, "diamond").setScale(0.05);
    this.rubyGroup.create(825, 470, "ruby").setScale(0.3);
    this.diaGroup.create(580, 870, "diamond").setScale(0.05);

    this.WaterGirl = this.physics.add
      .sprite(50, 900, "watergirl")
      .setScale(0.75)
      .setDepth(2);
    this.WaterGirl.body.setCollideWorldBounds(true);
    this.WaterGirl.body.setGravityY(gameOptions.WaterGirlGravity);
    this.WaterGirl.body.setSize(64, 54);

    this.physics.add.collider(this.WaterGirl, this.groundGroup);
    this.physics.add.collider(this.WaterGirl, this.MovableGroundGroup);

    this.physics.add.overlap(
      this.WaterGirl,
      this.bombGroup,
      this.bombExplode,
      null,
      this
    );
    this.physics.add.overlap(
      this.WaterGirl,
      this.diaGroup,
      this.collectDia,
      null,
      this
    );
    this.physics.add.overlap(
      this.WaterGirl,
      this.rubyGroup,
      this.collectRuby,
      null,
      this
    );

    this.bombTimer = this.time.addEvent({
      callback: this.bombFall,
      callbackScope: this,
      delay: 2500,
      loop: true,
    });

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  changeGroundDirection() {
    this.movableGroundDirection *= -1;
    this.movableGround.body.setVelocityX(100 * this.movableGroundDirection);
  }

  collectDia(WaterGirl, diamond) {
    diamond.disableBody(true, true);
    score += 1;
    this.scoreText.setText(score);
    if (score >= 5 && !doorIsOpen) {
      doorIsOpen = true;
      this.openDoor();
    }
  }

  collectRuby(WaterGirl, ruby) {
    ruby.disableBody(true, true);
    score += 5;
    this.scoreText.setText(score);
    if (score >= 5 && !doorIsOpen) {
      doorIsOpen = true;
      this.openDoor();
    }
  }

  openDoor() {
    this.closedDoor.destroy();
    let openDoor = this.doorGroup.create(1350, 630, "opendoor").setDepth(1);
    const clickMeText = this.add
      .text(1350, 500, "Click me", {
        fontSize: "40px",
        fill: "#ffffff",
      })
      .setOrigin(0.5);
    openDoor.setInteractive();
    openDoor.on("pointerdown", () => {
      this.scene.start("Scene2");
      this.backgroundMusic.stop();
      this.backgroundMusic.destroy();
    });
  }

  bombFall() {
    this.bombGroup
      .create(Phaser.Math.Between(0, game.config.width), 0, "bomb")
      .setVelocityY(450);
  }

  bombExplode(WaterGirl, bomb) {
    bomb.disableBody(true, true);
    this.scene.restart();
    score = 0;
    this.scoreText.setText(score);
    this.backgroundMusic.stop();
    this.backgroundMusic.destroy();
    doorIsOpen = false;
  }

  update() {
    if (this.WaterGirl.y >= 950) {
      this.scene.restart();
      this.backgroundMusic.stop();
      this.backgroundMusic.destroy();
      score = 0;
      this.scoreText.setText(score);
      doorIsOpen = false;
    }
    if (this.cursors.left.isDown) {
      this.WaterGirl.body.setVelocityX(-gameOptions.WaterGirlSpeed);
    } else if (this.cursors.right.isDown) {
      this.WaterGirl.body.setVelocityX(gameOptions.WaterGirlSpeed);
    } else if (this.cursors.up.isDown && this.WaterGirl.body.touching.down) {
      this.WaterGirl.body.setVelocityY(-gameOptions.WaterGirlGravity / 1.35);
      this.Jump.play();
    } else {
      this.WaterGirl.body.setVelocityX(0);
    }
  }
}

class Scene2 extends Phaser.Scene {
  constructor() {
    super("Scene2");
  }

  preload() {
    this.load.image("ground", "assets/ground.png");
    this.load.image("bullet", "assets/bullet.png");
    this.load.image("alien", "assets/alien.png");
    this.load.image("lava", "assets/lava.png");
    this.load.image("smallground", "assets/smallground.png");
    this.load.image("opendoor", "assets/opendoor.png");
    this.load.image("ruby", "assets/ruby.png");
    this.load.image("diamond", "assets/diamond.png");
    this.load.audio("jump", "assets/mariojump.mp3");
    this.load.audio("musicback", "assets/musicback.mp3");
    this.load.image("closeddoor", "assets/closeddoor.png");
    this.load.image("background", "assets/background.jpg");
    this.load.image("bomb", "assets/bomb.png");
    this.load.spritesheet("watergirl", "assets/mushroom.png", {
      frameWidth: 64,
      frameHeight: 54,
    });
  }

  create() {
    score2 = score;

    this.temporaryText = this.add
      .text(
        this.sys.game.config.width / 2,
        this.sys.game.config.height / 2,
        "Left click to shoot",
        {
          fontSize: "64px",
          fill: "#fff",
          backgroundColor: "#000",
        }
      )
      .setOrigin(0.5)
      .setDepth(10);

    this.time.delayedCall(5000, () => {
      this.temporaryText.destroy();
    });

    this.backgroundMusic = this.sound.add("musicback", {
      loop: true,
    });
    this.backgroundMusic.play();

    this.Jump = this.sound.add("jump", { loop: false });

    this.background = this.add.image(0, 0, "background").setOrigin(0, 0);
    this.background.displayWidth = this.sys.game.config.width;
    this.background.displayHeight = this.sys.game.config.height;

    this.scoreText = this.add.text(32, 3, score, {
      fontSize: "50px",
      fill: "#ffffff",
    });

    this.groundGroup = this.physics.add.group({
      immovable: true,
      allowGravity: false,
    });

    this.MovableGroundGroup = this.physics.add.group({
      immovable: true,
      allowGravity: false,
    });

    this.doorGroup = this.physics.add.group({
      immovable: true,
      allowGravity: false,
    });

    let Door = this.doorGroup.create(1350, 880, "opendoor").setDepth(1);
    this.add
      .text(1350, 780, "Click me", {
        fontSize: "40px",
        fill: "#ffffff",
      })
      .setOrigin(0.5);
    Door.setInteractive();
    Door.on("pointerdown", () => {
      this.scene.start("End");
      this.backgroundMusic.stop();
      this.backgroundMusic.destroy();
    });

    this.bombGroup = this.physics.add.group();
    this.diaGroup = this.physics.add.group();
    this.rubyGroup = this.physics.add.group();

    this.alienGroup = this.physics.add.group({
      immovable: true,
      allowGravity: false,
    });

    this.bulletGroup = this.physics.add.group({
      defaultKey: "bullet",
      maxSize: 10,
    });

    this.alienGroup.create(150, 560, "alien").setScale(0.3);
    this.alienGroup.create(700, 225, "alien").setScale(0.3);
    this.alienGroup.create(1000, 825, "alien").setScale(0.3);

    this.diaGroup.create(1350, 650, "diamond").setScale(0.05);
    this.diaGroup.create(150, 535, "diamond").setScale(0.05);
    this.diaGroup.create(350, 100, "diamond").setScale(0.05);
    this.rubyGroup.create(1000, 850, "ruby").setScale(0.3);
    this.rubyGroup.create(700, 250, "ruby").setScale(0.3);
    this.diaGroup.create(450, 875, "diamond").setScale(0.05);
    this.diaGroup.create(1550, 800, "diamond").setScale(0.05);

    this.groundGroup.create(100, 250, "ground");
    this.groundGroup.create(700, 325, "ground");
    this.groundGroup.create(150, 600, "ground");
    this.groundGroup.create(1350, 725, "ground");
    this.groundGroup.create(1350, 975, "ground");
    this.groundGroup.create(1000, 920, "smallground");

    this.movableGround = this.MovableGroundGroup.create(850, 550, "ground");
    this.movableGround2 = this.MovableGroundGroup.create(450, 950, "ground");
    this.movableGroundDirection = 1;
    this.movableGround.body.setVelocityX(100 * this.movableGroundDirection);
    this.movableGround2.body.setVelocityX(100 * this.movableGroundDirection);

    this.time.addEvent({
      delay: 1500,
      callback: this.changeGroundDirection,
      callbackScope: this,
      loop: true,
    });

    this.WaterGirl = this.physics.add
      .sprite(100, 200, "watergirl")
      .setScale(0.75)
      .setDepth(2);
    this.WaterGirl.body.setCollideWorldBounds(true);
    this.WaterGirl.body.setGravityY(gameOptions.WaterGirlGravity);
    this.WaterGirl.body.setSize(64, 54);

    this.physics.add.collider(this.WaterGirl, this.groundGroup);
    this.physics.add.collider(this.WaterGirl, this.MovableGroundGroup);

    this.physics.add.overlap(
      this.alienGroup,
      this.bulletGroup,
      this.destroyAlien,
      null,
      this
    );

    this.physics.add.overlap(
      this.WaterGirl,
      this.alienGroup,
      this.alienHit,
      null,
      this
    );

    this.physics.add.overlap(
      this.WaterGirl,
      this.bombGroup,
      this.bombExplode,
      null,
      this
    );

    this.physics.add.overlap(
      this.WaterGirl,
      this.diaGroup,
      this.collectDia,
      null,
      this
    );
    this.physics.add.overlap(
      this.WaterGirl,
      this.rubyGroup,
      this.collectRuby,
      null,
      this
    );

    this.bombTimer = this.time.addEvent({
      callback: this.bombFall,
      callbackScope: this,
      delay: 2500,
      loop: true,
    });

    this.cursors = this.input.keyboard.createCursorKeys();

    this.input.on("pointerdown", (pointer) => {
      if (pointer.leftButtonDown()) {
        this.shootBullet();
      }
    });
  }

  changeGroundDirection() {
    this.movableGroundDirection *= -1;
    this.movableGround.body.setVelocityX(100 * this.movableGroundDirection);
    this.movableGround2.body.setVelocityX(100 * this.movableGroundDirection);
  }

  shootBullet() {
    if (this.bulletGroup.countActive(true) < this.bulletGroup.maxSize) {
      let bullet = this.bulletGroup.get(this.WaterGirl.x, this.WaterGirl.y);

      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.setScale(0.2);
        bullet.body.velocity.x = 0;
        bullet.body.velocity.y = -500;

        this.physics.moveTo(bullet, this.input.activePointer.x, bullet.y, 500);
      }
    }
  }

  destroyAlien(alien, bullet) {
    alien.destroy();
    bullet.destroy();
  }

  alienHit(WaterGirl, alien) {
    alien.disableBody(true, true);
    this.scene.restart();
    score2 = score;
    this.scoreText.setText(score2);
    this.backgroundMusic.stop();
    this.backgroundMusic.destroy();
  }

  collectDia(WaterGirl, diamond) {
    diamond.disableBody(true, true);
    score2 += 1;
    this.scoreText.setText(score2);
  }

  collectRuby(WaterGirl, ruby) {
    ruby.disableBody(true, true);
    score2 += 5;
    this.scoreText.setText(score2);
  }

  bombFall() {
    this.bombGroup
      .create(Phaser.Math.Between(0, game.config.width), 0, "bomb")
      .setVelocityY(450);
  }

  bombExplode(WaterGirl, bomb) {
    bomb.disableBody(true, true);
    this.scene.restart();
    score2 = score;
    this.scoreText.setText(score2);
    this.backgroundMusic.stop();
    this.backgroundMusic.destroy();
  }

  update() {
    if (this.WaterGirl.y >= 950) {
      this.scene.restart();
      this.backgroundMusic.stop();
      this.backgroundMusic.destroy();
      score2 = score;
      this.scoreText.setText(score2);
    }
    if (this.cursors.left.isDown) {
      this.WaterGirl.body.setVelocityX(-gameOptions.WaterGirlSpeed);
    } else if (this.cursors.right.isDown) {
      this.WaterGirl.body.setVelocityX(gameOptions.WaterGirlSpeed);
    } else if (this.cursors.up.isDown && this.WaterGirl.body.touching.down) {
      this.WaterGirl.body.setVelocityY(-gameOptions.WaterGirlGravity / 1.35);
      this.Jump.play();
    } else {
      this.WaterGirl.body.setVelocityX(0);
    }
  }
}

class End extends Phaser.Scene {
  constructor() {
    super("End");
  }

  preload() {
    this.load.image("background", "assets/background.jpg");
    this.load.image("button", "assets/button.png");
  }

  create() {
    this.add
      .image(0, 0, "background")
      .setOrigin(0, 0)
      .setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

    this.add
      .text(this.sys.game.config.width / 2, 100, "Game Over", {
        fontSize: "128px",
        fill: "#00000",
      })
      .setOrigin(0.5);

    this.showScores();

    const restartButton = this.add
      .image(
        this.sys.game.config.width / 2,
        this.sys.game.config.height / 2,
        "button"
      )
      .setOrigin(0.5)
      .setInteractive()
      .on("pointerdown", () => {
        this.scene.start("PlayGame");
      });
  }

  showScores() {
    this.add
      .text(this.sys.game.config.width / 2, 210, `Player 1: ${score2}`, {
        fontSize: "64px",
        fill: "#00000",
      })
      .setOrigin(0.5);
  }
}
