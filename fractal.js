let TOL = 1e-8;

function newton(z0, f, fprime, MAX_IT = 1000) {
  let z = z0;
  for (let i = 0; i < MAX_IT; i++) {
    dz = f(z) / fprime(z);
    if (Math.abs(dz) < TOL) {
      return z;
    }
    z -= dz;
  }
  return false;
}


function plot_newton_fractal(f,fprime,n=200,domain=(-1,1,-1,1)) {
  roots = []

  m = 
}