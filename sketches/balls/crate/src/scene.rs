use tvs_libs::rendering::scene::Scene;
use wasm_bindgen::__rt::WasmRefCell;

thread_local! {
    static STATE: WasmRefCell<Scene> = WasmRefCell::new(Scene::default());
}
