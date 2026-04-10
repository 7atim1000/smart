import multer from 'multer';

const storage = multer.diskStorage({
    filename: function(req: Express.Request, file: Express.Multer.File, callback: (error: Error | null, filename: string) => void) {
        callback(null, file.originalname);
    }
});

const upload = multer({ storage });

export default upload;