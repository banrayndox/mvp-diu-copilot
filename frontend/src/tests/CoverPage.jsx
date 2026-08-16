import { useEffect, useRef, useState } from "react";
import { Canvas, Textbox, Rect, FabricImage } from "fabric";
import logo from "../tests/logo.png";

const LOGO_URL = logo;
const WATERMARK_URL = "YOUR_WATERMARK_IMAGE_URL";

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

// Maximum display width on desktop
const MAX_DISPLAY_WIDTH = 560;

function CoverPage() {
  const canvasRef = useRef(null);
  const canvasWrapperRef = useRef(null);

  const [canvas, setCanvas] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);

  // ============================================================
  // RESPONSIVE CANVAS
  // ============================================================

  function resizeCanvas(fabricCanvas) {
    if (!fabricCanvas || !canvasWrapperRef.current) return;

    const wrapperWidth = canvasWrapperRef.current.clientWidth;

    // Keep some space on both sides
    const availableWidth = Math.max(0, wrapperWidth);

    // Desktop max width = 560px
    const displayWidth = Math.min(
      MAX_DISPLAY_WIDTH,
      availableWidth
    );

    // A4 ratio
    const scale = displayWidth / A4_WIDTH;

    const displayHeight = A4_HEIGHT * scale;

    // ----------------------------------------------------------
    // Change ONLY the visual/CSS size
    // Internal Fabric coordinate remains 794 x 1123
    // ----------------------------------------------------------

    fabricCanvas.setDimensions(
      {
        width: displayWidth,
        height: displayHeight,
      },
      {
        cssOnly: true,
      }
    );

    // ----------------------------------------------------------
    // Scale Fabric viewport
    // ----------------------------------------------------------

    fabricCanvas.setViewportTransform([
      scale,
      0,
      0,
      scale,
      0,
      0,
    ]);

    fabricCanvas.renderAll();
  }

  // ============================================================
  // CREATE CANVAS
  // ============================================================

  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new Canvas(canvasRef.current, {
      width: A4_WIDTH,
      height: A4_HEIGHT,

      backgroundColor: "white",

      preserveObjectStacking: true,

      selection: true,
    });

    setCanvas(fabricCanvas);

    // ----------------------------------------------------------
    // Selection
    // ----------------------------------------------------------

    fabricCanvas.on("selection:created", (e) => {
      setSelectedObject(e.selected?.[0] || null);
    });

    fabricCanvas.on("selection:updated", (e) => {
      setSelectedObject(e.selected?.[0] || null);
    });

    fabricCanvas.on("selection:cleared", () => {
      setSelectedObject(null);
    });

    // ----------------------------------------------------------
    // Create cover
    // ----------------------------------------------------------

    createCover(fabricCanvas);

    // ----------------------------------------------------------
    // Responsive resize
    // ----------------------------------------------------------

    const handleResize = () => {
      resizeCanvas(fabricCanvas);
    };

    window.addEventListener("resize", handleResize);

    // Initial resize
    requestAnimationFrame(() => {
      resizeCanvas(fabricCanvas);
    });

    // ----------------------------------------------------------
    // Cleanup
    // ----------------------------------------------------------

    return () => {
      window.removeEventListener("resize", handleResize);

      fabricCanvas.dispose();
    };
  }, []);

  // ============================================================
  // CREATE COVER
  // ============================================================

  async function createCover(fabricCanvas) {
    // ----------------------------------------------------------
    // Outer border
    // ----------------------------------------------------------

    const border = new Rect({
      left: 8,
      top: 8,

      width: A4_WIDTH - 16,
      height: A4_HEIGHT - 16,

      fill: "transparent",

      stroke: "#222",

      strokeWidth: 1,

      selectable: false,

      evented: false,

      data: {
        type: "border",
      },
    });

    fabricCanvas.add(border);

    // ----------------------------------------------------------
    // LOGO
    // ----------------------------------------------------------

    if (LOGO_URL !== "YOUR_LOGO_IMAGE_URL") {
      try {
        const img = await FabricImage.fromURL(LOGO_URL, {
          crossOrigin: "anonymous",
        });

        img.set({
          left: 190,

          top: 45,

          scaleX: 0.35,

          scaleY: 0.35,

          data: {
            type: "image",
            id: "university-logo",
          },
        });

        fabricCanvas.add(img);
      } catch (error) {
        console.log("Logo could not be loaded:", error);
      }
    }

    // ----------------------------------------------------------
    // ASSIGNMENT
    // ----------------------------------------------------------

    addText(
      fabricCanvas,
      "ASSIGNMENT",
      397,
      225,
      {
        fontSize: 22,
        fontWeight: "bold",
        originX: "center",
        underline: true,
        width: 300,
      }
    );

    // ----------------------------------------------------------
    // COURSE CODE
    // ----------------------------------------------------------

    addLabel(
      fabricCanvas,
      "Course Code:",
      "CSE216",
      48,
      265
    );

    // ----------------------------------------------------------
    // COURSE TITLE
    // ----------------------------------------------------------

    addLabel(
      fabricCanvas,
      "Course Title:",
      "Electronics Devices and Circuits",
      48,
      300
    );

    // ----------------------------------------------------------
    // TOPIC
    // ----------------------------------------------------------

    addLabel(
      fabricCanvas,
      "Topic Name:",
      "any topic",
      48,
      335
    );

    // ----------------------------------------------------------
    // SUBMITTED TO
    // ----------------------------------------------------------

    addText(
      fabricCanvas,
      "Submitted To",
      397,
      400,
      {
        fontSize: 20,
        fontWeight: "bold",
        underline: true,
        originX: "center",
        width: 300,
      }
    );

    addText(
      fabricCanvas,
      "Name: name",
      48,
      445,
      {
        fontSize: 18,
        fontWeight: "normal",
        width: 650,
      }
    );

    addText(
      fabricCanvas,
      "Designation: designation",
      48,
      480,
      {
        fontSize: 18,
        width: 650,
      }
    );

    addText(
      fabricCanvas,
      "Department of CSE",
      48,
      515,
      {
        fontSize: 18,
        width: 650,
      }
    );

    addText(
      fabricCanvas,
      "Daffodil International University",
      48,
      550,
      {
        fontSize: 18,
        width: 650,
      }
    );

    // ----------------------------------------------------------
    // SUBMITTED BY
    // ----------------------------------------------------------

    addText(
      fabricCanvas,
      "Submitted By",
      397,
      610,
      {
        fontSize: 20,
        fontWeight: "bold",
        underline: true,
        originX: "center",
        width: 300,
      }
    );

    addText(
      fabricCanvas,
      "Name: Rakib B.",
      48,
      660,
      {
        fontSize: 18,
        width: 650,
      }
    );

    addText(
      fabricCanvas,
      "ID: 251-15-445",
      48,
      695,
      {
        fontSize: 18,
        width: 650,
      }
    );

    addText(
      fabricCanvas,
      "Section: 68_B2",
      48,
      730,
      {
        fontSize: 18,
        width: 650,
      }
    );

    addText(
      fabricCanvas,
      "Semester: Summer 2026",
      48,
      765,
      {
        fontSize: 18,
        width: 650,
      }
    );

    addText(
      fabricCanvas,
      "Department of CSE",
      48,
      800,
      {
        fontSize: 18,
        width: 650,
      }
    );

    addText(
      fabricCanvas,
      "Daffodil International University",
      48,
      835,
      {
        fontSize: 18,
        fontWeight: "bold",
        width: 650,
      }
    );

    // ----------------------------------------------------------
    // DATE
    // ----------------------------------------------------------

    const dateBox = new Rect({
      left: 195,

      top: 900,

      width: 405,

      height: 48,

      rx: 24,

      ry: 24,

      fill: "white",

      stroke: "#273b63",

      strokeWidth: 1,

      data: {
        type: "shape",
      },
    });

    fabricCanvas.add(dateBox);

    addText(
      fabricCanvas,
      "Date of Submission: 09/08/2026",
      397,
      913,
      {
        fontSize: 17,
        fontWeight: "bold",
        fill: "#273b63",
        originX: "center",
        width: 380,
      }
    );

    // ----------------------------------------------------------
    // WATERMARK
    // ----------------------------------------------------------

    if (WATERMARK_URL !== "YOUR_WATERMARK_IMAGE_URL") {
      try {
        const watermark = await FabricImage.fromURL(
          WATERMARK_URL,
          {
            crossOrigin: "anonymous",
          }
        );

        watermark.set({
          left: 190,

          top: 450,

          scaleX: 0.6,

          scaleY: 0.6,

          opacity: 0.12,

          data: {
            type: "watermark",
          },
        });

        fabricCanvas.add(watermark);

        // Send watermark behind text
        fabricCanvas.sendObjectToBack(watermark);

        // Keep border on top
        fabricCanvas.bringObjectForward(border);
      } catch (error) {
        console.log(
          "Watermark could not be loaded:",
          error
        );
      }
    }

    fabricCanvas.renderAll();

    // Make sure responsive scale is applied
    requestAnimationFrame(() => {
      resizeCanvas(fabricCanvas);
    });
  }

  // ============================================================
  // ADD TEXT
  // ============================================================

  function addText(
    fabricCanvas,
    text,
    left,
    top,
    options = {}
  ) {
    const textbox = new Textbox(text, {
      left,

      top,

      width: options.width || 600,

      fontSize: options.fontSize || 18,

      fontFamily: "Arial",

      fontWeight:
        options.fontWeight || "normal",

      fill: options.fill || "#111",

      originX:
        options.originX || "left",

      underline:
        options.underline || false,

      editable: true,

      padding: 2,

      transparentCorners: false,

      cornerColor: "#2563eb",

      cornerStrokeColor: "#2563eb",

      borderColor: "#2563eb",

      cornerSize: 8,

      data: {
        type: "text",
      },
    });

    fabricCanvas.add(textbox);

    return textbox;
  }

  // ============================================================
  // LABEL
  // ============================================================

  function addLabel(
    fabricCanvas,
    label,
    value,
    left,
    top
  ) {
    addText(
      fabricCanvas,
      `${label} ${value}`,
      left,
      top,
      {
        fontSize: 18,
        width: 680,
      }
    );
  }

  // ============================================================
  // ADD CUSTOM TEXT
  // ============================================================

  function handleAddText() {
    if (!canvas) return;

    const text = new Textbox("New Text", {
      left: 250,

      top: 500,

      width: 250,

      fontSize: 20,

      fontFamily: "Arial",

      fill: "#111",

      editable: true,

      padding: 5,

      transparentCorners: false,

      cornerColor: "#2563eb",

      borderColor: "#2563eb",

      cornerSize: 8,

      data: {
        type: "text",
      },
    });

    canvas.add(text);

    canvas.setActiveObject(text);

    text.enterEditing();

    text.selectAll();

    canvas.renderAll();
  }

  // ============================================================
  // DELETE
  // ============================================================

  function handleDelete() {
    if (!canvas) return;

    const active = canvas.getActiveObject();

    if (!active) return;

    // Don't delete border
    if (active.data?.type === "border") {
      return;
    }

    canvas.remove(active);

    canvas.discardActiveObject();

    setSelectedObject(null);

    canvas.renderAll();
  }

  // ============================================================
  // DOWNLOAD
  // ============================================================

  function handleDownload() {
    if (!canvas) return;

    canvas.discardActiveObject();

    canvas.renderAll();

    // ----------------------------------------------------------
    // Temporarily reset viewport for full-resolution export
    // ----------------------------------------------------------

    const currentTransform =
      canvas.viewportTransform;

    canvas.setViewportTransform([
      1,
      0,
      0,
      1,
      0,
      0,
    ]);

    canvas.renderAll();

    const dataURL = canvas.toDataURL({
      format: "png",

      multiplier: 2,
    });

    // Restore responsive viewport
    canvas.setViewportTransform(
      currentTransform
    );

    canvas.renderAll();

    const link =
      document.createElement("a");

    link.href = dataURL;

    link.download =
      "diu-assignment-cover.png";

    link.click();
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div
      className="
        w-full
        min-h-screen
        bg-slate-100
        p-3
        sm:p-4
      "
    >
      {/* ======================================================
          TOOLBAR
      ====================================================== */}

      <div
        className="
          w-full
          flex
          items-center
          gap-2
          mb-4
          flex-wrap
        "
      >
        <button
          onClick={handleAddText}
          className="
            px-3
            py-2
            rounded-lg
            bg-blue-600
            text-white
            text-sm
            font-medium
            hover:bg-blue-700
          "
        >
          + Add
        </button>

        <button
          onClick={handleDelete}
          disabled={!selectedObject}
          className="
            px-3
            py-2
            rounded-lg
            bg-red-50
            text-red-600
            text-sm
            font-medium
            disabled:opacity-40
          "
        >
          Delete
        </button>

        <div className="flex-1" />

        <button
          onClick={handleDownload}
          className="
            px-3
            py-2
            rounded-lg
            bg-slate-900
            text-white
            text-sm
            font-medium
            hover:bg-slate-800
          "
        >
          ↓ Download
        </button>
      </div>

      {/* ======================================================
          A4 RESPONSIVE CANVAS
      ====================================================== */}

      <div
        ref={canvasWrapperRef}
        className="
          w-full
          flex
          justify-center
          overflow-hidden
        "
      >
        <canvas
          ref={canvasRef}
          className="block"
        />
      </div>
    </div>
  );
}

export default CoverPage