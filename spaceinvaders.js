var myVar;
var moveInt;

function Game(canvas) {
    this.lives = 3;
    this.score = 0;
    this.level = 1;
    this.speed = 2;
    this.cannon = null;
    this.invaders = [];
    this.firingInvaders = [];
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.bombs = [];
    
    this.updateFront = function(r, c){
        for(var i = this.invaders.length -1; i > 0; i--){
            if (this.invaders[i].row < r && this.invaders[i].column == c && this.invaders[i].dead == false) {
                this.invaders[i].isFront = true;
                this.firingInvaders.push(this.invaders[i]);
                
                break;
            }
        }
    }
}

//the process of the game that is updated constantly
Game.prototype.process = function() {
    var alldead=0;
    
    //move each invader
    for(i=0; i<this.invaders.length; i++) {
        var invader = this.invaders[i];
        invader.move(this.ctx);
        if(invader.dead == false){
            invader.draw(this.ctx);
        }
    }
    
    //count the dead invaders
    for(i=0; i<this.invaders.length; i++) {
        if(this.invaders[i].dead == true){
            alldead +=1;
        }
    }
    
    //if all invaders are dead, move to a new level
    if (alldead==55) {
        this.newLevel();
    }
    
    //keep track of front invaders
    this.firingInvaders=[];
    for (var i=0; i < this.invaders.length; i++) {
        if (this.invaders[i].isFront) {
            this.firingInvaders.push(this.invaders[i]);
        }
    }
    
    //use random() function to decide who shoots
    var ind = Math.floor(Math.random() * 10);
    var fire = Math.random();
    if(fire > 0.97 && this.firingInvaders[ind] && !this.firingInvaders[ind].dead){
        this.bombs.push(new Bomb(this.firingInvaders[ind].x,
        this.firingInvaders[ind].y + this.firingInvaders[ind].height, this));
    }

    //draw and move bombs
    for(var i=0; i<this.bombs.length; i++) {
        var bomb = this.bombs[i];
        bomb.draw(this.ctx);
        bomb.move(this.ctx);
        if(bomb.hit()){
            if (this.lives < 1) {
                for (var j=0; j<this.bombs.length; j++) {  
                    this.bombs[j].remove(this.ctx);
                }
            }
            bomb.remove(this.ctx);
            this.bombs.splice(i--, 1);
        }
        if(bomb.y > this.canvas.height) {
            this.bombs.splice(i--, 1);
        }
    }
 
    //display score, level and number of lives 
    this.ctx.clearRect(0, 0, 700, 40);
    this.ctx.font="20px Arial";
    this.ctx.fillStyle = "red";
    this.ctx.fillText("Current score: " + this.score, 10, 20);
    this.ctx.fillText("Level: " + this.level, 620, 20);
    this.ctx.fillText("Lives: " + this.lives, 320, 20);
}

Game.prototype.newLevel = function() {
    this.ctx.clearRect(0, 0, 700, 450);
    this.level += 1;
    this.speed += 1;
    clearInterval(window.myVar);
    clearInterval(window.moveInt);
    this.firingInvaders = [];
    if (this.invaders.length > 0){
        var l = this.invaders.length;
        for(var i=0; i< l; i++){
            this.invaders[i].remove(this.ctx);  
        }
        this.invaders = [];
    }
    helper(this);
}

Game.prototype.over = function(){
    clearInterval(window.myVar);
    clearInterval(window.moveInt);
    this.canvas.width = this.canvas.width;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.font="25px Arial";
    this.ctx.fillStyle = "white";
    this.ctx.fillText("GAME OVER!", 270, 60);
    this.ctx.font="25px Arial";
    this.ctx.fillText("You scored: " + this.score, 270, 90);
    this.firingInvaders = [];
    
    if (this.invaders.length > 0){
        var l = this.invaders.length;
        for(var i=0; i< l; i++){
            this.invaders[i].remove(this.ctx);   
        }
        this.invaders = [];
    }
   
    this.cannon.remove(this.ctx);
    this.score = 0;

    document.getElementById("Start").style.display="block";
}

