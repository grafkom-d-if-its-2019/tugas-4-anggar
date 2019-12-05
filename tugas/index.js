(function(global) {

  var canvas, gl, program;

  glUtils.SL.init({ callback:function() { main(); } });

  function main() {
    // Register Callbacks
    // window.addEventListener('resize', resizer);

    // Get canvas element and check if WebGL enabled
    canvas = document.getElementById("glcanvas");
    gl = glUtils.checkWebGL(canvas);

    // Initialize the shaders and program
    const vertexShader = glUtils.getShader(gl, gl.VERTEX_SHADER, glUtils.SL.Shaders.v1.vertex),
          vertecShader = glUtils.getShader(gl, gl.VERTEX_SHADER, glUtils.SL.Shaders.v2.vertex),
          fragmentShader = glUtils.getShader(gl, gl.FRAGMENT_SHADER, glUtils.SL.Shaders.v1.fragment);

    programChar = glUtils.createProgram(gl, vertexShader, fragmentShader);
    programCube = glUtils.createProgram(gl, vertecShader, fragmentShader);

    // Connection for uniform value for translation purpose
    let thetaUniformLocation = gl.getUniformLocation(programChar, 'theta');
    let theta = Math.PI;
    let thetaSpeed = Math.PI/72;
    // const yscaleUniformLocation = gl.getUniformLocation(program, 'yscale');    
    // let yscaler = 0.0;
    let camera = {x: 0.5, y: 1.0, z: 0.5};

    function setScene(program){
      // Model matrix definition
      const mmLoc = gl.getUniformLocation(program, "modelMatrix");
      const mm = glMatrix.mat4.create();
      glMatrix.mat4.translate(mm, mm, [0.0, 0.0, -2.0]);

      // View matrix and projection configuration
      const vmLoc = gl.getUniformLocation(program, 'viewMatrix');
      const vm = glMatrix.mat4.create();
      const pmLoc = gl.getUniformLocation(program, 'projectionMatrix');
      const pm = glMatrix.mat4.create();
      gl.uniformMatrix4fv(vmLoc, false, vm);
      glMatrix.mat4.perspective(pm,
        glMatrix.glMatrix.toRadian(90),   // fovy in radian
        canvas.width/canvas.height,       // aspect ratio
        1.0,      // near
        10.0,     // far
      );
      gl.uniformMatrix4fv(pmLoc, false, pm);

      // Camera view position
      glMatrix.mat4.lookAt(vm,
        [camera.x, camera.y,  camera.z], // Camera position
        [0.0, 0.0, -2.0], // Camera view direction
        [0.0, 1.0,  0.0], // Upward camera direction
      );
      gl.uniformMatrix4fv(vmLoc, false, vm);

      // Rotation using glMatrix
      glMatrix.mat4.rotateZ(mm, mm, thetaSpeed);
      glMatrix.mat4.rotateY(mm, mm, thetaSpeed * 2);
      glMatrix.mat4.rotateX(mm, mm, thetaSpeed);
      gl.uniformMatrix4fv(mmLoc, false, mm);
    }

    function setBuffer(program, vertices, dim=3){
      // Buffer object for communication between CPU Memory and GPU Memory
      const vertexBufferObject = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
      
      // Connection between attributes
      const vPostion = gl.getAttribLocation(program, 'vPosition');
      const vColor = gl.getAttribLocation(program, 'vColor');
      gl.vertexAttribPointer(
        vPostion, //
        dim,        // Number of elements in attribute
        gl.FLOAT, //
        gl.FALSE, 
        (3+dim) * Float32Array.BYTES_PER_ELEMENT,
        0
        );
      gl.vertexAttribPointer(vColor, 3, gl.FLOAT, gl.FALSE,
        (3+dim) * Float32Array.BYTES_PER_ELEMENT, dim * Float32Array.BYTES_PER_ELEMENT);
        
        gl.enableVertexAttribArray(vPostion);
        gl.enableVertexAttribArray(vColor);

      document.addEventListener('keydown', onKeyDown);
    }

    function cube(){
      let program = programCube;
      gl.useProgram(program);
      thetaUniformLocation = gl.getUniformLocation(program, 'theta');

      const vertices = [

      ];

      const cubePoints = [
        [-0.8, -0.8,  0.8],
        [-0.8,  0.8,  0.8],
        [ 0.8,  0.8,  0.8],
        [ 0.8, -0.8,  0.8],
        [-0.8, -0.8, -0.8],
        [-0.8,  0.8, -0.8],
        [ 0.8,  0.8, -0.8],
        [ 0.8, -0.8, -0.8],
      ];

      const cubeColors = [
        [1.0, 0.0, 0.0],
        [1.0, 0.0, 0.0],
        [0.0, 1.0, 0.0],
        [0.0, 0.0, 1.0],
        [1.0, 1.0, 1.0],
        [1.0, 0.5, 0.0],
        [1.0, 1.0, 0.0],
      ];

      function quad(a, b, c, d) {
        var indices = [a, b, c, b, c, d];
        for (const i of indices) {
          vertices.push(...cubePoints[i]);
          vertices.push(...cubeColors[a]);
        }
      }
      quad(1, 0, 3, 2);
      quad(2, 3, 7, 6);
      quad(3, 0, 4, 7);
      quad(4, 5, 6, 7);
      quad(5, 4, 0, 1);
      quad(6, 5, 1, 2);

      vertices.push(...cubePoints[6]);
      vertices.push(...cubeColors[1]);
      vertices.push(...cubePoints[2]);
      vertices.push(...cubeColors[1]);

      setBuffer(program, vertices);
      setScene(program);
    }

    let position = [0.0, 0.0, 0.0];
    let speed = [0.0052, 0.0052 / 3, 0.0052 / 2];
    function triangle(){
      let program = programChar;

      gl.useProgram(program);
      let transLocation = gl.getUniformLocation(program, 'shift');
      thetaUniformLocation = gl.getUniformLocation(program, 'theta');

      const vertices = new Float32Array([
        -0.85, -0.85,     0.60, 0.80, 0.56,
        -0.6, +0.8,       0.60, 0.80, 0.56,
        -0.7, -0.85,      0.60, 0.80, 0.56,
        -0.6, +0.8,       0.60, 0.80, 0.56,
        -0.7, -0.85,      0.60, 0.80, 0.56,
        -0.5, +0.5,       0.60, 0.80, 0.56,
        -0.4, +0.8,       0.60, 0.80, 0.56,
        -0.6, +0.8,       0.60, 0.80, 0.56,
        -0.5, +0.5,       0.60, 0.80, 0.56,
        -0.5, +0.5,       0.60, 0.80, 0.56,
        -0.15, -0.85,     0.60, 0.80, 0.56,
        -0.4, +0.8,       0.60, 0.80, 0.56,
        -0.5, +0.5,       0.60, 0.80, 0.56,
        -0.15, -0.85,     0.60, 0.80, 0.56,
        -0.3, -0.85,      0.60, 0.80, 0.56,
        -0.42, 0.0,       0.60, 0.80, 0.56,
        -0.58, 0.0,       0.60, 0.80, 0.56,
        -0.3, -0.4,       0.60, 0.80, 0.56,
        -0.3, -0.3,       0.60, 0.80, 0.56,
        -0.7, -0.3,       0.60, 0.80, 0.56,
        -0.58, 0.0,       0.60, 0.80, 0.56,
        ]);

        for(let i=0; i<3; i++){
          position[i] += speed[i];
          if(Math.abs(position[i]) >= 0.5) {
            speed[i] *= -1;
          }
        }

        for(let i=0; i<=vertices.length; i++){
          if(i%5 < 2){
            vertices[i] /= 5.0;            
          }
        }

        gl.uniform3fv(transLocation, position);

        setBuffer(program, vertices, 2);
        setScene(program);
    }

    // Interactive control using keyboard
    function onKeyDown(event) {
      if (event.keyCode == 173) thetaSpeed -= 0.01;       // key '-'
      else if (event.keyCode == 61) thetaSpeed += 0.01;  // key '='
      else if (event.keyCode == 48) thetaSpeed = 0;       // key '0'
      if (event.keyCode == 88) axis[x] = !axis[x];
      if (event.keyCode == 89) axis[y] = !axis[y];
      if (event.keyCode == 90) axis[z] = !axis[z];
      if (event.keyCode == 38) camera.z -= 0.1;
      else if (event.keyCode == 40) camera.z += 0.1;
      if (event.keyCode == 37) camera.x -= 0.1;
      else if (event.keyCode == 39) camera.x += 0.1;
    }

    function render() {
      theta += 0.052;

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // Passing theta uniform for rotation within vertex shader
      gl.uniform1f(thetaUniformLocation, theta);

      // Drawing
      cube();
      gl.drawArrays(gl.LINES, 0, 38);

      triangle();
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 21);

      requestAnimationFrame(render);
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    render();
  }

})(window || this);
