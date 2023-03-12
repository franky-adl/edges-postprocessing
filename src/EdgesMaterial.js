import * as THREE from 'three'
import fragmentShader from './shaders/fragment.glsl'
import vertexShader from './shaders/vertex.glsl'

export class EdgesMaterial extends THREE.ShaderMaterial {
	constructor() {
		super({
			uniforms: {
				tDiffuse: { value: null },
				uResolution: {
					value: new THREE.Vector2(1, 1)
				}
			},
			fragmentShader: fragmentShader,
			vertexShader: vertexShader
		})
	}
}
