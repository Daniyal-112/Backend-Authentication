import bcrypt from "bcrypt";

const hashPassword = async () => {
  const myPassword = "Ahmed678";
  const hashedPassword = await bcrypt.hash(myPassword, 10);
  console.log(`Original Password is: ${myPassword}`);
  console.log(`Hashed Password is: ${hashedPassword}`);

  const enteredPassword = "Ahmed678";
  const isMatch = await bcrypt.compare(enteredPassword, hashedPassword);
  console.log(`Entered Password is: ${enteredPassword}`);
  isMatch ? console.log(`Password Match`) : console.log(`Password Not Match`);
};
hashPassword();
