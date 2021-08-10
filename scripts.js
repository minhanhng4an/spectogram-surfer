// TODO:
// - Allow multiple region selections
// - Map canvas coordinate to timestamp
// - Scroll Spectogram / Zoom In & Out

// Region Selection on Spectogram
class Selection {
  init(start, end) {
    this.start = start;
    this.end = end;
  }
}

// Play Tracker on Spectogram
class PlayTracker {
  init() {
    this.pos = 0; // Current Position
    this.v = 1; // Speed
    this.run = false; // Play Tracker State
  }

  // Play Media
  play() {
    // TODO: Will need to recalculate the playspeed
    this.pos += this.v;
  }
}

// Spectogram
class Spectogram {
  init() {
    // Create Canvas
    this.canvas = document.createElement("canvas");
    this.canvas.id = "spectogram";
    this.ctx = this.canvas.getContext("2d");

    this.canvas.width = window.innerWidth;
    this.canvas.height = 200;

    // Selection
    this.newSelection = new Selection(0, 0);
    this.mousedown = false;

    this.canvas.addEventListener("mousedown", (e) => {
      this.mousedown = true;
      this.newSelection.start = e.clientX;
      this.newSelection.end = e.clientX;
    });

    this.canvas.addEventListener("mouseup", () => {
      this.mousedown = false;
    });

    this.canvas.addEventListener("mousemove", (e) => {
      if (this.mousedown) {
        this.newSelection.end = e.clientX;
      }
    });

    // Play Tracker
    this.playTracker = new PlayTracker();
    this.playTracker.init();

    // Add canvas to document
    document.getElementById("canvas").appendChild(this.canvas);
  }

  // Load Spectogram
  loadImage(source) {
    this.image = new Image();
    this.image.src = source;
  }

  // Draw Spectogram
  drawImage() {
    this.canvas.width = window.innerWidth;
    this.image.height = this.canvas.height;
    this.ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
  }

  // Draw Selection
  drawSelection() {
    if (this.newSelection.start < this.newSelection.end) {
      this.ctx.lineWidth = 1; // Stroke Width

      this.ctx.beginPath();
      this.ctx.rect(
        this.newSelection.start, // x
        0, // y
        this.newSelection.end - this.newSelection.start, // width
        this.canvas.height // height
      );
      this.ctx.stroke();
      this.ctx.fillStyle = "rgba(255,0,0,0.2)";
      this.ctx.fill();
      this.ctx.closePath();
    }
  }

  // Draw Play Tracker
  drawPlayTracker() {
    this.ctx.lineWidth = 5; // Stroke Weight
    this.ctx.strokeStyle = "orange"; // Stroke Color

    this.ctx.beginPath();
    this.ctx.rect(
      this.playTracker.pos, // x
      0, // y
      0, // width
      this.canvas.height // height
    );
    this.ctx.stroke();
    this.ctx.closePath();
  }
}

// Initialize the Spectogram
let init = () => {
  // Create Spectogram
  spec = new Spectogram();
  spec.init();
  spec.loadImage("assets/spectogram.png");

  // Handle Play Button
  let playButton = document.getElementById("play-btn");
  playButton.addEventListener("click", () => {
    spec.playTracker.run = !spec.playTracker.run; // Play Media

    if (playButton.value == "Play") {
      playButton.innerHTML = "Stop";
      playButton.value = "Stop";
    } else {
      playButton.innerHTML = "Play";
      playButton.value = "Play";
    }
  });
};

// Update
let update = () => {
  if (spec.playTracker.run) {
    // Play Media
    spec.playTracker.play();
  }
};

// Render
let render = () => {
  spec.drawImage();
  spec.drawSelection();
  spec.drawPlayTracker();
};

// Canvas Loop
let main = () => {
  update();
  render();
  requestAnimationFrame(main);
};

init();
main();
