import { Router } from "express";
import { agregarMantenimiento, obtenerActividadesEquipo, obtenerMantenimientos } from "../controllers/mantenimientoController.js";
const router = Router();

router.get("/:id", obtenerMantenimientos);
router.post("/", agregarMantenimiento);
router.get("/actividades/:id", obtenerActividadesEquipo);

export default router;
