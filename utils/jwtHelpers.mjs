import jwt from 'jsonwebtoken'
import config  from '../config/default.mjs'

// Час дії токена
const expiresIn = '60m'

// Секретний ключ для токена (повинен бути збережений у .env файлі)
const tokenKey = config.tokenKey // Save in .env !!!

// Функція для парсингу Bearer токена та декодування користувача
export function parseBearer(bearer, headers) {
  let token
  // Перевіряємо, чи токен починається з 'Bearer '
  if (bearer.startsWith('Bearer ')) {
    token = bearer.slice(7) // Видаляємо 'Bearer ' з початку токена
  }
  try {
    // Декодуємо токен з використанням підготовленого секрету
    const decoded = jwt.verify(token, prepareSecret(headers))
    return decoded // Повертаємо декодовані дані
  } catch (err) {	
		throw err
  }
}

// Функція для створення JWT токена
export function prepareToken(data, headers) {
  // Підписуємо дані токена з використанням підготовленого секрету
  return jwt.sign(data, prepareSecret(headers), {
    expiresIn, // Вказуємо час дії токена
  })
}

// Функція для підготовки секретного ключа з додаванням заголовків
function prepareSecret(headers) {
  // Секретний ключ токена об'єднується з user-agent та accept-language заголовками
  return tokenKey + headers['user-agent'] + headers['accept-language']
}
