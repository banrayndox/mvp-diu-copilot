import React, { useEffect, useRef, useState } from "react";
import { Canvas, Textbox, Rect, FabricImage } from "fabric";
import { jsPDF } from "jspdf";
import { Download, FileDown, Edit3, Check, Trash2, GraduationCap } from "lucide-react";
import diuLogo from "../assets/diu-logo.png";

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const MAX_DISPLAY_WIDTH = 480;

const CoverPage = ({ data }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    const [canvas, setCanvas] = useState(null);
    const [editing, setEditing] = useState(false);
    const [selectedObject, setSelectedObject] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);

    // Normalize incoming data with sensible DIU defaults
    const coverData = {
        courseCode: data?.courseCode || "CSE 221",
        courseTitle: data?.courseTitle || "Object Oriented Programming",
        topicName: data?.topicName || "Assignment 01",
        teacherName: data?.teacherName || "Course Teacher",
        teacherDesignation: data?.teacherDesignation || "Assistant Professor",
        teacherDept: data?.teacherDept || "Department of CSE",
        name: data?.name || "Student Name",
        id: data?.id || "XX-XXXXX-X",
        section: data?.section || "A",
        semester: data?.semester ? `${data.semester}th` : "N/A",
        department: data?.department ? `Department of ${data.department}` : "Department of Computer Science and Engineering",
        date: data?.date || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
    };

    // Responsive Canvas Resize
    const resizeCanvas = (fabricCanvas) => {
        if (!fabricCanvas || !containerRef.current) return;
        const availableWidth = containerRef.current.clientWidth - 24;
        const displayWidth = Math.min(MAX_DISPLAY_WIDTH, Math.max(280, availableWidth));
        const scale = displayWidth / A4_WIDTH;
        const displayHeight = A4_HEIGHT * scale;

        fabricCanvas.setDimensions(
            { width: displayWidth, height: displayHeight },
            { cssOnly: true }
        );
        fabricCanvas.setViewportTransform([scale, 0, 0, scale, 0, 0]);
        fabricCanvas.renderAll();
    };

    // Initialize Canvas
    useEffect(() => {
        if (!canvasRef.current) return;

        const fabricCanvas = new Canvas(canvasRef.current, {
            width: A4_WIDTH,
            height: A4_HEIGHT,
            backgroundColor: "#ffffff",
            preserveObjectStacking: true,
            selection: false
        });

        setCanvas(fabricCanvas);

        fabricCanvas.on("selection:created", (e) => setSelectedObject(e.selected?.[0] || null));
        fabricCanvas.on("selection:updated", (e) => setSelectedObject(e.selected?.[0] || null));
        fabricCanvas.on("selection:cleared", () => setSelectedObject(null));

        const handleResize = () => resizeCanvas(fabricCanvas);
        window.addEventListener("resize", handleResize);

        // Initial setup
        renderCover(fabricCanvas, coverData);
        requestAnimationFrame(() => resizeCanvas(fabricCanvas));

        return () => {
            window.removeEventListener("resize", handleResize);
            fabricCanvas.dispose();
        };
    }, []);

    // Re-render when data changes
    useEffect(() => {
        if (!canvas) return;
        renderCover(canvas, coverData);
        resizeCanvas(canvas);
    }, [canvas, data]);

    // Handle Edit Mode Toggle
    useEffect(() => {
        if (!canvas) return;
        canvas.selection = editing;
        canvas.forEachObject((obj) => {
            if (obj.data?.type === "border" || obj.data?.type === "logo" || obj.data?.type === "shape") {
                obj.selectable = false;
                obj.evented = false;
                return;
            }
            obj.selectable = editing;
            obj.evented = editing;
        });

        if (!editing) {
            canvas.discardActiveObject();
            setSelectedObject(null);
        }
        canvas.renderAll();
    }, [editing, canvas]);

    const addText = (fabricCanvas, text, left, top, options = {}) => {
        const textbox = new Textbox(String(text ?? ""), {
            left,
            top,
            width: options.width || 680,
            fontSize: options.fontSize || 16,
            fontFamily: options.fontFamily || "Arial",
            fontWeight: options.fontWeight || "normal",
            fill: options.fill || "#1e293b",
            originX: options.originX || "left",
            textAlign: options.textAlign || "left",
            underline: options.underline || false,
            editable: true,
            padding: 4,
            selectable: false,
            evented: false,
            data: { type: "text" }
        });
        fabricCanvas.add(textbox);
        return textbox;
    };

    const renderCover = async (fabricCanvas, d) => {
        fabricCanvas.clear();
        fabricCanvas.backgroundColor = "#ffffff";

        // Outer & Inner Academic Borders
        const outerBorder = new Rect({
            left: 16,
            top: 16,
            width: A4_WIDTH - 32,
            height: A4_HEIGHT - 32,
            fill: "transparent",
            stroke: "#1e3a8a",
            strokeWidth: 2.5,
            selectable: false,
            evented: false,
            data: { type: "border" }
        });
        fabricCanvas.add(outerBorder);

        const innerBorder = new Rect({
            left: 22,
            top: 22,
            width: A4_WIDTH - 44,
            height: A4_HEIGHT - 44,
            fill: "transparent",
            stroke: "#94a3b8",
            strokeWidth: 1,
            selectable: false,
            evented: false,
            data: { type: "border" }
        });
        fabricCanvas.add(innerBorder);

        // DIU Logo
        try {
            const img = await FabricImage.fromURL(diuLogo, { crossOrigin: "anonymous" });
            const desiredWidth = 140;
            const scale = desiredWidth / img.width;
            img.set({
                left: A4_WIDTH / 2,
                top: 48,
                originX: "center",
                scaleX: scale,
                scaleY: scale,
                selectable: false,
                evented: false,
                data: { type: "logo" }
            });
            fabricCanvas.add(img);
        } catch (e) {
            console.warn("Could not load DIU logo, falling back to text emblem", e);
            addText(fabricCanvas, "DIU", A4_WIDTH / 2, 50, {
                fontSize: 28,
                fontWeight: "bold",
                fill: "#1e3a8a",
                originX: "center",
                textAlign: "center"
            });
        }

        // University Header
        addText(fabricCanvas, "DAFFODIL INTERNATIONAL UNIVERSITY", A4_WIDTH / 2, 135, {
            fontSize: 22,
            fontWeight: "bold",
            fill: "#1e3a8a",
            originX: "center",
            textAlign: "center",
            width: 700
        });

        addText(fabricCanvas, d.department, A4_WIDTH / 2, 168, {
            fontSize: 14,
            fontWeight: "500",
            fill: "#475569",
            originX: "center",
            textAlign: "center",
            width: 700
        });

        // Assignment Title Banner
        const titleBadge = new Rect({
            left: A4_WIDTH / 2 - 160,
            top: 225,
            width: 320,
            height: 48,
            rx: 6,
            ry: 6,
            fill: "#f8fafc",
            stroke: "#cbd5e1",
            strokeWidth: 1.5,
            selectable: false,
            evented: false,
            data: { type: "shape" }
        });
        fabricCanvas.add(titleBadge);

        addText(fabricCanvas, "ASSIGNMENT", A4_WIDTH / 2, 236, {
            fontSize: 20,
            fontWeight: "bold",
            fill: "#0f172a",
            originX: "center",
            textAlign: "center",
            width: 300
        });

        // Course Info Section Box
        const courseBox = new Rect({
            left: 55,
            top: 300,
            width: A4_WIDTH - 110,
            height: 130,
            rx: 8,
            ry: 8,
            fill: "#f8fafc",
            stroke: "#e2e8f0",
            strokeWidth: 1.5,
            selectable: false,
            evented: false,
            data: { type: "shape" }
        });
        fabricCanvas.add(courseBox);

        addText(fabricCanvas, `Course Code: ${d.courseCode}`, 75, 320, {
            fontSize: 15,
            fontWeight: "bold",
            fill: "#1e293b"
        });

        addText(fabricCanvas, `Course Title: ${d.courseTitle}`, 75, 355, {
            fontSize: 15,
            fontWeight: "bold",
            fill: "#1e293b",
            width: 630
        });

        addText(fabricCanvas, `Topic Name: ${d.topicName}`, 75, 390, {
            fontSize: 15,
            fontWeight: "bold",
            fill: "#0f766e",
            width: 630
        });

        // Submitted To Section
        addText(fabricCanvas, "Submitted To", 80, 475, {
            fontSize: 18,
            fontWeight: "bold",
            fill: "#1e3a8a",
            underline: true
        });

        addText(fabricCanvas, `Name: ${d.teacherName}`, 80, 515, { fontSize: 15, fontWeight: "600" });
        addText(fabricCanvas, `Designation: ${d.teacherDesignation}`, 80, 548, { fontSize: 14, fill: "#334155" });
        addText(fabricCanvas, `Department: ${d.teacherDept}`, 80, 580, { fontSize: 14, fill: "#334155" });
        addText(fabricCanvas, "University: Daffodil International University", 80, 612, { fontSize: 14, fill: "#334155" });

        // Submitted By Section
        addText(fabricCanvas, "Submitted By", 80, 680, {
            fontSize: 18,
            fontWeight: "bold",
            fill: "#1e3a8a",
            underline: true
        });

        addText(fabricCanvas, `Name: ${d.name}`, 80, 720, { fontSize: 15, fontWeight: "600" });
        addText(fabricCanvas, `Student ID: ${d.id}`, 80, 755, { fontSize: 14, fontWeight: "bold", fill: "#0369a1" });
        addText(fabricCanvas, `Section: ${d.section}`, 80, 790, { fontSize: 14, fill: "#334155" });
        addText(fabricCanvas, `Semester: ${d.semester}`, 80, 825, { fontSize: 14, fill: "#334155" });
        addText(fabricCanvas, `Department: ${d.department}`, 80, 860, { fontSize: 14, fill: "#334155" });

        // Date of Submission Pill
        const dateBox = new Rect({
            left: A4_WIDTH / 2 - 180,
            top: 940,
            width: 360,
            height: 48,
            rx: 24,
            ry: 24,
            fill: "#f0fdf4",
            stroke: "#16a34a",
            strokeWidth: 1.5,
            selectable: false,
            evented: false,
            data: { type: "shape" }
        });
        fabricCanvas.add(dateBox);

        addText(fabricCanvas, `Date of Submission: ${d.date}`, A4_WIDTH / 2, 953, {
            fontSize: 15,
            fontWeight: "bold",
            fill: "#15803d",
            originX: "center",
            textAlign: "center",
            width: 340
        });

        fabricCanvas.renderAll();
    };

    // Direct PDF Export using jsPDF
    const handleDownloadPDF = async () => {
        if (!canvas) return;
        try {
            setIsDownloading(true);
            canvas.discardActiveObject();
            canvas.renderAll();

            const imgData = canvas.toDataURL({
                format: "jpeg",
                quality: 0.98,
                multiplier: 2
            });

            // Standard A4 portrait in pt (595.28 x 841.89)
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "pt",
                format: "a4"
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`DIU_CoverPage_${coverData.courseCode.replace(/\s+/g, "_")}.pdf`);
        } catch (err) {
            console.error("PDF export error:", err);
        } finally {
            setIsDownloading(false);
        }
    };

    // PNG Download
    const handleDownloadPNG = () => {
        if (!canvas) return;
        canvas.discardActiveObject();
        canvas.renderAll();

        const dataURL = canvas.toDataURL({
            format: "png",
            multiplier: 2
        });

        const link = document.createElement("a");
        link.href = dataURL;
        link.download = `DIU_CoverPage_${coverData.courseCode.replace(/\s+/g, "_")}.png`;
        link.click();
    };

    const handleDeleteObject = () => {
        if (!canvas || !selectedObject) return;
        if (selectedObject.data?.type === "border" || selectedObject.data?.type === "logo") return;
        canvas.remove(selectedObject);
        canvas.discardActiveObject();
        setSelectedObject(null);
        canvas.renderAll();
    };

    return (
        <div ref={containerRef} className="w-full max-w-xl my-4 rounded-2xl bg-[#141722] border border-white/10 p-4 shadow-xl">
            {/* Header / Controls */}
            <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-white/[0.08] flex-wrap">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                    <GraduationCap size={18} />
                    <span>DIU Academic Cover Page</span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setEditing(!editing)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                            editing
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30"
                                : "bg-white/[0.06] text-slate-300 border-white/10 hover:bg-white/[0.1]"
                        }`}
                    >
                        {editing ? <Check size={14} /> : <Edit3 size={14} />}
                        {editing ? "Done Editing" : "Edit Details"}
                    </button>

                    {editing && selectedObject && (
                        <button
                            onClick={handleDeleteObject}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 cursor-pointer"
                        >
                            <Trash2 size={13} />
                        </button>
                    )}

                    <button
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                    >
                        <FileDown size={14} />
                        {isDownloading ? "Exporting..." : "Download PDF"}
                    </button>

                    <button
                        onClick={handleDownloadPNG}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] transition-colors cursor-pointer"
                        title="Download high-resolution image"
                    >
                        <Download size={13} />
                        PNG
                    </button>
                </div>
            </div>

            {/* Canvas Preview Container */}
            <div className="w-full flex justify-center items-center py-2 overflow-hidden bg-slate-950/40 rounded-xl border border-white/[0.04]">
                <div className="shadow-2xl rounded-sm overflow-hidden border border-slate-300">
                    <canvas ref={canvasRef} className="block" />
                </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center mt-3">
                * Click "Edit Details" to customize any text directly on the page, then click "Download PDF" for submission.
            </p>
        </div>
    );
};

export default CoverPage;
