import bcrypt from "bcryptjs";

async function run() {
    const password = "123456"; // la contraseña que quieras usar
    const hash = await bcrypt.hash(password, 10);
    console.log("HASH:", hash);
}

run();