const trace = console.log

export default class Collisions {
    solids: SolidsDict
    constructor() {
        this.solids = {}
    }

    addFromVertices(id: string, vertices: Vec2[], position = {x: 0, y: 0}, object = null) {
        const solid = this.solids[id] = {
            vertices,
            object,
            position,
            normals: [],
            aabb: {} as AABB
        } as Solid

        for (let i = 0; i < vertices.length; i++) {
            const p1 = vertices[i]
            const p2 = vertices[(i + 1) % vertices.length]
            const normal = normalize({ x: p2.y - p1.y, y: p1.x - p2.x })
            /*if (solid.normals.findIndex(
                v => compareFloat(v.x, normal.x) && compareFloat(v.y, normal.y)) == -1) {
                solid.normals.push(normal)
            }*/
            solid.normals.push(normal)
            solid.aabb = getAABB(solid.vertices)
        }
    }

    addRect(id: string, center: Vec2, width: number, height: number, angle: number, object = null) {
        const solid = this.solids[id] = {
            vertices: [
                { x: -width / 2, y: -height / 2 },
                { x: width / 2, y: -height / 2 },
                { x: width / 2, y: height / 2 },
                { x: -width / 2, y: height / 2 },
            ],
            object,
            position: center,
            // TODO: it shouldn't require all normals, only non parallel
            normals: [
                { x: -1, y: 0 },
                { x: 0, y: 1 },
                { x: 1, y: 0 },
                { x: 0, y: -1 },
            ],
            aabb: {} as AABB
        }

        rotatePoints(solid.vertices, angle)
        rotatePoints(solid.normals, angle)
        translatePoints(solid.vertices, center)

        solid.aabb = getAABB(solid.vertices)
    }

    translate(id: string, newPos: Vec2) {
        const solid = this.solids[id]
        translatePoints(solid.vertices, newPos, solid.position)
        translatePoints([solid.aabb.max, solid.aabb.min], newPos, solid.position)
        solid.position = newPos
    }

    remove(id: string) {
        delete this.solids[id]
    }

    overlapAABB(b1: AABB, b2: AABB) {
        const totalWidth = b1.max.x - b1.min.x + b2.max.x - b2.min.x
        const totalHeight = b1.max.y - b1.min.y + b2.max.y - b2.min.y

        return Math.abs(b1.max.x - b2.min.x) < totalWidth &&
            Math.abs(b1.min.x - b2.max.x) < totalWidth &&
            Math.abs(b1.max.y - b2.min.y) < totalHeight &&
            Math.abs(b1.min.y - b2.max.y) < totalHeight
    }

    overlapSAT(s1: Solid, s2: Solid) {
        let solids = [s1, s2]
        // smallest translation vector to push the shapes out of the collision
        let translation = { length: Infinity } as { length: number, normal: Vec2 }
        for (let i = 0; i < solids.length; i++) {
            const s = solids[i];

            for (let j = 0; j < s.normals.length; j++) {
                const normal = s.normals[j];
                // edges of polygon projections onto the normal
                const [minA, maxA] = minMax(s1.vertices.map(p => dotProduct(p, normal)))
                const [minB, maxB] = minMax(s2.vertices.map(p => dotProduct(p, normal)))

                const overlap = maxA - minA + maxB - minB - Math.abs(maxB - minA)
                if (overlap <= 0) {
                    return { x: 0, y: 0, collided: false }
                } else {
                    if (translation.length > overlap) {
                        translation.length = overlap
                        translation.normal = normal
                    }
                }
            }
        }
        return {
            x: translation.normal.x * translation.length,
            y: translation.normal.y * translation.length,
            collided: true,
        }
    }

    getProjection(id: string) {
        const solid = this.solids[id]
        const total = { x: 0, y: 0, collided: false, objects: [] } as CollisionResult
        for (let polygonID in this.solids) {
            if (id === polygonID) {
                continue
            }
            let obstacle = this.solids[polygonID]
            if (!this.overlapAABB(solid.aabb, obstacle.aabb)) {
                continue
            }
            const result = this.overlapSAT(solid, obstacle)
            total.x += result.x
            total.y += result.y
            total.collided = total.collided || result.collided
            if (result.collided) {
                total.objects.push(this.solids[polygonID].object)
                return total
            }
        }
        return total
    }
}

function getAABB(vertices: Vec2[]) {
    const aabb = {
        max: {
            x: vertices[0].x,
            y: vertices[0].y,
        },
        min: {
            x: vertices[0].x,
            y: vertices[0].y,
        }
    }
    for (let i = 1; i < vertices.length; i++) {
        const v = vertices[i];
        aabb.max.x = Math.max(aabb.max.x, v.x)
        aabb.max.y = Math.max(aabb.max.y, v.y)
        aabb.min.x = Math.min(aabb.min.x, v.x)
        aabb.min.y = Math.min(aabb.min.y, v.y)
    }
    return aabb
}

function addCollisionResults (results: CollisionResult) {
}

function dotProduct(u: Vec2, v: Vec2): number {
    return u.x * v.x + u.y * v.y
}

function normalize(v: Vec2): Vec2 {
    let length = vectorLength(v)
    return { x: v.x / length, y: v.y / length}
}

function vectorLength(v: Vec2): number {
    return Math.sqrt(v.x ** 2 + v.y ** 2)
}

function minMax(arr: number[]): [number, number] {
    let min = arr[0], max = arr[0]
    for(let i = 1; i < arr.length; ++i) {
        if (arr[i] < min) {
            min = arr[i]
        } else if (arr[i] > max) {
            max = arr[i]
        }
    }
    return [min, max]
}

function rotatePoints(points: Vec2[], angle: number, center = {x: 0, y: 0}) {
    const sin = Math.sin(angle)
    const cos = Math.cos(angle)

    points.forEach(p => {
        const x = p.x - center.x;
        const y = p.y - center.y;

        p.x = x * cos - y * sin + center.x;
        p.y = x * sin + y * cos + center.y;
    })
}

function translatePoints(points: Vec2[], to: Vec2, from = {x: 0, y: 0}) {
    points.forEach(p => {
        p.x = p.x - from.x + to.x
        p.y = p.y - from.y + to.y
    })
}

function compareFloat(a: number, b: number, eps = 1e-9) {
    return Math.abs(a - b) < eps
}

function addVec(to: Vec2, ...from: Vec2[]) {
    from.forEach(v => {
        to.x += v.x;
        to.y += v.y;
    })
}

function subVec(to: Vec2, ...from: Vec2[]) {
    from.forEach(v => {
        to.x -= v.x;
        to.y -= v.y;
    })
}

interface Vec2 {
    x: number,
    y: number,
}

interface AABB { 
    min: Vec2, 
    max: Vec2,
}

interface Solid {
    vertices: Vec2[]
    normals: Vec2[]
    aabb: AABB
    object: any
    position: Vec2
}

interface SolidsDict {
    [key:string]: Solid
}

interface CollisionResult {
    x: number,
    y: number,
    collided: boolean
    objects: any[]
}