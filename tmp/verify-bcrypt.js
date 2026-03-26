const bcrypt = require('bcryptjs');

async function verify() {
  const password = 'password123';
  const hash = await bcrypt.hash(password, 10);
  console.log('Password:', password);
  console.log('Hash:', hash);
  
  const isMatch = await bcrypt.compare(password, hash);
  console.log('Is Match:', isMatch);
  
  const isMatchWrong = await bcrypt.compare('wrong', hash);
  console.log('Is Match Wrong:', isMatchWrong);
}

verify();
