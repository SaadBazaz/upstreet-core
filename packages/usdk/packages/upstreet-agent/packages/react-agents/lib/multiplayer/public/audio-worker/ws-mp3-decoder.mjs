import MPEGDecoder from './mpg123-decoder/src/MPEGDecoder.js';
// import {channelCount, sampleRate, bitrate, kbps, frameSize, voiceOptimization} from './ws-constants.js';
import { resample } from './resample.mjs';
import { formatSamples } from './format.mjs';
import { QueueManager } from './queue-manager.mjs';
// import { floatTo16Bit, int16ToFloat32 } from './convert.mjs';

export class WsMp3Decoder extends EventTarget {
  constructor() {
    super();

    const mp3decoder = new MPEGDecoder();
    const queueManager = new QueueManager();

    this.onmessage = e => {
      const {
        sampleRate: globalSampleRate,
        format,
      } = e.data;
      this.onmessage = async e => {
        await queueManager.waitForTurn(async () => {
          console.log('wait for decoder ready 1');
          await mp3decoder.ready;
          console.log('wait for decoder ready 2');

          if (e.data) {
            const mp3Data = e.data;
            console.log('decode data 1', mp3Data);
            const result = mp3decoder.decode(mp3Data);
            console.log('decode data 2', result);
            const {channelData, samplesDecoded, sampleRate: localSampleRate} = result;
            if (samplesDecoded > 0) {
              const firstChannelData = channelData[0];
              // console.log('resampling 1');
              const resampled = localSampleRate === globalSampleRate ?
                firstChannelData
              :
                resample(firstChannelData, localSampleRate, globalSampleRate);
              // console.log('resampling 2', format);
              const formatted = formatSamples(resampled, format, 'f32');
              // console.log('formatted', formatted);
              this.dispatchMessage({
                data: formatted,
                timestamp: 0, // fake
                duration: 1, // fake
              }, [formatted.buffer]);
            }
          } else {
            // const data = mp3decoder.flush();
            // this.dispatchMessage({
            //   data,
            //   timestamp: 0, // fake
            //   duration: 1, // fake
            // }, [data.buffer]);
      
            this.dispatchMessage({
              data: null,
              timestamp: 0, // fake
              duration: 1, // fake
            });
      
            this.close();
          }
        });
      };
    };
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