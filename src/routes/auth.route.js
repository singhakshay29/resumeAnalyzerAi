const express=require('express');
const authRoute = express.Router();
const authController=require('../controllers/auth.controller');
const authMiddleware=require('../middleware/auth.middleware')

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */
authRoute.post('/register',authController.registerUserController)

/**
 * @route POST /api/auth/login
 * @description Login a user and return a JWT token
 * @access Public
 */
authRoute.post('/login',authController.loginUserController)

/**
 * @route GET /api/auth/logout
 * @description Logout a user by blacklisting the JWT token
 * @access Public
 */

authRoute.get('/logout',authController.logoutUserController)

/** 
 * @route GET /api/auth/getuserInfo
 * @description Get user information for the authenticated user
 * @access Private
 */

authRoute.get('/getuserInfo',authMiddleware.authUser,authController.getUserInfoController)

module.exports=authRoute;