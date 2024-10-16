const bcrypt = require('bcryptjs');

async function hashPassword() {
  const password = 'test12345'; // Replace this with your chosen password
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log('Hashed Password:', hashedPassword);
}

hashPassword();
