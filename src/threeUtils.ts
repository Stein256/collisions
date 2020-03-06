import { Vector3, BufferGeometry, BufferAttribute, LineBasicMaterial, Line, LineLoop, Vec2 } from "three";

const redLineM = new LineBasicMaterial({ color: 0xff0000 })

export class MyLine {
    points: BufferAttribute
    line: Line
    pointCount: number
    geometry: BufferGeometry;
    constructor(maxPoints = 1000) {
        this.geometry = new BufferGeometry()

        this.geometry.addAttribute('position', new BufferAttribute(new Float32Array(maxPoints * 3), 3))
        this.points = this.geometry.attributes.position as BufferAttribute


        this.line = new LineLoop(this.geometry, redLineM)
        this.pointCount = 0
    }

    drawLine(points: Vector3[]) {
        points.forEach(p => {
            this.points.setXYZ(this.pointCount, p.x, p.y, p.z)
            this.pointCount++
        })
        this.geometry.setDrawRange(0, this.pointCount);
        this.points.needsUpdate = true
    }

    redraw(points: Vector3[]) {
        this.pointCount = 0
        this.drawLine(points)
    }
}

export function toVec3(v: Vec2) {
    return new Vector3(v.x, 0.1, v.y)
}