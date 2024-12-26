import ProductsDBService from '../models/product/productsDBService.mjs'
import ProvidersDBService from '../models/provider/providersDBService.mjs'
import { validationResult } from 'express-validator'
import { ensureAdmin ,checkAdminWithJWTToken } from '../../../middleware/ensureAdmin.mjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class ProductController {
	static async allProducts(req, res) {
		try {
			const data = await ProductsDBService.getListWithQuery(req.query)
			const providers = await ProvidersDBService.getList()
			const isAdmin = await checkAdminWithJWTToken(req)
			console.log('isAdmin controller' , isAdmin);
			
			res.json({
				data,
				providers,
				isAdmin
			})
		} catch (error) {
			res.status(500).json({ error: error.message })
		}
	}
	static async productDetails(req, res) {
		try{
			const id = req.params.id
			const product = await ProductsDBService.getById(id, ['provider'])
			const isAdmin = await checkAdminWithJWTToken(req)
			res.json({
				product,
				isAdmin
			})
		} catch {
			res.status(500).json({ error: error.message })
		}
	}
	static async createForm(req, res) {
		try{
			const providers = await ProvidersDBService.getList()
			console.log('Providers:', providers);
			const imgSrc = '/uploads/upload-.jpg'
			res.json({ errors: [], product: null, providers, imgSrc })
		} catch (error) {
			res.status(500).json({ error: error.message })
		}
	}
	static async editProductForm(req, res) {
		try {
			const product = await ProductsDBService.getById(req.params.id)
			const providers = await ProvidersDBService.getList()
			const imgPath = path.join(__dirname, '../uploads', product.imgSrc || 'upload-.jpg')
			const imgSrc = fs.existsSync(imgPath) ? `/uploads/${product.imgSrc}` : '/uploads/upload-.jpg'
			console.log('imgSrc=======>',imgSrc)
			res.json({ errors: [], product, providers, imgSrc })
			
		} catch (error) {
			res.status(500).json({ error: error.message })
		}
	}
	static async createProduct(req, res) {
		const errors = validationResult(req)
		console.log('========errors');
		console.log(errors);
		const providers = await ProvidersDBService.getList()

		if(!errors.isEmpty()) {
			const data = req.body
			if(req.params.id) data.id = req.params.id
			return res.status(400).json({ 
				errors: errors.array(),
				product: data,
				providers 
			})
		}
		try {
			const productData = { imgSrc: req.file.filename, ...req.body, providers }
			console.log(productData);
			const isAdmin = await checkAdminWithJWTToken(req)
			if(isAdmin){
				await ProductsDBService.create(productData)
				return res.status(200).json({
					message: 'Product created successfully' 
				})
			} else {
				return res.status(400).json({
					message: 'Access Denied' 
				})
			}
		} catch (error) {
			return res.status(500).json({
				errors: [{ msg: error }]
			 })
		}
	}
	static async updateProduct(req, res) {
		console.log('------updateProduct')

		const errors = validationResult(req)
		console.log('========errors');
		console.log(errors);
		const providers = await ProvidersDBService.getList()

		if(!errors.isEmpty()) {
			const data = req.body
			if(req.params.id) data.id = req.params.id
			return res.status(400).json({ 
				errors: errors.array(),
				product: data,
				providers
			})
		}
		console.log(req.body)

		try {
			const existingProduct = await ProductsDBService.getById(req.params.id)

			if (!existingProduct) {
				return res.status(404).json({
					errors: [{ msg: 'Product not found' }],
					product: req.body,
					providers,
				});
			}
			const { currentImgSrc } = req.body
			let imgSrc = currentImgSrc || existingProduct.imgSrc
			console.log('old img path =======>', imgSrc)
			
			if (req.file) {
				const oldImgPath = path.join(__dirname, '../../../uploads', existingProduct.imgSrc)
				if(fs.existsSync(oldImgPath)) {
					console.log('deleting old img', oldImgPath);
					await ProductController.deleteImg(imgSrc)
				}
				imgSrc = req.file.filename
			}
			const updatedProductData = req.file ? { ...req.body, imgSrc: req.file.filename, providers} : {...req.body, imgSrc, providers}
			await ProductsDBService.update(req.params.id, updatedProductData)
			return res.status(200).json({
				message: 'Product updated successfully' 
			})
		} catch (error) {
			return res.status(500).json({
				errors: [{ msg: error.message }],
				product: req.body,
				providers
			 });
		}
	}
	static async deleteProduct(req, res) {
		try {
			const productId = req.params.id
			const product = await ProductsDBService.getById(productId)
			if(!product) 
				return res.status(404).json({ success: false, message: 'Product not found' })
			
			await ProductsDBService.deleteById(productId)
			await ProductController.deleteImg(product.imgSrc)
			res.json({ success: true }) 
		} catch (error) {
			res.status(500).json({ success: false, message: 'Failed to delete product' })
		}
	}
	static async deleteImg(imgSrc) {
		const imgPath = path.join(__dirname, '../../../uploads', imgSrc)
		console.log('Generated image path:', imgPath)
		try{
			if (fs.existsSync(imgPath)) {
				fs.unlink(imgPath, (err) => {
					if (err) {
						console.error('Error deleting image:', err)
					} else {
						console.log('Image deleted successfully')
					}
				})
			} else {
				console.log('Image file not found')
			}
		} catch (err) {
			console.error('Error deleting image:', err);
		}
	}
}
export default ProductController