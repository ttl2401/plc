import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { returnMessage, returnError } from '@/controllers/base.controller';
import { PORT, API_URL } from '@/config'; // Import PORT from config
import moment from 'moment'; // Import moment
import mongoose from 'mongoose';
import { ProductService } from '@/services/product.service';
import { UserActivityService } from '@/services/user-activity.service';
import { ActivityAction, ActivityResource } from '@/models/user-activity.model';
const productService = new ProductService();
const userActivityService = new UserActivityService();

// Define allowed targets and their corresponding directories
const allowedTargets = ['user', 'product', 'category']; // Add more targets as needed

// Set up storage engine
const storage = multer.diskStorage({
  destination: async (req: Request, file, cb) => { // Make destination function async
    const target = req.body.target as string;
    if (!target || !allowedTargets.includes(target)) {
      return cb(new Error('Invalid or missing upload target'), '');
    }

    const today = moment(); // Use moment to get the current date
    const dateString = today.format('YYYY-MM-DD'); // Format the date as YYYY-MM-DD

    const uploadPath = path.join(__dirname, '../../public', target, dateString);

    try {
      // Create directory asynchronously
      await fs.promises.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error: any) {
      cb(error, '');
    }
  },
  filename: (req: Request, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueId = uuidv4();
    const filename = `${uniqueId}${ext}`;
    cb(null, filename);
  },
});

// Check file type
const checkFileType = (file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|gif/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Images Only!'));
  }
};

// Init upload
export const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
}).single('image'); // 'image' is the field name for the file input

// Wrap multer upload in an async function
const uploadAsync = (req: Request, res: Response): Promise<void> => {
  return new Promise((resolve, reject) => {
    upload(req, res, (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
};

// Upload API function
export const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await uploadAsync(req, res);

    if (!req.file) {
      return res.status(400).json(returnError('No file uploaded'));
    }

    const file = req.file;
    
    // Construct the relative file path (from 'public' directory)
    // The path will be like target/YYYY-MM-DD/uuid.extension
    const relativeFilePath = path.relative(path.join(__dirname, '../../public'), file.path);

    // Construct the absolute URL
    const absoluteUrl = `${API_URL}/${relativeFilePath.replace(/\\/g, '/')}`;

    return res.status(200).json(returnMessage({
      filePath: relativeFilePath,
      fileUrl: absoluteUrl,
    }, 'File uploaded successfully'));
  } catch (error) {
    next(error);
  }
}; 





const storageProduct = multer.diskStorage({
  destination: async (req: Request, file, cb) => { // Make destination function async
    const target = 'product'

    const uploadPath = path.join(__dirname, '../../public', target);

    try {
      // Create directory asynchronously
      await fs.promises.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error: any) {
      cb(error, '');
    }
  },
  filename: (req: Request, file, cb) => {
    const filename = `product.txt`;
    cb(null, filename);
  },
});

// Check file type
const checkFileTypeUploadProduct = (file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allowed extensions
  const filetypes = /txt|csv|text\/plain/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Txt File Only!'));
  }
};

// Init upload
export const uploadProduct = multer({
  storage: storageProduct,
  limits: { fileSize: 1024 * 1024 * 20 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    checkFileTypeUploadProduct(file, cb);
  },
}).single('file'); // ' is the field name for the file input

// Wrap multer upload in an async function
const uploadProductAsync = (req: Request, res: Response): Promise<void> => {
  return new Promise((resolve, reject) => {
    uploadProduct(req, res, (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
};

// Upload API function
export const massUploadProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await uploadProductAsync(req, res);

    if (!req.file) {
      return res.status(400).json(returnError('No file uploaded'));
    }

    const file = req.file;
    const filePath = file.path;

    // Read the file content
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.split('\n').filter(line => line.trim() !== '');
    
    const arrayElements: any[] = [];

    // Process each line
    lines.forEach((line, index) => {
      const values = line.split(';').map(value => value.trim());
      
      if (values.length >= 4) {
        const element = {
          code: values[0] || '',           // value1 = code
          value2: values[1] || '',         // value2
          name: values[3] || '',           // value3 = name
          value4: values[4] || '',         // value4
          value5: values[5] || '',         // value5
          value6: values[6] || '',         // value6
          value7: values[7] || '',         // value7
          value8: values[8] || '',         // value8
          value9: values[9] || ''          // value9
        };
        
        arrayElements.push(element);
      }
    });
    const result:any = [];
    for (let element of arrayElements){
      let code = element.code?.toUpperCase();
      if(!code) continue;
      const check = await productService.getProductByCode(code);
      if(check) continue;
      const payload = { code, name: element.name || code}
      const product = await productService.createProduct(payload);
      // Log activity
      await userActivityService.logActivity(
        new mongoose.Types.ObjectId(String(req.user._id)),
        ActivityAction.CREATE,
        ActivityResource.PRODUCT,
        new mongoose.Types.ObjectId(String(product._id)),
        { after: product },
        req
      );
      result.push(code);

    }
    // Construct the relative file path (from 'public' directory)
    // The path will be like target/YYYY-MM-DD/uuid.extension
    const relativeFilePath = path.relative(path.join(__dirname, '../../public'), file.path);

    // Construct the absolute URL
    const absoluteUrl = `${API_URL}/${relativeFilePath.replace(/\\/g, '/')}`;

    return res.status(200).json(returnMessage({
      result: result
    }, 'File uploaded and processed successfully'));
  } catch (error) {
    next(error);
  }
}; 





