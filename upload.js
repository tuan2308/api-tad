const puppeteer = require('puppeteer');
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');


const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));
app.use(cors());
app.post('/upload-image', upload.single('image'), async (req, res) => {
  const file = req.file;
  
  // Xử lý file ở đây (lưu vào thư mục, xử lý, ...)
  


  try {

    const browser = await puppeteer.launch({
        headless: false,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    const page = await browser.newPage();
    await page.goto('https://removal.ai/upload/');
  // Đợi 2 giây

   // Chọn tệp ảnh từ req.body.image (được gửi từ front end)
   const imageBase64 = req.body.image;

 // Giải mã imageBase64 thành dữ liệu nhị phân

 const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

 const imageBuffer = Buffer.from(base64Data, 'base64');

 const { v4: uuidv4 } = require('uuid');
 const fileName = `${uuidv4()}.jpg`;
 // Tạo đường dẫn đầy đủ tới thư mục và tên tệp tin

 const filePath = path.join("uploads/", fileName);
 // Lưu dữ liệu nhị phân vào tệp tin
 fs.writeFileSync(filePath, imageBuffer);

//    const imageBuffer = Buffer.from(imageBase64, 'base64');
//     const filePath = 'save/image.jpg'; // Đường dẫn đến tệp ảnh để lưu lại

await page.waitFor(1000);

    await page.waitForSelector('input[type=file]');
    const fileInput = await page.$('input[type=file]');
    await fileInput.uploadFile(filePath);

    // Đợi và lấy giá trị img.absolute.left-1\/2.max-h-full.w-auto.-translate-x-1\/2 img
    await page.waitForSelector('div#removed-image img');
    await page.waitFor(500);
    const imageElement = await page.$('div#removed-image img');
    const imageSrc = await imageElement.evaluate((img) => img.src);

 
    await browser.close();

    // Xử lý kết quả và trả về cho front end
    // Ví dụ: Gửi đường dẫn ảnh về cho front end
    res.send({ imageSrc });


    // xoá file ảnh
    deleteFile(filePath);

  } catch (error) {
    console.error('Đã xảy ra lỗi:', error);
    res.status(500).send('Đã xảy ra lỗi');
  }

  ////
//   res.json({ message: file });
});

app.listen(3000, () => {
  console.log('Máy chủ back end đang chạy trên cổng 3000');
});