function start(canvas) {
    document.getElementById("Start").style.display="none";
    var game = new Game(canvas);
    game.ctx.clearRect(0, 0, 700, 500);
    var cannon = new Cannon(game.canvas.width / 2, game.canvas.height, game);
    cannon.draw(game.ctx);
    game.cannon = cannon;
    helper(game);
}


function helper(game){
    var l = game.cannon.bullets.length;
    for (var i=0; i < l; i++){
        game.cannon.bullets[i].remove(game.ctx);
    }
    var types = {0:30, 1:20, 2:20, 3:10, 4:10};
    for(var row = 0; row < 5; row++){
        for(var column = 0; column < 11; column++) {
            var x = (game.canvas.width / 2) + ((5 - column) * 32);
            var y = (100 + row * 30);
       
            var invader=new Invader(x, y, row, column, types[row], x - 170 , x + 170, y + 250, game);
            if (row==4) {
                invader.isFront = true;
            }
            game.invaders.push(invader);
            invader.draw(game.ctx);
        }
    }
    
    var keycode;
    
    game.cannon.draw(game.ctx);
    window.addEventListener("keydown", function keydown(key) {
        keycode = key.which || window.event.keycode;
        game.cannon.move(game.ctx, keycode, game.invaders);
        game.cannon.draw(game.ctx);
    });
    window.myVar=setInterval(function () {game.process();}, 1000 / 20);
    
}


// Cannon
function Cannon(x, y, game){
    this.x = x;
    this.y = y;
    this.width = 54;
    this.height = 40;
    this.bullets = [];
 
    this.draw = function(ctx) {
        var img = new Image();
        img.src = 'cannon.jpeg';
        ctx.drawImage(img, this.x - this.width/2, this.y - this.height, this.width, this.height);

        
        
    }
    
    //move cannon depending on the keycode
    this.move = function(ctx, keycode, invaders) {
        ctx.clearRect(this.x - this.width/2, this.y - this.height, this.width, this.height-2);
        if(keycode == 37) {
            this.x -= 10;
        } if(keycode == 39) {
            this.x += 10;
        } if(keycode == 32) {
            this.fire(ctx, invaders); 
        }
     
        //control the coordinates of the cannon
        if(this.x < this.width/2) {
            this.x = this.width/2;
        }
        if(this.x > 700-this.width/2) {
            this.x = 700-this.width/2;
        }
    }
    
    // fire the invaders
    this.fire = function(ctx, invaders){
        var b = new Bullet(this.x, this.y - this.height, game);
        b.draw(ctx);
        this.bullets.push(b);
        window.moveInt = setInterval(function () {b.move(ctx, invaders);}, 1000 / 20);
    }
 
    this.remove = function(ctx) {
        ctx.clearRect(this.x - this.width/2, this.y - this.height, this.width, 
        this.height);
        delete this.x;
        delete this.y;
    }
}

//Cannon's Bullet to shoot the Invaders
function Bullet(x, y, game) {
    this.x = x;
    this.y = y;
    this.done = false;
 
    this.draw = function(ctx){
        ctx.fillStyle = "green";
        if (this.done == false){
            ctx.fillRect(this.x, this.y-18, 1, 2);
        }
    }
    
  this.move = function(ctx, invaders) {
      ctx.clearRect(this.x, this.y-18, 1, 2);
      this.y -= 18;
      this.draw(ctx);
      this.hit(ctx, invaders);
  }
 
 //check whether the invaders are hit by Bullet, and if so, increase the game score
  this.hit = function(ctx, invaders) {
      for(var i = 0; i < invaders.length; i++){
          if(this.x >= (invaders[i].x - invaders[i].width/2) && 
              this.x <= (invaders[i].x + invaders[i].width/2) &&
              this.y >= (invaders[i].y - invaders[i].height/2) && 
              this.y <= (invaders[i].y + invaders[i].height/2)
              && invaders[i].dead == false && this.done == false) {        
                  game.score += invaders[i].type;
                  //update the front invader
                  if (invaders[i].isFront==true){
                      game.updateFront(invaders[i].row, invaders[i].column);
                  }
                  invaders[i].remove(ctx);                  
                  this.remove(ctx);
                  break;
          }
      }
  }
  
  this.remove = function(ctx) {
      ctx.clearRect(this.x, this.y-18, 1, 2);
      this.done = true;
      delete this.x;
      delete this.y;
  }
}


