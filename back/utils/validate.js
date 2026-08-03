const { validationResult } = require('express-validator');

// Tämä middleware tarkistaa onko virheitä — käytetään jokaisen reitin lopussa
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Palauta vain ensimmäinen virhe, kuten muukin koodi tekee
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};

// TODO:  const validateRegister = [
//   body("name").trim().notEmpty().withMessage("name is required"),
//   body("email").isEmail().withMessage("valid email required"),
//   body("username")
//     .trim()
//     .isLength({ min: 3, max: 30 })
//     .withMessage("username must be 3-30 characters"),
//   body("password").isLength({ min: 8 }).withMessage("password must have at least 8 characters"),
//   validate,
// ];
// const validatePassword = [
//   body('newPassword').isLength({ min: 8 }).withMessage('password must have at least 8 characters'),
//   validate,
// ];
// const validateUserInfo = [
//   body('name').trim().notEmpty().withMessage('name is required'),
//   body('email').isEmail().withMessage('valid email required'),
//   body('username')
//     .trim()
//     .isLength({ min: 3, max: 30 })
//     .withMessage('username must be 3-30 characters'),
//   validate,
// ];

// const validateIntro = [
//   body('intro').optional().isLength({ max: 500 }).withMessage('intro max 500 characters'),
//   validate,
// ];

// const validateWine = [
//   body('artist').trim().notEmpty().withMessage('artist is required'),
//   body('name').trim().notEmpty().withMessage('name is required'),
//   body('year').isInt({ min: 1000, max: 2100 }).withMessage('year must be a valid year'),
//   body('size').trim().notEmpty().withMessage('size is required'),
//   body('medium').trim().notEmpty().withMessage('medium is required'),
//   validate,
// ];

module.exports = {
  handleValidationErrors,
};
