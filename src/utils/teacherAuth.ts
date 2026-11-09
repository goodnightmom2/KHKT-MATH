/**
 * Bảo mật xác thực Chế độ Giáo viên (Teacher Mode Authentication)
 * Sử dụng băm mật mã SHA-256 (Web Crypto API) kết hợp hàm kiểm tra đa thức phi tuyến (Fallback).
 * Tuyệt đối không lưu trữ mật khẩu dạng văn bản thuần (plaintext) trong mã nguồn.
 */

// SHA-256 digest chuẩn của mật khẩu giáo viên (64 ký tự hex)
const TEACHER_PWD_SHA256_HEX =
  '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92';

// Mã băm đa thức dự phòng khi trình duyệt chạy trên HTTP LAN không có crypto.subtle
const EXPECTED_FALLBACK_SIGNATURE = '6:1099:21563:1055565';

function computeFallbackSignature(raw: string): string {
  let s1 = 0;
  let s2 = 0;
  let poly = 0;
  let pow7 = 1;

  for (let i = 0; i < raw.length; i++) {
    const code = raw.charCodeAt(i);
    s1 += (i + 1) * code;
    s2 += (i + 3) * (i + 3) * (code ^ 0x5a);
    poly += code * pow7;
    pow7 *= 7;
  }

  return `${raw.length}:${s1}:${s2}:${poly}`;
}

/**
 * Kiểm tra mật khẩu Giáo viên bằng thuật toán băm SHA-256 một chiều
 */
export async function verifyTeacherPassword(input: string): Promise<boolean> {
  const normalized = input.trim();
  if (!normalized) return false;

  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(normalized);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      return hashHex === TEACHER_PWD_SHA256_HEX;
    }
  } catch {
    // Fallback nếu môi trường không hỗ trợ Web Crypto API
  }

  return computeFallbackSignature(normalized) === EXPECTED_FALLBACK_SIGNATURE;
}
