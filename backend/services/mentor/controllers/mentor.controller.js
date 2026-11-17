import User from "../models/mentor.model.js";

// Helper to seed initial sample mentors in MongoDB if empty
const seedInitialAuthUsersIfEmpty = async () => {
    try {
        const count = await User.countDocuments();
        if (count === 0) {
            console.log("Seeding initial mentors and faculty into Mentor MongoDB collection...");
            await User.insertMany([
                {
                    firebaseUID: "seed_uid_rakib",
                    name: "Rakib Biswash",
                    email: "rakib@diu.edu.bd",
                    skills: ["React", "Node.js", "Python", "MongoDB", "AI Agents", "Docker"],
                    department: "CSE",
                    batch: "58th",
                    semester: "8th",
                    bio: "Senior CSE student & Full-stack dev. Happy to mentor in Web Development, MERN stack, and AI projects."
                },
                {
                    firebaseUID: "seed_uid_tanvir",
                    name: "Tanvir Rahman",
                    email: "tanvir@diu.edu.bd",
                    skills: ["Java", "Spring Boot", "Data Structures", "Algorithms", "Competitive Programming"],
                    department: "CSE",
                    batch: "56th",
                    semester: "10th",
                    bio: "ICPC Regionalist & competitive programmer. Offers mentorship in Algorithms, LeetCode, and Java."
                },
                {
                    firebaseUID: "seed_uid_anika",
                    name: "Anika Tabassum",
                    email: "anika@diu.edu.bd",
                    skills: ["UI/UX", "React Native", "Figma", "Tailwind CSS", "Mobile App Dev"],
                    department: "SWE",
                    batch: "59th",
                    semester: "7th",
                    bio: "Frontend engineer & mobile app developer. Can assist with Figma prototyping and React interfaces."
                },
                {
                    firebaseUID: "seed_uid_dr_touhid",
                    name: "Dr. Syed Akhter Hossain",
                    email: "headcse@diu.edu.bd",
                    skills: ["Artificial Intelligence", "Natural Language Processing", "Research Methodology", "Machine Learning"],
                    department: "CSE",
                    batch: "Faculty",
                    semester: "Professor",
                    bio: "Professor & Senior Academic Advisor at DIU. Guiding undergraduate thesis and AI research groups."
                },
                {
                    firebaseUID: "seed_uid_mrc_sir",
                    name: "Md. Reduanul Haque (MRC)",
                    email: "reduanul.cse@diu.edu.bd",
                    skills: ["Operating Systems", "Computer Networks", "Cyber Security", "Linux"],
                    department: "CSE",
                    batch: "Faculty",
                    semester: "Associate Professor",
                    bio: "Department of CSE, DIU. Supervising networking, system architecture, and OS lab projects."
                },
                {
                    firebaseUID: "seed_uid_sabbir",
                    name: "Sabbir Ahmed",
                    email: "sabbir.swe@diu.edu.bd",
                    skills: ["Cloud Computing", "AWS", "DevOps", "Microservices", "Kubernetes"],
                    department: "SWE",
                    batch: "57th",
                    semester: "9th",
                    bio: "Software Engineering major focusing on Cloud DevOps, CI/CD pipelines, and distributed systems."
                }
            ]);
            console.log("Initial mentors seeded successfully.");
        }
    } catch (err) {
        console.error("Error seeding mentors:", err);
    }
};

export const searchMentor = async (req, res) => {
    try {
        await seedInitialAuthUsersIfEmpty();

        const { name, email, department, skill, query } = { ...req.query, ...req.body };

        const conditions = [];

        if (email && email.trim() !== "") {
            conditions.push({ email: { $regex: email.trim(), $options: "i" } });
        }

        if (name && name.trim() !== "") {
            conditions.push({ name: { $regex: name.trim(), $options: "i" } });
        }

        if (department && department.trim() !== "") {
            conditions.push({ department: { $regex: department.trim(), $options: "i" } });
        }

        if (skill && skill.trim() !== "") {
            conditions.push({ skills: { $regex: skill.trim(), $options: "i" } });
        }

        if (query && query.trim() !== "") {
            const trimmed = query.trim();
            conditions.push({ name: { $regex: trimmed, $options: "i" } });
            conditions.push({ email: { $regex: trimmed, $options: "i" } });
            conditions.push({ department: { $regex: trimmed, $options: "i" } });
            conditions.push({ skills: { $regex: trimmed, $options: "i" } });
            conditions.push({ bio: { $regex: trimmed, $options: "i" } });
        }

        const filter = conditions.length > 0 ? { $or: conditions } : {};

        // Query mentors (up to 8 results)
        const mentors = await User.find(filter).limit(8);

        return res.status(200).json({
            success: true,
            count: mentors.length,
            mentors
        });

    } catch (error) {
        console.error("Error searching mentors:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to search mentors",
            error: error.message
        });
    }
};
