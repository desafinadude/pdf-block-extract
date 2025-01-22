import React from "react";
import * as pdfjsLib from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist";


if (typeof window !== 'undefined' && 'Worker' in window) {
  GlobalWorkerOptions.workerPort = new Worker(
    new URL('/node_modules/pdfjs-dist/build/pdf.worker.js', import.meta.url),
    { type: 'module' },
  );
}

function Controls({ pdfDoc, setPdfDoc, pageNum, setPageNum, maxPages, exportBlocks }) {
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        const pdfData = new Uint8Array(reader.result);
        const doc = await pdfjsLib.getDocument(pdfData).promise;
        setPdfDoc(doc);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div className="controls">
      <input type="file" onChange={handleFileUpload} />
      <button onClick={() => setPageNum((prev) => Math.max(1, prev - 1))}>Previous Page</button>
      <button onClick={() => setPageNum((prev) => Math.min(maxPages, prev + 1))}>Next Page</button>
      <button onClick={exportBlocks}>Export Blocks</button>
    </div>
  );
}

export default Controls;
