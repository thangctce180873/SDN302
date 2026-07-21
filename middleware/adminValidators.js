const { body, validationResult } = require('express-validator');

const movieCreateRules = [
  body('name').trim().isLength({min:2}).withMessage('Tên phim ít nhất 2 ký tự'),
  body('slug').trim().matches(/^[a-z0-9\-]+$/).withMessage('Slug chỉ chứa chữ thường, số và -'),
  body('year').optional().isInt({min:1888, max: new Date().getFullYear()+1}).withMessage('Năm không hợp lệ'),
  body('thumb').optional().isURL().withMessage('Thumbnail phải là URL'),
];

const userCreateRules = [
  body('name').trim().isLength({min:2}).withMessage('Tên không hợp lệ'),
  body('email').isEmail().withMessage('Email không hợp lệ'),
  body('password').notEmpty().isLength({min:6}).withMessage('Mật khẩu tối thiểu 6 ký tự'),
  body('role').isIn(['user','admin']).withMessage('Role không hợp lệ'),
];

const userUpdateRules = [
  body('name').optional().trim().isLength({min:2}).withMessage('Tên không hợp lệ'),
  body('email').optional().isEmail().withMessage('Email không hợp lệ'),
  body('password').optional({ values: 'falsy' }).isLength({min:6}).withMessage('Mật khẩu tối thiểu 6 ký tự'),
  body('role').optional().isIn(['user','admin']).withMessage('Role không hợp lệ'),
];

function handleValidation(req,res,next){
  const errors = validationResult(req);
  if(!errors.isEmpty()) return res.status(400).json({ success:false, errors: errors.array().map(e=>e.msg) });
  next();
}

const movieUpdateRules = [
  body('name').optional().trim().isLength({min:2}).withMessage('Tên phim ít nhất 2 ký tự'),
  body('slug').optional().trim().matches(/^[a-z0-9\-]+$/).withMessage('Slug chỉ chứa chữ thường, số và -'),
  body('year').optional().isInt({min:1888, max: new Date().getFullYear()+1}).withMessage('Năm không hợp lệ'),
  body('thumb').optional({ values: 'falsy' }).isURL().withMessage('Thumbnail phải là URL'),
  body('thumb_url').optional({ values: 'falsy' }).isURL().withMessage('thumb_url phải là URL'),
];

module.exports = { movieCreateRules, movieUpdateRules, userCreateRules, userUpdateRules, handleValidation };