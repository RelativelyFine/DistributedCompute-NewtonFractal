async function main() {
  let complex_coordinates = {
    x1: -2.5,
    y1: -1,
    x2: 1,
    y2: 1,
  };

  const canvas_size = {
    height: 800,
    width: 1200,
  };

  const z0 = { re: 0.42884, im: -0.231345 };
  const speed = 0.4;
  const max_iterations = 100;
  const frames_num = 2;
  const frames_per_worker = 2;
  const mandelbrot = require("./mandelbrot-set.js");
  const create_image = require("./image-animation.js");

  let complex_coordinates_new;
  let pre_frames = new Array(frames_num);
  for (let i = 0; i < frames_num; i++) {
    complex_coordinates_new = mandelbrot.zoom_in(
      complex_coordinates,
      z0,
      speed
    );
    pre_frames[i] = [complex_coordinates, complex_coordinates_new];
    complex_coordinates = complex_coordinates_new;
  }

  const compute = require("dcp/compute");
  let startTime;

  let do_it_on_dcp = true;
  let array_results = Array();
  if (do_it_on_dcp) {
    const job = compute.for(
      pre_frames,
      (pre_frame, canvas_size, max_iterations, frames_per_worker) => {
        const mandelbrot = require("./mandelbrot-set");
        const frames = mandelbrot.make_frames(
          canvas_size,
          max_iterations,
          pre_frame[0],
          pre_frame[1],
          frames_per_worker
        );
        return frames;
      },
      [canvas_size, max_iterations, frames_per_worker]
    );

    job.requires("./mandelbrot-set");

    job.on("accepted", () => {
      console.log(` - Job accepted by scheduler, waiting for results`);
      console.log(` - Job has id ${job.id}`);
      startTime = Date.now();
    });

    job.on("readystatechange", (arg) => {
      console.log(`new ready state: ${arg}`);
    });

    job.on("result", (ev) => {
      console.log(
        ` - Received result for slice ${ev.sliceNumber} at ${
          Math.round((Date.now() - startTime) / 100) / 10
        }s`
      );
    });
    job.on("status", (ev) => {
      console.log("Got status update: ", ev);
    });

    job.public.name = "mandelbrot set, nodejs";

    // SKIP IF: you don't need a Compute Group
    //job.computeGroups = [{ joinKey: "", joinSecret: "" }]

    const results = await job.localExec(); //compute.marketValue
    //console.log('results=', Array.from(results));
    array_results = Array.from(results);
    debugger;
  } else {
    for (let idx = 0; idx < pre_frames.length - 1; idx++) {
      const frames = mandelbrot.make_frames(
        canvas_size,
        max_iterations,
        pre_frames[idx][0],
        pre_frames[idx][1],
        frames_per_worker
      );
      array_results.push(frames);
    }
  }

  for (let i = 0; i < array_results.length; i++) {
    for (let j = 0; j < array_results[i].length; j++) {
      let idx = i * array_results.length + j;
      let image = Uint8Array.from(array_results[i][j].flat(3));
      create_image.save_image(
        image,
        canvas_size.width,
        canvas_size.height,
        "./mandelbrot_images",
        "/mandelbrot" + String(idx).padStart(3, "0") + ".png"
      );
    }
  }

  create_image.create_gif(
    canvas_size.width,
    canvas_size.height,
    "./mandelbrot_images",
    "/mandelbrot"
  );
}
const SCHEDULER_URL = new URL("https://scheduler.distributed.computer");
require("dcp-client").initSync(SCHEDULER_URL);
main();
