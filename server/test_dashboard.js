require('dotenv').config();
const { getDashboardData } = require('./src/controllers/DashboardController');

const mockReq = { user: { id: 1 } };
const mockRes = {
    json: (data) => console.log("SUCCESS:", data),
    status: (code) => {
        console.log("STATUS:", code);
        return { json: (err) => console.error("ERROR JSON:", err) };
    }
};

async function test() {
    try {
        await getDashboardData(mockReq, mockRes);
    } catch (e) {
        console.error("CAUGHT:", e);
    }
    process.exit();
}

test();
