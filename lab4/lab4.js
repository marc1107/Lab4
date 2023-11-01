// Name: Cathrine Underbjerg Hansen and Marc Bohner

var gl;
var numVertices;
var numTriangles;
var near, far;
var aspect, fovy, left, right, bottom, test;
var projectionMatrix;
var R;
var indexLis;
var myShaderProgram;

function initGL() {
  var canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  gl.enable(gl.DEPTH_TEST);
  gl.viewport(0, 0, 512, 512);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  myShaderProgram = initShaders(gl, "vertex-shader", "fragment-shader");
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

  // R = vec3(0.8, 0.8, 0.8);
  // var Rloc = gl.getUniformLocation(myShaderProgram, "R");
  // gl.uniform3fv(Rloc, R);

  var p0 = vec3(0.0, 0.0, -2.0);
  var Ia = vec3(1.0, 1.0, 1.0);
  var Id = vec3(1.0, 1.0, 1.0);
  var Is = vec3(1.0, 1.0, 1.0);

  var ka = vec3(0.9, 0.2, 0.2);
  var kd = vec3(0.9, 0.2, 0.2);
  var ks = vec3(1.0, 1.0, 1.0);
  var alpha = 5.0;

  // send the light source position to the shader
  var p0loc = gl.getUniformLocation(myShaderProgram, "p0");
  gl.uniform3fv(p0loc, flatten(p0));

  // send the light source intensity to the shader
  var Ialoc = gl.getUniformLocation(myShaderProgram, "Ia");
  gl.uniform3fv(Ialoc, flatten(Ia));

  var Idloc = gl.getUniformLocation(myShaderProgram, "Id");
  gl.uniform3fv(Idloc, flatten(Id));

  var Isloc = gl.getUniformLocation(myShaderProgram, "Is");
  gl.uniform3fv(Isloc, flatten(Is));

  // send the material properties to the shader
  var kaloc = gl.getUniformLocation(myShaderProgram, "ka");
  gl.uniform3fv(kaloc, flatten(ka));

  var kdloc = gl.getUniformLocation(myShaderProgram, "kd");
  gl.uniform3fv(kdloc, flatten(kd));

  var ksloc = gl.getUniformLocation(myShaderProgram, "ks");
  gl.uniform3fv(ksloc, flatten(ks));

  var alphaloc = gl.getUniformLocation(myShaderProgram, "alpha");
  gl.uniform1f(alphaloc, alpha);

  var lightDirectionLocation = gl.getUniformLocation(
    myShaderProgram,
    "lightDirection"
  );
  gl.uniform3fv(lightDirectionLocation, [0.0, 0.0, -1.0]); // The light is shining downwards

  var cutoffAngleLocation = gl.getUniformLocation(
    myShaderProgram,
    "cutoffAngle"
  );
  gl.uniform1f(cutoffAngleLocation, Math.PI / 4); // The cutoff angle is 45 degrees

  var faceNormals = getFaceNormals(vertices, indexLis, numTriangles);

  // Calculate vertex normals
  var vertexNormals = getVertexNormals(
    vertices,
    indexLis,
    faceNormals,
    numVertices,
    numTriangles
  );

  // Create and bind a buffer for the vertex normals
  var normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexNormals), gl.STATIC_DRAW);

  // Get the attribute location for normal vectors and enable it
  var nvPosition = gl.getAttribLocation(myShaderProgram, "nv");
  gl.vertexAttribPointer(nvPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(nvPosition);

  perspective();
  // light1();
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
  drawObject();
}

function light2() {}

function specular() {}

function drawObject() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.drawElements(gl.TRIANGLES, 3 * numTriangles, gl.UNSIGNED_SHORT, 0);
}

function getFaceNormals(vertices, indexList, numTriangles) {
  var faceNormals = [];

  for (var i = 0; i < numTriangles; i++) {
    p0 = vertices[indexList[3 * i]];
    p1 = vertices[indexList[3 * i + 1]];
    p2 = vertices[indexList[3 * i + 2]];

    var v1 = subtract(p1, p0);
    var v2 = subtract(p2, p0);

    var n = cross(v1, v2);
    var nCopy = vec3(n[0], n[1], n[2]);
    var n = normalize(nCopy);
    faceNormals.push(n);
  }

  return faceNormals;
}

// function getVertexNormals( vertices, indexList, faceNormals, numVertices, numTriangles ) {
//   var vertexNormals = [];

//   for (var j = 0; j < numVertices; j++) {
//     var vertexNormal;
//     for( var i = 0; i < numTriangles; i++){
//       if (indexList[3 * i] == j || indexList[3 * i + 1] == j || indexList[3 * i + 2] == j) {
//         vertexNormal += faceNormals[i];
//       }
//     }
//     vertexNormal = normalize(vertexNormal);
//     vertexNormals.push(vertexNormal);
//   }

//   return vertexNormals;

// }

function getVertexNormals(
  vertices,
  indexList,
  faceNormals,
  numVertices,
  numTriangles
) {
  var vertexNormals = [];

  for (var j = 0; j < numVertices; j++) {
    var vertexNormal = vec3(0.0, 0.0, 0.0); // Initialize to zero vector
    for (var i = 0; i < numTriangles; i++) {
      if (
        indexList[3 * i] == j ||
        indexList[3 * i + 1] == j ||
        indexList[3 * i + 2] == j
      ) {
        vertexNormal = add(vertexNormal, faceNormals[i]); // Use vector addition
      }
    }
    vertexNormal = normalize(vertexNormal);
    vertexNormals.push(vertexNormal);
  }

  return vertexNormals;
}
