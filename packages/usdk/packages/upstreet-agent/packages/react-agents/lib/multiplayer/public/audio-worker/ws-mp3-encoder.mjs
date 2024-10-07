import lamejs from './lamejs/lame.all.js';
// import lamejs from './lamejs/lame.min.mjs';
import {channelCount, /*frameSize, voiceOptimization*/} from './ws-constants.mjs';
import { floatTo16Bit, int16ToFloat32 } from './convert.mjs';

export class WsMp3Encoder extends EventTarget {
  constructor() {
    super();

    this.onmessage = e => {
      const {
        sampleRate,
        bitrate,
      } = e.data;
      const mp3encoder = new lamejs.Mp3Encoder(channelCount, sampleRate, bitrate);

      this.onmessage = e => {
        if (e.data) {
          const samples = floatTo16Bit(e.data);
          const i8Array = mp3encoder.encodeBuffer(samples);
          const uint8Array = new Uint8Array(i8Array.buffer, i8Array.byteOffset, i8Array.byteLength);
          const data = uint8Array;
          this.dispatchMessage({
            data,
            timestamp: 0, // fake
            duration: 1, // fake
          }, [data.buffer]);
        } else {
          const i8Array = mp3encoder.flush();
          const uint8Array = new Uint8Array(i8Array.buffer, i8Array.byteOffset, i8Array.byteLength);
          const data = uint8Array;
          this.dispatchMessage({
            data,
            timestamp: 0, // fake
            duration: 1, // fake
          }, [data.buffer]);

          this.dispatchMessage({
            data: null,
            timestamp: 0, // fake
            duration: 1, // fake
          });

          this.close();
        }
      };
    }
  }
  postMessage(data, transferList) {
    this.onmessage({
      data,
      transferList,
    });
  }
  dispatchMessage(data, transferList) {
    this.dispatchEvent(new MessageEvent('postmessage', {
      data,
      transferList,
    }));
  }
  close() {
    this.dispatchEvent(new MessageEvent('close', {
      data: null,
    }));
  }
}