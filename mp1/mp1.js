/**
 * @author Maher Samawi
 * Used the code from the HelloAnimation file as a starter
 */

var gl;
var canvas;
var shaderProgram;
var vertexPositionBuffer;

// Counter to create the animation for the orange strips 
var counter = 0;
var randNum = 0;

var triangleVertices;
// Create a place to store vertex colors
var vertexColorBuffer;

var mvMatrix = mat4.create();
var rotAngle = 0;
var lastTime = 0;


/**
 * Sends projection/modelview matrices to shader
 */
function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}


/**
 * Translates degrees to radians
 * @param {Number} degrees Degree input to function
 * @return {Number} The radians that correspond to the degree input
 */
function degToRad(degrees) {
        return degrees * Math.PI / 180;
}


/**
 * Creates a context for WebGL
 * @param {element} canvas WebGL canvas
 * @return {Object} WebGL context
 */
function createGLContext(canvas) {
  var names = ["webgl", "experimental-webgl"];
  var context = null;
  for (var i=0; i < names.length; i++) {
    try {
      context = canvas.getContext(names[i]);
    } catch(e) {}
    if (context) {
      break;
    }
  }
  if (context) {
    context.viewportWidth = canvas.width;
    context.viewportHeight = canvas.height;
  } else {
    alert("Failed to create WebGL context!");
  }
  return context;
}


/**
 * Loads Shaders
 * @param {string} id ID string for shader to load. Either vertex shader/fragment shader
 */
function loadShaderFromDOM(id) {
  var shaderScript = document.getElementById(id);
  
  // If we don't find an element with the specified id
  // we do an early exit 
  if (!shaderScript) {
    return null;
  }
  
  // Loop through the children for the found DOM element and
  // build up the shader source code as a string
  var shaderSource = "";
  var currentChild = shaderScript.firstChild;
  while (currentChild) {
    if (currentChild.nodeType == 3) { // 3 corresponds to TEXT_NODE
      shaderSource += currentChild.textContent;
    }
    currentChild = currentChild.nextSibling;
  }
 
  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }
 
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);
 
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  } 
  return shader;
}


/**
 * Setup the fragment and vertex shaders
 */
function setupShaders() {
  vertexShader = loadShaderFromDOM("shader-vs");
  fragmentShader = loadShaderFromDOM("shader-fs");
  
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Failed to setup shaders");
  }

  gl.useProgram(shaderProgram);
  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  
}


/**
 * Populate buffers with data
 */
