import ProductController from '../controllers/products.mjs'
import { Router } from 'express'
import multer from 'multer'
import FormValidator from '../../../validators/formValidator.mjs'
import { checkSchema } from 'express-validator'
import { getPermissionsChecker } from '../../../middleware/auth.mjs'
import FilterService from '../controllers/filtersController.mjs'

const router = Router()
const permissionsChecker = getPermissionsChecker('products')
const storage = multer.diskStorage({
	destination: function (req, file, cd) {
		cd(null, 'uploads')
	},
	filename: function (req, file, cd) {
		cd(null, Date.now() + '-' + file.originalname)
	},
})
const upload = multer({ storage })

router.get('/', ProductController.allProducts)
router.get('/filters-data', FilterService.getFiltersData)
router.get('/create', 
	permissionsChecker('read'),
	ProductController.createForm)
router.post('/create', 
	permissionsChecker('create'),
	upload.single('imgSrc'),
	checkSchema(FormValidator.formSchema), 
	ProductController.createProduct
)
router.get('/:id', permissionsChecker('read'), ProductController.productDetails)
router.get(
	'/edit/:id',
	ProductController.editProductForm
)
router.post('/edit/:id',
	permissionsChecker('update'),
	upload.single('imgSrc'), 
	checkSchema(FormValidator.formSchema), 
	ProductController.updateProduct
)
router.post('/', 
	permissionsChecker('create'),
	ProductController.createProduct)
router.delete('/:id', 
	permissionsChecker('delete'),
	ProductController.deleteProduct
)
	
export default router