//Invader
function Invader(x, y, row, column, type, left, right, bottom, game) {
    this.x = x;
    this.y = y;
    this.row = row;
    this.column = column;
    this.type = type;
    this.width = 18;
    this.height = 16;
    this.boundLeft = left;
    this.boundRight = right;
    this.boundBottom = bottom;
    this.hitRight = false;
    this.hitLeft = false;
    this.hitBottom = false;
    this.dead = false;
    this.isFront = false;
  
    //draw an invader
    this.draw = function(ctx) {
        var img = new Image();
        if(this.type == 30){
            img.src = 'inv1.jpeg';
            ctx.drawImage(img, this.x - this.width/2, this.y - this.height/2, this.width, this.height);
        } else if(this.type == 20) {
            img.src = 'inv2.jpeg';
            ctx.drawImage(img, this.x - this.width/2, this.y - this.height/2, this.width, this.height);
        } else {
            img.src = 'inv3.jpeg';
            ctx.drawImage(img, this.x - this.width/2, this.y - this.height/2, this.width, this.height);
        }
     }
     
    //move an invader
    this.move = function(ctx) {
        ctx.clearRect(this.x - this.width/2, this.y - this.height/2,
        this.width, this.height);
        
        if(!this.hitRight && !this.hitBottom && !this.hitLeft) {
            this.x += game.speed;
        }
     
        if(this.x >= this.boundRight) {
            this.hitRight = true;
            this.hitLeft = false;
            this.y += 12;
        }
        
        if(this.y > this.boundBottom){
            this.hitBottom = true;
        }
        
        if (this.x <= this.boundLeft) {
            this.hitLeft = true;this.hitRight = false;
            this.y += 12;
        }
        
        if(this.hitRight){
            this.x -= game.speed;
        } else if (this.hitLeft) {
            this.x += game.speed;
        }
   
        // if hit bottom, game is over
        if(this.hitBottom) {
            game.over();
        }
    }
    
    //remove an invader
    this.remove = function(ctx) {
        ctx.clearRect(this.x - this.width/2, this.y - this.height/2, 
        this.width, this.height);
        this.dead = true;
        if (this.isFront){
            var index = game.firingInvaders.indexOf(this);
            game.firingInvaders.splice(index, 1);
        }
        delete this.x;
        delete this.y;
    }
}

//Bomb(invader's weapon)
function Bomb(x, y, game) {
    this.x = x;
    this.y = y;
    this.done = false;
 
    //draw a bomb
    this.draw = function(ctx){
        ctx.fillStyle = "red";
        ctx.fillRect(this.x, this.y, 4, 4);
    }
    
    //move a bomb
    this.move = function(ctx) {
        ctx.clearRect(this.x, this.y, 4, 4);
        this.y += game.speed * 2;
        ctx.fillRect(this.x, this.y, 4, 4);
    }
  
    //return true if bomb hits cannon, otherwise return false
    this.hit = function() {
        if(this.x >= (game.cannon.x - game.cannon.width/2) && 
            this.x <= (game.cannon.x + game.cannon.width/2) && 
            this.y >= (game.cannon.y - game.cannon.height)){
            game.ctx.clearRect(game.cannon.x - game.cannon.width/2, 
            game.cannon.y - game.cannon.height, game.cannon.width, game.cannon.height);
            setTimeout(function () {game.cannon.draw(game.ctx);}, 200);
            game.lives--;
            this.done = true;
            if (game.lives == 0) {
                game.over();
            }
            return true;
        }
        return false;
    }
 
    //remove bomb
    this.remove = function(ctx) {
        ctx.clearRect(this.x, this.y, 4, 4);
        delete this.x;
        delete this.y;
    }
}