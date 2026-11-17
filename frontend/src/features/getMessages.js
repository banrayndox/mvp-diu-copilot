import api from '../../utils/config';

const DEMO_PRELOADED_MESSAGES = {
    demo_conv_routine: [
        {
            _id: "demo_m_1",
            conversationId: "demo_conv_routine",
            role: "user",
            content: "Show me CSE 221 routine and classroom for section 60_A",
            createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
            _id: "demo_m_2",
            conversationId: "demo_conv_routine",
            role: "assistant",
            content: `### 📅 CSE 221: Object Oriented Programming (Section 60_A)\n\n**Semester**: Spring 2026 | **Department**: Computer Science & Engineering\n\n| Day | Time | Room | Type | Teacher |\n| :--- | :--- | :--- | :--- | :--- |\n| **Sunday** | 08:30 AM – 10:00 AM | AB4-502 | Theory | Dr. Md. Ismail Jabiullah |\n| **Tuesday** | 10:00 AM – 11:30 AM | AB4-504 | Theory | Dr. Md. Ismail Jabiullah |\n| **Thursday** | 01:00 PM – 03:30 PM | SL-3 (Software Lab) | Lab | Lecturer Tanvir Ahmed |\n\n> 💡 **Campus Note**: Please arrive 5 minutes early for attendance. Lab reports are due before Thursday 01:00 PM.`,
            createdAt: new Date(Date.now() - 3500000).toISOString()
        }
    ],
    demo_conv_coverpage: [
        {
            _id: "demo_m_3",
            conversationId: "demo_conv_coverpage",
            role: "user",
            content: "Generate a DIU assignment cover page for CSE 221 Object Oriented Programming",
            createdAt: new Date(Date.now() - 7200000).toISOString()
        },
        {
            _id: "demo_m_4",
            conversationId: "demo_conv_coverpage",
            role: "assistant",
            content: JSON.stringify({
                type: "coverPageData",
                data: {
                    courseCode: "CSE 221",
                    courseTitle: "Object Oriented Programming",
                    topicName: "Assignment 01: Multi-Paradigm Software Architecture in Java",
                    teacherName: "Dr. Syed Akhter Hossain",
                    teacherDesignation: "Professor & Head",
                    teacherDept: "Department of CSE",
                    name: "Recruiter / Reviewer (Guest)",
                    id: "221-15-RECRUITER",
                    section: "60_A",
                    semester: "5",
                    department: "Computer Science and Engineering",
                    date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
                }
            }),
            createdAt: new Date(Date.now() - 7100000).toISOString()
        }
    ],
    demo_conv_mentor: [
        {
            _id: "demo_m_5",
            conversationId: "demo_conv_mentor",
            role: "user",
            content: "Find a mentor for React, Node.js and AI Agent systems",
            createdAt: new Date(Date.now() - 10800000).toISOString()
        },
        {
            _id: "demo_m_6",
            conversationId: "demo_conv_mentor",
            role: "assistant",
            content: JSON.stringify({
                type: "mentorResults",
                query: "React, Node.js and AI Agent systems",
                mentors: [
                    {
                        _id: "faculty_1",
                        name: "Dr. Syed Akhter Hossain",
                        designation: "Professor & Head of Department",
                        department: "Department of CSE",
                        email: "headcse@daffodilvarsity.edu.bd",
                        areas: ["Agentic AI", "Distributed Systems", "NLP Architecture"]
                    },
                    {
                        _id: "faculty_2",
                        name: "Dr. S.M. Aminul Haque",
                        designation: "Associate Professor & Associate Head",
                        department: "Department of CSE",
                        email: "aminul.cse@diu.edu.bd",
                        areas: ["Full-Stack Engineering", "Cloud Computing", "React/Node"]
                    },
                    {
                        _id: "faculty_3",
                        name: "Mushfiqur Rahman",
                        designation: "Senior Lecturer & System Lead",
                        department: "Department of CSE",
                        email: "mushfiq.cse@diu.edu.bd",
                        areas: ["Microservices", "Socket.IO", "Redis Synchronization"]
                    }
                ]
            }),
            createdAt: new Date(Date.now() - 10700000).toISOString()
        }
    ],
    demo_conv_lostfound: [
        {
            _id: "demo_m_7",
            conversationId: "demo_conv_lostfound",
            role: "user",
            content: "Check Lost & Found for Black Dell Laptop Charger in Room 402",
            createdAt: new Date(Date.now() - 14400000).toISOString()
        },
        {
            _id: "demo_m_8",
            conversationId: "demo_conv_lostfound",
            role: "assistant",
            content: JSON.stringify({
                type: "lostFoundMatchList",
                matches: [
                    {
                        matchId: "lf_match_demo_402",
                        similarity: "96%",
                        foundItem: {
                            title: "Black Dell Laptop Charger 65W Type-C",
                            location: "Academic Building 4, Room 402",
                            date: "Today",
                            reportedBy: "Campus Security Desk (Ground Floor)"
                        },
                        lostItem: {
                            title: "Dell 65W Laptop Charger",
                            location: "AB4 Room 402"
                        },
                        status: "Found - Awaiting Student Collection"
                    }
                ]
            }),
            createdAt: new Date(Date.now() - 14300000).toISOString()
        }
    ]
};

const getMessages = async (id) => {
    try {
        const { data } = await api.get(`/api/chat/get-messages/${id}`);
        if (Array.isArray(data) && data.length > 0) {
            return data;
        }
    } catch (error) {
        console.log(`Note: Backend messages offline, checking demo fallback`);
    }

    if (DEMO_PRELOADED_MESSAGES[id]) {
        return DEMO_PRELOADED_MESSAGES[id];
    }
    return [];
};

export default getMessages;
