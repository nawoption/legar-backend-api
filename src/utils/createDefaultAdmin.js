const Admin = require("../models/Admin");

const createDefaultAdmin = async () => {
    const email = (process.env.ADMIN_EMAIL || "admin@legar.com").toLowerCase().trim();
    const existing = await Admin.findOne({ email });
    if (existing) return;

    await Admin.create({
        name: process.env.ADMIN_NAME || "Legar Admin",
        email,
        password: process.env.ADMIN_PASSWORD || "Admin@123456",
    });

    console.log(`Default admin created: ${email}`);
};

module.exports = createDefaultAdmin;
