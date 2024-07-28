import * as p5 from 'p5';

declare module 'p5' {
  interface FFT {
    new (smoothing?: number, bins?: number): FFT;
    analyze(): number[];
  }
  interface p5InstanceExtensions {
    FFT: FFT;
  }
}
