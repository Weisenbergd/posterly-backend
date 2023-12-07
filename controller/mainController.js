const getMain = (req, res, next) => {
  res.send("main route");
};

const getAbout = (req, res, next) => {
  res.send("about route");
};

export { getMain, getAbout };
