import isTokenValid from '../../../middleware/isTokenValid.mjs'
import CartDBService from '../models/cart/CartDBService.mjs'
import ProductsDBService from '../models/product/productsDBService.mjs'

class CartController {
  // Метод для отримання всіх товарів
  static async getCartDetails(req, res) { 
    try {
      if (!req.user) {
        return res.status(403).json({ error: 'Access denied' })
      }
      const userId = req.user.id // Отримання id користувача
		const token = await isTokenValid(req)
		//якщо токен не валідний поверртаємо помилку
		if (!token){
			return res.status(401).json({ 
				error: 'Token is not valid', 
				message: 'Your session is expired, please log in again to continue' 
			})
		}
      const cartDetails = await CartDBService.getCartDetails(userId)
		console.log('cartDetails======>', cartDetails)

      res.status(200).json({
        data: cartDetails,
        user: req.user,
		  isTokenValid
      })
    } catch (error) {
      res.status(500).json({ error: 'Error fetching products' })
    }
  }
  // -------------
  static async addProduct(req, res) {
	
    if (!req.user) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const userId = req.user.id // Отримання id користувача

    try {
      const { productId } = req.body // Отримання id продукту
      // Перевірка чи існує продукт const
      const product = await ProductsDBService.getById(productId)
      if (!product) {
        return res.status(404).json({ message: 'Product not found' }) // Відправка помилки, якщо продукт не знайдено
      }

      // Оновлення корзини або додавання нового продукту
      const cart = await CartDBService.addProduct({
        userId,
        productId,
      })
		
      res.status(200).json({ message: 'Product added successfully' })
    } catch (err) {
      console.log(err)
      res.status(500).json({ errors: [{ msg: err.message }] })
    }
  }
  static async updateProductAmount(req, res) {
    if (!req.user) {
      return res.status(403).json({ error: 'Access denied' })
    }
    const userId = req.user.id // Отримання id користувача
    try {
      const { productId, amount } = req.body // Отримання id продукту та кількості з тіла запиту
      // Перевірка чи існує продукт const
      const product = await ProductsDBService.getById(productId)
      if (!product) {
        return res.status(404).json({ message: 'Product not found' }) // Відправка помилки, якщо продукт не знайдено
      }

      // Оновлення корзини або додавання нового продукту
      const cart = await CartDBService.updateProductAmount({
        userId,
        productId,
        amount,
      })

      res.status(200).json({ message: 'Product amount updated successfully' })
    } catch (err) {
      res.status(500).json({ errors: [{ msg: err.message }] })
    }
  }

  // Метод для видалення товару (доступний тільки для адміністратора)
  static async deleteProduct(req, res) {
    if (!req.user) {
      return res.status(403).json({ error: 'Access denied' })
    }
    const userId = req.user.id // Отримання id користувача

    try {
      const productId = req.params.id
      await CartDBService.deleteProduct({ userId, productId })
      res.status(200).json({ message: 'Product deleted' })
    } catch (error) {
      res.status(500).json({ error: 'Error deleting product' })
    }
  }
}

export default CartController