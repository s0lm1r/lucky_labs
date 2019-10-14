'use strict';

const app = new PIXI.Application({width: 1280, height: 720});
document.body.appendChild(app.view);
PIXI.loader
.add("images/background.png")
.add("images/asteroid.png")
.add("images/spaceship.png")
.load(setup);

const gameScene = new PIXI.Container();
const gameOverScene = new PIXI.Container();
const gameWinScene = new PIXI.Container();

gameOverScene.visible = false;
gameWinScene.visible = false;
 
app.stage.addChild(gameScene);
app.stage.addChild(gameOverScene);
app.stage.addChild(gameWinScene);

let bg = null;
let bgEnd = null;
let bgWin = null;
let spaceship = null;
let asteroid = null;
let lastShoot = null;

let asteroids = [];
let bullets = [];
let isShooted = false;
let isBulletCreated = false;
let tweenStarted = false;
let isHited = false;
let tutorial = false;

let moveLeft = false;
let moveRight = false;
let isLeftPushed = false;
let isRightPushed = false;

let destroyed = 0;
let secondsForLevel = 60;
let timeForLevel =  secondsForLevel * 60;
let displayedSec = timeForLevel / 60;
let secondsLeft = 0;
let timeLeft = 0;
let shootsAmount = 10;

const styleGameOver = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 32,
    fontStyle: 'italic',
    fontWeight: 'bold',
    fill: ['#ffffff', '#ff0000'],
    stroke: '#4a1850',
    strokeThickness: 5,
    dropShadow: true,
    dropShadowColor: '#000000',
    dropShadowBlur: 4,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 6,
    align: 'center',
    wordWrap: true,
    wordWrapWidth: 1240,
});
let styleGameWin = Object.assign({}, styleGameOver);
styleGameWin.fill = ['#ffffff', '#00ff99'];
let styleTutorial = Object.assign({}, styleGameOver);
styleTutorial.fill = ['#ffff00'];

const gameOverText = new PIXI.Text('YOU LOSE', styleGameOver);
const gameWinText = new PIXI.Text('YOU WIN', styleGameWin);
const tutorialText = new PIXI.Text(
    `Push buttons "ArrowLeft" or "ArrowRight" for moving
    and "Space" for shooting.
    Destroy all asteroids.
    You have only ${secondsForLevel} seconds and ${shootsAmount} shoots.

    May the Force be with You...`, styleTutorial); 
let  timer = new PIXI.Text('Time:' + displayedSec, styleGameOver); 

function setup() {

    bg = new PIXI.Sprite(PIXI.utils.TextureCache["images/background.png"]);
    bgEnd = new PIXI.Sprite(PIXI.utils.TextureCache["images/background.png"]);
    bgWin = new PIXI.Sprite(PIXI.utils.TextureCache["images/background.png"]);
    bg.anchor.set(0.5);
    bg.position.set(bg.width / 2, bg.height / 2)
    gameScene.addChild(bg);
    
    gameOverScene.addChild(bgEnd);
    gameOverScene.addChild(gameOverText);
    gameOverText.anchor.set(0.5);
    gameOverText.position.set(bg.width / 2, bg.height / 4);

    gameWinScene.addChild(bgWin);
    gameWinScene.addChild(gameWinText);
    gameWinText.anchor.set(0.5);
    gameWinText.position.set(bg.width / 2, bg.height / 4);

    gameScene.addChild(timer);
    
    for (let i = 0; i < 5; i++) {
        asteroid = new PIXI.Sprite(PIXI.utils.TextureCache["images/asteroid.png"]);
        asteroid.position.set(bg.width / 6 + i * 200, randomInteger(70, 200));
        asteroid.anchor.set(0.5);
        asteroid.scale.set(0.8);
        asteroid.direction = Math.random() * Math.PI * 2;
        asteroid.directionY = 1;
        asteroid.speed = 2 + Math.random();
        asteroids.push(asteroid); 
        gameScene.addChild(asteroid);
    }
    spaceship = new PIXI.Sprite(PIXI.utils.TextureCache["images/spaceship.png"]);
    gameScene.addChild(spaceship);
    spaceship.position.set(bg.width / 2, bg.height / 2 + 1.5 * spaceship.height);
    spaceship.anchor.set(0.5);
    gameScene.addChild(tutorialText);
    tutorialText.anchor.set(0.5);
    tutorialText.position.set(bg.width / 2, bg.height / 2);
    startTween();

    function checkKeyDown(event) {
       
        if (event.key === 'ArrowRight') {
            tutorial = true;
            if (moveLeft) moveLeft = false;
            moveRight = true;
            isRightPushed = true;
        }
        if (event.key === 'ArrowLeft') {
            tutorial = true;
            moveLeft = true;
            if (moveRight) moveRight = false;
            isLeftPushed = true;
        }
        if (event.key === ' ') {   
            tutorial = true;  
            if(!isShooted && shootsAmount > 0) {
                createBullet();
                isShooted = true;
                isHited = false;
                shootsAmount--;
            }
        }
    };

    function checkKeyUp(event) { 
        if (event.key === ' ') {
            isShooted = false;
        }
        if (event.key === 'ArrowLeft') {
            moveLeft = false;
            if (isRightPushed) moveRight = true;
            isLeftPushed = false;
        }
        if (event.key === 'ArrowRight') {
            moveRight = false;
            if (isLeftPushed) moveLeft = true;
            isRightPushed = false;
        }
    };
    window.addEventListener("keydown", checkKeyDown);
    window.addEventListener("keyup", checkKeyUp);
};

