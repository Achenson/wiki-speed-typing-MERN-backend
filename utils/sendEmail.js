/* "use strict";
const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper
async function main() {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>', // sender address
    to: "bar@example.com, baz@example.com", // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>", // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

main().catch(console.error); */

// import nodemailer from "nodemailer";

const nodemailer = require("nodemailer");

module.exports = async function sendEmail(email, url) {

  // const nodemailerPass = process.env.NODEMAILER_PASS;
  const nodemailerAppPass = process.env.NODEMAILER_APP_PASS;


  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  const account = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    // uncomment for testing!
    /*     host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: account.user, // generated ethereal user
      pass: account.pass, // generated ethereal password
    },
    // to combat Error: self signed certificate in certificate chain
    tls: {
      rejectUnauthorized: false,
    },
 */

// worked before, not anymore 
    // service: "gmail",
    // auth: {
    //   user: "wikispeedtyping@gmail.com",
    //   pass: nodemailerPass,
    // },

      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'wikispeedtyping@gmail.com',
        pass: nodemailerAppPass,
      },
  });

  const mailOptions = {
    // uncomment for testing
    // from: '"Fred Foo 👻" <foo@example.com>', // sender address
    from: "wikispeedtyping@gmail.com",
    to: email, // list of receivers
    // UNCOMMENT FOR TESTING!!! to: "bar@example.com, baz@example.com", // list of receivers
    subject: "Wiki speed typing - password change", // Subject line
    text: "Follow the link to change password.", // plain text body
    html: `<a href="${url}">${url}</a>`, // html body
  };

  // send mail with defined transport object
  const info = await transporter.sendMail(mailOptions);

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
};

// to test 1st time -> import & run the function in server.js

