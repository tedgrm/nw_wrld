import ModuleBase from "../helpers/moduleBase.js";

class Text extends ModuleBase {
  static name = "Text";
  static category = "Text";

  static methods = [
    ...ModuleBase.methods,
    {
      name: "text",
      executeOnLoad: true,
      options: [
        {
          name: "text",
          defaultVal: "Hello, world.",
          type: "text",
        },
      ],
    },
    {
      name: "randomText",
      executeOnLoad: false,
      options: [
        {
          name: "length",
          defaultVal: 8,
          type: "number",
        },
        {
          name: "characters",
          defaultVal:
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
          type: "text",
        },
      ],
    },
    {
      name: "font",
      executeOnLoad: true,
      options: [
        {
          name: "font",
          defaultVal: "font-monospace",
          type: "select",
          values: ["font-monospace"],
        },
      ],
    },
    {
      name: "color",
      executeOnLoad: true,
      options: [
        {
          name: "color",
          defaultVal: "#ffffff",
          type: "color",
        },
      ],
    },
    {
      name: "reset",
      executeOnLoad: false,
      options: [],
    },
    {
      name: "size",
      executeOnLoad: true,
      options: [
        {
          name: "percentage",
          defaultVal: 100,
          type: "number",
        },
      ],
    },
  ];

  constructor(container) {
    super(container);
    this.name = Text.name;
    this.textElem = null;
    this.init();
  }

  init() {
    const html = `<div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 100%;
        color: #000000;
        text-align: center;
      ">Sample Text</div>`;

    this.elem.insertAdjacentHTML("beforeend", html);
    this.textElem = this.elem.querySelector("div");
  }

  text({ text = "Hello, world" }) {
    if (this.textElem) {
      this.textElem.textContent = text;
    }
  }

  color({ color = "#ffffff" }) {
    if (this.textElem) {
      const isValidHex = /^#([0-9A-F]{3}){1,2}$/i.test(color);
      if (isValidHex) {
        this.textElem.style.color = color;
      } else {
        console.warn(`Invalid hex color: ${color}`);
      }
    }
  }

  randomBinary({ length = 8 }) {
    if (this.textElem) {
      let binary = "";
      for (let i = 0; i < length; i++) {
        binary += Math.round(Math.random()).toString();
      }
      this.textElem.textContent = binary;
    }
  }

  randomText({
    length = 8,
    characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  }) {
    if (this.textElem) {
      let randomText = "";
      for (let i = 0; i < length; i++) {
        randomText += characters.charAt(
          Math.floor(Math.random() * characters.length)
        );
      }
      this.textElem.textContent = randomText;
    }
  }

  font({ font = "font-monospace" }) {
    if (this.textElem) {
      this.textElem.className = font;
    }
  }

  reset() {
    if (this.textElem) {
      this.textElem.textContent = "";
    }
  }

  size({ percentage = 100 }) {
    if (this.textElem) {
      this.textElem.style.fontSize = `${percentage}%`;
    }
  }

  destroy() {
    if (this.textElem && this.textElem.parentNode === this.elem) {
      this.elem.removeChild(this.textElem);
      this.textElem = null;
    }
    super.destroy();
  }
}

export default Text;
