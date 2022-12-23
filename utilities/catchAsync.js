// this is used to wrap the asynchronous functions so we don't have to use "try and catch"
module.exports = func => {
  return (req, res, next) => {
    func(req, res, next).catch(next);
  }
};