import React from "react";
import * as pdfjsLib from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist";
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useEffect } from "react";


if (typeof window !== "undefined" && "Worker" in window) {
	GlobalWorkerOptions.workerPort = new Worker(
		new URL("/node_modules/pdfjs-dist/build/pdf.worker.js", import.meta.url),
		{ type: "module" }
	);
}



function Controls({ pdfDoc, setPdfDoc, pageNum, setPageNum, maxPages, exportBlocks }) {

	// add pageDown and pageUp keyboard functions
	useEffect(() => {
		const onKey = (e) => {
			if (e.key === "PageDown") {
				setPageNum((prev) => Math.min(maxPages, prev + 1));
			} else if (e.key === "PageUp") {
				setPageNum((prev) => Math.max(1, prev - 1));
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [setPageNum, maxPages]);



	return (
		<Row className="controls my-4">
			<Col>
				<span>Page {pageNum} of {maxPages}</span>
			</Col>
			<Col xs="auto">
				<Button onClick={() => setPageNum((prev) => Math.max(1, prev - 1))} className="me-1" size="sm">Previous Page</Button>
				<Button onClick={() => setPageNum((prev) => Math.min(maxPages, prev + 1))} className="me-1" size="sm">Next Page</Button>
				
			</Col>
			
		</Row>
	);
}

export default Controls;
