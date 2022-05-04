import './style.css'
import init2, {
	greet,
	create_ball1,
	create_camera,
} from '../crate/pkg/tvs_sketch_balls'
import { render, wasmGeometryToFormData } from './render'

init2().then(() => {
	greet()
	const ball = wasmGeometryToFormData(create_ball1())
	console.log(ball)
	const camera = create_camera()
	console.log(camera)

	render(ball, camera)
})
