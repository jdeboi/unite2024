/**
 * Based on "A Practical Analytic Model for Daylight"
 * aka The Preetham Model, the de facto standard analytic skydome model
 * https://www.researchgate.net/publication/220720443_A_Practical_Analytic_Model_for_Daylight
 *
 * First implemented by Simon Wallner
 * http://www.simonwallner.at/projects/atmospheric-scattering
 *
 * Improved by Martin Upitis
 * http://blenderartists.org/forum/showthread.php?245954-preethams-sky-impementation-HDR
 *
 * Three.js integration by zz85 http://twitter.com/blurspline
 */

import {
  BackSide,
  BoxGeometry,
  Mesh,
  ShaderMaterial,
  UniformsUtils,
  Vector3,
} from "three";

class Sky extends Mesh {
  constructor() {
    // Create the sky shader and material
    const shader = Sky.SkyShader;
    const material = new ShaderMaterial({
      name: "SkyShader",
      fragmentShader: shader.fragmentShader,
      vertexShader: shader.vertexShader,
      uniforms: UniformsUtils.clone(shader.uniforms),
      side: BackSide,
      depthWrite: false,
    });

    // Create the geometry for the sky (BoxGeometry)
    const geometry = new BoxGeometry(1, 1, 1);

    // Call the parent class constructor (Mesh)
    super(geometry, material); // Equivalent to Mesh.call(this, geometry, material)
  }
}

// Static shader definition
Sky.SkyShader = {
  uniforms: {
    turbidity: { value: 2 },
    rayleigh: { value: 1 },
    mieCoefficient: { value: 0.005 },
    mieDirectionalG: { value: 0.8 },
    sunPosition: { value: new Vector3() },
    up: { value: new Vector3(0, 1, 0) },
  },

  vertexShader: `
	  uniform vec3 sunPosition;
	  uniform float rayleigh;
	  uniform float turbidity;
	  uniform float mieCoefficient;
	  uniform vec3 up;
  
	  varying vec3 vWorldPosition;
	  varying vec3 vSunDirection;
	  varying float vSunfade;
	  varying vec3 vBetaR;
	  varying vec3 vBetaM;
	  varying float vSunE;
  
	  const float e = 2.71828182845904523536028747135266249775724709369995957;
	  const float pi = 3.141592653589793238462643383279502884197169;
  
	  const vec3 lambda = vec3( 680E-9, 550E-9, 450E-9 );
	  const vec3 totalRayleigh = vec3( 5.804542996261093E-6, 1.3562911419845635E-5, 3.0265902468824876E-5 );
  
	  const float v = 4.0;
	  const vec3 K = vec3( 0.686, 0.678, 0.666 );
	  const vec3 MieConst = vec3( 1.8399918514433978E14, 2.7798023919660528E14, 4.0790479543861094E14 );
  
	  const float cutoffAngle = 1.6110731556870734;
	  const float steepness = 1.5;
	  const float EE = 1000.0;
  
	  float sunIntensity( float zenithAngleCos ) {
		zenithAngleCos = clamp( zenithAngleCos, -1.0, 1.0 );
		return EE * max( 0.0, 1.0 - pow( e, -( ( cutoffAngle - acos( zenithAngleCos ) ) / steepness ) ) );
	  }
  
	  vec3 totalMie( float T ) {
		float c = ( 0.2 * T ) * 10E-18;
		return 0.434 * c * MieConst;
	  }
  
	  void main() {
		vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
		vWorldPosition = worldPosition.xyz;
  
		gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		gl_Position.z = gl_Position.w;
  
		vSunDirection = normalize( sunPosition );
		vSunE = sunIntensity( dot( vSunDirection, up ) );
  
		vSunfade = 1.0 - clamp( 1.0 - exp( ( sunPosition.y / 450000.0 ) ), 0.0, 1.0 );
  
		float rayleighCoefficient = rayleigh - ( 1.0 * ( 1.0 - vSunfade ) );
		vBetaR = totalRayleigh * rayleighCoefficient;
  
		vBetaM = totalMie( turbidity ) * mieCoefficient;
	  }
	`,

  fragmentShader: `
	  varying vec3 vWorldPosition;
	  varying vec3 vSunDirection;
	  varying float vSunfade;
	  varying vec3 vBetaR;
	  varying vec3 vBetaM;
	  varying float vSunE;
  
	  uniform float mieDirectionalG;
	  uniform vec3 up;
  
	  const vec3 cameraPos = vec3( 0.0, 0.0, 0.0 );
	  const float pi = 3.141592653589793238462643383279502884197169;
  
	  const float n = 1.0003;
	  const float N = 2.545E25;
  
	  const float rayleighZenithLength = 8.4E3;
	  const float mieZenithLength = 1.25E3;
	  const float sunAngularDiameterCos = 0.999956676946448443553574619906976478926848692873900859324;
  
	  const float THREE_OVER_SIXTEENPI = 0.05968310365946075;
	  const float ONE_OVER_FOURPI = 0.07957747154594767;
  
	  float rayleighPhase( float cosTheta ) {
		return THREE_OVER_SIXTEENPI * ( 1.0 + pow( cosTheta, 2.0 ) );
	  }
  
	  float hgPhase( float cosTheta, float g ) {
		float g2 = pow( g, 2.0 );
		float inverse = 1.0 / pow( 1.0 - 2.0 * g * cosTheta + g2, 1.5 );
		return ONE_OVER_FOURPI * ( ( 1.0 - g2 ) * inverse );
	  }
  
	  void main() {
		vec3 direction = normalize( vWorldPosition - cameraPos );
  
		float zenithAngle = acos( max( 0.0, dot( up, direction ) ) );
		float inverse = 1.0 / ( cos( zenithAngle ) + 0.15 * pow( 93.885 - ( ( zenithAngle * 180.0 ) / pi ), -1.253 ) );
		float sR = rayleighZenithLength * inverse;
		float sM = mieZenithLength * inverse;
  
		vec3 Fex = exp( -( vBetaR * sR + vBetaM * sM ) );
  
		float cosTheta = dot( direction, vSunDirection );
		float rPhase = rayleighPhase( cosTheta * 0.5 + 0.5 );
		vec3 betaRTheta = vBetaR * rPhase;
  
		float mPhase = hgPhase( cosTheta, mieDirectionalG );
		vec3 betaMTheta = vBetaM * mPhase;
  
		vec3 Lin = pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * ( 1.0 - Fex ), vec3( 1.5 ) );
		Lin *= mix( vec3( 1.0 ), pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * Fex, vec3( 1.0 / 2.0 ) ), clamp( pow( 1.0 - dot( up, vSunDirection ), 5.0 ), 0.0, 1.0 ) );
  
		float theta = acos( direction.y );
		float phi = atan( direction.z, direction.x );
		vec2 uv = vec2( phi, theta ) / vec2( 2.0 * pi, pi ) + vec2( 0.5, 0.0 );
		vec3 L0 = vec3( 0.1 ) * Fex;
  
		float sundisk = smoothstep( sunAngularDiameterCos, sunAngularDiameterCos + 0.00002, cosTheta );
		L0 += ( vSunE * 19000.0 * Fex ) * sundisk;
  
		vec3 texColor = ( Lin + L0 ) * 0.04 + vec3( 0.0, 0.0003, 0.00075 );
		vec3 retColor = pow( texColor, vec3( 1.0 / ( 1.2 + ( 1.2 * vSunfade ) ) ) );
  
		gl_FragColor = vec4( retColor, 1.0 );
  
		#include <tonemapping_fragment>
		#include <encodings_fragment>
	  }
	`,
};

export { Sky };
