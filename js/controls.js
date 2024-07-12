class Controls {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.initControls();
  }

  initControls() {
    this.domElement.addEventListener(
      "keydown",
      (event) => this.onKeyDown(event),
      false
    );
    this.domElement.addEventListener(
      "keyup",
      (event) => this.onKeyUp(event),
      false
    );
    this.keys = {};
  }

  onKeyDown(event) {
    this.keys[event.key] = true;
  }

  onKeyUp(event) {
    this.keys[event.key] = false;
  }

  update() {
    const speed = 0.1;
    if (this.keys["w"]) {
      this.camera.position.z -= speed;
    }
    if (this.keys["s"]) {
      this.camera.position.z += speed;
    }
    if (this.keys["a"]) {
      this.camera.position.x -= speed;
    }
    if (this.keys["d"]) {
      this.camera.position.x += speed;
    }
  }
}