function startTween(isWin) {

    const tweenTutorialText = createjs.Tween.get(tutorialText).to({y: -bg.width / 2}, 160000);
    if (tweenStarted) return;
    if (tutorial) {
        const text = isWin ? gameWinText : gameOverText;
        const tweenText = createjs.Tween.get(text).to({y: bg.width / 2}, 10000);
    }
};

function createBullet() {
    const bullet = new PIXI.Graphics();
    bullet.lineStyle(0); 
    bullet.beginFill(0xFF00, 1);
    bullet.drawCircle(0, 0, 13);
    bullet.endFill();
    bullets.push(bullet);
    gameScene.addChild(bullet); 
    bullet.position.set(spaceship.position.x, spaceship.position.y - 17);
};
 
function gameLoop(delta) {
    if (tutorial) gameScene.removeChild(tutorialText);
    if (spaceship) {
        if (moveLeft) spaceship.position.x -= 2;
        if (moveRight) spaceship.position.x += 2;
        if (spaceship.position.x > (bg.width - spaceship.width / 2)) {
            spaceship.position.x = bg.width - spaceship.width / 2
        };
        if (spaceship.position.x < (spaceship.width / 2 )) {
            spaceship.position.x = spaceship.width / 2
        };
    }

    if (destroyed > 4) {
        gameWinScene.visible = true;
        gameScene.visible = false;
        let isWin = true;
        startTween(isWin);
        tweenStarted = true;
        return;
    }
    for (let j = 0; j < asteroids.length; j++) {
        if (asteroids[j])  {
            j % 2 === 0 ? asteroids[j].rotation += 0.01 : asteroids[j].rotation -= 0.01;
        }
    }
    if (tutorial) {
        timeLeft += delta;
        secondsLeft += delta;

    if (secondsLeft > 60) {
        secondsLeft = 0;
        displayedSec--;
        gameScene.removeChild(timer);
        timer = new PIXI.Text('Time:' + displayedSec, styleGameOver); 
        gameScene.addChild(timer);
    }
    
    for (let j = 0; j < asteroids.length; j++) {
        if (asteroids[j])  {
            asteroids[j].x += Math.sin(asteroids[j].direction) * asteroids[j].speed;
            asteroids[j].y += Math.cos(asteroids[j].direction) * asteroids[j].speed * asteroids[j].directionY; 
                if (asteroids[j].x < 60 || asteroids[j].x > 1230) asteroids[j].direction  *= -1;
                if (asteroids[j].y < 60 || asteroids[j].y > 450) asteroids[j].directionY *= -1;
            for (let l = 0; l < asteroids.length; l++) {
                if (asteroids[j] === asteroids[l]) continue;  
                if (hitTestCircle(asteroids[j], asteroids[l])) {       
                    asteroids[j].direction  *= -1;
                    asteroids[j].directionY *= -1;
                }
            }   
        }
    }
    for (let i = 0; i < bullets.length; i++) { 
        bullets[i].position.y -= 5;
            if (shootsAmount === 0) lastShoot = bullets[bullets.length -1];
            
        for (let k = 0; k < asteroids.length; k++) {
            if (!bullets[i]) return;
            if (hitTestCircle(bullets[i],asteroids[k])) {
                destroyed++;
                isHited = true;
                gameScene.removeChild(asteroids[k]);
                gameScene.removeChild(bullets[i]);
                asteroids.splice(k, 1);
                bullets.splice(i, 1);
            }
        } 
    }}     
    if (timeLeft > timeForLevel ||
        (shootsAmount < 1 && destroyed < 5 &&
        (lastShoot.position.y < 0 || isHited))) {
        gameOverScene.visible = true;
        gameScene.visible = false; 
        startTween();
        tweenStarted = true;
        return;
    }
};

app.ticker.add(delta => gameLoop(delta));

function randomInteger(min, max) {
    let rand = min - 0.5 + Math.random() * (max - min + 1);
    rand = Math.round(rand);
    return rand;
};

function hitTestCircle(c1, c2) {
   
    let hit = false, r1, r2, dx, dy;
    
    c1.centerX = c1.x;
    c1.centerY = c1.y;
    c2.centerX = c2.x;
    c2.centerY = c2.y;
    r1 = (c1.width / 2) - 5;
    r2 = (c2.width / 2) - 5;
    dx = c1.centerX - c2.centerX;
    dy = c1.centerY - c2.centerY;
  
    if (Math.sqrt(dx * dx + dy * dy) < (r1 + r2)) {
            hit = true;
        } else {
            hit = false;
    }
    return hit;
};