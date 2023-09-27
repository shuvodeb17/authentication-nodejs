const Users = require("../models/userModel");
const Otp = require("../models/otpModel");
const bcrypt = require("bcrypt");
const { TOKEN_KEY, TOKEN_EXPIRY, EMAIL_ADDRESS, EMAIL_PASS } = process.env;
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// Sign up
const signUp = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({
        status: "Error",
        message: "Invalid Input fields",
      });
    }

    if (!/^[a-zA-Z ]*$/.test(name)) {
      return res.status(400).json({
        status: "Error",
        message: "Invalid name entered",
      });
    }

    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      return res.status(400).json({
        status: "Error",
        message: "Invalid email entered",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        status: "Error",
        message: "Password is too short",
      });
    }

    // Check if the user already exists
    const existingUser = await Users.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      return res.status(400).json({
        status: "Error",
        message: "User already exists",
      });
    }

    // Hash password
    const hashPassword = bcrypt.hashSync(password, 10);

    // Create a new user
    const newUser = new Users({
      name,
      username,
      email,
      password: hashPassword,
    });

    await newUser.save();

    res.status(200).json({
      status: "Ok",
      users: newUser,
    });
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    res.status(500).json({
      status: "Error",
      message: "Internal server error",
    });
  }
};

//Sign in
const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      return res.status(400).json({
        message: "Input fields is empty",
      });
    }

    // check user
    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Invalid user",
      });
    }

    // hashed password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Password does not match" });
    }

    // create user token
    const token = await jwt.sign(
      { email: user.email, userId: user._id },
      TOKEN_KEY,
      {
        expiresIn: TOKEN_EXPIRY,
      }
    );
    return res.status(200).json({
      message: "Sign in successful",
      user: user,
      token,
    });
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

// Providing / limiting access to resources
// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token =
      req.body.token || req.query.token || req.headers["x-access-token"];
    // check for provided token
    if (!token) {
      return res
        .status(403)
        .json({ message: "An authentication token is required" });
    }

    // verify token
    const decodedToken = await jwt.verify(token, TOKEN_KEY);
    req.currentUser = decodedToken;

    //   proceed with request
    res.status(200).json({
      message: `You are in the private territory of ${req.currentUser.email}`,
    });
  } catch (error) {
    return res.status(401).json({ message: "Invalid token provided" });
  }
  return next();
};

