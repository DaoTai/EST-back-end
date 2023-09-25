import { createTransport } from "nodemailer";
import { env } from "~/utils/environment";
const transporter = createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: env.NODE_MAILER_USER,
    pass: env.NODE_MAILER_PASSWORD,
  },
});

export const verifyEmailByCaptcha = async (emailTo) => {
  const captcha = Math.floor(1000000 + Math.random() * 9000000);
  const message = {
    from: env.NODE_MAILER_USER,
    to: emailTo,
    subject: "[EST Edu] Confirm your email",
    html: `
            <h3>EST EDU 🌟</h3>
            <h4>Hi, this is captcha to confirm your email. Please don't leak it</h4>
            <p>Captcha:<b> ${captcha}</b> </p>
        `,
  };

  try {
    await transporter.sendMail(message);
    return String(captcha);
  } catch (err) {
    return err;
  }
};

export const sendNewPassword = async (emailTo) => {
  const password = Math.floor(10000000 + Math.random() * 9000000);
  const message = {
    from: env.NODE_MAILER_USER,
    to: emailTo,
    subject: "[EST Edu] Forgot password",
    html: `
            <h3>EST EDU 🌟</h3>
            <h4>Hi, this is your new password. Please don't leak it and change it sooner</h4>
            <p>New password:<b> ${password}</b> </p>
        `,
  };

  try {
    await transporter.sendMail(message);
    return String(password);
  } catch (err) {
    return err;
  }
};
