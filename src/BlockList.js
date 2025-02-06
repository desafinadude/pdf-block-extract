import React, { useRef, useEffect, useState } from "react";
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { Scrollbars } from "react-custom-scrollbars";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faCopy, faEdit, faTable } from "@fortawesome/free-solid-svg-icons";


function BlockList({ blocks, renameBlock, deleteBlock, copyBlock, goToBlock, activeBlock, markAsTable }) {

	const [blockList, setBlockList] = useState([]);
	
	useEffect(() => {
		// Sort blocks by page number and then by y position
		let blocksSort = [...blocks].sort((a, b) => {
			if (a.page !== b.page) {
				return a.page - b.page;
			}
			return a.y - b.y;
		});
		setBlockList(blocksSort);
	}, [blocks]);

	return (
		<Scrollbars style={{ height: 500 }}>
		<Table className="block-list my-4">
			<thead>
				<tr>
					<th>Page</th>
					<th>Name</th>
					<th>X</th>
					<th>Y</th>
					<th>Width</th>
					<th>Height</th>
					<th></th>
				</tr>
			</thead>

			<tbody>
				{blockList.map((block) => (
					<tr key={block.uid} onClick={() => goToBlock(block)} className={activeBlock === block.uid ? "active-block" : "" }>
						<td>{block.page}</td>
						<td>{block.label}</td>
						<td>{block.x}</td>
						<td>{block.y}</td>
						<td>{block.width}</td>
						<td>{block.height}</td>
						<td>
							<Button onClick={() => deleteBlock(block.uid)} className="me-1" size="sm"><FontAwesomeIcon icon={faTrash} /></Button>
							<Button onClick={() => renameBlock(block)} className="me-1" size="sm"><FontAwesomeIcon icon={faEdit} /></Button>
							<Button onClick={() => copyBlock(block.uid)} className="me-1" size="sm"><FontAwesomeIcon icon={faCopy} /></Button>
							<Button onClick={() => markAsTable(block.uid)} size="sm" variant={`${block.table != undefined ? 'secondary' : 'primary'}`}><FontAwesomeIcon icon={faTable} /></Button>
						</td>
					</tr>
				))}
			</tbody>
		</Table>
		</Scrollbars>
	);
}

export default BlockList;
