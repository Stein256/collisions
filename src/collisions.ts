const trace = console.log

export default class Collisions {
    polygons: PolygonDict
    constructor() {
        this.polygons = {}
    }

    setFromVertices(id: string, polygon: Vec2[], object = null) {
        this.polygons[id] = { polygon, object }
    }

    remove(id: string) {
        delete this.polygons[id]
    }

    getProjection(id: string) {
        const polygon = this.polygons[id].polygon
        const total = {x: 0, y: 0, collided: false, objects: []} as CollisionResult
        for (let polygonID in this.polygons) {
            if (id === polygonID) {
                continue
            }
            let obstacle = this.polygons[polygonID].polygon
            const result = doPolygonsIntersect(polygon, obstacle)
            total.x += result.x
            total.y += result.y
            total.collided = total.collided || result.collided
            if(result.collided) {
                total.objects.push(this.polygons[polygonID].object)
            }
        }
        return total
    }
}

function doPolygonsIntersect(a: Vec2[], b: Vec2[]) {
    let  polygons = [a, b]
    let projection = {length: Infinity} as {length: number, normal: Vec2} // smallest projection vector
    
    for (let i = 0; i < polygons.length; i++) {
        // for each polygon, look at each edge of the polygon, and determine if it separates
        // the two shapes
        const polygon = polygons[i]
        for (let j = 0; j < polygon.length; j++) {
            // grab 2 vertices to create an edge
            const p1 = polygon[j]
            const p2 = polygon[(j + 1) % polygon.length]

            // find the line perpendicular to this edge
            const normal = normalize({ x: p2.y - p1.y, y: p1.x - p2.x })

            // for each vertex in both shapes project it onto the line perpendicular to the edge
            // and keep track of the min and max of these values
            const [minA, maxA] = minMax(a.map(p => dotProduct(p, normal)))
            const [minB, maxB] = minMax(b.map(p => dotProduct(p, normal)))

            const overlap = maxA - minA + maxB - minB - Math.abs(maxB - minA)
            if (overlap <= 0) {
                return { x: 0, y: 0, collided: false}
            } else {
                if (projection.length > overlap) {
                    projection.length = overlap
                    projection.normal = normal
                }
            }
        }
    }
    return {
        x: projection.normal.x * projection.length,
        y: projection.normal.y * projection.length, 
        collided: true,
    }
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

interface Vec2 {
    x: number,
    y: number,
}

interface PolygonDict {
    [key:string]: {
        polygon: Vec2[]
        object: any
    }
}

interface CollisionResult {
    x: number,
    y: number,
    collided: boolean
    objects: any[]
}