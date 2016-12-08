/**
 * Created by moku on 8/31/16.
 */
var gl,
    shaderProgram,
    vertices,
    mouseX = 0,
    mouseY = 0,
    matrix = mat4.create(),
    vertexCount,
    indexCount;

canvas.addEventListener("mousemove", function(event) {
    mouseX = map(event.clientX, 0, canvas.width, -1, 1);
    mouseY = map(event.clientY, 0, canvas.height, 1, -1);
});

function map(value, minSrc, maxSrc, minDst, maxDst) {
    return (value - minSrc) / (maxSrc - minSrc) * (maxDst - minDst) + minDst;
}

initGL();
createShaders();
createVertices();
createIndices();
draw();

function initGL(){
    var canvas = document.getElementById("canvas");
    gl = canvas.getContext("webgl");
    gl.enable(gl.DEPTH_TEST);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1);
}

function createShaders(){

    var vertexShader = getShader(gl, "shader-vs");
    var fragmentShader = getShader(gl, "shader-fs");


    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);
}

function createVertices() {
    vertices = [
        -1, -1, -1,//0
        1, -1, -1, //1
        -1, 1, -1, //2
        1, 1, -1,  //3
        -1, 1, 1,  //4
        1, 1, 1,   //5
        -1, -1, 1, //6
        1, -1, 1,  //7
    ];
    vertexCount = vertices.length / 3;

    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    var coords = gl.getAttribLocation(shaderProgram, "coords");
    gl.vertexAttribPointer(coords, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coords);

    var normals = [
        0, 0, 1,    0, 0, 1,    0, 0, 1,    0, 0, 1,
        0, 1, 0,    0, 1, 0,    0, 1, 0,    0, 1, 0,
        0, 0, -1,   0, 0, -1,   0, 0, -1,   0, 0, -1,
        0, -1, 0,   0, -1, 0,   0, -1, 0,   0, -1, 0,
        -1, 0, 0,   -1, 0, 0,   -1, 0, 0,   -1, 0, 0,
        1, 0, 0,    1, 0, 0,    1, 0, 0,    1, 0, 0
    ];

    var normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    var normalLocation = gl.getAttribLocation(shaderProgram, "normal");
    gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var lightColor = gl.getUniformLocation(shaderProgram, "lightColor");
    gl.uniform3f(lightColor, 1, 1, 1);

    var lightDirection = gl.getUniformLocation(shaderProgram, "lightDirection");
    gl.uniform3f(lightDirection, 0.5, 1, .25);

    var perspectiveMatrix = mat4.create();
    mat4.perspective(perspectiveMatrix, 1, canvas.width / canvas.height, 0.1, 10);

    var perspectiveLoc = gl.getUniformLocation(shaderProgram, "perspectiveMatrix");
    gl.uniformMatrix4fv(perspectiveLoc, false, perspectiveMatrix);

    mat4.translate(matrix, matrix, [0, 0, -4]);
}

function createIndices() {
    var indices = [
        0, 1, 2,    1, 2, 3,
        2, 3, 4,    3, 4, 5,
        4, 5, 6,    5, 6, 7,
        6, 7, 0,    7, 0, 1,
        0, 2, 6,    2, 6, 4,
        1, 3, 7,    3, 7, 5
    ];
    indexCount = indices.length;

    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);

}

function draw() {
    mat4.rotateX(matrix, matrix, 0.007);
    mat4.rotateY(matrix, matrix, 0.013);
    mat4.rotateZ(matrix, matrix, 0.01);

    var transformMatrix = gl.getUniformLocation(shaderProgram, "transformMatrix");
    gl.uniformMatrix4fv(transformMatrix, false, matrix);

    gl.clear(gl.COLOR_BUFFER_BIT);
    //gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexCount);
    gl.drawElements(gl.LINE_LOOP, indexCount, gl.UNSIGNED_BYTE, 0);
    requestAnimationFrame(draw);
}


function getShader(gl, id){
    var shaderScript, theSource, currentChild, shader;

    shaderScript = document.getElementById(id);

    if(!shaderScript){
        return null;
    }

    theSource = "";
    currentChild = shaderScript.firstChild;

    while (currentChild) {
        if (currentChild.nodeType == currentChild.TEXT_NODE) {
            theSource += currentChild.textContent;
        }

        currentChild = currentChild.nextSibling;
    }

    if (shaderScript.type == "x-shader/x-fragment"){
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex"){
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        //Unknown shader type
        return null;
    }
    gl.shaderSource(shader, theSource);

    //compile the shader program
    gl.compileShader(shader);

    //See if it compiled successfully
    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
        alert("An error occurred compiling the shader: "+gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}