"use client";
import { useState, useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { Upload, CheckCircle, Loader2 } from 'lucide-react';

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState("Idle");
  const ffmpegRef = useRef(new FFmpeg());

  const load = async () => {
    setStatus("Loading Engine...");
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
    const ffmpeg = ffmpegRef.current;
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    setLoaded(true);
    setStatus("Engine Ready!");
  };

  const convertFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ffmpeg = ffmpegRef.current;
    setStatus("Converting...");

    await ffmpeg.writeFile('input', await fetchFile(file));
    // This command converts to .mp3 - you can change the extension!
    await ffmpeg.exec(['-i', 'input', 'output.mp3']); 

    const data = await ffmpeg.readFile('output.mp3');
    const url = URL.createObjectURL(new Blob([data as any], { type: 'audio/mp3' }));
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.mp3';
    a.click();
    setStatus("Done! File Downloaded.");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold mb-4">Free Web Converter</h1>
      <p className="mb-8 text-gray-400">Convert files privately in your browser for free.</p>

      {!loaded ? (
        <button onClick={load} className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg flex items-center gap-2">
          {status === "Loading Engine..." && <Loader2 className="animate-spin" />}
          Start Engine
        </button>
      ) : (
        <div className="bg-gray-800 p-10 rounded-2xl border-2 border-dashed border-gray-600 flex flex-col items-center">
          <Upload className="w-12 h-12 mb-4 text-blue-400" />
          <input type="file" onChange={convertFile} className="mb-4" />
          <p className="text-sm text-gray-500">{status}</p>
        </div>
      )}
    </div>
  );
}