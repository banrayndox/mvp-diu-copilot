import { getModel } from "../config/llmModels.js";

export const router = async ( state ) => {
    if(state.agent && state.agent !=="auto"){
        return {
        ...state,
        agent: state.agent
    }
    } 
    const llm = await getModel("router");
    const prompt = 
    ` You are an agent router.

        Available agents:
        -chat
        -search
        -coding
        -pdf
        -ppt
        -vision
        -questionbank
        -coverpage
        -routine
        -mentor
        -lostfound

        Rules:
            chat:
                General conversation,
                explaination,
                learning,
                questions.

            search: 
                Current events, 
                latest informations,
                news,
                recent developments,
                internet lookup.
            
            coding:
                Generate code,
                debug code,
                build projects,
                architecture,
                API design.

            pdf:
                Questions about generate PDFs or document context.

            ppt:
                Questions about generate PPTs or PPT content.

            vision:
                Questions about generate images or image content.
            questionbank:
                Questions about finding / searching question pdf.
            coverpage:
                Questions about generating diu assignment / lab report cover page/pdf.
            routine:
                Questions about finding or searching schedule of self/teacher/section or any related to diu classroom routine.
            mentor:
                Questions about finding, searching, or looking up a mentor, student, teacher, or person by name or email (e.g. "Find Rakib", "Rakib Biswash কে খুঁজে দাও", "rakib@diu.edu.bd", "find mentor", "আমি mentor চাই").
            lostfound:
                Questions about reporting lost items, found items, lost and found matches, or lost property (e.g. "I lost my wallet", "Found a phone near library", "lost item", "found item", "my lost matches").

    return strictly only one word:
        chat
        search
        coding
        pdf
        ppt
        vision
        questionbank
        coverpage
        routine
        mentor
        lostfound

        user query: ${state.prompt}
    `
    const response = await llm.invoke(prompt)



    
    return {
        ...state,
        agent: response.content.trim().toLowerCase()
    }
};