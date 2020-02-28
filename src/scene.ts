import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import {DragControls} from 'three/examples/jsm/controls/DragControls'
import * as THREE from 'three'


export default class Scene {
    scene: THREE.Scene
    renderer: THREE.WebGLRenderer
    camera: THREE.PerspectiveCamera
    elem: HTMLElement
    dragControls: DragControls
    constructor(elem: HTMLElement) {
        this.elem = elem
        this.renderer = new THREE.WebGLRenderer()
        this.renderer.setSize(elem.offsetWidth, elem.offsetHeight);
        elem.appendChild(this.renderer.domElement)

        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color(0xaaaaaa)

        this.camera = new THREE.PerspectiveCamera(70, elem.offsetWidth / elem.offsetHeight, 0.1, 1000);
        this.camera.position.set(0, 5, 20);
        let orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        orbitControls.addEventListener('change', () => this.render());

        let gridHelper = new THREE.GridHelper(10, 10, 0xffffff, 0xcccccc);
        this.scene.add(gridHelper);

        let boxGeometry = new THREE.BoxGeometry();
        let material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
        let box = new THREE.Mesh(boxGeometry, material);

        this.scene.add(box)

        this.dragControls = new DragControls([box], this.camera, this.renderer.domElement)
        this.dragControls.addEventListener('dragstart', e => {
            orbitControls.enabled = false
        })

        this.dragControls.addEventListener('drag', e => {
            this.render()
        })

        this.dragControls.addEventListener('dragend', e => {
            orbitControls.enabled = true
        })

        this.render()
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    resize() {
        this.camera.aspect = this.elem.offsetWidth / window.innerHeight;
        this.renderer.setSize(this.elem.offsetWidth, window.innerHeight);
        this.camera.updateProjectionMatrix();
        this.render();
    }
}
