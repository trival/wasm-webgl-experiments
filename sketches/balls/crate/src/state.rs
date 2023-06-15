use glam::Vec3;
use std::cell::OnceCell;
use tvs_libs::{rendering::scene::Scene, utils::app_state::AppState};

#[derive(Default)]
pub struct State {
    pub scene: Scene,
    pub light_dir: Vec3,
}

impl AppState for State {
    unsafe fn state_cell() -> &'static mut OnceCell<Self> {
        static mut STATE: OnceCell<State> = OnceCell::new();
        &mut STATE
    }
}
