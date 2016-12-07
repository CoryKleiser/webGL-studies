/**
 * Created by moku on 8/31/16.
 */
var gl,
    shaderProgram,
    vertices,
    mouseX = 0,
    mouseY = 0,
    matrix = mat4.create(),
    vertexCount;

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
loadTexture();
draw();

function initGL(){
    var canvas = document.getElementById("canvas");
    gl = canvas.getContext("webgl");
    gl.enable(gl.DEPTH_TEST);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1, 1, 1, 1);
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
        -1, -1,     0, 0,
        1, -1,      1, 0,
        -1, 1,      0, 1,
        1, 1,       1, 1
    ];
    vertexCount = vertices.length / 4;

    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    var coords = gl.getAttribLocation(shaderProgram, "coords");
    gl.vertexAttribPointer(coords, 2, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, 0);
    gl.enableVertexAttribArray(coords);

    var textureCoords = gl.getAttribLocation(shaderProgram, "textureCoords");
    gl.vertexAttribPointer(textureCoords, 2, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, Float32Array.BYTES_PER_ELEMENT * 2);
    gl.enableVertexAttribArray(textureCoords);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var pointSize = gl.getAttribLocation(shaderProgram, "pointSize");
    gl.vertexAttrib1f(pointSize, 20);

    var perspectiveMatrix = mat4.create();
    mat4.perspective(perspectiveMatrix, 1, canvas.width / canvas.height, 0.1, 10);

    var perspectiveLoc = gl.getUniformLocation(shaderProgram, "perspectiveMatrix");
    gl.uniformMatrix4fv(perspectiveLoc, false, perspectiveMatrix);

    mat4.translate(matrix, matrix, [0, 0, -4]);
}

function loadTexture() {
    var image = document.createElement("img");
    image.crossOrigin = "";
    image.addEventListener("load", function () {
        var texture = gl.createTexture(),
            sampler = gl.getUniformLocation(shaderProgram, "sampler");

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
        gl.uniform1i(sampler, 0);
    });
    image.src="https://placekitten.com/256/256";
}

function draw() {
    mat4.rotateX(matrix, matrix, 0.007);
    mat4.rotateY(matrix, matrix, 0.013);
    mat4.rotateZ(matrix, matrix, 0.01);

    var transformMatrix = gl.getUniformLocation(shaderProgram, "transformMatrix");
    gl.uniformMatrix4fv(transformMatrix, false, matrix);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexCount);
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