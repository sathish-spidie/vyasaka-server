import express from "express";
import User from "../models/User";
import { sendResetPasswordEmail } from "../utils/mailer";
import jwt from "jsonwebtoken";

const router = express.Router();
const app = express();

// login route
router.post("/", async (req, res) => {
  const { email, password } = req.body.credentials;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.isValidPassword(password))) {
      return res.status(200).json({ user: user.toAuthJSON() });
    } else {
      return res.status(400).json({
        errors: {
          global: "invalid login",
        },
      });
    }
  } catch (err) {
    console.log(err);
  }
});

router.post("/forgot_password_request", async (req, res) => {
  const email = req.body.email;
  try {
    const user = await User.findOne({ email });
    if (user) {
      sendResetPasswordEmail(user);
      return res.status(200).json({success : true });
    } else {
      return res.status(400).json({
        errors: {
          global: "invalid email",
        },
      });
    }
  } catch (err) {
    res.json({ err });
  }
});

router.post("/confirmation/:token", async (req, res) => {
  const token = req.params.token;
  try {
    const user = await User.findOneAndUpdate(
      { confirmationToken: token },
      { confirmationToken: "", confirmed: true },
      { new: true }
    );
    if (user) {
      return res.status(200).json({ user: user.toAuthJSON() });
    } else {
      return res.status(400).json({
        errors: {
          global: "Can't confirm",
        },
      });
    }
  } catch (err) {
    res.json({ err });
  }
});

// Token Validation --> Redirect --> resetPassword page
router.post("/validate_token/:token", async (req, res) => {
  const token = req.params.token;
  jwt.verify(token, process.env.JWTSECRET, (err) => {
    if (err) {
      return res.status(401).json({});
    } else {
      return res.json({
        user: {
          validateToken: token,
        },
      });
    }
  });
});

router.post("/reset_password", async (req, res) => {
  const { password, token } = req.body;
  // const {token} = req.params
  jwt.verify(token, process.env.JWTSECRET, (err, decoded) => {
    if (err) {
      res.status(401).json({ errors: { global: "Invalid Token" } });
    } else {
      User.findOne({ _id: decoded._id }).then((user) => {
        if (user) {
          user.setPassword(password);
          user.save().then(() => {
            res.status(200).json({});
          });
        } else {
          res.status(401).json({ errors: { global: "User not found" } });
        }
      });
    }
  });
});

export default router;
