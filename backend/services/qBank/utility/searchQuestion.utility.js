import { questions } from "../data/questions.js";

export const searchQuestionsUtility = ({

    department,

    course,

    semester,

    year,

    examType

}) => {

    const result =
        questions.filter(
            question => {


                // --------------------------------------------
                // Department
                // --------------------------------------------

                if (
                    department &&
                    question.department
                        .toLowerCase() !==
                    department.toLowerCase()
                ) {

                    return false;

                }


                // --------------------------------------------
                // Course
                // --------------------------------------------

                if (
                    course &&
                    question.courseName
                        .toLowerCase() !==
                    course.toLowerCase()
                ) {

                    return false;

                }


                // --------------------------------------------
                // Semester
                // --------------------------------------------

                if (
                    semester &&
                    question.semester !==
                    Number(semester)
                ) {

                    return false;

                }


                // --------------------------------------------
                // Year
                // --------------------------------------------

                if (
                    year &&
                    question.year !==
                    Number(year)
                ) {

                    return false;

                }


                // --------------------------------------------
                // Exam Type
                // --------------------------------------------

                if (
                    examType &&
                    question.examType
                        .toLowerCase() !==
                    examType.toLowerCase()
                ) {

                    return false;

                }


                return true;

            }
        );


    return result;

}
