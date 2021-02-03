var canvas = document.getElementById("mycanvas")
var ctx = canvas.getContext("2d")

//used to store 2 dimensional array of points
var pts = [];
var paths = [];

//an array which acts like a stack for DFS
var ptStack = [];

//Queue for BFS algorithm
var solveQueue = [];

var start = null;
var goal = null;

//variable to set the size of the grid
var gridSize = 60;

initialize();
//var mazeInterval = setInterval(createMaze, 50);
var solveMaze = setInterval(bfsSolve, 0.001);

function initialize(){
  //create the points
  for(var i = 0; i<gridSize; i++){
    var row = [];
    for(var j = 0; j<gridSize; j++){
      row.push(new Point(i,j));
      row[j].draw(); //draw Point to screen

      //set up neighbors and add to points array
      if(i>0){
        pts[i-1][j].neighbors.push(row[j]);
        row[j].neighbors.push(pts[i-1][j]);
      }

      if(j>0){
        row[j-1].neighbors.push(row[j]);
        row[j].neighbors.push(row[j-1]);
      }
    }
    pts.push(row);
  }
  //pick a random point to start at for DFS algorithm
  start = pickRandomPoint();
  ptStack.push(start);
  ptStack[0].dfsVisited = true;

  createMaze();
  drawMaze();

  //pick random points for Start and Goal
  start = pickRandomPoint();
  start.bfsVisited = true;
  solveQueue.push(start);

  goal = pickRandomPoint();
}

function pickRandomPoint(){
  var x = Math.floor(Math.random()*gridSize);
  var y = Math.floor(Math.random()*gridSize);
  return pts [x][y];
}

//Constructor for a point object
function Point(x, y){
  this.drawX = (x+1)*10;
  this.drawY = (y+1)*10;
  this.dfsVisited = false;
  this.bfsVisited = false;  
  this.neighbors = [];
  this.paths = [];

  //stores the parent in relation to the BFS traversal

  this.draw = function(){
    ctx.beginPath();
    ctx.fillStyle = "red";
    ctx.fillRect(this.drawX-2, this.drawY-2, 4, 4);
    ctx.closePath();
  };
  
  this.getUnvisited = function(){
    //clear any dfsVisited neighbors from the array
    for(var i = this.neighbors.length-1; i>=0; i--){
      if(this.neighbors[i].dfsVisited){
        this.neighbors.splice(i, 1);
      }
    }

    //select a random unvisited neighbor to visit
    if(this.neighbors.length>0){
      var idx = Math.floor(Math.random()*this.neighbors.length);
      return this.neighbors[idx];
    }
    else{
      return false;
    }
  }
}

//constructor for Path object
function Path(p1, p2, color){
  this.p1 = p1;
  this.p2 = p2;
  this.color = color;
  
  //determines if the path is horizontal or vetical
  this.vertical = p1.drawX == p2.drawX;
  this.draw = function() {
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    
    if(this.vertical){
      //this code makes corners look nice!
      ctx.moveTo(p1.drawX, Math.min(p1.drawY, p2.drawY)-2);
      ctx.lineTo(p2.drawX, Math.max(p1.drawY, p2.drawY)+2);
    }
    else{
      ctx.moveTo(p1.drawX, p1.drawY);
      ctx.lineTo(p2.drawX, p2.drawY);
    }

    ctx.stroke();
    ctx.closePath();
  }
}

function drawMaze(){
  //clear red dots
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for(var i = 0; i<paths.length; i++){
    paths[i].draw();
  }
}

//create maze function
function createMaze(){
  while(true){
    ptStack[0].draw();

    //either has a point or "false" inside
    var nb = ptStack[0].getUnvisited();
    
    while(nb==false){
      //"pop" the first item off the stack
      ptStack.splice(0, 1);

      if(ptStack.length == 0){
        //clearInterval(mazeInterval);
        return;
      }
      nb = ptStack[0].getUnvisited();
    }
    nb.dfsVisited = true;
    paths.push(new Path(ptStack[0], nb, "blue"));
    ptStack[0].paths.push(nb);
    nb.paths.push(ptStack[0]);

    //"push" an item onto the stack
    ptStack.splice(0, 0, nb);  
  }
}

function bfsSolve(){
  drawMaze();
  goal.draw();
  start.draw();

  var pt = solveQueue.pop();
  if(pt==goal){
    clearInterval(solveMaze);
    drawSolution();
    return;
  }

  pt.bfsVisited = true;
  for(var i = 0; i<pt.paths.length; i++){
    if(!pt.paths[i].bfsVisited){
      pt.paths[i].parent = pt;
      solveQueue.splice(0, 0, pt.paths[i]);
      paths.push(new Path(pt, pt.paths[i], "green"));
    }
  }
}

function drawSolution(){
  while (paths[paths.length-1].color === "green"){
    paths.pop();
  }
  var pt = goal;
  while(pt.parent != null){
    paths.push(new Path(pt, pt.parent, "red"));
    pt = pt.parent;
  }
  drawMaze();
  goal.draw();
  start.draw();
}