const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  } else if (error.code === 11000 && error.keyPattern.name) {
    return response.status(400).json({ error: "name must be unique" });
  }

  next(error);
};

export default errorHandler;
