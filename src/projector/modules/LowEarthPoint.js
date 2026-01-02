import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import BaseThreeJsModule from "../helpers/threeBase.js";
import _ from "lodash";
import data from "../../assets/json/low-earth-orbits-objects.json";

export class LowEarthPointModule extends BaseThreeJsModule {
  static name = "LowEarthPoint";
  static category = "3D";

  static methods = [
    ...BaseThreeJsModule.methods,
    {
      name: "primary",
      executeOnLoad: false,
      options: [
        {
          name: "duration",
          defaultVal: 0,
          type: "number",
          description: "Duration for primary method animations",
        },
      ],
    },
  ];

  constructor(container) {
    super(container);

    this.name = LowEarthPointModule.name;
    this.customGroup = new THREE.Group();
    this.customObjects = [];
    this.points = [];
    this.redPoints = [];
    this.linesGroup = new THREE.Group();
    this.redLinesGroup = new THREE.Group();
    this.customGroup.add(this.linesGroup);
    this.customGroup.add(this.redLinesGroup);
    this.pointCloud = null;
    this.redPointCloud = null;
    this.primary = this.primary.bind(this);
    this.setCustomAnimate(this.animateLoop.bind(this));
    this.init();
  }

  init() {
    if (this.destroyed) return;
    this.createPoints();
    this.createRedPoints();
    this.createLines();
    this.createRedLines();
    this.setModel(this.customGroup);
  }

  createPoints() {
    if (this.destroyed) return;

    const geometry = new THREE.BufferGeometry();
    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: _.random(0.035, 0.065, true),
    });
    const positions = [];

    data.forEach((item, i) => {
      const x = Math.random() * 10 - 5;
      const y = Math.random() * 10 - 5;
      const z = Math.random() * 10 - 5;
      positions.push(x, y, z);
      this.points.push(new THREE.Vector3(x, y, z));
    });

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );

    this.pointCloud = new THREE.Points(geometry, material);
    this.customGroup.add(this.pointCloud);
    this.customObjects.push(this.pointCloud);
  }

  createRedPoints() {
    if (this.destroyed) return;

    const redGeometry = new THREE.BufferGeometry();
    const redMaterial = new THREE.PointsMaterial({
      color: 0xff0000,
      size: _.random(0.035, 0.065, true),
    });
    const redPositions = [];

    data.forEach((item, i) => {
      if (i % 2 === 0) {
        const x = Math.random() * 10 - 5;
        const y = Math.random() * 10 - 5;
        const z = Math.random() * 10 - 5;
        redPositions.push(x * 0.5, y * 0.5, z * 0.5);
        this.redPoints.push(new THREE.Vector3(x * 0.5, y * 0.5, z * 0.5));
      }
    });

    redGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(redPositions, 3)
    );

    this.redPointCloud = new THREE.Points(redGeometry, redMaterial);
    this.customGroup.add(this.redPointCloud);
    this.customObjects.push(this.redPointCloud);
  }

  createLines() {
    if (this.destroyed) return;

    this.linesGroup.clear();
    const halfPointIndex = Math.floor(this.points.length / 3);
    for (let i = 0; i < halfPointIndex; i++) {
      for (let j = i + 1; j < halfPointIndex; j++) {
        const start = this.points[i];
        const end = this.points[j];
        const midZ = (start.z + end.z) / 2;
        const mid = new THREE.Vector3(
          (start.x + end.x) / 2,
          (start.y + end.y) / 2,
          midZ
        );
        const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
        const points = curve.getPoints(5);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
          color: 0xffffff,
          linewidth: 1,
          opacity: _.random(0.01, 0.3, true),
          transparent: true,
        });
        const curveObject = new THREE.Line(geometry, material);
        this.linesGroup.add(curveObject);
      }
    }
  }

  createRedLines() {
    if (this.destroyed) return;

    this.redLinesGroup.clear();
    const halfRedPointIndex = Math.floor(this.redPoints.length / 2);
    for (let i = 0; i < halfRedPointIndex; i++) {
      for (let j = i + 1; j < halfRedPointIndex; j++) {
        const start = this.redPoints[i];
        const end = this.redPoints[j];
        const midZ = (start.z + end.z) / 2;
        const mid = new THREE.Vector3(
          (start.x + end.x) / 2,
          (start.y + end.y) / 2,
          midZ * 2
        );
        const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
        const points = curve.getPoints(5);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
          color: 0xff0000,
          linewidth: 1,
          opacity: _.random(0.01, 0.3, true),
          transparent: true,
        });
        const curveObject = new THREE.Line(geometry, material);
        this.redLinesGroup.add(curveObject);
      }
    }
  }

  animateLoop() {
    if (this.destroyed) return;

    if (this.pointCloud) {
      this.pointCloud.rotation.x += 0.0005 * this.cameraSettings.cameraSpeed;
      this.pointCloud.rotation.y += 0.0005 * this.cameraSettings.cameraSpeed;
    }

    if (this.redPointCloud) {
      this.redPointCloud.rotation.x += 0.0003 * this.cameraSettings.cameraSpeed;
      this.redPointCloud.rotation.y += 0.0003 * this.cameraSettings.cameraSpeed;
    }

    this.linesGroup.children.forEach((line) => {
      line.rotation.x += 0.0003 * this.cameraSettings.cameraSpeed;
      line.rotation.y += 0.0003 * this.cameraSettings.cameraSpeed;
    });

    this.redLinesGroup.children.forEach((line) => {
      line.rotation.x += 0.0003 * this.cameraSettings.cameraSpeed;
      line.rotation.y += 0.0003 * this.cameraSettings.cameraSpeed;
    });
  }

  primary({ duration } = {}) {
    if (this.destroyed) return;

    const selectedPoints = _.sampleSize(this.points, 5);
    const loader = new FontLoader();
    loader.load("../../../assets/json/three-font.json", (font) => {
      selectedPoints.forEach((point, index) => {
        const textGeometry = new TextGeometry(
          `${data[index].Entity} ${data[index].Year}`,
          { font: font, size: 0.075, height: 0.1 }
        );
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.copy(point);
        this.scene.add(textMesh);

        setTimeout(() => {
          this?.scene?.remove(textMesh);
        }, duration * 1000 || 500);
      });
    });
  }

  destroy() {
    if (this.destroyed) return;

    this.customObjects.forEach((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((mat) => mat.dispose());
        } else {
          obj.material.dispose();
        }
      }
      this.scene.remove(obj);
    });
    this.customObjects = [];
    this.linesGroup.clear();
    this.redLinesGroup.clear();
    super.destroy();
  }
}

export default LowEarthPointModule;
