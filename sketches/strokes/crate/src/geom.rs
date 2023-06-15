use bytemuck::{Pod, Zeroable};
use glam::{vec3, Quat, Vec3};
use serde::Serialize;
use std::f32::consts::PI;
use tvs_libs::{
    data_structures::grid::{make_grid_with_coord_ops, CIRCLE_COLS_COORD_OPS},
    geometry::{
        mesh_geometry_3d::{MeshBufferedGeometryType, MeshGeometry, MeshVertex},
        vertex_index::VertIdx2Usize,
    },
    rendering::buffered_geometry::{
        vert_type, BufferedGeometry, BufferedVertexData, OverrideWith, VertexFormat, VertexType,
    },
};

#[repr(C)]
#[derive(Pod, Zeroable, Clone, Copy, Serialize)]
struct VertexBuffer {
    pos: Vec3,
    color: Vec3,
}
impl BufferedVertexData for VertexBuffer {
    fn vertex_layout() -> Vec<VertexType> {
        vec![
            vert_type("position", VertexFormat::Float32x3),
            vert_type("color", VertexFormat::Float32x3),
        ]
    }
}
impl OverrideWith for VertexBuffer {
    fn override_with(&self, attribs: &Self) -> Self {
        VertexBuffer {
            pos: self.pos,
            color: attribs.color,
        }
    }
}

struct Vertex {
    data: VertexBuffer,
    grid_pos: (usize, usize),
}
impl MeshVertex<VertIdx2Usize, VertexBuffer> for Vertex {
    fn to_buffered_vertex_data(&self) -> VertexBuffer {
        self.data
    }
    fn position(&self) -> Vec3 {
        self.data.pos
    }
    fn vertex_index(&self) -> VertIdx2Usize {
        VertIdx2Usize(self.grid_pos.0, self.grid_pos.1)
    }
}

fn vert(pos: Vec3, color: Vec3, x: usize, y: usize) -> Vertex {
    Vertex {
        data: VertexBuffer { pos, color },
        grid_pos: (x, y),
    }
}

pub fn create_ball1_geom() -> BufferedGeometry {
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
            geom.add_face4(
                vert(v1.val, vec3(1.0, 0.0, 0.0), v1.x, v1.y),
                vert(v2.val, vec3(1.0, 0.0, 0.0), v2.x, v2.y),
                vert(v3.val, vec3(1.0, 0.0, 0.0), v3.x, v3.y),
                vert(v4.val, vec3(1.0, 0.0, 0.0), v4.x, v4.y),
            );
        }
    }

    geom.generate_face_normals();
    geom.generate_vertex_normals();
    geom.triangulate();

    geom.to_buffered_geometry_by_type(MeshBufferedGeometryType::FaceNormals)
}

#[test]
fn test_ball1() {
    let res = create_ball1_geom();
    print!("{:?}", res);
    assert!(res.buffer.len() > 0);
}
