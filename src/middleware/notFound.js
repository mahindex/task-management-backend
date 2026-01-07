import AppError from '../utils/AppError.js';

const notFound = (req, res, next) => {
  next(new AppError(`Not Found - ${req.originalUrl}`, 404));
};

export default notFound;
