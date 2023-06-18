use bytemuck::{Pod, Zeroable};
use glam::{vec3, Quat, Vec3};
use rand::Rng;
use serde::Serialize;
use std::f32::consts::PI;
use tvs_libs::{
    data_structures::grid::{make_grid_with_coord_ops, CIRCLE_COLS_COORD_OPS},
    geometry::{
        mesh_geometry_3d::{MeshBufferedGeometryType, MeshGeometry, MeshVertex, Position3D},
        vertex_index::VertIdx2Usize,
    },
    rendering::buffered_geometry::{
        vert_type, BufferedGeometry, BufferedVertexData, OverrideAttributesWith, VertexFormat,
        VertexType,
    },
};

#[repr(C)]
#[derive(Pod, Zeroable, Clone, Copy, Serialize)]
struct Vertex {
    pos: Vec3,
    color: Vec3,
}
impl BufferedVertexData for Vertex {
    fn vertex_layout() -> Vec<VertexType> {
        vec![
            vert_type("position", VertexFormat::Float32x3),
            vert_type("color", VertexFormat::Float32x3),
        ]
    }
}
impl OverrideAttributesWith for Vertex {
    fn override_with(&self, attribs: &Self) -> Self {
        Vertex {
            pos: self.pos,
            color: attribs.color,
        }
    }
}
impl Position3D for Vertex {
    fn position(&self) -> Vec3 {
        self.pos
    }
}

fn vert(pos: Vec3, color: Vec3, x: usize, y: usize) -> MeshVertex<VertIdx2Usize, Vertex> {
    MeshVertex {
        data: Vertex { pos, color },
        vertex_index: VertIdx2Usize(x, y),
    }
}

pub fn create_ball1_geom() -> BufferedGeometry {
    let mut rnd = rand::thread_rng();

    let mut grid = make_grid_with_coord_ops(CIRCLE_COLS_COORD_OPS);
    let mut col1 = vec![];
    let mut y = 5.0;
    while y >= -5.0 {
        let x = f32::sqrt(25.0 - y * y);
        col1.push(vec3(x, y, 0.0));
        y -= 0.5;
    }
    grid.add_col(col1.clone());

    let stops = 20;
    let angle = (PI * 2.0) / stops as f32;
    for i in 1..stops {
        let q = Quat::from_rotation_y(angle * i as f32);
        let col = col1.iter().map(|pos| q.mul_vec3(*pos)).collect();
        grid.add_col(col)
    }

    let mut geom = MeshGeometry::new();
    for y in 0..(grid.height - 1) {
        for x in 0..grid.width {
            let v1 = grid.vertex(x as i32, y as i32).unwrap();
            let v2 = v1.bottom().unwrap();
            let v3 = v2.right().unwrap();
            let v4 = v3.top().unwrap();

            let r: f32 = rnd.gen();
            let g: f32 = rnd.gen();
            let b: f32 = rnd.gen();

            let color = vec3(r, g, b);
            geom.add_face4_data(
                vert(v1.val, color, v1.x, v1.y),
                vert(v2.val, color, v2.x, v2.y),
                vert(v3.val, color, v3.x, v3.y),
                vert(v4.val, color, v4.x, v4.y),
                Some(Vertex { pos: v1.val, color }),
            );
        }
    }

    geom.generate_face_normals();
    geom.generate_vertex_normals();
    geom.triangulate();

    geom.to_buffered_geometry_by_type(MeshBufferedGeometryType::VertexNormalFaceData)
}

#[test]
fn test_ball1() {
    let res = create_ball1_geom();
    print!("{:?}", res);
    assert!(res.buffer.len() > 0);
}
