import jwt from 'jsonwebtoken';

const generateToken = (res, userId, role = 'trekker') => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, 
  };

  res.cookie(`token_${role}`, token, cookieOptions);

  return token;
};

export default generateToken;