function setupBuffers() {
  vertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  triangleVertices = [
      // Top Triangles (Blue)
     -0.8, 0.7, 0.0,
     -0.8, 0.5, 0.0,
      0.8,  0.5, 0.0,

      0.8, 0.5, 0.0,
      0.8, 0.7, 0.0,
     -0.8, 0.7, 0.0,
      
      // Left Triangles (Blue)
     -0.6 , 0.5, 0.0,
     -0.3, -0.3, 0.0,
     -0.3, 0.5, 0.0,
        
     -0.6, -0.3, 0.0,
     -0.6, 0.5, 0.0,
     -0.3, -0.3, 0.0,
      
      // Right Triangles (Blue)
      0.6, 0.5, 0.0,
      0.3, -0.3, 0.0,
      0.3, 0.5, 0.0,
        
      0.6, 0.5, 0.0,
      0.6, -0.3, 0.0,
      0.3, -0.3, 0.0,
      
      // Middle Triangles that form indent in the I (Left Side)
     -0.3, -0.1, 0.0,
     -0.3,  0.25, 0.0,
     -0.15, -0.1, 0.0,
      
     -0.15, -0.1, 0.0,
     -0.3,  0.25, 0.0,
     -0.15, 0.25, 0.0,
      
      // Middle Triangles that form indent in the I (Right Side)
      0.3, -0.1, 0.0,
      0.3,  0.25, 0.0,
      0.15, -0.1, 0.0,
      
      0.15, -0.1, 0.0,
      0.3,  0.25, 0.0,
      0.15, 0.25, 0.0,
      
      // Orange Strips 
      // 1st One
     -0.5, -0.35, 0.0,
     -0.5, -0.45, 0.0,
     -0.6, -0.35, 0.0,
      
     -0.6, -0.40, 0.0,
     -0.6, -0.35, 0.0,
     -0.5, -0.45, 0.0,
      
      // 2nd one
     -0.3, -0.35, 0.0,
     -0.3, -0.6, 0.0,
     -0.4, -0.35, 0.0,
      
     -0.4, -0.5, 0.0,
     -0.4, -0.35, 0.0,
     -0.3, -0.6, 0.0,
      
      // 3rd one
     -0.05, -0.35, 0.0,
     -0.05, -0.75, 0.0,
     -0.15, -0.35, 0.0,
      
     -0.15, -0.65, 0.0,
     -0.15, -0.35, 0.0,
     -0.05, -0.75, 0.0,
      
      // 4th One
      0.1, -0.35, 0.0,
      0.1, -0.75, 0.0,
      0.2, -0.35, 0.0,
      
      0.2, -0.65, 0.0,
      0.2, -0.35, 0.0,
      0.1, -0.75, 0.0,
      
      // 5th One
      0.3, -0.35, 0.0,
      0.3, -0.6, 0.0,
      0.4, -0.35, 0.0,
      
      0.4, -0.5, 0.0,
      0.4, -0.35, 0.0,
      0.3, -0.6, 0.0,
      
      // 6th One
      0.5, -0.35, 0.0,
      0.5, -0.45, 0.0,
      0.6, -0.35, 0.0,
      
      0.6, -0.40, 0.0,
      0.6, -0.35, 0.0,
      0.5, -0.45, 0.0,   
  ];
    
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.DYNAMIC_DRAW); // Dynmaic draw
  vertexPositionBuffer.itemSize = 3;
  vertexPositionBuffer.numberOfItems = 66;
    
  vertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  var colors = [
     // Blue
     0.0, 0.0, 0.7, 1.0,
     0.0, 0.0, 0.7, 1.0,
     0.0, 0.0, 0.7, 1.0,

     0.0, 0.0, 0.7, 1.0,
     0.0, 0.0, 0.7, 1.0,
     0.0, 0.0, 0.7, 1.0,

     0.0, 0.0, 0.7, 1.0,
     0.0, 0.0, 0.7, 1.0,
     0.0, 0.0, 0.7, 1.0,

     0.0, 0.0, 0.7, 1.0,
     0.0, 0.0, 0.7, 1.0,
     0.0, 0.0, 0.7, 1.0,

     0.0, 0.0, 0.7, 1.0,
     0.0, 0.0, 0.7, 1.0,
     0.0, 0.0, 0.7, 1.0,

     0.0, 0.0, 0.7, 1.0,
     0.0, 0.0, 0.7, 1.0,
     0.0, 0.0, 0.7, 1.0,

     0.0, 0.0, 0.7, 1.0,
     0.0, 0.0, 0.7, 1.0,
     0.0, 0.0, 0.7, 1.0,

     0.0, 0.0, 0.7, 1.0,
     0.0, 0.0, 0.7, 1.0,
     0.0, 0.0, 0.7, 1.0,

     0.0, 0.0, 0.7, 1.0,
     0.0, 0.0, 0.7, 1.0,
     0.0, 0.0, 0.7, 1.0,

     0.0, 0.0, 0.7, 1.0,
     0.0, 0.0, 0.7, 1.0,
     0.0, 0.0, 0.7, 1.0,

     // Orange
     1.0, 0.2, 0.0, 1.0,
     1.0, 0.2, 0.0, 1.0,
     1.0, 0.2, 0.0, 1.0,

     1.0, 0.2, 0.0, 1.0,
     1.0, 0.2, 0.0, 1.0,
     1.0, 0.2, 0.0, 1.0,

     1.0, 0.2, 0.0, 1.0,
     1.0, 0.2, 0.0, 1.0,
     1.0, 0.2, 0.0, 1.0,

     1.0, 0.2, 0.0, 1.0,
     1.0, 0.2, 0.0, 1.0,
     1.0, 0.2, 0.0, 1.0,

     1.0, 0.2, 0.0, 1.0,
     1.0, 0.2, 0.0, 1.0,
     1.0, 0.2, 0.0, 1.0,

     1.0, 0.2, 0.0, 1.0,
     1.0, 0.2, 0.0, 1.0,
     1.0, 0.2, 0.0, 1.0,

     1.0, 0.2, 0.0, 1.0,
     1.0, 0.2, 0.0, 1.0,
     1.0, 0.2, 0.0, 1.0,

     1.0, 0.2, 0.0, 1.0,
     1.0, 0.2, 0.0, 1.0,
     1.0, 0.2, 0.0, 1.0,

     1.0, 0.2, 0.0, 1.0,
     1.0, 0.2, 0.0, 1.0,
     1.0, 0.2, 0.0, 1.0,

     1.0, 0.2, 0.0, 1.0,
     1.0, 0.2, 0.0, 1.0,
     1.0, 0.2, 0.0, 1.0,

     1.0, 0.2, 0.0, 1.0,
     1.0, 0.2, 0.0, 1.0,
     1.0, 0.2, 0.0, 1.0,

     1.0, 0.2, 0.0, 1.0,
     1.0, 0.2, 0.0, 1.0,
     1.0, 0.2, 0.0, 1.0,
    ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.DYNAMIC_DRAW);
  vertexColorBuffer.itemSize = 4;
  vertexColorBuffer.numItems = 66;  
}


/**
 * Draw call that applies matrix transformations to model and draws model in frame
 */
