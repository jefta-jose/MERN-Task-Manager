const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const name = path.basename(file.originalname, extension);
    cb(null, `${timestamp}-${name}${extension}`);
  }
});

// Filter only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only .jpeg, .jpg and .png files are allowed'), false);
  }
};

// Final upload middleware
const upload = multer({ storage, fileFilter });

module.exports = upload;


//  Input file:
// - `file.originalname` = `"code.png"`

//  Step-by-step breakdown:

// 1. `Date.now()`  
//    gets the current timestamp eg: `1712925600000`

// 2. `path.extname(file.originalname)`  
//    Extracts the extension of the file:  
//    `extension = ".png"`

// 3. `path.basename(file.originalname, extension)`  
//    Extracts the name without extension:  
//    `name = "code"`

// 4. Filename construction  
//    The final filename becomes:  
//    ```js
//    `${timestamp}-${name}${extension}`
//    = "1712925600000-code.png"
//    ```

// The uploaded file will be saved as:
// 1712925600000-code.png