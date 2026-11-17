// mockData.js

export const studentData = {
    // ==========================================
    // STUDENT INFORMATION
    // ==========================================

    studentId: "221-15-12345",

    name: "Rakib B",

    university: "Daffodil International University",

    department: "Computer Science and Engineering",

    program: "B.Sc. in Computer Science and Engineering",

    batch: "61",

    currentSemester: "Spring 2026",


    // ==========================================
    // CGPA
    // ==========================================

    cgpa: 3.72,


    // ==========================================
    // COMPLETED CREDITS
    // ==========================================

    credits: {
        completed: 96,

        total: 148,

        remaining: 52
    },


    // ==========================================
    // REGISTERED COURSES
    // ==========================================

    registeredCourses: [
        {
            code: "CSE221",
            name: "Data Structures",
            credit: 3,
            section: "61",
            type: "Theory"
        },

        {
            code: "CSE222",
            name: "Data Structures Lab",
            credit: 1,
            section: "61",
            type: "Lab"
        },

        {
            code: "CSE231",
            name: "Database Management System",
            credit: 3,
            section: "61",
            type: "Theory"
        },

        {
            code: "CSE232",
            name: "Database Management System Lab",
            credit: 1,
            section: "61",
            type: "Lab"
        },

        {
            code: "CSE241",
            name: "Operating Systems",
            credit: 3,
            section: "61",
            type: "Theory"
        }
    ],


    // ==========================================
    // ATTENDANCE
    // ==========================================

    attendance: {

        overall: 87.25,

        courses: [

            {
                code: "CSE221",

                name: "Data Structures",

                totalClasses: 28,

                attended: 25,

                absent: 3,

                percentage: 89.29
            },

            {
                code: "CSE222",

                name: "Data Structures Lab",

                totalClasses: 12,

                attended: 11,

                absent: 1,

                percentage: 91.67
            },

            {
                code: "CSE231",

                name: "Database Management System",

                totalClasses: 30,

                attended: 25,

                absent: 5,

                percentage: 83.33
            },

            {
                code: "CSE232",

                name: "Database Management System Lab",

                totalClasses: 10,

                attended: 9,

                absent: 1,

                percentage: 90
            },

            {
                code: "CSE241",

                name: "Operating Systems",

                totalClasses: 26,

                attended: 24,

                absent: 2,

                percentage: 92.31
            }
        ]
    },


    // ==========================================
    // SEMESTER RESULTS
    // ==========================================

    semesterResults: [

        // ----------------------------------------
        // Spring 2026
        // ----------------------------------------

        {
            semester: "Spring 2026",

            sgpa: 3.85,

            credits: 15,

            status: "Completed",

            courses: [

                {
                    code: "CSE221",

                    name: "Data Structures",

                    credit: 3,

                    grade: "A",

                    gradePoint: 4.00
                },

                {
                    code: "CSE222",

                    name: "Data Structures Lab",

                    credit: 1,

                    grade: "A-",

                    gradePoint: 3.70
                },

                {
                    code: "CSE231",

                    name: "Database Management System",

                    credit: 3,

                    grade: "A",

                    gradePoint: 4.00
                },

                {
                    code: "CSE232",

                    name: "Database Management System Lab",

                    credit: 1,

                    grade: "A",

                    gradePoint: 4.00
                },

                {
                    code: "CSE241",

                    name: "Operating Systems",

                    credit: 3,

                    grade: "A-",

                    gradePoint: 3.70
                }
            ]
        },


        // ----------------------------------------
        // Fall 2025
        // ----------------------------------------

        {
            semester: "Fall 2025",

            sgpa: 3.60,

            credits: 15,

            status: "Completed",

            courses: [

                {
                    code: "CSE211",

                    name: "Object Oriented Programming",

                    credit: 3,

                    grade: "A-",

                    gradePoint: 3.70
                },

                {
                    code: "CSE212",

                    name: "Object Oriented Programming Lab",

                    credit: 1,

                    grade: "A",

                    gradePoint: 4.00
                },

                {
                    code: "CSE213",

                    name: "Computer Architecture",

                    credit: 3,

                    grade: "B+",

                    gradePoint: 3.30
                },

                {
                    code: "CSE214",

                    name: "Computer Architecture Lab",

                    credit: 1,

                    grade: "A-",

                    gradePoint: 3.70
                },

                {
                    code: "MAT211",

                    name: "Numerical Methods",

                    credit: 3,

                    grade: "A",

                    gradePoint: 4.00
                }
            ]
        },


        // ----------------------------------------
        // Summer 2025
        // ----------------------------------------

        {
            semester: "Summer 2025",

            sgpa: 3.75,

            credits: 12,

            status: "Completed",

            courses: [

                {
                    code: "CSE201",

                    name: "Algorithms",

                    credit: 3,

                    grade: "A",

                    gradePoint: 4.00
                },

                {
                    code: "CSE202",

                    name: "Algorithms Lab",

                    credit: 1,

                    grade: "A-",

                    gradePoint: 3.70
                },

                {
                    code: "CSE203",

                    name: "Computer Networks",

                    credit: 3,

                    grade: "A",

                    gradePoint: 4.00
                },

                {
                    code: "CSE204",

                    name: "Computer Networks Lab",

                    credit: 1,

                    grade: "A",

                    gradePoint: 4.00
                }
            ]
        },


        // ----------------------------------------
        // Spring 2025
        // ----------------------------------------

        {
            semester: "Spring 2025",

            sgpa: 3.55,

            credits: 15,

            status: "Completed",

            courses: [

                {
                    code: "CSE111",

                    name: "Structured Programming",

                    credit: 3,

                    grade: "A-",

                    gradePoint: 3.70
                },

                {
                    code: "CSE112",

                    name: "Structured Programming Lab",

                    credit: 1,

                    grade: "A",

                    gradePoint: 4.00
                },

                {
                    code: "CSE113",

                    name: "Discrete Mathematics",

                    credit: 3,

                    grade: "B+",

                    gradePoint: 3.30
                },

                {
                    code: "CSE114",

                    name: "Digital Logic Design",

                    credit: 3,

                    grade: "A",

                    gradePoint: 4.00
                },

                {
                    code: "ENG111",

                    name: "English",

                    credit: 3,

                    grade: "A-",

                    gradePoint: 3.70
                }
            ]
        }
    ]
};

