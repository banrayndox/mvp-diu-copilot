import { questions } from "../data/questions.js"
import { searchQuestionsUtility } from "../utility/searchQuestion.utility.js";
import path from 'path';
import { fileURLToPath } from "url";
const __filename =
    fileURLToPath(import.meta.url);

const __dirname =
    path.dirname(__filename);


export const searchQuestion = async (
    req,
    res
) => {

    try {
      
        const {
            department,
            course,
            semester,
            year,
            examType
        } = req.body;


        const result =
            searchQuestionsUtility({

                department,

                course,

                semester,

                year,

                examType

            });


        const questionsWithDownload =
            result.map(
                question => ({

                    ...question,

                    downloadUrl:
                        `files/${question.id}.pdf`

                })
            );


        return res.status(200).json({

            success: true,

            count:
                questionsWithDownload.length,

            questions:
                questionsWithDownload

        });


    } catch (error) {

        console.error(
            "Search question error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to search questions"

        });

    }
};

export const downloadQuestion = async (req, res) => {
    try {

        const id = Number(req.params.id);

        const question = questions.find(
            question => question.id === id
        );

        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found"
            });
        }



const relativePath = question.file
    .replace(/^[/\\]+/, "")
    .replace(/[/\\]+$/, "");

const filePath = path.join(
    __dirname,
    "..",
    relativePath
);


return res.download(
    filePath,
    `${question.courseName}_${question.year}_${question.examType}.pdf`,
    (error) => {
        if (error) {
            console.error("Download error:", error);
        }
    }
);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Download failed"
        });
    }
};
