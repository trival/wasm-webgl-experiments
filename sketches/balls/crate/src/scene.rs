use tvs_libs::rendering::scene::Scene;
use wasm_bindgen::__rt::{Ref, RefMut, WasmRefCell};

unsafe impl<T> Sync for Container<T> {}

struct Container<T> {
    cell: WasmRefCell<T>,
}

lazy_static! {
    static ref STATE: Container<Scene> = Container {
        cell: WasmRefCell::new(Scene::default())
    };
}

pub fn read() -> Ref<'static, Scene> {
    STATE.cell.borrow()
}

pub fn update<F: Fn(RefMut<'static, Scene>)>(f: F) {
    f(STATE.cell.borrow_mut())
}
