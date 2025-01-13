import express from 'express'
import usersTypesController from '../controllers/usersTypesController.mjs'
import { getPermissionsChecker } from '../../../middleware/auth.mjs'

const router = express.Router()
const permissionsChecker = getPermissionsChecker('usersTypes')

router.get('/:id', usersTypesController.getById)
router.get('/', permissionsChecker('read'),  usersTypesController.getList)

router.post(
  '/register/:id?',
	permissionsChecker('update'), 
  usersTypesController.register
)
router.delete('/:id', permissionsChecker('delete'), usersTypesController.delete)

export default router