function draw() { 
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);  
  mat4.identity(mvMatrix);
  mat4.rotateX(mvMatrix, mvMatrix, degToRad(rotAngle));  
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
                         vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 
                            vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
  
  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numberOfItems);
}


/**
 * Animation to be called from tick. Updates globals and performs animation for each tick.
 */
function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;    
        rotAngle= (rotAngle+1.0) % 360;
    }
    lastTime = timeNow;
    
    // Check the counter to create a random number to add or subtract from the triangle vertices
    if (counter % 20 == 0) {
        randNum = Math.random() - 0.8;
    }
    if (counter % 15 == 0) {
        randNum = 0.1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);

    // Same array as before with the random number included
    triangleVertices = [
     // Top Triangles (Blue)
     -0.8, 0.7, 0.0,
     -0.8, 0.5, 0.0,
      0.8,  0.5, 0.0,

      0.8, 0.5, 0.0,
      0.8, 0.7, 0.0,
     -0.8, 0.7, 0.0,
      
     // Left Triangles (Blue)
     -0.6 , 0.5, 0.0,
     -0.3, -0.3, 0.0,
     -0.3, 0.5, 0.0,
        
     -0.6, -0.3, 0.0,
     -0.6, 0.5, 0.0,
     -0.3, -0.3, 0.0,
      
      // Right Triangles (Blue)
      0.6, 0.5, 0.0,
      0.3, -0.3, 0.0,
      0.3, 0.5, 0.0,
        
      0.6, 0.5, 0.0,
      0.6, -0.3, 0.0,
      0.3, -0.3, 0.0,
      
      // Middle Triangles that form indent in the I (Left Side)
     -0.3, -0.1, 0.0,
     -0.3,  0.25, 0.0,
     -0.15, -0.1, 0.0,
      
     -0.15, -0.1, 0.0,
     -0.3,  0.25, 0.0,
     -0.15, 0.25, 0.0,
      
      // Middle Triangles that form indent in the I (Right Side)
      0.3, -0.1, 0.0,
      0.3,  0.25, 0.0,
      0.15, -0.1, 0.0,
      
      0.15, -0.1, 0.0,
      0.3,  0.25, 0.0,
      0.15, 0.25, 0.0,
      
      // Orange Strips 
      // 1st One
      -0.5-randNum, -0.35, 0.0,
      -0.5-randNum, -0.45, 0.0,
      -0.6-randNum, -0.35, 0.0,
      
      -0.6-randNum, -0.40, 0.0,
      -0.6-randNum, -0.35, 0.0,
      -0.5-randNum, -0.45, 0.0,
      
      // 2nd One
      -0.3-randNum, -0.35, 0.0,
      -0.3-randNum, -0.6, 0.0,
      -0.4-randNum, -0.35, 0.0,
      
      -0.4-randNum, -0.5, 0.0,
      -0.4-randNum, -0.35, 0.0,
      -0.3-randNum, -0.6, 0.0,
      
      // 3rd One
      -0.05-randNum, -0.35, 0.0,
      -0.05-randNum, -0.75, 0.0,
      -0.15-randNum, -0.35, 0.0,
      
      -0.15-randNum, -0.65, 0.0,
      -0.15-randNum, -0.35, 0.0,
      -0.05-randNum, -0.75, 0.0,
      
      // 4th One
      0.1+randNum, -0.35, 0.0,
      0.1+randNum, -0.75, 0.0,
      0.2+randNum, -0.35, 0.0,
      
      0.2+randNum, -0.65, 0.0,
      0.2+randNum, -0.35, 0.0,
      0.1+randNum, -0.75, 0.0,
      
      // 5th One
      0.3+randNum, -0.35, 0.0,
      0.3+randNum, -0.6, 0.0,
      0.4+randNum, -0.35, 0.0,
      
      0.4+randNum, -0.5, 0.0,
      0.4+randNum, -0.35, 0.0,
      0.3+randNum, -0.6, 0.0,
      
      // 6th One
      0.5+randNum, -0.35, 0.0,
      0.5+randNum, -0.45, 0.0,
      0.6+randNum, -0.35, 0.0,
      
      0.6+randNum, -0.40, 0.0,
      0.6+randNum, -0.35, 0.0,
      0.5+randNum, -0.45, 0.0,   
    ];
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.DYNAMIC_DRAW);
    counter = counter + 1;
}


/**
 * Startup function called from html code to start program.
 */
 function startup() {
  canvas = document.getElementById("myGLCanvas");
  gl = createGLContext(canvas);
  setupShaders(); 
  setupBuffers();
  gl.clearColor(0.0, 0.0, 0.0, 0.0);
  gl.enable(gl.DEPTH_TEST);
  tick();
}

/**
 * Tick called for every animation frame.
 */
function tick() {
    requestAnimFrame(tick);
    draw();
    animate();
}
