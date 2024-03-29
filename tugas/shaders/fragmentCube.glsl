precision mediump float;

varying vec3 fNormal;
varying vec3 fPosition;
varying vec2 fTexCoord;

uniform vec3 diffuseColor;
uniform vec3 diffusePosition; // Titik sumber cahaya
uniform vec3 ambientColor;

uniform sampler2D sampler0;

void main() {
  
  // Arah cahaya = lokasi titik verteks - lokasi titik sumber cahaya
  vec3 diffuseDirection = normalize(diffusePosition - fPosition);
  // Nilai intensitas cahaya = 
  //  nilai COS sudut antara arah datang cahaya dengan arah vektor normal =
  //  dot product dari vektor arah datang cahaya • arah vektor normal
  float normalDotLight = max(dot(fNormal, diffuseDirection), 0.0);

  // Untuk mendapatkan nilai warna (RGBA) dari tekstur
  vec4 textureColor = texture2D(sampler0, fTexCoord);

  float specularPower = 52.0;
  float specular = 0.0;

  if (normalDotLight > 0.0) {
    vec3 viewVec = vec3(0,0,1.0);
    vec3 reflectVec = reflect(-diffuseDirection, fNormal);
    float specularFactor = max(dot(reflectVec, viewVec), 0.0);
    specular = pow(specularFactor, specularPower);
  }

  vec3 diffuse = diffuseColor * textureColor.rgb * normalDotLight + specular;
  vec3 ambient = ambientColor * textureColor.rgb;

  gl_FragColor = vec4(diffuse + ambient, 1.0);
}