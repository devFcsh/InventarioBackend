import multer from "multer";
import { extname } from "path";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_SIZE_BYTES,
  },
  fileFilter: (req, file, cb) => {
    const fileExtension = extname(file.originalname).toLowerCase();
    const isValidJpgFile =
      ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype) && fileExtension === ".jpg";

    if (!isValidJpgFile) {
      const error = new Error("Solo se permiten imagenes con extension .jpg.");
      error.statusCode = 400;
      return cb(error);
    }

    cb(null, true);
  },
});

function uploadImageMiddleware(req, res, next) {
  // Centraliza los errores de Multer para no depender del error handler global.
  upload.single("image")(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          error: "La imagen supera el tamano maximo permitido de 5 MB.",
        });
      }

      if (error.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({
          error: "Debes enviar el archivo en el campo 'image'.",
        });
      }
    }

    return res.status(error.statusCode || 400).json({
      error: error.message || "No se pudo procesar el archivo enviado.",
    });
  });
}

export default uploadImageMiddleware;
