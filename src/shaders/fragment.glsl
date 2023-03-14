uniform sampler2D tDiffuse; // this receives the rendered scene as a texture(i.e. including the lighting and shadows)
uniform vec2 uResolution;
uniform float texelUnit;
uniform float multiplier;

varying vec2 vUv;

#define TWO_PI 6.28318530718
#define PI 3.14159265359

// expected input: vec3(hue, saturation, brightness), all 0 to 1
// Function from Iñigo Quiles
// https://www.shadertoy.com/view/MsS3Wc
vec3 hsb2rgb( in vec3 c ){
    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                             6.0)-3.0)-1.0,
                     0.0,
                     1.0 );
    rgb = rgb*rgb*(3.0-2.0*rgb);
    return c.z * mix( vec3(1.0), rgb, c.y);
}

float getGrayscale(vec3 color) {
    // The luma vector is used to calculate the brightness of a color, the implementation comes from glsl-luma.
    vec3 luma = vec3(0.299, 0.587, 0.114);
    return dot(color, luma);
}

/**
 * The colorAtTexelGrid function takes any texture (diffuse or normal) and 
 * returns the value at a specified cell of a texel grid centered by a point. 
 */
vec3 colorAtTexelGrid(sampler2D image, vec2 center, vec2 texelSize, vec2 cellCoord) {
    return texture2D(image, center + texelSize * cellCoord).xyz;
}

/**
 * We use the getValue function to pass in the offset from the current pixel (vUv),
 * thus identifying which pixel in the kernel we are looking at to get that value.
 */
float getValue(int x, int y) {
    vec2 texelSize = vec2(texelUnit / uResolution.x, texelUnit / uResolution.y);
    vec2 cellCoord = vec2(x, y);
    vec3 color = colorAtTexelGrid(tDiffuse, vUv, texelSize, cellCoord) * multiplier;
    return getGrayscale(color);
}

/**
 * This is largely copied from the sobel operator shader in three.js source code
 */
vec2 SobelValues() {
    // kernel definition (in glsl matrices are filled in column-major order)
    const mat3 Gx = mat3(-1, -2, -1, 0, 0, 0, 1, 2, 1);// x direction kernel
    const mat3 Gy = mat3(-1, 0, 1, -2, 0, 2, -1, 0, 1);// y direction kernel

    // fetch the 3x3 neighbourhood of a fragment

    // first column
    float tx0y0 = getValue(-1, -1);
    float tx0y1 = getValue(-1, 0);
    float tx0y2 = getValue(-1, 1);

    // second column
    float tx1y0 = getValue(0, -1);
    float tx1y1 = getValue(0, 0);
    float tx1y2 = getValue(0, 1);

    // third column
    float tx2y0 = getValue(1, -1);
    float tx2y1 = getValue(1, 0);
    float tx2y2 = getValue(1, 1);

    // gradient value in x direction
    float valueGx = Gx[0][0] * tx0y0 + Gx[1][0] * tx1y0 + Gx[2][0] * tx2y0 +
    Gx[0][1] * tx0y1 + Gx[1][1] * tx1y1 + Gx[2][1] * tx2y1 +
    Gx[0][2] * tx0y2 + Gx[1][2] * tx1y2 + Gx[2][2] * tx2y2;

    // gradient value in y direction
    float valueGy = Gy[0][0] * tx0y0 + Gy[1][0] * tx1y0 + Gy[2][0] * tx2y0 +
    Gy[0][1] * tx0y1 + Gy[1][1] * tx1y1 + Gy[2][1] * tx2y1 +
    Gy[0][2] * tx0y2 + Gy[1][2] * tx1y2 + Gy[2][2] * tx2y2;

    return vec2(valueGx, valueGy);
}

void main() {
    vec2 sobelVec = SobelValues();
    float sobelValue = sqrt( (sobelVec.x * sobelVec.x) + (sobelVec.y * sobelVec.y) );
    // sobelValue = smoothstep(0.01, 0.5, sobelValue);
    float sobelAngle = atan(sobelVec.y/sobelVec.x); // atan range is from -PI/2 to PI/2
    // transform angle from radians to 0-1
    float hue = (sobelAngle+PI/2.0)/PI;
    vec4 lineColor = vec4(hsb2rgb(vec3(hue, 1.0, 1.0)), 1.0);
    vec4 black = vec4(0.,0.,0.,1.0);

    // using the sobelValue directly as grayscale color
    gl_FragColor = vec4(sobelValue, sobelValue, sobelValue, 1.0);

    // colorize by direction of edges
    gl_FragColor = mix(black, lineColor, sobelValue);

    // reverting the colors of the above gives a surprise mix!
    // gl_FragColor = mix(lineColor, black, sobelValue);
}
