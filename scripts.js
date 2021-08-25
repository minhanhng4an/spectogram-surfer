// TODO:
// - Allow multiple region selections
// - Map canvas coordinate to timestamp
// - Scroll Spectogram / Zoom In & Out
// - Sync zoom with Play tracker

// Region Selection on Spectogram
class Selection {
  init(start, end) {
    this.start = start;
    this.end = end;
  }
}

let duration;
let scale = 1;
// Play Tracker on Spectogram
class PlayTracker {
  init() {
    this.pos = 0; // Current Position
    this.v = window.innerWidth / 60 / 60; // Speed  Needs to be calculated with the length of the audio file and Canvas Width
    console.log(`this.v`, this.v);
    this.run = false; // Play Tracker State
  }

  // Play Media
  play() {
    // TODO: Will need to recalculate the playspeed
    this.pos += this.v;
  }

  restart() {
    this.pos = 0;
  }
}

// Spectogram
class Spectogram {
  init() {
    let regionList = [];

    // Create Canvas
    this.canvas = document.createElement("canvas");
    this.canvas.id = "spectogram";
    this.ctx = this.canvas.getContext("2d");
    // Zoom In & Out Variables
    this.originX = 0;
    this.originY = 0;

    this.currentzoom = 5;
    this.mousex = 0;
    this.mousey = 0;

    this.canvas.width = window.innerWidth * 2;
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
      let region = {
        id: Date.now(),
        start: this.newSelection.start / (this.canvas.width / 60), //audio.duration
        end: this.newSelection.end / (this.canvas.width / 60), //audio.duration
      };

      regionList.push(region);
      console.log(`regionList`, region);
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
    this.ctx.drawImage(
      this.image,
      0,
      0,
      this.canvas.width / scale,
      this.canvas.height
    );
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
    this.ctx.lineWidth = 2; // Stroke Weight
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
  spec.loadImage("assets/spectogram2.png");

  //Play Audio
  let playCall = document.getElementById("playCall");

  playCall.onloadedmetadata = function () {
    duration = this.duration;
    console.log(`duration`, duration);
  };

  // Handle Restart Button
  let restartBtn = document.getElementById("restart-btn");
  restartBtn.addEventListener("click", () => {
    spec.playTracker.restart();
    playCall.pause();
    playCall.currentTime = 0;
  });

  // Handle Play Button
  let playBtn = document.getElementById("play-btn");

  playBtn.addEventListener("click", () => {
    spec.playTracker.run = !spec.playTracker.run; // Play Media

    if (playBtn.value == "Play") {
      playCall.play();
      playBtn.innerHTML = "Stop";
      playBtn.value = "Stop";
      restartBtn.disabled = true;
    } else {
      playCall.pause();
      playBtn.innerHTML = "Play";
      playBtn.value = "Play";
      restartBtn.disabled = false;
    }
  });

  let zoomIn = document.getElementById("zoomin");
  zoomIn.addEventListener("click", () => {
    scale = scale - 0.1;
  });

  let zoomOut = document.getElementById("zoomout");
  zoomOut.addEventListener("click", () => {
    if (scale == 1) {
      return;
    } else {
      scale = scale + 0.1;
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
