import User from "../models/mentor.model.js";

// Helper to seed initial sample users in Auth DB if empty
const seedInitialAuthUsersIfEmpty = async () => {
    try {
        const count = await User.countDocuments();
        if (count === 0) {
            console.log("Seeding initial users into Auth MongoDB users collection...");
            await User.insertMany([
                {
                    firebaseUID: "seed_uid_rakib",
                    name: "Rakib Biswash",
                    email: "rakib@diu.edu.bd",
                    skills: ["React", "Node.js", "Python", "MongoDB"],
                    department: "CSE",
                    batch: "58th",
                    semester: "8th",
                    bio: "Senior CSE student & Full-stack dev. Happy to mentor in Web Dev and AI projects."
                },
                {
                    firebaseUID: "seed_uid_tanvir",
                    name: "Tanvir Rahman",
                    email: "tanvir@diu.edu.bd",
                    skills: ["Java", "Spring Boot", "Data Structures", "Algorithms"],
                    department: "CSE",
                    batch: "56th",
                    semester: "10th",
                    bio: "Competitive programmer & backend specialist."
                },
                {
                    firebaseUID: "seed_uid_anika",
                    name: "Anika Tabassum",
                    email: "anika@diu.edu.bd",
                    skills: ["UI/UX", "React Native", "Figma", "Tailwind CSS"],
                    department: "SWE",
                    batch: "59th",
                    semester: "7th",
                    bio: "Frontend engineer & mobile app developer."
                },
                {
                    firebaseUID: "seed_uid_rakib_hassan",
                    name: "Rakib Hassan",
                    email: "rakibhassan@diu.edu.bd",
                    skills: ["Machine Learning", "PyTorch", "Django"],
                    department: "CSE",
                    batch: "57th",
                    semester: "9th",
                    bio: "AI researcher & ML enthusiast at DIU."
                }
            ]);
            console.log("Initial users seeded into Auth DB users collection.");
        }
    } catch (err) {
        console.error("Error seeding auth users:", err);
    }
};

export const searchMentor = async (req, res) => {
    try {
        await seedInitialAuthUsersIfEmpty();

        const { name, email, query } = { ...req.query, ...req.body };

        let filter = {};
        const conditions = [];

        if (email && email.trim() !== "") {
            conditions.push({ email: { $regex: email.trim(), $options: "i" } });
        }

        if (name && name.trim() !== "") {
            conditions.push({ name: { $regex: name.trim(), $options: "i" } });
        }

        if (query && query.trim() !== "") {
            const trimmed = query.trim();
            conditions.push({ name: { $regex: trimmed, $options: "i" } });
            conditions.push({ email: { $regex: trimmed, $options: "i" } });
        }

        if (conditions.length > 0) {
            filter = { $or: conditions };
        }

        // Query Auth DB users collection (max 3 results)
        const mentors = await User.find(filter).limit(3);

        return res.status(200).json({
            success: true,
            count: mentors.length,
            mentors
        });

    } catch (error) {
        console.error("Error searching mentors from Auth DB:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to search mentors from Auth DB",
            error: error.message
        });
    }
};
