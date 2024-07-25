require("dotenv").config();
const path = require("path");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY,
    },
  })
);

function formatPrice(price) {
  let priceString = String(price);
  let formattedPrice = [];
  let count = 0;
  for (let i = priceString.length - 1; i >= 0; i--) {
    formattedPrice.unshift(priceString[i]);
    count++;
    if (count % 3 === 0 && i !== 0) {
      formattedPrice.unshift(".");
    }
  }
  return formattedPrice.join("") + " VND";
}

module.exports = (data) => {
  const attachments = [];
  let html = `<html>
        <body style="background-color:#111; font-size:16px; color:#fff; padding:48px">
        <h1 style="margin-bottom: 35px; color:#fff;">Xin chào ${data.name}</h1>
        <p style="color:#fff;">Phone: ${data.phone}</p>
        <p style="color:#fff;">Address: ${data.address}</p>
        <table style="border-collapse: collapse; width:100%; color:#fff; ">
        <tr>
        <th style="border:1px solid #fff;  padding: 12px; ">Tên sản phẩm</th>
        <th style="border:1px solid #fff;  padding: 12px; min-width:80px; max-width:120px ;">Hình ảnh</th>
        <th style="border:1px solid #fff;  padding: 12px; ">Giá</th>
        <th style="border:1px solid #fff;  padding: 12px; ">Số lượng</th>
        <th style="border:1px solid #fff;  padding: 12px; ">Thành tiền</th>
        </tr>`;

  data.items.forEach((ele) => {
    attachments.push({
      path: path.join(__dirname, "..", ele.product.images[0]),
      cid: ele.product.images[0],
    });
    html += `<tr>
      <td style="border:1px solid #fff;  padding: 12px; text-align: center;">${
        ele.product.name
      }</td>
      <td style="min-width:80px; max-width:120px ; border:1px solid #fff;  padding: 12px;"><img src="cid:${
        ele.product.images[0]
      }" alt="${ele.product.name}" style="display:block; width:100%; "></td>
      <td style="border:1px solid #fff;  padding: 12px; text-align: center;">${formatPrice(
        ele.product.price
      )}</td>
      <td style="border:1px solid #fff;  padding: 12px; text-align: center;">${
        ele.qty
      }</td>
      <td style="border:1px solid #fff;  padding: 12px; text-align: center;">${formatPrice(
        ele.product.price * ele.qty
      )}</td>
    </tr>`;
  });
  html += `</table>
        <h2 style="text-align: start; color:#fff;">Tổng Thanh Toán:</h2>
        <h2 style="text-align: start; color:#fff;">${formatPrice(
          data.total
        )}</h2>
        <h2 style="text-align: start; color:#fff;">Cảm ơn bạn!</h2>
        </body>
        </html>`;

  transporter.sendMail(
    {
      from: { name: "Shop NodeJS", address: "tinnpfx21727@funix.edu.vn" },
      to: data.email,
      subject: "Order Successed!",
      html: html,
      attachments: attachments,
    },
    function (err) {
      if (err) {
        console.log(err);
        console.log("Send email failed.");
      }
    }
  );
};
