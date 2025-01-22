import React, { useRef, useEffect, useState } from "react";
import interact from "interactjs";

function PDFViewer({ pdfDoc, pageNum, blocksByPage, setBlocksByPage }) {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startCoords, setStartCoords] = useState(null);
    const [altPressed, setAltPressed] = useState(false); // Tracks Alt key status
    const blocks = blocksByPage[pageNum] || [];

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

    // Setup Interact.js for resizing and moving, and enable/disable based on Alt key
    useEffect(() => {
        if (!containerRef.current) return;

        const interactable = interact(".block");

        if (altPressed) {
            interactable
                .draggable({
                    listeners: {
                        move(event) {
                            const { target } = event;
                            const blockIndex = target.dataset.index;

                            setBlocksByPage((prev) => {
                                const updatedBlocks = [...prev[pageNum]];
                                updatedBlocks[blockIndex] = {
                                    ...updatedBlocks[blockIndex],
                                    x: parseFloat(target.style.left) + event.dx,
                                    y: parseFloat(target.style.top) + event.dy,
                                };
                                return { ...prev, [pageNum]: updatedBlocks };
                            });
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
                            const blockIndex = target.dataset.index;

                            setBlocksByPage((prev) => {
                                const updatedBlocks = [...prev[pageNum]];
                                const block = updatedBlocks[blockIndex];
                                updatedBlocks[blockIndex] = {
                                    ...block,
                                    x: parseFloat(target.style.left),
                                    y: parseFloat(target.style.top),
                                    width: event.rect.width,
                                    height: event.rect.height,
                                };
                                return { ...prev, [pageNum]: updatedBlocks };
                            });

                            target.style.width = `${event.rect.width}px`;
                            target.style.height = `${event.rect.height}px`;
                        },
                    },
                });
        } else {
            interactable.draggable(false).resizable(false); // Disable interactions
        }
    }, [altPressed, pageNum, setBlocksByPage]);

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
            setBlocksByPage((prev) => {
                const updatedBlocks = [...(prev[pageNum] || [])];
                updatedBlocks.push({ x, y, width, height });
                return { ...prev, [pageNum]: updatedBlocks };
            });

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
                {blocks.map((block, index) => (
                    <div
                        key={index}
                        data-index={index}
                        className="block"
                        style={{
                            position: "absolute",
                            left: `${block.x}px`,
                            top: `${block.y}px`,
                            width: `${block.width}px`,
                            height: `${block.height}px`,
                            border: "2px solid red",
                            background: "rgba(255, 0, 0, 0.1)",
                        }}
                    >
                        {block.label}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PDFViewer;
