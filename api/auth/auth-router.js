// `checkUsernameFree`, `checkUsernameExists` ve `checkPasswordLength` gereklidir (require)
// `auth-middleware.js` deki middleware fonksiyonları. Bunlara burda ihtiyacınız var!
const authMd = require("./auth-middleware");
const express = require("express");
const router = express.Router();
const usersModel = require("../users/users-model");
const bcrypt = require("bcryptjs");

/**
  1 [POST] /api/auth/register { "username": "sue", "password": "1234" }

  response:
  status: 201
  {
    "user_id": 2,
    "username": "sue"
  }

  response username alınmış:
  status: 422
  {
    "message": "Username kullaniliyor"
  }

  response şifre 3 ya da daha az karakterli:
  status: 422
  {
    "message": "Şifre 3 karakterden fazla olmalı"
  }
 */
router.post(
  "/register",
  authMd.usernameBostami,
  authMd.usernameVarmi,
  authMd.sifreGecerlimi,
  async (req, res, next) => {
    try {
      const credentials = req.body;
      const hash = bcrypt.hashSync(credentials.password, 8);
      credentials.password = hash;
      const registeredUser = await usersModel.ekle(credentials);
      res.status(201).json(registeredUser);
    } catch (err) {
      next(err);
    }
  }
);
/**
  2 [POST] /api/auth/login { "username": "sue", "password": "1234" }

  response:
  status: 200
  {
    "message": "Hoşgeldin sue!"
  }

  response geçersiz kriter:
  status: 401
  {
    "message": "Geçersiz kriter!"
  }
 */
router.post(
  "/login",
  authMd.usernameVarmi,
  authMd.sifreGecerlimi,
  async (req, res, next) => {
    try {
      const { username, password } = req.body;
      const presentUser = await usersModel.goreBul({ username }).first();
      const isPasswordTrue = bcrypt.compareSync(password, presentUser.password);

      if (presentUser && isPasswordTrue) {
        req.session.user = presentUser;
        res.status(200).json({ message: `Hoş geldin ${username}!` });
      } else {
        res.status(401).json({ message: "Geçersiz kriter!" });
      }
    } catch (err) {
      next(err);
    }
  }
);
/**
  3 [GET] /api/auth/logout

  response giriş yapmış kullanıcılar için:
  status: 200
  {
    "message": "Çıkış yapildi"
  }

  response giriş yapmamış kullanıcılar için:
  status: 200
  {
    "message": "Oturum bulunamadı!"
  }
 */
router.get("/logout", (req, res, next) => {
  try {
    if (req.session.user) {
      req.session.destroy((err) => {
        if (err) {
          next({
            message: "Oturum kapanırken hata oluştu!",
          });
        } else {
          res.status(200).json({ message: "Çıkış yapildi" });
        }
      });
    } else {
      res.status(200).json({ message: "Oturun bulunamadı!" });
    }
  } catch (error) {
    next(err);
  }
});

// Diğer modüllerde kullanılabilmesi için routerı "exports" nesnesine eklemeyi unutmayın.
module.exports = router;
