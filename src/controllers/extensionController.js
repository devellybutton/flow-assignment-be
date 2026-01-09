const ExtensionModel = require("../models/extensionModel");
const Validator = require("../utils/validator");

class ExtensionController {
  // 모든 차단된 확장자 조회
  static async getAll(req, res) {
    try {
      const extensions = await ExtensionModel.findAll();

      const fixedExtensions = extensions
        .filter((e) => e.is_fixed)
        .map((e) => ({
          name: e.name,
          is_blocked: e.is_blocked,
        }));

      const customExtensions = extensions
        .filter((e) => !e.is_fixed)
        .map((e) => ({
          name: e.name,
          is_blocked: e.is_blocked,
        }));

      res.status(200).json({
        fixedExtensions,
        customExtensions,
        customCount: customExtensions.length,
      });
    } catch (err) {
      console.error("Get Main Page Error:", err);
      res.status(500).json({ msg: "Server Error" });
    }
  }

  // 고정 확장자 체크 상태 업데이트
  static async updateFixedExtension(req, res) {
    try {
      const { name, is_blocked } = req.body;

      // 입력 검증
      if (
        !Validator.isNonEmptyString(name) ||
        !Validator.isBoolean(is_blocked)
      ) {
        return res.status(400).json({ msg: "잘못된 요청입니다." });
      }

      await ExtensionModel.updateFixedCheck(name, is_blocked);
      res.sendStatus(200);
    } catch (err) {
      console.error("Update Fixed Extension Error:", err);
      res.status(500).json({ msg: "서버 오류" });
    }
  }

  // 커스텀 확장자 추가
  static async addCustomExtension(req, res) {
    try {
      // 1. 입력 검증
      const validation = Validator.validateExtensionName(req.body.name || "");
      if (!validation.valid) {
        return res.status(400).json({ msg: validation.msg });
      }

      const name = validation.name;

      // 2. 최대 개수 체크
      const count = await ExtensionModel.countCustom();
      if (count >= 200) {
        return res
          .status(400)
          .json({ msg: "최대 200개까지만 추가 가능합니다." });
      }

      // 3. 중복 체크
      const existing = await ExtensionModel.findByName(name);
      if (existing) {
        return res.status(409).json({
          msg: existing.is_fixed
            ? "고정 확장자는 추가할 수 없습니다."
            : "이미 등록된 확장자입니다.",
        });
      }

      // 4. 추가
      const extension = await ExtensionModel.createCustom(name);
      const newCount = count + 1;

      res.status(201).json({
        name: extension.name,
        customCount: newCount,
      });
    } catch (err) {
      console.error("Add Custom Extension Error:", err);
      res.status(500).json({ msg: "서버 오류" });
    }
  }

  // 커스텀 확장자 삭제
  static async deleteCustomExtension(req, res) {
    try {
      const name = req.params.name.toLowerCase().trim();

      const rowCount = await ExtensionModel.deleteCustom(name);

      if (rowCount === 0) {
        return res.status(404).json({ msg: "해당 확장자를 찾을 수 없습니다." });
      }

      const remainCount = await ExtensionModel.countCustom();

      res.status(200).json({
        msg: "삭제되었습니다.",
        customCount: remainCount,
      });
    } catch (err) {
      console.error("Delete Custom Extension Error:", err);
      res.status(500).json({ msg: "서버 오류" });
    }
  }
}

module.exports = ExtensionController;
