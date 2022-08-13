import express from "express";
const router = express.Router();

router.get("/connectNamespace/:namespace", (req, res, next) => {
    const { namespace } = req.params;
    console.log("namespace = ", namespace);
    res.json(namespace)
})

export default router;