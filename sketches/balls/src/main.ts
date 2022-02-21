import './style.css'
import init2, { greet, todo } from '../crate/pkg/tvs_sketch_balls'

const app = document.querySelector<HTMLDivElement>('#app')!

app.innerHTML = `
  <h1>Hello Vite!</h1>
  <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
`

init2().then(() => {
	greet()
	todo()
})
