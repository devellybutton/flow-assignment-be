class Validator {
  // 확장자 이름 검증
  static validateExtensionName(name) {
    const trimmed = name.toLowerCase().trim();

    // 길이 검증
    if (trimmed.length === 0 || trimmed.length > 20) {
      return { valid: false, msg: "1~20자 사이로 입력해주세요." };
    }

    // 특수문자 검증 (영문/숫자만 허용)
    if (!/^[a-z0-9]+$/.test(trimmed)) {
      return { valid: false, msg: "영문과 숫자만 입력 가능합니다." };
    }

    return { valid: true, name: trimmed };
  }

  // 불린 검증
  static isBoolean(value) {
    return typeof value === "boolean";
  }

  // 문자열 검증
  static isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
  }
}

module.exports = Validator;
