import React, { useState, useRef, useEffect } from "react";
import { createRoot } from 'react-dom/client';
import PDFViewer from "./PDFViewer";
import BlockList from "./BlockList";
import Controls from "./Controls";
import './app.scss';

function App() {
	const [pdfDoc, setPdfDoc] = useState(null); // PDF document object
	const [pageNum, setPageNum] = useState(1); // Current page
	const [blocksByPage, setBlocksByPage] = useState({}); // Blocks for all pages

	const addBlock = (block) => {
		setBlocksByPage((prev) => {
			const currentBlocks = prev[pageNum] || [];
			return {
				...prev,
				[pageNum]: [...currentBlocks, block],
			};
		});
	};

	const updateBlock = (index, updatedBlock) => {
		setBlocksByPage((prev) => {
			const currentBlocks = prev[pageNum] || [];
			const newBlocks = [...currentBlocks];
			newBlocks[index] = updatedBlock;
			return { ...prev, [pageNum]: newBlocks };
		});
	};

	const deleteBlock = (index) => {
		setBlocksByPage((prev) => {
			const currentBlocks = prev[pageNum] || [];
			const newBlocks = currentBlocks.filter((_, i) => i !== index);
			return { ...prev, [pageNum]: newBlocks };
		});
	};

	const exportBlocks = () => {
		const output = JSON.stringify(blocksByPage, null, 2);
		const blob = new Blob([output], { type: "application/json" });
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = "blocks.json";
		link.click();
	};

	return (
		<div className="App">

			<Controls
				pdfDoc={pdfDoc}
				setPdfDoc={setPdfDoc}
				pageNum={pageNum}
				setPageNum={setPageNum}
				maxPages={pdfDoc ? pdfDoc.numPages : 0}
				exportBlocks={exportBlocks}
			/>
			<BlockList
				blocks={blocksByPage[pageNum] || []}
				updateBlock={updateBlock}
				deleteBlock={deleteBlock}
			/>
			<div className="viewer-container">
				<PDFViewer
					pdfDoc={pdfDoc}
					pageNum={pageNum}
					blocksByPage={blocksByPage}
					setBlocksByPage={setBlocksByPage}
				/>

			</div>
		</div>
	);
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
