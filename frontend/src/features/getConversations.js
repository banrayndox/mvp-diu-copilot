import api from "../../utils/config";

export const DEFAULT_DEMO_CONVERSATIONS = [
    { _id: "demo_conv_routine", title: "CSE 221 Class Routine & Schedule", createdAt: new Date(Date.now() - 3600000).toISOString() },
    { _id: "demo_conv_coverpage", title: "DIU Cover Page (Canvas Artifact)", createdAt: new Date(Date.now() - 7200000).toISOString() },
    { _id: "demo_conv_mentor", title: "Faculty Mentor: Dr. Syed Akhter", createdAt: new Date(Date.now() - 10800000).toISOString() },
    { _id: "demo_conv_lostfound", title: "Lost & Found Case: Laptop Charger", createdAt: new Date(Date.now() - 14400000).toISOString() }
];

export const getConversations = async () => {
    try {
        const { data } = await api.get('/api/chat/get-conversations');
        if (Array.isArray(data) && data.length > 0) {
            return data;
        }
    } catch (error) {
        console.log(`Note: Backend conversations offline, using demo fallback`, error);
    }

    // If guest user or standalone demo, return rich pre-configured showcase conversations
    const isGuest = Boolean(localStorage.getItem("diu_guest_user"));
    if (isGuest) {
        return DEFAULT_DEMO_CONVERSATIONS;
    }
    return [];
};