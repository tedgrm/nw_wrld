import p5 from "p5";
import meteorData from "../../assets/json/meteor.json";
import ModuleBase from "../helpers/moduleBase.js";

class AsteroidGraph extends ModuleBase {
  static name = "AsteroidGraph";
  static category = "2D";

  static methods = [
    ...ModuleBase.methods,
    {
      name: "loadMeteors",
      executeOnLoad: true,
      options: [
        {
          name: "count",
          defaultVal: 5,
          type: "number",
        },
      ],
    },
  ];

  constructor(container) {
    super(container);
    this.name = AsteroidGraph.name;
    this.meteors = [];
    this.myp5 = null;
    this.init();
  }

  init() {
    const sketch = (p) => {
      this.myp5 = p;
      let noiseOffsetX = 0.0;
      let noiseOffsetY = 0.0;

      p.setup = () => {
        let canvasWidth = this.elem.clientWidth;
        let canvasHeight = this.elem.clientHeight;

        this.canvas = p.createCanvas(canvasWidth, canvasHeight);
        this.canvas.parent(this.elem);

        p.textSize(12);
        p.textAlign(p.CENTER, p.CENTER);
      };

      p.draw = () => {
        p.clear();
        const centerY = p.height / 2;
        let maxDistortion = (p.height / 2) * 0.9; // 90% of half the canvas height

        this.meteors.forEach((meteor, index) => {
          p.stroke(255 - index * 50);
          p.noFill();
          p.beginShape();

          let highestDistortion = 0;
          let peakX = 0;
          let peakY = centerY;

          for (let x = 0; x < p.width; x += 5) {
            let distortionMagnitude = meteor ? meteor.mass / 10 : 1;
            distortionMagnitude = Math.min(distortionMagnitude, maxDistortion);

            let noiseVal = p.noise(
              noiseOffsetX + x * 0.01,
              noiseOffsetY + index
            );
            let distortion = (noiseVal - 0.5) * 2 * distortionMagnitude;

            let y = centerY - distortion;

            p.vertex(x, y);

            if (Math.abs(distortion) > highestDistortion) {
              highestDistortion = Math.abs(distortion);
              peakX = x;
              peakY = y;
            }
          }

          p.endShape();

          if (meteor.geolocation && meteor.geolocation.coordinates) {
            p.fill(255 - index * 50);
            p.text(
              `${meteor.geolocation.coordinates[0]}, ${meteor.geolocation.coordinates[1]}`,
              peakX,
              peakY - 15
            );
            p.noFill();
          }
        });

        noiseOffsetX += 0.01;
        noiseOffsetY += 0.01;
      };
    };

    this.myp5 = new p5(sketch);
  }

  loadMeteors({ count = 5 } = {}) {
    this.meteors = [];
    for (let i = 0; i < count; i++) {
      if (meteorData.length > 0) {
        this.meteors.push(
          meteorData[Math.floor(this.myp5.random(meteorData.length))]
        );
      }
    }
  }

  destroy() {
    if (this.myp5) {
      this.myp5.remove();
      this.myp5 = null;
    }
    super.destroy();
  }
}

export default AsteroidGraph;
