
import express from 'express'
import { configDotenv } from 'dotenv';
import cors from 'cors'
configDotenv()
import { studentData } from './mockData.js';

const app = express();

app.use(cors());
app.use(express.json());




app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Student Portal Service is running"
    });
});


// ===============================
// Student Info
// ===============================

app.get("/api/student", (req, res) => {

    res.json({
        success: true,

        data: {
            studentId: studentData.studentId,
            name: studentData.name,
            department: studentData.department,
            university: studentData.university,
            program: studentData.program,
            currentSemester: studentData.currentSemester
        }
    });
});


// ===============================
// CGPA
// ===============================

app.get("/api/student/cgpa", (req, res) => {

    res.json({
        success: true,

        data: {
            cgpa: studentData.cgpa
        }
    });
});


// ===============================
// Attendance
// ===============================

app.get("/api/student/attendance", (req, res) => {

    res.json({
        success: true,
        data: studentData.attendance
    });
});


// ===============================
// Semester Results
// ===============================

app.get("/api/student/results", (req, res) => {

    const { semester } = req.query;

    let results = studentData.semesterResults;

    if (semester) {

        results = results.filter(
            result =>
                result.semester.toLowerCase() ===
                semester.toLowerCase()
        );
    }

    res.json({
        success: true,
        data: results
    });
});


// ===============================
// Completed Credits
// ===============================

app.get("/api/student/credits", (req, res) => {

    res.json({
        success: true,
        data: studentData.credits
    });
});


// ===============================
// Registered Courses
// ===============================

app.get("/api/student/courses", (req, res) => {

    res.json({
        success: true,

        data: {
            semester: studentData.currentSemester,
            courses: studentData.registeredCourses
        }
    });
});


// ===============================
// Server
// ===============================

const PORT = process.env.PORT || 6000;

app.listen(PORT, () => {

    console.log(
        `Student Portal Server running on port ${PORT}`
    );

});