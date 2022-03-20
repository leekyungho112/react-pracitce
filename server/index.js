const express = require('express');
const app = express();
app.use(express.json());
const jwt = require('jsonwebtoken');
const users = [
  {
    id: '1',
    username: 'dominic',
    password: 'dom1234',
    isAdmin: true,
  },
  {
    id: '2',
    username: 'julia',
    password: 'julia1234',
    isAdmin: false,
  },
];

let refreshTokens = [];

app.post('/api/refresh', (req, res) => {
  //take the refresh token from the user
  const refreshToken = req.body.token;
  // send error if there is no token or it's invalid
  if (!refreshToken) return res.status(401).json('Yor are not authenticated!');
  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json('Refresh token is not valid!');
  }
  jwt.verify(refreshToken, 'myRefreshSecretKey', (err, user) => {
    err && console.log(err);

    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    refreshTokens.push(newRefreshToken);
    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  });
  // 토큰을 새로 만들거나 refresh 토큰을 유저에게 보낸다
});

const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, 'mySecretKey', {
    expiresIn: '1h',
  });
};
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, isAdmin: user.isAdmin },
    'myRefreshSecretKey',
    {
      expiresIn: '1h',
    }
  );
};

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => {
    return u.username === username && u.password === password;
  });
  if (user) {
    // generate an access token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    refreshTokens.push(refreshToken);
    res.json({
      username: user.username,
      isAdmin: user.isAdmin,
      accessToken,
      refreshToken,
    });
  } else {
    res.status(400).json('사용자 또는 비밀번호가 일치하지 않습니다.');
  }
});
const verify = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, 'mySecretKey', (err, user) => {
      if (err) {
        return res.status(403).json('Token is not Valid');
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json('인증되지 않은 사용자입니다.');
  }
};

app.delete('/api/users/:userId', verify, (req, res) => {
  if (req.user.id === req.params.userId || req.user.isAdmin) {
    res.status(200).json('삭제되었습니다.');
  } else {
    res.status(403).json('사용자를 삭제할 수 없습니다.');
  }
});

app.post('/api/logout', verify, (req, res) => {
  const refreshToken = req.body.token;
  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
  res.status(200).json('로그아웃 성공!!');
});
app.listen(3001, () => console.log('Backend Connection...!!!'));
