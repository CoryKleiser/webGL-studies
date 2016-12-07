/**
 * Created by moku on 8/31/16.
 */
var gl,
    shaderProgram,
    vertices,
    mouseX = 0,
    mouseY = 0,
    matrix = mat4.create(),
    vertexCount = 36;

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
        0.88, -0.25, -0.18,         1, 0, 0, 1,
        0.9, 0.25, 0,               1, 0, 0, 1,
        0.88, -0.25, 0.18,          1, 0, 0, 1,

        0.85, -0.25, 0.29,          1, 1, 0, 1,
        0.78, 0.25, 0.45,           1, 1, 0, 1,
        0.67, -0.25, 0.6,           1, 1, 0, 1,

        0.6, -0.25, 0.67,           0, 1, 0, 1,
        0.45, 0.25, 0.78,           0, 1, 0, 1,
        0.29, -0.25, 0.85,          0, 1, 0, 1,

        0.18, -0.25, 0.88,          0, 1, 1, 1,
        0, 0.25, 0.9,               0, 1, 1, 1,
        -0.18, -0.25, 0.88,         0, 1, 1, 1,

        -0.29, -0.25, 0.85,         0, 0, 1, 1,
        -0.45, 0.25, 0.78,          0, 0, 1, 1,
        -0.6, -0.25, 0.67,          0, 0, 1, 1,

        -0.67, -0.25, 0.6,          1, 0, 1, 1,
        -0.78, 0.25, 0.45,          1, 0, 1, 1,
        -0.85, -0.25, 0.29,         1, 0, 1, 1,

        -0.88, -0.25, 0.18,         1, 0.5, 0, 1,
        -0.9, 0.25, 0,              1, 0.5, 0, 1,
        -0.88, -0.25, -0.18,        1, 0.5, 0, 1,

        -0.86, -0.25, -0.18,        0, 0.5, 1, 1,
        -0.78, 0.25, -0.45,         0, 0.5, 1, 1,
        -0.67, -0.25, -0.6,         0, 0.5, 1, 1,

        -0.6, -0.25, -0.67,         0, 1, 0.5, 1,
        -0.45, 0.25, -0.78,         0, 1, 0.5, 1,
        -0.29, -0.25, -0.85,        0, 1, 0.5, 1,

        -0.18, -0.25, -0.88,        1, 0, 0.5, 1,
        0, 0.25, -0.9,              1, 0, 0.5, 1,
        0.18, -0.25, -0.88,         1, 0, 0.5, 1,

        0.29, -0.25, -0.85,         0.5, 1, 0, 1,
        0.45, 0.25, -0.78,          0.5, 1, 0, 1,
        0.6, -0.25, -0.67,          0.5, 1, 0, 1,

        0.67, -0.25, -0.6,          0.5, 0, 1, 1,
        0.78, 0.25, -0.45,          0.5, 0, 1, 1,
        0.85, -0.25, -0.29,         0.5, 0, 1, 1
    ];

    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    var coords = gl.getAttribLocation(shaderProgram, "coords");
    gl.vertexAttribPointer(coords, 3, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT*7, 0);
    gl.enableVertexAttribArray(coords);

    var colorsLocation = gl.getAttribLocation(shaderProgram, "colors");
    gl.vertexAttribPointer(colorsLocation, 4, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT*7, Float32Array.BYTES_PER_ELEMENT*3);
    gl.enableVertexAttribArray(colorsLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var pointSize = gl.getAttribLocation(shaderProgram, "pointSize");
    gl.vertexAttrib1f(pointSize, 1);

    var perspectiveMatrix = mat4.create();
    mat4.perspective(perspectiveMatrix, 1, canvas.width / canvas.height, 0.1, 10);

    var perspectiveLoc = gl.getUniformLocation(shaderProgram, "perspectiveMatrix");
    gl.uniformMatrix4fv(perspectiveLoc, false, perspectiveMatrix);

    mat4.translate(matrix, matrix, [0, 0, -2]);
}

function draw() {
    mat4.rotateX(matrix, matrix, 0.007);
    mat4.rotateY(matrix, matrix, 0.013);
    mat4.rotateZ(matrix, matrix, 0.01);

    var transformMatrix = gl.getUniformLocation(shaderProgram, "transformMatrix");
    gl.uniformMatrix4fv(transformMatrix, false, matrix);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
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