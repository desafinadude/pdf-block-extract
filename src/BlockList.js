import React from "react";

function BlockList({ blocks, renameBlock, deleteBlock, copyBlock }) {
  return (
    <div className="block-list">
      <h3>Blocks</h3>
      <ul>
        {blocks.map((block, index) => (
          <li key={index}>
            <span>{block.label}</span>
            <button onClick={() => deleteBlock(block,index)}>Delete</button>
            <button onClick={() => renameBlock(block,index)}>Rename</button>
            <button onClick={() => copyBlock(index)}>Copy</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BlockList;
