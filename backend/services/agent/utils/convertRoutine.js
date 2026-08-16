import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PDFParse } from "pdf-parse";

// ============================================================
// __dirname
// ============================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================
// PATHS
//
// Current:
// agent/utils/convertRoutine.js
//
// PDF:
// agent/data/routine.pdf
//
// JSON:
// agent/data/routine.data.json
// ============================================================

const PDF_PATH = path.join(
  __dirname,
  "../data/routine.pdf"
);

const OUTPUT_PATH = path.join(
  __dirname,
  "../data/routine.data.json"
);

// ============================================================
// DAYS
// ============================================================

const DAYS = [
  "SATURDAY",
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
];

// ============================================================
// TIME SLOTS
// ============================================================

const TIME_SLOTS = [
  "08:30-10:00",
  "10:00-11:30",
  "11:30-01:00",
  "01:00-02:30",
  "02:30-04:00",
  "04:00-05:30",
];

// ============================================================
// MAIN
// ============================================================

async function convertRoutine() {
  console.log(
    "Reading PDF:",
    PDF_PATH
  );

  if (!fs.existsSync(PDF_PATH)) {
    throw new Error(
      `Routine PDF not found: ${PDF_PATH}`
    );
  }

  // Read PDF file
  const buffer = fs.readFileSync(PDF_PATH);

  // Parse PDF
  const parser = new PDFParse({
    data: buffer,
  });

  const data = await parser.getText();

  const text = data.text
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .trim();

  console.log(
    "\n========== EXTRACTED PDF TEXT ==========\n"
  );

  console.log(text);

  console.log(
    "\n=========================================\n"
  );

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const routine = {
    title: "Class Routine for CSE Program",

    version: null,

    effectiveFrom: null,

    department: "CSE",

    timeSlots: TIME_SLOTS,

    days: {},
  };

  // ==========================================================
  // INITIALIZE DAYS
  // ==========================================================

  for (const day of DAYS) {
    routine.days[
      capitalize(day)
    ] = {};
  }

  // ==========================================================
  // METADATA
  // ==========================================================

  const versionMatch = text.match(
    /Version\s+([A-Za-z0-9_-]+)/i
  );

  if (versionMatch) {
    routine.version =
      versionMatch[1];
  }

  const effectiveMatch = text.match(
    /Effective\s+From\s*:\s*(.*?)(?:Prepared\s+by\s*:|$)/i
  );

  if (effectiveMatch) {
    routine.effectiveFrom =
      effectiveMatch[1].trim();
  }

  // ==========================================================
  // CURRENT DAY
  // ==========================================================

  let currentDay = null;

  for (const line of lines) {
    const upper =
      line.toUpperCase();

    // --------------------------------------------------------
    // Detect day
    // --------------------------------------------------------

    if (DAYS.includes(upper)) {
      currentDay =
        capitalize(upper);

      continue;
    }

    if (!currentDay) {
      continue;
    }

    // --------------------------------------------------------
    // Skip table header
    // --------------------------------------------------------

    if (
      line.includes("08:30-10:00") ||
      /Room\s+Course\s+Teacher/i.test(
        line
      )
    ) {
      continue;
    }

    // --------------------------------------------------------
    // Parse line
    // --------------------------------------------------------

    const entries =
      parseRoutineLine(line);

    if (!entries.length) {
      continue;
    }

    for (const entry of entries) {
      const {
        time,
        room,
        course,
        section,
        teacher,
      } = entry;

      if (!time) {
        continue;
      }

      if (
        !routine.days[currentDay][time]
      ) {
        routine.days[currentDay][time] = [];
      }

      routine.days[currentDay][
        time
      ].push({
        room,
        course,
        section,
        teacher,
      });
    }
  }

  // ==========================================================
  // BUILD INDEXES
  // ==========================================================

  routine.indexes =
    buildIndexes(routine.days);

  // ==========================================================
  // WRITE JSON
  // ==========================================================

  fs.writeFileSync(
    OUTPUT_PATH,
    JSON.stringify(
      routine,
      null,
      2
    ),
    "utf8"
  );

  console.log(
    `\nRoutine JSON created successfully:\n${OUTPUT_PATH}`
  );
}

