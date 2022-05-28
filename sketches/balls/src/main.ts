import './style.css'
import init2, {
	get_geom,
	get_light,
	get_mvp,
	get_normal_mat,
	setup,
	update,
} from '../crate/pkg/tvs_sketch_balls'
import { render, renderInit, wasmGeometryToFormData } from './render'

init2().then(() => {
	setup()
	const ball = wasmGeometryToFormData(get_geom())
	renderInit(ball)

	let lastTime = 0

	const tick = (newTime: number) => {
		if (!(lastTime && newTime)) {
			update(0)
		} else {
			update(newTime - lastTime)
		}

		render(get_mvp(), get_normal_mat(), get_light())

		lastTime = newTime
		requestAnimationFrame(tick)
	}

	tick(0)
})
