
// GameBoard code below
function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}
function Circle(game) {
    this.redAnimation = new Animation(ASSET_MANAGER.getAsset("./img/Red.png"), 0, 0, 500, 375, 1, 1, true, false);
    this.VirusAnimation = new Animation(ASSET_MANAGER.getAsset("./img/Virus.png"), 0, 0, 512, 512, 1, 1, true, false);
    this.WhiteBloodAnimation = new Animation(ASSET_MANAGER.getAsset("./img/white.png"), 0, 0, 250, 250, 1, 1, true, false);
    this.whiteBloodCell = false;
    this.player = 1;
    this.radius = 10;
    this.visualRadius = 500;
    this.colors = ["Red", "Green", "Blue", "White"];
    this.setNotIt();
    Entity.call(this, game, this.radius + Math.random() * (1000 - this.radius * 2), this.radius + Math.random() * (900 - this.radius * 2));

    this.velocity = { x: Math.random() * 500, y: Math.random() * 500 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
};

Circle.prototype = new Entity();
Circle.prototype.constructor = Circle;

Circle.prototype.setWhitBlood= function () {
    this.whiteBloodCell = true;
    this.visualRadius = 550;
}

Circle.prototype.setIt = function () {
    this.it = true;
    this.color = 0;
    this.visualRadius = 500;
};

Circle.prototype.setNotIt = function () {
    this.it = false;
    this.color = 3;
    this.visualRadius = 200;
};

Circle.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Circle.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Circle.prototype.collideRight = function () {
    return (this.x + this.radius) > 1000;
};

Circle.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Circle.prototype.collideBottom = function () {
    return (this.y + this.radius) > 900;
};

Circle.prototype.update = function () {
    Entity.prototype.update.call(this);
 //  console.log(this.velocity);

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x * friction;
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = 1000 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y * friction;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = 900 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent !== this && this.collide(ent)) {
            var temp = { x: this.velocity.x, y: this.velocity.y };

            var dist = distance(this, ent);
            var delta = this.radius + ent.radius - dist;
            var difX = (this.x - ent.x)/dist;
            var difY = (this.y - ent.y)/dist;

            this.x += difX * delta / 2;
            this.y += difY * delta / 2;
            ent.x -= difX * delta / 2;
            ent.y -= difY * delta / 2;

            this.velocity.x = ent.velocity.x * friction;
            this.velocity.y = ent.velocity.y * friction;
            ent.velocity.x = temp.x * friction;
            ent.velocity.y = temp.y * friction;
            this.x += this.velocity.x * this.game.clockTick;
            this.y += this.velocity.y * this.game.clockTick;
            ent.x += ent.velocity.x * this.game.clockTick;
            ent.y += ent.velocity.y * this.game.clockTick;
            if (this.it && ent.whiteBloodCell===false) {
               // this.setNotIt();
                ent.setIt();
            }
            else if (ent.it && this.whiteBloodCell===false) {
                this.setIt();
                //ent.setNotIt();
            }
            else if (this.it && ent.whiteBloodCell===true) {
                this.setNotIt();
            }
            else if (ent.it && this.whiteBloodCell===true) {
                ent.setNotIt();
            }
        }

        if (ent != this && this.collide({ x: ent.x, y: ent.y, radius: this.visualRadius })) {
            var dist = distance(this, ent);





        if (this.whiteBloodCell===true && dist > this.radius + ent.radius + 10 && ent.it) {//follow
                var difX = (ent.x - this.x) / dist;
                var difY = (ent.y - this.y) / dist;
                this.velocity.x += difX * acceleration / (dist * dist);
                this.velocity.y += difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }

            else if (this.it && dist > this.radius + ent.radius + 10 && ent.whiteBloodCell===false) {//follow
                var difX = (ent.x - this.x)/dist;
                var difY = (ent.y - this.y)/dist;
                this.velocity.x += difX * acceleration / (dist*dist);
                this.velocity.y += difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x*this.velocity.x + this.velocity.y*this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
            else if (ent.it && dist > this.radius + ent.radius) {// run away
                var difX = (ent.x - this.x) / dist;
                var difY = (ent.y - this.y) / dist;
                this.velocity.x -= difX * acceleration / (dist * dist);
                this.velocity.y -= difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }

            else if (this.it && dist > this.radius + ent.radius + 10 && ent.whiteBloodCell ) {
                var difX = (ent.x - this.x) / dist;
                var difY = (ent.y - this.y) / dist;
                this.velocity.x -= difX * acceleration / (dist * dist);
                this.velocity.y -= difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }

            




        }
    }


    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
};

Circle.prototype.draw = function (ctx) {

    if (this.it === false && this.whiteBloodCell === false) {
        this.redAnimation.drawFrame(this.game.clockTick, ctx, this.x -15, this.y -15, .075);
    } else if (this.it ){
        //ctx.beginPath();
        //ctx.fillStyle = this.colors[this.color];
        //ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        //ctx.fill();
        this.VirusAnimation.drawFrame(this.game.clockTick, ctx, this.x - 15, this.y - 15, .075);
    ctx.closePath();
    } else if (this.whiteBloodCell===true) {
        //ctx.beginPath();
        //ctx.fillStyle = this.colors["white"];
        //ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        //ctx.fill();
        this.WhiteBloodAnimation.drawFrame(this.game.clockTick, ctx, this.x - 15, this.y - 15, .1);
    }
};

function Background(game, background) {
    this.active_background = background;
    this.x = 0;
    this.y = 0;
    this.startX = 0;
    this.startY = 0;
    this.game = game;
    this.ctx = game.ctx;
}

Background.prototype.draw = function () {
    //console.log(this.active_background);
    this.ctx.drawImage(this.active_background,
                  0, 0,  // source from sheet
                  1000, 900,
                  0, 0,
                  1000,
                  900);
}

Background.prototype.update = function () {
    //do nothing
}


// the "main" code begins here
var friction = 1.0;
var acceleration = 1000000;
var maxSpeed = 75;

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/960px-Blank_Go_board.png");
ASSET_MANAGER.queueDownload("./img/black.png");
ASSET_MANAGER.queueDownload("./img/white.png");
ASSET_MANAGER.queueDownload("./img/Red.png");
ASSET_MANAGER.queueDownload("./img/Virus.png");
ASSET_MANAGER.queueDownload("./img/tube.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');


    var gameEngine = new GameEngine();
    //gameEngine.addEntity(new Background(gameEngine, ASSET_MANAGER.getAsset("./img/tube.png")));
    
    gameEngine.init(ctx);
    gameEngine.addEntity(new Background(gameEngine, ASSET_MANAGER.getAsset("./img/tube.png")));

    var circle = new Circle(gameEngine);
    circle.setIt();
    gameEngine.addEntity(circle);
    circle = new Circle(gameEngine);
    circle.setIt();
    gameEngine.addEntity(circle);
    circle = new Circle(gameEngine);
    circle.setIt();
    gameEngine.addEntity(circle);
    for (var i = 0; i < 20; i++) {
        circle = new Circle(gameEngine);
        gameEngine.addEntity(circle);
    }
    for (var j = 0; j < 4; j++) {
        circle = new Circle(gameEngine);
        circle.setWhitBlood();
        gameEngine.addEntity(circle);
    }




    
    gameEngine.start();
});
