import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ============================================================
// __dirname for ES Modules
// ============================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================
// ROUTINE JSON PATH
//
// Current file:
// agent/utils/routineParse.js
//
// ../data/
//     routine.data.json
// ============================================================

const routinePath = path.join(
  __dirname,
  "../data/routine.data.json"
);

// ============================================================
// LOAD ROUTINE
// ============================================================

const routine = JSON.parse(
  fs.readFileSync(routinePath, "utf8")
);

// ============================================================
// MAIN QUERY FUNCTION
// ============================================================

export function executeRoutineQuery(query) {
  const indexes = routine.indexes;

  if (!indexes) {
    console.error(
      "Routine indexes not found in routine.data.json"
    );

    return [];
  }

  switch (query.intent) {
    // ========================================================
    // COURSE
    // ========================================================

    case "course_schedule": {
      const course = normalizeCourse(
        query.course
      );

      return indexes.byCourse?.[course] || [];
    }

    // ========================================================
    // SECTION
    // ========================================================

    case "section_schedule": {
      const section =
        query.section?.trim();

      return indexes.bySection?.[section] || [];
    }

    // ========================================================
    // TEACHER
    // ========================================================

    case "teacher_schedule": {
      const teacher =
        query.teacher
          ?.trim()
          .toUpperCase();

      return indexes.byTeacher?.[teacher] || [];
    }

    // ========================================================
    // ROOM
    // ========================================================

    case "room_schedule": {
      const room =
        query.room
          ?.trim()
          .toUpperCase();

      return indexes.byRoom?.[room] || [];
    }

    // ========================================================
    // DAY
    // ========================================================

    case "day_schedule": {
      return getDaySchedule(query.day);
    }

    // ========================================================
    // COMPLETE ROUTINE
    // ========================================================

    case "general_routine": {
      return routine;
    }

    // ========================================================
    // UNKNOWN
    // ========================================================

    default:
      return [];
  }
}

// ============================================================
// NORMALIZE COURSE
// ============================================================

function normalizeCourse(course) {
  return (
    course
      ?.replace(/\s+/g, "")
      .toUpperCase() || ""
  );
}

// ============================================================
// DAY SCHEDULE
// ============================================================

function getDaySchedule(day) {
  if (!day) return [];

  const normalized =
    day.charAt(0).toUpperCase() +
    day.slice(1).toLowerCase();

  const dayData =
    routine.days?.[normalized];

  if (!dayData) {
    return [];
  }

  const result = [];

  for (const [time, classes] of Object.entries(
    dayData
  )) {
    for (const item of classes) {
      result.push({
        day: normalized,
        time,
        ...item,
      });
    }
  }

  return result;
}

// ============================================================
// FORMAT RESPONSE
// ============================================================

export function formatRoutineResult(
    query,
    result
) {

    // ========================================================
    // NO RESULT
    // ========================================================

    if (
        !result ||
        (Array.isArray(result) && result.length === 0)
    ) {

        return `
**No Routine Found**

I couldn't find any routine information for this query.
`.trim();

    }


    // ========================================================
    // NORMALIZE RESULT
    // ========================================================

    const rows = Array.isArray(result)
        ? result
        : result?.rows ||
          result?.data ||
          [result];


    if (!rows || rows.length === 0) {

        return `
**No Routine Found**

I couldn't find any routine information for this query.
`.trim();

    }


    // ========================================================
    // TITLE
    // ========================================================

    let title = "**Class Routine**";


    switch (query?.intent) {

        case "course_schedule":

            title =
                `**${query.course} Routine**`;

            break;


        case "section_schedule":

            title =
                `**${query.section} Routine**`;

            break;


        case "teacher_schedule":

            title =
                `**${query.teacher} Teacher Routine**`;

            break;


        case "room_schedule":

            title =
                `**${query.room} Room Routine**`;

            break;


        case "day_schedule":

            title =
                `**${query.day} Routine**`;

            break;


        case "general_routine":

            title =
                "**Complete Class Routine**";

            break;

    }


    // ========================================================
    // TABLE HEADER
    // ========================================================

    let table = `

${title}

| **Day** | **Time** | **Course** | **Section** | **Teacher** | **Room** |
|---|---|---|---|---|---|
`;


    // ========================================================
    // TABLE ROWS
    // ========================================================

    rows.forEach((item) => {

        const day =
            item?.day ??
            item?.Day ??
            "-";


        const time =
            item?.time ??
            item?.Time ??
            item?.startTime ??
            "-";


        const course =
            item?.course ??
            item?.courseCode ??
            item?.Course ??
            "-";


        const section =
            item?.section ??
            item?.Section ??
            "-";


        const teacher =
            item?.teacher ??
            item?.teacherName ??
            item?.Teacher ??
            "-";


        const room =
            item?.room ??
            item?.Room ??
            "-";


        table +=
            `| **${day}** | ${time} | **${course}** | ${section} | **${teacher}** | ${room} |\n`;

    });


    // ========================================================
    // RETURN MARKDOWN
    // ========================================================

    return table.trim();

}

// ============================================================
// TIME SORTING
// ============================================================

function getTimeOrder(time) {
  const order = {
    "08:30-10:00": 1,
    "10:00-11:30": 2,
    "11:30-01:00": 3,
    "01:00-02:30": 4,
    "02:30-04:00": 5,
    "04:00-05:30": 6,
  };

  return order[time] || 999;
}

// ============================================================
// OPTIONAL: GET RAW ROUTINE
// ============================================================

export function getRoutine() {
  return routine;
}