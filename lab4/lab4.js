// Name: Cathrine Underbjerg Hansen and Marc Bohner

var gl;
var numVertices;
var numTriangles;
var near, far;
var aspect, fovy, left, right, bottom, test;
var projectionMatrix;
var R;

function initGL() {
  var canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  gl.enable(gl.DEPTH_TEST);
  gl.viewport(0, 0, 512, 512);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  var myShaderProgram = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(myShaderProgram);

  // The following block of code together with the
  // definitions in object.js are provided for diagnosis
  //
  // For full credit, REPLACE THE FOLLOWING BLOCK with
  // a block that loads the vertices and faces from the provided ply file
  // You are encouraged to explore THREE.js by using ChatGPT
  // to investigate how to load a PLY file and get
  // access to the vertices and faces
  //

  vertices = getVertices(); // currently defined in object.js
  indexLis = getFaces();
  t = getFaces();
  numVertices = vertices.length;
  numTriangles = indexList.length / 3;
  // End of block on reading vertices and faces that you should replace

  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indexList),
    gl.STATIC_DRAW
  );

  var verticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  var vertexPosition = gl.getAttribLocation(myShaderProgram, "vertexPosition");
  gl.vertexAttribPointer(vertexPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vertexPosition);

  // Insert your code here

  var e = vec3(0.0, 0.0, 4.0);
  var a = vec3(14.0, 0.0, 0.0);
  var vup = vec3(0.0, 1.0, 0.0);
  var d = subtract(e, a);
  var dCopy = vec3(d[0], d[1], d[2]);
  var n = normalize(dCopy);
  var k = cross(vup, n);
  var u = normalize(k);
  var l = cross(n, u);
  var v = normalize(l);

  var minv = mat4(
    u[0],
    u[1],
    u[2],
    dot(u, e),
    v[0],
    v[1],
    v[2],
    dot(v, e),
    n[0],
    n[1],
    n[2],
    dot(n, e),
    0.0,
    0.0,
    0.0,
    1.0
  );

  var M = inverse(minv);

  near = 0.001;

  far = 100;

  aspect = canvas.height / canvas.width;
  fovy = (45 * Math.PI) / 180;

  var modelViewMatrix = gl.getUniformLocation(
    myShaderProgram,
    "modelViewMatrix"
  );
  gl.uniformMatrix4fv(modelViewMatrix, false, flatten(M));

  projectionMatrix = gl.getUniformLocation(myShaderProgram, "projectionMatrix");

  var p0Location = gl.getUniformLocation(myShaderProgram, "p0");
  gl.uniform3f(p0Location,1.0, 2.0, 3.0);
  
  var IaLocation = gl.getUniformLocation(myShaderProgram, "Ia");
  gl.uniform3f(IaLocation, 1.0, 2.0, 3.0);

  var IdLocation = gl.getUniformLocation(myShaderProgram, "Id");
  gl.uniform3f(IdLocation, 1.0, 2.0, 3.0);

  var IsLocation = gl.getUniformLocation(myShaderProgram, "Is");
  gl.uniform3f(IsLocation, 1.0, 2.0, 3.0);

  var kaLocation = gl.getUniformLocation(myShaderProgram, "ka");
  gl.uniform3f(kaLocation, 1.0, 2.0, 3.0);

  var kdLocation = gl.getUniformLocation(myShaderProgram, "kd");
  gl.uniform3f(kdLocation, 1.0, 2.0, 3.0);

  var ksLocation = gl.getUniformLocation(myShaderProgram, "ks");
  gl.uniform3f(ksLocation, 1.0, 2.0, 3.0);

  var alphaLocation = gl.getUniformLocation(myShaderProgram, "alpha");
  gl.uniform1f(alphaLocation, 1.0);


  perspective();
  // orthographic();

  //drawObject();
}

function orthographic() {
  var increase = 7000;
  right = near * Math.tan(fovy / 2) * aspect * increase;
  left = -right;

  test = near * Math.tan(fovy / 2) * increase;
  bottom = -test;

  var pOrthographic = mat4(
    2 / (right - left),
    0,
    0,
    -(right + left) / (right - left),
    0,
    2 / (test - bottom),
    0,
    -(test + bottom) / (test - bottom),
    0,
    0,
    -2 / (far - near),
    -(far + near) / (far - near),
    0,
    0,
    0,
    1
  );

  gl.uniformMatrix4fv(projectionMatrix, false, flatten(pOrthographic));

  drawObject();
}

function perspective() {
  test = near * Math.tan(fovy);
  right = test * aspect;
  left = -right;
  bottom = -test;

  var pPerspective = mat4(
    (2 * near) / (right - left),
    0,
    (right + left) / (right - left),
    0,
    0,
    (2 * near) / (test - bottom),
    (test + bottom) / (test - bottom),
    0,
    0,
    0,
    -(far + near) / (far - near),
    (-2 * far * near) / (far - near),
    0,
    0,
    -1,
    0
  );
  gl.uniformMatrix4fv(projectionMatrix, false, flatten(pPerspective));

  drawObject();
}

function light1() {
  
  }

function light2() {}

function specular() {}

function drawObject() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.drawElements(gl.TRIANGLES, 3 * numTriangles, gl.UNSIGNED_SHORT, 0);
}