// verify otp
const verifyOTP = async (req, res) => {
  try {
    let { email, otp } = req.body;
    if (email && otp) {
      // Match OTP record in the database
      const matchOTPRecord = await Otp.findOne({ email });
      if (!matchOTPRecord) {
        return res.status(401).json({
          message: "No OTP records found",
        });
      }

      // Checking for expired code
      const { expiresAt } = matchOTPRecord;
      if (expiresAt < Date.now()) {
        await Otp.deleteOne({ email });
        return res
          .status(401)
          .json({ message: "Code has expired. Request a new one" });
      }

      // Not expired value, verify value
      const hashedOtp = matchOTPRecord.otp;

      // Verify OTP
      const validOTP = await bcrypt.compare(otp, hashedOtp);
      return res.status(200).json({ valid: validOTP });
    } else {
      return res.status(400).json({
        message: "Provide values for Email and OTP",
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Number OTP generation and verification system
const generateOTP = async (req, res) => {
  try {
    const { name, email, subject, message, duration = 1 } = req.body;

    if (!(email && subject && message)) {
      return res
        .status(403)
        .json({ message: "Provide values for email, subject, and message" });
    }

    // Clear old records
    await Otp.deleteOne({ email });
    console.log({ email });

    // Generate OTP
    let otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    console.log(otp);

    let transporter = nodemailer.createTransport({
      // outlook
      // host: "smtp-mail.outlook.com",

      // ethereal
      host: "smtp.ethereal.email",
      port: 587, // Use the appropriate port for Outlook SMTP
      secure: false, // Use SSL/TLS, set to true if required
      auth: {
        user: EMAIL_ADDRESS, // Use your email address
        pass: EMAIL_PASS, // Use your email password
      },
    });

    // Save OTP record (assuming you have defined and imported the Otp model)
    const hashedOTP = bcrypt.hashSync(otp, 10);
    const newOTP = new Otp({
      email,
      otp: hashedOTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000 * +duration,
    });
    await newOTP.save();

    // Respond with a success message
    res.status(200).json({
      message: "OTP sent successfully",
      newOtp: newOTP,
    });

    // Send OTP email
    const mailOptions = {
      from: EMAIL_ADDRESS, // Use your email address as the sender
      to: email, // Use the recipient's email address
      subject,
      html: `<div>
     <section style="width: 780px; margin: auto; background: #F1F5FD;">
         <div style="background-color: #365CCE; display: flex; alignItems: center; justifyContent: center; flexDirection: column; padding: 20px;">
             <div>
                 <div></div>
                 <img style="width: 100px; border-radius: 100%; border: 1px solid #fff;" src="https://i.ibb.co/2hd5R60/Photo-Room-20230619-161249.png" alt="" />
                 <div></div>
             </div>
             <div>
                 <h1 style="font-size: 20px; color: #fff; margin-top: 10px;">THANKS FOR SIGNING UP <span style="color: #EA3263; font-weight: bold;">ROKTHO DEI</span></h1>

                 <h1 style="font-size: 30px; color: #fff; text-align: center; font-weight: bold;">Verify your E-mail Address</h1>
             </div>
         </div>
         <main style="padding: 30px;">
             <h2 style="margin-top: 5px;">Hello ${name}</h2>
             <p style="margin-top: 5px; margin-bottom: 10px;">
    Please use the following One Time Password (OTP) - <span style="font-size: 28px; margin-top: 10px; font-weight: bold;">${otp}</span>
</p>
             <p style="margin-top: 20px;">This passcode will only be valid for the next <span>${newOTP.expiresAt}</span>. If the passcode does not work, you can use this login verification link:</p>
             <p>Thank you, <br /> Roktho Dei Team</p>
         </main>
         <footer>
             <div style="background: #E3E6E9; display: flex; align-items: center; justify-items: center; flex-direction: column; text-align: center; padding: 20px;">
                 <div>
                     <h1>Get in touch</h1>
                     <a href="tel:+91-848-883-8308" alt="+91-848-883-8308">+91-848-883-8308</a>
                     <a href="mailto:sales@infynno.com" alt="sales@infynno.com">sales@infynno.com</a>
                 </div>
                 <div>
                     <a href="#_">
                         <FaBeer />
                     </a>
                     <a href="#_">
                         <FaBeer />
                     </a>
                     <a href="#_">
                         <FaBeer />
                     </a>
                 </div>
             </div>
             <div style="background: #365CCE; padding: 20px; text-align: center; font-weight: bold; color: #fff;">
                 <p>© All Rights Reserved Roktho Dei (Shuvo Deb).</p>
             </div>
         </footer>
     </section>
 </div>`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// email verify
const emailVerify = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!(email && otp)) {
      return res
        .status(400)
        .json({ message: "Empty OTP details are not allowed" });
    }

    // Ensure OTP request exists
    const matchedOTPRecord = await Otp.findOne({ email });

    if (!matchedOTPRecord) {
      return res.status(401).json({ message: "No OTP records found" });
    }

    const { expiresAt } = matchedOTPRecord;

    // Check for expired code
    if (expiresAt < Date.now()) {
      await Otp.deleteOne({ email });
      return res
        .status(401)
        .json({ message: "Code has expired. Request for a new code" });
    }

    // Not expired value, verify value
    const hashedOtp = matchedOTPRecord.otp;

    // Verify OTP
    const validOTP = await bcrypt.compare(otp, hashedOtp);

    if (!validOTP) {
      return res
        .status(401)
        .json({ message: "Invalid code passed. Check your inbox" });
    }

    if (matchedOTPRecord.verified === false) {
      return res.status(401).json({ message: "Email has not verified" });
    }

    // If OTP is valid, delete the OTP record
    await Otp.deleteOne({ email });

    // Return a success response
    return res
      .status(200)
      .json({ message: "OTP verified successfully", verified: true });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// password reset with OTP
const passwordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.json({ message: "Email is required" });
    }

    // existing user
    const existingUser = await Users.findOne({ email });
    if (!existingUser) {
      res.json({ message: "There no account for email address" });
    }

    if (!existingUser.verified) {
      res.json({
        message: "Email has not been verified yet. Check your inbox",
      });
    }
  } catch (error) {
    res.status(501).json({ message: "Internal server error" });
  }
};

module.exports = {
  signUp,
  signIn,
  verifyToken,
  verifyOTP,
  generateOTP,
  emailVerify,
};
