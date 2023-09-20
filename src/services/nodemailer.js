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
    subject: "[EST Edu] Xác nhận email",
    html: `
            <h3>EST EDU 🌟</h3>
            <p>Mã xác nhận:<b> ${captcha}</b> </p>
        `,
  };

  try {
    await transporter.sendMail(message);
    return String(captcha);
  } catch (err) {
    return err;
  }
};
