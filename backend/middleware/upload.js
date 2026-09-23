import multer from "multer";
import path from "path";

// Allowed MIME types and extensions
const ALLOWED_EXTENSIONS = [".pdf", ".txt", ".png", ".jpg", ".jpeg"];
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "text/plain",
  "image/png",
  "image/jpeg",
  "image/jpg",
];

// Configure memory storage for in-memory buffer access without disk residue
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  // Strict check for scan image endpoint
  if (file.fieldname === "image") {
    const validScanMimes = ["image/jpeg", "image/png", "image/jpg"];
    const validScanExts = [".jpg", ".jpeg", ".png"];

    if (validScanMimes.includes(mime) || validScanExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG and PNG images are supported."), false);
    }
    return;
  }

  if (ALLOWED_EXTENSIONS.includes(ext) || ALLOWED_MIME_TYPES.includes(mime)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Unsupported file type. Only PDF, TXT, PNG, JPG, and JPEG files are permitted."
      ),
      false
    );
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for uploads
  },
  fileFilter,
});

export default upload;