// ============================================================
// PARSE ROUTINE LINE
// ============================================================

function parseRoutineLine(line) {
  const tokens =
    line.split(/\s+/);

  const entries = [];

  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i];

    // --------------------------------------------------------
    // Room
    // --------------------------------------------------------

    if (!isRoom(token)) {
      i++;
      continue;
    }

    const room = token;

    // --------------------------------------------------------
    // Course
    // --------------------------------------------------------

    const courseToken =
      tokens[i + 1];

    if (
      !courseToken ||
      !isCourse(courseToken)
    ) {
      i++;
      continue;
    }

    const courseInfo =
      parseCourse(courseToken);

    // --------------------------------------------------------
    // Teacher
    // --------------------------------------------------------

    const teacher =
      tokens[i + 2];

    if (!teacher) {
      i++;
      continue;
    }

    // --------------------------------------------------------
    // Time
    // --------------------------------------------------------

    const time =
      TIME_SLOTS[entries.length];

    if (!time) {
      break;
    }

    entries.push({
      time,

      room,

      course:
        courseInfo.course,

      section:
        courseInfo.section,

      teacher,
    });

    i += 3;
  }

  return entries;
}

// ============================================================
// ROOM
// ============================================================

function isRoom(value) {
  return /^KT-\d+$/i.test(
    value
  );
}

// ============================================================
// COURSE
//
// Examples:
//
// CSE315(66_E)
// CSE321(66_C)
// PHY101(71_B)
// ============================================================

function isCourse(value) {
  return /^[A-Z]{2,5}\d{3}\(.+\)$/i.test(
    value
  );
}

// ============================================================
// PARSE COURSE
// ============================================================

function parseCourse(value) {
  const match = value.match(
    /^([A-Z]{2,5}\d{3})\((.+)\)$/i
  );

  if (!match) {
    return {
      course: value.toUpperCase(),
      section: null,
    };
  }

  return {
    course:
      match[1].toUpperCase(),

    section:
      match[2],
  };
}

// ============================================================
// BUILD INDEXES
// ============================================================

function buildIndexes(days) {
  const byCourse = {};

  const bySection = {};

  const byTeacher = {};

  const byRoom = {};

  for (const [
    day,
    slots,
  ] of Object.entries(days)) {
    for (const [
      time,
      classes,
    ] of Object.entries(slots)) {
      for (const item of classes) {
        const record = {
          day,

          time,

          room: item.room,

          course: item.course,

          section: item.section,

          teacher: item.teacher,
        };

        // ----------------------------------------------------
        // Course
        // ----------------------------------------------------

        if (
          !byCourse[item.course]
        ) {
          byCourse[item.course] = [];
        }

        byCourse[
          item.course
        ].push(record);

        // ----------------------------------------------------
        // Section
        // ----------------------------------------------------

        if (item.section) {
          if (
            !bySection[
              item.section
            ]
          ) {
            bySection[
              item.section
            ] = [];
          }

          bySection[
            item.section
          ].push(record);
        }

        // ----------------------------------------------------
        // Teacher
        // ----------------------------------------------------

        if (
          !byTeacher[
            item.teacher
          ]
        ) {
          byTeacher[
            item.teacher
          ] = [];
        }

        byTeacher[
          item.teacher
        ].push(record);

        // ----------------------------------------------------
        // Room
        // ----------------------------------------------------

        if (
          !byRoom[item.room]
        ) {
          byRoom[item.room] = [];
        }

        byRoom[
          item.room
        ].push(record);
      }
    }
  }

  return {
    byCourse,

    bySection,

    byTeacher,

    byRoom,
  };
}

// ============================================================
// CAPITALIZE
// ============================================================

function capitalize(value) {
  return (
    value.charAt(0).toUpperCase() +
    value.slice(1).toLowerCase()
  );
}

// ============================================================
// RUN
// ============================================================

convertRoutine().catch(
  (error) => {
    console.error(
      "\nRoutine conversion failed:"
    );

    console.error(error);

    process.exit(1);
  }
);