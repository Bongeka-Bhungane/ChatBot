// import express from 'express';
// //import cors from 'cors';
// import dotenv from 'dotenv';
// import multer from 'multer';
// import { chatWithModel } from './controllers/chatController';
// //import { uploadSOP } from './controllers/adminController';

// // Type declaration for cors
// declare module 'cors' {
//   function cors(): any;
//   export = cors;
// }

// dotenv.config();
// const app = express();
// const upload = multer({ dest: 'src/uploads/' });

// app.use(cors());
// app.use(express.json());

// // Learner Endpoint
// app.post('/api/chat', chatWithModel);

// // Admin Endpoint (Document Ingestion)
// app.post('/api/admin/upload', upload.single('file'), uploadSOP);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 CodeTribe Backend running on port ${PORT}`));