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
          fragmentShader = glUtils.getShader(gl, gl.FRAGMENT_SHADER, glUtils.SL.Shaders.v1.fragment),
          fragmentCubeShader = glUtils.getShader(gl, gl.FRAGMENT_SHADER, glUtils.SL.Shaders.v2.fragment);

    programChar = glUtils.createProgram(gl, vertexShader, fragmentShader);
    programCube = glUtils.createProgram(gl, vertecShader, fragmentCubeShader);

    // Connection for uniform value for translation purpose
    let thetaUniformLocation = gl.getUniformLocation(programChar, 'theta');
    let theta = 0;
    let thetaSpeed = 0;
    var xAxis = 0;
    var yAxis = 1;
    // const yscaleUniformLocation = gl.getUniformLocation(program, 'yscale');    
    // let yscaler = 0.0;
    let camera = {x: 0.5, y: 1.0, z: 0.5};

    // modelMatrix normal vector uniform
    let nmLoc;
    let mmLoc;
    let mm;

      mm = glMatrix.mat4.create();
      glMatrix.mat4.translate(mm, mm, [0.0, 0.0, -2.0]);

    function setScene(program){
      // Model matrix definition
      mmLoc = gl.getUniformLocation(program, "modelMatrix");

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

      glMatrix.mat4.rotateZ(mm, mm, thetaSpeed);
      glMatrix.mat4.rotateY(mm, mm, thetaSpeed * 2);
      glMatrix.mat4.rotateX(mm, mm, thetaSpeed);
      gl.uniformMatrix4fv(mmLoc, false, mm);

      // Lighting uniform
      const dcLoc = gl.getUniformLocation(program, 'diffuseColor');
      const dc = glMatrix.vec3.fromValues(0.75, 0.75, 0.75);
      gl.uniform3fv(dcLoc, dc);

      const ddLoc = gl.getUniformLocation(program, 'diffusePosition');
      // console.log(position);
      const dd = glMatrix.vec3.fromValues(position[0], position[1], position[2]);
      gl.uniform3fv(ddLoc, dd);

      nmLoc = gl.getUniformLocation(program, 'normalMatrix');
      let nm = glMatrix.mat3.create();
      glMatrix.mat3.normalFromMat4(nm, mm);
      gl.uniformMatrix3fv(nmLoc, false, nm);

      const acLoc = gl.getUniformLocation(program, 'ambientColor');
      const ac = glMatrix.vec3.fromValues(0.17, 0.14, 0.52);
      gl.uniform3fv(acLoc, ac);

      gl.enable(gl.DEPTH_TEST);

      // Camera view position
      glMatrix.mat4.lookAt(vm,
        [camera.x, camera.y,  camera.z], // Camera position
        [0.0, 0.0, -2.0], // Camera view direction
        [0.0, 1.0,  0.0], // Upward camera direction
      );
      gl.uniformMatrix4fv(vmLoc, false, vm);

      // Rotation using glMatrix

    }

    function setBuffer(program, vertices, dim=3, type='cube'){
      // Buffer object for communication between CPU Memory and GPU Memory
      const vertexBufferObject = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
      
      // Connection between attributes
      const vPostion = gl.getAttribLocation(program, 'vPosition');
      const vColor = gl.getAttribLocation(program, 'vColor');
      const vNormal = gl.getAttribLocation(program, 'vNormal');
      const vTexCoord = gl.getAttribLocation(program, 'vTexCoord');

      const bpe = (type == 'cube') ? 11 : 5;

      gl.vertexAttribPointer(
        vPostion, //
        dim,        // Number of elements in attribute
        gl.FLOAT, //
        gl.FALSE, 
        bpe * Float32Array.BYTES_PER_ELEMENT,
        0
        );

        if(type != 'cube'){
          gl.vertexAttribPointer(vColor, 3, gl.FLOAT, gl.FALSE,
            bpe * Float32Array.BYTES_PER_ELEMENT, dim * Float32Array.BYTES_PER_ELEMENT);
          // gl.disableVertexAttribArray(vTextCoord);
          gl.enableVertexAttribArray(vColor);
        } else {
          gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, gl.FALSE,
            11 * Float32Array.BYTES_PER_ELEMENT, 6 * Float32Array.BYTES_PER_ELEMENT);
          gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, gl.FALSE,
            11 * Float32Array.BYTES_PER_ELEMENT, 9 * Float32Array.BYTES_PER_ELEMENT);
          // gl.disableVertexAttribArray(vColor);
          gl.enableVertexAttribArray(vNormal);
          gl.enableVertexAttribArray(vTexCoord);        
        }
        
        gl.enableVertexAttribArray(vPostion);

      
      document.addEventListener('keydown', onKeyDown);
    }

    function initTexture() {
      // Uniform untuk tekstur
      program = programCube;
      gl.useProgram(program);
      var sampler0Loc = gl.getUniformLocation(program, 'sampler0');
      gl.uniform1i(sampler0Loc, 0);

      // Create a texture.
      var texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      
      // Fill the texture with a 1x1 blue pixel.
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                    new Uint8Array([0, 0, 255, 255]));
      
      // Asynchronously load an image
      var image = new Image();
      image.src = "images/diamond-ore.png";
      image.addEventListener('load', function() {
        // Now that the image has loaded make copy it to the texture.
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
      });
    }

    function cube(){
      let program = programCube;
      gl.useProgram(program);
      thetaUniformLocation = gl.getUniformLocation(program, 'theta');

      cube.initTexture = initTexture;

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

      const cubeNormals = [
        [],
        [  0.0,  0.0,  1.0 ], // depan
        [  1.0,  0.0,  0.0 ], // kanan
        [  0.0, -1.0,  0.0 ], // bawah
        [  0.0,  0.0, -1.0 ], // belakang
        [ -1.0,  0.0,  0.0 ], // kiri
        [  0.0,  1.0,  0.0 ], // atas
        []
      ];

      function quad(a, b, c, d) {
        var indices = [a, b, c, a, c, d];
        for (var i=0; i < indices.length; i++) {
          for (var j=0; j < 3; j++) {
            vertices.push(cubePoints[indices[i]][j]);
          }
          for (var j=0; j < 3; j++) {
            vertices.push(cubeColors[a][j]);
          }
          for (var j=0; j < 3; j++) {
            vertices.push(-1 * cubeNormals[a][j]);
          }
          switch (indices[i]) {
            case a:
              vertices.push(0.0);
              vertices.push(0.0);
              break;
            case b:
              vertices.push(0.0);
              vertices.push(1.0);
              break;
            case c:
              vertices.push(1.0);
              vertices.push(1.0);
              break;
            case d:
              vertices.push(1.0);
              vertices.push(0.0);
              break;
          
            default:
              break;
          }
        }
      }
  
      // quad(1, 0, 3, 2);
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

        setBuffer(program, vertices, 2, 'char');
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

    initTexture();

    // Kontrol menggunakan mouse
    let dragging, lastx, lasty;
    function onMouseDown(event) {
      var x = event.clientX;
      var y = event.clientY;
      var rect = event.target.getBoundingClientRect();
      // Saat mouse diklik di area aktif browser,
      //  maka flag dragging akan diaktifkan
      if (
        rect.left <= x &&
        rect.right > x &&
        rect.top <= y &&
        rect.bottom > y
      ) {
        dragging = true;
        lastx = x;
        lasty = y;
      }
    }
    function onMouseUp(event) {
      // Ketika klik kiri mouse dilepas
      dragging = false;
    }
    function onMouseMove(event) {
      var x = event.clientX;
      var y = event.clientY;
      if (dragging) {
        factor = 10 / canvas.height;
        var dx = factor * (x - lastx);
        var dy = factor * (y - lasty);
        // Menggunakan dx dan dy untuk memutar kubus
        glMatrix.mat4.rotateY(mm, mm, dx);
        glMatrix.mat4.rotateX(mm, mm, dy);
        // console.log(mm)
      }
      lastx = x;
      lasty = y;
    }
    
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mousemove', onMouseMove);

    function render() {
      theta += 0.052;

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // Passing theta uniform for rotation within vertex shader
      // gl.uniform1f(thetaUniformLocation, theta);

      // Drawing

      cube();
      gl.drawArrays(gl.TRIANGLES, 0, 30);

      triangle();
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 21);
      
      requestAnimationFrame(render);
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    render();
  }

})(window || this);
