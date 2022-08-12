import express from "express";
const router = express.Router();

router.get("/connectNamespace/:namespace", (req, res, next) => {
    const { namespace } = req.params;
})

export default router;