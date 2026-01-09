const express = require("express");
const router = express.Router();
const ExtensionController = require("../controllers/extensionController");

router.get("/extensions", ExtensionController.getAll);

router.patch("/extensions/fixed", ExtensionController.updateFixedExtension);

router.post("/extensions/custom", ExtensionController.addCustomExtension);

router.delete(
  "/extensions/custom/:name",
  ExtensionController.deleteCustomExtension
);

module.exports = router;
