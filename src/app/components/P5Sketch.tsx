// src/app/components/P5Sketch.tsx

import React, { useEffect, useRef } from 'react';
import * as p5 from "p5";

const P5Sketch: React.FC = () => {
  const sketchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const addScript = (src: string) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    const loadP5 = async () => {
      await addScript('https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.min.js');
      await addScript('https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/addons/p5.sound.min.js');

      const sketch = (p: any) => {
        let song: any;
        let fft: any;
        let layer: any;
        let playing = false;
        let a = 0;
        let b = 0;
        const fr = 60;

        p.preload = () => {
          song = p.loadSound('/UnderPressure.mp3', () => {
            console.log("Song loaded");
          });
          song.onended(() => {
            playing = false;
            document.getElementById("audioToggleButton")!.innerText = "PLAY";
            a = 0;
          });
        };

        p.setup = () => {
          p.createCanvas(500, 500);
          layer = p.createGraphics(p.width, p.height);
          p.background('black');
          fft = new p5.FFT(0, 256);
          a = 360 / (song.duration() * fr);
          b = a;
          p.frameRate(fr);
        };

        p.draw = () => {
          p.background(0);
          layer.noFill();
          layer.colorMode(p.RGB);

          const spectrumA = fft.analyze();
          const spectrumB = spectrumA.slice().reverse();
          spectrumB.splice(0, 40);

          p.push();
          p.translate(250, 250);
          p.noFill();
          p.stroke('pink');

          p.beginShape();
          for (let i = 0; i < spectrumB.length; i++) {
            const amp = spectrumB[i];
            const x = p.map(amp, 0, 256, -2, 2);
            const y = p.map(i, 0, spectrumB.length, 30, 215);
            p.vertex(x, y);
          }
          p.endShape();
          p.pop();

          p.push();
          p.translate(p.width / 2, p.height / 2);
          p.rotate(p.radians(a));

          layer.push();
          layer.translate(p.width / 2, p.height / 2);
          layer.rotate(p.radians(-a));

          for (let i = 0; i < spectrumB.length; i++) {
            layer.strokeWeight(0.018 * spectrumB[i]);
            layer.stroke(245, 132, 255 - spectrumB[i], spectrumB[i] / 40);
            layer.line(0, i, 0, i);
          }

          layer.pop();
          p.image(layer, -p.width / 2, -p.height / 2);
          p.pop();

          if (playing) a += b;
        };

        (window as any).toggleAudio = () => {
          if (!playing) {
            song.play();
            document.getElementById("audioToggleButton")!.innerText = "PAUSE";
          } else {
            song.pause();
            document.getElementById("audioToggleButton")!.innerText = "PLAY";
          }
          playing = !playing;
        };
      };

      const p5Instance = new (window as any).p5(sketch, sketchRef.current as HTMLDivElement);

      return () => {
        p5Instance.remove();
      };
    };

    loadP5();
  }, []);

  return (
    <div>
      <div ref={sketchRef}></div>
      <button id="audioToggleButton" onClick={() => (window as any).toggleAudio()}>PLAY</button>
    </div>
  );
};

export default P5Sketch;
