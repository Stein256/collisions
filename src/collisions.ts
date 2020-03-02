const trace = console.log

export default class Collisions {
    polygons: {}
    constructor() {
        this.polygons = {}
    }

    setCollidable(id, polygon) {
        this.polygons[id] = { polygon}
    }

    removeCollidable(id) {
        delete this.polygons[id]
    }

    getProjection(id, polygon) {
        for (let polygonID in this.polygons) {
            if (id === polygonID) {
                continue
            }
            let obstacle = this.polygons[polygonID].polygon
            return doPolygonsIntersect(polygon, obstacle)
        }
        return {
            x: 0,
            y: 0,
        }
    }
}

function doPolygonsIntersect(a, b) {
    let  polygons = [a, b]
    let projection = {length: 0} // smallest projection vector
    console.clear()

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
            // trace(normal.x, normal.y)

            // for each vertex in both shapes project it onto the line perpendicular to the edge
            // and keep track of the min and max of these values
            const [minA, maxA] = minMax(a.map(p => dotProduct(p, normal)))
            const [minB, maxB] = minMax(b.map(p => dotProduct(p, normal)))

            /*
            const lengthA = maxA - minA
            const lengthB = maxB - minB
            const lengthAB = Math.abs(maxA - minB)

            if (lengthAB > lengthA + lengthB) {
                return { x: 0, y: 0, collided: false }
            }
            */

            // if there is no overlap between the projections, the edge we are looking at separates the two
            // polygons, and we know there is no overlap
            // trace(normal.x, normal.y, minA, maxA, minB, maxB)
            trace(normal.x, normal.y, maxA - minA, maxB - minB, Math.abs(maxA - minB))
            // trace(a[1].x, a[2].x)
            trace(a[0].y, a[1].y)
            if (maxA < minB || maxB < minA) {
                return { x: 0, y: 0, collided: false}
            }
        }
    }
    return { x: 0, y: 0, collided: true}
}

function dotProduct(u: Vec2, v: Vec2): number {
    return u.x * v.x + u.y + v.y
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