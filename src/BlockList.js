import React from "react";
import Table from 'react-bootstrap/Table';

function BlockList({ blocks, renameBlock, deleteBlock, copyBlock }) {
	return (
		<Table className="block-list mt-4">
			<thead>
				<tr>
					<th>Name</th>
					<th>X</th>
					<th>Y</th>
					<th>Width</th>
					<th>Height</th>
					<th></th>
				</tr>
			</thead>

			<tbody>
				{blocks.map((block, index) => (
					<tr key={index}>
						<td>{block.label}</td>
						<td>{block.x}</td>
						<td>{block.y}</td>
						<td>{block.width}</td>
						<td>{block.height}</td>
						<td>
							<button onClick={() => deleteBlock(block, index)}>Delete</button>
							<button onClick={() => renameBlock(block, index)}>Rename</button>
							<button onClick={() => copyBlock(index)}>Copy</button>
						</td>
					</tr>
				))}
			</tbody>
		</Table>
	);
}

export default BlockList;
