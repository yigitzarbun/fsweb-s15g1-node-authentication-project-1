// `sinirli` middleware'ını `auth-middleware.js` dan require edin. Buna ihtiyacınız olacak!
const express = require("express");
const router = express.Router();
const usersModel = require("./users-model");
const authMd = require("./../auth/auth-middleware");

router.get("/", authMd.sinirli, async (req, res, next) => {
  try {
    const users = await usersModel.bul();
    res.status(201).json(users);
  } catch (err) {
    next(err);
  }
});
/**
  [GET] /api/users

  Bu uç nokta SINIRLIDIR: sadece kullanıcı girişi yapmış kullanıcılar
  ulaşabilir.

  response:
  status: 200
  [
    {
      "user_id": 1,
      "username": "bob"
    },
    // etc
  ]

  response giriş yapılamadıysa:
  status: 401
  {
    "message": "Geçemezsiniz!"
  }
 */

// Diğer modüllerde kullanılabilmesi için routerı "exports" nesnesine eklemeyi unutmayın.

module.exports = router;
