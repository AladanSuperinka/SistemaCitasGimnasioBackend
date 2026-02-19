require("dotenv").config();
const bcrypt = require("bcryptjs");
const pool = require("./db");

async function run() {
  const email = "admin@gym.com";        // <-- tu admin
  const plainPassword = "Admin123";     // <-- el password actual en texto plano

  const hash = await bcrypt.hash(plainPassword, 10);

  await pool.query("UPDATE admins SET password = ? WHERE email = ?", [hash, email]);

  console.log("✅ Password actualizado a hash para:", email);
  process.exit(0);
}

run().catch((e) => {
  console.error("❌ Error:", e);
  process.exit(1);
});
