import React, { useEffect, useRef, useState } from "react";
import { Canvas, Textbox, Rect } from "fabric";

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const PREVIEW_WIDTH = 360;

const CoverPage = ({ data }) => {
    const canvasRef = useRef(null);

    const [canvas, setCanvas] = useState(null);
    const [editing, setEditing] = useState(false);
    const [selectedObject, setSelectedObject] = useState(null);

    // =====================================================
    // DEFAULT DATA
    // =====================================================

    const coverData = {
        courseCode: data?.courseCode || "N/A",
        courseTitle: data?.courseTitle || "N/A",
        topicName: data?.topicName || "N/A",

        teacherName: data?.teacherName || "N/A",
        teacherDesignation:
            data?.teacherDesignation || "N/A",
        teacherDept:
            data?.teacherDept || "CSE",

        name: data?.name || "N/A",
        id: data?.id || "N/A",
        section: data?.section || "N/A",
        semester: data?.semester || "N/A",

        department:
            data?.department ||
            "Computer Science and Engineering",

        date:
            data?.date ||
            new Date().toLocaleDateString("en-GB"),
    };

    // =====================================================
    // CREATE CANVAS
    // =====================================================

    useEffect(() => {
        if (!canvasRef.current) return;

        const fabricCanvas = new Canvas(
            canvasRef.current,
            {
                width: A4_WIDTH,
                height: A4_HEIGHT,
                backgroundColor: "white",
                preserveObjectStacking: true,
                selection: false,
            }
        );

        setCanvas(fabricCanvas);

        fabricCanvas.on(
            "selection:created",
            (e) => {
                setSelectedObject(
                    e.selected?.[0] || null
                );
            }
        );

        fabricCanvas.on(
            "selection:updated",
            (e) => {
                setSelectedObject(
                    e.selected?.[0] || null
                );
            }
        );

        fabricCanvas.on(
            "selection:cleared",
            () => {
                setSelectedObject(null);
            }
        );

        return () => {
            fabricCanvas.dispose();
        };
    }, []);

    // =====================================================
    // UPDATE COVER WHEN DATA CHANGES
    // =====================================================

    useEffect(() => {
        if (!canvas) return;

        canvas.clear();

        canvas.backgroundColor = "white";

        createCover(canvas, coverData);

        canvas.renderAll();

    }, [canvas, data]);

    // =====================================================
    // EDIT MODE
    // =====================================================

    useEffect(() => {
        if (!canvas) return;

        canvas.selection = editing;

        canvas.forEachObject((object) => {

            if (
                object.data?.type === "border" ||
                object.data?.type === "shape"
            ) {
                object.selectable = false;
                object.evented = false;
                return;
            }

            object.selectable = editing;
            object.evented = editing;
        });

        if (!editing) {
            canvas.discardActiveObject();
            setSelectedObject(null);
        }

        canvas.renderAll();

    }, [editing, canvas]);

    // =====================================================
    // ADD TEXT
    // =====================================================

    const addText = (
        fabricCanvas,
        text,
        left,
        top,
        options = {}
    ) => {

        const textbox = new Textbox(
            String(text ?? ""),
            {
                left,
                top,

                width:
                    options.width || 680,

                fontSize:
                    options.fontSize || 18,

                fontFamily: "Arial",

                fontWeight:
                    options.fontWeight || "normal",

                fill:
                    options.fill || "#111",

                originX:
                    options.originX || "left",

                underline:
                    options.underline || false,

                editable: true,

                padding: 4,

                transparentCorners: false,

                cornerColor: "#2563eb",

                cornerStrokeColor: "#2563eb",

                borderColor: "#2563eb",

                cornerSize: 8,

                selectable: false,

                evented: false,

                data: {
                    type: "text",
                },
            }
        );

        fabricCanvas.add(textbox);

        return textbox;
    };

    // =====================================================
    // CREATE COVER
    // =====================================================

    const createCover = (
        fabricCanvas,
        d
    ) => {

        // -------------------------------------------------
        // BORDER
        // -------------------------------------------------

        const border = new Rect({
            left: 12,
            top: 12,

            width: A4_WIDTH - 24,
            height: A4_HEIGHT - 24,

            fill: "transparent",

            stroke: "#222",

            strokeWidth: 2,

            selectable: false,
            evented: false,

            data: {
                type: "border",
            },
        });

        fabricCanvas.add(border);

        // -------------------------------------------------
        // UNIVERSITY
        // -------------------------------------------------

        addText(
            fabricCanvas,
            "DIU",
            397,
            55,
            {
                fontSize: 18,
                fontWeight: "bold",
                originX: "center",
                width: 100,
            }
        );

        addText(
            fabricCanvas,
            "DAFFODIL INTERNATIONAL UNIVERSITY",
            397,
            95,
            {
                fontSize: 22,
                fontWeight: "bold",
                originX: "center",
                width: 700,
            }
        );

        addText(
            fabricCanvas,
            `Department of ${
                d.department
            }`,
            397,
            130,
            {
                fontSize: 14,
                fill: "#64748b",
                originX: "center",
                width: 700,
            }
        );

        // -------------------------------------------------
        // ASSIGNMENT
        // -------------------------------------------------

        addText(
            fabricCanvas,
            "ASSIGNMENT",
            397,
            220,
            {
                fontSize: 26,
                fontWeight: "bold",
                underline: true,
                originX: "center",
                width: 300,
            }
        );

        // -------------------------------------------------
        // COURSE INFO
        // -------------------------------------------------

        addText(
            fabricCanvas,
            `Course Code: ${d.courseCode}`,
            60,
            285
        );

        addText(
            fabricCanvas,
            `Course Title: ${d.courseTitle}`,
            60,
            325
        );

        addText(
            fabricCanvas,
            `Topic Name: ${d.topicName}`,
            60,
            365
        );

        // -------------------------------------------------
        // SUBMITTED TO
        // -------------------------------------------------

        addText(
            fabricCanvas,
            "Submitted To",
            397,
            445,
            {
                fontSize: 22,
                fontWeight: "bold",
                underline: true,
                originX: "center",
                width: 300,
            }
        );

        addText(
            fabricCanvas,
            `Name: ${d.teacherName}`,
            60,
            500
        );

        addText(
            fabricCanvas,
            `Designation: ${d.teacherDesignation}`,
            60,
            540
        );

        addText(
            fabricCanvas,
            `Department: ${d.teacherDept}`,
            60,
            580
        );

        addText(
            fabricCanvas,
            "University: Daffodil International University",
            60,
            620
        );

        // -------------------------------------------------
        // SUBMITTED BY
        // -------------------------------------------------

        addText(
            fabricCanvas,
            "Submitted By",
            397,
            700,
            {
                fontSize: 22,
                fontWeight: "bold",
                underline: true,
                originX: "center",
                width: 300,
            }
        );

        addText(
            fabricCanvas,
            `Name: ${d.name}`,
            60,
            755
        );

        addText(
            fabricCanvas,
            `ID: ${d.id}`,
            60,
            795
        );

        addText(
            fabricCanvas,
            `Section: ${d.section}`,
            60,
            835
        );

        addText(
            fabricCanvas,
            `Semester: ${d.semester}`,
            60,
            875
        );

        // -------------------------------------------------
        // DATE
        // -------------------------------------------------

        const dateBox = new Rect({
            left: 195,
            top: 950,

            width: 405,
            height: 50,

            rx: 25,
            ry: 25,

            fill: "white",

            stroke: "#64748b",

            strokeWidth: 2,

            selectable: false,
            evented: false,

            data: {
                type: "shape",
            },
        });

        fabricCanvas.add(dateBox);

        addText(
            fabricCanvas,
            `Date of Submission: ${d.date}`,
            397,
            965,
            {
                fontSize: 16,
                fontWeight: "bold",
                originX: "center",
                width: 380,
            }
        );

        fabricCanvas.renderAll();
    };

    // =====================================================
    // DELETE
    // =====================================================

    const handleDelete = () => {

        if (!canvas || !selectedObject) return;

        if (
            selectedObject.data?.type ===
                "border" ||
            selectedObject.data?.type ===
                "shape"
        ) {
            return;
        }

        canvas.remove(selectedObject);

        canvas.discardActiveObject();

        setSelectedObject(null);

        canvas.renderAll();
    };

    // =====================================================
    // DOWNLOAD
    // =====================================================

    const handleDownload = () => {

        if (!canvas) return;

        canvas.discardActiveObject();

        canvas.renderAll();

        const dataURL =
            canvas.toDataURL({
                format: "png",
                multiplier: 2,
            });

        const link =
            document.createElement("a");

        link.href = dataURL;

        link.download =
            "assignment-cover-page.png";

        link.click();
    };

    // =====================================================
    // PREVIEW SIZE
    // =====================================================

    const previewHeight =
        PREVIEW_WIDTH *
        (A4_HEIGHT / A4_WIDTH);

    // =====================================================
    // UI
    // =====================================================

    return (
        <div className="w-full">

            {/* TOOLBAR */}

            <div className="flex items-center gap-2 mb-3">

                <button
                    onClick={() =>
                        setEditing(!editing)
                    }
                    className="
                        px-3 py-1.5
                        rounded-lg
                        bg-slate-800
                        text-white
                        text-xs
                        font-medium
                        hover:bg-slate-700
                        cursor-pointer
                    "
                >
                    {editing
                        ? "Done"
                        : "Edit"}
                </button>

                {editing && (
                    <button
                        onClick={
                            handleDelete
                        }
                        disabled={
                            !selectedObject
                        }
                        className="
                            px-3 py-1.5
                            rounded-lg
                            bg-red-500
                            text-white
                            text-xs
                            disabled:opacity-40
                            cursor-pointer
                        "
                    >
                        Delete
                    </button>
                )}

                <button
                    onClick={
                        handleDownload
                    }
                    className="
                        ml-auto
                        px-3 py-1.5
                        rounded-lg
                        bg-blue-600
                        text-white
                        text-xs
                        font-medium
                        hover:bg-blue-700
                        cursor-pointer
                    "
                >
                    Download
                </button>

            </div>

            {/* A4 PREVIEW */}

            <div
                className="w-full flex justify-center overflow-hidden"
                style={{
                    height:
                        `${previewHeight}px`,
                }}
            >

                <div
                    style={{
                        width:
                            `${A4_WIDTH}px`,

                        height:
                            `${A4_HEIGHT}px`,

                        transform:
                            `scale(${
                                PREVIEW_WIDTH /
                                A4_WIDTH
                            })`,

                        transformOrigin:
                            "top center",

                        flexShrink: 0,
                    }}
                >

                    <canvas
                        ref={canvasRef}
                        width={A4_WIDTH}
                        height={A4_HEIGHT}
                        className="block"
                    />

                </div>

            </div>

        </div>
    );
};

export default CoverPage;