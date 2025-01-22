import React from "react";

function BlockList({ blocks, updateBlock, deleteBlock }) {
  return (
    <div className="block-list">
      <h3>Blocks</h3>
      <ul>
        {blocks.map((block, index) => (
          <li key={index}>
            <span>{block.label}</span>
            <button onClick={() => deleteBlock(index)}>Delete</button>
            <button
              onClick={() => {
                const newLabel = prompt("Rename Block:", block.label);
                if (newLabel) {
                  updateBlock(index, { ...block, label: newLabel });
                }
              }}
            >
              Rename
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BlockList;
