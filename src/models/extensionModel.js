const pool = require("../config/database");

class ExtensionModel {
  // 모든 확장자 조회
  static async findAll() {
    const result = await pool.query(
      "SELECT * FROM extensions ORDER BY is_fixed DESC, created_at DESC"
    );
    return result.rows;
  }

  // 커스텀 확장자 개수 조회
  static async countCustom() {
    const result = await pool.query(
      "SELECT COUNT(*) FROM extensions WHERE is_fixed = false"
    );
    return parseInt(result.rows[0].count);
  }

  // 확장자 존재 여부 확인 (대소문자 구분 없음)
  static async findByName(name) {
    const result = await pool.query(
      "SELECT * FROM extensions WHERE LOWER(name) = $1",
      [name.toLowerCase()]
    );
    return result.rows[0] || null;
  }

  // 고정 확장자 체크 상태 업데이트
  static async updateFixedCheck(name, isChecked) {
    await pool.query(
      "UPDATE extensions SET is_blocked = $1 WHERE name = $2 AND is_fixed = true",
      [isChecked, name]
    );
  }

  // 커스텀 확장자 추가
  static async createCustom(name) {
    const result = await pool.query(
      "INSERT INTO extensions (name, is_fixed, is_blocked) VALUES ($1, false, true) RETURNING *",
      [name]
    );
    return result.rows[0];
  }

  // 커스텀 확장자 삭제
  static async deleteCustom(name) {
    const result = await pool.query(
      "DELETE FROM extensions WHERE LOWER(name) = $1 AND is_fixed = false",
      [name.toLowerCase()]
    );
    return result.rowCount;
  }
}

module.exports = ExtensionModel;
