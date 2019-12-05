precision mediump float;

attribute vec3 vPosition;
attribute vec3 vColor;
attribute mat4 vTransform;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform float theta;
uniform float yscale;
uniform vec3 shift;
varying vec3 fColor;

void main() {
	fColor = vColor;
	mat4 translate = mat4(
		1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		shift.x, shift.y, shift.z, 1.0
	);
	mat4 rotateX = mat4(
		1.0, 0.0, 0.0, 0.0,
		0.0, cos(theta), sin(theta), 0.0,
		0.0, -sin(theta), cos(theta), 0.0,
		0.0, 0.0, 0.0, 1.0
	);

	mat4 rotateY = mat4(
		cos(theta), 0.0, sin(theta), 0.0,
		0.0, 1.0, 0.0, 0.0,
		-sin(theta), 0.0, cos(theta), 0.0,
		0.0, 0.0, 0.0, 1.0
	);

	mat4 rotateZ = mat4(
		cos(theta), sin(theta), 0.0, 0.0,
		-sin(theta), cos(theta), 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		0.0, 0.0, 0.0, 1.0
	);

	mat4 rotate = rotateX * rotateY * rotateZ;
	// mat4 scale = mat4(mat3(0.5));
	mat4 scale = mat4(
		yscale, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		0.0, 0.0, 0.0, 1.0
	);

	gl_Position = projectionMatrix * viewMatrix * modelMatrix * translate * rotateY * vec4(vPosition, 1.0);
}
