import React, { useEffect, useState } from "react";
import { createRoot } from 'react-dom/client';
import PDFViewer from "./PDFViewer";
import BlockList from "./BlockList";
import Controls from "./Controls";

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import './app.scss';

function App() {
	const [pdfDoc, setPdfDoc] = useState(null); 
	const [pageNum, setPageNum] = useState(1);
	const [blocks, setBlocks] = useState([]);
	const [activeBlock, setActiveBlock] = useState(null);

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

	const handleLoadBlocks = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				try {
					const loadedBlocks = JSON.parse(reader.result);
					if (Array.isArray(loadedBlocks)) {
						setBlocks(loadedBlocks);
					} else {
						alert("Invalid file format: Expected an array of blocks.");
					}
				} catch (error) {
					alert("Error loading JSON file: " + error.message);
				}
			};
			reader.readAsText(file);
		}
	};

	const addBlock = (block) => {
		setBlocks((prev) => [
			...prev,
			{ ...block, page: pageNum, uid: crypto.randomUUID() },
		]);
	};

	const renameBlock = (block) => {
		const newLabel = prompt("Rename Block:", block.label);
		if (newLabel) {
			updateBlock(block.uid, { ...block, label: newLabel });
		}
	};

	const updateBlock = (uid, updatedBlock) => {
		setBlocks((prev) =>
			prev.map((block) => (block.uid === uid ? updatedBlock : block))
		);
	};

	const deleteBlock = (uid) => {
		setBlocks((prev) => prev.filter((block) => block.uid !== uid));
		setActiveBlock(null);
	};

	const markAsTable = (uid) => {
		const block = blocks.find((block) => block.uid === uid);
		if (block.table) {
			if (window.confirm("Clear table data?")) {
				setBlocks((prev) =>
					prev.map((b) =>
						b.uid === uid ? { ...b, table: undefined } : b
					)
				);
			}
			return;
		}
	
		// Prompt for row and column count
		const rows = parseInt(prompt("Number of rows:", 3), 10);
		const cols = parseInt(prompt("Number of columns:", 3), 10);
		if (!rows || !cols) return;
	
		// Generate column and row structure
		const tableData = Array.from({ length: rows }, () =>
			Array(cols).fill("")
		);
	
		setBlocks((prev) =>
			prev.map((b) =>
				b.uid === uid ? { ...b, table: { rows, cols, data: tableData } } : b
			)
		);
	};

	const copyBlock = (uid) => {
		const blockToCopy = blocks.find((block) => block.uid === uid);
		if (!blockToCopy) return;

		let pageRange;
		const range = prompt("Copy Block To (e.g., '2' or '2-4'):", pageRange);
		if (range) {
			if (range.includes("-")) {
				const [start, end] = range.split("-").map(Number);
				pageRange = Array.from({ length: end - start + 1 }, (_, i) => i + start);
			} else {
				pageRange = [parseInt(range, 10)];
			}

			pageRange.forEach((page) => {
				setBlocks((prev) => [
					...prev,
					{ ...blockToCopy, page, uid: crypto.randomUUID() },
				]);
			});
		}
		setActiveBlock(null);
	};

	const exportBlocks = () => {
		const output = JSON.stringify(blocks, null, 2);
		const blob = new Blob([output], { type: "application/json" });
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = "blocks.json";
		link.click();
		setActiveBlock(null);
	};

	const goToBlock = (block) => {
		setPageNum(block.page);
		setActiveBlock(block.uid);
	}

	useEffect(() => {
		console.log(blocks);
	}, [blocks]);

	return (
		<div className="App">
			<Container>
				

				<Row className="mt-4">
					<Col>
						<Row>
							<Col>
								<Form.Control type="file" size="sm" onChange={handleFileUpload}/>
								<Form.Control type="file" size="sm"  onChange={handleLoadBlocks}/>
							</Col>
							<Col><Button onClick={exportBlocks}  size="sm">Export</Button></Col>	
						</Row>						
						
						

						<BlockList
							blocks={blocks || []}
							renameBlock={renameBlock}
							deleteBlock={deleteBlock}
							copyBlock={copyBlock}
							goToBlock={goToBlock}
							activeBlock={activeBlock}
							markAsTable={markAsTable}
						/>
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
								blocks={blocks}
								setBlocks={setBlocks}
								activeBlock={activeBlock}
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
