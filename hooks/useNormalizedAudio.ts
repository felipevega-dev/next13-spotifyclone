// hooks/useNormalizedAudio.ts
import { useState, useEffect, useRef } from 'react';

const useNormalizedAudio = (url: string, targetLoudness = -14) => {
  const [normalizedUrl, setNormalizedUrl] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const normalizeAudio = async () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const context = audioContextRef.current;

      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await context.decodeAudioData(arrayBuffer);

      // Calculate the current loudness
      let sum = 0;
      const samples = audioBuffer.getChannelData(0);
      for (let i = 0; i < samples.length; i++) {
        sum += samples[i] * samples[i];
      }
      const rms = Math.sqrt(sum / samples.length);
      const currentLoudness = 20 * Math.log10(rms);

      // Calculate the necessary gain
      const gainChange = targetLoudness - currentLoudness;
      const gain = Math.pow(10, gainChange / 20);

      // Apply the gain
      const normalizedBuffer = context.createBuffer(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      );

      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const normalizedSamples = normalizedBuffer.getChannelData(channel);
        const originalSamples = audioBuffer.getChannelData(channel);
        for (let i = 0; i < audioBuffer.length; i++) {
          normalizedSamples[i] = originalSamples[i] * gain;
        }
      }

      // Convert the normalized buffer back to a Blob
      const offlineContext = new OfflineAudioContext(
        normalizedBuffer.numberOfChannels,
        normalizedBuffer.length,
        normalizedBuffer.sampleRate
      );
      const source = offlineContext.createBufferSource();
      source.buffer = normalizedBuffer;
      source.connect(offlineContext.destination);
      source.start();

      const renderedBuffer = await offlineContext.startRendering();
      const blob = await new Promise<Blob>((resolve) => {
        const chunks: Blob[] = [];
        const stream = (renderedBuffer as any).stream();
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (event) => {
          chunks.push(event.data);
        };
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
          resolve(blob);
        };
        mediaRecorder.start();
        setTimeout(() => mediaRecorder.stop(), 0);
      });

      setNormalizedUrl(URL.createObjectURL(blob));
    };

    normalizeAudio();

    return () => {
      if (normalizedUrl) {
        URL.revokeObjectURL(normalizedUrl);
      }
    };
  }, [url, targetLoudness]);

  return normalizedUrl;
};

export default useNormalizedAudio;