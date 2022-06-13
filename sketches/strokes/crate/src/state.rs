use glam::Vec3;
use std::{mem::MaybeUninit, sync::Once};
use tvs_libs::rendering::scene::Scene;
use wasm_bindgen::__rt::{Ref, RefMut, WasmRefCell};

#[derive(Default)]
pub struct State {
    pub scene: Scene,
    pub light_dir: Vec3,
}

// TODO: Move code below into separate procedural derive macro

pub trait AppState: 'static {
    fn read() -> Ref<'static, Self>;
    fn update<F: Fn(RefMut<'static, Self>)>(f: F);
}

struct AppStateContainer {
    cell: WasmRefCell<State>,
}

impl AppStateContainer {
    fn init_or_get_state() -> &'static AppStateContainer {
        static mut STATE: MaybeUninit<AppStateContainer> = MaybeUninit::uninit();
        static ONCE: Once = Once::new();

        unsafe {
            ONCE.call_once(|| {
                let state = AppStateContainer {
                    cell: WasmRefCell::new(State::default()),
                };
                STATE.write(state);
            });

            STATE.assume_init_ref()
        }
    }
}

impl AppState for State {
    fn read() -> Ref<'static, Self> {
        AppStateContainer::init_or_get_state().cell.borrow()
    }

    fn update<F: Fn(RefMut<'static, Self>)>(f: F) {
        f(AppStateContainer::init_or_get_state().cell.borrow_mut())
    }
}
