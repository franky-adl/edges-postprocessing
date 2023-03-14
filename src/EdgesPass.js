import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass'
import * as THREE from 'three'
import { EdgesMaterial } from './EdgesMaterial'

export class EdgesPass extends Pass {
	constructor({ width, height, uParams }) {
		super()

		this.material = new EdgesMaterial()
		this.fsQuad = new FullScreenQuad(this.material)
		this.uParams = uParams
		this.material.uniforms.uResolution.value = new THREE.Vector2(width, height)
	}

	dispose() {
		this.material.dispose()
		this.fsQuad.dispose()
	}

	render(
		renderer,
		writeBuffer,
		readBuffer
	) {
		this.material.uniforms.tDiffuse.value = readBuffer.texture
		this.material.uniforms.texelUnit.value = this.uParams.texelUnit
		this.material.uniforms.multiplier.value = this.uParams.multiplier

		if (this.renderToScreen) {
			renderer.setRenderTarget(null)
			this.fsQuad.render(renderer)
		} else {
			renderer.setRenderTarget(writeBuffer)
			if (this.clear) renderer.clear()
			this.fsQuad.render(renderer)
		}
	}
}
