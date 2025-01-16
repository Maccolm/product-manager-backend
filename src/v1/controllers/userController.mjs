import UsersDBService from '../models/user/UsersDBService.mjs'
import TypesDBService from '../models/type/TypesDBService.mjs'
import { validationResult } from 'express-validator'
import { prepareToken } from '../../../utils/jwtHelpers.mjs'

class UserController {
  static async usersList(req, res) {
    try {		
      const filters = {}
      for (const key in req.query) {
        if (req.query[key]) filters[key] = req.query[key]
      }

      const dataList = await UsersDBService.getList(filters, { password: 0 }, ['type'])
		
      res.json({
        users: dataList,
      })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }

  static async registerForm(req, res) {
	
    try {
      const id = req.params.id
		
      let user = null
      if (id) {
        //отримати об"єкт за id
        user = await UsersDBService.getById(id)
      }
      const types = await TypesDBService.getList()

      //відредерити сторінку з формою
      return res.json({
        errors: [],
        data: user,
        types,
      })
    } catch (err) {
     return res.status(500).json({ error: err.message })
    }
  }
  static async registerUser(req, res) {
    // Якщо валідація пройшла успішно, виконуємо логіку реєстрації
    const errors = validationResult(req)
    const data = req.body
	 console.log('datra====>',data)
	 
    const types = await TypesDBService.getList()
	
    if (!errors.isEmpty()) {
      if (req.params.id) data.id = req.params.id
      return res.status(400).json({
        errors: errors.array(),
        data,
        types,
        user: req.user,
      })
    }

    try {
      if (req.params.id) {
        // Оновлюємо дані про користувача в базі даних
        await UsersDBService.update(req.params.id, data)
		  
      } else {
        // Додаємо користувача в базу даних
        await UsersDBService.create(data)
      }

     return res.status(200).json({
		message: ` ${req.params.id ? 'User edited successfully' : 'User created successfully'}`
	  })
    } catch (err) {
      return res.status(500).json({
        errors: [{ msg: err.message }],
        data,
        types,
      })
    }
  }
  static async signup(req, res) {
	  const errors = validationResult(req)
	  
	  if (!errors.isEmpty()) {
		  return res.status(400).json({ errors: errors.array() });
		}
		try {
		const types = await TypesDBService.getList()
		const typeId = types.find(type => type.title === 'user')?._id
		const user = {...req.body, type: typeId}
		const existingUser = await UsersDBService.findOne({email: user.email})
		
		if(existingUser) {
			return res.status(409).json({error: 'Email already registered'})
		}
		await UsersDBService.create(user)

		const token = prepareToken(
			{
				id: user._id,
				username: user.username,
				role: user.type
			},
			req.headers
		);
		res.json({
			result: "Authorized",
			token,
		})
	} catch (error) {
		console.error(error)
		if ( error.code === 11000 ) {
			const duplicateField = Object.keys(error.keyValue)[0]
			const duplicateValue = error.keyValue[duplicateField]

			return res.status(409).json({ error: `"${duplicateField}" with value: "${duplicateValue}" already exist, please choose another "${duplicateField}"` })
		}
		return res.status(500).json({ 
			error: 'Internal server error',
			details: error.message,
		})
	}
  }
  static async getTypes(req, res) {
	try {
		const types = await TypesDBService.getList()
		return res.status(200).json({
			types,
		})
	}catch(err){
		return res.status(500).json({
			errors: [{ msg: err.message }],
			data,
			types,
			user: req.user,
		})
	}
  }
  static async deleteUser(req, res) {
    try {
      await UsersDBService.deleteById(req.params.id)
      res.json({ success: true })
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to delete user' })
    }
  }
}

export default UserController