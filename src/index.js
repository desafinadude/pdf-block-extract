import React, { useState, useRef, useEffect } from "react";
import { createRoot } from 'react-dom/client';
import PDFViewer from "./PDFViewer";
import BlockList from "./BlockList";
import Controls from "./Controls";

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';


import './app.scss';

function App() {
	const [pdfDoc, setPdfDoc] = useState(null); // PDF document object
	const [pageNum, setPageNum] = useState(1); // Current page
	const [blocksByPage, setBlocksByPage] = useState({}); // Blocks for all pages

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

	const addBlock = (block) => {
		setBlocksByPage((prev) => {
			const currentBlocks = prev[pageNum] || [];
			return {
				...prev,
				[pageNum]: [...currentBlocks, block],
			};
		});
	};

	const renameBlock = (block,index) => {
		const newLabel = prompt("Rename Block:", block.label);
		if (newLabel) {
			updateBlock(index, { ...block, label: newLabel });
		}
	}
	

	const updateBlock = (index, updatedBlock) => {
		setBlocksByPage((prev) => {
			const currentBlocks = prev[pageNum] || [];
			const newBlocks = [...currentBlocks];
			newBlocks[index] = updatedBlock;
			return { ...prev, [pageNum]: newBlocks };
		});
	};

	const deleteBlock = (block,index) => {
		setBlocksByPage((prev) => {
			const currentBlocks = prev[pageNum] || [];
			const newBlocks = currentBlocks.filter((_, i) => i !== index);
			return { ...prev, [pageNum]: newBlocks };
		});
	};

	const copyBlock = (index) => {
		console.log("copyBlock", index);
	};

	const exportBlocks = () => {
		const output = JSON.stringify(blocksByPage, null, 2);
		const blob = new Blob([output], { type: "application/json" });
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = "blocks.json";
		link.click();
	};

	useEffect(() => {
		console.log(blocksByPage);
	},[blocksByPage]);

	return (
		<div className="App">
			<Container>
				<Row>
					<Col>
						
					</Col>
				</Row>

				<Row>
					<Col>
						<input type="file" onChange={handleFileUpload} />
						<button onClick={exportBlocks}>Export</button>
						<BlockList
							blocks={blocksByPage[pageNum] || []}
							renameBlock={renameBlock}
							deleteBlock={deleteBlock}
							copyBlock={copyBlock}
						/>
						<pre>
							{JSON.stringify(blocksByPage, null, 2)}
						</pre>
					</Col>
					<Col>
						<Controls
							pdfDoc={pdfDoc}
							setPdfDoc={setPdfDoc}
							pageNum={pageNum}
							setPageNum={setPageNum}
							maxPages={pdfDoc ? pdfDoc.numPages : 0}
							exportBlocks={exportBlocks}
						/>
						<div className="viewer-container">
							<PDFViewer
								pdfDoc={pdfDoc}
								pageNum={pageNum}
								blocksByPage={blocksByPage}
								setBlocksByPage={setBlocksByPage}
							/>
						</div>
					</Col>
				</Row>

			</Container>

			
			
			
		</div>
	);
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
