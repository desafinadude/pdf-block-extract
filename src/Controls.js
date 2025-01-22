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
	

	return (
		<div className="controls">
			
			<button onClick={() => setPageNum((prev) => Math.max(1, prev - 1))}>Previous Page</button>
			<button onClick={() => setPageNum((prev) => Math.min(maxPages, prev + 1))}>Next Page</button>

		</div>
	);
}

export default Controls;
