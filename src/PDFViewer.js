import React, { useRef, useEffect, useState } from "react";
import interact from "interactjs";

function PDFViewer({ pdfDoc, pageNum, blocks, setBlocks }) {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startCoords, setStartCoords] = useState(null);
    const [altPressed, setAltPressed] = useState(false); // Tracks Alt key status

    // Filter blocks for the current page
    const blocksForPage = blocks.filter((block) => block.page === pageNum);

    // Render PDF page
    useEffect(() => {
        if (pdfDoc && pageNum && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            pdfDoc.getPage(pageNum).then((page) => {
                const viewport = page.getViewport({ scale: 1.5 });
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const renderContext = {
                    canvasContext: ctx,
                    viewport,
                };
                page.render(renderContext);
            });
        }
    }, [pdfDoc, pageNum]);

    // Sync container dimensions with canvas dimensions
    useEffect(() => {
        const pdfCanvas = canvasRef.current;
        const container = containerRef.current;

        if (pdfCanvas && container) {
            container.style.width = `${pdfCanvas.width}px`;
            container.style.height = `${pdfCanvas.height}px`;
        }
    }, [pageNum]);

    // Setup Interact.js for resizing and moving
    useEffect(() => {
        if (!containerRef.current) return;

        const interactable = interact(".block");

        if (altPressed) {
            interactable
                .draggable({
                    listeners: {
                        move(event) {
                            const { target } = event;
                            const uid = target.dataset.uid;

                            setBlocks((prev) =>
                                prev.map((block) =>
                                    block.uid === uid
                                        ? {
                                            ...block,
                                            x: parseFloat(target.style.left) + event.dx,
                                            y: parseFloat(target.style.top) + event.dy,
                                        }
                                        : block
                                )
                            );
                        },
                    },
                    modifiers: [
                        interact.modifiers.restrict({
                            restriction: containerRef.current,
                            endOnly: true,
                        }),
                    ],
                })
                .resizable({
                    edges: { left: true, right: true, bottom: true, top: true },
                    listeners: {
                        move(event) {
                            const { target } = event;
                            const uid = target.dataset.uid;

                            const deltaLeft = event.deltaRect.left || 0;
                            const deltaTop = event.deltaRect.top || 0;

                            setBlocks((prev) =>
                                prev.map((block) =>
                                    block.uid === uid
                                        ? {
                                            ...block,
                                            x: block.x + deltaLeft, // Adjust x for left resizing
                                            y: block.y + deltaTop, // Adjust y for top resizing
                                            width: event.rect.width,
                                            height: event.rect.height,
                                        }
                                        : block
                                )
                            );

                            // Apply the changes to the element's style
                            target.style.width = `${event.rect.width}px`;
                            target.style.height = `${event.rect.height}px`;
                            target.style.left = `${parseFloat(target.style.left) + deltaLeft}px`;
                            target.style.top = `${parseFloat(target.style.top) + deltaTop}px`;
                        },
                    },

                });
        } else {
            interactable.draggable(false).resizable(false); // Disable interactions
        }
    }, [altPressed, pageNum, setBlocks]);

    // Keydown and Keyup listeners for Alt key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Alt") setAltPressed(true);
        };

        const handleKeyUp = (e) => {
            if (e.key === "Alt") setAltPressed(false);
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    const handleMouseDown = (e) => {
        if (altPressed) return; // Skip drawing when Alt is pressed

        const rect = containerRef.current.getBoundingClientRect();
        const startX = e.clientX - rect.left;
        const startY = e.clientY - rect.top;

        setIsDrawing(true);
        setStartCoords({ x: startX, y: startY });
    };

    const handleMouseMove = (e) => {
        if (!isDrawing || !startCoords || altPressed) return; // Skip drawing when Alt is pressed

        const rect = containerRef.current.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;

        const overlay = containerRef.current;
        const existingBlock = overlay.querySelector(".drawing-block");
        if (existingBlock) {
            existingBlock.style.left = `${Math.min(startCoords.x, currentX)}px`;
            existingBlock.style.top = `${Math.min(startCoords.y, currentY)}px`;
            existingBlock.style.width = `${Math.abs(currentX - startCoords.x)}px`;
            existingBlock.style.height = `${Math.abs(currentY - startCoords.y)}px`;
        } else {
            const block = document.createElement("div");
            block.className = "drawing-block";
            block.style.position = "absolute";
            block.style.border = "2px dashed blue";
            block.style.background = "rgba(0, 0, 255, 0.1)";
            overlay.appendChild(block);
        }
    };

    const handleMouseUp = (e) => {
        if (!isDrawing || !startCoords || altPressed) return; // Skip drawing when Alt is pressed

        const rect = containerRef.current.getBoundingClientRect();
        const endX = e.clientX - rect.left;
        const endY = e.clientY - rect.top;

        const x = Math.min(startCoords.x, endX);
        const y = Math.min(startCoords.y, endY);
        const width = Math.abs(endX - startCoords.x);
        const height = Math.abs(endY - startCoords.y);

        setIsDrawing(false);
        setStartCoords(null);

        if (width > 0 && height > 0) {
            setBlocks((prev) => [
                ...prev,
                { page: pageNum, x, y, width, height, uid: crypto.randomUUID() },
            ]);

            const overlay = containerRef.current;
            const existingBlock = overlay.querySelector(".drawing-block");
            if (existingBlock) {
                overlay.removeChild(existingBlock);
            }
        }
    };

    return (
        <div className="pdf-viewer" style={{ position: "relative" }}>
            <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0 }} />

            <div
                className="draw-canvas"
                ref={containerRef}
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    pointerEvents: "auto",
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            >
                {blocksForPage.map((block) => (
                    <div
                        key={block.uid}
                        data-uid={block.uid}
                        className={`block ${block.label}`}
                        style={{
                            position: "absolute",
                            left: `${block.x}px`,
                            top: `${block.y}px`,
                            width: `${block.width}px`,
                            height: `${block.height}px`,
                            border: "2px solid red",
                            display: "flex",
                            flexDirection: "column"
                        }}
                    >
                        <div className="block-label">{block.label}</div>

                        {/* Draw Table Inside Block */}
                        {block.table && (
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: `repeat(${block.table.cols}, 1fr)`,
                                gridTemplateRows: `repeat(${block.table.rows}, 1fr)`,
                                width: "100%",
                                height: "100%"
                            }}>
                                {block.table.data.flat().map((_, i) => (
                                    <div key={i} style={{
                                        border: "1px solid black",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "12px"
                                    }}>
                                        {i + 1}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PDFViewer;
